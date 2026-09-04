<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

/*
 * SATU SUMBER TEMPLATE
 * Halaman pilihan template memakai app/data/templates.ts.
 * Result juga memakai file yang sama.
 */
const templateId = Number(route.query.template || 1)

const template = templates.find(t => t.id === templateId) || templates[0]

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const errorMessage = ref('')

const canvas = ref<HTMLCanvasElement | null>(null)

const W = 1200
const H = 2000

const style = String(template.style || 'minimal')

const c1 = template.colors?.[0] || '#f8fafc'
const c2 = template.colors?.[1] || '#e2e8f0'

/* ---------------------------------------------------------
   BASIC DRAW HELPERS
--------------------------------------------------------- */

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Foto gagal dimuat'))
    img.src = src
  })

const roundedPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

const fillRounded = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string
) => {
  ctx.save()
  roundedPath(ctx, x, y, w, h, r)
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

const strokeRounded = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
  lineWidth = 3
) => {
  ctx.save()
  roundedPath(ctx, x, y, w, h, r)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
  ctx.restore()
}

const text = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = '700',
  font = 'Arial',
  align: CanvasTextAlign = 'center'
) => {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${font}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x, y)
  ctx.restore()
}

const background = (
  ctx: CanvasRenderingContext2D,
  colors = [c1, c2]
) => {
  const gradient = ctx.createLinearGradient(0, 0, W, H)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)
}

const shadow = (
  ctx: CanvasRenderingContext2D,
  blur = 22,
  offset = 8
) => {
  ctx.shadowColor = 'rgba(0,0,0,.16)'
  ctx.shadowBlur = blur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = offset
}

const noShadow = (ctx: CanvasRenderingContext2D) => {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

/*
 * PENTING:
 * Foto TIDAK di-crop.
 * Seluruh foto selalu dipertahankan.
 * Jika rasio foto berbeda dengan frame, area kosong
 * akan memakai background frame.
 */
const drawContain = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0,
  bg = '#f4f4f5'
) => {
  ctx.save()

  if (radius > 0) {
    roundedPath(ctx, x, y, w, h, radius)
    ctx.clip()
  }

  ctx.fillStyle = bg
  ctx.fillRect(x, y, w, h)

  const ir = img.width / img.height
  const br = w / h

  let dw = w
  let dh = h

  if (ir > br) {
    dw = w
    dh = w / ir
  } else {
    dh = h
    dw = h * ir
  }

  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2

  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

const frame = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  options: {
    radius?: number
    border?: string
    borderWidth?: number
    bg?: string
    padding?: number
  } = {}
) => {
  const radius = options.radius ?? 24
  const padding = options.padding ?? 14
  const border = options.border ?? '#ffffff'
  const borderWidth = options.borderWidth ?? 0
  const bg = options.bg ?? '#f4f4f5'

  ctx.save()
  shadow(ctx)

  fillRounded(
    ctx,
    x - padding,
    y - padding,
    w + padding * 2,
    h + padding * 2,
    radius + padding / 2,
    '#ffffff'
  )

  noShadow(ctx)

  if (borderWidth > 0) {
    strokeRounded(
      ctx,
      x - padding,
      y - padding,
      w + padding * 2,
      h + padding * 2,
      radius + padding / 2,
      border,
      borderWidth
    )
  }

  drawContain(ctx, img, x, y, w, h, radius, bg)
  ctx.restore()
}

const heart = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  filled = false
) => {
  text(ctx, filled ? '♥' : '♡', x, y, size, color, '400')
}

const stars = (
  ctx: CanvasRenderingContext2D,
  color: string
) => {
  text(ctx, '✦', 110, 110, 28, color)
  text(ctx, '✦', 1090, 150, 20, color)
  text(ctx, '✦', 1050, 1840, 24, color)
  text(ctx, '✦', 150, 1880, 18, color)
}

/* ---------------------------------------------------------
   LAYOUTS
--------------------------------------------------------- */

