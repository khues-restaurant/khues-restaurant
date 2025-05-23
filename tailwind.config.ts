import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        xs: "450px",
        ...defaultTheme.screens,
      },
    },
    screens: {
      xs: "450px",
      ...defaultTheme.screens,
    },
    extend: {
      screens: {
        mobileLarge: { raw: "(min-height: 667px)" },
        tablet: { raw: "(min-height: 600px) and (min-width: 1000px)" },
        desktop: { raw: "(min-height: 600px) and (min-width: 1536px)" },
        "2xl": "1536px",
        "3xl": "1700px",
        smallDesktopHeader: {
          raw: "(min-width: 1000px) and (max-width: 1250px)",
        },
        tall: { raw: "(min-height: 850px)" }, // this currently is showing up before the default "breakpoint"
        // in className order, ideally find proper way to tell tailwind to put it after the default breakpoint
      },
      boxShadow: {
        heavyInner: "inset 0px 2px 4px 0px rgba(0 0 0 / 0.35)",
        heroContainer: "0px 4px 8px 0px rgba(0 0 0 / 0.35)",
        lightHeroContainer: "0px 4px 16px 0px rgba(0 0 0 / 0.35)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        activeLink: "hsl(var(--active-link))",
        offwhite: "hsl(var(--offwhite))",
        gold: "hsl(var(--gold))",
        borderGold: "hsl(var(--borderGold))",
        darkPrimary: "hsl(var(--darkPrimary))",
        body: "hsl(var(--body))",
      },
      backgroundImage: {
        rewardsGradient:
          "linear-gradient(to right bottom, oklch(0.9 0.13 87.8) 0%, oklch(0.75 0.13 87.8) 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      transitionDuration: {
        "400": "400ms",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    // mobile safari was glitchy/inconsistent at best with the default
    // cubic-bezier transition timing function, so currently using linear
    transitionTimingFunction: {
      DEFAULT: "linear",
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
