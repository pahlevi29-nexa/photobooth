<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId = Number(route.query.template || 1)

const template =
  templates.find((t: any) => Number(t.id) === templateId) ||
  templates[0]

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const errorMessage = ref('')

const canvas = ref<HTMLCanvasElement | null>(null)

/* =========================================================
   LOAD PHOTO
========================================================= */

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat foto'))

    img.src = src
  })
}

/* =========================================================
   DRAW IMAGE COVER
   Sama seperti object-fit: cover
========================================================= */

const drawCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0
) => {
  const sourceRatio = img.width / img.height
  const targetRatio = width / height

  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (sourceRatio > targetRatio) {
    // Foto terlalu lebar -> potong kiri kanan
    sw = img.height * targetRatio
    sx = (img.width - sw) / 2
  } else {
    // Foto terlalu tinggi -> potong atas bawah
    sh = img.width / targetRatio
    sy = (img.height - sh) / 2
  }

  ctx.save()

  if (radius > 0) {
    roundedRect(ctx, x, y, width, height, radius)
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
    width,
    height
  )

  ctx.restore()
}

/* =========================================================
   ROUNDED RECTANGLE
========================================================= */

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + r
  )

  ctx.lineTo(x + width, y + height - r)

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - r,
    y + height
  )

  ctx.lineTo(x + r, y + height)

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - r
  )

  ctx.lineTo(x, y + r)

  ctx.quadraticCurveTo(
    x,
    y,
    x + r,
    y
  )

  ctx.closePath()
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
  font = 'Arial'
) => {
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillText(value, x, y)
}

/* =========================================================
   BACKGROUND
========================================================= */

const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const colors = template?.colors || [
    '#fdf2f8',
    '#fbcfe8'
  ]

  const gradient = ctx.createLinearGradient(
    0,
    0,
    width,
    height
  )

  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/* =========================================================
   SHADOW
========================================================= */

const shadowOn = (
  ctx: CanvasRenderingContext2D
) => {
  ctx.shadowColor = 'rgba(0,0,0,0.15)'
  ctx.shadowBlur = 30
  ctx.shadowOffsetY = 12
}

const shadowOff = (
  ctx: CanvasRenderingContext2D
) => {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
}

/* =========================================================
   FRAME
========================================================= */

const drawFrame = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 20
) => {
  ctx.save()

  shadowOn(ctx)

  ctx.fillStyle = '#ffffff'

  roundedRect(
    ctx,
    x - 12,
    y - 12,
    width + 24,
    height + 24,
    radius + 6
  )

  ctx.fill()

  shadowOff(ctx)

  drawCover(
    ctx,
    img,
    x,
    y,
    width,
    height,
    radius
  )

  ctx.restore()
}

/* =========================================================
   TEMPLATE 1
   VERTICAL / KAWAII
========================================================= */

const layoutVertical = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'Kawaii Pink',
    W / 2,
    100,
    62,
    '#831843',
    '700',
    'Georgia'
  )

  drawText(
    ctx,
    template.subtitle || 'Captured moments',
    W / 2,
    145,
    25,
    '#9d174d',
    '400',
    'Arial'
  )

  const x = 100
  const width = 1000
  const height = 330
  let y = 210

  images.forEach((img, index) => {
    drawFrame(
      ctx,
      img,
      x,
      y,
      width,
      height,
      22
    )

    drawText(
      ctx,
      String(index + 1).padStart(2, '0'),
      W / 2,
      y + height + 48,
      22,
      '#831843',
      '700'
    )

    y += 390
  })

  drawText(
    ctx,
    '♡',
    W / 2,
    H - 55,
    42,
    '#be185d',
    '400'
  )
}

/* =========================================================
   TEMPLATE 2
   FILM STRIP
========================================================= */

const layoutFilm = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  ctx.fillStyle = '#111111'
  ctx.fillRect(70, 50, W - 140, H - 100)

  drawText(
    ctx,
    template.title || 'Film Memories',
    W / 2,
    130,
    55,
    '#ffffff',
    '700',
    'Georgia'
  )

  const x = 170
  const width = 860
  const height = 300

  let y = 200

  images.forEach((img, index) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      x - 18,
      y - 18,
      width + 36,
      height + 36
    )

    drawCover(
      ctx,
      img,
      x,
      y,
      width,
      height,
      0
    )

    drawText(
      ctx,
      `FRAME ${index + 1}`,
      W / 2,
      y + height + 45,
      18,
      '#111111',
      '700'
    )

    y += 375
  })

  drawText(
    ctx,
    template.subtitle || 'Good memories',
    W / 2,
    H - 65,
    22,
    '#ffffff',
    '400'
  )
}

