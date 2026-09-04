<template>
  <main class="booth">

    <!-- HEADER -->
    <header class="topbar">
      <NuxtLink to="/" class="logo">
        <span>📸</span>
        PHOTOBOOTH
      </NuxtLink>

      <div class="steps">
        <div :class="{ active: step === 1 }">01 TEMPLATE</div>
        <div :class="{ active: step === 2 }">02 CAMERA</div>
        <div :class="{ active: step === 3 }">03 RESULT</div>
      </div>
    </header>


    <!-- =====================================================
         STEP 1 : TEMPLATE
    ====================================================== -->

    <section v-if="step === 1" class="page-section">

      <div class="heading">
        <div class="eyebrow">STEP 01</div>

        <h1>
          Choose your
          <span>template.</span>
        </h1>

        <p>
          Pilih desain favoritmu untuk hasil photobooth.
        </p>
      </div>


      <div class="templates-grid">

        <button
          v-for="template in templates"
          :key="template.id"
          class="template-card"
          :class="{
            selected: selectedTemplate === template.id
          }"
          @click="selectedTemplate = template.id"
        >

          <!-- TEMPLATE PREVIEW -->

          <div
            class="template-preview"
            :class="`preview-${template.layout}`"
            :style="template.previewStyle"
          >

            <div class="preview-decor decor-top">
              {{ template.icon }}
            </div>

            <div class="preview-title">
              {{ template.title }}
            </div>


            <!-- GRID 2x2 -->

            <div
              v-if="template.layout === 'grid'"
              class="preview-grid"
            >
              <div v-for="n in 4" :key="n">
                {{ n }}
              </div>
            </div>


            <!-- POLAROID -->

            <div
              v-else-if="template.layout === 'polaroid'"
              class="preview-polaroids"
            >
              <div class="polaroid p1">1</div>
              <div class="polaroid p2">2</div>
              <div class="polaroid p3">3</div>
            </div>


            <!-- BIG + SMALL -->

            <div
              v-else-if="template.layout === 'big-small'"
              class="preview-big-small"
            >
              <div class="big">1</div>

              <div class="small-stack">
                <div>2</div>
                <div>3</div>
                <div>4</div>
              </div>
            </div>


            <!-- CLASSIC STRIP -->

            <div
              v-else-if="template.layout === 'strip'"
              class="preview-strip"
            >
              <div v-for="n in 4" :key="n">
                {{ n }}
              </div>
            </div>


            <!-- DIAGONAL -->

            <div
              v-else-if="template.layout === 'diagonal'"
              class="preview-diagonal"
            >
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>


            <!-- HERO -->

            <div
              v-else-if="template.layout === 'hero'"
              class="preview-hero"
            >
              <div class="hero-photo">1</div>

              <div class="hero-small">
                <div>2</div>
                <div>3</div>
                <div>4</div>
              </div>
            </div>


            <!-- THREE -->

            <div
              v-else-if="template.layout === 'three'"
              class="preview-three"
            >
              <div>1</div>

              <div class="three-bottom">
                <div>2</div>
                <div>3</div>
              </div>
            </div>


            <!-- MAGAZINE -->

            <div
              v-else-if="template.layout === 'magazine'"
              class="preview-magazine"
            >
              <div class="mag-large">1</div>

              <div class="mag-small">
                <div>2</div>
                <div>3</div>
                <div>4</div>
              </div>
            </div>


            <!-- FRAME -->

            <div
              v-else-if="template.layout === 'frame'"
              class="preview-frame"
            >
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>


            <!-- POSTER -->

            <div
              v-else-if="template.layout === 'poster'"
              class="preview-poster"
            >
              <div class="poster-main">1</div>

              <div class="poster-row">
                <div>2</div>
                <div>3</div>
                <div>4</div>
              </div>
            </div>


            <!-- MASONRY -->

            <div
              v-else-if="template.layout === 'masonry'"
              class="preview-masonry"
            >
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>


            <!-- MINIMAL -->

            <div
              v-else-if="template.layout === 'minimal'"
              class="preview-minimal"
            >
              <div>1</div>
              <div>2</div>
              <div>3</div>
              <div>4</div>
            </div>


            <div class="preview-subtitle">
              {{ template.subtitle }}
            </div>

          </div>


          <div class="template-info">

            <div>
              <strong>{{ template.name }}</strong>

              <small>
                {{ template.description }}
              </small>
            </div>

            <div
              class="check"
              :class="{
                checked: selectedTemplate === template.id
              }"
            >
              {{ selectedTemplate === template.id ? '✓' : '' }}
            </div>

          </div>

        </button>

      </div>


      <button
        class="primary-button"
        @click="step = 2"
      >
        Lanjut ke Kamera
        <span>→</span>
      </button>

    </section>


    <!-- =====================================================
         STEP 2 : CAMERA
    ====================================================== -->

    <section
      v-if="step === 2"
      class="page-section camera-page"
    >

      <div class="heading">

        <div class="eyebrow">STEP 02</div>

        <h1>
          Ready,
          <span>Smile!</span>
        </h1>

        <p>
          Ambil 4 foto untuk membuat hasil photobooth.
        </p>

      </div>


      <div class="camera-wrapper">

        <video
          ref="video"
          autoplay
          playsinline
          muted
        ></video>


        <div
          v-if="!cameraActive"
          class="camera-overlay"
        >

          <div class="camera-icon">
            📷
          </div>

          <h2>
            Kamera belum aktif
          </h2>

          <p>
            Tekan tombol di bawah untuk mengaktifkan kamera.
          </p>

          <button
            class="camera-button"
            @click="startCamera"
          >
            Aktifkan Kamera
          </button>

        </div>


        <div
          v-if="countdown > 0"
          class="countdown"
        >
          {{ countdown }}
        </div>


        <div class="photo-number">

          {{ Math.min(photos.length + 1, 4) }} / 4

        </div>

      </div>


      <!-- COUNTER -->

      <div class="photo-counter">

        <div
          v-for="n in 4"
          :key="n"
          class="counter-item"
          :class="{
            completed: photos.length >= n
          }"
        >

          <span v-if="photos.length >= n">
            ✓
          </span>

          <span v-else>
            {{ n }}
          </span>

        </div>

      </div>


      <!-- CAPTURE -->

      <button
        v-if="cameraActive && photos.length < 4"
        class="capture-button"
        :disabled="countdown > 0"
        @click="capturePhoto"
      >

        <span class="capture-circle">
          📸
        </span>

        <span>
          {{ countdown > 0 ? `Foto dalam ${countdown}` : 'Ambil Foto' }}
        </span>

      </button>


      <!-- DONE -->

      <button
        v-if="photos.length === 4"
        class="primary-button"
        @click="createResult"
      >
        Lihat Hasil
        <span>→</span>
      </button>


      <button
        class="secondary-button"
        @click="goBackTemplate"
      >
        ← Ganti Template
      </button>

    </section>


    <!-- =====================================================
         STEP 3 : RESULT
    ====================================================== -->

    <section
      v-if="step === 3"
      class="page-section result-page"
    >

      <div class="heading">

        <div class="eyebrow">STEP 03</div>

        <h1>
          Your moment,
          <span>captured.</span>
        </h1>

        <p>
          Hasil photobooth kamu sudah siap.
        </p>

      </div>


      <!-- RESULT PREVIEW -->

      <div
        ref="resultPreview"
        class="result-preview"
        :class="`result-${currentTemplate.layout}`"
        :style="currentTemplate.previewStyle"
      >

        <!-- GRID -->

        <template v-if="currentTemplate.layout === 'grid'">

          <div class="result-header">
            <span>{{ currentTemplate.icon }}</span>
            {{ currentTemplate.title }}
          </div>

          <div class="result-grid">

            <div
              v-for="(photo, index) in photos"
              :key="index"
              class="result-grid-photo"
            >
              <img :src="photo">
            </div>

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- POLAROID -->

        <template v-else-if="currentTemplate.layout === 'polaroid'">

          <div class="result-polaroid-title">
            {{ currentTemplate.title }}
          </div>

          <div class="polaroid-stack">

            <div
              v-for="(photo, index) in photos"
              :key="index"
              class="result-polaroid"
              :class="`rotate-${index}`"
            >

              <img :src="photo">

              <span>
                {{ index + 1 }}
              </span>

            </div>

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- BIG SMALL -->

        <template v-else-if="currentTemplate.layout === 'big-small'">

          <div class="result-header">
            {{ currentTemplate.title }}
          </div>

          <div class="big-small-layout">

            <div class="big-photo">
              <img :src="photos[0]">
            </div>

            <div class="small-photos">

              <img
                v-for="photo in photos.slice(1)"
                :key="photo"
                :src="photo"
              >

            </div>

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- STRIP -->

        <template v-else-if="currentTemplate.layout === 'strip'">

          <div class="strip-title">
            {{ currentTemplate.icon }}
            {{ currentTemplate.title }}
          </div>

          <div class="strip-photos">

            <img
              v-for="photo in photos"
              :key="photo"
              :src="photo"
            >

          </div>

          <div class="strip-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- DIAGONAL -->

        <template v-else-if="currentTemplate.layout === 'diagonal'">

          <div class="diagonal-title">
            {{ currentTemplate.title }}
          </div>

          <div class="diagonal-layout">

            <img
              v-for="(photo,index) in photos"
              :key="photo"
              :src="photo"
              :class="`diag-${index}`"
            >

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- HERO -->

        <template v-else-if="currentTemplate.layout === 'hero'">

          <div class="hero-title">
            {{ currentTemplate.title }}
          </div>

          <img
            class="hero-main-photo"
            :src="photos[0]"
          >

          <div class="hero-bottom">

            <img
              v-for="photo in photos.slice(1)"
              :key="photo"
              :src="photo"
            >

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- THREE -->

        <template v-else-if="currentTemplate.layout === 'three'">

          <div class="three-title">
            {{ currentTemplate.icon }}
            {{ currentTemplate.title }}
          </div>

          <img
            class="three-main"
            :src="photos[0]"
          >

          <div class="three-bottom-result">

            <img
              v-for="photo in photos.slice(1,3)"
              :key="photo"
              :src="photo"
            >

          </div>

          <img
            class="three-last"
            :src="photos[3]"
          >

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- MAGAZINE -->

        <template v-else-if="currentTemplate.layout === 'magazine'">

          <div class="magazine-title">
            {{ currentTemplate.title }}
          </div>

          <div class="magazine-layout">

            <img
              class="magazine-large"
              :src="photos[0]"
            >

            <div class="magazine-side">

              <img
                v-for="photo in photos.slice(1)"
                :key="photo"
                :src="photo"
              >

            </div>

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- FRAME -->

        <template v-else-if="currentTemplate.layout === 'frame'">

          <div class="frame-border">

            <div class="frame-title">
              {{ currentTemplate.icon }}
              {{ currentTemplate.title }}
            </div>

            <div class="frame-layout">

              <img
                v-for="photo in photos"
                :key="photo"
                :src="photo"
              >

            </div>

            <div class="frame-footer">
              {{ caption || currentTemplate.subtitle }}
            </div>

          </div>

        </template>


        <!-- POSTER -->

        <template v-else-if="currentTemplate.layout === 'poster'">

          <div class="poster-title">
            {{ currentTemplate.icon }}
            {{ currentTemplate.title }}
          </div>

          <img
            class="poster-main"
            :src="photos[0]"
          >

          <div class="poster-small-row">

            <img
              v-for="photo in photos.slice(1)"
              :key="photo"
              :src="photo"
            >

          </div>

          <div class="poster-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- MASONRY -->

        <template v-else-if="currentTemplate.layout === 'masonry'">

          <div class="masonry-title">
            {{ currentTemplate.title }}
          </div>

          <div class="masonry-layout">

            <img
              class="masonry-one"
              :src="photos[0]"
            >

            <img
              class="masonry-two"
              :src="photos[1]"
            >

            <img
              class="masonry-three"
              :src="photos[2]"
            >

            <img
              class="masonry-four"
              :src="photos[3]"
            >

          </div>

          <div class="result-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>


        <!-- MINIMAL -->

        <template v-else-if="currentTemplate.layout === 'minimal'">

          <div class="minimal-title">
            {{ currentTemplate.title }}
          </div>

          <div class="minimal-layout">

            <img
              v-for="photo in photos"
              :key="photo"
              :src="photo"
            >

          </div>

          <div class="minimal-footer">
            {{ caption || currentTemplate.subtitle }}
          </div>

        </template>

      </div>


      <!-- ACTIONS -->

      <div class="result-actions">

        <input
          v-model="caption"
          type="text"
          maxlength="40"
          placeholder="Tulis nama / pesan..."
        >

        <button
          class="download-button"
          :disabled="isDownloading"
          @click="downloadResult"
        >

          <span v-if="!isDownloading">
            ⬇ Download JPG
          </span>

          <span v-else>
            Membuat foto...
          </span>

        </button>

        <button
          class="secondary-button"
          @click="resetAll"
        >
          🔄 Ambil Foto Lagi
        </button>

      </div>

    </section>


    <!-- CANVAS UNTUK DOWNLOAD -->

    <canvas
      ref="canvas"
      class="hidden-canvas"
    ></canvas>

  </main>
