import * as twgl from 'twgl.js'
import Alpine from 'alpinejs'
import passthroughShader from '../assets/shaders/_null.frag.glsl?raw'
import vertShader from '../assets/shaders/_base.vert.glsl?raw'

/** @type {WebGL2RenderingContext} */
let gl

/** @type {WebGLTexture | null} */
let texture

/** @type {twgl.BufferInfo} */
let quadBuffers

/** @type {twgl.ProgramInfo} */
let passThroughProgInfo

/** * The source image or video element to render
 * @type {HTMLImageElement | HTMLVideoElement | null}
 */
let currentSource = null

// Current time in seconds, used for animations
let t = 0

let currentFPS = 0
let frameCount = 0
let lastTime = 0

// Context only used for advanced script execution, provides utility functions
const advContext = {
  sinTime: (s) => (Math.sin(t * s) + 1) * 0.5,
  rampTime: (speed) => (t * speed) % 1,
  norm: (v, min = 0, max = 1) => (v - min) / (max - min),
  rand: (min = 0, max = 1) => Math.random() * (max - min) + min,
}

/**
 * Initializes the WebGL2 context and sets up the rendering pipeline
 * - also kicks off the rendering loop
 */
export async function init() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('💥 Canvas element not found!')
    return
  }

  // Note: preserveDrawingBuffer needed for saving the canvas as an image
  gl = /** @type {WebGL2RenderingContext} */ (canvas.getContext('webgl2', { preserveDrawingBuffer: true }))
  if (!gl) {
    console.error('💥 WebGL2 not supported!')
    return
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  console.log('🎨 WebGL2 initialized successfully')

  passThroughProgInfo = twgl.createProgramInfo(gl, [vertShader, passthroughShader])
  quadBuffers = twgl.createBufferInfoFromArrays(gl, {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  })

  Alpine.store('renderEffects', true)

  // Start the rendering loop
  console.log('🚀 Starting main GL render loop...')
  renderLoop()
}

/**
 * Sets the source image for the rendering chain
 * @param {HTMLImageElement | HTMLVideoElement} source
 */
export async function setSource(source, width = 0, height = 0) {
  const w = source.width || width
  const h = source.height || height

  currentSource = source
  texture = twgl.createTexture(
    gl,
    {
      src: source instanceof HTMLImageElement ? source.src : source,
      flipY: 1,
      width: w,
      height: h,
      minMag: gl.LINEAR,
    },
    () => {
      console.log('📸 Image texture loaded, canvas size updated:', gl.canvas.width, 'x', gl.canvas.height)
    },
  )

  gl.canvas.width = w
  gl.canvas.height = h
  gl.viewport(0, 0, w, h)

  // Resize all the effect frameBuffers to match the new canvas size
  const effects = Alpine.store('effects')
  if (!effects || effects.length === 0) return
  for (const effect of effects) {
    if (effect.frameBuffer) {
      twgl.resizeFramebufferInfo(gl, effect.frameBuffer, undefined, w, h)
    }
  }
}

/**
 * Clears the current source texture
 * This is useful for resetting the rendering state
 */
export function clearSource() {
  texture = null
}

/**
 * Main rendering loop
 */
