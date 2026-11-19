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
      },
      borderRadius: { xl2: "1rem" },
      boxShadow: { card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 1px rgba(16,24,40,0.04)" },
    },
  },
  plugins: [],
};

export default config;
