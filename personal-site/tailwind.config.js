/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: true, // This ensures Tailwind classes take precedence
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e14eca',
          hover: '#ba54f5',
          states: '#ba54f5',
        },
        secondary: {
          DEFAULT: '#f4f5f7',
          hover: '#d6d9e0',
        },
        info: {
          DEFAULT: '#1d8cf8',
          states: '#3358f4',
        },
        success: {
          DEFAULT: '#00f2c3',
          states: '#0098f0',
        },
        warning: {
          DEFAULT: '#ff8d72',
          states: '#ff6491',
        },
        danger: {
          DEFAULT: '#fd5d93',
          states: '#ec250d',
        },
        black: {
          DEFAULT: '#222a42',
          states: '#1d253b',
        },
        background: {
          black: '#171941',
          states: '#1e1e24',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        mono: ['Berkeley Mono', 'monospace'],
      },
      opacity: {
        '15': '.15',
      },
      backgroundOpacity: {
        '15': '.15',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // This prevents Tailwind from resetting existing styles
  },
} 