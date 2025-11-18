/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-secondary': 'var(--surface-secondary)',
        'surface-tertiary': 'var(--surface-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-white-static': 'var(--text-white-static)',
        muted: 'var(--muted)',
        'border-light': 'var(--border-light)',
        'border-medium': 'var(--border-medium)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        gold: 'var(--gold)',
      },
      fontFamily: {
        'spectral': ['Spectral', 'Georgia', 'Times New Roman', 'serif'],
        'cinzel': ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}

