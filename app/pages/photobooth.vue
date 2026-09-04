<template>
  <main class="booth">

    <!-- HEADER -->

    <header>

      <NuxtLink to="/" class="logo">
        📸 PHOTOBOOTH
      </NuxtLink>

      <div class="step">
        STEP {{ step }} / 3
      </div>

    </header>


    <!-- STEP 1 -->

    <section
      v-if="step === 1"
      class="section"
    >

      <div class="heading">

        <span>STEP 01</span>

        <h1>
          Choose your
          <em>template.</em>
        </h1>

        <p>
          Pilih desain yang paling cocok dengan momenmu.
        </p>

      </div>


      <div class="templates">

        <button
          v-for="template in templates"
          :key="template.id"
          class="template-card"
          :class="{
            selected: selectedTemplate === template.id
          }"
          @click="selectedTemplate = template.id"
        >

          <div
            class="preview"
            :style="template.style"
          >

            <div class="preview-title">
              {{ template.title }}
            </div>

            <div class="mini-photo">
              📸
            </div>

            <div class="mini-photo">
              📸
            </div>

            <div class="mini-photo">
              📸
            </div>

            <small>
              {{ template.subtitle }}
            </small>

          </div>

          <div class="template-name">

            <span>
              {{ template.name }}
            </span>

            <b
              v-if="selectedTemplate === template.id"
            >
              ✓
            </b>

          </div>

        </button>

      </div>


      <button
        class="continue"
        @click="step = 2"
      >
        Lanjut ke Kamera
        <b>→</b>
      </button>

    </section>


    <!-- STEP 2 -->

    <section
      v-if="step === 2"
      class="section camera-section"
    >

      <div class="heading">

        <span>STEP 02</span>

        <h1>
          Ready,
          <em>Smile!</em>
        </h1>

        <p>
          Kita akan mengambil 4 foto.
        </p>

      </div>


      <div class="camera-box">

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
          class="camera-start"
        >

          <div>📷</div>

          <h2>Kamera siap?</h2>

          <p>
            Izinkan browser menggunakan kamera.
          </p>

          <button
            @click="startCamera"
          >
            Aktifkan Kamera
          </button>

        </div>

      </div>


      <div class="photo-counter">

        <div
          v-for="number in 4"
          :key="number"
          class="counter"
          :class="{
            done: photos.length >= number
          }"
        >
          {{ photos.length >= number ? '✓' : number }}
        </div>

      </div>


      <button
        v-if="cameraActive && photos.length < 4"
        class="capture"
        @click="capturePhoto"
        :disabled="countdown > 0"
      >
        📸
        {{ countdown > 0 ? countdown : 'Ambil Foto' }}
      </button>


      <button
        v-if="photos.length === 4"
        class="continue"
        @click="createResult"
      >
        Lihat Hasil
        <b>→</b>
      </button>


      <button
        class="back"
        @click="step = 1"
      >
        ← Ganti Template
      </button>

    </section>


    <!-- STEP 3 -->

    <section
      v-if="step === 3"
      class="section result-section"
    >

      <div class="heading">

        <span>STEP 03</span>

        <h1>
          Your moment,
          <em>captured.</em>
        </h1>

        <p>
          Ini hasil photobooth kamu.
        </p>

      </div>


      <div
        class="result-card"
        :style="resultStyle"
      >

        <div class="result-title">
          {{ currentTemplate.title }}
        </div>


        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="result-photo"
        >

          <img
            :src="photo"
            alt="Photo"
          >

        </div>


        <div class="result-text">
          {{ currentTemplate.subtitle }}
        </div>

      </div>


      <div class="result-actions">

        <input
          v-model="caption"
          placeholder="Tulis nama / pesan..."
        >

        <button
          class="download"
          @click="downloadResult"
        >
          ⬇ Download Foto
        </button>

        <button
          class="retake"
          @click="resetAll"
        >
          🔄 Mulai Lagi
        </button>

      </div>

    </section>


    <canvas
      ref="canvas"
      style="display:none"
    ></canvas>

  </main>
</template>


<script setup>

import {
  ref,
  computed,
  onBeforeUnmount
} from 'vue'


/* STEP */

const step = ref(1)


/* TEMPLATE */

const selectedTemplate = ref('love')


