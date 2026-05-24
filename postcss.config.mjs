/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 ships its own PostCSS plugin; autoprefixer is now built-in.
    '@tailwindcss/postcss': {},
  },
}

export default config
