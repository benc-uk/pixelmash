import '../assets/style.css'

import Alpine from 'alpinejs'
import { init as initRendering, setSource } from './render'

Alpine.data('app', () => ({
  sourceType: 'image',

  /** @type {string[]} */
  effects: [],

  async init() {
    initRendering()

    _fakeImageLoad('kitty.jpg')

    console.log('🎉 Alpine.js initialized and rendering started')
  },

  addEffect() {
    this.effects.push('junk')
  },

  /** @param {Event} event */
  async load(event) {
    await loadImageFile(event)
  },
}))

Alpine.start()

async function _fakeImageLoad(name) {
  // Fake a file input change to trigger the initial image load
  const res = await fetch(`public/${name}`)
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
