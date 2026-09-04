<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

/* =========================================================
   TEMPLATE
========================================================= */

const templateId = Number(route.query.template || 1)

const template =
  templates.find((t: any) => Number(t.id) === templateId) ||
  templates[0]

/* =========================================================
   STATE
========================================================= */

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const errorMessage = ref('')

const canvas = ref<HTMLCanvasElement | null>(null)

/* =========================================================
   SAFE TEMPLATE DATA
========================================================= */

const templateName = String(
  (template as any)?.name || 'Classic'
)

const templateTitle = String(
  (template as any)?.title || templateName
)

const templateSubtitle = String(
  (template as any)?.subtitle || 'Captured moments'
)

const templateLayout = String(
  (template as any)?.layout || 'classic'
)

const templateColors = Array.isArray(
  (template as any)?.colors
)
  ? (template as any).colors
  : ['#fce7f3', '#fbcfe8']

const color1 = templateColors[0] || '#fce7f3'
const color2 = templateColors[1] || '#fbcfe8'

/* =========================================================
   IMAGE LOADER
========================================================= */

const loadImage = (
  src: string
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat foto'))

    img.src = src
  })
}

/* =========================================================
   BACKGROUND GRADIENT
========================================================= */

const drawBackground = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  c1 = color1,
  c2 = color2
) => {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    w,
    h
  )

  gradient.addColorStop(0, c1)
  gradient.addColorStop(1, c2)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)
}

/* =========================================================
   ROUNDED RECT
========================================================= */

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) => {
  ctx.beginPath()
  ctx.roundRect(
    x,
    y,
    w,
    h,
    radius
  )
}

/* =========================================================
   TEXT
========================================================= */

const drawText = (
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
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${font}`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'

  ctx.fillText(
    value,
    x,
    y
  )
}

/* =========================================================
   FOTO - CONTAIN
   TIDAK MEMOTONG FOTO
========================================================= */

const drawPhotoContain = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0,
  backgroundColor = '#ffffff'
) => {
  const imageRatio =
    img.width / img.height

  const boxRatio =
    w / h

  let dw = w
  let dh = h

  if (imageRatio > boxRatio) {
    dw = w
    dh = w / imageRatio
  } else {
    dh = h
    dw = h * imageRatio
  }

  const dx =
    x + (w - dw) / 2

  const dy =
    y + (h - dh) / 2

  ctx.save()

  if (radius > 0) {
    roundedRect(
      ctx,
      x,
      y,
      w,
      h,
      radius
    )

    ctx.clip()
  }

  ctx.fillStyle =
    backgroundColor

  ctx.fillRect(
    x,
    y,
    w,
    h
  )

  ctx.drawImage(
    img,
    dx,
    dy,
    dw,
    dh
  )

  ctx.restore()
}

/* =========================================================
   FOTO - COVER
   DIGUNAKAN HANYA PADA TEMPLATE YANG MEMANG
   MEMBUTUHKAN FOTO FULL FRAME.
========================================================= */

const drawPhotoCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0
) => {
  const imageRatio =
    img.width / img.height

  const boxRatio =
    w / h

  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (imageRatio > boxRatio) {
    sw =
      img.height * boxRatio

    sx =
      (img.width - sw) / 2
  } else {
    sh =
      img.width / boxRatio

    /*
     * Fokus crop sedikit ke atas
     * agar wajah tidak hilang.
     */
    sy =
      Math.max(
        0,
        (img.height - sh) * 0.25
      )
  }

  ctx.save()

  if (radius > 0) {
    roundedRect(
      ctx,
      x,
      y,
      w,
      h,
      radius
    )

    ctx.clip()
  }

  ctx.drawImage(
    img,
    sx,
    sy,
    sw,
    sh,
    x,
    y,
    w,
    h
  )

  ctx.restore()
}

/* =========================================================
   SHADOW
========================================================= */

const shadow = (
  ctx: CanvasRenderingContext2D
) => {
  ctx.shadowColor =
    'rgba(0,0,0,0.15)'

  ctx.shadowBlur = 25
  ctx.shadowOffsetY = 10
}

/* =========================================================
   RESET SHADOW
========================================================= */

const resetShadow = (
  ctx: CanvasRenderingContext2D
) => {
  ctx.shadowColor =
    'transparent'

  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
}

/* =========================================================
   WHITE FRAME
========================================================= */

const drawFrame = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 24
) => {
  ctx.save()

  shadow(ctx)

  ctx.fillStyle =
    '#ffffff'

  roundedRect(
    ctx,
    x,
    y,
    w,
    h,
    radius
  )

  ctx.fill()

  resetShadow(ctx)

  ctx.restore()
}

/* =========================================================
   PHOTO NUMBER
========================================================= */

const photoNumber = (
  ctx: CanvasRenderingContext2D,
  number: number,
  x: number,
  y: number,
  color = '#7c3aed'
) => {
  drawText(
    ctx,
    String(number).padStart(2, '0'),
    x,
    y,
    20,
    color,
    '700',
    'Arial'
  )
}

/* =========================================================
   DECORATION HEART
========================================================= */

const heart = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
  ctx.save()

  ctx.fillStyle = color
  ctx.font = `${size}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillText(
    '♡',
    x,
    y
  )

  ctx.restore()
}

