/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "open-sauce": ['"Open Sauce One"', "sans-serif"],
        zentry: ['"Open Sauce One"', "sans-serif"],
        general: ['"Open Sauce One"', "sans-serif"],
        "circular-web": ['"Open Sauce One"', "sans-serif"],
        "robert-medium": ['"Open Sauce One"', "sans-serif"],
        "robert-regular": ['"Open Sauce One"', "sans-serif"],
      },
      colors: {
        // Startathon dark palette
        blue: {
          50: "#F0F0EC",   // near-white for body text
          75: "#e8e8e4",
          100: "#F5F5F0",  // headings
          200: "#010101",
          300: "#C8FF00",  // lime accent (replaces teal)
        },
        violet: {
          50: "#C8FF00",   // buttons — lime
          300: "#a8d800",  // darker lime variant
        },
        yellow: {
          100: "#8e983f",
          300: "#C8FF00",  // align with lime
        },
        lime: {
          DEFAULT: "#C8FF00",
          dark: "#a8d800",
        },
      },
    },
  },
  plugins: [],
};