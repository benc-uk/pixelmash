import version from 'vite-plugin-package-version'

export default {
  // Version plugin to inject package version into the app
  plugins: [version()],
  base: './',
  build: {
    chunkSizeWarningLimit: 1024, // kB
  },
}
