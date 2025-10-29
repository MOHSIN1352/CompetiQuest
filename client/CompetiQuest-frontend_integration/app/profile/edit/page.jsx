// app/profile/edit/page.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiUpload, FiX } from "react-icons/fi";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import Image from "next/image";
import { useTheme } from "../../context/ThemeContext";

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const router = useRouter();
  const { darkMode } = useTheme(); // get darkMode

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    console.log("Updating profile:", formData);
    if (profileFile) console.log("Profile image file:", profileFile);
    router.push("/profile"); // Navigate back
  };

  const handleDeactivate = () => {
    // Replace with a custom modal in a real app
    if (
      window.confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone."
      )
    ) {
      console.log("Deactivating account");
      router.push("/");
    }
  };

  const shadowStyle = darkMode
    ? "0px 0px 15px 0px var(--accent), 0px 0px 30px 0px var(--accent-glow)"
    : "0px 5px 15px rgba(0, 0, 0, 0.1), 0px 5px 30px var(--accent-glow)";

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 flex items-center justify-center bg-background`}
    >
      <div
        style={{ boxShadow: shadowStyle }}
        className={`relative max-w-2xl w-full rounded-2xl p-6 sm:p-8 border ${
          darkMode
            ? "bg-secondary/30 border-border/50"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-foreground" : "text-gray-800"
            }`}
          >
            Account Settings
          </h1>
        </div>
        <button
          onClick={() => router.back()}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            darkMode
              ? "bg-secondary/50 hover:bg-secondary/80"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <FiX size={20} />
        </button>
        <hr className={`mb-6 border border-border`} />

        {/* Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 flex items-center justify-center ${
                darkMode ? "border-border/50" : "border-gray-300"
              }`}
            >
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src="/profile_photo.png"
                  alt="Profile thumbnail"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div>
              <p className="font-semibold mb-2">Profile Photo</p>
              <label
                htmlFor="profileUpload"
                className="flex items-center gap-2 px-4 py-2 border-2 border-accent text-accent font-bold rounded-lg transition-colors duration-300 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
              >
                <FiUpload size={14} />
                Upload
              </label>
              <input
                type="file"
                accept="image/*"
                id="profileUpload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProfileFile(file);
                  setProfilePreview(file ? URL.createObjectURL(file) : null);
                }}
              />
            </div>
          </div>

          <hr className={`my-6 border border-border`} />

          {/* Username & Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className={`flex items-center gap-2 mb-1 text-sm ${
                  darkMode ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                <FaUser /> Username
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-secondary/50 text-foreground border-border/50"
                    : "bg-gray-50 text-gray-800 border-gray-300"
                }`}
              />
            </div>

            <div>
              <label
                className={`flex items-center gap-2 mb-1 text-sm ${
                  darkMode ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                <FaEnvelope /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-secondary/50 text-foreground border-border/50"
                    : "bg-gray-50 text-gray-800 border-gray-300"
                }`}
              />
            </div>

            <div>
              <label
                className={`flex items-center gap-2 mb-1 text-sm ${
                  darkMode ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                <FaLock /> New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current"
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-secondary/50 text-foreground border-border/50"
                    : "bg-gray-50 text-gray-800 border-gray-300"
                }`}
              />
            </div>

            <div>
              <label
                className={`flex items-center gap-2 mb-1 text-sm ${
                  darkMode ? "text-muted-foreground" : "text-gray-600"
                }`}
              >
                <FaLock /> Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current"
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-secondary/50 text-foreground border-border/50"
                    : "bg-gray-50 text-gray-800 border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors duration-300"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-300 border-2 border-accent text-accent hover:bg-accent ${
                darkMode ? "hover:text-black" : "hover:text-white"
              }`}
            >
              Cancel
            </button>
          </div>

          {/* Deactivate */}
          <hr className={`my-6 border border-border`} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h3
                className={`font-medium ${
                  darkMode ? "text-foreground" : "text-gray-800"
                }`}
              >
                Deactivate your account
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-muted-foreground" : "text-gray-500"
                }`}
              >
                This will permanently delete your account and data.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeactivate}
              className="px-4 py-2 bg-destructive/80 text-white font-semibold rounded-lg hover:bg-destructive transition-colors duration-300"
            >
              Deactivate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