</template>


<script setup>

import {
  ref,
  computed,
  onBeforeUnmount
} from 'vue'


/* =====================================================
   STATE
===================================================== */

const step = ref(1)

const selectedTemplate = ref('love')

const caption = ref('')

const photos = ref([])

const countdown = ref(0)

const cameraActive = ref(false)

const isDownloading = ref(false)

const video = ref(null)

const canvas = ref(null)

const resultPreview = ref(null)

const stream = ref(null)


/* =====================================================
   12 TEMPLATE
===================================================== */

const templates = [

  {
    id: 'love',
    name: 'Love',
    description: 'Romantic 2 × 2',
    title: 'OUR LOVE',
    subtitle: 'Made With Love ♥',
    icon: '♥',
    layout: 'grid',
    previewStyle: {
      background:
        'linear-gradient(145deg,#831843,#fb7185)',
      color: '#ffffff'
    }
  },

  {
    id: 'polaroid',
    name: 'Polaroid',
    description: 'Classic memories',
    title: 'MEMORIES',
    subtitle: 'Captured Moments',
    icon: '✦',
    layout: 'polaroid',
    previewStyle: {
      background:
        'linear-gradient(145deg,#f5f5f4,#d6d3d1)',
      color: '#292524'
    }
  },

  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Big photo + mini',
    title: 'HAPPY BIRTHDAY',
    subtitle: 'Make A Wish ✨',
    icon: '🎂',
    layout: 'big-small',
    previewStyle: {
      background:
        'linear-gradient(145deg,#6d28d9,#ec4899)',
      color: '#ffffff'
    }
  },

  {
    id: 'classic',
    name: 'Classic Strip',
    description: 'Traditional strip',
    title: 'PHOTOBOOTH',
    subtitle: 'Good Times',
    icon: '✦',
    layout: 'strip',
    previewStyle: {
      background:
        'linear-gradient(145deg,#1c1917,#57534e)',
      color: '#ffffff'
    }
  },

  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Elegant diagonal',
    title: 'THE WEDDING',
    subtitle: 'Together Forever',
    icon: '♢',
    layout: 'diagonal',
    previewStyle: {
      background:
        'linear-gradient(145deg,#292524,#b59b64)',
      color: '#ffffff'
    }
  },

  {
    id: 'summer',
    name: 'Summer',
    description: 'Bright & cheerful',
    title: 'SUMMER DAYS',
    subtitle: 'Good Vibes Only ☀',
    icon: '☀',
    layout: 'hero',
    previewStyle: {
      background:
        'linear-gradient(145deg,#0284c7,#facc15)',
      color: '#ffffff'
    }
  },

  {
    id: 'graduation',
    name: 'Graduation',
    description: 'Three photo style',
    title: 'GRADUATION',
    subtitle: 'The Beginning',
    icon: '🎓',
    layout: 'three',
    previewStyle: {
      background:
        'linear-gradient(145deg,#172554,#3b82f6)',
      color: '#ffffff'
    }
  },

  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Editorial layout',
    title: 'MOMENTS',
    subtitle: 'A Story Worth Remembering',
    icon: '✧',
    layout: 'magazine',
    previewStyle: {
      background:
        'linear-gradient(145deg,#18181b,#52525b)',
      color: '#ffffff'
    }
  },

  {
    id: 'cute',
    name: 'Cute Frame',
    description: 'Soft pastel frame',
    title: 'CUTIE',
    subtitle: 'Sweet Memories ♡',
    icon: '♡',
    layout: 'frame',
    previewStyle: {
      background:
        'linear-gradient(145deg,#fbcfe8,#ddd6fe)',
      color: '#701a75'
    }
  },

  {
    id: 'party',
    name: 'Party Poster',
    description: 'Colorful poster',
    title: 'LET\'S PARTY!',
    subtitle: 'Good Times Never End',
    icon: '✦',
    layout: 'poster',
    previewStyle: {
      background:
        'linear-gradient(145deg,#0891b2,#7c3aed)',
      color: '#ffffff'
    }
  },

  {
    id: 'black',
    name: 'Black Elegant',
    description: 'Premium masonry',
    title: 'ELEGANT MOMENTS',
    subtitle: 'Elegance Never Fades',
    icon: '◆',
    layout: 'masonry',
    previewStyle: {
      background:
        'linear-gradient(145deg,#09090b,#27272a)',
      color: '#fafafa'
    }
  },

  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean modern',
    title: 'MOMENTS',
    subtitle: 'Simple Is Beautiful',
    icon: '—',
    layout: 'minimal',
    previewStyle: {
      background:
        'linear-gradient(145deg,#fafafa,#d4d4d8)',
      color: '#18181b'
    }
  }

]


