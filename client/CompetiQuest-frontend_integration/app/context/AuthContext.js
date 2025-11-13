"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

// Small helpers
const normalizeRole = (roleLike) => {
  const role = roleLike ?? "";
  if (typeof role === "string") return role.toLowerCase();
  if (Array.isArray(role) && role.length) return String(role[0]).toLowerCase();
  return "";
};

const DEFAULT_CONTEXT = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  hasRole: () => false,
};

const AuthContext = createContext(DEFAULT_CONTEXT);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Validate active session (httpOnly JWT cookie) on mount
  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/validate`,
          { withCredentials: true }
        );
        if (!cancelled && res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // Redirect admins to /admin automatically
  useEffect(() => {
    if (!user) return;
    const role = normalizeRole(user.role || user.roles || user.roleName);
    if ((role === "admin" || role === "administrator") && !pathname?.startsWith("/admin")) {
      router.push("/admin");
    }
  }, [user, pathname, router]);

  const login = async ({ username, password }) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      const returned = res?.data?.user ? res.data.user : res?.data;
      setUser(returned || null);
      toast.success("Logged in successfully");

      const role = normalizeRole(returned?.role || returned?.roles || returned?.roleName);
      if (role === "admin") router.push("/admin");
      else router.push("/");

      return returned;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) toast.error("Invalid credentials. Please try again.");
      else if (status === 404) toast.error("User not found. Please sign up.");
      else toast.error(error?.response?.data?.message || "Login failed.");
      throw error;
    }
  };

  const register = async ({ username, email, password }) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );
      toast.success("Registration successful!");
      const returned = res?.data?.user ? res.data.user : res?.data;
      if (returned?._id) setUser(returned);
      return returned;
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) toast.error("User already exists. Please log in.");
      else if (status === 400) toast.error("Please fill in all fields correctly.");
      else toast.error(error?.response?.data?.message || "Registration failed.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const hasRole = (targetRole) => {
    if (!user || !targetRole) return false;
    return normalizeRole(user.role || user.roles || user.roleName) === normalizeRole(targetRole);
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user?._id || user?.id),
    setUser,
    login,
    register,
    logout,
    hasRole,
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
