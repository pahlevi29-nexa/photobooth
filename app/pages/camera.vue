<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

// =====================================================
// TEMPLATE
// =====================================================

const templateId = computed(() => {
  const id = Number(route.query.template || 1)
  return Number.isFinite(id) ? id : 1
})

const template = computed(() => {
  return (
    templates.find(item => item.id === templateId.value) ||
    templates[0]
  )
})

// =====================================================
// CAMERA
// =====================================================

const video = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)

const cameraReady = ref(false)
const cameraLoading = ref(false)
const cameraError = ref('')

const cameraFacing = ref<'user' | 'environment'>('user')

// =====================================================
// PHOTO
// =====================================================

const photos = ref<string[]>([])

const isTakingPhoto = ref(false)

const countdown = ref<number | null>(null)

const currentPhoto = computed(() => {
  return photos.value.length + 1
})

const totalPhotos = computed(() => {
  const count = Number(template.value?.photos ?? 4)
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 4
})

const progress = computed(() => {
  return `${Math.min(currentPhoto.value, totalPhotos.value)}/${totalPhotos.value}`
})

// =====================================================
// FLASH
// =====================================================

const flash = ref(false)

// =====================================================
// CAMERA START
// =====================================================

const startCamera = async () => {
  cameraError.value = ''
  cameraLoading.value = true

  try {
    // Pastikan browser mendukung kamera
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Browser tidak mendukung akses kamera.'
      )
    }

    // Matikan kamera lama
    stopCamera()

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: cameraFacing.value,

        width: {
          ideal: 1280
        },

        height: {
          ideal: 720
        }
      },

      audio: false
    }

    const newStream =
      await navigator.mediaDevices.getUserMedia(
        constraints
      )

    stream.value = newStream

    if (!video.value) {
      throw new Error(
        'Video element belum tersedia.'
      )
    }

    video.value.srcObject = newStream

    video.value.muted = true

    video.value.setAttribute(
      'playsinline',
      'true'
    )

    video.value.setAttribute(
      'webkit-playsinline',
      'true'
    )

    // Tunggu metadata video
    await new Promise<void>((resolve, reject) => {
      if (!video.value) {
        reject(
          new Error('Video tidak tersedia.')
        )
        return
      }

      const currentVideo = video.value

      if (
        currentVideo.readyState >= 2 &&
        currentVideo.videoWidth > 0
      ) {
        resolve()
        return
      }

      const timeout = window.setTimeout(() => {
        reject(
          new Error(
            'Kamera terlalu lama merespons.'
          )
        )
      }, 10000)

      currentVideo.onloadedmetadata = () => {
        window.clearTimeout(timeout)
        resolve()
      }
    })

    await video.value.play()

    cameraReady.value = true

  } catch (error: any) {
    console.error(
      'Camera error:',
      error
    )

    cameraReady.value = false

    if (
      error?.name ===
      'NotAllowedError'
    ) {
      cameraError.value =
        'Izin kamera ditolak. Izinkan kamera pada pengaturan browser.'
    } else if (
      error?.name ===
      'NotFoundError'
    ) {
      cameraError.value =
        'Kamera tidak ditemukan pada perangkat ini.'
    } else if (
      error?.name ===
      'NotReadableError'
    ) {
      cameraError.value =
        'Kamera sedang digunakan aplikasi lain.'
    } else if (
      error?.name ===
      'OverconstrainedError'
    ) {
      cameraError.value =
        'Kamera tidak mendukung pengaturan ini. Coba ganti kamera.'
    } else {
      cameraError.value =
        'Kamera tidak dapat dibuka. Pastikan situs menggunakan HTTPS dan izin kamera sudah diberikan.'
    }

  } finally {
    cameraLoading.value = false
  }
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

  if (video.value) {
    video.value.srcObject = null
  }

  cameraReady.value = false
}

// =====================================================
// SWITCH CAMERA
// =====================================================

const switchCamera = async () => {
  if (isTakingPhoto.value) return

  cameraFacing.value =
    cameraFacing.value === 'user'
      ? 'environment'
      : 'user'

  await startCamera()
}

