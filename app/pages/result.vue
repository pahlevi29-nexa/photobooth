<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId =
  Number(route.query.template || 1)

const template =
  templates.find(
    t => t.id === templateId
  ) || templates[0]

const photos =
  ref<string[]>([])

const resultUrl =
  ref('')

const loading =
  ref(true)

const canvas =
  ref<HTMLCanvasElement | null>(null)


// =====================================================
// LOAD IMAGE
// =====================================================

const loadImage = (
  src: string
) => {

  return new Promise<HTMLImageElement>(
    (resolve, reject) => {

      const img =
        new Image()

      img.onload =
        () => resolve(img)

      img.onerror =
        reject

      img.src = src
    }
  )
}


// =====================================================
// COVER
// =====================================================

const drawCover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {

  const imageRatio =
    img.width / img.height

  const targetRatio =
    width / height

  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (imageRatio > targetRatio) {

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


// =====================================================
// FRAME TEMPLATE
// =====================================================

const generateFrame =
  async () => {

    if (!canvas.value)
      return

    if (!template.frame)
      return

    if (!template.slots)
      return

    const frame =
      await loadImage(
        template.frame
      )

    const frameWidth =
      template.frameWidth ||
      frame.width

    const frameHeight =
      template.frameHeight ||
      frame.height

    /*
      Ukuran final.
      Kita menggunakan width 1200
      agar JPG tetap tajam.
    */

    const W = 1200

    const scale =
      W / frameWidth

    const H =
      frameHeight * scale

    canvas.value.width = W
    canvas.value.height = H

    const ctx =
      canvas.value.getContext('2d')

    if (!ctx)
      return

    ctx.clearRect(
      0,
      0,
      W,
      H
    )

    // =================================================
    // BACKGROUND FRAME
    // =================================================

    ctx.drawImage(
      frame,
      0,
      0,
      W,
      H
    )

    // =================================================
    // LOAD FOTO
    // =================================================

    const images:
      HTMLImageElement[] = []

    for (
      const photo of
      photos.value
        .slice(
          0,
          template.photos
        )
    ) {

      try {

        images.push(
          await loadImage(photo)
        )

      } catch {

        console.error(
          'Gagal memuat foto'
        )
      }
    }

    // =================================================
    // FOTO KE SLOT
    // =================================================

    template.slots
      .slice(
        0,
        template.photos
      )
      .forEach(
        (slot, index) => {

          const img =
            images[index]

          if (!img)
            return

          const x =
            slot.x * scale

          const y =
            slot.y * scale

          const width =
            slot.width * scale

          const height =
            slot.height * scale

          const rotate =
            (slot.rotate || 0)
            * Math.PI / 180

          ctx.save()

          ctx.translate(
            x + width / 2,
            y + height / 2
          )

          ctx.rotate(
            rotate
          )

          /*
            Clip foto supaya
            tidak keluar slot.
          */

          ctx.beginPath()

          ctx.rect(
            -width / 2,
            -height / 2,
            width,
            height
          )

          ctx.clip()

          drawCover(
            ctx,
            img,
            -width / 2,
            -height / 2,
            width,
            height
          )

          ctx.restore()

        }
      )

    // =================================================
    // HASIL
    // =================================================

    resultUrl.value =
      canvas.value.toDataURL(
        'image/jpeg',
        0.95
      )
  }


// =====================================================
// GENERIC TEMPLATE LAMA
// =====================================================

const generateClassic =
  async () => {

    if (!canvas.value)
      return

    const W = 1200
    const H = 1800

    canvas.value.width = W
    canvas.value.height = H

    const ctx =
      canvas.value.getContext('2d')

    if (!ctx)
      return

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        W,
        H
      )

    gradient.addColorStop(
      0,
      template.colors[0]
    )

    gradient.addColorStop(
      1,
      template.colors[1]
    )

    ctx.fillStyle =
      gradient

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    const images:
      HTMLImageElement[] = []

    for (
      const photo of
      photos.value
        .slice(
          0,
          template.photos
        )
    ) {

      try {

        images.push(
          await loadImage(photo)
        )

      } catch {}
    }

    // =================================================
    // TITLE
    // =================================================

    ctx.fillStyle =
      '#18181b'

    ctx.font =
      'bold 60px Georgia'

    ctx.textAlign =
      'center'

    ctx.fillText(
      template.name,
      W / 2,
      110
    )

    ctx.fillStyle =
      'rgba(24,24,27,.65)'

    ctx.font =
      '24px Arial'

    ctx.fillText(
      template.category,
      W / 2,
      155
    )

    // =================================================
    // POSISI SESUAI JUMLAH FOTO
    // =================================================

    const count =
      template.photos

    if (count === 1) {

      if (images[0]) {

        drawCover(
          ctx,
          images[0],
          100,
          220,
          1000,
          1300
        )
      }

    } else if (count === 3) {

      images.forEach(
        (img, i) => {

          drawCover(
            ctx,
            img,
            100,
            230 + i * 470,
            1000,
            400
          )

        }
      )

    } else {

      images.forEach(
        (img, i) => {

          const col =
            i % 2

          const row =
            Math.floor(i / 2)

          const x =
            100 + col * 520

          const y =
            230 + row * 500

          drawCover(
            ctx,
            img,
            x,
            y,
            480,
            430
          )

        }
      )
    }

    resultUrl.value =
      canvas.value.toDataURL(
        'image/jpeg',
        0.95
      )
  }


// =====================================================
// GENERATE
// =====================================================

const generate = async () => {

  loading.value = true

  if (
    template.style === 'frame' &&
    template.frame
  ) {

    await generateFrame()

  } else {

    await generateClassic()

  }

  loading.value = false
}


// =====================================================
// DOWNLOAD
// =====================================================

const download = () => {

  if (!resultUrl.value)
    return

  const link =
    document.createElement('a')

  link.href =
    resultUrl.value

  link.download =
    `photobooth-${template.name
      .toLowerCase()
      .replace(/\s+/g, '-')}.jpg`

  document.body.appendChild(link)

  link.click()

  link.remove()
}


// =====================================================
// RETAKE
// =====================================================

const retake = () => {

  navigateTo(
    `/camera?template=${template.id}`
  )
}


// =====================================================
// HOME
// =====================================================

const home = () => {

  navigateTo('/')
}


// =====================================================
// MOUNT
// =====================================================

onMounted(async () => {

  const saved =
    localStorage.getItem(
      'photobooth_photos'
    )

  if (saved) {

    try {

      const parsed =
        JSON.parse(saved)

      if (
        Array.isArray(parsed)
      ) {

        /*
          INI PENTING.

          Result hanya mengambil
          jumlah foto yang diperlukan
          template.
        */

        photos.value =
          parsed.slice(
            0,
            template.photos
          )
      }

    } catch {

      photos.value = []

    }
  }

  /*
    Validasi.
    Kalau template 7 foto,
    result tidak boleh menerima
    4 foto saja sebagai template 7.
  */

  if (
    photos.value.length ===
    template.photos
  ) {

    await generate()

  } else {

    loading.value = false
  }

})

</script>


<template>

  <div class="page">

    <!-- HEADER -->

    <header>

      <button
        @click="home"
        class="home"
      >
        ← Home
      </button>

      <div class="brand">

        <span>
          📸
        </span>

        <strong>
          Photobooth
        </strong>

      </div>

      <div class="template-count">

        {{ template.photos }}
        Foto

      </div>

    </header>


    <!-- MAIN -->

    <main>

      <section class="heading">

        <small>
          YOUR RESULT
        </small>

        <h1>
          {{ template.name }}
        </h1>

        <p>
          {{ template.category }}
          ·
          {{ template.photos }}
          foto
        </p>

      </section>


      <!-- LOADING -->

      <div
        v-if="loading"
        class="loading"
      >

        <div class="loader"></div>

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
            :alt="template.name"
          />

        </div>


        <div class="result-info">

          <strong>
            {{ template.name }}
          </strong>

          <span>
            {{ photos.length }}
            foto berhasil digabung
          </span>

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

          Hasil sudah disesuaikan
          dengan template
          <b>{{ template.name }}</b>.

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
          Foto belum lengkap
        </h2>

        <p>
          Template ini membutuhkan
          {{ template.photos }} foto.
        </p>

        <button
          class="download"
          @click="retake"
        >
          Ambil Foto
        </button>

      </section>

    </main>


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
  background:
    linear-gradient(
      180deg,
      #fafafa,
      #f5f3ff
    );
  color: #18181b;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

header {
  height: 70px;
  padding: 0 5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,.96);
  border-bottom: 1px solid #e4e4e7;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(15px);
}

