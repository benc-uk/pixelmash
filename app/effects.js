import * as twgl from 'twgl.js'
import colourize from '../assets/shaders/colourize.frag.glsl?raw'
import edge from '../assets/shaders/edge.frag.glsl?raw'
import pixelate from '../assets/shaders/pixelate.frag.glsl?raw'
import scanlines from '../assets/shaders/scanlines.frag.glsl?raw'
import vertShader from '../assets/shaders/base.vert.glsl?raw'

// This defines the available effects
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
    fragShader: colourize,
  },

  pixelate: {
    name: 'pixelate',
    params: {
      cellCount: {
        value: 60,
        min: 4,
        max: 200,
        step: 1,
      },
      radius: {
        value: 1,
        min: 0.2,
        max: 1.8,
        step: 0.01,
      },
    },
    fragShader: pixelate,
  },

  edge: {
    name: 'edge',
    params: {
      threshold: {
        value: 0.1,
        min: 0,
        max: 0.2,
        step: 0.001,
      },
      strength: {
        value: 0.7,
        min: 0,
        max: 1,
        step: 0.01,
      },
      size: {
        value: 1,
        min: 0,
        max: 10,
        step: 0.01,
      },
      hue: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    fragShader: edge,
  },

  scanlines: {
    name: 'scanlines',
    params: {
      spacing: {
        value: 0.8,
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      intensity: {
        value: 0.5,
        min: 0.25,
        max: 3,
        step: 0.01,
      },
    },
    fragShader: scanlines,
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
