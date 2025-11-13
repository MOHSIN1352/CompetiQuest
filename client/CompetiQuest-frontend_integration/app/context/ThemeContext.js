"use client";

import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = (event) => {
    const isDark = document.documentElement.classList.contains("dark");
    
    if (!document.startViewTransition) {
      setDarkMode(!isDark);
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", !isDark ? "dark" : "light");
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setDarkMode(!isDark);
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", !isDark ? "dark" : "light");
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: !isDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 800,
          easing: "ease-in-out",
          pseudoElement: !isDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        }
      );
    });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);