const templates = [

  {
    id: 'classic',
    name: 'Classic',
    title: 'MEMORIES',
    subtitle: 'Beautiful Moments',
    style: {
      background:
        'linear-gradient(160deg,#f5f5f4,#d6d3d1)',
      color: '#292524'
    }
  },

  {
    id: 'love',
    name: 'Love',
    title: 'OUR MOMENT',
    subtitle: 'Made With Love ♥',
    style: {
      background:
        'linear-gradient(160deg,#881337,#fb7185)',
      color: 'white'
    }
  },

  {
    id: 'pink',
    name: 'Pink Love',
    title: 'LOVE',
    subtitle: 'Forever & Always',
    style: {
      background:
        'linear-gradient(160deg,#fce7f3,#f9a8d4)',
      color: '#831843'
    }
  },

  {
    id: 'wedding',
    name: 'Wedding',
    title: 'THE WEDDING',
    subtitle: 'Together Forever',
    style: {
      background:
        'linear-gradient(160deg,#292524,#d6b87c)',
      color: 'white'
    }
  },

  {
    id: 'birthday',
    name: 'Birthday',
    title: 'BIRTHDAY',
    subtitle: 'Make A Wish ✨',
    style: {
      background:
        'linear-gradient(160deg,#7c3aed,#f472b6)',
      color: 'white'
    }
  },

  {
    id: 'party',
    name: 'Party',
    title: 'PARTY!',
    subtitle: 'Good Vibes Only',
    style: {
      background:
        'linear-gradient(160deg,#06b6d4,#8b5cf6)',
      color: 'white'
    }
  },

  {
    id: 'polaroid',
    name: 'Polaroid',
    title: 'POLAROID',
    subtitle: 'Captured Memories',
    style: {
      background:
        'linear-gradient(160deg,#fefce8,#e7e5e4)',
      color: '#44403c'
    }
  },

  {
    id: 'cute',
    name: 'Cute',
    title: 'CUTIE',
    subtitle: 'Sweet Memories ♡',
    style: {
      background:
        'linear-gradient(160deg,#fbcfe8,#ddd6fe)',
      color: '#701a75'
    }
  },

  {
    id: 'graduation',
    name: 'Graduation',
    title: 'GRADUATION',
    subtitle: 'The Beginning',
    style: {
      background:
        'linear-gradient(160deg,#172554,#60a5fa)',
      color: 'white'
    }
  },

  {
    id: 'black',
    name: 'Black Elegant',
    title: 'MOMENTS',
    subtitle: 'Elegance Never Fades',
    style: {
      background:
        'linear-gradient(160deg,#09090b,#3f3f46)',
      color: '#f4f4f5'
    }
  },

  {
    id: 'summer',
    name: 'Summer',
    title: 'SUMMER',
    subtitle: 'Good Times ☀',
    style: {
      background:
        'linear-gradient(160deg,#facc15,#38bdf8)',
      color: '#172554'
    }
  },

  {
    id: 'minimal',
    name: 'Minimal',
    title: 'MOMENTS',
    subtitle: 'Simple Is Beautiful',
    style: {
      background:
        'linear-gradient(160deg,#fafafa,#d4d4d8)',
      color: '#18181b'
    }
  }

]


const currentTemplate = computed(() => {

  return templates.find(
    template =>
      template.id === selectedTemplate.value
  )

})


/* CAMERA */

const video = ref(null)

const canvas = ref(null)

const stream = ref(null)

const cameraActive = ref(false)

const countdown = ref(0)

const photos = ref([])


/* CAPTION */

const caption = ref('')


/* CAMERA START */

const startCamera = async () => {

  try {

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

    video.value.srcObject =
      stream.value

    cameraActive.value = true

  } catch (error) {

    console.error(error)

    alert(
      'Kamera tidak dapat diakses. Izinkan kamera pada browser.'
    )

  }

}


/* CAPTURE */

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


  const width =
    video.value.videoWidth

  const height =
    video.value.videoHeight


  canvas.value.width = width

  canvas.value.height = height


  const context =
    canvas.value.getContext('2d')


  context.save()

  context.translate(width, 0)

  context.scale(-1, 1)

  context.drawImage(
    video.value,
    0,
    0,
    width,
    height
  )

  context.restore()


  photos.value.push(
    canvas.value.toDataURL('image/jpeg', .92)
  )

}


const wait = ms => {

  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  )

}


/* RESULT STYLE */

