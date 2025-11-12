"use client";
import { useState, useEffect } from "react";
import Squares from "./Squares";
import { FiZap, FiGrid  } from "react-icons/fi";
import Link from "next/link";

// Helper function to get Oklch parts for manipulation
const getOklchColor = (variable) => {
  if (typeof window === "undefined") return "oklch(0.9 0.02 240)"; // fallback
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

const AuroraBackground = () => (
  <div className="absolute inset-0 -z-20 overflow-hidden">
    <div
      className="absolute h-[50rem] w-[50rem] animate-[aurora_20s_linear_infinite] rounded-full"
      style={{
        background: "radial-gradient(circle, oklch(from var(--accent) l c h / 0.2) 0%, transparent 60%)",
        top: "50%", left: "50%", "--start-x": "-50%", "--start-y": "-80%", "--end-x": "-30%", "--end-y": "-60%",
      }}
    />
    <div
      className="absolute h-[55rem] w-[55rem] animate-[aurora_25s_linear_infinite] rounded-full"
      style={{
        background: "radial-gradient(circle, oklch(0.6 0.15 260 / 0.15) 0%, transparent 60%)",
        top: "50%", left: "50%", "--start-x": "50%", "--start-y": "20%", "--end-x": "30%", "--end-y": "-10%", animationDelay: "6s",
      }}
    />
  </div>
);

export default function HeroSection() {
  const [themeColors, setThemeColors] = useState({ border: "oklch(0.15 0 0 / 0.1)", hover: "#222" });

  useEffect(() => {
    const updateColors = () => {
      const fgColor = getOklchColor("--color-foreground");
      const hoverColor = fgColor;
      const borderColor = fgColor.replace(')', ' / 0.1)');
      setThemeColors({ border: borderColor, hover: hoverColor });
    };

    updateColors();
    const observer = new MutationObserver(() => updateColors());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden p-4">
      
      <div className="absolute inset-0 z-0">
        <Squares
          speed={0.3}
          squareSize={75}
          direction="diagonal"
          borderColor={themeColors.border || "#999"}
          hoverFillColor={themeColors.hover || "#222"}
        />
      </div>

      <AuroraBackground />

      <div className="absolute inset-0 -z-10" style={{ perspective: '1000px' }}>
        <div
          className="absolute bottom-0 left-0 right-0 h-[150%] origin-bottom"
          style={{
            transform: 'rotateX(55deg)',
            maskImage: 'linear-gradient(to top, black 30%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 80%)',
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
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="border border-accent/30 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            # AI-Powered Question Bank
        </div>

        <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground !leading-tight"
            style={{textShadow: '0px 2px 20px oklch(from var(--background) l c h / 0.6)'}}
        >
          Dominate Your<br />
          <span className="text-accent">Competitive Exams</span><br />
          with AI Precision
        </h1>
        <p 
            className="mt-6 text-lg text-muted-foreground max-w-2xl"
            style={{textShadow: '0px 2px 10px oklch(from var(--background) l c h / 0.8)'}}
        >
          Our complete platform offers AI-driven practice, personalized feedback, and proven techniques to master any competitive exam.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-6">
          <a
            href="#"
            className="flex items-center gap-2 px-7 py-3 bg-accent text-accent-foreground font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <FiZap />
            <span>Start Practicing Now</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-7 py-3 border-2 border-accent text-accent font-bold rounded-xl transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
          >
            <FiGrid />
            <span>Browse Topics</span>
          </a>
        </div>
      </div>

      {/*  BLENDING MASK */}
      <div className="absolute bottom-0 left-0 right-0 h-35 bg-gradient-to-b from-background/0 to-background z-10 pointer-events-none" />
    </main>
  );
}