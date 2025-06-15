import '../assets/style.css'
import '../assets/helpers.css'

import { init as initRendering, setSource, setRedness, setScanlineCount, setScanlineSize } from './render'
import Alpine from 'alpinejs'

Alpine.data('app', () => ({
  sourceType: 'image',
  sourceLoaded: false,

  /** @type {Object[]} */
  effects: [],

  async init() {
    initRendering()

    // TEMP: While developing, bootstrap some stuff for testing
    _fakeImageLoad('img/kitty.jpg')
    this.effects.push({
      name: 'redizer',
      params: {
        redness: {
          value: 1.2,
          min: 0,
          max: 4,
          step: 0.01,
        },
      },
    })
    this.effects.push({
      name: 'scanlines',
      params: {
        count: {
          value: 600,
          min: 100,
          max: 1000,
          step: 10,
        },
        size: {
          value: 1,
          min: 0.01,
          max: 5,
          step: 0.01,
        },
      },
    })
    this.sourceLoaded = true

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
          await loadImageFile({ target: { files: e.dataTransfer.files } })
          this.sourceLoaded = true
        }
      })
    }

    console.log('🎉 Alpine.js initialized and rendering started')
  },

  addEffect() {
    this.effects.push({
      name: 'new-effect',
      params: {
        param1: {
          value: 0.5,
          min: 0,
          max: 1,
        },
        param2: {
          value: 1,
          min: 0,
          max: 10,
        },
      },
    })
  },

  paramChange(effect) {
    if (effect.name === 'redizer') {
      setRedness(effect.params.redness.value)
    } else if (effect.name === 'scanlines') {
      setScanlineCount(effect.params.count.value)
      setScanlineSize(effect.params.size.value)
    }
  },

  /** @param {Event} event */
  async loadImage(event) {
    await loadImageFile(event)
    this.sourceLoaded = true
  },
}))

Alpine.start()

/** @param {string} name */
async function _fakeImageLoad(name) {
  console.log(`🔍 Faking image load for: ${name}`)

  // Fake a file input change to trigger the initial image load
  const res = await fetch(name)
  const blob = await res.blob()
  const file = new File([blob], name, { type: 'image/jpeg' })
  loadImageFile({ target: { files: [file] } })
}

async function loadImageFile(event) {
  const file = event.target.files[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const img = new Image()
      img.onload = async () => {
        await setSource(e.target?.result, img.width, img.height)
      }
      img.src = /** @type {string} */ (e.target?.result)
    }

    reader.readAsDataURL(file)
  }
}
