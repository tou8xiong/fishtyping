"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "auto";
type FontFamily = "jetbrains" | "crimson" | "garamond";
type FontSize = "small" | "medium" | "large";

interface Settings {
  theme: Theme;
  fontFamily: FontFamily;
  fontSize: FontSize;
  defaultLanguage: "english" | "lao";
  defaultDifficulty: "beginner" | "advanced" | "expert";
  defaultLength: "short" | "medium" | "long";
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
  theme: "auto",
  fontFamily: "jetbrains",
  fontSize: "medium",
  defaultLanguage: "english",
  defaultDifficulty: "expert",
  defaultLength: "medium",
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
      const parsed = JSON.parse(saved);
      // Migrate old "dark"/"system" values to "auto"
      if (parsed.theme === "dark" || parsed.theme === "system") parsed.theme = "auto";
      setSettings({ ...defaultSettings, ...parsed });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (settings.theme === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
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