const resultStyle = computed(() => {

  return currentTemplate.value.style

})


/* CREATE RESULT */

const createResult = () => {

  stopCamera()

  step.value = 3

}


/* STOP CAMERA */

const stopCamera = () => {

  if (stream.value) {

    stream.value
      .getTracks()
      .forEach(track => track.stop())

    stream.value = null

  }

  cameraActive.value = false

}


/* DOWNLOAD */

const downloadResult = () => {

  const width = 800

  const height = 1800

  canvas.value.width = width

  canvas.value.height = height


  const ctx =
    canvas.value.getContext('2d')


  const style =
    currentTemplate.value.style


  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      height
    )


  gradient.addColorStop(
    0,
    getColor(style.background, 0)
  )

  gradient.addColorStop(
    1,
    getColor(style.background, 1)
  )


  ctx.fillStyle = gradient

  ctx.fillRect(
    0,
    0,
    width,
    height
  )


  ctx.fillStyle =
    style.color || 'white'

  ctx.textAlign = 'center'

  ctx.font =
    'bold 48px Arial'

  ctx.fillText(
    currentTemplate.value.title,
    width / 2,
    90
  )


  const photoWidth = 650

  const photoHeight = 360

  const x =
    (width - photoWidth) / 2


  photos.value.forEach(
    (photo, index) => {

      const img =
        new Image()

      img.onload = () => {

        const y =
          130 +
          index *
          (photoHeight + 30)


        ctx.drawImage(
          img,
          x,
          y,
          photoWidth,
          photoHeight
        )


        if (
          index ===
          photos.value.length - 1
        ) {

          ctx.font =
            '28px Arial'

          ctx.fillText(
            caption.value ||
            currentTemplate.value.subtitle,
            width / 2,
            height - 70
          )


          const link =
            document.createElement('a')

          link.download =
            'photobooth.jpg'

          link.href =
            canvas.value.toDataURL(
              'image/jpeg',
              .95
            )

          link.click()

        }

      }

      img.src = photo

    }

  )

}


/*
 * Ambil warna sederhana
 * untuk canvas download.
 */

const getColor = (
  background,
  position
) => {

  const colors =
    background.match(
      /#[0-9a-fA-F]{6}/g
    )

  if (
    colors &&
    colors.length
  ) {

    return colors[
      Math.min(
        position,
        colors.length - 1
      )
    ]

  }

  return '#18181b'

}


/* RESET */

const resetAll = () => {

  stopCamera()

  photos.value = []

  countdown.value = 0

  caption.value = ''

  step.value = 1

}


/* CLEANUP */

onBeforeUnmount(() => {

  stopCamera()

})

</script>


<style scoped>

* {
  box-sizing: border-box;
}

