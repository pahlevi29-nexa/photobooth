<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId = Number(route.query.template || 1)

const template = templates.find(
  item => item.id === templateId
) || templates[0]

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const stream = ref<MediaStream | null>(null)

const photos = ref<string[]>([])

const cameraReady = ref(false)
const cameraError = ref('')

const isCounting = ref(false)
const countdown = ref(3)
const isFinished = ref(false)

const currentPhoto = ref(1)


// ================================
// START CAMERA
// ================================

const startCamera = async () => {

  cameraError.value = ''

  try {

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Browser tidak mendukung kamera.'
      )
    }

    stream.value =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'user'
          },
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

      cameraReady.value = true
    }

  } catch (error) {

    console.error(error)

    cameraError.value =
      'Kamera tidak dapat dibuka. Pastikan izin kamera sudah diberikan kepada browser.'

  }
}


// ================================
// STOP CAMERA
// ================================

const stopCamera = () => {

  if (stream.value) {

    stream.value
      .getTracks()
      .forEach(track => track.stop())

    stream.value = null
  }

}


// ================================
// COUNTDOWN
// ================================

const startCountdown = async () => {

  if (!cameraReady.value) {
    return
  }

  if (isCounting.value) {
    return
  }

  if (photos.value.length >= 4) {
    return
  }

  isCounting.value = true

  countdown.value = 3

  await wait(1000)

  countdown.value = 2

  await wait(1000)

  countdown.value = 1

  await wait(1000)

  countdown.value = 0

  await wait(250)

  takePhoto()

  isCounting.value = false

}


// ================================
// TAKE PHOTO
// ================================

const takePhoto = () => {

  if (!video.value || !canvas.value) {
    return
  }

  const ctx =
    canvas.value.getContext('2d')

  if (!ctx) {
    return
  }

  const width =
    video.value.videoWidth

  const height =
    video.value.videoHeight

  canvas.value.width = width
  canvas.value.height = height

  /*
   * Kamera depan biasanya mirror.
   * Kita mirror hasil foto supaya terasa natural.
   */

  ctx.save()

  ctx.translate(width, 0)

  ctx.scale(-1, 1)

  ctx.drawImage(
    video.value,
    0,
    0,
    width,
    height
  )

  ctx.restore()

  const image =
    canvas.value.toDataURL(
      'image/jpeg',
      0.92
    )

  photos.value.push(image)

  currentPhoto.value =
    photos.value.length + 1

  if (photos.value.length >= 4) {

    isFinished.value = true

    stopCamera()

    savePhotos()

  }

}


// ================================
// SAVE PHOTOS
// ================================

const savePhotos = () => {

  localStorage.setItem(
    'photobooth_photos',
    JSON.stringify(photos.value)
  )

  localStorage.setItem(
    'photobooth_template',
    JSON.stringify(template)
  )

}


// ================================
// RETAKE
// ================================

const retake = async () => {

  photos.value = []

  currentPhoto.value = 1

  isFinished.value = false

  await startCamera()

}


// ================================
// GO RESULT
// ================================

const goResult = () => {

  savePhotos()

  navigateTo(
    `/result?template=${template.id}`
  )

}


// ================================
// BACK
// ================================

const goBack = () => {

  stopCamera()

  navigateTo('/')

}


// ================================
// WAIT
// ================================

const wait = (ms: number) => {

  return new Promise(resolve => {

    setTimeout(resolve, ms)

  })

}


// ================================
// LIFECYCLE
// ================================

onMounted(() => {

  startCamera()

})

onBeforeUnmount(() => {

  stopCamera()

})
</script>


