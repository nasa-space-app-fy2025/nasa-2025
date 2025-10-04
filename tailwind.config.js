/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1', 
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)' 
          },
          '50%': { 
            opacity: '0.7', 
            transform: 'scale(1.05)',
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.8)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(-4px)' },
          '50%': { transform: 'translateY(4px)' },
        },
      },
      animation: {
        subtleFloat: 'subtleFloat 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      fontFamily: {
        gruppo: ['Gruppo', 'sans-serif'], // Your previous font
        jura: ['Jura', 'sans-serif'],
      },
      
      
  plugins: [],
}
  }
};
