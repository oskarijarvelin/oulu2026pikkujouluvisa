"use client";
import { useThemeStore } from "@/store/theme-store";
import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * SwitchTheme component - Toggle between light and dark mode
 * Provides accessible theme switching with visual indicators
 */
const SwitchTheme = () => {
  const { toggleDarkMode, darkMode } = useThemeStore();

  useEffect(() => {
    const switchElement = document.getElementById("switch") as HTMLInputElement;
    if (switchElement) {
      switchElement.checked = darkMode;
    }
  }, [darkMode]);

  return (
    <div className="flex items-center gap-x-2 md:pr-6 lg:p-0 xl:gap-x-4" role="group" aria-label="Teeman valinta">
      <Sun color={darkMode ? "#FFF" : "#666"} aria-hidden="true" />
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          onChange={toggleDarkMode}
          id="switch"
          type="checkbox"
          className="peer sr-only"
          role="switch"
          aria-checked={darkMode}
          aria-label={darkMode ? "Vaihda vaalean teeman" : "Vaihda tumman teeman"}
        />
        <div className="peer h-6 w-11 rounded-full border-none bg-yotaivas dark:bg-perameri after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-valkoinen dark:after:bg-jakala after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-puolukka"></div>
      </label>
      <Moon color={darkMode ? "#FFF" : "#666"} aria-hidden="true" />
    </div>
  );
};

export default SwitchTheme;