/* =========================================================
   STAR
========================================================= */

const star = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
  ctx.save()

  ctx.fillStyle = color
  ctx.font = `${size}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillText(
    '✦',
    x,
    y
  )

  ctx.restore()
}

/* =========================================================
   GENERATE
========================================================= */

const generate = async () => {
  if (!canvas.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const images: HTMLImageElement[] = []

    for (
      const photo of photos.value.slice(0, 4)
    ) {
      try {
        const image =
          await loadImage(photo)

        images.push(image)
      } catch {
        console.warn(
          'Foto gagal dimuat'
        )
      }
    }

    if (!images.length) {
      loading.value = false
      return
    }

    const ctx =
      canvas.value.getContext('2d')

    if (!ctx) {
      throw new Error(
        'Canvas tidak tersedia'
      )
    }

    /*
     * RESOLUSI HASIL
     *
     * 1200 x 2200
     *
     * Cocok untuk HP dan JPG.
     */

    const W = 1200
    const H = 2200

    canvas.value.width = W
    canvas.value.height = H

    ctx.clearRect(
      0,
      0,
      W,
      H
    )

    /* =====================================================
       TEMPLATE 1
       KAWAII PINK - VERTICAL
    ===================================================== */

    if (
      templateLayout === 'vertical'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#fce7f3',
        '#f9a8d4'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        100,
        58,
        '#831843',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        155,
        24,
        '#9d174d',
        '400',
        'Arial'
      )

      const photoW = 600
      const photoH = 430

      const x =
        (W - photoW) / 2

      let y = 220

      images.forEach(
        (img, index) => {

          drawFrame(
            ctx,
            x - 18,
            y - 18,
            photoW + 36,
            photoH + 36,
            28
          )

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            18,
            '#f5f5f5'
          )

          photoNumber(
            ctx,
            index + 1,
            600,
            y + photoH + 45,
            '#9d174d'
          )

          y += 500
        }
      )

      heart(
        ctx,
        600,
        H - 80,
        60,
        '#db2777'
      )
    }

    /* =====================================================
       TEMPLATE 2
       FILM STRIP
    ===================================================== */

    else if (
      templateLayout === 'film'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#18181b',
        '#27272a'
      )

      ctx.fillStyle =
        '#09090b'

      ctx.fillRect(
        70,
        50,
        1060,
        2100
      )

      drawText(
        ctx,
        templateTitle,
        600,
        120,
        56,
        '#ffffff',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        175,
        22,
        '#d4d4d8'
      )

      const photoW = 520
      const photoH = 410

      const x =
        (W - photoW) / 2

      let y = 250

      images.forEach(
        (img, index) => {

          ctx.fillStyle =
            '#ffffff'

          ctx.fillRect(
            x - 18,
            y - 18,
            photoW + 36,
            photoH + 36
          )

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            0,
            '#e4e4e7'
          )

          drawText(
            ctx,
            `FRAME ${index + 1}`,
            600,
            y + photoH + 35,
            16,
            '#18181b',
            '700'
          )

          y += 475
        }
      )

      star(
        ctx,
        600,
        2110,
        40,
        '#ffffff'
      )
    }

    /* =====================================================
       TEMPLATE 3
       GRID 2x2
    ===================================================== */

    else if (
      templateLayout === 'grid'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#fafaf9',
        '#e7e5e4'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        110,
        58,
        '#292524',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        160,
        22,
        '#78716c'
      )

      const photoW = 450
      const photoH = 600

      const positions = [
        [110, 250],
        [640, 250],
        [110, 960],
        [640, 960]
      ]

      images.forEach(
        (img, index) => {

          const [x, y] =
            positions[index]

          drawFrame(
            ctx,
            x - 15,
            y - 15,
            photoW + 30,
            photoH + 30,
            24
          )

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            15,
            '#f5f5f4'
          )

          photoNumber(
            ctx,
            index + 1,
            x + photoW / 2,
            y + photoH + 42,
            '#57534e'
          )
        }
      )

      drawText(
        ctx,
        'MEMORIES',
        600,
        1690,
        20,
        '#78716c',
        '700',
        'Georgia'
      )
    }

    /* =====================================================
       TEMPLATE 4
       POLAROID
    ===================================================== */

    else if (
      templateLayout === 'polaroid'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#f5f5f4',
        '#d6d3d1'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        105,
        56,
        '#44403c',
        '700',
        'Georgia'
      )

      const photoW = 400
      const photoH = 500

      const positions = [
        [110, 240],
        [690, 240],
        [110, 940],
        [690, 940]
      ]

      images.forEach(
        (img, index) => {

          const [x, y] =
            positions[index]

          ctx.save()

          ctx.translate(
            x + 200,
            y + 250
          )

          ctx.rotate(
            (index % 2 === 0 ? -2 : 2) *
              Math.PI /
              180
          )

          ctx.fillStyle =
            '#ffffff'

          ctx.shadowColor =
            'rgba(0,0,0,.18)'

          ctx.shadowBlur = 20
          ctx.shadowOffsetY = 10

          ctx.fillRect(
            -220,
            -270,
            440,
            590
          )

          ctx.shadowColor =
            'transparent'

          drawPhotoContain(
            ctx,
            img,
            -200,
            -250,
            400,
            500,
            0,
            '#eeeeee'
          )

          drawText(
            ctx,
            `memory ${index + 1}`,
            0,
            285,
            18,
            '#57534e',
            '400',
            'cursive'
          )

          ctx.restore()
        }
      )

      heart(
        ctx,
        600,
        1770,
        60,
        '#78716c'
      )
    }

    /* =====================================================
       TEMPLATE 5
       EDITORIAL
    ===================================================== */

    else if (
      templateLayout === 'editorial'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#fafaf9',
        '#f5f5f4'
      )

      drawText(
        ctx,
        'THE',
        600,
        80,
        20,
        '#78716c',
        '700'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        145,
        76,
        '#1c1917',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        200,
        20,
        '#78716c',
        '400'
      )

      /* FOTO UTAMA */

      drawFrame(
        ctx,
        80,
        260,
        1040,
        690,
        25
      )

      drawPhotoContain(
        ctx,
        images[0],
        100,
        280,
        1000,
        650,
        15,
        '#e7e5e4'
      )

      /* FOTO 2 */

      if (images[1]) {
        drawFrame(
          ctx,
          80,
          1010,
          500,
          620,
          22
        )

        drawPhotoContain(
          ctx,
          images[1],
          100,
          1030,
          460,
          580,
          15,
          '#e7e5e4'
        )
      }

      /* FOTO 3 */

      if (images[2]) {
        drawFrame(
          ctx,
          620,
          1010,
          500,
          620,
          22
        )

        drawPhotoContain(
          ctx,
          images[2],
          640,
          1030,
          460,
          580,
          15,
          '#e7e5e4'
        )
      }

      /* FOTO 4 */

      if (images[3]) {
        drawFrame(
          ctx,
          80,
          1680,
          1040,
          350,
          22
        )

        drawPhotoContain(
          ctx,
          images[3],
          100,
          1700,
          1000,
          310,
          15,
          '#e7e5e4'
        )
      }
    }

    /* =====================================================
       TEMPLATE 6
       SCRAPBOOK
    ===================================================== */

    else if (
      templateLayout === 'scrapbook'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#fff7ed',
        '#fce7f3'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        110,
        64,
        '#be185d',
        '700',
        'cursive'
      )

      const positions = [
        [110, 240, -3],
        [690, 240, 3],
        [110, 960, 3],
        [690, 960, -3]
      ]

      const photoW = 400
      const photoH = 500

      images.forEach(
        (img, index) => {

          const [x, y, rotation] =
            positions[index]

          ctx.save()

          ctx.translate(
            x + 200,
            y + 250
          )

          ctx.rotate(
            rotation *
              Math.PI /
              180
          )

          ctx.fillStyle =
            '#ffffff'

          ctx.shadowColor =
            'rgba(0,0,0,.15)'

          ctx.shadowBlur = 20
          ctx.shadowOffsetY = 8

          ctx.fillRect(
            -220,
            -270,
            440,
            600
          )

          ctx.shadowColor =
            'transparent'

          drawPhotoContain(
            ctx,
            img,
            -200,
            -250,
            photoW,
            photoH,
            0,
            '#f3f4f6'
          )

          heart(
            ctx,
            0,
            290,
            40,
            '#ec4899'
          )

          ctx.restore()
        }
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        1810,
        30,
        '#be185d',
        '700',
        'cursive'
      )
    }

    /* =====================================================
       TEMPLATE 7
       MAGAZINE
    ===================================================== */

    else if (
      templateLayout === 'magazine'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#18181b',
        '#09090b'
      )

      drawText(
        ctx,
        'SPECIAL EDITION',
        600,
        90,
        22,
        '#ffffff',
        '700'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        165,
        78,
        '#ffffff',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        215,
        20,
        '#a1a1aa'
      )

      /* MAIN */

      drawFrame(
        ctx,
        80,
        280,
        1040,
        700,
        10
      )

      drawPhotoContain(
        ctx,
        images[0],
        100,
        300,
        1000,
        660,
        0,
        '#27272a'
      )

      /* SECOND */

      if (images[1]) {
        drawFrame(
          ctx,
          80,
          1040,
          500,
          620,
          10
        )

        drawPhotoContain(
          ctx,
          images[1],
          100,
          1060,
          460,
          580,
          0,
          '#27272a'
        )
      }

      /* THIRD */

      if (images[2]) {
        drawFrame(
          ctx,
          620,
          1040,
          500,
          620,
          10
        )

        drawPhotoContain(
          ctx,
          images[2],
          640,
          1060,
          460,
          580,
          0,
          '#27272a'
        )
      }

      if (images[3]) {
        drawPhotoContain(
          ctx,
          images[3],
          80,
          1740,
          1040,
          300,
          0,
          '#27272a'
        )
      }
    }

    /* =====================================================
       TEMPLATE 8
       RETRO
    ===================================================== */

    else if (
      templateLayout === 'retro'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#fef3c7',
        '#fde68a'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        115,
        68,
        '#7f1d1d',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        170,
        20,
        '#92400e'
      )

      const positions = [
        [100, 260],
        [630, 260],
        [100, 970],
        [630, 970]
      ]

      images.forEach(
        (img, index) => {

          const [x, y] =
            positions[index]

          ctx.fillStyle =
            '#fff7ed'

          ctx.fillRect(
            x,
            y,
            470,
            620
          )

          drawPhotoContain(
            ctx,
            img,
            x + 20,
            y + 20,
            430,
            540,
            0,
            '#f5f5f4'
          )

          drawText(
            ctx,
            'GOOD TIMES',
            x + 235,
            y + 585,
            17,
            '#7f1d1d',
            '700',
            'Georgia'
          )
        }
      )
    }

    /* =====================================================
       TEMPLATE 9
       MINIMAL
    ===================================================== */

    else if (
      templateLayout === 'minimal'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#ffffff',
        '#f4f4f5'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        100,
        52,
        '#18181b',
        '400',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        150,
        20,
        '#71717a',
        '400'
      )

      const photoW = 650
      const photoH = 400

      const x = 275

      let y = 230

      images.forEach(
        (img, index) => {

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            18,
            '#f4f4f5'
          )

          photoNumber(
            ctx,
            index + 1,
            600,
            y + photoH + 35,
            '#52525b'
          )

          y += 500
        }
      )

      drawText(
        ctx,
        'SIMPLE MOMENTS',
        600,
        2130,
        18,
        '#71717a',
        '400'
      )
    }

    /* =====================================================
       TEMPLATE 10
       CUTE
    ===================================================== */

    else if (
      templateLayout === 'cute'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#fdf2f8',
        '#fbcfe8'
      )

      heart(
        ctx,
        600,
        75,
        55,
        '#db2777'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        145,
        64,
        '#be185d',
        '700',
        'cursive'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        195,
        20,
        '#db2777'
      )

      const photoW = 440
      const photoH = 590

      const positions = [
        [100, 280],
        [660, 280],
        [100, 990],
        [660, 990]
      ]

      images.forEach(
        (img, index) => {

          const [x, y] =
            positions[index]

          drawFrame(
            ctx,
            x - 12,
            y - 12,
            photoW + 24,
            photoH + 24,
            35
          )

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            28,
            '#fdf2f8'
          )

          heart(
            ctx,
            x + photoW / 2,
            y + photoH + 38,
            30,
            '#ec4899'
          )
        }
      )
    }

    /* =====================================================
       TEMPLATE 11
       DARK
    ===================================================== */

    else if (
      templateLayout === 'dark'
    ) {
      drawBackground(
        ctx,
        W,
        H,
        '#09090b',
        '#18181b'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        110,
        68,
        '#ffffff',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        165,
        20,
        '#a1a1aa'
      )

      const photoW = 650
      const photoH = 390

      const x = 275

      let y = 230

      images.forEach(
        (img, index) => {

          ctx.fillStyle =
            '#27272a'

          roundedRect(
            ctx,
            x - 10,
            y - 10,
            photoW + 20,
            photoH + 20,
            20
          )

          ctx.fill()

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            14,
            '#27272a'
          )

          photoNumber(
            ctx,
            index + 1,
            600,
            y + photoH + 35,
            '#d4d4d8'
          )

          y += 490
        }
      )

      star(
        ctx,
        600,
        2130,
        40,
        '#ffffff'
      )
    }

    /* =====================================================
       TEMPLATE 12
       CLASSIC
    ===================================================== */

    else {
      drawBackground(
        ctx,
        W,
        H,
        '#f8fafc',
        '#e2e8f0'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        100,
        62,
        '#18181b',
        '700',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        155,
        20,
        '#64748b'
      )

      const photoW = 620
      const photoH = 410

      const x = 290

      let y = 240

      images.forEach(
        (img, index) => {

          drawFrame(
            ctx,
            x - 15,
            y - 15,
            photoW + 30,
            photoH + 30,
            18
          )

          drawPhotoContain(
            ctx,
            img,
            x,
            y,
            photoW,
            photoH,
            10,
            '#f1f5f9'
          )

          photoNumber(
            ctx,
            index + 1,
            600,
            y + photoH + 40,
            '#475569'
          )

          y += 500
        }
      )

      drawText(
        ctx,
        'CAPTURED MOMENTS',
        600,
        2130,
        18,
        '#64748b',
        '400'
      )
    }

    /* =====================================================
       EXPORT JPG
    ===================================================== */

    resultUrl.value =
      canvas.value.toDataURL(
        'image/jpeg',
        0.95
      )

    loading.value = false

    await nextTick()

  } catch (error) {

    console.error(
      'Generate error:',
      error
    )

    errorMessage.value =
      'Gagal membuat hasil foto.'

    loading.value = false
  }
}

/* =========================================================
   DOWNLOAD
========================================================= */

const download = () => {
  if (!resultUrl.value) {
    return
  }

  try {

    const link =
      document.createElement('a')

    link.href =
      resultUrl.value

    link.download =
      `photobooth-${templateName
        .toLowerCase()
        .replace(/\s+/g, '-')}.jpg`

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )

  } catch (error) {

    console.error(
      'Download gagal:',
      error
    )

    openImage()
  }
}

/* =========================================================
   OPEN IMAGE
   FALLBACK UNTUK HP
========================================================= */

const openImage = () => {
  if (!resultUrl.value) {
    return
  }

  const newWindow =
    window.open(
      '',
      '_blank'
    )

  if (newWindow) {

    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Photobooth Result</title>
        <meta name="viewport"
              content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #111;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            font-family: Arial;
          }

          img {
            max-width: 100%;
            height: auto;
            display: block;
          }

          p {
            color: white;
            text-align: center;
          }
        </style>
      </head>

      <body>

        <img
          src="${resultUrl.value}"
          alt="Photobooth Result"
        >

        <p>
          Tekan lama gambar lalu pilih
          <b>Simpan gambar</b>.
        </p>

      </body>
      </html>
    `)

    newWindow.document.close()

  } else {

    alert(
      'Browser memblokir halaman baru. Tekan tombol Download lagi.'
    )
  }
}