// =====================================================
// COUNTDOWN
// =====================================================

const wait = (ms: number) => {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  )
}

const runCountdown = async () => {
  countdown.value = 3
  await wait(900)

  countdown.value = 2
  await wait(900)

  countdown.value = 1
  await wait(900)

  countdown.value = null
}

// =====================================================
// CAPTURE PHOTO
// =====================================================

const capturePhoto = async () => {
  if (
    !video.value ||
    !cameraReady.value ||
    isTakingPhoto.value
  ) {
    return
  }

  if (
    photos.value.length >= totalPhotos.value
  ) {
    goToResult()
    return
  }

  isTakingPhoto.value = true

  // Countdown
  await runCountdown()

  if (!video.value) {
    isTakingPhoto.value = false
    return
  }

  const currentVideo = video.value

  const width =
    currentVideo.videoWidth || 1280

  const height =
    currentVideo.videoHeight || 720

  const canvas =
    document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  const ctx =
    canvas.getContext('2d')

  if (!ctx) {
    isTakingPhoto.value = false
    return
  }

  // Mirror kamera depan
  if (
    cameraFacing.value === 'user'
  ) {
    ctx.translate(
      width,
      0
    )

    ctx.scale(
      -1,
      1
    )
  }

  ctx.drawImage(
    currentVideo,
    0,
    0,
    width,
    height
  )

  // Flash
  flash.value = true

  setTimeout(() => {
    flash.value = false
  }, 180)

  const image =
    canvas.toDataURL(
      'image/jpeg',
      0.92
    )

  photos.value.push(image)

  isTakingPhoto.value = false

  // Kalau jumlah foto sudah sesuai template
  if (
    photos.value.length >= totalPhotos.value
  ) {
    await wait(700)

    goToResult()
  }
}

// =====================================================
// RESULT
// =====================================================

const goToResult = () => {
  stopCamera()

  localStorage.setItem(
    'photobooth_photos',
    JSON.stringify(
      photos.value
    )
  )

  navigateTo(
    `/result?template=${templateId.value}`
  )
}

// =====================================================
// RESET
// =====================================================

const resetPhotos = () => {
  photos.value = []
}

// =====================================================
// HOME
// =====================================================

const goHome = () => {
  stopCamera()

  navigateTo('/')
}

