/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: '#F6F7FB',
        border: '#E7E9F3',
        content: '#14152B',
        'content-secondary': '#565A78',
        'content-muted': '#8C8FA8',
        brand: {
          indigo: '#5A6ACF',
          violet: '#8B5CF6',
        },
        success: {
          DEFAULT: '#12B76A',
          bg: '#E7FAF0',
          text: '#027A48',
        },
        warning: {
          DEFAULT: '#F79009',
          bg: '#FFFAEB',
          text: '#B54708',
        },
        error: {
          DEFAULT: '#F04438',
          bg: '#FEF3F2',
          text: '#B42318',
        },
        neutral: {
          bg: '#F2F4F7',
          text: '#475467',
        },
      },
    },
  },
  plugins: [],
}
