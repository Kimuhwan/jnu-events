import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#008231",
          light: "#00a83e",
          dark: "#006626",
        }
      }
    }
  },
  plugins: []
} satisfies Config;
