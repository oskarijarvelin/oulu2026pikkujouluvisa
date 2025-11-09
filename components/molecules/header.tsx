"use client";
import SwitchTheme from "../atoms/switch-theme";
import { useThemeStore } from "@/store/theme-store";
import { useQuestionStore } from "@/store/quiz-store";
import { backgroundColors, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { MotionHeader } from "../animated/motion-header";
import { QrCode, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";



const Header = () => {
  const selectedQuizz = useQuestionStore((state) => state.selectedQuizz);
  const { darkMode } = useThemeStore();
  const [isLocal, setIsLocal] = useState(false);
  useEffect(() => {
    // Show admin link only in local development (localhost / 127.0.0.1) or when NODE_ENV=development
    const isDevEnv = process.env.NODE_ENV === "development";
    const isHostLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    setIsLocal(isDevEnv || isHostLocal);
  }, []);
  // use colors from quiz data (data.json / firebase) with sensible fallbacks
  const iconBgColor =
    selectedQuizz?.options?.iconBgColor ?? backgroundColors[selectedQuizz?.title ?? ""] ?? "#000";
  const iconColor = selectedQuizz?.options?.iconColor ?? "#fff";
  
  return (
    <MotionHeader
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex justify-between w-full items-center relative z-10"
    >
      {selectedQuizz ? (
        <div className="flex gap-x-4 items-center sm:px-6 sm:py-4">
          {" "}
          <div
              className="w-10 h-10 flex items-center justify-center rounded-lg text-lg font-bold select-none"
              style={{ backgroundColor: iconBgColor, color: iconColor }}
              aria-hidden
            >
              {selectedQuizz.title?.charAt(0).toUpperCase() || "?"}
          </div>
          <p className="text-dark-blue dark:text-white font-bold xs:text-lg sm:text-xl xl:text-3xl">
            {selectedQuizz.title}
          </p>
        </div>
      ) : (
        <div className="flex gap-x-4 items-center sm:px-6 sm:py-4">
          <Link href="/qr">
            <QrCode color={darkMode ? "#FFF" : "#666"} />
          </Link>
          {isLocal && (
            <Link href="/admin">
              <span className="sr-only">Admin</span>
              <Settings2 color={darkMode ? "#FFF" : "#666"} />
            </Link>
          )}
        </div>
      )}
      <SwitchTheme />
    </MotionHeader>
  );
};

export default Header;