// =====================================================
// CLEANUP
// =====================================================

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <div class="camera-page">

    <!-- ========================================= -->
    <!-- HEADER -->
    <!-- ========================================= -->

    <header class="camera-header">

      <button
        class="back-button"
        @click="goHome"
      >
        <span class="back-icon">
          ←
        </span>

        <span>
          Kembali
        </span>
      </button>

      <div class="brand">
        <span class="brand-camera">
          📸
        </span>

        <span>
          Film Memories
        </span>
      </div>

      <div class="progress">
        {{ progress }}
      </div>

    </header>


    <!-- ========================================= -->
    <!-- MAIN -->
    <!-- ========================================= -->

    <main class="camera-main">

      <!-- ======================================= -->
      <!-- INSTRUCTION -->
      <!-- ======================================= -->

      <section class="instruction">

        <div class="photo-number">
          PHOTO {{ currentPhoto }}
        </div>

        <h1>
          {{ photos.length === 0
            ? 'Get ready!'
            : photos.length < totalPhotos
              ? 'Great shot!'
              : 'All done!'
          }}
        </h1>

        <p>
          <span v-if="photos.length === 0">
            Pose however you like.
            We'll take {{ totalPhotos }} photos.
          </span>

          <span
            v-else-if="
              photos.length < totalPhotos
            "
          >
            Siapkan pose berikutnya.
            Foto {{ photos.length + 1 }}
            dari {{ totalPhotos }}.
          </span>

          <span v-else>
            Semua foto sudah selesai!
          </span>
        </p>

      </section>


      <!-- ======================================= -->
      <!-- CAMERA -->
      <!-- ======================================= -->

      <section class="camera-section">

        <div class="camera-card">

          <div class="camera-wrapper">

            <!-- CAMERA VIDEO -->

            <video
              ref="video"
              v-show="cameraReady"
              autoplay
              muted
              playsinline
              webkit-playsinline
              class="camera-video"
            />

            <!-- CAMERA NOT STARTED -->

            <div
              v-if="
                !cameraReady &&
                !cameraLoading &&
                !cameraError
              "
              class="camera-start"
            >

              <div class="camera-start-icon">
                📸
              </div>

              <h2>
                Siap Foto?
              </h2>

              <p>
                Izinkan kamera HP
                untuk mulai mengambil
                foto.
              </p>

              <button
                class="start-camera-button"
                @click="startCamera"
              >
                📷 Aktifkan Kamera
              </button>

            </div>


            <!-- CAMERA LOADING -->

            <div
              v-if="cameraLoading"
              class="camera-start"
            >

              <div class="spinner"></div>

              <h2>
                Membuka kamera...
              </h2>

              <p>
                Tunggu sebentar.
              </p>

            </div>


            <!-- CAMERA ERROR -->

            <div
              v-if="cameraError"
              class="camera-start error-box"
            >

              <div class="camera-start-icon error-icon">
                ⚠️
              </div>

              <h2>
                Kamera tidak bisa dibuka
              </h2>

              <p>
                {{ cameraError }}
              </p>

              <button
                class="start-camera-button"
                @click="startCamera"
              >
                🔄 Coba Lagi
              </button>

            </div>


            <!-- COUNTDOWN -->

            <Transition name="countdown">

              <div
                v-if="countdown !== null"
                class="countdown"
              >
                {{ countdown }}
              </div>

            </Transition>


            <!-- FLASH -->

            <Transition name="flash">

              <div
                v-if="flash"
                class="flash"
              ></div>

            </Transition>


            <!-- CAMERA CONTROLS -->

            <div
              v-if="cameraReady"
              class="camera-controls"
            >

              <button
                class="camera-control"
                @click="switchCamera"
                :disabled="isTakingPhoto"
                title="Ganti kamera"
              >
                🔄
              </button>

            </div>


            <!-- PHOTO COUNT -->

            <div
              v-if="cameraReady"
              class="camera-counter"
            >

              <span>
                {{ photos.length }}
              </span>

              /
              {{ totalPhotos }}

            </div>

          </div>


          <!-- =================================== -->
          <!-- TAKE PHOTO BUTTON -->
          <!-- =================================== -->

          <button
            v-if="cameraReady"
            class="capture-button"
            :disabled="isTakingPhoto"
            @click="capturePhoto"
          >

            <span
              v-if="!isTakingPhoto"
            >
              📸
              Ambil Foto
            </span>

            <span
              v-else
            >
              Bersiap...
            </span>

          </button>


          <!-- =================================== -->
          <!-- RETAKE -->
          <!-- =================================== -->

          <button
            v-if="photos.length > 0"
            class="reset-button"
            @click="resetPhotos"
            :disabled="isTakingPhoto"
          >
            ↻ Ulangi Semua Foto
          </button>

        </div>

      </section>


      <!-- ======================================= -->
      <!-- PHOTO PREVIEW -->
      <!-- ======================================= -->

      <section
        v-if="photos.length > 0"
        class="preview-section"
      >

        <div class="preview-title">

          <div>
            <small>
              YOUR PHOTOS
            </small>

            <h2>
              Foto yang sudah diambil
            </h2>
          </div>

          <span>
            {{ photos.length }}/{{ totalPhotos }}
          </span>

        </div>


        <div class="photo-grid">

          <div
            v-for="(
              photo,
              index
            ) in photos"
            :key="index"
            class="photo-item"
          >

            <img
              :src="photo"
              :alt="`Foto ${index + 1}`"
            >

            <div class="photo-label">
              PHOTO {{ index + 1 }}
            </div>

          </div>

        </div>


        <!-- GO RESULT -->

        <button
          v-if="
            photos.length === totalPhotos
          "
          class="result-button"
          @click="goToResult"
        >
          ✨ Lihat Hasil Photobooth
        </button>

      </section>


      <!-- ======================================= -->
      <!-- TEMPLATE INFO -->
      <!-- ======================================= -->

      <section class="template-info">

        <div class="template-icon">
          ✨
        </div>

        <div>

          <small>
            TEMPLATE
          </small>

          <h3>
            {{ template.name }}
          </h3>

          <p>
            {{ template.subtitle }}
          </p>

        </div>

      </section>

    </main>


    <!-- ========================================= -->
    <!-- FOOTER -->
    <!-- ========================================= -->

    <footer>
      Made with 📸 for beautiful memories
    </footer>

  </div>
