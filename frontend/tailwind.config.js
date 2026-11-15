export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-sans)'], serif: ['var(--font-serif)'] },
    },
  },
  plugins: [],
};