const currentTemplate = computed(() => {

  return templates.find(
    item =>
      item.id === selectedTemplate.value
  ) || templates[0]

})


/* =====================================================
   CAMERA
===================================================== */

const startCamera = async () => {

  try {

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      alert(
        'Browser ini tidak mendukung kamera.'
      )

      return

    }


    stream.value =
      await navigator.mediaDevices.getUserMedia({

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


    if (video.value) {

      video.value.srcObject =
        stream.value

      await video.value.play()

    }


    cameraActive.value = true

  } catch (error) {

    console.error(
      'Camera error:',
      error
    )

    alert(
      'Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan.'
    )

  }

}


/* =====================================================
   CAPTURE FOTO
===================================================== */

const capturePhoto = async () => {

  if (
    !video.value ||
    countdown.value > 0 ||
    photos.value.length >= 4
  ) {

    return

  }


  countdown.value = 3

  await wait(1000)

  countdown.value = 2

  await wait(1000)

  countdown.value = 1

  await wait(1000)

  countdown.value = 0


  const videoWidth =
    video.value.videoWidth

  const videoHeight =
    video.value.videoHeight


  if (!videoWidth || !videoHeight) {

    alert(
      'Kamera belum siap. Coba lagi.'
    )

    return

  }


  canvas.value.width =
    videoWidth

  canvas.value.height =
    videoHeight


  const context =
    canvas.value.getContext('2d')


  /*
    Mirror supaya hasil foto
    terlihat seperti kamera depan.
  */

  context.save()

  context.translate(
    videoWidth,
    0
  )

  context.scale(
    -1,
    1
  )

  context.drawImage(
    video.value,
    0,
    0,
    videoWidth,
    videoHeight
  )

  context.restore()


  photos.value.push(
    canvas.value.toDataURL(
      'image/jpeg',
      0.94
    )
  )

}


const wait = ms => {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  )

}


/* =====================================================
   CAMERA STOP
===================================================== */

const stopCamera = () => {

  if (stream.value) {

    stream.value
      .getTracks()
      .forEach(
        track =>
          track.stop()
      )

    stream.value = null

  }


  if (video.value) {

    video.value.srcObject = null

  }


  cameraActive.value = false

}


/* =====================================================
   NAVIGATION
===================================================== */

const createResult = () => {

  stopCamera()

  step.value = 3

}


const goBackTemplate = () => {

  stopCamera()

  step.value = 1

}


const resetAll = () => {

  stopCamera()

  photos.value = []

  countdown.value = 0

  caption.value = ''

  step.value = 1

}


/* =====================================================
   CANVAS HELPERS
===================================================== */

const roundedRect = (
  ctx,
  x,
  y,
  width,
  height,
  radius
) => {

  ctx.beginPath()

  ctx.moveTo(
    x + radius,
    y
  )

  ctx.lineTo(
    x + width - radius,
    y
  )

  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  )

  ctx.lineTo(
    x + width,
    y + height - radius
  )

  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  )

  ctx.lineTo(
    x + radius,
    y + height
  )

  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  )

  ctx.lineTo(
    x,
    y + radius
  )

  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  )

  ctx.closePath()

}


const fillRoundedRect = (
  ctx,
  x,
  y,
  width,
  height,
  radius,
  color
) => {

  roundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  )

  ctx.fillStyle = color

  ctx.fill()

}


