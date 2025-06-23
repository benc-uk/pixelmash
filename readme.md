# Pixel Mash

A clone/reinvention/homage of Photo Mosh, a image manipulation tool.

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