.booth {
  min-height: 100vh;

  background:
    radial-gradient(
      circle at top left,
      rgba(236,72,153,.12),
      transparent 30%
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

  font-weight: 900;

  letter-spacing: 2px;
}

.step {
  color: #71717a;

  font-size: 11px;

  letter-spacing: 3px;
}


/* SECTION */

.section {
  max-width: 1150px;

  margin: 55px auto;

  padding-bottom: 80px;
}


/* HEADING */

.heading {
  text-align: center;

  margin-bottom: 45px;
}

.heading span {
  color: #f9a8d4;

  letter-spacing: 4px;

  font-size: 10px;
}

.heading h1 {
  font-size: clamp(38px,6vw,65px);

  margin: 12px 0;

  letter-spacing: -3px;
}

.heading em {
  color: #f9a8d4;

  font-style: normal;
}

.heading p {
  color: #71717a;
}


/* TEMPLATES */

.templates {
  display: grid;

  grid-template-columns:
    repeat(4,1fr);

  gap: 20px;
}

.template-card {
  border: 1px solid #27272a;

  padding: 10px;

  background: #111113;

  border-radius: 20px;

  cursor: pointer;

  color: white;

  text-align: left;

  transition: .3s;
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

.preview {
  height: 260px;

  border-radius: 13px;

  padding: 15px;

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 8px;
}

.preview-title {
  font-size: 11px;

  font-weight: 900;

  letter-spacing: 2px;

  margin-bottom: 5px;
}

.mini-photo {
  width: 90%;

  flex: 1;

  background:
    linear-gradient(
      135deg,
      #27272a,
      #71717a
    );

  border: 4px solid rgba(255,255,255,.8);

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 20px;
}

.preview small {
  font-size: 8px;

  opacity: .8;

  margin-top: 5px;
}

.template-name {
  display: flex;

  justify-content: space-between;

  padding: 12px 5px 5px;

  font-size: 13px;

  font-weight: 700;
}

.template-name b {
  color: #f9a8d4;
}


/* CONTINUE */

.continue {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 15px;

  margin: 40px auto 0;

  padding: 16px 25px;

  border: none;

  border-radius: 999px;

  background: white;

  color: #18181b;

  font-weight: 800;

  cursor: pointer;
}

.continue b {
  font-size: 20px;
}


/* CAMERA */

.camera-section {
  max-width: 900px;
}

.camera-box {
  position: relative;

  aspect-ratio: 16 / 10;

  overflow: hidden;

  border-radius: 25px;

  background: #18181b;

  border: 1px solid #27272a;
}

.camera-box video {
  width: 100%;

  height: 100%;

  object-fit: cover;

  transform: scaleX(-1);
}

.camera-start {
  position: absolute;

  inset: 0;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  background: #18181b;
}

.camera-start > div {
  font-size: 60px;
}

.camera-start h2 {
  margin: 10px;
}

.camera-start p {
  color: #71717a;
}

.camera-start button {
  border: none;

  border-radius: 999px;

  padding: 14px 25px;

  font-weight: 800;

  cursor: pointer;

  margin-top: 10px;
}

.countdown {
  position: absolute;

  inset: 0;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 130px;

  font-weight: 900;

  text-shadow:
    0 10px 40px black;

  background:
    rgba(0,0,0,.12);
}


/* COUNTER */

.photo-counter {
  display: flex;

  justify-content: center;

  gap: 12px;

  margin: 25px 0;
}

.counter {
  width: 40px;

  height: 40px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  border: 1px solid #3f3f46;

  color: #71717a;

  font-weight: 800;
}

.counter.done {
  background: #f9a8d4;

  color: #18181b;

  border-color: #f9a8d4;
}


/* CAPTURE */

.capture {
  display: block;

  margin: auto;

  border: none;

  border-radius: 999px;

  padding: 18px 35px;

  background: white;

  color: #18181b;

  font-weight: 900;

  font-size: 16px;

  cursor: pointer;
}


/* BACK */

.back {
  display: block;

  margin: 20px auto;

  background: none;

  border: none;

  color: #71717a;

  cursor: pointer;
}


/* RESULT */

.result-section {
  max-width: 700px;
}

.result-card {
  width: min(420px,90vw);

  margin: auto;

  padding: 25px;

  border-radius: 20px;

  box-shadow:
    0 30px 80px rgba(0,0,0,.5);
}

.result-title {
  text-align: center;

  font-weight: 900;

  letter-spacing: 4px;

  margin-bottom: 20px;
}

.result-photo {
  margin-bottom: 15px;

  background: white;

  padding: 6px;
}

.result-photo img {
  display: block;

  width: 100%;

  aspect-ratio: 16/9;

  object-fit: cover;
}

.result-text {
  text-align: center;

  margin-top: 20px;

  font-size: 13px;
}


/* ACTION */

.result-actions {
  display: flex;

  flex-direction: column;

  gap: 12px;

  max-width: 420px;

  margin: 30px auto;
}

.result-actions input {
  padding: 15px 18px;

  border-radius: 999px;

  border: 1px solid #3f3f46;

  background: #18181b;

  color: white;

  outline: none;
}

.download,
.retake {
  padding: 15px;

  border: none;

  border-radius: 999px;

  font-weight: 800;

  cursor: pointer;
}

.download {
  background: white;

  color: #18181b;
}

.retake {
  background: #27272a;

  color: white;
}


/* MOBILE */

@media (max-width: 900px) {

  .templates {
    grid-template-columns:
      repeat(3,1fr);
  }

}

@media (max-width: 600px) {

  .booth {
    padding: 18px;
  }

  .section {
    margin-top: 40px;
  }

  .templates {
    grid-template-columns:
      repeat(2,1fr);

    gap: 12px;
  }

  .preview {
    height: 220px;
  }

  .camera-box {
    aspect-ratio: 3/4;
  }

  .heading h1 {
    letter-spacing: -2px;
  }

}

</style>