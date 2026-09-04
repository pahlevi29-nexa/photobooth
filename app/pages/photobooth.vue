<template>
  <div class="page">

    <!-- HEADER -->
    <header>
      <NuxtLink to="/" class="logo">
        📸 PHOTOBOOTH
      </NuxtLink>

      <NuxtLink to="/" class="back">
        ← Kembali
      </NuxtLink>
    </header>

    <!-- CONTENT -->
    <main>

      <div class="title">
        <p>READY?</p>
        <h1>Let's Take a Photo</h1>
      </div>

      <!-- CAMERA -->
      <div class="camera-container">

        <video
          ref="video"
          autoplay
          playsinline
          muted
          class="camera"
        ></video>

        <!-- CAMERA OFF -->
        <div
          v-if="!cameraActive"
          class="camera-off"
        >
          <div class="camera-icon">
            📷
          </div>

          <h2>Kamera belum aktif</h2>

          <p>
            Izinkan browser menggunakan kamera kamu.
          </p>

          <button @click="startCamera">
            Aktifkan Kamera
          </button>
        </div>

      </div>

      <!-- CAMERA CONTROLS -->
      <div
        v-if="cameraActive"
        class="controls"
      >

        <button
          class="capture-button"
          @click="takePhoto"
        >
          <span>📸</span>
          Ambil Foto
        </button>

        <button
          class="stop-button"
          @click="stopCamera"
        >
          Matikan Kamera
        </button>

      </div>

      <!-- RESULT -->
      <div
        v-if="photo"
        class="result"
      >

        <h2>Hasil Foto</h2>

        <img
          :src="photo"
          alt="Hasil foto"
        >

        <div class="result-buttons">

          <button
            class="download"
            @click="downloadPhoto"
          >
            ⬇️ Download Foto
          </button>

          <button
            class="retake"
            @click="retakePhoto"
          >
            🔄 Ambil Lagi
          </button>

        </div>

      </div>

    </main>

    <!-- CANVAS UNTUK FOTO -->
    <canvas
      ref="canvas"
      style="display: none"
    ></canvas>

  </div>
</template>


<script setup>

import { ref, onBeforeUnmount } from 'vue'


/*
|--------------------------------------------------------------------------
| REFERENCE
|--------------------------------------------------------------------------
*/

const video = ref(null)

const canvas = ref(null)

const photo = ref(null)

const cameraActive = ref(false)

const stream = ref(null)


/*
|--------------------------------------------------------------------------
| AKTIFKAN KAMERA
|--------------------------------------------------------------------------
*/

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

    video.value.srcObject = stream.value

    cameraActive.value = true

  } catch (error) {

    console.error(error)

    alert(
      'Kamera tidak dapat digunakan. Pastikan kamu sudah memberikan izin kamera pada browser.'
    )

  }

}


/*
|--------------------------------------------------------------------------
| AMBIL FOTO
|--------------------------------------------------------------------------
*/

const takePhoto = () => {

  if (!video.value || !canvas.value) {
    return
  }

  const width = video.value.videoWidth

  const height = video.value.videoHeight

  canvas.value.width = width

  canvas.value.height = height

  const context = canvas.value.getContext('2d')

  context.drawImage(
    video.value,
    0,
    0,
    width,
    height
  )

  photo.value = canvas.value.toDataURL('image/png')

}


/*
|--------------------------------------------------------------------------
| DOWNLOAD FOTO
|--------------------------------------------------------------------------
*/

const downloadPhoto = () => {

  if (!photo.value) {
    return
  }

  const link = document.createElement('a')

  link.href = photo.value

  link.download = 'photobooth.png'

  link.click()

}


/*
|--------------------------------------------------------------------------
| AMBIL FOTO LAGI
|--------------------------------------------------------------------------
*/

const retakePhoto = () => {

  photo.value = null

}


/*
|--------------------------------------------------------------------------
| MATIKAN KAMERA
|--------------------------------------------------------------------------
*/

const stopCamera = () => {

  if (stream.value) {

    stream.value.getTracks().forEach(track => {
      track.stop()
    })

    stream.value = null

  }

  cameraActive.value = false

}


/*
|--------------------------------------------------------------------------
| CLEANUP
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {

  stopCamera()

})

</script>


<style scoped>

* {
  box-sizing: border-box;
}


/* PAGE */