/* =========================================================
   SHARE
========================================================= */

const shareImage = async () => {
  if (!resultUrl.value) {
    return
  }

  try {

    const response =
      await fetch(
        resultUrl.value
      )

    const blob =
      await response.blob()

    const file =
      new File(
        [blob],
        'photobooth.jpg',
        {
          type: 'image/jpeg'
        }
      )

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [file]
      })
    ) {

      await navigator.share({
        title: 'Photobooth',
        text: 'Hasil foto photobooth',
        files: [file]
      })

    } else {

      openImage()
    }

  } catch (error) {

    console.error(
      'Share error:',
      error
    )
  }
}

/* =========================================================
   RETAKE
========================================================= */

const retake = () => {

  localStorage.removeItem(
    'photobooth_photos'
  )

  navigateTo(
    `/camera?template=${templateId}`
  )
}

/* =========================================================
   HOME
========================================================= */

const home = () => {

  localStorage.removeItem(
    'photobooth_photos'
  )

  navigateTo('/')
}

/* =========================================================
   LOAD
========================================================= */

onMounted(async () => {

  try {

    const saved =
      localStorage.getItem(
        'photobooth_photos'
      )

    if (saved) {

      const parsed =
        JSON.parse(saved)

      if (
        Array.isArray(parsed)
      ) {

        photos.value =
          parsed.filter(
            (photo) =>
              typeof photo ===
              'string'
          )
      }
    }

    if (
      photos.value.length > 0
    ) {

      await generate()

    } else {

      loading.value = false
    }

  } catch (error) {

    console.error(
      'Load error:',
      error
    )

    loading.value = false
  }
})
</script>

