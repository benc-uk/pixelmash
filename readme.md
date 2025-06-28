# Pixel Mash

Pixel Mash is a homage and reimagining of the tool [Mosh Lite](https://moshpro.app/lite/).

It is an image manipulation tool which uses WebGL shaders to apply various effects to images and videos. It allows you to manipulate images in real-time, applying effects like pixelation, glitch, and more. You can also use it to process live camera input.

This version is written in JS and uses Vite + Alpine.js for the UI and twgl + WebGL for the image processing

![Screenshot of Pixel Mash](./.github/chrome_U1MYcKi6Cm.jpg)

[![CI - Check, Build and Deploy](https://github.com/benc-uk/pixelmash/actions/workflows/ci-build.yaml/badge.svg)](https://github.com/benc-uk/pixelmash/actions/workflows/ci-build.yaml)

## Features

- Image & video manipulation using WebGL shaders
- Multiple effects including pixelation, glitch, and more, see below
- Camera support for live image manipulation
- Can upload both images and videos
- Animated effects
- Reorder effects
- Save images
- Export video

## Effects Summary

- **levels**  
  Adjusts red, green, blue channel multipliers, brightness, and contrast.

- **pixelate**  
  Applies a pixelation effect with adjustable cell count and radius.

- **edge**  
  Detects edges with configurable threshold, strength, size, color, and XOR mode.

- **scanlines**  
  Adds scanline overlay with spacing, level, and intensity controls.

- **duotone**  
  Maps image to two colors with adjustable contrast.

- **posterize**  
  Reduces the number of color levels.

- **slice**  
  Slices the image into bands with count, offset, and jitter parameters.

- **solarize**  
  Applies a solarization effect with center, power, and colorize controls.

- **melt**  
  Creates a melting distortion with strength, progress, drips, and time.

- **warp**  
  Warps the image with amount, time, and count parameters.

- **ripples**  
  Adds ripple distortion with time, scale, and amount.

- **blur**  
  Applies a blur effect with adjustable radius.

- **rgb**  
  Shifts RGB channels with distance and seed controls.

- **barrelblur**  
  Barrel blur effect with blur, offset, strength, and chromatic

- **huesat**  
  Adjusts hue and saturation with angle and saturation controls.

- **mirror**  
  Mirrors the image across various axes

- **smear**  
  Smears the image using channel offsets with adjustable strength and speed and mode.

## Advanced Features

The app supports an advanced mode, enable this only if you know what you are doing! It is enabled by a toggle in the config dialog.

When advanced mode is enabled, a snippet of JS becomes available for each effect, allowing control over the parameters of the effect. This allows for more complex animations and configurations that are not possible with the standard UI controls.
The advanced script is a snippet of a JS object (so in the form of `key: value` pairs) that can override the default parameters of the effects. It can be used to animate parameters over time, or to set them to specific values.

The keys correspond to the effect parameters and are named as they are shown in the UI

The script is evaluated as a standard JS object, so you can use JS the Math functions etc, the following functions & parameters are available:

- `sinTime(speed)` - Returns a sine value in range 0-1 based on the current time, useful for smooth animations.
- `rampTime(speed)` - Returns a ramped value in range 0-1 based on the current time, useful for linear animations.
- `t` - The current time in seconds, can be used to animate parameters.
- `norm` - Normalizes a value to a range, useful for scaling values.
- `rand(min, max)` - Returns a random value between `min` and `max`, useful for randomizing parameters.

### Some examples of advanced mode usage

In the **huesat** effect, to animate the hue over time, you can use:

```
hue: sinTime(3)
```

In the **pixelate** effect, to animate the cell count over time, with a minimum value, you can use:

```
cells: 40 + rampTime(0.5) * 100
```

You can modify multiple parameters at once, for example in the **solarize** effect:

```
colorize: sinTime(7),
center: rampTime(0.2)
```
