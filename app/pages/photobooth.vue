<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

interface Photo {
  src: string
}

interface Template {
  id: number
  name: string
  type: string
  bg: string
  text: string
  accent: string
}

const video = ref<HTMLVideoElement | null>(null)
const previewCanvas = ref<HTMLCanvasElement | null>(null)

const stream = ref<MediaStream | null>(null)

const cameraActive = ref(false)
const countdown = ref(0)
const capturing = ref(false)

const photos = ref<Photo[]>([])
const selectedTemplate = ref(1)

const name = ref('')

const templates: Template[] = [
  {
    id: 1,
    name: 'Sweet Pink',
    type: 'pink',
    bg: '#fce7f3',
    text: '#9d174d',
    accent: '#ec4899'
  },
  {
    id: 2,
    name: 'Black Elegant',
    type: 'black',
    bg: '#111111',
    text: '#ffffff',
    accent: '#d4af37'
  },
  {
    id: 3,
    name: 'Minimal White',
    type: 'minimal',
    bg: '#ffffff',
    text: '#222222',
    accent: '#111111'
  },
  {
    id: 4,
    name: 'Film Strip',
    type: 'film',
    bg: '#171717',
    text: '#ffffff',
    accent: '#ffffff'
  },
  {
    id: 5,
    name: 'Flower Love',
    type: 'flower',
    bg: '#fff1f2',
    text: '#be123c',
    accent: '#fb7185'
  },
  {
    id: 6,
    name: 'Magazine',
    type: 'magazine',
    bg: '#f5f5f4',
    text: '#18181b',
    accent: '#ef4444'
  },
  {
    id: 7,
    name: 'Polaroid',
    type: 'polaroid',
    bg: '#e5e7eb',
    text: '#111827',
    accent: '#ffffff'
  },
  {
    id: 8,
    name: 'Ocean Blue',
    type: 'blue',
    bg: '#dbeafe',
    text: '#1e3a8a',
    accent: '#2563eb'
  },
  {
    id: 9,
    name: 'Cute Pastel',
    type: 'pastel',
    bg: '#fef3c7',
    text: '#78350f',
    accent: '#f59e0b'
  },
  {
    id: 10,
    name: 'Luxury Gold',
    type: 'gold',
    bg: '#18181b',
    text: '#fef3c7',
    accent: '#d4af37'
  },
  {
    id: 11,
    name: 'Purple Night',
    type: 'purple',
    bg: '#2e1065',
    text: '#f5f3ff',
    accent: '#a855f7'
  },
  {
    id: 12,
    name: 'Vertical Collage',
    type: 'vertical',
    bg: '#fafafa',
    text: '#171717',
    accent: '#171717'
  }
]

const currentTemplate = () => {
  return templates.find(t => t.id === selectedTemplate.value) || templates[0]
}

/* ================================
   CAMERA
================================ */

const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: {
          ideal: 1280
        },
        height: {
          ideal: 720
        }
      },
      audio: false
    })

    await nextTick()

    if (video.value) {
      video.value.srcObject = stream.value
      await video.value.play()
      cameraActive.value = true
    }
  } catch (error) {
    console.error(error)

    alert(
      'Kamera tidak dapat digunakan. Pastikan izin kamera sudah diberikan pada browser.'
    )
  }
}

const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }

  cameraActive.value = false
}

/* ================================
   COUNTDOWN
================================ */

const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const runCountdown = async () => {
  capturing.value = true

  for (let i = 3; i >= 1; i--) {
    countdown.value = i
    await wait(1000)
  }

  countdown.value = 0
}

/* ================================
   CAPTURE PHOTO
================================ */