const layoutVertical = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  title = template.name,
  accent = '#9d174d'
) => {
  background(ctx)

  stars(ctx, accent)

  text(ctx, title, 600, 90, 62, accent, '700', 'Georgia')
  text(ctx, 'captured moments', 600, 145, 23, accent, '400')

  const x = 225
  const y0 = 210
  const photoW = 750
  const photoH = 385

  images.forEach((img, i) => {
    const y = y0 + i * 425

    frame(ctx, img, x, y, photoW, photoH, {
      radius: 24,
      padding: 12,
      bg: '#fffafa'
    })

    text(ctx, String(i + 1).padStart(2, '0'), 600, y + photoH + 34, 18, accent)
  })

  heart(ctx, 600, 1900, 58, accent)
  text(ctx, '♡ memories ♡', 600, 1950, 19, accent, '400', 'Georgia')
}

const layoutFilm = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  ctx.fillStyle = '#101012'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#18181b'
  ctx.fillRect(75, 45, 1050, 1910)

  text(ctx, template.name.toUpperCase(), 600, 105, 46, '#ffffff', '700', 'Georgia')
  text(ctx, 'ROLL • FRAME • MEMORY', 600, 150, 17, '#d4d4d8', '400')

  const x = 265
  const photoW = 670
  const photoH = 365
  const y0 = 210

  images.forEach((img, i) => {
    const y = y0 + i * 425

    /* film sprocket holes */
    for (let p = 0; p < 7; p++) {
      fillRounded(ctx, 105, y + p * 54, 32, 30, 5, '#fafafa')
      fillRounded(ctx, 1063, y + p * 54, 32, 30, 5, '#fafafa')
    }

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x - 13, y - 13, photoW + 26, photoH + 26)

    drawContain(ctx, img, x, y, photoW, photoH, 0, '#eeeeee')

    text(ctx, `FRAME ${i + 1}`, 600, y + photoH + 31, 15, '#111111')
  })

  text(ctx, template.name.toUpperCase(), 600, 1930, 18, '#ffffff', '700')
}

const layoutGrid = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  accent = '#57534e'
) => {
  background(ctx)

  text(ctx, template.name, 600, 90, 55, accent, '700', 'Georgia')
  text(ctx, template.category.toUpperCase(), 600, 140, 16, accent, '700')
  text(ctx, 'FOUR MOMENTS', 600, 172, 18, accent, '400')

  const positions = [
    [115, 235],
    [635, 235],
    [115, 1030],
    [635, 1030]
  ]

  const pw = 430
  const ph = 650

  images.forEach((img, i) => {
    const [x, y] = positions[i]

    frame(ctx, img, x, y, pw, ph, {
      radius: 26,
      padding: 12,
      bg: '#fafaf9'
    })

    text(ctx, String(i + 1).padStart(2, '0'), x + pw / 2, y + ph + 35, 17, accent)
  })

  text(ctx, 'MEMORIES', 600, 1855, 23, accent, '700', 'Georgia')
}

const layoutPolaroid = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#f6f0e8', '#e7d8c7'])

  text(ctx, 'POLAROID', 600, 90, 58, '#57534e', '700', 'Georgia')
  text(ctx, 'little pieces of today', 600, 140, 20, '#78716c', '400', 'Georgia')

  const cards = [
    { x: 115, y: 235, r: -2 },
    { x: 665, y: 235, r: 2 },
    { x: 390, y: 1040, r: -1 }
  ]

  images.slice(0, 3).forEach((img, i) => {
    const card = cards[i]

    ctx.save()
    ctx.translate(card.x + 205, card.y + 270)
    ctx.rotate(card.r * Math.PI / 180)

    shadow(ctx, 20, 8)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-220, -270, 440, 610)
    noShadow(ctx)

    drawContain(ctx, img, -195, -245, 390, 490, 0, '#eeeeee')

    text(ctx, `memory ${i + 1}`, 0, 285, 20, '#57534e', '400', 'cursive')
    ctx.restore()
  })

  heart(ctx, 600, 1835, 55, '#a8a29e')
}