/* =========================================================
   TEMPLATE 3
   2x2 GRID
========================================================= */

const layoutGrid = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'Moments',
    W / 2,
    105,
    60,
    '#292524',
    '700',
    'Georgia'
  )

  drawText(
    ctx,
    template.subtitle || 'Our memories',
    W / 2,
    150,
    24,
    '#57534e',
    '400'
  )

  const positions = [
    [90, 220],
    [610, 220],
    [90, 900],
    [610, 900]
  ]

  images.forEach((img, index) => {
    const [x, y] = positions[index]

    drawFrame(
      ctx,
      img,
      x,
      y,
      480,
      580,
      26
    )

    drawText(
      ctx,
      `0${index + 1}`,
      x + 240,
      y + 625,
      18,
      '#57534e',
      '700'
    )
  })
}

/* =========================================================
   TEMPLATE 4
   POLAROID
========================================================= */

const layoutPolaroid = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'Memories',
    W / 2,
    110,
    58,
    '#44403c',
    '700',
    'Georgia'
  )

  const positions = [
    [100, 210, -3],
    [620, 210, 3],
    [100, 900, 2],
    [620, 900, -2]
  ]

  images.forEach((img, index) => {
    const [x, y, rotate] = positions[index]

    ctx.save()

    ctx.translate(
      x + 220,
      y + 270
    )

    ctx.rotate(
      (rotate * Math.PI) / 180
    )

    shadowOn(ctx)

    ctx.fillStyle = '#ffffff'

    ctx.fillRect(
      -220,
      -270,
      440,
      540
    )

    shadowOff(ctx)

    drawCover(
      ctx,
      img,
      -195,
      -240,
      390,
      390,
      8
    )

    drawText(
      ctx,
      `memory ${index + 1}`,
      0,
      220,
      19,
      '#44403c',
      '400',
      'cursive'
    )

    ctx.restore()
  })
}

/* =========================================================
   TEMPLATE 5
   EDITORIAL
========================================================= */

const layoutEditorial = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    'THE',
    W / 2,
    90,
    22,
    '#57534e',
    '700'
  )

  drawText(
    ctx,
    template.title || 'STORY',
    W / 2,
    165,
    80,
    '#1c1917',
    '700',
    'Georgia'
  )

  drawText(
    ctx,
    template.subtitle || 'A collection of moments',
    W / 2,
    205,
    20,
    '#78716c',
    '400'
  )

  if (images[0]) {
    drawCover(
      ctx,
      images[0],
      80,
      260,
      1040,
      560,
      20
    )
  }

  if (images[1]) {
    drawCover(
      ctx,
      images[1],
      80,
      860,
      500,
      500,
      20
    )
  }

  if (images[2]) {
    drawCover(
      ctx,
      images[2],
      620,
      860,
      500,
      500,
      20
    )
  }

  if (images[3]) {
    drawCover(
      ctx,
      images[3],
      80,
      1400,
      1040,
      240,
      20
    )
  }
}

/* =========================================================
   TEMPLATE 6
   SCRAPBOOK
========================================================= */

const layoutScrapbook = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'Our Story',
    W / 2,
    110,
    65,
    '#be185d',
    '700',
    'cursive'
  )

  const positions = [
    [100, 200, -4],
    [620, 220, 4],
    [100, 880, 3],
    [620, 900, -3]
  ]

  images.forEach((img, index) => {
    const [x, y, rotate] = positions[index]

    ctx.save()

    ctx.translate(
      x + 220,
      y + 260
    )

    ctx.rotate(
      (rotate * Math.PI) / 180
    )

    shadowOn(ctx)

    ctx.fillStyle = '#ffffff'

    ctx.fillRect(
      -220,
      -260,
      440,
      520
    )

    shadowOff(ctx)

    drawCover(
      ctx,
      img,
      -195,
      -235,
      390,
      390,
      12
    )

    drawText(
      ctx,
      '♡',
      0,
      225,
      32,
      '#ec4899',
      '400'
    )

    ctx.restore()
  })

  drawText(
    ctx,
    template.subtitle || 'made with love',
    W / 2,
    1680,
    28,
    '#be185d',
    '700',
    'cursive'
  )
}

