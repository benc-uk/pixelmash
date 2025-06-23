import '../assets/style.css'
import '../assets/helpers.css'
import '../assets/toggle.css'

import { clearSource, getGL, init as initRendering, setSource } from './render'
import { createEffect, effectList } from './effects'
import Alpine from 'alpinejs'

/** @type {HTMLVideoElement | null} */
let video = null

Alpine.data('app', () => ({
  version: import.meta.env.PACKAGE_VERSION || 'unknown',
  sourceType: 'image',
  sourceLoaded: false,
  pickNewEffect: false,
  dragEffectIndex: -1,
  showConf: false,
  isFullscreen: false,

  /** @type {Object[]} */
  effects: [],
  effectList,

  /**
   * Initialize the application, everything really starts here
   */
  async init() {
    console.log(`🦄 Pixel Mosh ${this.version}`)
    this.$store.effects = []

    initRendering()

    this.resize()

    // For debugging & dev - when running locally in dev mode
    // if (import.meta.env.DEV) {
    //   loadFromURL('img/kitty.jpg')
    //   this.sourceLoaded = true
    //   this.addEffect('slice')
    // }

    Alpine.store('renderComplete', false)
    Alpine.store('animationSpeed', 0)
    console.log('🎉 Alpine.js initialized and app started')
  },

  /**
   * Wrapper for the resize function
   */
  resize() {
    resizeCanvas()
  },

  /**
   * Toggle fullscreen mode for the app
   */
  fullscreen() {
    if (this.isFullscreen) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
    this.isFullscreen = !this.isFullscreen
    this.$nextTick(() => {
      resizeCanvas()
    })
  },

  /**
   * Handle drag events for the navigation sizer
   * @param {DragEvent} event
   */
  dragNavSizer(event) {
    const newWid = event.clientX
    if (newWid < 190 || newWid > 600) return

    this.$refs.nav.style.width = `${newWid}px`
    this.$refs.main.style.width = `calc(100% - ${newWid}px)`

    this.$nextTick(() => {
      resizeCanvas()
    })
  },

  /**
   * Show the effect selector dialog to pick a new effect
   * This is really just to reduce the number of clicks needed to add an effect
   */
  showEffectSelector() {
    this.pickNewEffect = true
    this.$refs.effectSelector.selectedIndex = 0
    this.$refs.effectSelector.focus()

    this.$nextTick(() => {
      this.$refs.effectSelector.showPicker()
    })
  },

  /**
   * Add a new effect based on the selected option in the effect selector
   * @param {string} effectName
   */
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

  /**
   * Guess that this one does?
   * @param {number} index
   */
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

  /**
   * Open the camera and start streaming video
   * This will create a video element and set it as the source for rendering
   */
  async openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      video = document.createElement('video')
      video.srcObject = stream

      let width = 1920
      let height = 1080

      video.addEventListener('loadeddata', () => {
        if (!video) return

        height = video.videoHeight
        width = video.videoWidth

        this.sourceLoaded = true
        setSource(video, width, height)
        console.log(`📷 Camera video opened with dimensions: ${width}x${height}`)

        resizeCanvas()
      })

      video.play()
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please check permissions.')
    }
  },

  /**
   * Handle dropping an image file onto the app
   * @param {DragEvent} event
   */
  async dropImage(event) {
    if (!event || !event.dataTransfer) return

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      await loadImageFile(event.dataTransfer.files[0])
      this.sourceLoaded = true
    }
  },

  /**
   * Prompt the user to select a file using the hidden file input
   */
  async promptForFile() {
    const fileInput = /** @type {HTMLInputElement} */ (this.$refs.fileInput)
    if (!fileInput) {
      console.warn('No file input found')
      return
    }

    // Trigger a click on the hidden file input to open the file dialog
    fileInput.value = ''
    fileInput.click()
  },

  /**
   * Clear the current source and reset the application state
   */
  clear() {
    this.$store.effects = []
    this.sourceLoaded = false
    clearSource()
  },

  /**
   * Save the current canvas as a PNG file
   */
  save() {
    const link = document.createElement('a')
    const timeStamp = new Date().toLocaleDateString() + '_' + new Date().toLocaleTimeString()
    link.download = `pixel-mash-${timeStamp}.png`
    link.href = this.$refs.canvas.toDataURL('image/png')
    link.click()
  },

  /**
   * Start dragging an effect to reorder it
   * @param {number} index
   */
  dragEffectStart(index) {
    this.dragEffectIndex = index
  },

  /**
   * Handle dragging an effect over another effect, will reorder them
   * @param {number} index
   */
  dragEffectDrop(index) {
    // If we are dropping on the same index, do nothing
    if (this.dragEffectIndex === index) {
      return
    }

    // If we are dropping on a different index, swap the effects
    if (this.dragEffectIndex >= 0 && this.dragEffectIndex < this.$store.effects.length && index >= 0 && index < this.$store.effects.length) {
      const temp = this.$store.effects[this.dragEffectIndex]
      this.$store.effects[this.dragEffectIndex] = this.$store.effects[index]
      this.$store.effects[index] = temp
    }

    // Force a re-render
    Alpine.store('renderComplete', false)
  },
}))

// Whoooo, begin the Alpine.js magic
Alpine.start()

//eslint-disable-next-line no-unused-vars
async function debug(imageURL) {
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
  clearSource()

  // Stop any existing video stream for the camera
  if (video) {
    const mediaStream = /** @type {MediaStream} */ (video.srcObject)
    if (mediaStream) {
      const tracks = mediaStream.getTracks()
      tracks.forEach((track) => track.stop())
    }
    video = null
  }

  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      // Decode the data into an image
      const img = new Image()
      img.onload = async () => {
        setSource(img)
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
