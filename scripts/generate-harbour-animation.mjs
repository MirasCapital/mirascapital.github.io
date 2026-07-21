import { mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const WIDTH = 1280
const HEIGHT = 720
const CHANNELS = 4
const WATERLINE = 588
const TRANSITION_FRAMES = 72
const LOOP_FRAMES = 36
const TRANSITION_DELAY = 80
const LOOP_DELAY = 80
const animationsOnly = process.argv.includes("--animations-only")

const root = process.cwd()
const sourceDir = path.join(root, "public")
const outputDir = path.join(sourceDir, "harbour-animation")
const transitionDir = path.join(outputDir, "transition-frames")
const loopDir = path.join(outputDir, "loop-frames")

await Promise.all([
  mkdir(transitionDir, { recursive: true }),
  mkdir(loopDir, { recursive: true }),
])

const sunset = await loadRgba(path.join(sourceDir, "miras-sydney-harbour-sunset.png"))
const evening = await loadRgba(path.join(sourceDir, "miras-sydney-harbour-evening.png"))

const transitionRaw = []
for (let index = 0; index < TRANSITION_FRAMES; index += 1) {
  if (animationsOnly) {
    transitionRaw.push(
      await loadRgba(path.join(transitionDir, `harbour-transition-${pad(index + 1)}.webp`)),
    )
    continue
  }
  const progress = index / (TRANSITION_FRAMES - 1)
  const frame = renderFrame({
    from: sunset,
    to: evening,
    progress,
    phase: progress * Math.PI * 5.5,
    lightProgress: smoothstep(0.24, 0.92, progress),
    travellingLight: progress,
  })
  transitionRaw.push(frame)
  await writeFrame(frame, transitionDir, `harbour-transition-${pad(index + 1)}.webp`)
}

const loopRaw = []
for (let index = 0; index < LOOP_FRAMES; index += 1) {
  if (animationsOnly) {
    loopRaw.push(await loadRgba(path.join(loopDir, `harbour-loop-${pad(index + 1)}.webp`)))
    continue
  }
  const progress = index / LOOP_FRAMES
  const frame = renderFrame({
    from: evening,
    to: evening,
    progress: 1,
    phase: progress * Math.PI * 2,
    lightProgress: 1,
    travellingLight: progress,
  })
  loopRaw.push(frame)
  await writeFrame(frame, loopDir, `harbour-loop-${pad(index + 1)}.webp`)
}

await writeAnimation(
  transitionRaw,
  path.join(outputDir, "harbour-sunset-transition.webp"),
  TRANSITION_DELAY,
  1,
)
await writeAnimation(
  loopRaw,
  path.join(outputDir, "harbour-evening-loop.webp"),
  LOOP_DELAY,
  0,
)

console.log(`Rendered ${TRANSITION_FRAMES} sunset frames and ${LOOP_FRAMES} evening loop frames.`)

async function loadRgba(file) {
  const { data } = await sharp(file)
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return data
}

function renderFrame({ from, to, progress, phase, lightProgress, travellingLight }) {
  const frame = Buffer.allocUnsafe(WIDTH * HEIGHT * CHANNELS)
  const colorProgress = smootherstep(0.04, 0.96, progress)
  const eveningDepth = smootherstep(0.48, 1, progress)
  const sunCenterY = 458 + progress * 34

  for (let y = 0; y < HEIGHT; y += 1) {
    const waterDepth = Math.max(0, (y - WATERLINE) / (HEIGHT - WATERLINE))
    for (let x = 0; x < WIDTH; x += 1) {
      let sourceX = x
      let sourceY = y

      if (y >= WATERLINE) {
        const horizontalWave =
          Math.sin((y - WATERLINE) * 0.145 + phase * 1.35) * (0.8 + waterDepth * 2.8) +
          Math.sin(y * 0.047 - phase * 0.72) * 1.15
        const verticalWave = Math.sin(x * 0.024 + phase * 1.1) * (0.35 + waterDepth * 1.3)
        sourceX = clamp(Math.round(x + horizontalWave), 0, WIDTH - 1)
        sourceY = clamp(Math.round(y + verticalWave), WATERLINE, HEIGHT - 1)
      }

      const sourceOffset = (sourceY * WIDTH + sourceX) * CHANNELS
      const outputOffset = (y * WIDTH + x) * CHANNELS
      const horizonWarmth = y < WATERLINE ? (1 - progress) * Math.max(0, 1 - Math.abs(y - 500) / 230) : 0
      const sunDistance = Math.sqrt(((x - 270) / 480) ** 2 + ((y - sunCenterY) / 210) ** 2)
      const settingSun = y < WATERLINE ? Math.max(0, 1 - sunDistance) ** 2 * (1 - colorProgress) : 0
      const red = mix(from[sourceOffset], to[sourceOffset], colorProgress)
      const green = mix(from[sourceOffset + 1], to[sourceOffset + 1], colorProgress)
      const blue = mix(from[sourceOffset + 2], to[sourceOffset + 2], colorProgress)

      frame[outputOffset] = clampByte(
        red * (1 - eveningDepth * 0.08) + horizonWarmth * 7 + settingSun * 12,
      )
      frame[outputOffset + 1] = clampByte(
        green * (1 - eveningDepth * 0.05) + horizonWarmth * 2.4 + settingSun * 5,
      )
      frame[outputOffset + 2] = clampByte(
        blue * (1 + eveningDepth * 0.025) - horizonWarmth * 2.5 - settingSun * 2,
      )
      frame[outputOffset + 3] = 255
    }
  }

  addBridgeLights(frame, lightProgress, travellingLight)
  addWaterReflections(frame, phase, lightProgress, travellingLight)
  return frame
}

function addBridgeLights(frame, lightProgress, travellingLight) {
  const lightCount = 28
  const travellingIndex = travellingLight * lightCount

  for (let index = 0; index < lightCount; index += 1) {
    const t = index / (lightCount - 1)
    const x = Math.round(mix(474, 1052, t))
    const y = Math.round(386 + 0.00082 * (x - 762) ** 2)
    const activation = clamp((lightProgress - t * 0.82) / 0.12, 0, 1)
    const travelDistance = circularDistance(index, travellingIndex, lightCount)
    const pulse = Math.exp(-(travelDistance ** 2) / 3.8) * (lightProgress > 0.96 ? 0.24 : 0.16)
    const strength = activation * (0.3 + pulse)

    if (strength > 0.02) {
      addGlow(frame, x, y, 3.2, [255, 190, 104], strength)
      addGlow(frame, x, y, 0.9, [255, 229, 174], Math.min(0.72, strength + 0.18))
    }
  }

  const deckCount = 34
  for (let index = 0; index < deckCount; index += 1) {
    const t = index / (deckCount - 1)
    const x = Math.round(mix(450, 1092, t))
    const y = Math.round(499 + t * 6)
    const activation = clamp((lightProgress - t * 0.9) / 0.1, 0, 1)
    if (activation > 0.02) addGlow(frame, x, y, 1.8, [255, 201, 125], activation * 0.3)
  }
}

function addWaterReflections(frame, phase, lightProgress, travellingLight) {
  const anchors = [184, 308, 420, 516, 692, 770, 866, 968, 1082]
  for (let anchorIndex = 0; anchorIndex < anchors.length; anchorIndex += 1) {
    const anchorX = anchors[anchorIndex]
    const anchorStrength = 0.16 + lightProgress * 0.24
    for (let y = WATERLINE + 8; y < HEIGHT; y += 3) {
      const depth = (y - WATERLINE) / (HEIGHT - WATERLINE)
      const sway =
        Math.sin(y * 0.13 + phase * 1.7 + anchorIndex) * (2 + depth * 8) +
        Math.sin(y * 0.047 - phase + anchorIndex * 0.7) * 3
      const chase = 0.65 + 0.35 * Math.sin(travellingLight * Math.PI * 2 - anchorIndex * 0.72)
      const x = Math.round(anchorX + sway)
      const width = 1 + Math.round(depth * 3)
      const flicker = 0.45 + 0.55 * Math.sin(y * 0.22 + phase * 2.4 + anchorIndex) ** 2
      const strength = anchorStrength * (1 - depth * 0.55) * flicker * chase
      addHorizontalDash(frame, x, y, width, [244, 179, 94], strength)
    }
  }
}

function addGlow(frame, centerX, centerY, radius, color, strength) {
  const extent = Math.ceil(radius * 2.4)
  for (let y = centerY - extent; y <= centerY + extent; y += 1) {
    if (y < 0 || y >= HEIGHT) continue
    for (let x = centerX - extent; x <= centerX + extent; x += 1) {
      if (x < 0 || x >= WIDTH) continue
      const distanceSquared = (x - centerX) ** 2 + (y - centerY) ** 2
      const alpha = Math.exp(-distanceSquared / (2 * radius ** 2)) * strength
      if (alpha < 0.012) continue
      blendAdd(frame, x, y, color, alpha)
    }
  }
}

function addHorizontalDash(frame, centerX, y, radius, color, strength) {
  for (let x = centerX - radius; x <= centerX + radius; x += 1) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) continue
    const edge = 1 - Math.abs(x - centerX) / (radius + 1)
    blendAdd(frame, x, y, color, strength * edge)
  }
}

