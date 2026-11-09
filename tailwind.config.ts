import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: "#EEF4F5",
        ink: {
          DEFAULT: "#151D21",
          secondary: "#5A676E",
          muted: "#87959C",
        },
        petrol: {
          DEFAULT: "#084756",
          deep: "#053541",
          soft: "#5E94A2",
          tint: "#D7E8EC",
        },
        orchid: {
          DEFAULT: "#F2D2EC",
          deep: "#9B6B9E",
          vivid: "#DF5FA8",
          soft: "#F9E9F6",
        },
        lavender: {
          DEFAULT: "#D5CDF6",
          deep: "#7B68C4",
          soft: "#EAE6FC",
        },
        sky: {
          DEFAULT: "#CBE4EE",
          deep: "#3B7A91",
          soft: "#E5F2F7",
        },
        lime: {
          DEFAULT: "#EAFA91",
          deep: "#5E6E12",
        },
        mint: {
          DEFAULT: "#CBEFD1",
          deep: "#286634",
        },
        peach: {
          DEFAULT: "#F3B897",
          deep: "#9C4B22",
        },
      },
      boxShadow: {
        card: "0 10px 28px -6px rgba(8, 71, 86, 0.05), 0 2px 6px -1px rgba(8, 71, 86, 0.03)",
        pill: "0 2px 8px -2px rgba(21, 29, 33, 0.06)",
        phone: "0 32px 80px -16px rgba(15, 36, 44, 0.28), 0 0 0 10px rgba(255, 255, 255, 0.55)",
      },
      borderRadius: {
        card: "28px",
        "card-lg": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
