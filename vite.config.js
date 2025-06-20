import version from 'vite-plugin-package-version'

export default {
  plugins: [version()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1024, // kB
  },
}
