import '../assets/style.css'
import '../assets/helpers.css'

import { init as initRendering, setSource } from './render'
import Alpine from 'alpinejs'

Alpine.data('app', () => ({
  sourceType: 'image',
  sourceLoaded: false,

  /** @type {string[]} */
  effects: [],

  async init() {
    initRendering()

    _fakeImageLoad('img/kitty.jpg')
    this.sourceLoaded = true

    // Drag and drop support using Alpine.js refs
    const container = this.$refs.canvasContainer
    console.log(container)

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
    this.effects.push('junk')
  },

  /** @param {Event} event */
  async load(event) {
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
