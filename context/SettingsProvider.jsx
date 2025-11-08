"use client";

import { createContext, useContext, useState } from "react";
import { setUserSettingsAction } from "@/actions/userAction";

const defaultSettings = { isSidebarOpen: true };

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSetting: async () => {},
});

export function SettingsProvider({ initialSettings, children }) {
  const initSettings =
    Object.keys(initialSettings).length === 0
      ? defaultSettings
      : initialSettings;
  const [settings, setSettings] = useState(initSettings);

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await setUserSettingsAction(newSettings); // persist on server
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