const layoutEditorial = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fafaf9', '#e7e5e4'])

  text(ctx, 'THE', 600, 70, 18, '#78716c', '700')
  text(ctx, template.name.toUpperCase(), 600, 125, 64, '#1c1917', '700', 'Georgia')
  text(ctx, 'SPECIAL MEMORY EDITION', 600, 175, 17, '#78716c', '400')

  if (images[0]) {
    frame(ctx, images[0], 90, 235, 1020, 570, {
      radius: 20,
      padding: 10,
      bg: '#e7e5e4'
    })
  }

  if (images[1]) {
    frame(ctx, images[1], 90, 900, 485, 500, {
      radius: 18,
      padding: 10,
      bg: '#e7e5e4'
    })
  }

  if (images[2]) {
    frame(ctx, images[2], 625, 900, 485, 500, {
      radius: 18,
      padding: 10,
      bg: '#e7e5e4'
    })
  }

  if (images[3]) {
    frame(ctx, images[3], 90, 1490, 1020, 330, {
      radius: 18,
      padding: 10,
      bg: '#e7e5e4'
    })
  }

  text(ctx, 'ISSUE 01', 600, 1900, 17, '#78716c', '700')
}

const layoutScrapbook = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fffaf0', '#ffe4e6'])

  text(ctx, template.name, 600, 100, 65, '#be185d', '700', 'cursive')
  text(ctx, '♡ keep this forever ♡', 600, 150, 22, '#9d174d', '400', 'cursive')

  const positions = [
    [120, 240, -3],
    [650, 240, 3],
    [120, 1010, 3],
    [650, 1010, -3]
  ]

  images.forEach((img, i) => {
    const [x, y, rot] = positions[i]

    ctx.save()
    ctx.translate(x + 210, y + 270)
    ctx.rotate(rot * Math.PI / 180)

    shadow(ctx, 20, 10)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-220, -270, 440, 610)
    noShadow(ctx)

    drawContain(ctx, img, -200, -245, 400, 490, 0, '#f8fafc')
    heart(ctx, 0, 285, 38, '#ec4899')

    ctx.restore()
  })

  text(ctx, 'OUR DAY', 600, 1860, 30, '#be185d', '700', 'cursive')
}

const layoutMagazine = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, W, H)

  text(ctx, 'SPECIAL EDITION', 600, 80, 18, '#ffffff', '700')
  text(ctx, template.name.toUpperCase(), 600, 145, 70, '#ffffff', '700', 'Georgia')

  if (images[0]) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(85, 225, 1030, 650)
    drawContain(ctx, images[0], 105, 245, 990, 610, 0, '#27272a')
  }

  if (images[1]) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(85, 935, 500, 520)
    drawContain(ctx, images[1], 105, 955, 460, 480, 0, '#27272a')
    text(ctx, '01', 335, 1485, 20, '#ffffff')
  }

  if (images[2]) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(615, 935, 500, 520)
    drawContain(ctx, images[2], 635, 955, 460, 480, 0, '#27272a')
    text(ctx, '02', 865, 1485, 20, '#ffffff')
  }

  if (images[3]) {
    frame(ctx, images[3], 315, 1540, 570, 330, {
      radius: 0,
      padding: 8,
      bg: '#27272a'
    })
  }

  text(ctx, 'VIBE • 2026', 600, 1940, 18, '#ffffff', '700')
}

const layoutRetro = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fef3c7', '#f3d3a3'])

  text(ctx, 'RETRO CAMERA', 600, 95, 54, '#78350f', '700', 'Georgia')
  text(ctx, 'GOOD TIMES ONLY', 600, 145, 20, '#92400e', '700')

  const positions = [
    [110, 225],
    [650, 225],
    [110, 1010],
    [650, 1010]
  ]

  images.forEach((img, i) => {
    const [x, y] = positions[i]

    fillRounded(ctx, x - 12, y - 12, 480 + 24, 620 + 24, 22, '#fff7ed')
    drawContain(ctx, img, x, y, 480, 620, 14, '#fef3c7')

    text(ctx, `GOOD TIMES ${i + 1}`, x + 240, y + 662, 16, '#78350f', '700', 'Georgia')
  })

  text(ctx, 'EST. 2026', 600, 1900, 20, '#78350f', '700')
}

