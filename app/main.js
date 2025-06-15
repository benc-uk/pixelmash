import '../assets/style.css'
import '../assets/helpers.css'

import { getGL, init as initRendering, setSource } from './render'
import Alpine from 'alpinejs'
import { createEffect } from './effects'

Alpine.data('app', () => ({
  sourceType: 'image',
  sourceLoaded: false,

  /** @type {Object[]} */
  effects: [],

  async init() {
    this.$store.effects = []

    // Debug when running in dev mode
    if (import.meta.env.DEV) {
      loadFromURL('img/kitty.jpg')
      this.sourceLoaded = true
    }

    // Drag and drop support
    const container = this.$refs.canvasContainer
    if (container) {
      container.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      })
      container.addEventListener('drop', async (e) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          await loadImageFile(e.dataTransfer.files[0])
          this.sourceLoaded = true
        }
      })
    }

    initRendering()
    console.log('🎉 Alpine.js initialized and rendering started')
  },

  addEffect() {
    const effect = createEffect('colourize', getGL())
    this.$store.effects.push(effect)
  },

  /**
   * Load an image from a file input
   * @param {Event} event
   */
  async fileInputImage(event) {
    const fileInput = /** @type {HTMLInputElement} */ (event.target)
    if (!fileInput) {
      console.warn('No file input found or no files selected')
      return
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      console.warn('No file selected')
      return
    }

    const file = fileInput.files[0]
    await loadImageFile(file)
    this.sourceLoaded = true
  },
}))

Alpine.start()

/** @param {string} imageURL */
async function loadFromURL(imageURL) {
  const res = await fetch(imageURL)
  const blob = await res.blob()
  const file = new File([blob], imageURL, { type: 'image/jpeg' })
  loadImageFile(file)
}

/**
 * Load an image file and set it as the source for rendering
 * @param {File} file
 */
async function loadImageFile(file) {
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      // Decode the data into an image, only to give us width and height
      const img = new Image()
      img.onload = async () => {
        const base64ImgData = /** @type {string} */ (e.target?.result)
        await setSource(base64ImgData, img.width, img.height)
      }

      img.src = /** @type {string} */ (e.target?.result)
    }

    reader.readAsDataURL(file)
  }
}
