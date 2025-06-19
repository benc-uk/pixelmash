import * as twgl from 'twgl.js'
import Alpine from 'alpinejs'
import passthroughShader from '../assets/shaders/_null.frag.glsl?raw'
import vertShader from '../assets/shaders/_base.vert.glsl?raw'

let gl
let texture
let bufferInfo
let passThroughProgInfo

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
  gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true })
  if (!gl) {
    console.error('💥 WebGL2 not supported!')
    return
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  console.log('🎨 WebGL2 initialized successfully')

  passThroughProgInfo = twgl.createProgramInfo(gl, [vertShader, passthroughShader])
  bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  })

  // Start the rendering loop
  console.log('🚀 Starting render loop...')
  renderLoop()
}

/**
 * Sets the source image for the rendering chain
 * @param {string} imageSrc
 * @param {number} width
 * @param {number} height
 */
export async function setSource(imageSrc, width, height) {
  if (!imageSrc || !width || !height) return

  texture = twgl.createTexture(gl, {
    src: imageSrc,
    //@ts-ignore
    flipY: true,
    width: width,
    height: height,
    minMag: gl.LINEAR,
  })

  gl.canvas.width = width
  gl.canvas.height = height
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  console.log('🖼️ Image loaded, canvas size updated:', gl.canvas.width, 'x', gl.canvas.height)

  // Resize all the effect frameBuffers to match the new canvas size
  const effects = Alpine.store('effects')

  if (!effects || effects.length === 0) return
  for (const effect of effects) {
    if (effect.frameBuffer) {
      twgl.resizeFramebufferInfo(gl, effect.frameBuffer, undefined, width, height)
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
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const effects = Alpine.store('effects')
  if (!effects) return

  // If no effects, use the passthrough shader to render the texture directly
  if (effects.length === 0 && texture) {
    gl.useProgram(passThroughProgInfo.program)
    twgl.setBuffersAndAttributes(gl, passThroughProgInfo, bufferInfo)
    twgl.setUniforms(passThroughProgInfo, {
      image: texture,
    })
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
    requestAnimationFrame(renderLoop)
    return
  }

  // loop through all effects and apply them by running the shader programs
  // in order, using the output of each effect as the input for the next
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i]

    const uniforms = {
      imageRes: [gl.canvas.width, gl.canvas.height],
      aspect: gl.canvas.height / gl.canvas.width,
    }

    if (i === 0) {
      // If first effect, use the source texture as input
      uniforms.image = texture
    } else {
      // If not the first effect, use the previous effect's framebuffer attachment
      uniforms.image = effects[i - 1].frameBuffer.attachments[0]
    }

    gl.useProgram(effect.programInfo.program)
    if (i === effects.length - 1) {
      // Last effect, render to screen
      twgl.bindFramebufferInfo(gl, null)
    } else {
      // When not the last effect, render to the effect's framebuffer
      twgl.bindFramebufferInfo(gl, effect.frameBuffer)
    }

    // Get the effect parameters and convert them to uniforms
    const effectParamUniforms = Object.entries(effect.params).reduce((acc, [key, param]) => {
      if (param.type === 'colour') {
        acc[key] = hexColourToTuple(param.value)
        return acc
      }

      acc[key] = param.value
      return acc
    }, {})

    twgl.setBuffersAndAttributes(gl, effect.programInfo, bufferInfo)
    twgl.setUniforms(effect.programInfo, {
      ...uniforms,
      ...effectParamUniforms,
    })
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
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