const layoutMinimal = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#ffffff', '#f4f4f5'])

  text(ctx, template.name.toUpperCase(), 600, 95, 46, '#18181b', '400', 'Arial')
  text(ctx, 'SIMPLE & TIMELESS', 600, 140, 16, '#71717a', '700')

  const positions = [
    [110, 225],
    [630, 225],
    [110, 1000],
    [630, 1000]
  ]

  images.forEach((img, i) => {
    const [x, y] = positions[i]

    drawContain(ctx, img, x, y, 460, 620, 4, '#f4f4f5')
    ctx.fillStyle = '#18181b'
    ctx.fillRect(x, y + 620, 460, 4)

    text(ctx, String(i + 1).padStart(2, '0'), x + 230, y + 665, 14, '#71717a', '700')
  })

  text(ctx, 'PHOTOBOOTH / 2026', 600, 1900, 17, '#71717a', '700')
}

const layoutCute = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  accent = '#db2777'
) => {
  background(ctx, ['#fff0f6', '#fbcfe8'])

  stars(ctx, accent)

  text(ctx, template.name, 600, 100, 62, accent, '700', 'cursive')
  text(ctx, '♡ smile today ♡', 600, 150, 22, '#9d174d', '400', 'cursive')

  const positions = [
    [120, 235],
    [650, 235],
    [120, 1010],
    [650, 1010]
  ]

  images.forEach((img, i) => {
    const [x, y] = positions[i]

    frame(ctx, img, x, y, 430, 620, {
      radius: 42,
      padding: 12,
      bg: '#fff7fb'
    })

    heart(ctx, x + 215, y + 665, 35, accent)
  })

  heart(ctx, 600, 1880, 58, accent)
}

const layoutDark = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  accent = '#d4af37'
) => {
  ctx.fillStyle = '#111113'
  ctx.fillRect(0, 0, W, H)

  text(ctx, 'PRIVATE MOMENTS', 600, 85, 17, accent, '700')
  text(ctx, template.name.toUpperCase(), 600, 145, 62, '#ffffff', '700', 'Georgia')
  text(ctx, 'EST. 2026', 600, 190, 15, '#a1a1aa', '400')

  const positions = [
    [110, 260],
    [630, 260],
    [110, 1025],
    [630, 1025]
  ]

  images.forEach((img, i) => {
    drawContain(ctx, img, positions[i][0], positions[i][1], 460, 620, 3, '#27272a')
    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    ctx.strokeRect(positions[i][0], positions[i][1], 460, 620)
  })

  text(ctx, '✦', 600, 1900, 34, accent)
}

const layoutLuxury = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  ctx.fillStyle = '#0d0d0f'
  ctx.fillRect(0, 0, W, H)

  text(ctx, 'LUXURY', 600, 90, 56, '#d4af37', '700', 'Georgia')
  text(ctx, 'SPECIAL MOMENTS', 600, 140, 18, '#e7e5e4', '700')

  const positions = [
    [105, 235],
    [635, 235],
    [105, 1010],
    [635, 1010]
  ]

  images.forEach((img, i) => {
    drawContain(ctx, img, positions[i][0], positions[i][1], 460, 620, 0, '#18181b')
    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 5
    ctx.strokeRect(positions[i][0] - 4, positions[i][1] - 4, 468, 628)
    heart(ctx, positions[i][0] + 230, positions[i][1] + 660, 25, '#d4af37')
  })

  text(ctx, 'PRIVATE COLLECTION', 600, 1900, 17, '#d4af37', '700')
}

const layoutBlue = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#dbeafe', '#93c5fd'])

  text(ctx, template.name.toUpperCase(), 600, 90, 52, '#1e3a8a', '700', 'Georgia')
  text(ctx, 'GOOD VIBES', 600, 140, 28, '#1d4ed8', '700')

  const positions = [
    [110, 235],
    [630, 235],
    [110, 1010],
    [630, 1010]
  ]

  images.forEach((img, i) => {
    frame(ctx, img, positions[i][0], positions[i][1], 460, 620, {
      radius: 28,
      padding: 10,
      bg: '#eff6ff'
    })
    text(ctx, '✦', positions[i][0] + 230, positions[i][1] + 665, 25, '#1d4ed8')
  })

  text(ctx, 'GOOD VIBES ONLY', 600, 1900, 18, '#1e3a8a', '700')
}

