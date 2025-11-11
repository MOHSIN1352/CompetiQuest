// ...existing code...
"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/app/context/AuthContext";

const LoginPage = ({ visible, handleFlip }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  // ✅ Form validation
  const validate = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle login
  const handleLogin = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      console.log("Resposne: ", response);
      if (response.status === 200) {
        toast.success(" Logged in successfully!");
        // Normalize user object: backend might return user as response.data or response.data.user
        const returned =
          response.data && response.data.user
            ? response.data.user
            : response.data;
        setUser(returned); // Set the user data in context

        // Determine role and redirect
        const role =
          (returned &&
            (returned.role || returned.roles || returned.roleName)) ||
          "";
        const normalizedRole =
          typeof role === "string"
            ? role.toLowerCase()
            : Array.isArray(role) && role.length
            ? String(role[0]).toLowerCase()
            : "";

        if (normalizedRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Invalid credentials. Please try again.");
        } else if (error.response.status === 404) {
          toast.error("User not found. Please sign up.");
        } else {
          toast.error(error.response.data.message || "Something went wrong.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center m-auto sm:p-12 p-5 bg-muted/10 backdrop-blur-xl"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

      {/* Username */}
      <div className="relative w-full mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className={`w-full bg-secondary/40 border ${
            errors.username ? "border-red-500" : "border-border"
          } rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300`}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      {/* Password */}
      <div className="relative w-full mb-6">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className={`w-full bg-secondary/40 border ${
            errors.password ? "border-red-500" : "border-border"
          } rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/4 transform text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </button>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        onClick={handleLogin}
        className={`w-full cursor-pointer py-3 mb-2 rounded-xl font-semibold text-accent-foreground transition-colors duration-300 ${
          loading
            ? "bg-accent/50 text-muted-foreground cursor-not-allowed"
            : "bg-accent hover:bg-accent/50 hover:text-accent"
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

export default LoginPage;