const capturePhoto = () => {
  if (!video.value) return

  const canvas = document.createElement('canvas')

  canvas.width = 1080
  canvas.height = 720

  const ctx = canvas.getContext('2d')

  if (!ctx) return

  const videoWidth = video.value.videoWidth
  const videoHeight = video.value.videoHeight

  const targetRatio = canvas.width / canvas.height
  const videoRatio = videoWidth / videoHeight

  let sx = 0
  let sy = 0
  let sw = videoWidth
  let sh = videoHeight

  if (videoRatio > targetRatio) {
    sw = videoHeight * targetRatio
    sx = (videoWidth - sw) / 2
  } else {
    sh = videoWidth / targetRatio
    sy = (videoHeight - sh) / 2
  }

  /*
    Mirror kamera agar seperti selfie
  */
  ctx.save()

  ctx.translate(canvas.width, 0)
  ctx.scale(-1, 1)

  ctx.drawImage(
    video.value,
    sx,
    sy,
    sw,
    sh,
    0,
    0,
    canvas.width,
    canvas.height
  )

  ctx.restore()

  photos.value.push({
    src: canvas.toDataURL('image/jpeg', 0.95)
  })
}

/* ================================
   TAKE 4 PHOTOS
================================ */

const takePhotos = async () => {
  if (!cameraActive.value) {
    await startCamera()
  }

  photos.value = []

  for (let i = 0; i < 4; i++) {
    await runCountdown()

    capturePhoto()

    await wait(800)
  }

  capturing.value = false

  await nextTick()

  drawPreview()
}

/* ================================
   IMAGE LOADER
================================ */

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = reject

    img.src = src
  })
}

/* ================================
   COVER IMAGE
================================ */

const drawCoverImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const imageRatio = img.width / img.height
  const boxRatio = width / height

  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (imageRatio > boxRatio) {
    sw = img.height * boxRatio
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / boxRatio
    sy = (img.height - sh) / 2
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
}

/* ================================
   ROUNDED RECTANGLE
================================ */

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath()

  ctx.moveTo(x + r, y)

  ctx.lineTo(x + w - r, y)

  ctx.quadraticCurveTo(
    x + w,
    y,
    x + w,
    y + r
  )

  ctx.lineTo(x + w, y + h - r)

  ctx.quadraticCurveTo(
    x + w,
    y + h,
    x + w - r,
    y + h
  )

  ctx.lineTo(x + r, y + h)

  ctx.quadraticCurveTo(
    x,
    y + h,
    x,
    y + h - r
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

/* ================================
   TEXT
================================ */

const centerText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) => {
  ctx.textAlign = 'center'
  ctx.fillText(text, x, y)
}

/* ================================
   DRAW TEMPLATE
================================ */