</template>


<style scoped>

/* =====================================================
   RESET
===================================================== */

* {
  box-sizing: border-box;
}


/* =====================================================
   PAGE
===================================================== */

.camera-page {

  min-height: 100vh;

  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #fafafa 100%
    );

  color: #18181b;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

}


/* =====================================================
   HEADER
===================================================== */

.camera-header {

  height: 76px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    0 5%;

  background:
    rgba(255,255,255,.94);

  border-bottom:
    1px solid #e4e4e7;

  position: sticky;

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

  font-size: 14px;

  font-weight: 700;

  cursor: pointer;

}

.back-icon {

  font-size: 24px;

}

.brand {

  display: flex;

  align-items: center;

  gap: 9px;

  font-size: 18px;

  font-weight: 900;

}

.brand-camera {

  font-size: 23px;

}

.progress {

  min-width: 54px;

  padding:
    9px 13px;

  border-radius: 999px;

  background:
    #f3e8ff;

  color:
    #7c3aed;

  text-align: center;

  font-weight: 900;

}


/* =====================================================
   MAIN
===================================================== */

.camera-main {

  width: 92%;

  max-width: 1050px;

  margin: auto;

  padding:
    45px 0 70px;

  display: grid;

  grid-template-columns:
    340px 1fr;

  gap: 35px;

  align-items: start;

}


/* =====================================================
   INSTRUCTION
===================================================== */

.instruction {

  padding-top: 30px;

}

.photo-number {

  color:
    #7c3aed;

  font-size:
    12px;

  font-weight:
    900;

  letter-spacing:
    3px;

  margin-bottom:
    12px;

}

.instruction h1 {

  margin:
    0 0 12px;

  font-size:
    42px;

  line-height:
    1.05;

  letter-spacing:
    -1.5px;

}

.instruction p {

  margin:
    0;

  color:
    #71717a;

  font-size:
    18px;

  line-height:
    1.55;

}


/* =====================================================
   CAMERA SECTION
===================================================== */

.camera-section {

  width: 100%;

}

.camera-card {

  width: 100%;

}

.camera-wrapper {

  width: 100%;

  aspect-ratio:
    4 / 3;

  position: relative;

  overflow: hidden;

  border-radius:
    24px;

  background:
    #18181b;

  box-shadow:
    0 25px 70px
    rgba(0,0,0,.16);

}

.camera-video {

  width: 100%;

  height: 100%;

  display: block;

  object-fit: cover;

  background:
    #18181b;

}


/* =====================================================
   CAMERA START
===================================================== */

.camera-start {

  position: absolute;

  inset: 0;

  z-index: 5;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  padding: 25px;

  text-align: center;

  background:
    radial-gradient(
      circle at top,
      #29292f,
      #111114
    );

  color: white;

}

.camera-start-icon {

  width: 82px;

  height: 82px;

  display: grid;

  place-items: center;

  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  font-size: 34px;

  margin-bottom: 18px;

  box-shadow:
    0 15px 35px
    rgba(124,58,237,.35);

}

.camera-start h2 {

  margin:
    0 0 8px;

  font-size:
    24px;

}

.camera-start p {

  max-width:
    300px;

  margin:
    0 0 22px;

  color:
    #a1a1aa;

  line-height:
    1.5;

  font-size:
    14px;

}

