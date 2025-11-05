import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "300px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1300px",
        "2xl": "1440px",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",

        "pattern-light-desktop":
          "url('/assets/images/pattern-background-desktop-light.svg')",
        "pattern-dark-desktop":
          "url('/assets/images/pattern-background-desktop-dark.svg')",
        "pattern-light-mobile":
          "url('/assets/images/pattern-background-mobile-light.svg')",
        "pattern-dark-mobile":
          "url('/assets/images/pattern-background-mobile-dark.svg')",
      },
      colors: {
        "light-blue": "#E1E1E1", // #5964E0, nappulat
        purple: "#14502E", // #C882A0, painike aktiivinen
        "dark-blue": "#002350", // #002350, taustaväri
        slate: "#5964E0", // #F4F6F8, vaihtoehtojen taustaväri
        "gray-navy": "#002350",
        green: "#14502E",
        white: "#E1E1E1",
        red: "#F1334B",
        "yotaivas": "#002350",
        "metsa": "#14502E",
        "perameri": "#4542D9",
        "hilla": "#F06721",
        "puolukka": "#F1334B",
        "kanerva": "#C882A0",
        "jakala": "#D4D1C6",
        "harmaa": "#E1E1E1",
        "musta": "#000000",
        "valkoinen": "#FFFFFF"
      },
    },
  },
  plugins: [],
};
export default config;