const layoutY2K = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fae8ff', '#c4b5fd'])

  text(ctx, 'Y2K', 600, 95, 78, '#86198f', '900', 'Arial')
  text(ctx, template.name.toUpperCase(), 600, 150, 24, '#a21caf', '700')

  const positions = [
    [110, 235],
    [630, 235],
    [110, 1010],
    [630, 1010]
  ]

  images.forEach((img, i) => {
    fillRounded(ctx, positions[i][0] - 8, positions[i][1] - 8, 476, 636, 38, '#ffffff')
    drawContain(ctx, img, positions[i][0], positions[i][1], 460, 620, 30, '#fdf4ff')
    text(ctx, i % 2 ? '★' : '☆', positions[i][0] + 230, positions[i][1] + 665, 30, '#c026d3')
  })

  text(ctx, 'DIGITAL LOVE / 2000', 600, 1900, 18, '#86198f', '700')
}

const layoutBear = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fff7ed', '#fde68a'])

  text(ctx, 'ʕ•ᴥ•ʔ', 600, 85, 42, '#92400e', '700')
  text(ctx, template.name, 600, 140, 56, '#78350f', '700', 'Georgia')
  text(ctx, 'sweet little memories', 600, 185, 20, '#92400e', '400', 'cursive')

  const positions = [
    [110, 260],
    [630, 260],
    [110, 1025],
    [630, 1025]
  ]

  images.forEach((img, i) => {
    frame(ctx, img, positions[i][0], positions[i][1], 460, 620, {
      radius: 34,
      padding: 12,
      bg: '#fffbeb'
    })
    text(ctx, '♡', positions[i][0] + 230, positions[i][1] + 665, 30, '#b45309')
  })

  text(ctx, 'KEEP THIS FOREVER', 600, 1900, 17, '#92400e', '700')
}

const layoutFriends = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#dbeafe', '#bfdbfe'])

  text(ctx, 'BEST FRIENDS', 600, 95, 58, '#1d4ed8', '700', 'Georgia')
  text(ctx, 'same energy • same memories', 600, 145, 20, '#2563eb', '400')

  const x = 170
  const pw = 860
  const ph = 365

  images.forEach((img, i) => {
    const y = 215 + i * 425

    frame(ctx, img, x, y, pw, ph, {
      radius: 28,
      padding: 12,
      bg: '#eff6ff'
    })

    text(ctx, `BESTIE ${i + 1}`, 600, y + ph + 34, 17, '#1e40af', '700')
  })

  text(ctx, 'FOREVER CREW', 600, 1910, 20, '#1d4ed8', '700')
}

const layoutWedding = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fffdf8', '#e7e5e4'])

  text(ctx, 'FOREVER', 600, 90, 22, '#78716c', '700', 'Georgia')
  text(ctx, 'WEDDING', 600, 145, 70, '#44403c', '700', 'Georgia')
  text(ctx, 'a beautiful day to remember', 600, 195, 19, '#78716c', '400', 'Georgia')

  if (images[0]) {
    frame(ctx, images[0], 95, 250, 1010, 520, {
      radius: 18,
      padding: 10,
      bg: '#fafaf9'
    })
  }

  if (images[1]) {
    frame(ctx, images[1], 95, 850, 490, 620, {
      radius: 18,
      padding: 10,
      bg: '#fafaf9'
    })
  }

  if (images[2]) {
    frame(ctx, images[2], 615, 850, 490, 620, {
      radius: 18,
      padding: 10,
      bg: '#fafaf9'
    })
  }

  if (images[3]) {
    frame(ctx, images[3], 285, 1540, 630, 300, {
      radius: 18,
      padding: 10,
      bg: '#fafaf9'
    })
  }

  heart(ctx, 600, 1910, 46, '#a8a29e')
}

const layoutLoveLetter = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fff7ed', '#fed7aa'])

  text(ctx, 'DEAR MEMORIES,', 600, 95, 52, '#9a3412', '700', 'Georgia')
  text(ctx, 'with love', 600, 145, 26, '#c2410c', '400', 'cursive')

  const x = 215
  const pw = 770
  const ph = 365

  images.forEach((img, i) => {
    const y = 215 + i * 425

    frame(ctx, img, x, y, pw, ph, {
      radius: 12,
      padding: 12,
      bg: '#fff7ed'
    })

    text(ctx, `♡ ${i + 1} ♡`, 600, y + ph + 34, 17, '#c2410c', '700')
  })

  text(ctx, 'always yours', 600, 1910, 25, '#9a3412', '400', 'cursive')
}

