import '../assets/style.css'
import '../assets/helpers.css'

import { createEffect, effectList } from './effects'
import { getGL, init as initRendering, setSource } from './render'
import Alpine from 'alpinejs'

Alpine.data('app', () => ({
  sourceType: 'image',
  sourceLoaded: false,
  pickNewEffect: false,

  /** @type {Object[]} */
  effects: [],
  effectList,

  async init() {
    this.$store.effects = []

    // Debug when running in dev mode
    if (import.meta.env.DEVzzz) {
      loadFromURL('img/kitty.jpg')
      this.sourceLoaded = true
    }

    initRendering()
    console.log('🎉 Alpine.js initialized and rendering started')
    this.resize()
  },

  resize() {
    resizeCanvas()
  },

  dragNavSizer(event) {
    event.preventDefault()
    event.stopPropagation()

    const nav = document.querySelector('nav')
    if (!nav) return
    nav.style.width = `${event.clientX}px`
    // resizeCanvas()
  },

  addEffect(effectName) {
    this.pickNewEffect = false
    this.$refs.effectSelector.selectedIndex = 0
    if (effectName === '__cancel__') {
      console.log('Effect selection cancelled')
      return
    }
    const effect = createEffect(effectName, getGL())
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

  async dropImage(event) {
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      await loadImageFile(event.dataTransfer.files[0])
      this.sourceLoaded = true
    }
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
        resizeCanvas()
      }

      img.src = /** @type {string} */ (e.target?.result)
    }

    reader.readAsDataURL(file)
  }
}

/**
 * Painful to need this but aspect aware canvas resizing is not straightforward
 */
function resizeCanvas() {
  const canvas = document.querySelector('canvas')
  const container = document.querySelector('main')
  if (!canvas || !container) return

  const aspectRatio = canvas.width / canvas.height
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  let newWidth = containerWidth
  let newHeight = Math.floor(newWidth / aspectRatio)

  if (newHeight > containerHeight) {
    newHeight = containerHeight
    newWidth = Math.floor(newHeight * aspectRatio)
  }

  // Note only change the CSS size, not the internal canvas size
  canvas.style.width = `${newWidth}px`
  canvas.style.height = `${newHeight}px`
}