<template>
  <div class="page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <header class="header">

      <button
        class="home-btn"
        @click="home"
      >
        <span>←</span>
        <span>Home</span>
      </button>

      <div class="brand">
        <span class="brand-icon">
          📸
        </span>

        <span>
          Photobooth
        </span>
      </div>

      <div class="template-badge">
        {{ templateName }}
      </div>

    </header>


    <!-- =====================================================
         MAIN
    ====================================================== -->

    <main class="main">

      <section class="heading">

        <div class="eyebrow">
          YOUR RESULT
        </div>

        <h1>
          {{ templateTitle }}
        </h1>

        <p>
          {{ templateSubtitle }}
        </p>

      </section>


      <!-- ===================================================
           ERROR
      ==================================================== -->

      <div
        v-if="errorMessage"
        class="error-box"
      >
        {{ errorMessage }}

        <button
          @click="generate"
        >
          Coba Lagi
        </button>
      </div>


      <!-- ===================================================
           LOADING
      ==================================================== -->

      <div
        v-else-if="loading"
        class="loading"
      >

        <div class="spinner"></div>

        <h3>
          Membuat hasil foto...
        </h3>

        <p>
          Tunggu sebentar ya
        </p>

      </div>


      <!-- ===================================================
           RESULT
      ==================================================== -->

      <section
        v-else-if="resultUrl"
        class="result"
      >

        <div class="result-card">

          <img
            :src="resultUrl"
            class="result-image"
            alt="Hasil Photobooth"
          />

        </div>


        <!-- =================================================
             ACTION BUTTON
        ================================================== -->

        <div class="actions">

          <button
            class="btn primary"
            @click="download"
          >
            <span>⬇</span>
            Download JPG
          </button>

          <button
            class="btn secondary"
            @click="openImage"
          >
            <span>🖼️</span>
            Buka Gambar
          </button>

          <button
            class="btn secondary"
            @click="shareImage"
          >
            <span>↗</span>
            Bagikan
          </button>

          <button
            class="btn outline"
            @click="retake"
          >
            <span>📸</span>
            Foto Lagi
          </button>

        </div>


        <div class="info">

          <span class="info-icon">
            ✓
          </span>

          <span>
            Hasil sudah digabung menjadi
            <strong>1 gambar JPG</strong>
          </span>

        </div>

      </section>


      <!-- ===================================================
           EMPTY
      ==================================================== -->

      <section
        v-else
        class="empty"
      >

        <div class="empty-icon">
          📷
        </div>

        <h2>
          Belum ada foto
        </h2>

        <p>
          Ambil foto terlebih dahulu
        </p>

        <button
          class="btn primary"
          @click="retake"
        >
          📸 Ambil Foto
        </button>

      </section>

    </main>


    <!-- =====================================================
         HIDDEN CANVAS
    ====================================================== -->

    <canvas
      ref="canvas"
      class="hidden-canvas"
    />

  </div>