const drawImageCover = (
  ctx,
  img,
  x,
  y,
  width,
  height
) => {

  const sourceRatio =
    img.width / img.height

  const targetRatio =
    width / height


  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height


  if (
    sourceRatio >
    targetRatio
  ) {

    sw =
      img.height *
      targetRatio

    sx =
      (img.width - sw) / 2

  } else {

    sh =
      img.width /
      targetRatio

    sy =
      (img.height - sh) / 2

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


const drawPhoto = (
  ctx,
  img,
  x,
  y,
  width,
  height,
  radius = 20
) => {

  ctx.save()

  roundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius
  )

  ctx.clip()

  drawImageCover(
    ctx,
    img,
    x,
    y,
    width,
    height
  )

  ctx.restore()

}


/* =====================================================
   TEXT HELPER
===================================================== */

const drawCenteredText = (
  ctx,
  text,
  x,
  y,
  font,
  color
) => {

  ctx.textAlign = 'center'

  ctx.textBaseline = 'middle'

  ctx.font = font

  ctx.fillStyle = color

  ctx.fillText(
    text,
    x,
    y
  )

}


/* =====================================================
   GRADIENT BACKGROUND
===================================================== */

const getTemplateColors = () => {

  const background =
    currentTemplate.value.previewStyle.background

  const colors =
    background.match(
      /#[0-9a-fA-F]{6}/g
    )


  if (
    colors &&
    colors.length >= 2
  ) {

    return colors

  }


  return [
    '#18181b',
    '#3f3f46'
  ]

}


const drawBackground = (
  ctx,
  width,
  height
) => {

  const colors =
    getTemplateColors()


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
    )


  gradient.addColorStop(
    0,
    colors[0]
  )

  gradient.addColorStop(
    1,
    colors[1]
  )


  ctx.fillStyle =
    gradient

  ctx.fillRect(
    0,
    0,
    width,
    height
  )

}


/* =====================================================
   LOAD IMAGES
===================================================== */

const loadImage = src => {

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image()

      img.onload = () =>
        resolve(img)

      img.onerror =
        reject

      img.src = src

    }
  )

}


/* =====================================================
   DOWNLOAD RESULT
===================================================== */

const downloadResult = async () => {

  if (
    photos.value.length !== 4
  ) {

    alert(
      'Empat foto harus tersedia terlebih dahulu.'
    )

    return

  }


  isDownloading.value = true


  try {

    const width = 1000

    const height = 1400


    canvas.value.width =
      width

    canvas.value.height =
      height


    const ctx =
      canvas.value.getContext(
        '2d'
      )


    /*
      Load semua foto terlebih dahulu.
    */

    const images =
      await Promise.all(
        photos.value.map(
          photo =>
            loadImage(photo)
        )
      )


    /*
      Background
    */

    drawBackground(
      ctx,
      width,
      height
    )


    /*
      Pilih layout.
    */

    switch (
      currentTemplate.value.layout
    ) {

      case 'grid':
        drawGrid(
          ctx,
          images,
          width,
          height
        )
        break


      case 'polaroid':
        drawPolaroid(
          ctx,
          images,
          width,
          height
        )
        break


      case 'big-small':
        drawBigSmall(
          ctx,
          images,
          width,
          height
        )
        break


      case 'strip':
        drawStrip(
          ctx,
          images,
          width,
          height
        )
        break


      case 'diagonal':
        drawDiagonal(
          ctx,
          images,
          width,
          height
        )
        break


      case 'hero':
        drawHero(
          ctx,
          images,
          width,
          height
        )
        break


      case 'three':
        drawThree(
          ctx,
          images,
          width,
          height
        )
        break


      case 'magazine':
        drawMagazine(
          ctx,
          images,
          width,
          height
        )
        break


      case 'frame':
        drawFrame(
          ctx,
          images,
          width,
          height
        )
        break


      case 'poster':
        drawPoster(
          ctx,
          images,
          width,
          height
        )
        break


      case 'masonry':
        drawMasonry(
          ctx,
          images,
          width,
          height
        )
        break


      case 'minimal':
        drawMinimal(
          ctx,
          images,
          width,
          height
        )
        break

    }


    /*
      Download.
    */

    const link =
      document.createElement('a')


    link.download =
      `photobooth-${currentTemplate.value.id}.jpg`


    link.href =
      canvas.value.toDataURL(
        'image/jpeg',
        0.95
      )


    document.body.appendChild(
      link
    )

    link.click()

    link.remove()

  } catch (error) {

    console.error(
      'Download error:',
      error
    )

    alert(
      'Gagal membuat foto. Silakan coba lagi.'
    )

  } finally {

    isDownloading.value = false

  }

}


/* =====================================================
   LAYOUT 1 : GRID
===================================================== */

const drawGrid = (
  ctx,
  images,
  width,
  height
) => {

  const textColor =
    currentTemplate.value.previewStyle.color


  drawCenteredText(
    ctx,
    '♥  ' +
      currentTemplate.value.title +
      '  ♥',
    width / 2,
    80,
    'bold 48px Arial',
    textColor
  )


  const margin = 70

  const gap = 25

  const photoWidth =
    (width -
      margin * 2 -
      gap) / 2

  const photoHeight = 450


  images.forEach(
    (img, index) => {

      const col =
        index % 2

      const row =
        Math.floor(index / 2)


      const x =
        margin +
        col *
        (photoWidth + gap)


      const y =
        140 +
        row *
        (photoHeight + gap)


      drawPhoto(
        ctx,
        img,
        x,
        y,
        photoWidth,
        photoHeight,
        22
      )

    }
  )


  drawCenteredText(
    ctx,
    caption.value ||
      currentTemplate.value.subtitle,
    width / 2,
    1330,
    '28px Arial',
    textColor
  )

}


/* =====================================================
   LAYOUT 2 : POLAROID
===================================================== */

const drawPolaroid = (
  ctx,
  images,
  width,
  height
) => {

  const textColor = '#292524'

  /*
    background cream
  */

  ctx.fillStyle =
    '#f5f5f4'

  ctx.fillRect(
    0,
    0,
    width,
    height
  )


  drawCenteredText(
    ctx,
    'MEMORIES',
    width / 2,
    70,
    'bold 50px Georgia',
    textColor
  )


  const rotations = [
    -0.07,
    0.04,
    -0.035,
    0.06
  ]


  images.forEach(
    (img, index) => {

      const photoWidth = 380

      const photoHeight = 270

      const x =
        width / 2 -
        photoWidth / 2

      const y =
        120 +
        index * 285


      ctx.save()

      ctx.translate(
        width / 2,
        y +
          photoHeight /
            2
      )

      ctx.rotate(
        rotations[index]
      )


      ctx.fillStyle =
        '#ffffff'

      ctx.fillRect(
        -photoWidth / 2 - 15,
        -photoHeight / 2 - 15,
        photoWidth + 30,
        photoHeight + 70
      )


      drawImageCover(
        ctx,
        img,
        -photoWidth / 2,
        -photoHeight / 2,
        photoWidth,
        photoHeight
      )


      ctx.restore()

    }
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'Captured Moments',
    width / 2,
    1350,
    'italic 30px Georgia',
    textColor
  )

}


