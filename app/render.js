import * as twgl from 'twgl.js'
import vertShader from '../assets/shaders/base.vert.glsl?raw'

let gl
let texture
let programInfo1
let programInfo2
let framebuffer1
let bufferInfo

let redness = 1.2 // Default redness value
let scanlineCount = 700
let scanlineBright = 1.0

const fragShaderPass1 = `#version 300 es 
precision highp float;

in vec2 imgcoord;
uniform float redness;
uniform sampler2D image;
out vec4 fragColor;

void main() {
  vec4 pixel = texture(image, imgcoord);
  // make reddish
  pixel.r = pixel.r * redness;
  pixel.g = pixel.g * 0.2;
  pixel.b = pixel.b * 0.5;
  fragColor = pixel;
}`

const fragShaderPass2 = `#version 300 es 
precision highp float;

in vec2 imgcoord;
uniform float scanlineCount;
uniform float scanlineBright;
uniform sampler2D image;
out vec4 fragColor;

void main() {
  // fake scanline effect
  vec4 pixel = texture(image, imgcoord);
  float scanline = 0.5 + scanlineBright * sin(imgcoord.y * scanlineCount);
  pixel.rgb *= scanline;
  fragColor = pixel;
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

  programInfo1 = twgl.createProgramInfo(gl, [vertShader, fragShaderPass1])
  programInfo2 = twgl.createProgramInfo(gl, [vertShader, fragShaderPass2])
  bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  })

  // First pass into a framebuffer
  framebuffer1 = twgl.createFramebufferInfo(gl, undefined, gl.canvas.width, gl.canvas.height)

  // Start the rendering loop
  console.log('🚀 Starting render loop...')
  renderLoop()
}

export function setRedness(value) {
  redness = value
}
export function setScanlineCount(value) {
  scanlineCount = value
}
export function setScanlineSize(value) {
  scanlineBright = value
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

/**
 * Main rendering loop
 */
function renderLoop() {
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.useProgram(programInfo1.program)
  twgl.bindFramebufferInfo(gl, framebuffer1)
  twgl.setBuffersAndAttributes(gl, programInfo1, bufferInfo)
  twgl.setUniforms(programInfo1, {
    image: texture,
    redness,
  })
  twgl.drawBufferInfo(gl, bufferInfo)

  // Binding to null here renders to the screen
  gl.useProgram(programInfo2.program)
  twgl.bindFramebufferInfo(gl, null)
  twgl.setBuffersAndAttributes(gl, programInfo2, bufferInfo)
  twgl.setUniforms(programInfo2, {
    image: framebuffer1.attachments[0], // MAGIC HERE! Use the texture from the first pass
    scanlineCount,
    scanlineBright,
  })
  twgl.drawBufferInfo(gl, bufferInfo)

  // Request the next frame and loop forever
  requestAnimationFrame(renderLoop)
}