<template>

  <div class="camera-page">

    <!-- HEADER -->

    <header class="camera-header">

      <button
        class="back-button"
        @click="goBack"
      >
        ←
        <span>Kembali</span>
      </button>

      <div class="header-title">

        <span>📸</span>

        <strong>
          {{ template.name }}
        </strong>

      </div>

      <div class="photo-progress">

        {{ Math.min(photos.length + 1, 4) }}/4

      </div>

    </header>


    <!-- MAIN -->

    <main class="camera-main">


      <!-- LEFT -->

      <section class="camera-section">

        <div class="instruction">

          <span class="small-label">
            PHOTO {{ Math.min(photos.length + 1, 4) }}
          </span>

          <h1>
            Get ready!
          </h1>

          <p>
            Pose however you like.
            We'll take 4 photos.
          </p>

        </div>


        <!-- CAMERA -->

        <div class="camera-wrapper">

          <video
            ref="video"
            autoplay
            muted
            playsinline
            class="camera-video"
          />

          <!-- COUNTDOWN -->

          <Transition name="countdown">

            <div
              v-if="isCounting"
              class="countdown"
            >

              {{ countdown }}

            </div>

          </Transition>


          <!-- CAMERA ERROR -->

          <div
            v-if="cameraError"
            class="camera-error"
          >

            <div class="error-icon">
              📷
            </div>

            <h3>
              Kamera belum tersedia
            </h3>

            <p>
              {{ cameraError }}
            </p>

            <button
              @click="startCamera"
              class="retry-button"
            >
              Coba Lagi
            </button>

          </div>

        </div>


        <!-- CONTROLS -->

        <div class="controls">

          <button
            v-if="!isFinished"
            class="capture-button"
            :disabled="
              !cameraReady ||
              isCounting
            "
            @click="startCountdown"
          >

            <span class="camera-icon">
              📸
            </span>

            <span>
              {{ isCounting
                ? 'Bersiap...'
                : 'Ambil Foto'
              }}
            </span>

          </button>


          <div
            v-if="isFinished"
            class="finished-controls"
          >

            <button
              class="secondary-button"
              @click="retake"
            >
              ↻ Ulangi
            </button>

            <button
              class="primary-button"
              @click="goResult"
            >
              Lihat Hasil →
            </button>

          </div>

        </div>


        <!-- TIPS -->

        <div class="tips">

          <span>💡</span>

          <div>

            <strong>
              Tips
            </strong>

            <p>
              Cari tempat dengan pencahayaan
              yang cukup dan lihat ke kamera.
            </p>

          </div>

        </div>

      </section>


      <!-- RIGHT PREVIEW -->

      <aside class="preview-section">

        <div class="preview-header">

          <div>

            <span>
              TEMPLATE
            </span>

            <h2>
              {{ template.name }}
            </h2>

          </div>

          <span class="template-category">
            {{ template.category }}
          </span>

        </div>


        <!-- TEMPLATE PREVIEW -->

        <div
          class="template-preview"
          :style="{
            background:
              `linear-gradient(145deg,
              ${template.colors[0]},
              ${template.colors[1]})`
          }"
        >

          <div class="preview-title">

            {{ template.name }}

          </div>


          <div class="preview-photos">

            <div
              v-for="n in 4"
              :key="n"
              class="preview-photo"
              :class="{
                taken:
                  photos[n - 1]
              }"
            >

              <img
                v-if="photos[n - 1]"
                :src="photos[n - 1]"
                alt="Photo"
              >

              <span v-else>
                {{ n }}
              </span>

            </div>

          </div>


          <div class="preview-footer">

            ✦ memories ✦

          </div>

        </div>


        <!-- PHOTO STATUS -->

        <div class="photo-status">

          <div
            v-for="n in 4"
            :key="n"
            class="status-item"
            :class="{
              done:
                photos[n - 1],
              current:
                currentPhoto === n &&
                !isFinished
            }"
          >

            <span>

              {{
                photos[n - 1]
                  ? '✓'
                  : n
              }}

            </span>

            <small>
              Photo {{ n }}
            </small>

          </div>

        </div>

      </aside>

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