function renderLoop() {
  // Video elements need to be updated every frame
  if (currentSource instanceof HTMLVideoElement) {
    if (texture) {
      twgl.setTextureFromElement(gl, texture, currentSource, { flipY: 1 })
    }
  }

  t = performance.now() / 1000

  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const effects = Alpine.store('effects')
  if (!effects) return

  // If no effects, use the passthrough shader to render the texture directly
  if (effects.length === 0 && texture) {
    gl.useProgram(passThroughProgInfo.program)
    twgl.setBuffersAndAttributes(gl, passThroughProgInfo, quadBuffers)
    twgl.setUniforms(passThroughProgInfo, {
      image: texture,
    })
    twgl.drawBufferInfo(gl, quadBuffers, gl.TRIANGLES)

    requestAnimationFrame(renderLoop)
    return
  }

  const animEnabled = Alpine.store('animationSpeed') > 0
  const anyEffectAnimated = effects.some((e) => e.animated)

  // Loop through all effects and apply them by running the shader programs
  // in order, using the output of each effect as the input for the next
  for (let i = 0; i < effects.length; i++) {
    /** @type {Effect} */
    const effect = effects[i]

    const uniforms = {
      imageRes: [gl.canvas.width, gl.canvas.height],
      aspect: gl.canvas.height / gl.canvas.width,
    }

    if (i === 0) {
      // If first effect, use the source texture as input
      uniforms.image = texture
    } else {
      // Otherwise use the previous effect's framebuffer as input
      uniforms.image = effects[i - 1].frameBuffer.attachments[0]
    }

    gl.useProgram(effect.programInfo.program)
    if (i === effects.length - 1) {
      // Last effect, render out to screen, & freeze the rendering
      twgl.bindFramebufferInfo(gl, null)
    } else {
      // When not the last effect, render into the effect's framebuffer
      twgl.bindFramebufferInfo(gl, effect.frameBuffer)
    }

    // If the effect is disabled, use the passthrough shader instead
    if (!effect.enabled) {
      gl.useProgram(passThroughProgInfo.program)
      twgl.setBuffersAndAttributes(gl, passThroughProgInfo, quadBuffers)
      twgl.setUniforms(passThroughProgInfo, uniforms)
      twgl.drawBufferInfo(gl, quadBuffers, gl.TRIANGLES)

      // Skip to the next effect
      continue
    }

    // Process the effect's parameters and convert them to uniforms
    const effectUniforms = Object.entries(effect.params).reduce((acc, [key, param]) => {
      if (param.type === 'colour') {
        acc[key] = hexColourToTuple('' + param.value)
        return acc
      }

      acc[key] = param.value
      return acc
    }, {})

    // If the effect is animated, fuck about with the time parameter
    if (anyEffectAnimated && animEnabled) {
      effectUniforms['time'] = t * Alpine.store('animationSpeed')
    }

    // This allows for all sorts of crazy shenanigans, and is only for very advanced users
    const advancedScript = effect.advancedScript
    let overrideUniforms = {}
    if (advancedScript) {
      try {
        const scriptFunc = new Function(...Object.keys(advContext), `"use strict"; return { ${advancedScript} }`)
        overrideUniforms = scriptFunc(...Object.values(advContext))
      } catch (error) {
        // Suppress the error
        error
      }
    }

    // Render the effect
    twgl.setBuffersAndAttributes(gl, effect.programInfo, quadBuffers)
    twgl.setUniforms(effect.programInfo, {
      ...uniforms,
      ...effectUniforms,
      ...overrideUniforms,
    })
    twgl.drawBufferInfo(gl, quadBuffers, gl.TRIANGLES)
  }

  // Update the FPS every 3 second
  frameCount++
  const now = performance.now()
  if (now - lastTime >= 1000) {
    currentFPS = frameCount
    frameCount = 0
    lastTime = now

    Alpine.store('fps', currentFPS)
  }

  // Request the next frame and loop forever
  requestAnimationFrame(renderLoop)
}

/**
 * Converts a hex color string to a normalized RGB tuple
 * @param {string} hexString
 * @returns
 */
function hexColourToTuple(hexString) {
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(hexString)) {
    console.error('Invalid hex color format:', hexString)
    return [0, 0, 0, 1] // Default to black with full opacity
  }

  const hex = hexString.replace('#', '')
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return [r / 255, g / 255, b / 255] // Return as normalized RGBA tuple
}

/**
 * Helper to grab the WebGL2 context
 * @returns {WebGL2RenderingContext | null}
 */
export function getGL() {
  if (!gl) {
    console.error('💥 WebGL2 context not initialized!')
    return null
  }

  return gl
}
