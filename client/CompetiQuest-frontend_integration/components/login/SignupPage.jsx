import { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const SignupPage = ({ visible, handleClick, handleFlip }) => {
  const [showPassword, setShowPassword] = useState(false);

  // 👇 Store user data in state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // 👇 Handle input change dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    try {
      if (!formData.username || !formData.email || !formData.password) {
        toast.error("Please fill in all fields.");
        return;
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        formData
      );

      // ✅ If we reach here, it means request was successful (status < 400)
      if (response.status === 201) {
        console.log("✅ Registration successful:", response.data);
        toast.success("Registration successful!");
      } else {
        console.log("⚠️ Unexpected response:", response.status);
        toast.error("Unexpected response from server.");
      }
    } catch (error) {
      // ✅ Handle errors thrown by axios
      if (error.response) {
        console.log("❌ Error response:", error.response);

        if (error.response.status === 409) {
          toast.error("User already exists. Please log in.");
        } else if (error.response.status === 400) {
          toast.error("Please fill in all fields correctly.");
        } else {
          toast.error(error.response.data.message || "Something went wrong.");
        }
      } else if (error.request) {
        console.error("⚠️ No response from server:", error.request);
        toast.error("No response from server. Try again later.");
      } else {
        console.error("⚠️ Error setting up request:", error.message);
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center sm:p-12 py-5 px-5 backdrop-blur-xl"
      style={{
        opacity: visible ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <h2 className="text-3xl font-bold mb-4 -mt-2 text-center">SignUp</h2>

      {/* Username */}
      <div className="relative w-full mb-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full bg-secondary/40 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
        />
      </div>

      {/* Email */}
      <div className="relative w-full mb-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-secondary/40 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
        />
      </div>

      {/* Password */}
      <div className="relative w-full mb-6">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          required
          minLength={8}
          value={formData.password}
          onChange={handleChange}
          className="w-full bg-secondary/40 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
        >
          {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
        </button>
      </div>

      <button
        type="submit"
        onClick={handleRegister}
        className="w-full cursor-pointer py-3 mb-1 rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent/50 hover:text-accent transition-colors duration-300"
      >
        Signup
      </button>

      <div className="flex items-center w-full my-2">
        <hr className="flex-grow border-zinc-700" />
        <span className="mx-4 text-zinc-500">OR</span>
        <hr className="flex-grow border-zinc-700" />
      </div>

      <button className="cursor-pointer w-full py-1 sm:py-3 flex items-center justify-center sm:gap-2 rounded-xl font-semibold bg-secondary/50 border hover:bg-secondary transition-colors duration-300">
        {/* Google Icon */}
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
        <span className="ml-4 text-sm">SignUp with Google</span>
      </button>

      <div>
        <p
          className="text-sm text-accent text-center cursor-pointer mt-2 sm:hidden"
          onClick={handleFlip}
        >
          Don't have an account? Signup
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
