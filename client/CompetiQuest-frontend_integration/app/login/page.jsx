// page.js
"use client";
import Squares from "@/components/home/Squares";
import { useState } from "react";
import LoginPage from "@/components/login/LoginPage";
import SignupPage from "@/components/login/SignupPage";

export default function Login() {
  const [themeColors, setThemeColors] = useState({
    border: "oklch(0.15 0 0 / 0.1)",
    hover: "#222",
  });

  const [isSignUp, setIsSignUp] = useState(false);
  const [loginflip, setLoginflip] = useState(true); // Default to true for LoginPage

  const handleFlip = () => {
    setLoginflip(!loginflip);
  };
  const handleSignUpClick = () => {
    setIsSignUp(true);
    setLoginflip(false); // Show SignupPage in mobile
  };
  const handleLoginClick = () => {
    setIsSignUp(false);
    setLoginflip(true); // Show LoginPage in mobile
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden p-4">
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-100">
        <Squares
          speed={0.3}
          squareSize={75}
          direction="diagonal"
          borderColor={themeColors.border || "#999"}
          hoverFillColor={themeColors.hover || "#222"}
        />
      </div>

      <div className="absolute inset-0 -z-10" style={{ perspective: "1000px" }}>
        <div
          className="absolute bottom-0 left-0 right-0 h-[150%] origin-bottom"
          style={{
            transform: "rotateX(55deg)",
            maskImage: "linear-gradient(to top, black 30%, transparent 80%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 30%, transparent 80%)",
          }}
        >
          <Squares
            speed={0.4}
            squareSize={50}
            direction="diagonal"
            borderColor={themeColors.border}
            hoverFillColor={themeColors.hover}
          />
        </div>
      </div>

      <div className="relative w-[100vw] sm:max-w-3xl h-[70%] sm:h-[70vh] bg-muted/40 rounded-2xl overflow-hidden shadow-md p-3 shadow-accent max-w-[100%]">
        {/* Desktop View */}
        <div className="sm:flex sm:flex-row sm:justify-evenly hidden">
          <LoginPage
            visible={isSignUp}
            handleClick={handleSignUpClick}
            handleFlip={handleFlip}
          />
          <SignupPage
            visible={isSignUp}
            handleClick={handleLoginClick}
            handleFlip={handleFlip}
          />
        </div>

        {/* Mobile View */}
        <div className="sm:hidden block">
          {loginflip ? (
            <LoginPage
              handleFlip={handleFlip}
              visible={!isSignUp}
              handleClick={handleSignUpClick}
            />
          ) : (
            <SignupPage
              handleFlip={handleFlip}
              visible={isSignUp}
              handleClick={handleLoginClick}
            />
          )}
        </div>

        {/* Sliding Panel for Desktop */}
        <div
          className="absolute top-0 left-0 w-1/2 h-full hidden sm:flex flex-col items-center justify-center transition-transform duration-700 ease-in-out z-10 bg-accent dark:bg-ring"
          style={{
            transform: isSignUp ? "translateX(100%)" : "translateX(0%)",
          }}
        >
          <h2 className="text-4xl dark:text-secondary-foreground text-muted font-bold">
            {!isSignUp ? "Welcome Back" : "New Here"}
          </h2>
          <p className="text-md dark:text-secondary-foreground/70 text-muted/50 mt-2 text-center px-6 tracking-tight">
            {!isSignUp
              ? "Already have an account? Log in to continue."
              : "Don't have an account? Sign up to get started."}
          </p>
          <button
            className="px-6 py-2 rounded-r-full mt-4 rounded-l-full font-semibold border-2 text-secondary dark:border-secondary-foreground dark:text-secondary-foreground border-secondary hover:bg-secondary hover:text-accent dark:hover:bg-secondary-foreground dark:hover:text-accent transition"
            onClick={isSignUp ? handleLoginClick : handleSignUpClick}
          >
            {!isSignUp ? "Login" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
