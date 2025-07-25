import * as twgl from 'twgl.js'

import blur from '../assets/shaders/blur.frag.glsl?raw'
import colourize from '../assets/shaders/colourize.frag.glsl?raw'
import duotone from '../assets/shaders/duotone.frag.glsl?raw'
import edgeAlt from '../assets/shaders/edge-alt.frag.glsl?raw'
import edge from '../assets/shaders/edge.frag.glsl?raw'
import melt from '../assets/shaders/melt.frag.glsl?raw'
import pixelate from '../assets/shaders/pixelate.frag.glsl?raw'
import posterize from '../assets/shaders/posterize.frag.glsl?raw'
import scanlines from '../assets/shaders/scanlines.frag.glsl?raw'
import slice from '../assets/shaders/slice.frag.glsl?raw'
import ripples from '../assets/shaders/ripples.frag.glsl?raw'
import warp from '../assets/shaders/warp.frag.glsl?raw'
import solarize from '../assets/shaders/solarize.frag.glsl?raw'
import rgb from '../assets/shaders/rgb.frag.glsl?raw'
import barrelblur from '../assets/shaders/barrelblur.frag.glsl?raw'
import glow from '../assets/shaders/glow.frag.glsl?raw'
import hue from '../assets/shaders/hue.frag.glsl?raw'
import smear from '../assets/shaders/smear.frag.glsl?raw'
import mirror from '../assets/shaders/mirror.frag.glsl?raw'
import squares from '../assets/shaders/squares.frag.glsl?raw'

// This is the vertex shader used for all effects
import libShader from '../assets/shaders/_lib.frag.glsl?raw'
import vertShader from '../assets/shaders/_base.vert.glsl?raw'

