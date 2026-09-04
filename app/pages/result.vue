<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId =
  Number(route.query.template || 1)

const template =
  templates.find(t => t.id === templateId)
  || templates[0]

const photos =
  ref<string[]>([])

const resultUrl =
  ref('')

const loading =
  ref(true)

const canvas =
  ref<HTMLCanvasElement | null>(null)


// =====================================
// LOAD
// =====================================

onMounted(async () => {

  const saved =
    localStorage.getItem(
      'photobooth_photos'
    )

  if (saved) {

    try {

      photos.value =
        JSON.parse(saved)

    } catch {

      photos.value = []

    }

  }

  if (photos.value.length) {

    await generate()

  } else {

    loading.value = false

  }

})


// =====================================
// IMAGE
// =====================================

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


// =====================================
// COVER
// =====================================

const cover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) => {

  const ratio =
    img.width / img.height

  const target =
    w / h

  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0

  if (ratio > target) {

    sw =
      img.height * target

    sx =
      (img.width - sw) / 2

  } else {

    sh =
      img.width / target

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
    w,
    h
  )

}


// =====================================
// ROUNDED
// =====================================

const round = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {

  ctx.beginPath()

  ctx.roundRect(
    x,
    y,
    w,
    h,
    r
  )

}


// =====================================
// TEXT
// =====================================

const text = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 'bold',
  font = 'Arial'
) => {

  ctx.fillStyle =
    color

  ctx.font =
    `${weight} ${size}px ${font}`

  ctx.textAlign =
    'center'

  ctx.fillText(
    value,
    x,
    y
  )

}


// =====================================
// BACKGROUND
// =====================================

const background = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      width,
      height
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
    width,
    height
  )

}


// =====================================
// GENERATE
// =====================================