</template>


<style scoped>

/* =========================================================
   RESET
========================================================= */

* {
  box-sizing: border-box;
}


/* =========================================================
   PAGE
========================================================= */

.page {
  min-height: 100vh;

  background:
    radial-gradient(
      circle at top left,
      rgba(236,72,153,.08),
      transparent 35%
    ),
    #fafafa;

  color: #18181b;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}


/* =========================================================
   HEADER
========================================================= */

.header {
  position: sticky;
  top: 0;
  z-index: 50;

  height: 72px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 5%;

  background:
    rgba(255,255,255,.92);

  backdrop-filter:
    blur(18px);

  border-bottom:
    1px solid #e4e4e7;
}


.home-btn {
  display: flex;
  align-items: center;
  gap: 8px;

  border: 0;

  background: transparent;

  color: #52525b;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;

  transition:
    .2s ease;
}


.home-btn:hover {
  color: #7c3aed;
}


.home-btn span:first-child {
  font-size: 22px;
}


.brand {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #7c3aed;

  font-size: 20px;

  font-weight: 900;
}


.brand-icon {
  font-size: 24px;
}


.template-badge {
  padding:
    8px 14px;

  border-radius:
    999px;

  background:
    #f5f3ff;

  color:
    #7c3aed;

  font-size:
    12px;

  font-weight:
    800;
}


/* =========================================================
   MAIN
========================================================= */

.main {
  width: 92%;
  max-width: 850px;

  margin: auto;

  padding:
    55px 0 100px;
}


/* =========================================================
   HEADING
========================================================= */

.heading {
  text-align: center;

  margin-bottom:
    35px;
}


.eyebrow {
  display: inline-block;

  color:
    #7c3aed;

  font-size:
    11px;

  font-weight:
    900;

  letter-spacing:
    3px;

  margin-bottom:
    10px;
}


.heading h1 {
  margin:
    0 0 10px;

  font-size:
    clamp(30px, 5vw, 52px);

  line-height:
    1.1;

  font-family:
    Georgia,
    serif;
}


.heading p {
  margin:
    0;

  color:
    #71717a;

  font-size:
    16px;
}


/* =========================================================
   RESULT CARD
========================================================= */

.result-card {
  width: 100%;

  max-width:
    680px;

  margin:
    0 auto;

  padding:
    14px;

  background:
    #ffffff;

  border:
    1px solid #e4e4e7;

  border-radius:
    26px;

  box-shadow:
    0 25px 70px
    rgba(0,0,0,.12);
}


.result-image {
  display:
    block;

  width:
    100%;

  height:
    auto;

  border-radius:
    17px;
}


/* =========================================================
   ACTIONS
========================================================= */

.actions {
  display:
    flex;

  flex-wrap:
    wrap;

  justify-content:
    center;

  gap:
    12px;

  margin-top:
    25px;
}


.btn {
  min-height:
    52px;

  padding:
    0 23px;

  border-radius:
    14px;

  border:
    1px solid transparent;

  font-size:
    14px;

  font-weight:
    800;

  cursor:
    pointer;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    8px;

  transition:
    transform .2s ease,
    box-shadow .2s ease;
}


.btn:hover {
  transform:
    translateY(-2px);
}


.btn.primary {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  color:
    #ffffff;

  box-shadow:
    0 12px 30px
    rgba(124,58,237,.25);
}


.btn.secondary {
  background:
    #ffffff;

  color:
    #3f3f46;

  border-color:
    #e4e4e7;
}


.btn.outline {
  background:
    transparent;

  color:
    #52525b;

  border-color:
    #d4d4d8;
}


/* =========================================================
   INFO
========================================================= */

.info {
  margin-top:
    20px;

  display:
    flex;

  justify-content:
    center;

  align-items:
    center;

  gap:
    8px;

  color:
    #71717a;

  font-size:
    13px;

  text-align:
    center;
}


.info strong {
  color:
    #52525b;
}


.info-icon {
  width:
    20px;

  height:
    20px;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  border-radius:
    50%;

  background:
    #dcfce7;

  color:
    #16a34a;

  font-size:
    11px;

  font-weight:
    900;
}


/* =========================================================
   LOADING
========================================================= */

.loading {
  min-height:
    400px;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  text-align:
    center;

  background:
    #ffffff;

  border:
    1px solid #e4e4e7;

  border-radius:
    25px;
}


.loading h3 {
  margin:
    20px 0 5px;
}


.loading p {
  margin:
    0;

  color:
    #71717a;
}


.spinner {
  width:
    48px;

  height:
    48px;

  border:
    4px solid #e4e4e7;

  border-top-color:
    #7c3aed;

  border-radius:
    50%;

  animation:
    spin .8s linear infinite;
}


@keyframes spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* =========================================================
   EMPTY
========================================================= */

.empty {
  padding:
    80px 30px;

  text-align:
    center;

  background:
    #ffffff;

  border:
    1px solid #e4e4e7;

  border-radius:
    25px;
}


.empty-icon {
  font-size:
    60px;

  margin-bottom:
    15px;
}


.empty h2 {
  margin:
    0 0 8px;
}


.empty p {
  color:
    #71717a;

  margin:
    0 0 25px;
}


/* =========================================================
   ERROR
========================================================= */

.error-box {
  padding:
    35px;

  background:
    #fff1f2;

  color:
    #be123c;

  border:
    1px solid #fecdd3;

  border-radius:
    20px;

  text-align:
    center;
}


.error-box button {
  display:
    block;

  margin:
    20px auto 0;

  padding:
    10px 18px;

  border:
    0;

  border-radius:
    10px;

  background:
    #be123c;

  color:
    white;

  font-weight:
    700;

  cursor:
    pointer;
}


/* =========================================================
   CANVAS
========================================================= */

.hidden-canvas {
  display:
    none;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .header {
    height:
      64px;

    padding:
      0 16px;
  }


  .brand {
    font-size:
      17px;
  }


  .brand-icon {
    font-size:
      20px;
  }


  .template-badge {
    display:
      none;
  }


  .main {
    width:
      94%;

    padding:
      30px 0 70px;
  }


  .heading {
    margin-bottom:
      24px;
  }


  .heading h1 {
    font-size:
      31px;
  }


  .heading p {
    font-size:
      14px;
  }


  .result-card {
    padding:
      8px;

    border-radius:
      20px;
  }


  .result-image {
    border-radius:
      13px;
  }


  .actions {
    flex-direction:
      column;

    gap:
      10px;
  }


  .btn {
    width:
      100%;
  }


  .info {
    line-height:
      1.5;

    padding:
      0 10px;
  }

}
</style>