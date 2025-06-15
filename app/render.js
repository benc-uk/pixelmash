import * as twgl from 'twgl.js'
import vertShader from '../shaders/base.vert.glsl?raw'

var gl
var texture
var programInfo
var bufferInfo

const fragmentShaderSource = `#version 300 es 
precision highp float;

in vec2 imgcoord;
uniform sampler2D image;
out vec4 fragColor;

void main() {
  fragColor = texture(image, imgcoord);
}`

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

  programInfo = twgl.createProgramInfo(gl, [vertShader, fragmentShaderSource])
  bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  })

  gl.useProgram(programInfo.program)

  // Start the rendering loop
  console.log('🚀 Starting render loop...')
  renderLoop()
}

/**
 * Sets the source image for the rendering chain
 * @param {string | ArrayBuffer | null | undefined} imageData
 * @param {number} width
 * @param {number} height
 */
export async function setSource(imageData, width, height) {
  if (!imageData || !width || !height) return

  //@ts-ignore
  texture = twgl.createTexture(gl, {
    src: imageData,
    flipY: true,
    width: width,
    height: height,
    minMag: gl.LINEAR,
  })

  gl.canvas.width = width
  gl.canvas.height = height
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

  console.log('🖼️ Image loaded, canvas size updated:', gl.canvas.width, 'x', gl.canvas.height)
}

function renderLoop() {
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const uniforms = {
    image: texture,
  }

  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.setUniforms(programInfo, uniforms)
  twgl.drawBufferInfo(gl, bufferInfo)

  requestAnimationFrame(renderLoop)
}
