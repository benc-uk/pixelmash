import '../assets/style.css'
import '../assets/helpers.css'
import '../assets/toggle.css'

import { clearSource, getGL, init as initRendering, setSource } from './render'
import { createEffect, effectList } from './effects'
import Alpine from 'alpinejs'

Alpine.data('app', () => ({
  version: import.meta.env.PACKAGE_VERSION || 'unknown',
  sourceType: 'image',
  sourceLoaded: false,
  pickNewEffect: false,
  dragEffectIndex: -1,

  /** @type {Object[]} */
  effects: [],
  effectList,

  async init() {
    console.log(`🦄 Pixel Mosh ${this.version}`)
    this.$store.effects = []

    initRendering()

    this.resize()

    // For debugging & dev - when running locally in dev mode
    if (import.meta.env.DEV) {
      loadFromURL('img/kitty.jpg')
      this.sourceLoaded = true
      this.addEffect('slice')
    }

    console.log('🎉 Alpine.js initialized and app started')
  },

  resize() {
    resizeCanvas()
  },

  dragNavSizer(event) {
    const newWid = event.clientX
    if (newWid < 100 || newWid > 600) return
    this.$refs.nav.style.width = `${newWid}px`
    this.$refs.main.style.width = `calc(100% - ${newWid}px)`
    this.$nextTick(() => {
      resizeCanvas()
    })
  },

  showEffectSelector() {
    this.pickNewEffect = true
    this.$refs.effectSelector.selectedIndex = 0
    this.$refs.effectSelector.focus()

    this.$nextTick(() => {
      this.$refs.effectSelector.showPicker()
    })
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

    // Force a re-render
    Alpine.store('renderComplete', false)
  },

  removeEffect(index) {
    if (index < 0 || index >= this.$store.effects.length) {
      console.warn('Invalid effect index:', index)
      return
    }
    this.$store.effects.splice(index, 1)

    // Force a re-render
    Alpine.store('renderComplete', false)
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

  async promptForFile() {
    const fileInput = /** @type {HTMLInputElement} */ (this.$refs.fileInput)
    if (!fileInput) {
      console.warn('No file input found')
      return
    }

    fileInput.click()
  },

  clear() {
    this.$store.effects = []
    this.sourceLoaded = false
    clearSource()
    this.$refs.main.style.width = '100%'
    this.$nextTick(() => {
      resizeCanvas()
    })
  },

  save() {
    const link = document.createElement('a')
    link.download = 'pixel-mash.png'
    link.href = this.$refs.canvas.toDataURL('image/png')
    link.click()
  },

  dragEffectStart(index) {
    this.dragEffectIndex = index
  },

  dragEffectDrop(index) {
    // If we are dropping on the same index, do nothing
    if (this.dragEffectIndex === index) {
      return
    }

    // If we are dropping on a different index, swap the effects
    if (
      this.dragEffectIndex >= 0 &&
      this.dragEffectIndex < this.$store.effects.length &&
      index >= 0 &&
      index < this.$store.effects.length
    ) {
      const temp = this.$store.effects[this.dragEffectIndex]
      this.$store.effects[this.dragEffectIndex] = this.$store.effects[index]
      this.$store.effects[index] = temp
    }

    // Force a re-render
    Alpine.store('renderComplete', false)
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
  // Can't use Alpine refs here because this is called outside of Alpine's context
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
