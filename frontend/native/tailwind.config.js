/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: "#131313",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        primary: "#c6c6c7",
        "on-primary": "#2f3131",
        secondary: "#EF3340",
        "secondary-container": "#bf0124",
        tertiary: "#abc7ff",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c4c7c7",
        outline: "#444748",
      },
      fontFamily: {
        inter: ["Inter"],
      },
    },
  },
  plugins: [],
};
