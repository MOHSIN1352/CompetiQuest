"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

const LoginPage = ({ visible, handleFlip }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
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
        { withCredentials: true } // optional if your API uses cookies
      );

      if (response.status === 200) {
        toast.success("🎉 Logged in successfully!");
        console.log("User:", response.data);

        router.push("/");
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
      className="w-full h-full flex flex-col items-center justify-center sm:p-12 p-5 bg-muted/10 backdrop-blur-xl"
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

      {/* OR separator */}
      <div className="flex items-center w-full my-2">
        <hr className="flex-grow border-zinc-700" />
        <span className="mx-4 text-zinc-500">OR</span>
        <hr className="flex-grow border-zinc-700" />
      </div>

      {/* Google Login */}
      <button className="cursor-pointer w-full py-3 flex items-center justify-center gap-2 rounded-xl font-semibold bg-secondary/50 border hover:bg-secondary transition-colors duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          viewBox="0 0 48 48"
        >
          <defs>
            <path
              id="a"
              d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
            />
          </defs>
          <clipPath id="b">
            <use xlinkHref="#a" overflow="visible" />
          </clipPath>
          <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
          <path
            clipPath="url(#b)"
            fill="#EA4335"
            d="M0 11l17 13 7-6.1L48 14V0H0z"
          />
          <path
            clipPath="url(#b)"
            fill="#34A853"
            d="M0 37l30-23 7.9 1L48 0v48H0z"
          />
          <path
            clipPath="url(#b)"
            fill="#4285F4"
            d="M48 48L17 24l-4-3 35-10z"
          />
        </svg>
        <span className="ml-4">Log in with Google</span>
      </button>

      <p
        className="text-sm text-accent cursor-pointer mt-2"
        onClick={handleFlip}
      >
        Don't have an account? Signup
      </p>
    </div>
  );
};

export default LoginPage;
