"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const themes = ["light", "dark", "system"];
const ThemeContext = createContext();

// --- helper functions ---
const getSystemTheme = () => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

// Get initial theme synchronously (avoids hydration mismatch)
const getInitialTheme = () => {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem("theme");
    return themes.includes(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage immediately (same as themeInitializerScript)
  const [theme, setThemeState] = useState(getInitialTheme);

  const appliedTheme = theme === "system" ? getSystemTheme() : theme;

  // Apply theme to DOM *after* hydration or when user toggles
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(appliedTheme);
    localStorage.setItem("theme", theme);
  }, [theme, appliedTheme]);

  // theme setter with validation
  const setTheme = (newTheme) => {
    if (themes.includes(newTheme)) {
      setThemeState(newTheme);
    } else {
      console.error(`Invalid theme: ${newTheme}`);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        appliedTheme,
        setTheme,
        themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
