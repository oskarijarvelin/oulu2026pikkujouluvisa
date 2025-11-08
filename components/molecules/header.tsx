"use client";
import SwitchTheme from "../atoms/switch-theme";
import { useThemeStore } from "@/store/theme-store";
import { useQuestionStore } from "@/store/quiz-store";
import { backgroundColors, cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { MotionHeader } from "../animated/motion-header";
import { QrCode } from "lucide-react";



const Header = () => {
  const selectedQuizz = useQuestionStore((state) => state.selectedQuizz);
  const { darkMode } = useThemeStore();
  
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
            className="xs:p-1 p-2 rounded-lg"
            style={{ backgroundColor: backgroundColors[selectedQuizz.title] }}
          >
            <Image
              src={selectedQuizz.icon}
              alt="Icon"
              width={30}
              height={30}
              className="xs:size-5 xl:size-10"
            />
          </div>
          <p className="text-dark-blue dark:text-white font-bold xs:text-lg sm:text-xl xl:text-3xl">
            {selectedQuizz.title}
          </p>
        </div>
      ) : (
        <Link href="/qr">
          <QrCode color={darkMode ? "#FFF" : "#666"} />
        </Link>
      )}
      <SwitchTheme />
    </MotionHeader>
  );
};

export default Header;