.camera-page {
  min-height: 100vh;

  background:
    #fafafa;

  color:
    #18181b;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}


/* HEADER */

.camera-header {

  height: 72px;

  padding:
    0 5%;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  background:
    rgba(255,255,255,.94);

  border-bottom:
    1px solid #e4e4e7;

  position:
    sticky;

  top: 0;

  z-index: 20;

  backdrop-filter:
    blur(15px);
}

.back-button {

  border: none;

  background: transparent;

  display: flex;

  align-items: center;

  gap: 8px;

  color: #52525b;

  font-weight: 700;

  cursor: pointer;
}

.back-button:hover {
  color: #7c3aed;
}

.header-title {

  display: flex;

  align-items: center;

  gap: 9px;
}

.header-title span {
  font-size: 20px;
}

.photo-progress {

  padding:
    7px 12px;

  border-radius:
    999px;

  background:
    #f3e8ff;

  color:
    #7c3aed;

  font-size:
    12px;

  font-weight:
    800;
}


/* MAIN */

.camera-main {

  width:
    92%;

  max-width:
    1150px;

  margin:
    auto;

  padding:
    45px 0 70px;

  display:
    grid;

  grid-template-columns:
    1.3fr .7fr;

  gap:
    40px;

  align-items:
    start;
}


/* INSTRUCTION */

.instruction {
  margin-bottom:
    20px;
}

.small-label {

  color:
    #7c3aed;

  font-size:
    11px;

  font-weight:
    900;

  letter-spacing:
    2px;
}

.instruction h1 {

  margin:
    6px 0;

  font-size:
    36px;

  font-weight:
    900;

  letter-spacing:
    -1.5px;
}

.instruction p {

  margin:
    0;

  color:
    #71717a;
}


/* CAMERA */

.camera-wrapper {

  position:
    relative;

  width:
    100%;

  aspect-ratio:
    16 / 10;

  overflow:
    hidden;

  border-radius:
    20px;

  background:
    #18181b;

  box-shadow:
    0 20px 50px
    rgba(0,0,0,.18);
}

.camera-video {

  width:
    100%;

  height:
    100%;

  object-fit:
    cover;

  transform:
    scaleX(-1);
}


/* COUNTDOWN */

.countdown {

  position:
    absolute;

  inset:
    0;

  display:
    grid;

  place-items:
    center;

  color:
    white;

  font-size:
    clamp(100px, 15vw, 180px);

  font-weight:
    1000;

  text-shadow:
    0 5px 30px
    rgba(0,0,0,.5);
}


/* ERROR */

.camera-error {

  position:
    absolute;

  inset:
    0;

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

  padding:
    30px;

  color:
    white;

  background:
    #18181b;
}

.error-icon {
  font-size: 50px;
}

.camera-error h3 {
  margin:
    10px 0 5px;
}

.camera-error p {

  max-width:
    400px;

  color:
    #a1a1aa;

  font-size:
    13px;

  line-height:
    1.5;
}

.retry-button {

  padding:
    10px 18px;

  border:
    none;

  border-radius:
    10px;

  background:
    #7c3aed;

  color:
    white;

  font-weight:
    700;

  cursor:
    pointer;
}


/* CONTROLS */

.controls {

  display:
    flex;

  justify-content:
    center;

  margin:
    25px 0;
}

.capture-button {

  min-width:
    210px;

  padding:
    14px 24px;

  border:
    none;

  border-radius:
    14px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    10px;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #c026d3
    );

  color:
    white;

  font-size:
    15px;

  font-weight:
    800;

  box-shadow:
    0 10px 25px
    rgba(124,58,237,.28);

  cursor:
    pointer;

  transition:
    .2s;
}

.capture-button:hover:not(:disabled) {

  transform:
    translateY(-2px);

}

.capture-button:disabled {

  opacity:
    .5;

  cursor:
    not-allowed;
}

.camera-icon {
  font-size:
    20px;
}

.finished-controls {

  display:
    flex;

  gap:
    10px;
}

.secondary-button,
.primary-button {

  padding:
    13px 20px;

  border-radius:
    12px;

  font-weight:
    800;

  cursor:
    pointer;
}

.secondary-button {

  border:
    1px solid #d4d4d8;

  background:
    white;

  color:
    #52525b;
}

.primary-button {

  border:
    none;

  background:
    #7c3aed;

  color:
    white;
}


/* TIPS */

.tips {

  display:
    flex;

  gap:
    12px;

  padding:
    15px;

  border:
    1px solid #e4e4e7;

  border-radius:
    13px;

  background:
    white;
}

