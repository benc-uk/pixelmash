import * as twgl from 'twgl.js'
import redizer from '../assets/shaders/colourize.frag.glsl?raw'
import vertShader from '../assets/shaders/base.vert.glsl?raw'

const effects = {
  colourize: {
    name: 'colourize',
    params: {
      red: {
        value: 1,
        min: 0,
        max: 6,
        step: 0.01,
      },
      green: {
        value: 1,
        min: 0,
        max: 6,
        step: 0.01,
      },
      blue: {
        value: 1,
        min: 0,
        max: 6,
        step: 0.01,
      },
    },
    fragShader: redizer,
  },
}

export function effectList() {
  return Object.keys(effects)
}

/**
 * Create a new effect instance
 * @param {string} name
 */
export function createEffect(name, gl) {
  if (!effects[name]) {
    throw new Error(`Effect "${name}" not found`)
  }

  const effectBase = effects[name]

  const programInfo = twgl.createProgramInfo(gl, [vertShader, effectBase.fragShader])
  const frameBuffer = twgl.createFramebufferInfo(gl, undefined, gl.canvas.width, gl.canvas.height)

  return {
    name: effectBase.name,
    params: JSON.parse(JSON.stringify(effectBase.params)), // Deep copy to avoid reference issues
    frameBuffer,
    programInfo,
  }
}