.start-camera-button {

  border:
    none;

  padding:
    15px 27px;

  border-radius:
    14px;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  color:
    white;

  font-size:
    15px;

  font-weight:
    900;

  cursor:
    pointer;

  box-shadow:
    0 12px 30px
    rgba(124,58,237,.35);

}

.error-icon {

  background:
    linear-gradient(
      135deg,
      #ef4444,
      #f97316
    );

}


/* =====================================================
   SPINNER
===================================================== */

.spinner {

  width: 55px;

  height: 55px;

  border:
    4px solid
    rgba(255,255,255,.2);

  border-top-color:
    white;

  border-radius:
    50%;

  animation:
    spin .8s linear infinite;

  margin-bottom:
    20px;

}

@keyframes spin {

  to {
    transform:
      rotate(360deg);
  }

}


/* =====================================================
   COUNTDOWN
===================================================== */

.countdown {

  position: absolute;

  inset: 0;

  z-index: 10;

  display: grid;

  place-items: center;

  color: white;

  font-size:
    clamp(100px, 18vw, 190px);

  font-weight:
    1000;

  text-shadow:
    0 10px 40px
    rgba(0,0,0,.5);

  background:
    rgba(0,0,0,.15);

}

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


/* =====================================================
   FLASH
===================================================== */

.flash {

  position:
    absolute;

  inset:
    0;

  z-index:
    15;

  background:
    white;

  pointer-events:
    none;

}

.flash-enter-active,
.flash-leave-active {

  transition:
    .18s;

}

.flash-enter-from,
.flash-leave-to {

  opacity:
    0;

}


/* =====================================================
   CAMERA CONTROLS
===================================================== */

.camera-controls {

  position:
    absolute;

  top:
    18px;

  right:
    18px;

  z-index:
    8;

}

.camera-control {

  width:
    48px;

  height:
    48px;

  border:
    1px solid
    rgba(255,255,255,.25);

  border-radius:
    50%;

  background:
    rgba(0,0,0,.5);

  color:
    white;

  font-size:
    20px;

  cursor:
    pointer;

  backdrop-filter:
    blur(8px);

}

.camera-control:disabled {

  opacity:
    .5;

}


/* =====================================================
   CAMERA COUNTER
===================================================== */

.camera-counter {

  position:
    absolute;

  left:
    50%;

  bottom:
    18px;

  transform:
    translateX(-50%);

  z-index:
    8;

  padding:
    8px 15px;

  border-radius:
    999px;

  background:
    rgba(0,0,0,.55);

  color:
    white;

  font-size:
    14px;

  font-weight:
    800;

  backdrop-filter:
    blur(8px);

}

.camera-counter span {

  color:
    #d8b4fe;

}


/* =====================================================
   CAPTURE BUTTON
===================================================== */

.capture-button {

  width:
    100%;

  margin-top:
    18px;

  padding:
    17px;

  border:
    none;

  border-radius:
    16px;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  color:
    white;

  font-size:
    17px;

  font-weight:
    900;

  cursor:
    pointer;

  box-shadow:
    0 12px 30px
    rgba(124,58,237,.25);

  transition:
    .2s;

}

.capture-button:hover {

  transform:
    translateY(-2px);

}

.capture-button:disabled {

  opacity:
    .65;

  cursor:
    wait;

  transform:
    none;

}


/* =====================================================
   RESET
===================================================== */

.reset-button {

  display:
    block;

  margin:
    13px auto 0;

  border:
    none;

  background:
    transparent;

  color:
    #71717a;

  font-size:
    13px;

  font-weight:
    700;

  cursor:
    pointer;

}

.reset-button:disabled {

  opacity:
    .5;

}


/* =====================================================
   PREVIEW
===================================================== */

.preview-section {

  grid-column:
    1 / -1;

  margin-top:
    15px;

  padding:
    25px;

  border:
    1px solid #e4e4e7;

  border-radius:
    22px;

  background:
    white;

}

.preview-title {

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  margin-bottom:
    18px;

}

