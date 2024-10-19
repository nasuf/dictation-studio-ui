/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        "color-empty": "#ebedf0",
        "color-scale-1": "#9be9a8",
        "color-scale-2": "#40c463",
        "color-scale-3": "#30a14e",
        "color-scale-4": "#216e39",
      },
    },
  },
  plugins: [],
};
