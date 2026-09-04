<script setup lang="ts">

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId = Number(route.query.template || 1)

const template =
  templates.find(t => t.id === templateId) ||
  templates[0]

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const stream = ref<MediaStream | null>(null)

const photos = ref<string[]>([])

const currentPhoto = ref(1)

const countdown = ref(0)

const cameraReady = ref(false)

const processing = ref(false)

const errorMessage = ref('')

let countdownTimer: ReturnType<typeof setInterval> | null = null

// =====================================================
// JUMLAH FOTO
// =====================================================

const totalPhotos = template.photos

// =====================================================
// START CAMERA
// =====================================================

const startCamera = async () => {

  try {

    errorMessage.value = ''

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

      video.value.srcObject = stream.value

      await video.value.play()

      cameraReady.value = true
    }

  } catch (error) {

    console.error(error)

    errorMessage.value =
      'Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan.'
  }
}

// =====================================================
// COUNTDOWN
// =====================================================

const startCountdown = () => {

  if (!cameraReady.value) return

  if (processing.value) return

  processing.value = true

  countdown.value = 3

  countdownTimer = setInterval(() => {

    countdown.value--

    if (countdown.value <= 0) {

      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }

      capturePhoto()
    }

  }, 1000)
}

// =====================================================
// CAPTURE
// =====================================================

const capturePhoto = () => {

  if (!video.value || !canvas.value) {
    processing.value = false
    return
  }

  const videoElement = video.value
  const canvasElement = canvas.value

  const width =
    videoElement.videoWidth || 1280

  const height =
    videoElement.videoHeight || 720

  canvasElement.width = width
  canvasElement.height = height

  const ctx =
    canvasElement.getContext('2d')

  if (!ctx) {
    processing.value = false
    return
  }

  // Mirror seperti kamera depan
  ctx.save()

  ctx.translate(width, 0)
  ctx.scale(-1, 1)

  ctx.drawImage(
    videoElement,
    0,
    0,
    width,
    height
  )

  ctx.restore()

  const image =
    canvasElement.toDataURL(
      'image/jpeg',
      0.92
    )

  photos.value.push(image)

  currentPhoto.value =
    photos.value.length + 1

  processing.value = false

  // ===================================================
  // SUDAH CUKUP FOTO
  // ===================================================

  if (photos.value.length >= totalPhotos) {

    finishSession()

  }
}

// =====================================================
// FINISH
// =====================================================

const finishSession = () => {

  stopCamera()

  localStorage.setItem(
    'photobooth_photos',
    JSON.stringify(
      photos.value.slice(
        0,
        totalPhotos
      )
    )
  )

  localStorage.setItem(
    'photobooth_template',
    String(template.id)
  )

  navigateTo(
    `/result?template=${template.id}`
  )
}

// =====================================================
// STOP CAMERA
// =====================================================

const stopCamera = () => {

  if (stream.value) {

    stream.value
      .getTracks()
      .forEach(track => {
        track.stop()
      })

    stream.value = null
  }

  cameraReady.value = false
}

// =====================================================
// BACK
// =====================================================

const back = () => {

  stopCamera()

  navigateTo('/')
}

// =====================================================
// RESET
// =====================================================

const resetPhotos = () => {

  photos.value = []

  currentPhoto.value = 1

  processing.value = false

  countdown.value = 0
}

// =====================================================
// MOUNT
// =====================================================

onMounted(async () => {

  localStorage.removeItem(
    'photobooth_photos'
  )

  resetPhotos()

  await startCamera()
})

// =====================================================
// UNMOUNT
// =====================================================

onBeforeUnmount(() => {

  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  stopCamera()
})

</script>


<template>

  <div class="page">

    <!-- HEADER -->

    <header class="header">

      <button
        class="back"
        @click="back"
      >
        ←
      </button>

      <div class="brand">

        <div class="camera-icon">
          📸
        </div>

        <div>

          <strong>
            PhotoBooth
          </strong>

          <span>
            {{ template.name }}
          </span>

        </div>

      </div>

      <div class="counter">

        {{ Math.min(
          photos.length + 1,
          totalPhotos
        ) }}/{{ totalPhotos }}

      </div>

    </header>


    <!-- MAIN -->

    <main>

      <section class="intro">

        <div class="badge">
          {{ template.category }}
        </div>

        <h1>
          {{ template.name }}
        </h1>

        <p>
          Ambil {{ totalPhotos }}
          {{ totalPhotos === 1 ? 'foto' : 'foto' }}
          untuk template ini.
        </p>

      </section>


      <!-- CAMERA -->

      <section class="camera-card">

        <div class="camera-wrapper">

          <video
            ref="video"
            autoplay
            playsinline
            muted
          />

          <div
            v-if="countdown > 0"
            class="countdown"
          >
            {{ countdown }}
          </div>

          <div
            v-if="!cameraReady && !errorMessage"
            class="camera-loading"
          >
            <div class="spinner"></div>

            <p>
              Membuka kamera...
            </p>
          </div>

        </div>


        <!-- ERROR -->

        <div
          v-if="errorMessage"
          class="error"
        >

          <div>
            📷
          </div>

          <p>
            {{ errorMessage }}
          </p>

          <button
            @click="startCamera"
          >
            Coba Lagi
          </button>

        </div>


        <!-- BUTTON -->

        <button
          v-if="cameraReady"
          class="capture"
          :disabled="processing"
          @click="startCountdown"
        >

          <span class="capture-icon">
            📸
          </span>

          <span>
            {{
              processing
                ? 'Siapkan pose...'
                : `Ambil Foto ${photos.length + 1}`
            }}
          </span>

        </button>

      </section>


      <!-- PHOTO PROGRESS -->

      <section class="progress">

        <div
          v-for="index in totalPhotos"
          :key="index"
          class="photo-step"
          :class="{
            done: photos.length >= index,
            active: photos.length + 1 === index
          }"
        >

          <div class="step-circle">

            <span v-if="photos.length >= index">
              ✓
            </span>

            <span v-else>
              {{ index }}
            </span>

          </div>

          <span>
            Foto {{ index }}
          </span>

        </div>

      </section>


      <!-- PREVIEW -->

      <section
        v-if="photos.length"
        class="preview-section"
      >

        <h2>
          Foto yang sudah diambil
        </h2>

        <div class="preview-grid">

          <div
            v-for="(photo, index) in photos"
            :key="index"
            class="preview-item"
          >

            <img
              :src="photo"
              :alt="`Foto ${index + 1}`"
            />

            <span>
              {{ index + 1 }}
            </span>

          </div>

        </div>

      </section>


      <p class="tip">
        💡 Pastikan wajah terlihat jelas
        dan pencahayaan cukup.
      </p>

    </main>


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
    linear-gradient(
      180deg,
      #fafafa 0%,
      #f5f3ff 100%
    );
  color: #18181b;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