.tips > span {
  font-size:
    20px;
}

.tips strong {
  font-size:
    13px;
}

.tips p {

  margin:
    3px 0 0;

  color:
    #71717a;

  font-size:
    12px;

  line-height:
    1.5;
}


/* PREVIEW */

.preview-section {

  padding:
    20px;

  border:
    1px solid #e4e4e7;

  border-radius:
    18px;

  background:
    white;

  box-shadow:
    0 8px 30px
    rgba(0,0,0,.05);
}

.preview-header {

  display:
    flex;

  justify-content:
    space-between;

  align-items:
    flex-start;

  margin-bottom:
    15px;
}

.preview-header span:first-child {

  color:
    #a1a1aa;

  font-size:
    9px;

  font-weight:
    900;

  letter-spacing:
    1.5px;
}

.preview-header h2 {

  margin:
    3px 0 0;

  font-size:
    17px;
}

.template-category {

  padding:
    5px 9px;

  border-radius:
    999px;

  background:
    #f3e8ff;

  color:
    #7c3aed;

  font-size:
    9px;

  font-weight:
    800;
}


/* TEMPLATE */

.template-preview {

  aspect-ratio:
    .72;

  max-height:
    570px;

  margin:
    auto;

  padding:
    25px 18px;

  border-radius:
    10px;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  box-shadow:
    inset 0 0 0 2px
    rgba(255,255,255,.7);
}

.preview-title {

  margin-bottom:
    12px;

  color:
    #be185d;

  font-family:
    Georgia,
    serif;

  font-size:
    20px;

  font-weight:
    900;
}

.preview-photos {

  width:
    90%;

  flex:
    1;

  display:
    grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    7px;
}

.preview-photo {

  min-height:
    60px;

  overflow:
    hidden;

  border:
    2px solid
    rgba(255,255,255,.9);

  border-radius:
    5px;

  display:
    grid;

  place-items:
    center;

  background:
    rgba(255,255,255,.45);

  color:
    rgba(190,24,93,.5);

  font-size:
    12px;

  font-weight:
    800;
}

.preview-photo img {

  width:
    100%;

  height:
    100%;

  object-fit:
    cover;
}

.preview-footer {

  margin-top:
    10px;

  color:
    #be185d;

  font-size:
    9px;
}


/* STATUS */

.photo-status {

  display:
    grid;

  grid-template-columns:
    repeat(4,1fr);

  gap:
    6px;

  margin-top:
    15px;
}

.status-item {

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  gap:
    4px;

  color:
    #a1a1aa;
}

.status-item span {

  width:
    27px;

  height:
    27px;

  display:
    grid;

  place-items:
    center;

  border:
    1px solid #e4e4e7;

  border-radius:
    50%;

  font-size:
    10px;

  font-weight:
    800;
}

.status-item small {
  font-size:
    8px;
}

.status-item.current span {

  border-color:
    #7c3aed;

  color:
    #7c3aed;

  background:
    #f3e8ff;
}

.status-item.done span {

  border-color:
    #22c55e;

  background:
    #22c55e;

  color:
    white;
}


/* HIDDEN CANVAS */

.hidden-canvas {
  display:
    none;
}


/* TRANSITION */

.countdown-enter-active,
.countdown-leave-active {
  transition:
    .2s;
}

.countdown-enter-from,
.countdown-leave-to {
  opacity:
    0;

  transform:
    scale(1.3);
}


/* MOBILE */

@media (max-width: 800px) {

  .camera-header {

    padding:
      0 4%;

  }

  .back-button span {
    display:
      none;
  }

  .camera-main {

    width:
      94%;

    grid-template-columns:
      1fr;

    padding:
      25px 0 50px;

    gap:
      25px;
  }

  .instruction h1 {
    font-size:
      30px;
  }

  .camera-wrapper {

    aspect-ratio:
      3 / 4;

    border-radius:
      16px;
  }

  .preview-section {

    order:
      2;
  }

  .template-preview {

    max-height:
      500px;

  }

}

</style>