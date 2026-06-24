import { useMusicStore } from "@/stores/main";

type RGB = { r: number; g: number; b: number }
type HSL = { h: number; s: number; l: number }

type TonalScale = {
  0: string
  10: string
  20: string
  30: string
  40: string
  50: string
  60: string
  70: string
  80: string
  90: string
  95: string
  98: string
  99: string
  100: string
}

type MaterialPalette = {
  primary: TonalScale
  secondary: TonalScale
  tertiary: TonalScale
  neutral: TonalScale
  neutralVariant: TonalScale
}

/* ============================= */
/* ========= UTILITIES ========= */
/* ============================= */

function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s, l }
}

function hslToRgb({ h, s, l }: HSL): RGB {
  h /= 360

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

/* ============================= */
/* ===== IMAGE EXTRACTION ===== */
/* ============================= */

function extractPixels(image: HTMLImageElement | ImageData): RGB[] {
  let data: Uint8ClampedArray

  if (image instanceof ImageData) {
    data = image.data
  } else {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 64
    canvas.height = 64
    ctx.drawImage(image, 0, 0, 64, 64)
    data = ctx.getImageData(0, 0, 64, 64).data
  }

  const pixels: RGB[] = []
  for (let i = 0; i + 2 < data.length; i += 4) {
    pixels.push({ r: data[i]!, g: data[i + 1]!, b: data[i + 2]! })
  }
  return pixels
}

/* ============================= */
/* ===== SIMPLE K-MEANS ======= */
/* ============================= */

function kMeans(pixels: RGB[], k = 5): RGB[] {
  const centroids = pixels.slice(0, k)

  for (let iter = 0; iter < 5; iter++) {
    const clusters: RGB[][] = Array.from({ length: k }, () => [])

    for (const p of pixels) {
      let minDist = Infinity
      let index = 0
      centroids.forEach((c, i) => {
        const dist = (p.r - c.r) ** 2 + (p.g - c.g) ** 2 + (p.b - c.b) ** 2
        if (dist < minDist) {
          minDist = dist
          index = i
        }
      })
      const cluster = clusters[index]
      if (cluster) {
        cluster.push(p)
      }
    }

    centroids.forEach((_, i) => {
      const cluster = clusters[i]
      if (!cluster || !cluster.length) return
      const avg = cluster.reduce(
        (acc, p) => ({
          r: acc.r + p.r,
          g: acc.g + p.g,
          b: acc.b + p.b,
        }),
        { r: 0, g: 0, b: 0 },
      )
      centroids[i] = {
        r: avg.r / cluster.length,
        g: avg.g / cluster.length,
        b: avg.b / cluster.length,
      }
    })
  }

  return centroids
}

/* ============================= */
/* ===== TONAL PALETTE ======== */
/* ============================= */

function generateTonalScale(h: number, s: number): TonalScale {
  const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100]

  const scale: any = {}
  tones.forEach((tone) => {
    const l = tone / 100
    scale[tone] = rgbToHex(hslToRgb({ h, s, l }))
  })

  return scale
}

/* ============================= */
/* ===== MAIN FUNCTION ======== */
/* ============================= */

export async function generateMaterialYouPalette(
  image?: HTMLImageElement | ImageData | null,
): Promise<MaterialPalette> {
  let baseHue: number
  let baseSat: number

  if (!image) {
    // random expressive fallback
    baseHue = Math.random() * 360
    baseSat = 0.6 + Math.random() * 0.3
    console.log('random', image)
  } else {
    const pixels = extractPixels(image)
    const clusters = kMeans(pixels, 5)
    const dominant = clusters[0]
    if (!dominant) throw new Error('No cluster')
    const hsl = rgbToHsl(dominant)
    baseHue = hsl.h
    baseSat = Math.max(0.4, hsl.s)
  }

  return {
    primary: generateTonalScale(baseHue, baseSat),
    secondary: generateTonalScale((baseHue + 30) % 360, baseSat * 0.6),
    tertiary: generateTonalScale((baseHue + 60) % 360, baseSat * 0.7),
    neutral: generateTonalScale(baseHue, 0.08),
    neutralVariant: generateTonalScale(baseHue, 0.16),
  }
}

// background neutral 99 surface neutral 98 primary primary 40 onPrimary primary 100 secondary secondary 40 tertiary tertiary 40 outline neutralVariant 50 text primary neutral 10 text secondary neutralVariant 30 🌙 В Dark Theme Роль Тон background neutral 10 surface neutral 20 primary primary 80 onPrimary primary 20 secondary secondary 80 tertiary tertiary 80 outline neutralVariant 60 text primary neutral 90

export function setTheme(
  theme: 'light' | 'dark',
  image?: HTMLImageElement | ImageData | null,
): void {
  generateMaterialYouPalette(image).then((palette) => {
    const root = document.documentElement
    const colors =
      theme === 'light'
        ? {
            background: palette.neutral[99],
            surface: palette.neutral[98],
            primary: palette.primary[40],
            onPrimary: palette.primary[100],
            secondary: palette.secondary[40],
            tertiary: palette.tertiary[40],
            outline: palette.neutralVariant[50],
            textPrimary: palette.primary[10],
            textSecondary: palette.neutralVariant[30],
          }
        : {
            background: palette.neutral[10],
            surface: palette.neutral[20],
            primary: palette.primary[80],
            onPrimary: palette.primary[20],
            secondary: palette.secondary[80],
            tertiary: palette.tertiary[80],
            outline: palette.neutralVariant[60],
            textPrimary: palette.neutral[90],
            textSecondary: palette.neutralVariant[30],
          }
    root.style.setProperty('--background-color', colors.background)
    root.style.setProperty('--surface-color', colors.surface)
    root.style.setProperty('--primary-color', colors.primary)
    root.style.setProperty('--on-primary-color', colors.onPrimary)
    root.style.setProperty('--secondary-color', colors.secondary)
    root.style.setProperty('--triary-color', colors.tertiary)
    root.style.setProperty('--outline-color', colors.outline)
    root.style.setProperty('--text-primary-color', colors.textPrimary)
    root.style.setProperty('--text-secondary-color', colors.textSecondary)

    const musicPlayer = useMusicStore()
    musicPlayer.colors = colors
  })
}