.home {
  border: none;
  background: none;
  font-weight: 700;
  color: #52525b;
  cursor: pointer;
  font-size: 15px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7c3aed;
  font-size: 18px;
}

.brand span {
  font-size: 23px;
}

.template-count {
  background: #f3e8ff;
  color: #7c3aed;
  padding: 8px 13px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
}

main {
  width: 94%;
  max-width: 850px;
  margin: auto;
  padding: 40px 0 80px;
}

.heading {
  text-align: center;
  margin-bottom: 30px;
}

.heading small {
  color: #7c3aed;
  letter-spacing: 3px;
  font-weight: 900;
  font-size: 11px;
}

.heading h1 {
  margin: 8px 0;
  font-family: Georgia, serif;
  font-size: 42px;
}

.heading p {
  color: #71717a;
  margin: 0;
}

.image-box {
  width: 100%;
  max-width: 650px;
  margin: auto;
  padding: 12px;
  background: white;
  border-radius: 24px;
  box-shadow:
    0 25px 80px
    rgba(0,0,0,.16);
}

.image-box img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 15px;
}

.result-info {
  text-align: center;
  margin-top: 20px;
}

.result-info strong {
  display: block;
  font-size: 20px;
}

.result-info span {
  display: block;
  margin-top: 5px;
  color: #71717a;
  font-size: 13px;
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 25px;
}

