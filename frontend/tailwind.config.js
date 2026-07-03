/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050816",
        primary: "#6C63FF",
        secondary: "#00D4FF",
        accent: "#7B61FF",
        success: "#00FF9C",
        warning: "#FFD166",
        danger: "#FF4D6D",
        muted: "#B3B8C5",
      },
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        18: "72px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108, 99, 255, 0.6)",
        "glow-lg": "0 8px 30px rgba(108, 99, 255, 0.45)",
        "glow-success": "0 0 12px rgba(0, 255, 156, 0.5)",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #6C63FF, #7B61FF)",
        "grad-accent": "linear-gradient(135deg, #00D4FF, #6C63FF 60%, #7B61FF)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.08)" },
          "66%": { transform: "translate(-30px,25px) scale(0.95)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        drift: "drift 22s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.8s infinite",
      },
    },
  },
  plugins: [],
};
