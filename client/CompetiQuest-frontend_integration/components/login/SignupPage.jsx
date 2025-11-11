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
      className="w-full h-full m-auto flex flex-col items-center justify-center sm:p-12 py-5 px-5 backdrop-blur-xl"
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
