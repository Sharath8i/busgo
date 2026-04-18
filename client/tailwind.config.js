/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Kinetic Editorial (Material 3) ── */
        "primary": "#0037b0",
        "primary-dark": "#001f6e",
        "primary-container": "#1d4ed8",
        "primary-light": "#cad3ff",
        "secondary": "#4d5b94",
        "tertiary": "#753000",
        "tertiary-container": "#9a4200",
        "surface": "#faf8ff",
        "on-surface": "#1a1b23",
        "on-surface-variant": "#434655",
        "background": "#faf8ff",
        "on-primary": "#ffffff",
        "surface-container": "#ededf9",
        "surface-container-low": "#f3f2fe",
        "surface-container-lowest": "#ffffff",
        "surface-container-highest": "#e2e1ed",
        "outline": "#747686",
        "outline-variant": "#c4c5d7",
        /* ── Bridge Tokens (Legacy Compat) ── */
        "surface-alt": "#f3f2fe",
        "surface-border": "#e2e1ed",
        "text": {
          "main": "#1a1b23",
          "muted": "#434655",
        },
        "success": "#10b981",
        "danger": "#ef4444",
        "error": "#ba1a1a",
        "warning": "#f59e0b",
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        headline: ["Manrope", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "soft": "0 2px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)",
        "editorial": "0 20px 40px rgba(26,27,35,0.06)",
      },
    },
  },
  plugins: [],
}
