import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0E79B2",
          dark: "#0c6a9a",
        },
        secondary: "#f8f9fa",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        'text-primary': "#1a1a1a",
        'text-secondary': "#666",
        border: "#e5e5e5",
        background: "#f5f7fa",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif"
        ],
      },
      boxShadow: {
        DEFAULT: "0 2px 8px rgba(0,0,0,0.1)",
        lg: "0 4px 16px rgba(0,0,0,0.15)",
      },
      borderRadius: {
        DEFAULT: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
