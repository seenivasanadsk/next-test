// context/ThemeProvider.js
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the theme types
const themes = ["light", "dark", "system"];

// Create the context
const ThemeContext = createContext();

const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      return themes.includes(storedTheme) ? storedTheme : "system";
    }
    return "system";
  });

  // State to track if the component has mounted
  const [mounted, setMounted] = useState(false);

  const appliedTheme = theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(...themes.filter((t) => t !== "system"));
    root.classList.add(appliedTheme);

    localStorage.setItem("theme", theme);

    setMounted(true);
  }, [theme, appliedTheme]);

  const setTheme = (newTheme) => {
    if (themes.includes(newTheme)) {
      setThemeState(newTheme);
    } else {
      console.error(`Invalid theme: ${newTheme}`);
    }
  };

  const contextValue = {
    theme,
    appliedTheme,
    setTheme,
    themes,
    mounted,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