const layoutRed = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fee2e2', '#fecaca'])

  text(ctx, 'RED ROMANCE', 600, 95, 58, '#991b1b', '700', 'Georgia')
  text(ctx, 'love looks good on us', 600, 145, 21, '#b91c1c', '400')

  const x = 205
  const pw = 790
  const ph = 370

  images.forEach((img, i) => {
    const y = 215 + i * 425

    frame(ctx, img, x, y, pw, ph, {
      radius: 30,
      padding: 12,
      bg: '#fff5f5'
    })

    heart(ctx, 600, y + ph + 34, 22, '#b91c1c', true)
  })

  text(ctx, 'LOVE • ALWAYS', 600, 1910, 18, '#991b1b', '700')
}

const layoutDiary = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fce7f3', '#f9a8d4'])

  text(ctx, 'PINK DIARY', 600, 95, 60, '#9d174d', '700', 'Georgia')
  text(ctx, 'dear diary, today was beautiful', 600, 145, 19, '#be185d', '400', 'cursive')

  const x = 220
  const pw = 760
  const ph = 370

  images.forEach((img, i) => {
    const y = 215 + i * 425

    frame(ctx, img, x, y, pw, ph, {
      radius: 18,
      padding: 12,
      bg: '#fff1f6'
    })

    text(ctx, `DAY ${String(i + 1).padStart(2, '0')}`, 600, y + ph + 34, 16, '#9d174d', '700')
  })

  heart(ctx, 600, 1910, 58, '#db2777')
}

const layoutFlower = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fdf2f8', '#fbcfe8'])

  text(ctx, 'FLOWER DIARY', 600, 95, 57, '#be185d', '700', 'Georgia')
  text(ctx, 'bloom where you are', 600, 145, 22, '#db2777', '400', 'cursive')

  const x = 220
  const pw = 760
  const ph = 370

  images.forEach((img, i) => {
    const y = 215 + i * 425

    frame(ctx, img, x, y, pw, ph, {
      radius: 40,
      padding: 12,
      bg: '#fff7fb'
    })

    text(ctx, ['✿', '❀', '✽', '✿'][i], 600, y + ph + 34, 23, '#db2777')
  })

  text(ctx, '♡ BLOOM ♡', 600, 1910, 20, '#be185d', '700')
}

const layoutCoquette = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  background(ctx, ['#fff1f2', '#fecdd3'])

  text(ctx, 'COQUETTE', 600, 95, 62, '#9f1239', '700', 'Georgia')
  text(ctx, 'pretty little memories', 600, 145, 21, '#be123c', '400', 'cursive')

  const x = 225
  const pw = 750
  const ph = 380

  images.forEach((img, i) => {
    const y = 210 + i * 430

    frame(ctx, img, x, y, pw, ph, {
      radius: 46,
      padding: 12,
      bg: '#fff7f8'
    })

    heart(ctx, 600, y + ph + 35, 24, '#be123c')
  })

  text(ctx, '♡ ribbon & roses ♡', 600, 1910, 20, '#9f1239', '400', 'cursive')
}

/* ---------------------------------------------------------
   RENDER SELECTED STYLE
--------------------------------------------------------- */

const renderTemplate = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[]
) => {
  switch (style) {
    case 'love':
      layoutVertical(ctx, images, 'SWEET LOVE', '#9d174d')
      break

    case 'kawaii':
      layoutCute(ctx, images, '#db2777')
      break

    case 'film':
      layoutFilm(ctx, images)
      break

    case 'polaroid':
      layoutPolaroid(ctx, images)
      break

    case 'friends':
      layoutFriends(ctx, images)
      break

    case 'coquette':
      layoutCoquette(ctx, images)
      break

    case 'magazine':
      layoutMagazine(ctx, images)
      break

    case 'luxury':
      layoutLuxury(ctx, images)
      break

    case 'blue':
    case 'ocean':
      layoutBlue(ctx, images)
      break

    case 'purple':
    case 'y2k':
      layoutY2K(ctx, images)
      break

    case 'retro':
      layoutRetro(ctx, images)
      break

    case 'minimal':
    case 'green':
      layoutMinimal(ctx, images)
      break

    case 'letter':
      layoutLoveLetter(ctx, images)
      break

    case 'bear':
      layoutBear(ctx, images)
      break

    case 'newspaper':
    case 'street':
    case 'wedding':
      layoutEditorial(ctx, images)
      break

    case 'red':
      layoutRed(ctx, images)
      break

    case 'diary':
      layoutDiary(ctx, images)
      break

    case 'flower':
      layoutFlower(ctx, images)
      break

    case 'vertical':
      layoutVertical(ctx, images, template.name, '#e11d48')
      break

    default:
      layoutGrid(ctx, images, '#52525b')
      break
  }
}