.page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at top left,
      #4c1d95,
      transparent 35%
    ),
    radial-gradient(
      circle at bottom right,
      #be185d,
      transparent 35%
    ),
    #09090b;

  color: white;

  padding: 25px;
}


/* HEADER */

header {
  max-width: 1200px;

  margin: auto;

  display: flex;

  justify-content: space-between;

  align-items: center;
}


.logo {
  color: white;

  text-decoration: none;

  font-weight: 800;

  font-size: 18px;
}


.back {
  color: #a1a1aa;

  text-decoration: none;

  transition: 0.3s;
}


.back:hover {
  color: white;
}


/* MAIN */

main {
  max-width: 1000px;

  margin: 60px auto;

  padding-bottom: 80px;
}


/* TITLE */

.title {
  text-align: center;

  margin-bottom: 35px;
}


.title p {
  color: #d8b4fe;

  letter-spacing: 5px;

  font-size: 12px;

  margin-bottom: 10px;
}


.title h1 {
  font-size: clamp(32px, 5vw, 50px);

  margin: 0;

  font-weight: 800;
}


/* CAMERA */

.camera-container {
  position: relative;

  max-width: 850px;

  margin: auto;

  aspect-ratio: 16 / 10;

  border-radius: 30px;

  overflow: hidden;

  background: #18181b;

  border: 1px solid #3f3f46;

  box-shadow:
    0 30px 80px rgba(0,0,0,0.4);
}


.camera {
  width: 100%;

  height: 100%;

  object-fit: cover;

  display: block;

  transform: scaleX(-1);
}


/* CAMERA OFF */

.camera-off {
  position: absolute;

  inset: 0;

  display: flex;

  flex-direction: column;

  justify-content: center;

  align-items: center;

  text-align: center;

  padding: 20px;

  background: #18181b;
}


.camera-icon {
  font-size: 60px;

  margin-bottom: 15px;
}


.camera-off h2 {
  margin: 5px;
}


.camera-off p {
  color: #a1a1aa;

  margin-bottom: 20px;
}


/* BUTTON */

button {
  border: none;

  cursor: pointer;

  font-family: inherit;

  transition: 0.3s;
}


.camera-off button {
  padding: 15px 28px;

  border-radius: 999px;

  background: white;

  color: #18181b;

  font-weight: 700;
}


.camera-off button:hover {
  transform: translateY(-3px);

  box-shadow:
    0 10px 30px rgba(255,255,255,0.15);
}


/* CONTROLS */

.controls {
  display: flex;

  justify-content: center;

  gap: 15px;

  margin-top: 25px;

  flex-wrap: wrap;
}


.capture-button {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 16px 30px;

  border-radius: 999px;

  background: white;

  color: #18181b;

  font-size: 16px;

  font-weight: 800;
}


.capture-button span {
  font-size: 22px;
}


.capture-button:hover {
  transform: translateY(-3px);

  box-shadow:
    0 10px 35px rgba(255,255,255,0.2);
}


.stop-button {
  padding: 16px 25px;

  border-radius: 999px;

  background: #27272a;

  color: white;

  font-weight: 600;
}


.stop-button:hover {
  background: #3f3f46;
}


/* RESULT */

.result {
  max-width: 600px;

  margin: 60px auto 0;

  text-align: center;
}


.result h2 {
  font-size: 28px;

  margin-bottom: 25px;
}


.result img {
  width: 100%;

  border-radius: 20px;

  border: 1px solid #3f3f46;

  display: block;

  box-shadow:
    0 20px 60px rgba(0,0,0,0.4);
}


/* RESULT BUTTONS */

.result-buttons {
  display: flex;

  justify-content: center;

  gap: 15px;

  margin-top: 20px;

  flex-wrap: wrap;
}


.download,
.retake {
  padding: 14px 22px;

  border-radius: 999px;

  font-weight: 700;
}


.download {
  background: white;

  color: #18181b;
}


.retake {
  background: #27272a;

  color: white;
}


.download:hover,
.retake:hover {
  transform: translateY(-3px);
}


/* MOBILE */

@media (max-width: 600px) {

  .page {
    padding: 18px;
  }

  main {
    margin-top: 45px;
  }

  .camera-container {
    border-radius: 20px;

    aspect-ratio: 3 / 4;
  }

  .camera {
    object-fit: cover;
  }

  .controls {
    flex-direction: column;
  }

  .capture-button,
  .stop-button {
    width: 100%;

    justify-content: center;
  }

}

</style>