/* =====================================================
   LAYOUT 3 : BIG SMALL
===================================================== */

const drawBigSmall = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  drawCenteredText(
    ctx,
    '🎂  HAPPY BIRTHDAY',
    width / 2,
    70,
    'bold 45px Arial',
    color
  )


  drawPhoto(
    ctx,
    images[0],
    70,
    130,
    860,
    620,
    30
  )


  const smallWidth = 270

  const smallHeight = 330

  const gap = 25

  images
    .slice(1)
    .forEach(
      (img, index) => {

        drawPhoto(
          ctx,
          img,
          70 +
            index *
            (smallWidth + gap),
          800,
          smallWidth,
          smallHeight,
          20
        )

      }
    )


  drawCenteredText(
    ctx,
    caption.value ||
      'Make A Wish ✨',
    width / 2,
    1280,
    'bold 34px Arial',
    color
  )

}


/* =====================================================
   LAYOUT 4 : STRIP
===================================================== */

const drawStrip = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  drawCenteredText(
    ctx,
    '✦ PHOTOBOOTH ✦',
    width / 2,
    55,
    'bold 42px Arial',
    color
  )


  const x = 120

  const photoWidth = 760

  const photoHeight = 270

  const gap = 18


  images.forEach(
    (img, index) => {

      drawPhoto(
        ctx,
        img,
        x,
        100 +
          index *
          (photoHeight + gap),
        photoWidth,
        photoHeight,
        12
      )

    }
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'Good Times',
    width / 2,
    1325,
    '26px Arial',
    color
  )

}


/* =====================================================
   LAYOUT 5 : DIAGONAL
===================================================== */

const drawDiagonal = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  drawCenteredText(
    ctx,
    '♢ THE WEDDING ♢',
    width / 2,
    65,
    'bold 42px Georgia',
    color
  )


  const positions = [

    [80,130,500,330],

    [420,270,500,330],

    [80,650,500,330],

    [420,790,500,330]

  ]


  images.forEach(
    (img,index) => {

      const [
        x,
        y,
        w,
        h
      ] =
        positions[index]


      drawPhoto(
        ctx,
        img,
        x,
        y,
        w,
        h,
        28
      )

    }
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'Together Forever',
    width / 2,
    1325,
    'italic 32px Georgia',
    color
  )

}


/* =====================================================
   LAYOUT 6 : HERO
===================================================== */

const drawHero = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  drawCenteredText(
    ctx,
    '☀ SUMMER DAYS',
    width / 2,
    70,
    'bold 48px Arial',
    color
  )


  drawPhoto(
    ctx,
    images[0],
    60,
    120,
    880,
    700,
    30
  )


  const smallWidth = 270

  const smallHeight = 270


  images
    .slice(1)
    .forEach(
      (img,index) => {

        drawPhoto(
          ctx,
          img,
          60 +
            index *
            305,
          870,
          smallWidth,
          smallHeight,
          18
        )

      }
    )


  drawCenteredText(
    ctx,
    caption.value ||
      'Good Vibes Only ☀',
    width / 2,
    1270,
    'bold 30px Arial',
    color
  )

}


/* =====================================================
   LAYOUT 7 : THREE
===================================================== */

const drawThree = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  drawCenteredText(
    ctx,
    '🎓 GRADUATION',
    width / 2,
    60,
    'bold 45px Arial',
    color
  )


  drawPhoto(
    ctx,
    images[0],
    80,
    110,
    840,
    500,
    25
  )


  drawPhoto(
    ctx,
    images[1],
    80,
    660,
    400,
    320,
    22
  )


  drawPhoto(
    ctx,
    images[2],
    520,
    660,
    400,
    320,
    22
  )


  drawPhoto(
    ctx,
    images[3],
    260,
    1010,
    480,
    250,
    22
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'The Beginning',
    width / 2,
    1330,
    'bold 30px Arial',
    color
  )

}


/* =====================================================
   LAYOUT 8 : MAGAZINE
===================================================== */

const drawMagazine = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  ctx.fillStyle =
    '#18181b'

  ctx.fillRect(
    0,
    0,
    width,
    height
  )


  drawCenteredText(
    ctx,
    'MOMENTS',
    width / 2,
    65,
    'bold 58px Arial',
    color
  )


  drawPhoto(
    ctx,
    images[0],
    70,
    120,
    580,
    950,
    8
  )


  images
    .slice(1)
    .forEach(
      (img,index) => {

        drawPhoto(
          ctx,
          img,
          690,
          120 +
            index * 305,
          240,
          280,
          5
        )

      }
    )


  drawCenteredText(
    ctx,
    caption.value ||
      'A Story Worth Remembering',
    width / 2,
    1250,
    'italic 27px Georgia',
    color
  )

}


/* =====================================================
   LAYOUT 9 : FRAME
===================================================== */

const drawFrame = (
  ctx,
  images,
  width,
  height
) => {

  const colors =
    getTemplateColors()


  ctx.fillStyle =
    '#fce7f3'

  ctx.fillRect(
    0,
    0,
    width,
    height
  )


  ctx.strokeStyle =
    '#a855f7'

  ctx.lineWidth = 18

  ctx.strokeRect(
    25,
    25,
    width - 50,
    height - 50
  )


  drawCenteredText(
    ctx,
    '♡ CUTIE ♡',
    width / 2,
    80,
    'bold 48px Arial',
    '#701a75'
  )


  const positions = [

    [80,140],

    [530,140],

    [80,650],

    [530,650]

  ]


  images.forEach(
    (img,index) => {

      drawPhoto(
        ctx,
        img,
        positions[index][0],
        positions[index][1],
        390,
        430,
        25
      )

    }
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'Sweet Memories ♡',
    width / 2,
    1200,
    'bold 30px Arial',
    '#701a75'
  )

}


/* =====================================================
   LAYOUT 10 : POSTER
===================================================== */

const drawPoster = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  drawCenteredText(
    ctx,
    '✦ LET\'S PARTY! ✦',
    width / 2,
    75,
    'bold 50px Arial',
    color
  )


  drawPhoto(
    ctx,
    images[0],
    70,
    130,
    860,
    620,
    30
  )


  images
    .slice(1)
    .forEach(
      (img,index) => {

        drawPhoto(
          ctx,
          img,
          70 +
            index * 295,
          800,
          270,
          300,
          20
        )

      }
    )


  drawCenteredText(
    ctx,
    caption.value ||
      'Good Times Never End',
    width / 2,
    1210,
    'bold 32px Arial',
    color
  )


  drawCenteredText(
    ctx,
    'PHOTOBOOTH',
    width / 2,
    1300,
    'bold 22px Arial',
    color
  )

}


/* =====================================================
   LAYOUT 11 : MASONRY
===================================================== */