/* =========================================================
   TEMPLATE 7
   MAGAZINE
========================================================= */

const layoutMagazine = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  ctx.fillStyle = '#18181b'
  ctx.fillRect(
    60,
    60,
    W - 120,
    H - 120
  )

  drawText(
    ctx,
    'SPECIAL EDITION',
    W / 2,
    140,
    24,
    '#ffffff',
    '700'
  )

  drawText(
    ctx,
    template.title || 'MOMENTS',
    W / 2,
    220,
    78,
    '#ffffff',
    '700',
    'Georgia'
  )

  if (images[0]) {
    drawCover(
      ctx,
      images[0],
      100,
      300,
      1000,
      620,
      0
    )
  }

  if (images[1]) {
    drawCover(
      ctx,
      images[1],
      100,
      970,
      480,
      500,
      0
    )
  }

  if (images[2]) {
    drawCover(
      ctx,
      images[2],
      620,
      970,
      480,
      500,
      0
    )
  }

  drawText(
    ctx,
    template.subtitle || 'THE PHOTO ISSUE',
    W / 2,
    1610,
    22,
    '#ffffff',
    '400'
  )
}

/* =========================================================
   TEMPLATE 8
   RETRO
========================================================= */

const layoutRetro = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'GOOD TIMES',
    W / 2,
    120,
    70,
    '#7f1d1d',
    '700',
    'Georgia'
  )

  drawText(
    ctx,
    template.subtitle || 'Since forever',
    W / 2,
    165,
    22,
    '#7f1d1d',
    '400'
  )

  const positions = [
    [100, 240],
    [630, 240],
    [100, 890],
    [630, 890]
  ]

  images.forEach((img, index) => {
    const [x, y] = positions[index]

    ctx.fillStyle = '#fef3c7'

    ctx.fillRect(
      x,
      y,
      470,
      520
    )

    drawCover(
      ctx,
      img,
      x + 20,
      y + 20,
      430,
      430,
      0
    )

    drawText(
      ctx,
      'GOOD TIMES',
      x + 235,
      y + 490,
      18,
      '#7f1d1d',
      '700',
      'Georgia'
    )
  })
}

/* =========================================================
   TEMPLATE 9
   MINIMAL
========================================================= */

const layoutMinimal = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'moments',
    W / 2,
    100,
    52,
    '#18181b',
    '400',
    'Arial'
  )

  const x = 100
  const width = 1000
  const height = 330

  images.forEach((img, index) => {
    drawCover(
      ctx,
      img,
      x,
      170 + index * 385,
      width,
      height,
      0
    )
  })

  drawText(
    ctx,
    template.subtitle || 'simple memories',
    W / 2,
    1720,
    20,
    '#71717a',
    '400'
  )
}

/* =========================================================
   TEMPLATE 10
   CUTE
========================================================= */

const layoutCute = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    '♡',
    W / 2,
    100,
    65,
    '#db2777'
  )

  drawText(
    ctx,
    template.title || 'Cute Memories',
    W / 2,
    170,
    60,
    '#db2777',
    '700',
    'cursive'
  )

  const positions = [
    [100, 250],
    [620, 250],
    [100, 900],
    [620, 900]
  ]

  images.forEach((img, index) => {
    const [x, y] = positions[index]

    drawFrame(
      ctx,
      img,
      x,
      y,
      480,
      520,
      35
    )
  })

  drawText(
    ctx,
    template.subtitle || 'sweet memories',
    W / 2,
    1600,
    30,
    '#be185d',
    '700',
    'cursive'
  )
}

/* =========================================================
   TEMPLATE 11
   DARK LUXURY
========================================================= */

