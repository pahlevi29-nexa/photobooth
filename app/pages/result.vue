<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId = Number(route.query.template || 1)

const selectedTemplate = templates.find(
  (t: any) => Number(t.id) === templateId
) || templates[0]

/*
|--------------------------------------------------------------------------
| TEMPLATE YANG AMAN
|--------------------------------------------------------------------------
| Mencegah munculnya "undefined"
*/
const template: any = {
  id: selectedTemplate?.id || 1,
  name: selectedTemplate?.name || 'Photobooth',
  title: selectedTemplate?.title || selectedTemplate?.name || 'Memories',
  subtitle:
    selectedTemplate?.subtitle ||
    'Captured moments',
  layout:
    selectedTemplate?.layout || 'vertical',
  colors:
    selectedTemplate?.colors || ['#fce7f3', '#fbcfe8']
}

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const canvas = ref<HTMLCanvasElement | null>(null)

/*
|--------------------------------------------------------------------------
| LOAD FOTO
|--------------------------------------------------------------------------
*/
onMounted(async () => {
  const saved = localStorage.getItem('photobooth_photos')

  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        photos.value = parsed.filter(
          (photo) => typeof photo === 'string'
        )
      }
    } catch {
      photos.value = []
    }
  }

  if (photos.value.length > 0) {
    await generate()
  } else {
    loading.value = false
  }
})

/*
|--------------------------------------------------------------------------
| LOAD IMAGE
|--------------------------------------------------------------------------
*/
const loadImage = (
  src: string
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () =>
      reject(new Error('Gagal memuat foto'))

    img.src = src
  })
}

/*
|--------------------------------------------------------------------------
| FIT IMAGE
|--------------------------------------------------------------------------
| PENTING:
| Tidak menggunakan crop.
|
| Foto akan masuk ke dalam frame dengan rasio asli.
| Jadi wajah tidak terpotong.
|--------------------------------------------------------------------------
*/
const fitImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  backgroundColor = '#ffffff'
) => {
  const imageRatio = img.width / img.height
  const boxRatio = w / h

  let drawWidth = w
  let drawHeight = h

  if (imageRatio > boxRatio) {
    drawWidth = w
    drawHeight = w / imageRatio
  } else {
    drawHeight = h
    drawWidth = h * imageRatio
  }

  const drawX =
    x + (w - drawWidth) / 2

  const drawY =
    y + (h - drawHeight) / 2

  // background frame
  ctx.fillStyle = backgroundColor
  ctx.fillRect(x, y, w, h)

  ctx.drawImage(
    img,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  )
}

/*
|--------------------------------------------------------------------------
| FIT IMAGE DENGAN BORDER
|--------------------------------------------------------------------------
*/
const photoFrame = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 0
) => {
  ctx.save()

  ctx.fillStyle = '#ffffff'

  if (radius > 0) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, radius)
    ctx.fill()

    ctx.beginPath()
    ctx.roundRect(
      x + 12,
      y + 12,
      w - 24,
      h - 24,
      Math.max(radius - 8, 0)
    )
    ctx.clip()

    fitImage(
      ctx,
      img,
      x + 12,
      y + 12,
      w - 24,
      h - 24,
      '#f4f4f5'
    )
  } else {
    ctx.fillRect(x, y, w, h)

    fitImage(
      ctx,
      img,
      x + 12,
      y + 12,
      w - 24,
      h - 24,
      '#f4f4f5'
    )
  }

  ctx.restore()
}

/*
|--------------------------------------------------------------------------
| TEXT
|--------------------------------------------------------------------------
*/
const drawText = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 'bold',
  font = 'Arial'
) => {
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillText(
    String(value || ''),
    x,
    y
  )
}

/*
|--------------------------------------------------------------------------
| BACKGROUND
|--------------------------------------------------------------------------
*/
const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const color1 =
    template.colors?.[0] || '#fce7f3'

  const color2 =
    template.colors?.[1] || '#fbcfe8'

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    )

  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)

  ctx.fillStyle = gradient

  ctx.fillRect(
    0,
    0,
    width,
    height
  )
}