const drawMasonry = (
  ctx,
  images,
  width,
  height
) => {

  const color =
    '#ffffff'


  ctx.fillStyle =
    '#09090b'

  ctx.fillRect(
    0,
    0,
    width,
    height
  )


  drawCenteredText(
    ctx,
    '◆ ELEGANT MOMENTS ◆',
    width / 2,
    65,
    'bold 40px Georgia',
    color
  )


  drawPhoto(
    ctx,
    images[0],
    60,
    120,
    540,
    620,
    8
  )


  drawPhoto(
    ctx,
    images[1],
    630,
    120,
    310,
    400,
    8
  )


  drawPhoto(
    ctx,
    images[2],
    630,
    550,
    310,
    500,
    8
  )


  drawPhoto(
    ctx,
    images[3],
    60,
    770,
    540,
    280,
    8
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'Elegance Never Fades',
    width / 2,
    1230,
    'italic 30px Georgia',
    color
  )

}


/* =====================================================
   LAYOUT 12 : MINIMAL
===================================================== */

const drawMinimal = (
  ctx,
  images,
  width,
  height
) => {

  ctx.fillStyle =
    '#fafafa'

  ctx.fillRect(
    0,
    0,
    width,
    height
  )


  drawCenteredText(
    ctx,
    'MOMENTS',
    width / 2,
    70,
    'bold 50px Arial',
    '#18181b'
  )


  const x = 100

  const photoWidth = 800

  const photoHeight = 240


  images.forEach(
    (img,index) => {

      drawPhoto(
        ctx,
        img,
        x,
        130 +
          index *
          270,
        photoWidth,
        photoHeight,
        2
      )

    }
  )


  drawCenteredText(
    ctx,
    caption.value ||
      'Simple Is Beautiful',
    width / 2,
    1250,
    '28px Arial',
    '#18181b'
  )


  drawCenteredText(
    ctx,
    'PHOTOBOOTH',
    width / 2,
    1310,
    'bold 18px Arial',
    '#71717a'
  )

}


/* =====================================================
   CLEANUP
===================================================== */

onBeforeUnmount(() => {

  stopCamera()

})

</script>


<style scoped>

/* =====================================================
   GLOBAL
===================================================== */

* {
  box-sizing: border-box;
}

.booth {
  min-height: 100vh;

  color: #ffffff;

  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(236, 72, 153, .12),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 90%,
      rgba(139, 92, 246, .12),
      transparent 30%
    ),
    #09090b;

  padding: 25px;
}


/* =====================================================
   HEADER
===================================================== */

.topbar {
  max-width: 1250px;

  margin: auto;

  display: flex;

  justify-content: space-between;

  align-items: center;
}

.logo {
  color: white;

  text-decoration: none;

  font-weight: 900;

  letter-spacing: 2px;
}

.logo span {
  margin-right: 8px;
}

.steps {
  display: flex;

  gap: 20px;

  color: #52525b;

  font-size: 9px;

  letter-spacing: 2px;
}

.steps .active {
  color: #f9a8d4;
}


/* =====================================================
   SECTION
===================================================== */

.page-section {
  max-width: 1250px;

  margin: 55px auto;

  padding-bottom: 80px;
}


/* =====================================================
   HEADING
===================================================== */

.heading {
  text-align: center;

  margin-bottom: 45px;
}

.eyebrow {
  color: #f9a8d4;

  font-size: 10px;

  letter-spacing: 4px;

  font-weight: 800;
}

.heading h1 {
  margin: 12px 0;

  font-size: clamp(
    42px,
    7vw,
    75px
  );

  line-height: .95;

  letter-spacing: -4px;

  font-weight: 900;
}

.heading h1 span {
  display: inline-block;

  background:
    linear-gradient(
      90deg,
      #f9a8d4,
      #c4b5fd
    );

  -webkit-background-clip: text;

  background-clip: text;

  -webkit-text-fill-color: transparent;

  color: transparent;
}

.heading p {
  color: #71717a;

  margin: 0;
}


/* =====================================================
   TEMPLATE GRID
===================================================== */

.templates-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 18px;
}

.template-card {
  padding: 10px;

  border: 1px solid #27272a;

  border-radius: 20px;

  background: #111113;

  color: white;

  text-align: left;

  cursor: pointer;

  transition:
    transform .25s,
    border .25s,
    box-shadow .25s;
}

.template-card:hover {
  transform: translateY(-5px);

  border-color: #52525b;
}

.template-card.selected {
  border-color: #f9a8d4;

  box-shadow:
    0 0 0 2px
    rgba(249,168,212,.15);
}


/* =====================================================
   TEMPLATE PREVIEW
===================================================== */

.template-preview {
  height: 300px;

  border-radius: 14px;

  padding: 15px;

  overflow: hidden;

  position: relative;
}

.preview-decor {
  position: absolute;

  right: 13px;

  top: 12px;

  font-size: 14px;
}

.preview-title {
  text-align: center;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 2px;

  margin-bottom: 10px;
}

.preview-subtitle {
  position: absolute;

  bottom: 8px;

  left: 0;

  width: 100%;

  text-align: center;

  font-size: 7px;

  opacity: .8;
}


/* =====================================================
   PREVIEW PHOTO
===================================================== */

.preview-grid {
  height: 240px;

  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 7px;
}

.preview-grid div,
.preview-strip div,
.preview-diagonal div,
.preview-big-small div,
.preview-three div,
.preview-frame div,
.preview-poster div,
.preview-masonry div,
.preview-minimal div,
.preview-magazine div {
  background:
    linear-gradient(
      135deg,
      #27272a,
      #71717a
    );

  border: 2px solid
    rgba(255,255,255,.75);

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 10px;
}


/* POLAROID */

.preview-polaroids {
  position: relative;

  height: 245px;
}

.polaroid {
  position: absolute;

  width: 110px;

  height: 130px;

  padding: 7px;

  background: white;

  color: #18181b;

  display: flex;

  align-items: center;

  justify-content: center;

  box-shadow:
    0 5px 15px
    rgba(0,0,0,.25);
}

.p1 {
  left: 20px;
  top: 15px;
  transform: rotate(-8deg);
}

.p2 {
  right: 20px;
  top: 45px;
  transform: rotate(7deg);
}

.p3 {
  left: 80px;
  bottom: 0;
  transform: rotate(-2deg);
}


/* BIG SMALL */

.preview-big-small {
  display: grid;

  grid-template-columns:
    1.5fr 1fr;

  gap: 7px;

  height: 240px;
}

.preview-big-small .big {
  height: 240px;
}

.small-stack {
  display: grid;

  gap: 5px;
}

.small-stack div {
  min-height: 0;
}


/* STRIP */

.preview-strip {
  height: 245px;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 5px;
}


/* DIAGONAL */

.preview-diagonal {
  position: relative;

  height: 245px;
}

.preview-diagonal div {
  position: absolute;

  width: 125px;

  height: 90px;
}

.preview-diagonal div:nth-child(1) {
  left: 5px;
  top: 5px;
}

.preview-diagonal div:nth-child(2) {
  right: 5px;
  top: 45px;
}

.preview-diagonal div:nth-child(3) {
  left: 5px;
  top: 110px;
}

.preview-diagonal div:nth-child(4) {
  right: 5px;
  top: 155px;
}


/* HERO */