const layoutDark = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  ctx.fillStyle = '#101014'
  ctx.fillRect(0, 0, W, H)

  drawText(
    ctx,
    template.title || 'NIGHT',
    W / 2,
    125,
    70,
    '#ffffff',
    '700',
    'Georgia'
  )

  drawText(
    ctx,
    template.subtitle || 'moments',
    W / 2,
    170,
    20,
    '#a1a1aa',
    '400'
  )

  images.forEach((img, index) => {
    drawCover(
      ctx,
      img,
      100,
      230 + index * 360,
      1000,
      310,
      12
    )
  })

  drawText(
    ctx,
    '✦',
    W / 2,
    1730,
    35,
    '#ffffff',
    '400'
  )
}

/* =========================================================
   TEMPLATE 12
   CLASSIC VERTICAL
========================================================= */

const layoutClassic = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  W: number,
  H: number
) => {
  drawText(
    ctx,
    template.title || 'Classic',
    W / 2,
    105,
    62,
    '#18181b',
    '700',
    'Georgia'
  )

  drawText(
    ctx,
    template.subtitle || 'Beautiful moments',
    W / 2,
    150,
    20,
    '#71717a',
    '400'
  )

  let y = 220

  images.forEach((img) => {
    drawFrame(
      ctx,
      img,
      100,
      y,
      1000,
      300,
      18
    )

    y += 370
  })

  drawText(
    ctx,
    'THE END',
    W / 2,
    1730,
    18,
    '#71717a',
    '700'
  )
}

/* =========================================================
   GENERATE RESULT
========================================================= */

