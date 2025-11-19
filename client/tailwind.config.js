/** @type {import('tailwindcss').Config} */
export default {
 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        
        'primary': 'var(--primary)',
        'accent': 'var(--accent)',
        'dark-bg': 'var(--dark-bg)',
        'card-bg': 'var(--card-bg)',
        'text-white': 'var(--text-white)',
        'text-gray': 'var(--text-gray)',
      },
      fontFamily: {
        // Asegúrate de que Inter sea la fuente principal
        sans: ['Inter', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}