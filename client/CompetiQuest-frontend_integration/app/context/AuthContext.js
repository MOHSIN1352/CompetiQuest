// ...existing code...
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/validate`,
          {
            withCredentials: true, // send cookies with request
          }
        );
        // console.log(res.data);
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.log("User not logged in or session expired");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // redirect to /admin when the authenticated user is an admin
  useEffect(() => {
    if (!user) return;

    const role = (user && (user.role || user.roles || user.roleName)) || "";

    const normalizedRole =
      typeof role === "string"
        ? role.toLowerCase()
        : Array.isArray(role) && role.length
        ? String(role[0]).toLowerCase()
        : "";

    if (
      (normalizedRole === "admin" || normalizedRole === "administrator") &&
      !pathname?.startsWith("/admin")
    ) {
      router.push("/admin");
    }
  }, [user, pathname, router]);

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

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
// ...existing code...