const drawPreview = async () => {
  if (!previewCanvas.value) return
  if (photos.value.length !== 4) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')

  if (!ctx) return

  const template = currentTemplate()

  canvas.width = 1080
  canvas.height = 1600

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = template.bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const images = await Promise.all(
    photos.value.map(photo => loadImage(photo.src))
  )

  /* ==================================
     TEMPLATE 1 - SWEET PINK
  ================================== */

  if (template.type === 'pink') {
    ctx.fillStyle = '#fce7f3'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#9d174d'
    ctx.font = 'bold 64px Arial'

    centerText(
      ctx,
      'LOVE',
      540,
      90
    )

    const positions = [
      [70, 140],
      [550, 140],
      [70, 650],
      [550, 650]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      ctx.save()

      roundedRect(
        ctx,
        x,
        y,
        460,
        440,
        30
      )

      ctx.clip()

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        460,
        440
      )

      ctx.restore()
    })

    ctx.fillStyle = '#9d174d'
    ctx.font = '34px Arial'

    centerText(
      ctx,
      name.value || 'memories',
      540,
      1180
    )

    ctx.font = '26px Arial'

    centerText(
      ctx,
      '♡ captured moments ♡',
      540,
      1230
    )
  }

  /* ==================================
     TEMPLATE 2 - BLACK ELEGANT
  ================================== */

  if (template.type === 'black') {
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 5

    ctx.strokeRect(
      35,
      35,
      1010,
      1530
    )

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px Georgia'

    centerText(
      ctx,
      'MOMENTS',
      540,
      110
    )

    images.forEach((img, i) => {
      const y = 150 + i * 330

      drawCoverImage(
        ctx,
        img,
        100,
        y,
        880,
        285
      )

      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 3

      ctx.strokeRect(
        100,
        y,
        880,
        285
      )
    })

    ctx.fillStyle = '#d4af37'
    ctx.font = '32px Arial'

    centerText(
      ctx,
      name.value || 'PHOTOBOOTH',
      540,
      1510
    )
  }

  /* ==================================
     TEMPLATE 3 - MINIMAL
  ================================== */

  if (template.type === 'minimal') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#111111'
    ctx.font = 'bold 54px Arial'

    centerText(
      ctx,
      name.value || 'MEMORIES',
      540,
      90
    )

    const positions = [
      [60, 140],
      [555, 140],
      [60, 650],
      [555, 650]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        465,
        465
      )
    })

    ctx.fillStyle = '#777777'
    ctx.font = '24px Arial'

    centerText(
      ctx,
      'PHOTOBOOTH • 2026',
      540,
      1220
    )
  }

  /* ==================================
     TEMPLATE 4 - FILM STRIP
  ================================== */

  if (template.type === 'film') {
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'

    centerText(
      ctx,
      'FILM STRIP',
      540,
      65
    )

    const x = 120
    const width = 840
    const height = 335

    images.forEach((img, i) => {
      const y = 100 + i * 370

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        width,
        height
      )

      ctx.fillStyle = '#ffffff'

      for (let hole = 0; hole < 7; hole++) {
        ctx.fillRect(
          40,
          y + hole * 48,
          45,
          25
        )

        ctx.fillRect(
          995,
          y + hole * 48,
          45,
          25
        )
      }
    })
  }

  /* ==================================
     TEMPLATE 5 - FLOWER LOVE
  ================================== */

  if (template.type === 'flower') {
    ctx.fillStyle = '#fff1f2'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#be123c'
    ctx.font = 'bold 70px Georgia'

    centerText(
      ctx,
      'LOVE',
      540,
      100
    )

    ctx.font = '38px Arial'

    centerText(
      ctx,
      '♡ forever memories ♡',
      540,
      150
    )

    const positions = [
      [80, 200],
      [570, 200],
      [80, 700],
      [570, 700]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      ctx.save()

      roundedRect(
        ctx,
        x,
        y,
        430,
        430,
        40
      )

      ctx.clip()

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        430,
        430
      )

      ctx.restore()
    })

    ctx.fillStyle = '#fb7185'
    ctx.font = '50px Arial'

    centerText(
      ctx,
      '♥',
      540,
      1250
    )
  }

  /* ==================================
     TEMPLATE 6 - MAGAZINE
  ================================== */

  if (template.type === 'magazine') {
    ctx.fillStyle = '#f5f5f4'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#111111'
    ctx.font = 'bold 70px Arial'

    centerText(
      ctx,
      'VIBE',
      540,
      100
    )

    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 26px Arial'

    centerText(
      ctx,
      'SPECIAL EDITION',
      540,
      145
    )

    drawCoverImage(
      ctx,
      images[0],
      70,
      190,
      940,
      550
    )

    drawCoverImage(
      ctx,
      images[1],
      70,
      780,
      450,
      450
    )

    drawCoverImage(
      ctx,
      images[2],
      560,
      780,
      450,
      450
    )

    drawCoverImage(
      ctx,
      images[3],
      70,
      1270,
      940,
      220
    )

    ctx.fillStyle = '#111111'
    ctx.font = 'bold 30px Arial'

    centerText(
      ctx,
      name.value || 'YOUR STORY',
      540,
      1540
    )
  }

  /* ==================================
     TEMPLATE 7 - POLAROID
  ================================== */

  if (template.type === 'polaroid') {
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#111827'
    ctx.font = 'bold 58px Georgia'

    centerText(
      ctx,
      'POLAROID',
      540,
      90
    )

    const positions = [
      [70, 150],
      [570, 150],
      [70, 720],
      [570, 720]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      ctx.fillStyle = '#ffffff'

      ctx.fillRect(
        x,
        y,
        440,
        500
      )

      drawCoverImage(
        ctx,
        img,
        x + 20,
        y + 20,
        400,
        390
      )

      ctx.fillStyle = '#111827'
      ctx.font = '22px Arial'

      centerText(
        ctx,
        `MEMORY ${i + 1}`,
        x + 220,
        y + 455
      )
    })
  }

  /* ==================================
     TEMPLATE 8 - OCEAN BLUE
  ================================== */

  if (template.type === 'blue') {
    ctx.fillStyle = '#dbeafe'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#1e3a8a'
    ctx.font = 'bold 64px Arial'

    centerText(
      ctx,
      'GOOD VIBES',
      540,
      100
    )

    const positions = [
      [70, 170],
      [550, 170],
      [70, 650],
      [550, 650]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      ctx.save()

      roundedRect(
        ctx,
        x,
        y,
        460,
        420,
        25
      )

      ctx.clip()

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        460,
        420
      )

      ctx.restore()
    })

    ctx.fillStyle = '#1e3a8a'
    ctx.font = '30px Arial'

    centerText(
      ctx,
      name.value || 'good memories',
      540,
      1190
    )
  }

  /* ==================================
     TEMPLATE 9 - CUTE PASTEL
  ================================== */

  if (template.type === 'pastel') {
    ctx.fillStyle = '#fef3c7'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#78350f'
    ctx.font = 'bold 58px Arial'

    centerText(
      ctx,
      'CUTIE MOMENTS',
      540,
      100
    )

    const positions = [
      [80, 170],
      [570, 170],
      [80, 670],
      [570, 670]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      ctx.save()

      roundedRect(
        ctx,
        x,
        y,
        430,
        430,
        80
      )

      ctx.clip()

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        430,
        430
      )

      ctx.restore()
    })

    ctx.fillStyle = '#f59e0b'
    ctx.font = '60px Arial'

    centerText(
      ctx,
      '✦ ✦ ✦',
      540,
      1240
    )

    ctx.fillStyle = '#78350f'
    ctx.font = '30px Arial'

    centerText(
      ctx,
      name.value || 'sweet memories',
      540,
      1300
    )
  }

  /* ==================================
     TEMPLATE 10 - GOLD
  ================================== */

  if (template.type === 'gold') {
    ctx.fillStyle = '#18181b'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.strokeStyle = '#d4af37'
    ctx.lineWidth = 6

    ctx.strokeRect(
      40,
      40,
      1000,
      1520
    )

    ctx.fillStyle = '#fef3c7'
    ctx.font = 'bold 60px Georgia'

    centerText(
      ctx,
      'LUXURY',
      540,
      110
    )

    images.forEach((img, i) => {
      const y = 150 + i * 330

      drawCoverImage(
        ctx,
        img,
        150,
        y,
        780,
        280
      )

      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 3

      ctx.strokeRect(
        150,
        y,
        780,
        280
      )
    })

    ctx.fillStyle = '#d4af37'
    ctx.font = '30px Arial'

    centerText(
      ctx,
      name.value || 'SPECIAL MOMENT',
      540,
      1510
    )
  }

  /* ==================================
     TEMPLATE 11 - PURPLE NIGHT
  ================================== */

  if (template.type === 'purple') {
    ctx.fillStyle = '#2e1065'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#f5f3ff'
    ctx.font = 'bold 65px Arial'

    centerText(
      ctx,
      'NIGHT VIBES',
      540,
      100
    )

    const positions = [
      [70, 170],
      [550, 170],
      [70, 660],
      [550, 660]
    ]

    images.forEach((img, i) => {
      const [x, y] = positions[i]

      ctx.save()

      roundedRect(
        ctx,
        x,
        y,
        460,
        430,
        35
      )

      ctx.clip()

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        460,
        430
      )

      ctx.restore()
    })

    ctx.fillStyle = '#c4b5fd'
    ctx.font = '32px Arial'

    centerText(
      ctx,
      name.value || 'PURPLE MEMORIES',
      540,
      1190
    )
  }

  /* ==================================
     TEMPLATE 12 - VERTICAL COLLAGE
  ================================== */

  if (template.type === 'vertical') {
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, 1080, 1600)

    ctx.fillStyle = '#171717'
    ctx.font = 'bold 58px Arial'

    centerText(
      ctx,
      'MEMORIES',
      540,
      85
    )

    ctx.fillStyle = '#777777'
    ctx.font = '22px Arial'

    centerText(
      ctx,
      name.value || 'PHOTOBOOTH',
      540,
      125
    )

    /*
      FOTO BENAR-BENAR VERTIKAL
    */

    const x = 100
    const width = 880
    const height = 300

    images.forEach((img, i) => {
      const y = 165 + i * 345

      drawCoverImage(
        ctx,
        img,
        x,
        y,
        width,
        height
      )

      ctx.fillStyle = '#171717'
      ctx.font = '18px Arial'

      ctx.textAlign = 'left'

      ctx.fillText(
        `0${i + 1}`,
        50,
        y + 35
      )
    })

    ctx.fillStyle = '#171717'
    ctx.font = '28px Arial'

    centerText(
      ctx,
      'EVERY MOMENT MATTERS',
      540,
      1540
    )
  }
}

