import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        ink: {
          900: "#111827",
          700: "#374151",
          500: "#6b7280",
          300: "#d1d5db",
          100: "#f3f4f6",
        },
        // Site-shell palette (header, menu, footer, buttons)
        q: {
          blue: "#4a72c4",
          "blue-dark": "#3d62b0",
          ink: "#25282d",
          body: "#4b5058",
          mute: "#9aa0a8",
          line: "#d4d8dd",
          field: "#eff0f2",
          panel: "#e6e9ec",
          panel2: "#dfe3e7",
          night: "#212429",
          yellow: "#f8de4b",
          mint: "#6fe8c8",
          violet: "#7c3aed",
        },
      },
      fontFamily: {
        sans: [
          "Outfit",
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: { xl2: "1rem" },
      boxShadow: { card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 1px rgba(16,24,40,0.04)" },
    },
  },
  plugins: [],
};

export default config;