/*
|--------------------------------------------------------------------------
| GENERATE RESULT
|--------------------------------------------------------------------------
*/
const generate = async () => {
  if (!canvas.value) return

  loading.value = true

  const images: HTMLImageElement[] = []

  for (
    const photo of photos.value.slice(0, 4)
  ) {
    try {
      const img = await loadImage(photo)
      images.push(img)
    } catch (error) {
      console.error(
        'Foto gagal dimuat:',
        error
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
    loading.value = false
    return
  }

  /*
  |--------------------------------------------------------------------------
  | UKURAN HASIL FINAL
  |--------------------------------------------------------------------------
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
  |--------------------------------------------------------------------------
  | BACKGROUND
  |--------------------------------------------------------------------------
  */
  drawBackground(
    ctx,
    W,
    H
  )

  /*
  |--------------------------------------------------------------------------
  | 1. VERTICAL
  |--------------------------------------------------------------------------
  */
  if (
    template.layout === 'vertical'
  ) {
    drawText(
      ctx,
      template.title,
      600,
      80,
      62,
      '#831843',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      140,
      25,
      '#9d174d',
      'normal'
    )

    const photoW = 1030
    const photoH = 330
    const x = 85
    const startY = 205
    const gap = 50

    images.forEach(
      (img, i) => {
        const y =
          startY +
          i * (photoH + gap)

        photoFrame(
          ctx,
          img,
          x,
          y,
          photoW,
          photoH,
          18
        )

        drawText(
          ctx,
          `0${i + 1}`,
          600,
          y + photoH + 22,
          18,
          '#9d174d',
          'bold'
        )
      }
    )

    drawText(
      ctx,
      '♡',
      600,
      1725,
      42,
      '#be185d'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 2. FILM
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'film'
  ) {
    ctx.fillStyle = '#111111'

    ctx.fillRect(
      60,
      50,
      1080,
      1700
    )

    drawText(
      ctx,
      template.title,
      600,
      115,
      58,
      '#ffffff',
      'bold',
      'Georgia'
    )

    const photoW = 820
    const photoH = 270
    const x = 190
    const startY = 200
    const gap = 55

    images.forEach(
      (img, i) => {
        const y =
          startY +
          i * (photoH + gap)

        photoFrame(
          ctx,
          img,
          x,
          y,
          photoW,
          photoH,
          4
        )

        drawText(
          ctx,
          `FRAME ${i + 1}`,
          600,
          y + photoH + 25,
          17,
          '#ffffff',
          'bold'
        )
      }
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      1715,
      20,
      '#ffffff',
      'normal'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 3. GRID
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'grid'
  ) {
    drawText(
      ctx,
      template.title,
      600,
      95,
      58,
      '#292524',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      145,
      22,
      '#57534e',
      'normal'
    )

    const positions = [
      [80, 220],
      [620, 220],
      [80, 930],
      [620, 930]
    ]

    images.forEach(
      (img, i) => {
        const [x, y] =
          positions[i]

        photoFrame(
          ctx,
          img,
          x,
          y,
          500,
          600,
          20
        )
      }
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 4. POLAROID
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'polaroid'
  ) {
    drawText(
      ctx,
      template.title,
      600,
      100,
      58,
      '#57534e',
      'bold',
      'Georgia'
    )

    const positions = [
      [100, 220],
      [610, 220],
      [100, 930],
      [610, 930]
    ]

    images.forEach(
      (img, i) => {
        const [x, y] =
          positions[i]

        ctx.save()

        ctx.translate(
          x + 220,
          y + 260
        )

        ctx.rotate(
          (i % 2 === 0 ? -2 : 2) *
            Math.PI /
            180
        )

        ctx.fillStyle =
          '#ffffff'

        ctx.fillRect(
          -220,
          -260,
          440,
          560
        )

        fitImage(
          ctx,
          img,
          -195,
          -235,
          390,
          390,
          '#f4f4f5'
        )

        drawText(
          ctx,
          `memory ${i + 1}`,
          0,
          250,
          19,
          '#44403c',
          'normal',
          'cursive'
        )

        ctx.restore()
      }
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 5. EDITORIAL
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'editorial'
  ) {
    drawText(
      ctx,
      'THE',
      600,
      75,
      24,
      '#44403c'
    )

    drawText(
      ctx,
      template.title,
      600,
      145,
      78,
      '#1c1917',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      200,
      18,
      '#78716c',
      'normal'
    )

    if (images[0]) {
      photoFrame(
        ctx,
        images[0],
        80,
        260,
        1040,
        500,
        8
      )
    }

    if (images[1]) {
      photoFrame(
        ctx,
        images[1],
        80,
        810,
        500,
        500,
        8
      )
    }

    if (images[2]) {
      photoFrame(
        ctx,
        images[2],
        620,
        810,
        500,
        500,
        8
      )
    }

    if (images[3]) {
      photoFrame(
        ctx,
        images[3],
        80,
        1360,
        1040,
        260,
        8
      )
    }
  }

  /*
  |--------------------------------------------------------------------------
  | 6. SCRAPBOOK
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'scrapbook'
  ) {
    drawText(
      ctx,
      template.title,
      600,
      95,
      65,
      '#be185d',
      'bold',
      'cursive'
    )

    const positions = [
      [100, 210, -3],
      [620, 210, 4],
      [100, 900, 3],
      [620, 900, -4]
    ]

    images.forEach(
      (img, i) => {
        const [x, y, rotation] =
          positions[i]

        ctx.save()

        ctx.translate(
          x + 220,
          y + 260
        )

        ctx.rotate(
          rotation *
            Math.PI /
            180
        )

        ctx.fillStyle =
          '#ffffff'

        ctx.fillRect(
          -220,
          -260,
          440,
          550
        )

        fitImage(
          ctx,
          img,
          -195,
          -235,
          390,
          390,
          '#f4f4f5'
        )

        drawText(
          ctx,
          '♡',
          0,
          250,
          32,
          '#ec4899'
        )

        ctx.restore()
      }
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      1650,
      30,
      '#be185d',
      'bold',
      'cursive'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 7. MAGAZINE
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'magazine'
  ) {
    ctx.fillStyle =
      '#18181b'

    ctx.fillRect(
      50,
      50,
      1100,
      1700
    )

    drawText(
      ctx,
      'SPECIAL',
      600,
      105,
      28,
      '#ffffff'
    )

    drawText(
      ctx,
      template.title,
      600,
      185,
      80,
      '#ffffff',
      'bold',
      'Georgia'
    )

    if (images[0]) {
      photoFrame(
        ctx,
        images[0],
        100,
        290,
        1000,
        600,
        4
      )
    }

    if (images[1]) {
      photoFrame(
        ctx,
        images[1],
        100,
        960,
        480,
        500,
        4
      )
    }

    if (images[2]) {
      photoFrame(
        ctx,
        images[2],
        620,
        960,
        480,
        500,
        4
      )
    }

    drawText(
      ctx,
      template.subtitle,
      600,
      1600,
      22,
      '#ffffff'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 8. RETRO
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'retro'
  ) {
    drawText(
      ctx,
      template.title,
      600,
      100,
      70,
      '#7f1d1d',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      155,
      20,
      '#7f1d1d'
    )

    const positions = [
      [90, 220],
      [620, 220],
      [90, 930],
      [620, 930]
    ]

    images.forEach(
      (img, i) => {
        const [x, y] =
          positions[i]

        ctx.fillStyle =
          '#fef3c7'

        ctx.fillRect(
          x,
          y,
          490,
          590
        )

        fitImage(
          ctx,
          img,
          x + 25,
          y + 25,
          440,
          480,
          '#ffffff'
        )

        drawText(
          ctx,
          'GOOD TIMES',
          x + 245,
          y + 550,
          18,
          '#7f1d1d',
          'bold',
          'Georgia'
        )
      }
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 9. MINIMAL
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'minimal'
  ) {
    drawText(
      ctx,
      template.title,
      600,
      75,
      48,
      '#18181b',
      'normal'
    )

    const photoW = 900
    const photoH = 330
    const x = 150

    images.forEach(
      (img, i) => {
        const y =
          160 +
          i * 390

        fitImage(
          ctx,
          img,
          x,
          y,
          photoW,
          photoH,
          '#ffffff'
        )
      }
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      1730,
      20,
      '#71717a',
      'normal'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 10. CUTE
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'cute'
  ) {
    drawText(
      ctx,
      '♡',
      600,
      75,
      70,
      '#db2777'
    )

    drawText(
      ctx,
      template.title,
      600,
      150,
      62,
      '#db2777',
      'bold',
      'cursive'
    )

    const positions = [
      [90, 250],
      [630, 250],
      [90, 900],
      [630, 900]
    ]

    images.forEach(
      (img, i) => {
        const [x, y] =
          positions[i]

        ctx.save()

        ctx.beginPath()

        ctx.roundRect(
          x,
          y,
          480,
          520,
          30
        )

        ctx.clip()

        fitImage(
          ctx,
          img,
          x,
          y,
          480,
          520,
          '#fdf2f8'
        )

        ctx.restore()
      }
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      1600,
      30,
      '#be185d',
      'bold',
      'cursive'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 11. DARK
  |--------------------------------------------------------------------------
  */
  else if (
    template.layout === 'dark'
  ) {
    ctx.fillStyle =
      '#101014'

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    drawText(
      ctx,
      template.title,
      600,
      90,
      70,
      '#ffffff',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      145,
      18,
      '#a1a1aa'
    )

    const photoW = 1000
    const photoH = 310
    const x = 100

    images.forEach(
      (img, i) => {
        fitImage(
          ctx,
          img,
          x,
          230 + i * 360,
          photoW,
          photoH,
          '#18181b'
        )
      }
    )

    drawText(
      ctx,
      '✦',
      600,
      1730,
      35,
      '#ffffff'
    )
  }

  /*
  |--------------------------------------------------------------------------
  | 12. CLASSIC
  |--------------------------------------------------------------------------
  */
  else {
    drawText(
      ctx,
      template.title,
      600,
      80,
      65,
      '#18181b',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.subtitle,
      600,
      135,
      20,
      '#71717a'
    )

    const photoW = 970
    const photoH = 300
    const x = 115

    images.forEach(
      (img, i) => {
        const y =
          200 +
          i * 370

        photoFrame(
          ctx,
          img,
          x - 15,
          y - 15,
          1000,
          330,
          4
        )

        fitImage(
          ctx,
          img,
          x,
          y,
          photoW,
          photoH,
          '#f4f4f5'
        )
      }
    )
  }

  /*
  |--------------------------------------------------------------------------
  | HASIL JPG
  |--------------------------------------------------------------------------
  */
  resultUrl.value =
    canvas.value.toDataURL(
      'image/jpeg',
      0.95
    )

  loading.value = false
}

/*
|--------------------------------------------------------------------------
| DOWNLOAD JPG
|--------------------------------------------------------------------------
*/
const download = async () => {
  if (!canvas.value) return

  try {
    canvas.value.toBlob(
      async (blob) => {
        if (!blob) return

        const filename =
          `photobooth-${String(
            template.name
          )
            .toLowerCase()
            .replace(/\s+/g, '-')}.jpg`

        const url =
          URL.createObjectURL(blob)

        const a =
          document.createElement('a')

        a.href = url
        a.download = filename
        a.style.display = 'none'

        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        setTimeout(() => {
          URL.revokeObjectURL(url)
        }, 1000)
      },
      'image/jpeg',
      0.95
    )
  } catch (error) {
    console.error(
      'Download gagal:',
      error
    )

    /*
    |--------------------------------------------------------------------------
    | FALLBACK HP
    |--------------------------------------------------------------------------
    */
    if (resultUrl.value) {
      window.open(
        resultUrl.value,
        '_blank'
      )
    }
  }
}

/*
|--------------------------------------------------------------------------
| FOTO LAGI
|--------------------------------------------------------------------------
*/
const retake = () => {
  navigateTo(
    `/camera?template=${template.id}`
  )
}

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/
const home = () => {
  navigateTo('/')
}
</script>

<template>
  <div class="page">

    <!-- HEADER -->
    <header class="header">

      <button
        class="home-button"
        @click="home"
      >
        ← Home
      </button>

      <strong class="logo">
        📸 Photobooth
      </strong>

      <span class="template-name">
        {{ template.name }}
      </span>

    </header>

    <!-- CONTENT -->
    <main class="main">

      <section class="heading">

        <small>
          YOUR RESULT
        </small>

        <h1>
          {{ template.title }}
        </h1>

        <p>
          {{ template.subtitle }}
        </p>

      </section>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="loading"
      >
        <div class="spinner"></div>

        <p>
          Membuat hasil foto...
        </p>
      </div>

      <!-- RESULT -->
      <section
        v-else-if="resultUrl"
        class="result"
      >

        <div class="image-box">

          <img
            :src="resultUrl"
            alt="Hasil Photobooth"
          >

        </div>

        <div class="buttons">

          <button
            class="download"
            @click="download"
          >
            ⬇ Download JPG
          </button>

          <button
            class="retake"
            @click="retake"
          >
            📸 Foto Lagi
          </button>

        </div>

        <p class="info">
          Hasil sudah digabung menjadi
          <b>1 gambar JPG</b>
        </p>

      </section>

      <!-- EMPTY -->
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
          Ambil foto terlebih dahulu.
        </p>

        <button
          class="download"
          @click="retake"
        >
          Ambil Foto
        </button>

      </section>

    </main>

    <!-- CANVAS -->
    <canvas
      ref="canvas"
      class="canvas"
    />

  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background: #fafafa;
  color: #18181b;
  font-family:
    Inter,
    Arial,
    sans-serif;
}

.header {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:
    0 5%;

  background: white;

  border-bottom:
    1px solid #e4e4e7;

  position: sticky;
  top: 0;

  z-index: 20;
}

.home-button {
  border: none;
  background: transparent;

  font-size: 15px;
  font-weight: 700;

  color: #52525b;

  cursor: pointer;
}

.logo {
  color: #7c3aed;
  font-size: 19px;
}

.template-name {
  color: #71717a;
  font-size: 13px;
}

/* MAIN */

.main {
  width: 92%;
  max-width: 850px;

  margin:
    0 auto;

  padding:
    45px 0 80px;
}

/* HEADING */

.heading {
  text-align: center;

  margin-bottom:
    30px;
}

.heading small {
  color: #7c3aed;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 3px;
}

.heading h1 {
  margin:
    8px 0;

  font-size: 40px;

  line-height: 1.1;
}

.heading p {
  margin: 0;

  color: #71717a;

  font-size: 15px;
}

/* RESULT */

.result {
  width: 100%;
}

/*
|--------------------------------------------------------------------------
| IMAGE PREVIEW
|--------------------------------------------------------------------------
*/

.image-box {
  width: 100%;
  max-width: 600px;

  margin:
    0 auto;

  padding: 12px;

  background:
    white;

  border-radius:
    22px;

  box-shadow:
    0 20px 60px
    rgba(0, 0, 0, 0.14);
}

.image-box img {
  width: 100%;

  height: auto;

  display: block;

  border-radius:
    12px;
}

/* BUTTON */

.buttons {
  display: flex;

  justify-content: center;

  gap: 12px;

  margin-top:
    25px;
}

.buttons button {
  border: none;

  padding:
    15px 28px;

  border-radius:
    14px;

  font-size: 15px;

  font-weight: 800;

  cursor: pointer;

  transition:
    transform 0.2s,
    opacity 0.2s;
}

.buttons button:active {
  transform:
    scale(0.97);
}

.download {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  color: white;

  box-shadow:
    0 10px 30px
    rgba(124, 58, 237, 0.25);
}

.retake {
  background:
    white;

  color:
    #52525b;

  border:
    1px solid #d4d4d8 !important;
}

/* INFO */

.info {
  text-align: center;

  color:
    #a1a1aa;

  font-size:
    13px;

  margin-top:
    18px;
}

/* LOADING */

.loading {
  text-align: center;

  padding:
    100px 0;

  color:
    #71717a;
}

.spinner {
  width: 42px;
  height: 42px;

  margin:
    0 auto 20px;

  border:
    4px solid #e4e4e7;

  border-top-color:
    #7c3aed;

  border-radius:
    50%;

  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

/* EMPTY */

.empty {
  text-align: center;

  padding:
    80px 30px;

  background:
    white;

  border-radius:
    20px;
}

.empty-icon {
  font-size:
    50px;
}

.empty h2 {
  margin:
    15px 0 8px;
}

.empty p {
  color:
    #71717a;

  margin-bottom:
    25px;
}

/* CANVAS */

.canvas {
  display: none;
}

/* MOBILE */

@media (max-width: 600px) {

  .header {
    height:
      62px;

    padding:
      0 18px;
  }

  .logo {
    font-size:
      17px;
  }

  .template-name {
    display:
      none;
  }

  .main {
    width:
      94%;

    padding:
      25px 0 60px;
  }

  .heading {
    margin-bottom:
      22px;
  }

  .heading h1 {
    font-size:
      30px;
  }

  .heading p {
    font-size:
      13px;
  }

  .image-box {
    padding:
      8px;

    border-radius:
      18px;
  }

  .image-box img {
    border-radius:
      10px;
  }

  .buttons {
    flex-direction:
      column;

    gap:
      10px;
  }

  .buttons button {
    width:
      100%;

    padding:
      16px;
  }
}
</style>