/* ================================
   DOWNLOAD
================================ */

const downloadPhoto = async () => {
  if (photos.value.length !== 4) {
    alert('Ambil 4 foto terlebih dahulu.')
    return
  }

  await drawPreview()

  await nextTick()

  const canvas = previewCanvas.value

  if (!canvas) return

  const link = document.createElement('a')

  link.download =
    `photobooth-${currentTemplate().name.toLowerCase().replaceAll(' ', '-')}.jpg`

  link.href = canvas.toDataURL(
    'image/jpeg',
    0.95
  )

  link.click()
}

/* ================================
   TEMPLATE CHANGE
================================ */

const selectTemplate = async (id: number) => {
  selectedTemplate.value = id

  if (photos.value.length === 4) {
    await nextTick()
    drawPreview()
  }
}

/* ================================
   RESET
================================ */

const resetPhotos = () => {
  photos.value = []
  countdown.value = 0
  capturing.value = false

  if (previewCanvas.value) {
    const ctx = previewCanvas.value.getContext('2d')

    if (ctx) {
      ctx.clearRect(
        0,
        0,
        previewCanvas.value.width,
        previewCanvas.value.height
      )
    }
  }
}

onMounted(() => {
  startCamera()
})

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <div class="page">

    <!-- HEADER -->

    <header class="header">
      <div>
        <h1>📸 PhotoBooth</h1>
        <p>Buat foto kerenmu sendiri</p>
      </div>

      <div class="badge">
        {{ photos.length }}/4 Foto
      </div>
    </header>

    <!-- MAIN -->

    <main class="container">

      <!-- CAMERA -->

      <section class="camera-card">

        <div class="camera">

          <video
            ref="video"
            autoplay
            playsinline
            muted
          ></video>

          <div
            v-if="countdown > 0"
            class="countdown"
          >
            {{ countdown }}
          </div>

          <div
            v-if="!cameraActive"
            class="camera-off"
          >
            <div>📷</div>
            <p>Kamera belum aktif</p>

            <button
              class="primary"
              @click="startCamera"
            >
              Aktifkan Kamera
            </button>
          </div>

        </div>

        <div class="camera-actions">

          <button
            class="primary big"
            :disabled="capturing"
            @click="takePhotos"
          >
            {{ capturing ? '📸 Mengambil Foto...' : '📸 Ambil 4 Foto' }}
          </button>

          <button
            class="secondary"
            @click="resetPhotos"
          >
            🔄 Ulangi
          </button>

        </div>

        <input
          v-model="name"
          class="name-input"
          placeholder="Masukkan nama / judul foto"
          @input="drawPreview"
        />

      </section>

      <!-- TEMPLATE -->

      <section class="template-section">

        <div class="section-title">
          <h2>✨ Pilih Template</h2>
          <span>12 pilihan</span>
        </div>

        <div class="templates">

          <button
            v-for="template in templates"
            :key="template.id"
            class="template"
            :class="{
              active: selectedTemplate === template.id
            }"
            @click="selectTemplate(template.id)"
          >

            <div
              class="template-preview"
              :style="{
                background: template.bg,
                color: template.text
              }"
            >

              <div class="mini-title">
                {{ template.name }}
              </div>

              <div class="mini-grid">

                <div
                  v-for="n in 4"
                  :key="n"
                  class="mini-photo"
                  :style="{
                    background: template.accent
                  }"
                >
                  <span>📷</span>
                </div>

              </div>

              <div class="mini-footer">
                {{ name || 'PHOTOBOOTH' }}
              </div>

            </div>

            <div class="template-name">
              {{ template.name }}
            </div>

          </button>

        </div>

      </section>

      <!-- RESULT -->

      <section
        v-if="photos.length === 4"
        class="result"
      >

        <div class="result-header">

          <div>
            <h2>🎉 Hasil Foto</h2>
            <p>
              Template:
              <strong>
                {{ currentTemplate().name }}
              </strong>
            </p>
          </div>

          <button
            class="download"
            @click="downloadPhoto"
          >
            ⬇️ Download Foto
          </button>

        </div>

        <div class="canvas-wrapper">
          <canvas
            ref="previewCanvas"
          ></canvas>
        </div>

        <p class="download-info">
          Hasil download menggunakan ukuran portrait 1080 × 1600 px.
        </p>

      </section>

    </main>

    <footer>
      <p>
        📸 PhotoBooth • Buat dan simpan momen terbaikmu
      </p>
    </footer>

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
      circle at top,
      #fdf2f8,
      #f8fafc 45%,
      #eef2ff
    );
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

