/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0B0C10',
        secondary: '#1F2833',
        accent: '#66FCF1',
        textPrimary: '#C5C6C7',
        textSecondary: '#45A29E',
        buttonPrimary: '#1F2833',
        buttonHover: '#45A29E',
        buttonDanger: '#D32F2F',
        buttonWarning: '#FFA726',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    // other plugins
  ],
}
