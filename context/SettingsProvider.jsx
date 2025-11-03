"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";

const defaultSettings = {
  isSidebarOpen: false,
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: () => {},
  hydrated: false,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  // ✅ Load settings synchronously *before paint* to prevent flicker
  useLayoutEffect(() => {
    try {
      const raw = localStorage.getItem("settings");
      if (raw) {
        const saved = JSON.parse(raw);
        setSettings((prev) => ({ ...prev, ...saved }));
      }
    } catch (err) {
      console.warn("Error reading settings from localStorage:", err);
    } finally {
      // Mark hydration complete after a tick (ensures no flicker)
      requestAnimationFrame(() => setHydrated(true));
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem("settings", JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, hydrated }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
