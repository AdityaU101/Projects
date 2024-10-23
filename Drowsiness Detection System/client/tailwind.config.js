/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateRows: {
        app: "min-content 1fr",
      },
      gridTemplateColumns: {
        app: "312px 1fr",
      },
    },
  },
  plugins: [],
};
