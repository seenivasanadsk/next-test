"use client";

import { createContext, useContext, useState } from "react";

const defaultSettings = {
  isSidebarOpen: false, // default state
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: (key, value) => {},
});

export function SettingsProvider({ children }) {
  // ---- Load from localStorage synchronously ----
  let savedSettings = {};
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("settings");
      if (raw) {
        savedSettings = JSON.parse(raw, (_, value) => {
          if (value === "true") return true;
          if (value === "false") return false;
          return value;
        });
      }
    } catch (err) {
      console.warn("Error reading settings from localStorage:", err);
    }
  }

  // ---- Initialize directly with saved values ----
  const [settings, setSettings] = useState({
    ...defaultSettings,
    ...savedSettings,
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem("settings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
