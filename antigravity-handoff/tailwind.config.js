/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: "#090909",
          charcoal: "#171717",
          darkCard: "#121212",
          surface: "#1C1C1C",
          surfaceLight: "#262626",
          gold: "#C5A15A",
          goldLight: "#E2C58A",
          goldDark: "#9E7E3C",
          goldMuted: "rgba(197, 161, 90, 0.15)",
          ivory: "#F6F2E9",
          muted: "#A7A7A7",
          border: "rgba(197, 161, 90, 0.22)",
          borderSubtle: "rgba(255, 255, 255, 0.08)"
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(197, 161, 90, 0.18)',
        'gold-glow-lg': '0 0 45px rgba(197, 161, 90, 0.28)',
        'luxury-card': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(197, 161, 90, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
