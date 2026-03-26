import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.tsx", "./components/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",

        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",

        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "primary-container": "hsl(var(--primary-container))",
        "on-primary-container": "hsl(var(--on-primary-container))",

        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        "secondary-container": "hsl(var(--secondary-container))",

        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",

        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",

        // Surface tokens used by the design snippets.
        "surface-container-low": "hsl(var(--surface-container-low))",
        "surface-container-high": "hsl(var(--surface-container-high))",
        "surface-container-lowest": "hsl(var(--surface-container-lowest))",
        "surface-container-highest": "hsl(var(--surface-container-highest))",
        "surface-variant": "hsl(var(--surface-variant))",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
      boxShadow: {
        // Keep subtle, design-driven glow without harsh drop shadows.
        glow: "0 20px 40px rgba(0, 0, 0, 0.4)",
      },
      fontFamily: {
        // These are fallback-safe; Inter is applied in RootLayout.
        headline: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        label: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