/* ---------------------------------------------------------
   GENERATE
--------------------------------------------------------- */

const generate = async () => {
  if (!canvas.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const savedPhotos = photos.value.slice(0, template.photos || 4)
    const images: HTMLImageElement[] = []

    for (const src of savedPhotos) {
      try {
        images.push(await loadImage(src))
      } catch (error) {
        console.error('Foto gagal dimuat:', error)
      }
    }

    if (!images.length) {
      throw new Error('Foto tidak ditemukan. Silakan foto ulang.')
    }

    canvas.value.width = W
    canvas.value.height = H

    const ctx = canvas.value.getContext('2d')
    if (!ctx) throw new Error('Canvas tidak tersedia')

    ctx.clearRect(0, 0, W, H)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    renderTemplate(ctx, images)

    resultUrl.value = canvas.value.toDataURL('image/jpeg', 0.96)
  } catch (error: any) {
    console.error(error)
    errorMessage.value = error?.message || 'Gagal membuat hasil foto.'
  } finally {
    loading.value = false
  }
}

/* ---------------------------------------------------------
   DOWNLOAD
--------------------------------------------------------- */

const download = async () => {
  if (!resultUrl.value) return

  const filename =
    `photobooth-${template.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`

  try {
    const response = await fetch(resultUrl.value)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
  } catch {
    /*
     * Safari/iOS dan beberapa browser HP lebih aman
     * membuka JPG di tab baru.
     */
    const win = window.open()
    if (win) {
      win.document.write(`
        <title>${template.name}</title>
        <style>
          html,body{margin:0;background:#111}
          img{display:block;width:100%;height:auto}
        </style>
        <img src="${resultUrl.value}" alt="Photobooth">
      `)
      win.document.close()
    } else {
      window.location.href = resultUrl.value
    }
  }
}

const retake = () => {
  localStorage.removeItem('photobooth_photos')
  navigateTo(`/camera?template=${template.id}`)
}

const home = () => {
  localStorage.removeItem('photobooth_photos')
  navigateTo('/')
}

onMounted(async () => {
  try {
    const saved = localStorage.getItem('photobooth_photos')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) photos.value = parsed
    }

    if (photos.value.length) {
      await generate()
    } else {
      loading.value = false
    }
  } catch {
    photos.value = []
    loading.value = false
  }
})
</script>

