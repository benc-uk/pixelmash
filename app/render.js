import * as twgl from 'twgl.js'
import Alpine from 'alpinejs'
import vertShader from '../assets/shaders/base.vert.glsl?raw'

let gl
let texture
let bufferInfo
let passThroughProgInfo

const fragShaderPassthrough = `#version 300 es 
precision highp float;
in vec2 imgcoord;
uniform sampler2D image;
out vec4 fragColor;
void main() {
  fragColor = texture(image, imgcoord);
}`

export function getGL() {
  if (!gl) {
    console.error('💥 WebGL2 context not initialized!')
    return null
  }

  return gl
}

export async function init() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    console.error('💥 Canvas element not found!')
    return
  }
  gl = canvas.getContext('webgl2')
  if (!gl) {
    console.error('💥 WebGL2 not supported!')
    return
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  console.log('🎨 WebGL2 initialized successfully')

  passThroughProgInfo = twgl.createProgramInfo(gl, [vertShader, fragShaderPassthrough])
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
  // const effects = Alpine.store('effects')

  // for (const effect of effects) {
  //   if (!effects || effects.length === 0) continue
  //   if (effect.frameBuffer) {
  //     twgl.resizeFramebufferInfo(gl, effect.frameBuffer, undefined, width, height)
  //   }
  // }
}

/**
 * Main rendering loop
 */
function renderLoop() {
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  if (!Alpine.store('effects')) return

  // If no effects, use the passthrough shader to render the texture directly
  if (Alpine.store('effects').length === 0 && texture) {
    gl.useProgram(passThroughProgInfo.program)
    twgl.setBuffersAndAttributes(gl, passThroughProgInfo, bufferInfo)
    twgl.setUniforms(passThroughProgInfo, { image: texture })
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES)
    requestAnimationFrame(renderLoop)
    return
  }

  // loop through all effects and apply them, get effect and index
  for (let i = 0; i < Alpine.store('effects').length; i++) {
    const effect = Alpine.store('effects')[i]

    const uniforms = {
      width: gl.canvas.width,
      height: gl.canvas.height,
      aspect: gl.canvas.width / gl.canvas.height,
    }

    if (i === 0) {
      // If first effect, use the texture as input
      uniforms.image = texture
    } else {
      // If not the first effect, use the previous effect's framebuffer attachment
      uniforms.image = Alpine.store('effects')[i - 1].frameBuffer.attachments[0]
    }

    gl.useProgram(effect.programInfo.program)
    if (i === Alpine.store('effects').length - 1) {
      // Last effect, render to screen
      twgl.bindFramebufferInfo(gl, null)
    } else {
      // Not the last effect, render to framebuffer
      twgl.bindFramebufferInfo(gl, effect.frameBuffer)
    }

    const effectParamUniforms = Object.entries(effect.params).reduce((acc, [key, param]) => {
      acc[key] = param.value
      return acc
    }, {})

    console.log(effectParamUniforms)

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
