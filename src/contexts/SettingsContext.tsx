"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type FontFamily = "jetbrains" | "crimson" | "garamond";
type FontSize = "small" | "medium" | "large";

interface Settings {
  theme: Theme;
  fontFamily: FontFamily;
  fontSize: FontSize;
  defaultLanguage: "english" | "lao";
  defaultDifficulty: "beginner" | "advanced" | "expert";
  soundEffects: boolean;
  showLiveWpm: boolean;
  smoothCaret: boolean;
  achievementAlerts: boolean;
  personalBestAlerts: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: "dark",
  fontFamily: "jetbrains",
  fontSize: "medium",
  defaultLanguage: "english",
  defaultDifficulty: "expert",
  soundEffects: false,
  showLiveWpm: true,
  smoothCaret: true,
  achievementAlerts: true,
  personalBestAlerts: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("fishtyping-settings");
    if (saved) {
      setSettings({ ...defaultSettings, ...JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (settings.theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    } else {
      root.classList.toggle("dark", settings.theme === "dark");
      root.classList.toggle("light", settings.theme === "light");
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("fishtyping-settings", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