/* HEADER */

.header {
  width: min(1200px, 94%);
  margin: auto;
  padding: 30px 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
}

.header p {
  margin: 5px 0 0;
  color: #71717a;
}

.badge {
  padding: 10px 18px;
  border-radius: 999px;
  background: white;
  border: 1px solid #e4e4e7;
  font-weight: 700;
}

/* CONTAINER */

.container {
  width: min(1200px, 94%);
  margin: auto;
}

/* CAMERA */

.camera-card {
  background: rgba(255, 255, 255, .85);
  border: 1px solid #e4e4e7;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .08);
}

.camera {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 22px;
  background: #09090b;
}

.camera video {
  width: 100%;
  height: 100%;
  object-fit: cover;

  /*
    Selfie mirror
  */
  transform: scaleX(-1);
}

.countdown {
  position: absolute;
  inset: 0;

  display: grid;
  place-items: center;

  font-size: clamp(100px, 20vw, 220px);
  font-weight: 900;

  color: white;
  text-shadow:
    0 5px 30px rgba(0, 0, 0, .5);
}

.camera-off {
  position: absolute;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  color: white;
}

.camera-off div {
  font-size: 70px;
}

.camera-off p {
  margin: 10px 0 20px;
}

/* ACTION */

.camera-actions {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

button {
  border: 0;
  cursor: pointer;
  font-family: inherit;
}

.primary {
  background: #ec4899;
  color: white;
  padding: 13px 22px;
  border-radius: 14px;
  font-weight: 700;

  box-shadow:
    0 10px 25px rgba(236, 72, 153, .25);

  transition: .2s;
}

.primary:hover {
  transform: translateY(-2px);
  background: #db2777;
}

.primary:disabled {
  opacity: .5;
  cursor: not-allowed;
  transform: none;
}

.big {
  flex: 1;
  font-size: 17px;
}

.secondary {
  padding: 13px 22px;
  border-radius: 14px;
  background: #f4f4f5;
  color: #18181b;
  font-weight: 700;
}

.name-input {
  width: 100%;
  margin-top: 14px;

  border: 1px solid #e4e4e7;
  border-radius: 14px;
  padding: 14px 16px;

  font-size: 16px;
  outline: none;
}

.name-input:focus {
  border-color: #ec4899;
}

/* TEMPLATE */

.template-section {
  margin-top: 30px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 16px;
}

.section-title h2 {
  margin: 0;
  font-size: 25px;
}

.section-title span {
  color: #71717a;
}

/* TEMPLATE GRID */

.templates {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 16px;
}

.template {
  padding: 8px;
  background: white;

  border: 2px solid transparent;
  border-radius: 18px;

  transition: .2s;
}

.template:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, .08);
}

