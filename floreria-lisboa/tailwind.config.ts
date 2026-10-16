import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2.5rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        marfil: token("marfil"),
        papel: token("papel"),
        rubor: token("rubor"),
        salvia: token("salvia"),
        lavanda: token("lavanda"),
        manteca: token("manteca"),
        tinta: token("tinta"),
        gris: { DEFAULT: token("gris"), texto: token("gris-texto") },
        linea: token("linea"),
        malva: {
          DEFAULT: token("malva"),
          oscuro: token("malva-oscuro"),
          profundo: token("malva-profundo"),
        },
        oro: token("oro"),
        error: token("error"),
        // Alias que usan los componentes de shadcn/ui
        background: token("marfil"),
        foreground: token("tinta"),
        border: token("linea"),
        input: token("linea"),
        ring: token("malva"),
        primary: { DEFAULT: token("tinta"), foreground: token("marfil") },
        muted: { DEFAULT: token("marfil"), foreground: token("gris-texto") },
        popover: { DEFAULT: token("papel"), foreground: token("tinta") },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Garamond", "Georgia", "serif"],
        sans: ["Jost", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        script: ['"Pinyon Script"', '"Cormorant Garamond"', "cursive"],
      },
      fontSize: {
        kicker: ["11px", { lineHeight: "1.4", letterSpacing: "0.28em" }],
        section: ["clamp(34px, 5vw, 50px)", { lineHeight: "1.06" }],
        hero: ["clamp(42px, 7vw, 76px)", { lineHeight: "1.02" }],
      },
      borderRadius: {
        card: "18px",
        option: "16px",
        panel: "28px",
      },
      boxShadow: {
        soft: "0 1px 2px rgb(47 42 44 / 0.03), 0 8px 24px -12px rgb(47 42 44 / 0.08)",
        lift: "0 2px 4px rgb(47 42 44 / 0.03), 0 18px 40px -18px rgb(47 42 44 / 0.16)",
      },
      transitionTimingFunction: {
        atelier: "cubic-bezier(.2,.8,.2,1)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        "step-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "live-dot": {
          "0%": { boxShadow: "0 0 0 0 rgb(122 168 122 / 0.55)" },
          "70%": { boxShadow: "0 0 0 7px rgb(122 168 122 / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(122 168 122 / 0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        pop: "pop 350ms cubic-bezier(.2,.8,.2,1)",
        "step-in": "step-in 300ms cubic-bezier(.2,.8,.2,1)",
        "fade-in": "fade-in 250ms cubic-bezier(.2,.8,.2,1)",
        "live-dot": "live-dot 1.8s cubic-bezier(.2,.8,.2,1) infinite",
        "accordion-down": "accordion-down 300ms cubic-bezier(.2,.8,.2,1)",
        "accordion-up": "accordion-up 250ms cubic-bezier(.2,.8,.2,1)",
        float: "float 7s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