.preview-title small {

  color:
    #7c3aed;

  font-size:
    10px;

  font-weight:
    900;

  letter-spacing:
    2px;

}

.preview-title h2 {

  margin:
    5px 0 0;

  font-size:
    21px;

}

.preview-title > span {

  padding:
    8px 12px;

  border-radius:
    999px;

  background:
    #f4f4f5;

  color:
    #52525b;

  font-size:
    13px;

  font-weight:
    800;

}

.photo-grid {

  display:
    grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap:
    12px;

}

.photo-item {

  position:
    relative;

  aspect-ratio:
    4 / 3;

  overflow:
    hidden;

  border-radius:
    12px;

  background:
    #f4f4f5;

}

.photo-item img {

  width:
    100%;

  height:
    100%;

  object-fit:
    cover;

  display:
    block;

}

.photo-label {

  position:
    absolute;

  left:
    8px;

  bottom:
    8px;

  padding:
    5px 8px;

  border-radius:
    6px;

  background:
    rgba(0,0,0,.6);

  color:
    white;

  font-size:
    9px;

  font-weight:
    900;

}

.result-button {

  width:
    100%;

  margin-top:
    18px;

  padding:
    16px;

  border:
    none;

  border-radius:
    14px;

  background:
    #18181b;

  color:
    white;

  font-size:
    15px;

  font-weight:
    900;

  cursor:
    pointer;

}


/* =====================================================
   TEMPLATE INFO
===================================================== */

.template-info {

  grid-column:
    1 / -1;

  display:
    flex;

  align-items:
    center;

  gap:
    15px;

  padding:
    18px;

  border-radius:
    18px;

  background:
    #fafafa;

  border:
    1px solid #e4e4e7;

}

.template-icon {

  width:
    50px;

  height:
    50px;

  display:
    grid;

  place-items:
    center;

  border-radius:
    14px;

  background:
    #f3e8ff;

  font-size:
    23px;

}

.template-info small {

  color:
    #71717a;

  font-size:
    9px;

  font-weight:
    900;

  letter-spacing:
    2px;

}

.template-info h3 {

  margin:
    3px 0;

  font-size:
    16px;

}

.template-info p {

  margin:
    0;

  color:
    #71717a;

  font-size:
    12px;

}


/* =====================================================
   FOOTER
===================================================== */

footer {

  padding:
    25px;

  text-align:
    center;

  color:
    #a1a1aa;

  font-size:
    12px;

  border-top:
    1px solid #e4e4e7;

}


/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 800px) {

  .camera-header {

    height:
      68px;

    padding:
      0 4%;

  }

  .brand {

    font-size:
      16px;

  }

  .back-button span:not(.back-icon) {

    display:
      none;

  }

  .camera-main {

    width:
      94%;

    display:
      flex;

    flex-direction:
      column;

    padding:
      25px 0 45px;

    gap:
      22px;

  }

  .instruction {

    padding-top:
      0;

    width:
      100%;

  }

  .instruction h1 {

    font-size:
      31px;

  }

  .instruction p {

    font-size:
      15px;

  }

  .camera-wrapper {

    aspect-ratio:
      3 / 4;

    border-radius:
      20px;

  }

  .camera-video {

    object-fit:
      cover;

  }

  .preview-section {

    width:
      100%;

    padding:
      18px;

  }

  .photo-grid {

    grid-template-columns:
      repeat(2, 1fr);

  }

  .template-info {

    width:
      100%;

  }

}


/* =====================================================
   SMALL PHONE
===================================================== */

@media (max-width: 420px) {

  .camera-header {

    padding:
      0 15px;

  }

  .brand {

    font-size:
      14px;

  }

  .brand-camera {

    font-size:
      18px;

  }

  .progress {

    min-width:
      48px;

    padding:
      8px 10px;

    font-size:
      12px;

  }

  .instruction h1 {

    font-size:
      28px;

  }

  .camera-wrapper {

    aspect-ratio:
      3 / 4;

  }

}
</style>