const generate = async () => {
  if (!canvas.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const loadedImages: HTMLImageElement[] = []

    const selectedPhotos = photos.value.slice(0, 4)

    for (const photo of selectedPhotos) {
      try {
        const image = await loadImage(photo)
        loadedImages.push(image)
      } catch (error) {
        console.error('Gagal load foto:', error)
      }
    }

    if (!loadedImages.length) {
      loading.value = false
      return
    }

    await nextTick()

    const ctx = canvas.value.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas tidak tersedia')
    }

    /*
      Ukuran hasil final.
      1200 x 1800 = portrait 2:3
    */

    const W = 1200
    const H = 1800

    canvas.value.width = W
    canvas.value.height = H

    ctx.clearRect(
      0,
      0,
      W,
      H
    )

    /*
      Background default.
    */

    drawBackground(
      ctx,
      W,
      H
    )

    /*
      Tentukan layout.
    */

    const layout =
      String(template?.layout || 'vertical')
        .toLowerCase()

    switch (layout) {
      case 'vertical':
        layoutVertical(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'film':
        layoutFilm(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'grid':
        layoutGrid(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'polaroid':
        layoutPolaroid(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'editorial':
        layoutEditorial(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'scrapbook':
        layoutScrapbook(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'magazine':
        layoutMagazine(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'retro':
        layoutRetro(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'minimal':
        layoutMinimal(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'cute':
        layoutCute(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'dark':
        layoutDark(
          ctx,
          loadedImages,
          W,
          H
        )
        break

      case 'classic':
      default:
        layoutClassic(
          ctx,
          loadedImages,
          W,
          H
        )
        break
    }

    /*
      Export JPG.
      JPEG quality 0.95
    */

    resultUrl.value =
      canvas.value.toDataURL(
        'image/jpeg',
        0.95
      )

  } catch (error) {
    console.error(error)

    errorMessage.value =
      'Gagal membuat hasil foto.'
  }

  loading.value = false
}

/* =========================================================
   DOWNLOAD
========================================================= */

const download = async () => {
  if (!resultUrl.value) return

  try {
    /*
      Convert dataURL ke Blob
    */

    const response =
      await fetch(resultUrl.value)

    const blob =
      await response.blob()

    const blobUrl =
      URL.createObjectURL(blob)

    const filename =
      `photobooth-${String(
        template?.name || 'result'
      )
        .toLowerCase()
        .replace(/\s+/g, '-')}.jpg`

    const a =
      document.createElement('a')

    a.href = blobUrl
    a.download = filename

    document.body.appendChild(a)

    a.click()

    document.body.removeChild(a)

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 1000)

  } catch (error) {
    console.error(
      'Download gagal:',
      error
    )

    /*
      Fallback untuk browser HP
    */

    window.open(
      resultUrl.value,
      '_blank'
    )
  }
}

/* =========================================================
   RETAKE
========================================================= */

const retake = () => {
  navigateTo(
    `/camera?template=${template.id}`
  )
}

/* =========================================================
   HOME
========================================================= */

const home = () => {
  navigateTo('/')
}

/* =========================================================
   LOAD
========================================================= */

onMounted(async () => {
  const saved =
    localStorage.getItem(
      'photobooth_photos'
    )

  if (saved) {
    try {
      const parsed =
        JSON.parse(saved)

      if (Array.isArray(parsed)) {
        photos.value = parsed
      }
    } catch (error) {
      console.error(
        'LocalStorage error:',
        error
      )

      photos.value = []
    }
  }

  if (photos.value.length) {
    await generate()
  } else {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">

    <!-- HEADER -->

    <header class="header">

      <button
        class="home-btn"
        @click="home"
      >
        ←
        <span>Home</span>
      </button>

      <div class="brand">
        <span class="brand-camera">
          📸
        </span>

        <span>
          Photobooth
        </span>
      </div>

      <div class="template-badge">
        {{ template?.name || 'Template' }}
      </div>

    </header>


    <!-- MAIN -->

    <main class="main">

      <!-- HEADING -->

      <section class="heading">

        <div class="eyebrow">
          YOUR MEMORIES
        </div>

        <h1>
          {{ template?.title || 'Your Result' }}
        </h1>

        <p>
          {{ template?.subtitle || 'Beautiful moments captured together.' }}
        </p>

      </section>


      <!-- LOADING -->

      <div
        v-if="loading"
        class="state-card"
      >

        <div class="loader"></div>

        <h2>
          Membuat hasil foto...
        </h2>

        <p>
          Tunggu sebentar ya.
        </p>

      </div>


      <!-- ERROR -->

      <div
        v-else-if="errorMessage"
        class="state-card error"
      >

        <div class="state-icon">
          ⚠️
        </div>

        <h2>
          Terjadi kesalahan
        </h2>

        <p>
          {{ errorMessage }}
        </p>

        <button
          class="primary-btn"
          @click="generate"
        >
          Coba Lagi
        </button>

      </div>


      <!-- RESULT -->

      <section
        v-else-if="resultUrl"
        class="result-section"
      >

        <div class="result-card">

          <img
            :src="resultUrl"
            alt="Hasil Photobooth"
            class="result-image"
          />

        </div>


        <!-- ACTIONS -->

        <div class="actions">

          <button
            class="download-btn"
            @click="download"
          >
            <span>↓</span>
            Download JPG
          </button>

          <button
            class="retake-btn"
            @click="retake"
          >
            📸
            Foto Lagi
          </button>

        </div>


        <div class="result-info">

          <div class="check">
            ✓
          </div>

          <div>
            <strong>
              Foto berhasil dibuat
            </strong>

            <span>
              Hasil sudah digabung menjadi 1 gambar JPG
            </span>
          </div>

        </div>

      </section>


      <!-- EMPTY -->

      <section
        v-else
        class="state-card"
      >

        <div class="state-icon">
          📷
        </div>

        <h2>
          Belum ada foto
        </h2>

        <p>
          Ambil foto terlebih dahulu.
        </p>

        <button
          class="primary-btn"
          @click="retake"
        >
          Ambil Foto
        </button>

      </section>

    </main>


    <!-- HIDDEN CANVAS -->

    <canvas
      ref="canvas"
      class="hidden-canvas"
    />

  </div>
</template>


<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top left,
      #fdf2f8,
      transparent 35%
    ),
    radial-gradient(
      circle at bottom right,
      #f3e8ff,
      transparent 35%
    ),
    #fafafa;

  color: #18181b;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;
}


/* =========================================================
   HEADER
========================================================= */

.header {
  height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 5%;

  background:
    rgba(255,255,255,.92);

  backdrop-filter: blur(18px);

  border-bottom:
    1px solid rgba(0,0,0,.06);

  position: sticky;
  top: 0;

  z-index: 20;
}

.home-btn {
  border: none;
  background: none;

  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 15px;
  font-weight: 700;

  color: #52525b;

  cursor: pointer;
}

.home-btn:hover {
  color: #7c3aed;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 20px;
  font-weight: 900;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  background-clip: text;
  -webkit-background-clip: text;

  color: transparent;
}

.brand-camera {
  color: initial;
}

.template-badge {
  padding: 8px 14px;

  border-radius: 999px;

  background: #f5f3ff;

  color: #7c3aed;

  font-size: 12px;
  font-weight: 800;
}


/* =========================================================
   MAIN
========================================================= */

.main {
  width: 92%;
  max-width: 820px;

  margin: auto;

  padding:
    55px 0
    100px;
}


/* =========================================================
   HEADING
========================================================= */

.heading {
  text-align: center;

  margin-bottom: 35px;
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

  font-family:
    Georgia,
    serif;

  font-size: clamp(
    32px,
    6vw,
    52px
  );

  line-height: 1.05;

  color: #18181b;
}

.heading p {
  margin:
    14px auto
    0;

  max-width: 550px;

  color: #71717a;

  font-size: 15px;

  line-height: 1.6;
}


/* =========================================================
   RESULT
========================================================= */

.result-section {
  width: 100%;
}

.result-card {
  width: min(
    100%,
    620px
  );

  margin: auto;

  padding: 14px;

  background: white;

  border-radius: 28px;

  box-shadow:
    0 30px 80px
    rgba(0,0,0,.15);

  border:
    1px solid rgba(0,0,0,.05);
}

.result-image {
  width: 100%;

  display: block;

  border-radius: 18px;

  height: auto;
}


/* =========================================================
   ACTION
========================================================= */

.actions {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 14px;

  margin-top: 24px;
}

.actions button {
  min-height: 56px;

  border-radius: 16px;

  border: none;

  font-size: 15px;

  font-weight: 800;

  cursor: pointer;

  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.actions button:hover {
  transform:
    translateY(-2px);
}

.download-btn {
  color: white;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  box-shadow:
    0 12px 30px
    rgba(124,58,237,.25);
}

.download-btn span {
  font-size: 22px;

  margin-right: 7px;
}

.retake-btn {
  background: white;

  color: #3f3f46;

  border:
    1px solid #e4e4e7 !important;
}


/* =========================================================
   INFO
========================================================= */

.result-info {
  display: flex;

  justify-content: center;
  align-items: center;

  gap: 10px;

  margin-top: 22px;

  color: #71717a;
}

.check {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #dcfce7;

  color: #16a34a;

  font-weight: 900;
}

.result-info div:last-child {
  display: flex;

  flex-direction: column;

  gap: 2px;
}

.result-info strong {
  color: #3f3f46;

  font-size: 13px;
}

.result-info span {
  font-size: 12px;
}


/* =========================================================
   STATE
========================================================= */

.state-card {
  padding: 80px 30px;

  text-align: center;

  background: white;

  border-radius: 28px;

  box-shadow:
    0 20px 60px
    rgba(0,0,0,.08);
}

.state-icon {
  font-size: 55px;

  margin-bottom: 20px;
}

.state-card h2 {
  margin: 0 0 8px;

  font-size: 24px;
}

.state-card p {
  margin: 0 0 25px;

  color: #71717a;
}

.primary-btn {
  border: none;

  padding:
    14px 24px;

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  color: white;

  font-weight: 800;

  cursor: pointer;
}

.error {
  border:
    1px solid #fecaca;
}


/* =========================================================
   LOADER
========================================================= */

.loader {
  width: 42px;
  height: 42px;

  margin:
    0 auto
    20px;

  border:
    4px solid #ede9fe;

  border-top-color:
    #7c3aed;

  border-radius: 50%;

  animation:
    spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================================================
   CANVAS
========================================================= */

.hidden-canvas {
  position: absolute;

  width: 1px;
  height: 1px;

  opacity: 0;

  pointer-events: none;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 600px) {

  .header {
    height: 68px;

    padding:
      0 18px;
  }

  .brand {
    font-size: 17px;
  }

  .template-badge {
    display: none;
  }

  .main {
    width: 94%;

    padding:
      32px 0
      60px;
  }

  .heading {
    margin-bottom: 25px;
  }

  .heading h1 {
    font-size: 34px;
  }

  .heading p {
    font-size: 14px;
  }

  .result-card {
    padding: 8px;

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
    text-align: left;

    justify-content: flex-start;

    padding:
      0 8px;
  }

}
</style>