const generate = async () => {

  if (!canvas.value) return

  loading.value = true

  const images:
    HTMLImageElement[] = []

  for (
    const photo of photos.value.slice(0, 4)
  ) {

    try {

      images.push(
        await loadImage(photo)
      )

    } catch {}

  }

  const ctx =
    canvas.value.getContext('2d')

  if (!ctx) return


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

  background(
    ctx,
    W,
    H
  )


  // =================================
  // 1 VERTICAL
  // =================================

  if (
    template.layout === 'vertical'
  ) {

    text(
      ctx,
      template.title,
      600,
      105,
      60,
      '#9d174d',
      'bold',
      'Georgia'
    )

    text(
      ctx,
      template.subtitle,
      600,
      150,
      24,
      '#be185d',
      'normal'
    )

    let y = 210

    images.forEach((img, i) => {

      ctx.fillStyle =
        '#ffffff'

      ctx.fillRect(
        70,
        y - 8,
        1060,
        365
      )

      cover(
        ctx,
        img,
        85,
        y,
        1030,
        335
      )

      text(
        ctx,
        `0${i + 1}`,
        600,
        y + 365,
        18,
        '#9d174d'
      )

      y += 395

    })

  }


  // =================================
  // 2 FILM
  // =================================

  else if (
    template.layout === 'film'
  ) {

    ctx.fillStyle =
      '#111111'

    ctx.fillRect(
      70,
      60,
      1060,
      1680
    )

    text(
      ctx,
      template.title,
      600,
      135,
      58,
      '#ffffff',
      'bold',
      'Georgia'
    )

    let y = 220

    images.forEach((img, i) => {

      ctx.fillStyle =
        '#ffffff'

      ctx.fillRect(
        170,
        y,
        860,
        320
      )

      cover(
        ctx,
        img,
        190,
        y + 20,
        820,
        280
      )

      text(
        ctx,
        `FRAME ${i + 1}`,
        600,
        y + 305,
        16,
        '#111111'
      )

      y += 375

    })

    text(
      ctx,
      template.subtitle,
      600,
      1690,
      20,
      '#ffffff'
    )

  }


  // =================================
  // 3 GRID
  // =================================

  else if (
    template.layout === 'grid'
  ) {

    text(
      ctx,
      template.title,
      600,
      130,
      58,
      '#292524',
      'bold',
      'Georgia'
    )

    text(
      ctx,
      template.subtitle,
      600,
      175,
      22,
      '#57534e',
      'normal'
    )

    images.forEach((img, i) => {

      const col =
        i % 2

      const row =
        Math.floor(i / 2)

      const x =
        90 + col * 520

      const y =
        260 + row * 620

      ctx.fillStyle =
        '#ffffff'

      ctx.fillRect(
        x - 10,
        y - 10,
        480,
        500
      )

      cover(
        ctx,
        img,
        x,
        y,
        460,
        480
      )

    })

  }


  // =================================
  // 4 POLAROID
  // =================================

  else if (
    template.layout === 'polaroid'
  ) {

    text(
      ctx,
      template.title,
      600,
      120,
      55,
      '#57534e',
      'bold',
      'Georgia'
    )

    const positions = [
      [100, 250],
      [610, 250],
      [100, 940],
      [610, 940]
    ]

    images.forEach((img, i) => {

      const [x, y] =
        positions[i]

      ctx.save()

      ctx.translate(
        x + 220,
        y + 250
      )

      ctx.rotate(
        (i % 2 ? 2 : -2)
        * Math.PI / 180
      )

      ctx.fillStyle =
        '#ffffff'

      ctx.fillRect(
        -220,
        -250,
        440,
        550
      )

      cover(
        ctx,
        img,
        -195,
        -220,
        390,
        390
      )

      text(
        ctx,
        `memory ${i + 1}`,
        0,
        245,
        20,
        '#44403c',
        'normal',
        'cursive'
      )

      ctx.restore()

    })

  }


  // =================================
  // 5 EDITORIAL
  // =================================

  else if (
    template.layout === 'editorial'
  ) {

    text(
      ctx,
      'THE',
      600,
      110,
      25,
      '#44403c'
    )

    text(
      ctx,
      template.title,
      600,
      180,
      82,
      '#1c1917',
      'bold',
      'Georgia'
    )

    text(
      ctx,
      template.subtitle,
      600,
      220,
      18,
      '#78716c'
    )

    cover(
      ctx,
      images[0],
      80,
      280,
      1040,
      620
    )

    cover(
      ctx,
      images[1],
      80,
      940,
      500,
      500
    )

    cover(
      ctx,
      images[2],
      620,
      940,
      500,
      500
    )

    if (images[3]) {

      cover(
        ctx,
        images[3],
        80,
        1480,
        1040,
        200
      )

    }

  }


  // =================================
  // 6 SCRAPBOOK
  // =================================

  else if (
    template.layout === 'scrapbook'
  ) {

    text(
      ctx,
      template.title,
      600,
      120,
      65,
      '#be185d',
      'bold',
      'cursive'
    )

    const pos = [
      [100, 260, -3],
      [620, 250, 4],
      [120, 900, 3],
      [600, 920, -4]
    ]

    images.forEach((img, i) => {

      const [x, y, rotate] =
        pos[i]

      ctx.save()

      ctx.translate(
        x + 220,
        y + 270
      )

      ctx.rotate(
        rotate * Math.PI / 180
      )

      ctx.fillStyle =
        '#fff'

      ctx.fillRect(
        -220,
        -270,
        440,
        540
      )

      cover(
        ctx,
        img,
        -195,
        -245,
        390,
        390
      )

      text(
        ctx,
        '♡',
        0,
        225,
        35,
        '#ec4899'
      )

      ctx.restore()

    })

    text(
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


  // =================================
  // 7 MAGAZINE
  // =================================

  else if (
    template.layout === 'magazine'
  ) {

    ctx.fillStyle =
      '#18181b'

    ctx.fillRect(
      60,
      60,
      1080,
      1680
    )

    text(
      ctx,
      'SPECIAL',
      600,
      150,
      28,
      '#ffffff'
    )

    text(
      ctx,
      template.title,
      600,
      230,
      82,
      '#ffffff',
      'bold',
      'Georgia'
    )

    cover(
      ctx,
      images[0],
      100,
      310,
      1000,
      650
    )

    cover(
      ctx,
      images[1],
      100,
      1010,
      480,
      500
    )

    cover(
      ctx,
      images[2],
      620,
      1010,
      480,
      500
    )

    text(
      ctx,
      template.subtitle,
      600,
      1630,
      22,
      '#ffffff'
    )

  }


  // =================================
  // 8 RETRO
  // =================================

  else if (
    template.layout === 'retro'
  ) {

    text(
      ctx,
      template.title,
      600,
      150,
      72,
      '#7f1d1d',
      'bold',
      'Georgia'
    )

    text(
      ctx,
      template.subtitle,
      600,
      195,
      20,
      '#7f1d1d'
    )

    images.forEach((img, i) => {

      const x =
        100 + (i % 2) * 510

      const y =
        280 + Math.floor(i / 2) * 600

      ctx.fillStyle =
        '#fef3c7'

      ctx.fillRect(
        x,
        y,
        470,
        510
      )

      cover(
        ctx,
        img,
        x + 20,
        y + 20,
        430,
        430
      )

      text(
        ctx,
        'GOOD TIMES',
        x + 235,
        y + 480,
        18,
        '#7f1d1d',
        'bold',
        'Georgia'
      )

    })

  }


  // =================================
  // 9 MINIMAL
  // =================================

  else if (
    template.layout === 'minimal'
  ) {

    text(
      ctx,
      template.title,
      600,
      110,
      48,
      '#18181b',
      'normal'
    )

    images.forEach((img, i) => {

      cover(
        ctx,
        img,
        150,
        180 + i * 390,
        900,
        330
      )

    })

    text(
      ctx,
      template.subtitle,
      600,
      1720,
      20,
      '#71717a',
      'normal'
    )

  }


  // =================================
  // 10 CUTE
  // =================================

  else if (
    template.layout === 'cute'
  ) {

    text(
      ctx,
      '♡',
      600,
      120,
      70,
      '#db2777'
    )

    text(
      ctx,
      template.title,
      600,
      190,
      62,
      '#db2777',
      'bold',
      'cursive'
    )

    images.forEach((img, i) => {

      const x =
        i % 2 === 0
          ? 100
          : 620

      const y =
        i < 2
          ? 300
          : 950

      round(
        ctx,
        x,
        y,
        480,
        520,
        30
      )

      ctx.save()

      ctx.clip()

      cover(
        ctx,
        img,
        x,
        y,
        480,
        520
      )

      ctx.restore()

    })

    text(
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


  // =================================
  // 11 DARK
  // =================================

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

    text(
      ctx,
      template.title,
      600,
      130,
      70,
      '#ffffff',
      'bold',
      'Georgia'
    )

    text(
      ctx,
      template.subtitle,
      600,
      175,
      18,
      '#a1a1aa'
    )

    images.forEach((img, i) => {

      cover(
        ctx,
        img,
        100,
        260 + i * 360,
        1000,
        310
      )

    })

    text(
      ctx,
      '✦',
      600,
      1730,
      35,
      '#ffffff'
    )

  }


  // =================================
  // 12 CLASSIC
  // =================================

  else {

    text(
      ctx,
      template.title,
      600,
      120,
      65,
      '#18181b',
      'bold',
      'Georgia'
    )

    text(
      ctx,
      template.subtitle,
      600,
      165,
      20,
      '#71717a'
    )

    let y = 250

    images.forEach(img => {

      ctx.fillStyle =
        '#ffffff'

      ctx.fillRect(
        100,
        y - 10,
        1000,
        330
      )

      cover(
        ctx,
        img,
        115,
        y + 5,
        970,
        300
      )

      y += 370

    })

  }


  // =================================
  // JPG
  // =================================

  resultUrl.value =
    canvas.value.toDataURL(
      'image/jpeg',
      0.95
    )

  loading.value = false

}


// =====================================
// DOWNLOAD
// =====================================

const download = () => {

  if (!resultUrl.value)
    return

  const a =
    document.createElement('a')

  a.href =
    resultUrl.value

  a.download =
    `photobooth-${template.name
      .toLowerCase()
      .replaceAll(' ', '-')}.jpg`

  a.click()

}


// =====================================
// RETAKE
// =====================================

const retake = () => {

  navigateTo(
    `/camera?template=${template.id}`
  )

}


// =====================================
// HOME
// =====================================

const home = () => {

  navigateTo('/')

}

</script>


<template>

  <div class="page">

    <header>

      <button @click="home">
        ← Home
      </button>

      <strong>
        📸 Photobooth
      </strong>

      <span>
        {{ template.name }}
      </span>

    </header>


    <main>

      <div class="heading">

        <small>
          YOUR RESULT
        </small>

        <h1>
          {{ template.title }}
        </h1>

        <p>
          {{ template.subtitle }}
        </p>

      </div>


      <div
        v-if="loading"
        class="loading"
      >

        Membuat hasil foto...

      </div>


      <div
        v-else-if="resultUrl"
        class="result"
      >

        <div class="image-box">

          <img
            :src="resultUrl"
            alt="Photobooth"
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
          <b>1 gambar JPG</b>.
        </p>

      </div>


      <div
        v-else
        class="empty"
      >

        📷

        <h2>
          Belum ada foto
        </h2>

        <button
          class="download"
          @click="retake"
        >
          Ambil Foto
        </button>

      </div>

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
    #fafafa;

  color:
    #18181b;

  font-family:
    Arial,
    sans-serif;

}

header {

  height: 70px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding: 0 5%;

  background: white;

  border-bottom:
    1px solid #e4e4e7;

  position: sticky;

  top: 0;

  z-index: 5;

}

header button {

  border: none;

  background: none;

  cursor: pointer;

  font-weight: 700;

  color: #52525b;

}

header strong {

  color: #7c3aed;

}

header span {

  color: #71717a;

  font-size: 13px;

}

main {

  width: 92%;

  max-width: 850px;

  margin: auto;

  padding: 45px 0 80px;

}

.heading {

  text-align: center;

  margin-bottom: 30px;

}

.heading small {

  color: #7c3aed;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 3px;

}

.heading h1 {

  margin: 8px 0;

  font-size: 40px;

}

.heading p {

  margin: 0;

  color: #71717a;

}

.image-box {

  width: 100%;

  max-width: 600px;

  margin: auto;

  padding: 10px;

  background: white;

  border-radius: 18px;

  box-shadow:
    0 20px 60px
    rgba(0,0,0,.14);

}

.image-box img {

  width: 100%;

  display: block;

  border-radius: 10px;

}

.buttons {

  display: flex;

  justify-content: center;

  gap: 12px;

  margin-top: 25px;

}

.buttons button {

  border: none;

  padding: 14px 25px;

  border-radius: 12px;

  font-weight: 800;

  cursor: pointer;

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

  border:
    1px solid #d4d4d8 !important;

}

.info {

  text-align: center;

  color: #a1a1aa;

  font-size: 12px;

}

.loading {

  text-align: center;

  padding: 100px 0;

  color: #71717a;

}

.empty {

  text-align: center;

  padding: 80px;

  background: white;

  border-radius: 20px;

}

.canvas {

  display: none;

}

@media(max-width:600px) {

  main {

    width: 94%;

    padding-top: 25px;

  }

  .heading h1 {

    font-size: 30px;

  }

  header span {

    display: none;

  }

  .buttons {

    flex-direction: column;

  }

  .buttons button {

    width: 100%;

  }

}

</style>