.buttons button {
  border: none;
  min-height: 54px;
  padding: 0 28px;
  border-radius: 15px;
  font-weight: 800;
  cursor: pointer;
  font-size: 15px;
}

.download {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );
  color: white;
}

.retake {
  background: white;
  color: #52525b;
  border: 1px solid #d4d4d8 !important;
}

.info {
  text-align: center;
  color: #a1a1aa;
  font-size: 12px;
  margin-top: 18px;
}

.loading {
  min-height: 400px;
  display: grid;
  place-items: center;
  align-content: center;
  color: #71717a;
}

.loader {
  width: 42px;
  height: 42px;
  border: 4px solid #e4e4e7;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  text-align: center;
  background: white;
  padding: 70px 20px;
  border-radius: 25px;
}

.empty-icon {
  font-size: 55px;
}

.empty h2 {
  margin-bottom: 5px;
}

.empty p {
  color: #71717a;
  margin-bottom: 25px;
}

.empty button {
  border: none;
  padding: 15px 25px;
  border-radius: 13px;
  font-weight: 800;
  cursor: pointer;
}

.canvas {
  display: none;
}

@media(max-width:600px) {

  header {
    padding: 0 4%;
  }

  .brand strong {
    font-size: 16px;
  }

  main {
    padding-top: 25px;
  }

  .heading h1 {
    font-size: 32px;
  }

  .buttons {
    flex-direction: column;
  }

  .buttons button {
    width: 100%;
  }

  .image-box {
    padding: 7px;
    border-radius: 18px;
  }

}

</style>