.preview-hero {
  height: 245px;
}

.hero-photo {
  height: 160px;

  background:
    linear-gradient(
      135deg,
      #27272a,
      #71717a
    );

  display: flex;

  align-items: center;

  justify-content: center;
}

.hero-small {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 5px;

  margin-top: 7px;

  height: 70px;
}


/* THREE */

.preview-three {
  height: 245px;
}

.preview-three > div:first-child {
  height: 145px;
}

.three-bottom {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 6px;

  margin-top: 7px;

  height: 90px;
}


/* MAGAZINE */

.preview-magazine {
  display: grid;

  grid-template-columns:
    1.5fr 1fr;

  gap: 7px;

  height: 245px;
}

.mag-large {
  height: 245px;
}

.mag-small {
  display: grid;

  gap: 5px;
}


/* FRAME */

.preview-frame {
  height: 245px;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 7px;

  padding: 7px;

  border: 3px solid
    rgba(255,255,255,.6);
}


/* POSTER */

.preview-poster {
  height: 245px;
}

.poster-main {
  height: 150px;
}

.poster-row {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 5px;

  height: 80px;

  margin-top: 5px;
}


/* MASONRY */

.preview-masonry {
  height: 245px;

  display: grid;

  grid-template-columns:
    1.4fr 1fr;

  grid-template-rows:
    1fr 1fr;

  gap: 5px;
}

.preview-masonry div:nth-child(1) {
  grid-row: span 2;
}


/* MINIMAL */

.preview-minimal {
  height: 245px;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 6px;
}

.preview-minimal div {
  border: 0;

  border-radius: 2px;
}


/* =====================================================
   TEMPLATE INFO
===================================================== */

.template-info {
  padding: 12px 5px 4px;

  display: flex;

  justify-content: space-between;

  align-items: center;
}

.template-info strong {
  display: block;

  font-size: 13px;
}

.template-info small {
  display: block;

  margin-top: 4px;

  color: #71717a;

  font-size: 9px;
}

.check {
  width: 25px;

  height: 25px;

  border: 1px solid #3f3f46;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;
}

.check.checked {
  background: #f9a8d4;

  border-color: #f9a8d4;

  color: #18181b;
}


/* =====================================================
   BUTTONS
===================================================== */

.primary-button {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 18px;

  margin: 40px auto 0;

  padding: 17px 27px;

  border: 0;

  border-radius: 999px;

  background: #ffffff;

  color: #18181b;

  font-weight: 900;

  cursor: pointer;

  transition: .25s;
}

.primary-button:hover {
  transform: translateY(-3px);

  box-shadow:
    0 15px 40px
    rgba(255,255,255,.12);
}

.primary-button span {
  font-size: 20px;
}


/* =====================================================
   CAMERA
===================================================== */

.camera-page {
  max-width: 900px;
}

.camera-wrapper {
  position: relative;

  width: 100%;

  aspect-ratio: 16 / 10;

  overflow: hidden;

  border-radius: 28px;

  background: #18181b;

  border: 1px solid #27272a;
}

.camera-wrapper video {
  width: 100%;

  height: 100%;

  object-fit: cover;

  transform: scaleX(-1);
}

.camera-overlay {
  position: absolute;

  inset: 0;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  background: #18181b;
}

.camera-icon {
  font-size: 60px;
}

.camera-overlay h2 {
  margin: 10px 0;
}

.camera-overlay p {
  color: #71717a;

  font-size: 13px;
}

.camera-button {
  margin-top: 10px;

  padding: 14px 24px;

  border: 0;

  border-radius: 999px;

  background: white;

  color: #18181b;

  font-weight: 800;

  cursor: pointer;
}

.countdown {
  position: absolute;

  inset: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    rgba(0,0,0,.15);

  font-size: 150px;

  font-weight: 900;

  text-shadow:
    0 10px 40px
    rgba(0,0,0,.6);
}

.photo-number {
  position: absolute;

  right: 18px;

  top: 18px;

  padding: 8px 13px;

  border-radius: 999px;

  background:
    rgba(0,0,0,.5);

  backdrop-filter: blur(10px);

  font-size: 12px;

  font-weight: 800;
}


/* =====================================================
   PHOTO COUNTER
===================================================== */

.photo-counter {
  display: flex;

  justify-content: center;

  gap: 12px;

  margin: 25px 0;
}

.counter-item {
  width: 42px;

  height: 42px;

  border: 1px solid #3f3f46;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  color: #71717a;

  font-weight: 900;
}

.counter-item.completed {
  background: #f9a8d4;

  color: #18181b;

  border-color: #f9a8d4;
}


/* =====================================================
   CAPTURE BUTTON
===================================================== */

.capture-button {
  margin: auto;

  display: flex;

  align-items: center;

  gap: 12px;

  padding: 8px 22px 8px 8px;

  border: 0;

  border-radius: 999px;

  background: white;

  color: #18181b;

  font-weight: 900;

  cursor: pointer;
}

.capture-button:disabled {
  opacity: .5;

  cursor: not-allowed;
}

.capture-circle {
  width: 42px;

  height: 42px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: #18181b;

  color: white;
}


/* =====================================================
   SECONDARY
===================================================== */

.secondary-button {
  display: block;

  margin: 18px auto;

  padding: 12px 20px;

  border: 0;

  background: transparent;

  color: #71717a;

  cursor: pointer;
}


/* =====================================================
   RESULT
===================================================== */

.result-page {
  max-width: 900px;
}

.result-preview {
  width: min(500px, 90vw);

  aspect-ratio: 1000 / 1400;

  margin: auto;

  overflow: hidden;

  position: relative;

  border-radius: 18px;

  padding: 30px;

  box-shadow:
    0 30px 90px
    rgba(0,0,0,.45);
}


/* RESULT GRID */

.result-header {
  text-align: center;

  font-size: 25px;

  font-weight: 900;

  letter-spacing: 3px;

  margin-bottom: 20px;
}

.result-grid {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 12px;
}

.result-grid-photo {
  overflow: hidden;

  border-radius: 10px;

  border: 4px solid
    rgba(255,255,255,.8);
}

.result-grid-photo img {
  width: 100%;

  aspect-ratio: 1 / 1;

  display: block;

  object-fit: cover;
}

.result-footer {
  text-align: center;

  font-size: 14px;

  margin-top: 18px;
}


/* POLAROID RESULT */

.result-polaroid-title {
  text-align: center;

  font-family: Georgia, serif;

  font-size: 27px;

  margin-bottom: 15px;
}

.polaroid-stack {
  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 5px;
}

.result-polaroid {
  width: 55%;

  padding: 6px 6px 18px;

  background: white;

  color: #18181b;

  box-shadow:
    0 8px 20px
    rgba(0,0,0,.15);
}

.result-polaroid img {
  width: 100%;

  display: block;

  aspect-ratio: 1.3;

  object-fit: cover;
}

.rotate-0 {
  transform: rotate(-3deg);
}

.rotate-1 {
  transform: rotate(2deg);
}

.rotate-2 {
  transform: rotate(-1deg);
}

.rotate-3 {
  transform: rotate(3deg);
}