<template>
  <div class="page">

    <header class="header">
      <button class="home-btn" @click="home">
        ← <span>Home</span>
      </button>

      <div class="brand">
        📸 <span>Photobooth</span>
      </div>

      <div class="template-badge">
        {{ template.name }}
      </div>
    </header>

    <main class="main">

      <section class="heading">
        <div class="eyebrow">YOUR MEMORIES</div>
        <h1>{{ template.name }}</h1>
        <p>
          {{ template.category }} · {{ template.photos }} photos
        </p>
      </section>

      <div v-if="loading" class="state-card">
        <div class="loader"></div>
        <h2>Membuat hasil foto...</h2>
        <p>Menyesuaikan foto dengan template pilihanmu.</p>
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <div class="state-icon">⚠️</div>
        <h2>Gagal membuat hasil</h2>
        <p>{{ errorMessage }}</p>
        <button class="primary-btn" @click="generate">
          Coba Lagi
        </button>
      </div>

      <section v-else-if="resultUrl" class="result-section">
        <div class="result-card">
          <img
            :src="resultUrl"
            alt="Hasil Photobooth"
            class="result-image"
          />
        </div>

        <div class="actions">
          <button class="download-btn" @click="download">
            <span>↓</span>
            Download JPG
          </button>

          <button class="retake-btn" @click="retake">
            📸 Foto Lagi
          </button>
        </div>

        <div class="result-info">
          <div class="check">✓</div>
          <div>
            <strong>Foto berhasil dibuat</strong>
            <span>Semua foto disusun mengikuti template yang dipilih.</span>
          </div>
        </div>
      </section>

      <section v-else class="state-card">
        <div class="state-icon">📷</div>
        <h2>Belum ada foto</h2>
        <p>Ambil foto terlebih dahulu.</p>
        <button class="primary-btn" @click="retake">
          Ambil Foto
        </button>
      </section>

    </main>

    <canvas ref="canvas" class="hidden-canvas" />
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  color: #18181b;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;
  background:
    radial-gradient(circle at top left, #fdf2f8, transparent 35%),
    radial-gradient(circle at bottom right, #ede9fe, transparent 35%),
    #fafafa;
}

.header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 72px;
  padding: 0 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,.94);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(0,0,0,.06);
}

.home-btn {
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #52525b;
  font-weight: 800;
  cursor: pointer;
}

.home-btn:hover {
  color: #7c3aed;
}

.brand {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 20px;
  font-weight: 900;
  color: #7c3aed;
}

.template-badge {
  padding: 8px 14px;
  border-radius: 999px;
  background: #f5f3ff;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 800;
}

.main {
  width: min(94%, 820px);
  margin: auto;
  padding: 48px 0 90px;
}

.heading {
  text-align: center;
  margin-bottom: 30px;
}

.eyebrow {
  color: #7c3aed;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 4px;
  margin-bottom: 10px;
}

.heading h1 {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(32px, 6vw, 52px);
  line-height: 1.05;
}

.heading p {
  margin: 12px 0 0;
  color: #71717a;
  font-size: 14px;
}

.result-card {
  width: min(100%, 620px);
  margin: auto;
  padding: 10px;
  background: #fff;
  border-radius: 26px;
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 30px 80px rgba(0,0,0,.15);
}

.result-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 18px;
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 24px;
}

.actions button {
  min-height: 56px;
  border: 0;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
}

.download-btn {
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  box-shadow: 0 12px 30px rgba(124,58,237,.22);
}

.download-btn span {
  font-size: 21px;
  margin-right: 7px;
}

.retake-btn {
  color: #3f3f46;
  background: #fff;
  border: 1px solid #e4e4e7 !important;
}

.result-info {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: #71717a;
}

.result-info > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.result-info strong {
  color: #3f3f46;
  font-size: 13px;
}

.result-info span {
  font-size: 12px;
}

.check {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #dcfce7;
  color: #16a34a;
  font-weight: 900;
}

.state-card {
  padding: 75px 25px;
  text-align: center;
  background: #fff;
  border-radius: 26px;
  box-shadow: 0 20px 60px rgba(0,0,0,.08);
}

.state-card h2 {
  margin: 0 0 8px;
}

.state-card p {
  margin: 0 0 25px;
  color: #71717a;
}

.state-icon {
  font-size: 52px;
  margin-bottom: 18px;
}

.primary-btn {
  border: 0;
  padding: 14px 24px;
  border-radius: 14px;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.error {
  border: 1px solid #fecaca;
}

.loader {
  width: 42px;
  height: 42px;
  margin: 0 auto 20px;
  border: 4px solid #ede9fe;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

.hidden-canvas {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 600px) {
  .header {
    height: 66px;
    padding: 0 16px;
  }

  .brand {
    font-size: 17px;
  }

  .template-badge {
    display: none;
  }

  .main {
    width: 94%;
    padding: 30px 0 60px;
  }

  .heading {
    margin-bottom: 22px;
  }

  .heading h1 {
    font-size: 32px;
  }

  .result-card {
    padding: 7px;
    border-radius: 20px;
  }

  .result-image {
    border-radius: 14px;
  }

  .actions {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .actions button {
    width: 100%;
  }

  .result-info {
    justify-content: flex-start;
    text-align: left;
    padding: 0 5px;
  }
}
</style>
