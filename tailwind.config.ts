import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.{css}"
  ],
  theme: {
    extend: {
      boxShadow: { glass: "0 4px 30px rgba(0,0,0,0.1)" },
      backdropBlur: { xs: '2px' }
    },
  },
  plugins: [],
} satisfies Config;