// This defines the available effects
const effects = {
  levels: {
    name: 'levels',
    params: {
      red: {
        type: 'number',
        value: 1,
        min: 0,
        max: 6,
        step: 0.01,
      },
      green: {
        type: 'number',
        value: 1,
        min: 0,
        max: 6,
        step: 0.01,
      },
      blue: {
        type: 'number',
        value: 1,
        min: 0,
        max: 6,
        step: 0.01,
      },
      brightness: {
        type: 'number',
        value: 1,
        min: 0,
        max: 3,
        step: 0.01,
      },
      contrast: {
        type: 'number',
        value: 1,
        min: 0.0,
        max: 3.0,
        step: 0.01,
      },
    },
    fragShader: colourize,
  },

  pixelate: {
    name: 'pixelate',
    params: {
      cells: {
        type: 'number',
        value: 80,
        min: 4,
        max: 200,
        step: 1,
      },
      radius: {
        type: 'number',
        value: 1,
        min: 0.1,
        max: 1,
        step: 0.001,
      },
      circles: {
        type: 'boolean',
        value: false,
      },
    },
    fragShader: pixelate,
  },

  'edge-alt': {
    name: 'edge-alt',
    params: {
      threshold: {
        type: 'number',
        value: 0.1,
        min: 0,
        max: 0.3,
        step: 0.001,
      },
      strength: {
        type: 'number',
        value: 0.7,
        min: 0,
        max: 2,
        step: 0.01,
      },
      size: {
        type: 'number',
        value: 3,
        min: 0,
        max: 20,
        step: 0.1,
      },
      colour: {
        type: 'colour',
        value: '#78e24b',
      },
      xor: {
        type: 'boolean',
        value: false,
      },
    },
    fragShader: edgeAlt,
  },

  scanlines: {
    name: 'scanlines',
    params: {
      spacing: {
        type: 'number',
        value: 0.8,
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      level: {
        type: 'number',
        value: 0.5,
        min: 0.25,
        max: 3,
        step: 0.01,
      },
      intensity: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 3.0,
        step: 0.01,
      },
    },
    fragShader: scanlines,
  },

  duotone: {
    name: 'duotone',
    params: {
      colour1: {
        type: 'colour',
        value: '#002244',
      },
      colour2: {
        type: 'colour',
        value: '#EE3377',
      },
      contrast: {
        type: 'number',
        value: 1,
        min: 0.0,
        max: 3,
        step: 0.01,
      },
      monotone: {
        type: 'boolean',
        value: false, // false = duotone, true = monotone
      },
      monotoneThres: {
        type: 'number',
        value: 0.4,
        min: 0.2,
        max: 0.5,
        step: 0.001,
      },
    },
    fragShader: duotone,
  },

  posterize: {
    name: 'posterize',
    params: {
      levels: {
        type: 'number',
        value: 4,
        min: 2,
        max: 16,
        step: 0.2,
      },
    },
    fragShader: posterize,
  },

  slice: {
    name: 'slice',
    params: {
      count: {
        type: 'number',
        value: 25,
        min: 4,
        max: 400,
        step: 1,
      },
      offset: {
        type: 'number',
        value: 0.4,
        min: 0.1,
        max: 1,
        step: 0.001,
      },
      variation: {
        type: 'number',
        value: 0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
      scaleBrightness: {
        type: 'number',
        value: 0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
      time: {
        type: 'number',
        value: 0.0,
        min: 0.0,
        max: 5.0,
        step: 0.001,
      },
    },
    fragShader: slice,
  },

  solarize: {
    name: 'solarize',
    params: {
      center: {
        type: 'number',
        value: 0.5,
        min: 0.1,
        max: 2,
        step: 0.01,
      },
      power: {
        type: 'number',
        value: 2.0,
        min: 1.0,
        max: 3.0,
        step: 0.01,
      },
      colorize: {
        type: 'number',
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
    },
    fragShader: solarize,
  },

  melt: {
    name: 'melt',
    params: {
      strength: {
        type: 'number',
        value: 0.2,
        min: 0.0,
        max: 4,
        step: 0.01,
      },
      progress: {
        type: 'number',
        value: 1,
        min: 0,
        max: 2,
        step: 0.01,
      },
      drips: {
        type: 'number',
        value: 10,
        min: 1,
        max: 64,
        step: 1,
      },
      time: {
        type: 'number',
        value: 0.0,
        min: 0,
        max: 5,
        step: 0.001,
      },
    },
    fragShader: melt,
  },

  warp: {
    name: 'warp',
    params: {
      amount: {
        type: 'number',
        value: 16,
        min: 0,
        max: 25,
        step: 0.1,
      },
      time: {
        type: 'number',
        value: 12,
        min: 0,
        max: 25,
        step: 0.1,
      },
      count: {
        type: 'number',
        value: 1,
        min: 0,
        max: 16,
        step: 0.1,
      },
    },
    fragShader: warp,
  },

  ripples: {
    name: 'ripples',
    params: {
      time: {
        type: 'number',
        value: 5,
        min: 0,
        max: 10,
        step: 0.1,
      },
      scale: {
        type: 'number',
        value: 4,
        min: 0,
        max: 10,
        step: 0.01,
      },
      amount: {
        type: 'number',
        value: 0.05,
        min: 0,
        max: 0.4,
        step: 0.001,
      },
    },
    fragShader: ripples,
  },

  blur: {
    name: 'blur',
    params: {
      samples: {
        type: 'number',
        value: 50,
        min: 4,
        max: 100,
        step: 1,
      },
    },
    fragShader: blur,
  },

  rgb: {
    name: 'rgb',
    params: {
      dist: {
        type: 'number',
        value: 0.01,
        min: 0,
        max: 0.08,
        step: 0.0001,
      },
      seed: {
        type: 'number',
        value: 0,
        min: 0,
        max: 2,
        step: 0.01,
      },
    },
    fragShader: rgb,
  },

  barrelblur: {
    name: 'barrelblur',
    params: {
      blur: {
        type: 'number',
        value: 0.2,
        min: 0,
        max: 0.5,
        step: 0.0001,
      },
      offset: {
        type: 'number',
        value: 0.1,
        min: 0,
        max: 1,
        step: 0.0001,
      },
      strength: {
        type: 'number',
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.001,
      },
      chromatic: {
        type: 'number',
        value: 0.0,
        min: 0,
        max: 3,
        step: 0.001,
      },
    },
    fragShader: barrelblur,
  },

  glow: {
    name: 'glow',
    params: {
      size: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 40.0,
        step: 0.01,
      },
      intensity: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 5.0,
        step: 0.01,
      },
      threshold: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
    },
    fragShader: glow,
  },

  huesat: {
    name: 'huesat',
    params: {
      hue: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
      saturation: {
        type: 'number',
        value: 1.0,
        min: 0.0,
        max: 5.0,
        step: 0.01,
      },
    },
    fragShader: hue,
  },

  smear: {
    name: 'smear',
    params: {
      time: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
      amount: {
        type: 'number',
        value: 0.02,
        min: 0.0,
        max: 0.2,
        step: 0.01,
      },
      style: {
        type: 'boolean',
        value: false, // false = RG, true = GB
      },
    },
    fragShader: smear,
  },

  mirror: {
    name: 'mirror',
    params: {
      axis: {
        type: 'number',
        value: 0,
        min: 0,
        max: 8,
        step: 1,
      },
    },
    fragShader: mirror,
  },

  squares: {
    name: 'squares',
    params: {
      size: {
        type: 'number',
        value: 0.1,
        min: 0.02,
        max: 0.25,
        step: 0.0001,
      },
      displace: {
        type: 'number',
        value: 0.5,
        min: 0.0,
        max: 1.5,
        step: 0.01,
      },
      hue: {
        type: 'number',
        value: 0.0,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
      value: {
        type: 'number',
        value: 0.15,
        min: 0.0,
        max: 1.0,
        step: 0.01,
      },
      seed: {
        type: 'number',
        value: 3,
        min: 0.0,
        max: 20.0,
        step: 0.5,
      },
    },
    fragShader: squares,
  },

  edge: {
    name: 'edge',
    params: {
      threshold: {
        type: 'number',
        value: 0.1,
        min: 0,
        max: 1.0,
        step: 0.001,
      },
      size: {
        type: 'number',
        value: 3,
        min: 0.3,
        max: 10,
        step: 0.01,
      },
      colour: {
        type: 'colour',
        value: '#78e24b',
      },
    },
    fragShader: edge,
  },
}

/** Get a list of all available effects
 * @returns {string[]} List of effect names sorted by name
 */
export function effectList() {
  return Object.keys(effects).sort((a, b) => {
    return effects[a].name.localeCompare(effects[b].name)
  })
}

/**
 * Create a new effect instance
 * @param {string} name
 * @param {WebGLRenderingContext} gl
 * @returns {Effect} The effect instance
 */
export function createEffect(name, gl, defaultParams = {}) {
  if (!effects[name]) {
    throw new Error(`Effect "${name}" not found`)
  }

  const effectBase = effects[name]

  // This is an ultra hacky way to handle '#include' in WebGL which doesn't support it natively.
  // It replaces the comment with a fragment of shader code containing the library functions
  effectBase.fragShader = effectBase.fragShader.replace('// INCLUDE_LIB', libShader)

  const programInfo = twgl.createProgramInfo(gl, [vertShader, effectBase.fragShader])
  const frameBuffer = twgl.createFramebufferInfo(gl)

  /** @type {Effect} */
  const effect = {
    name: effectBase.name,
    // This is a little trick to do a deep copy to avoid reference issues on the params
    params: JSON.parse(JSON.stringify(effectBase.params)),
    frameBuffer, // GL framebuffer for rendering the effect into
    programInfo, // GL program info for rendering the effect shader
    folded: false, // Whether the effect is folded in the UI
    animated: Object.keys(effectBase.params).includes('time'), // Whether the effect has a time parameter for animation
    advancedScript: undefined, // Optional advanced script for the effect
  }

  // Set default values for the parameters
  Object.keys(effect.params).forEach((key) => {
    if (defaultParams[key] !== undefined) {
      effect.params[key].value = defaultParams[key]
    }
  })

  return effect
}