function blendAdd(frame, x, y, color, alpha) {
  const offset = (y * WIDTH + x) * CHANNELS
  frame[offset] = clampByte(frame[offset] + color[0] * alpha)
  frame[offset + 1] = clampByte(frame[offset + 1] + color[1] * alpha)
  frame[offset + 2] = clampByte(frame[offset + 2] + color[2] * alpha)
}

async function writeFrame(frame, directory, filename) {
  await sharp(frame, { raw: { width: WIDTH, height: HEIGHT, channels: CHANNELS } })
    .webp({ quality: 78, effort: 4, smartSubsample: true })
    .toFile(path.join(directory, filename))
}

async function writeAnimation(frames, output, delay, loop) {
  const stacked = Buffer.concat(frames)
  await sharp(stacked, {
    raw: {
      width: WIDTH,
      height: HEIGHT * frames.length,
      channels: CHANNELS,
      pageHeight: HEIGHT,
    },
  })
    .webp({
      quality: 80,
      effort: 6,
      smartSubsample: true,
      delay: Array(frames.length).fill(delay),
      loop,
      minSize: true,
    })
    .toFile(output)
}

function mix(a, b, amount) {
  return a + (b - a) * amount
}

function smoothstep(edge0, edge1, value) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return amount * amount * (3 - 2 * amount)
}

function smootherstep(edge0, edge1, value) {
  const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return amount ** 3 * (amount * (amount * 6 - 15) + 10)
}

function circularDistance(a, b, length) {
  const direct = Math.abs(a - b)
  return Math.min(direct, length - direct)
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function clampByte(value) {
  return clamp(Math.round(value), 0, 255)
}

function pad(value) {
  return String(value).padStart(3, "0")
}