.template.active {
  border-color: #ec4899;
}

/* MINI PREVIEW */

.template-preview {
  aspect-ratio: 3 / 4;

  border-radius: 13px;
  padding: 10px;

  overflow: hidden;
}

.mini-title {
  font-size: 11px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 8px;
}

.mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.mini-photo {
  aspect-ratio: 1 / 1;

  display: grid;
  place-items: center;

  border-radius: 5px;

  opacity: .65;
}

.mini-photo span {
  font-size: 13px;
  filter: grayscale(1);
}

.mini-footer {
  margin-top: 8px;

  font-size: 8px;
  text-align: center;
}

/* TEMPLATE NAME */

.template-name {
  padding: 9px 3px 4px;

  font-size: 13px;
  font-weight: 700;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* RESULT */

.result {
  margin-top: 40px;

  background: white;
  border: 1px solid #e4e4e7;
  border-radius: 28px;

  padding: 24px;

  box-shadow:
    0 20px 60px rgba(0, 0, 0, .07);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 25px;
}

.result-header h2 {
  margin: 0;
  font-size: 25px;
}

.result-header p {
  color: #71717a;
}

.download {
  padding: 14px 22px;

  border-radius: 14px;

  background: #18181b;
  color: white;

  font-weight: 800;

  transition: .2s;
}

.download:hover {
  transform: translateY(-2px);
  background: #27272a;
}

/* CANVAS */

.canvas-wrapper {
  display: flex;
  justify-content: center;

  width: 100%;
  padding: 20px;

  background: #f4f4f5;
  border-radius: 20px;
}

.canvas-wrapper canvas {
  width: min(100%, 540px);
  height: auto;

  display: block;

  border-radius: 4px;

  box-shadow:
    0 20px 50px rgba(0, 0, 0, .2);
}

.download-info {
  text-align: center;
  color: #71717a;
  font-size: 14px;
}

/* FOOTER */

footer {
  text-align: center;
  padding: 40px 20px;
  color: #71717a;
}

/* MOBILE */

@media (max-width: 800px) {

  .header {
    padding-top: 20px;
  }

  .header h1 {
    font-size: 25px;
  }

  .templates {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .camera-actions {
    flex-direction: column;
  }

  .result-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .download {
    width: 100%;
  }

  .camera-card,
  .result {
    padding: 15px;
    border-radius: 20px;
  }

}

@media (max-width: 450px) {

  .templates {
    gap: 10px;
  }

  .template {
    padding: 5px;
  }

  .template-name {
    font-size: 11px;
  }

}

</style>