.header {
  height: 76px;
  padding: 0 5%;
  background: rgba(255,255,255,.96);
  border-bottom: 1px solid #e4e4e7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(15px);
}

.back {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #f4f4f5;
  font-size: 22px;
  cursor: pointer;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.camera-icon {
  width: 45px;
  height: 45px;
  border-radius: 14px;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );
  display: grid;
  place-items: center;
  font-size: 23px;
}

.brand strong {
  display: block;
  font-size: 18px;
}

.brand span {
  display: block;
  color: #71717a;
  font-size: 12px;
  margin-top: 3px;
}

.counter {
  padding: 9px 14px;
  border-radius: 20px;
  background: #f3e8ff;
  color: #7c3aed;
  font-weight: 800;
}

main {
  width: 94%;
  max-width: 800px;
  margin: auto;
  padding: 35px 0 70px;
}

.intro {
  text-align: center;
  margin-bottom: 25px;
}

.badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 30px;
  background: #f3e8ff;
  color: #7c3aed;
  font-size: 12px;
  font-weight: 800;
}

.intro h1 {
  margin: 12px 0 5px;
  font-size: 36px;
}

.intro p {
  margin: 0;
  color: #71717a;
}

.camera-card {
  padding: 15px;
  background: white;
  border-radius: 24px;
  box-shadow:
    0 20px 70px rgba(0,0,0,.12);
}

.camera-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 18px;
  background: #111;
  aspect-ratio: 4 / 3;
}

.camera-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.countdown {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: white;
  font-size: 100px;
  font-weight: 900;
  background: rgba(0,0,0,.2);
  text-shadow:
    0 5px 20px rgba(0,0,0,.5);
}

.camera-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  align-content: center;
  color: white;
  background: #18181b;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 4px solid #52525b;
  border-top-color: white;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.capture {
  width: 100%;
  margin-top: 15px;
  min-height: 58px;
  border: none;
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );
  color: white;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
}

.capture:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.capture-icon {
  margin-right: 8px;
}

.error {
  text-align: center;
  padding: 30px 15px;
  color: #71717a;
}

.error > div {
  font-size: 45px;
}

.error button {
  border: none;
  background: #7c3aed;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 700;
}

.progress {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.photo-step {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a1a1aa;
  font-size: 12px;
}

.step-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e4e4e7;
  font-weight: 800;
}

.photo-step.done {
  color: #16a34a;
}

.photo-step.done .step-circle {
  background: #dcfce7;
  color: #16a34a;
}

.photo-step.active {
  color: #7c3aed;
  font-weight: 700;
}

.photo-step.active .step-circle {
  background: #ede9fe;
  color: #7c3aed;
}

.preview-section {
  margin-top: 35px;
}

.preview-section h2 {
  font-size: 18px;
  margin-bottom: 15px;
}

.preview-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 10px;
}

.preview-item {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #e4e4e7;
  aspect-ratio: 1;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-item span {
  position: absolute;
  left: 7px;
  bottom: 7px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.65);
  color: white;
  font-size: 11px;
  font-weight: 800;
}

.tip {
  text-align: center;
  color: #a1a1aa;
  font-size: 12px;
  margin-top: 25px;
}

.hidden-canvas {
  display: none;
}

@media(max-width:600px) {

  .header {
    height: 68px;
    padding: 0 4%;
  }

  .brand strong {
    font-size: 16px;
  }

  main {
    width: 94%;
    padding-top: 25px;
  }

  .intro h1 {
    font-size: 29px;
  }

  .camera-card {
    padding: 8px;
    border-radius: 18px;
  }

  .camera-wrapper {
    border-radius: 14px;
  }

  .preview-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

}

</style>