/* BIG SMALL */

.result-header {
  text-align: center;
}

.big-small-layout {
  display: grid;

  grid-template-columns:
    1.5fr 1fr;

  gap: 10px;

  height: 78%;
}

.big-photo,
.small-photos {
  overflow: hidden;
}

.big-photo img {
  width: 100%;

  height: 100%;

  object-fit: cover;
}

.small-photos {
  display: grid;

  gap: 10px;
}

.small-photos img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  min-height: 0;
}


/* STRIP */

.strip-title {
  text-align: center;

  font-weight: 900;

  font-size: 25px;

  margin-bottom: 12px;
}

.strip-photos {
  display: flex;

  flex-direction: column;

  gap: 7px;
}

.strip-photos img {
  width: 100%;

  height: 205px;

  object-fit: cover;
}

.strip-footer {
  text-align: center;

  margin-top: 12px;
}


/* DIAGONAL */

.diagonal-title {
  text-align: center;

  font-family: Georgia, serif;

  font-size: 25px;

  margin-bottom: 20px;
}

.diagonal-layout {
  position: relative;

  height: 82%;
}

.diagonal-layout img {
  position: absolute;

  width: 55%;

  height: 30%;

  object-fit: cover;

  border-radius: 14px;

  border: 4px solid
    rgba(255,255,255,.7);
}

.diag-0 {
  left: 0;
  top: 0;
}

.diag-1 {
  right: 0;
  top: 18%;
}

.diag-2 {
  left: 0;
  top: 50%;
}

.diag-3 {
  right: 0;
  top: 68%;
}


/* HERO */

.hero-title {
  text-align: center;

  font-size: 28px;

  font-weight: 900;

  margin-bottom: 15px;
}

.hero-main-photo {
  width: 100%;

  height: 52%;

  object-fit: cover;

  border-radius: 15px;
}

.hero-bottom {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 8px;

  margin-top: 8px;

  height: 22%;
}

.hero-bottom img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 8px;
}


/* THREE */

.three-title {
  text-align: center;

  font-size: 25px;

  font-weight: 900;

  margin-bottom: 15px;
}

.three-main {
  width: 100%;

  height: 38%;

  object-fit: cover;

  border-radius: 12px;
}

.three-bottom-result {
  display: grid;

  grid-template-columns: 1fr 1fr;

  gap: 8px;

  margin-top: 8px;

  height: 25%;
}

.three-bottom-result img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 8px;
}

.three-last {
  width: 55%;

  height: 18%;

  display: block;

  margin: 8px auto;

  object-fit: cover;

  border-radius: 8px;
}


/* MAGAZINE */

.magazine-title {
  text-align: center;

  font-size: 32px;

  font-weight: 900;

  letter-spacing: 4px;

  margin-bottom: 15px;
}

.magazine-layout {
  display: grid;

  grid-template-columns:
    1.5fr 1fr;

  gap: 10px;

  height: 78%;
}

.magazine-large {
  width: 100%;

  height: 100%;

  object-fit: cover;
}

.magazine-side {
  display: grid;

  gap: 8px;
}

.magazine-side img {
  width: 100%;

  height: 100%;

  min-height: 0;

  object-fit: cover;
}


/* FRAME */

.frame-border {
  height: 100%;

  padding: 20px;

  border: 5px solid
    rgba(255,255,255,.65);

  border-radius: 12px;
}

.frame-title {
  text-align: center;

  font-size: 25px;

  font-weight: 900;

  margin-bottom: 15px;
}

.frame-layout {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;

  height: 80%;
}

.frame-layout img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 10px;
}

.frame-footer {
  text-align: center;

  margin-top: 10px;

  font-size: 12px;
}


/* POSTER */

.poster-title {
  text-align: center;

  font-size: 29px;

  font-weight: 900;

  margin-bottom: 15px;
}

.result-preview.poster {
  text-align: center;
}

.poster-main {
  width: 100%;

  height: 53%;

  object-fit: cover;

  border-radius: 16px;
}

.poster-small-row {
  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 8px;

  margin-top: 10px;

  height: 23%;
}

.poster-small-row img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 8px;
}

.poster-footer {
  text-align: center;

  margin-top: 15px;

  font-weight: 700;
}


/* MASONRY */

.masonry-title {
  text-align: center;

  font-family: Georgia, serif;

  font-size: 26px;

  margin-bottom: 15px;
}

.masonry-layout {
  height: 80%;

  display: grid;

  grid-template-columns:
    1.4fr 1fr;

  grid-template-rows:
    1fr 1fr;

  gap: 8px;
}

.masonry-layout img {
  width: 100%;

  height: 100%;

  object-fit: cover;

  border-radius: 7px;
}

.masonry-one {
  grid-row: span 2;
}


/* MINIMAL */

.minimal-title {
  text-align: center;

  font-size: 30px;

  font-weight: 900;

  letter-spacing: 5px;

  margin-bottom: 20px;
}

.minimal-layout {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;

  height: 78%;
}

.minimal-layout img {
  width: 100%;

  height: 100%;

  object-fit: cover;
}

.minimal-footer {
  text-align: center;

  margin-top: 15px;

  font-size: 13px;
}


/* =====================================================
   RESULT ACTION
===================================================== */

.result-actions {
  max-width: 500px;

  margin: 30px auto;

  display: flex;

  flex-direction: column;

  gap: 12px;
}

.result-actions input {
  width: 100%;

  padding: 15px 20px;

  border: 1px solid #3f3f46;

  border-radius: 999px;

  background: #18181b;

  color: white;

  outline: none;

  text-align: center;
}

.result-actions input:focus {
  border-color: #f9a8d4;
}

.download-button {
  padding: 16px;

  border: 0;

  border-radius: 999px;

  background:
    linear-gradient(
      90deg,
      #f9a8d4,
      #c4b5fd
    );

  color: #18181b;

  font-weight: 900;

  cursor: pointer;
}

.download-button:disabled {
  opacity: .5;

  cursor: wait;
}


/* =====================================================
   HIDDEN CANVAS
===================================================== */

.hidden-canvas {
  display: none;
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media (max-width: 1000px) {

  .templates-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

}


@media (max-width: 700px) {

  .booth {
    padding: 18px;
  }

  .steps {
    display: none;
  }

  .templates-grid {
    grid-template-columns:
      repeat(2, 1fr);

    gap: 12px;
  }

  .template-preview {
    height: 250px;
  }

  .heading h1 {
    letter-spacing: -2px;
  }

  .camera-wrapper {
    aspect-ratio: 3 / 4;

    border-radius: 20px;
  }

  .countdown {
    font-size: 100px;
  }

  .result-preview {
    width: min(
      95vw,
      500px
    );

    padding: 20px;
  }

}


@media (max-width: 430px) {

  .templates-grid {
    grid-template-columns:
      1fr 1fr;
  }

  .template-preview {
    height: 220px;

    padding: 9px;
  }

  .template-info strong {
    font-size: 11px;
  }

  .template-info small {
    font-size: 8px;
  }

  .check {
    width: 21px;

    height: 21px;
  }

}

</style>