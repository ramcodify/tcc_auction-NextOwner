/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        forest: {
          DEFAULT: '#315B43',
          dark: '#274935',
          light: '#3C6F52',
          subtle: '#E4ECE7'
        },
        ink: {
          DEFAULT: '#20231F',
          light: '#3D413B'
        },
        stone: {
          DEFAULT: '#E8E5DB',
          hover: '#DDD9CD',
          dark: '#CDC8B9',
          light: '#F0EEE7'
        },
        olive: {
          DEFAULT: '#77776D',
          dark: '#5C5C54',
          light: '#939387'
        },
        border: {
          DEFAULT: '#DBD7CA',
          light: '#E6E3D8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        editorial: ['Newsreader', 'Georgia', 'serif']
      },
      borderRadius: {
        'none': '0',
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px'
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(32, 35, 31, 0.05)',
        'card': '0 1px 3px 0 rgba(32, 35, 31, 0.08), 0 1px 2px -1px rgba(32, 35, 31, 0.04)',
        'modal': '0 10px 25px -5px rgba(32, 35, 31, 0.12), 0 8px 10px -6px rgba(32, 35, 31, 0.08)'
      }
    },
  },
  plugins: [],
};
