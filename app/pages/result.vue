<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()

const templateId = Number(route.query.template || 1)

const template =
  templates.find(t => t.id === templateId) ||
  templates[0]

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const canvas = ref<HTMLCanvasElement | null>(null)

/* =====================================================
   LOAD DATA
===================================================== */

onMounted(async () => {
  const saved = localStorage.getItem('photobooth_photos')

  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        photos.value = parsed
      }
    } catch {
      photos.value = []
    }
  }

  /*
   * PENTING:
   * hanya gunakan jumlah foto sesuai template
   */
  photos.value = photos.value.slice(0, template.photos)

  if (photos.value.length === template.photos) {
    await generate()
  } else {
    loading.value = false
  }
})

/* =====================================================
   LOAD IMAGE
===================================================== */

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = reject

    img.src = src
  })
}

/* =====================================================
   BACKGROUND
===================================================== */

const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const gradient = ctx.createLinearGradient(
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

  ctx.fillStyle = gradient

  ctx.fillRect(
    0,
    0,
    width,
    height
  )
}

/* =====================================================
   COVER IMAGE
===================================================== */

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

  const boxRatio =
    width / height

  let sx = 0
  let sy = 0
  let sw = img.width
  let sh = img.height

  if (imageRatio > boxRatio) {
    sw = img.height * boxRatio

    sx =
      (img.width - sw) / 2
  } else {
    sh = img.width / boxRatio

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

/* =====================================================
   ROUNDED RECT
===================================================== */

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath()

  ctx.roundRect(
    x,
    y,
    width,
    height,
    radius
  )
}

/* =====================================================
   TEXT
===================================================== */

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

  ctx.font =
    `${weight} ${size}px ${font}`

  ctx.textAlign = 'center'

  ctx.textBaseline = 'middle'

  ctx.fillText(
    value,
    x,
    y
  )
}

/* =====================================================
   IMAGE WITH ROUNDED CORNERS
===================================================== */

const drawRoundedImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 25
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

  drawCover(
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
   GENERATE
===================================================== */

const generate = async () => {
  if (!canvas.value) {
    loading.value = false
    return
  }

  loading.value = true

  /*
   * JUMLAH FOTO BENAR-BENAR MENGIKUTI TEMPLATE
   */
  const requiredPhotos =
    template.photos

  const selectedPhotos =
    photos.value.slice(
      0,
      requiredPhotos
    )

  const images: HTMLImageElement[] = []

  for (const photo of selectedPhotos) {
    try {
      const image =
        await loadImage(photo)

      images.push(image)
    } catch {
      console.warn(
        'Gagal memuat foto'
      )
    }
  }

  /*
   * Kalau jumlah foto belum lengkap,
   * jangan membuat hasil palsu.
   */
  if (
    images.length !==
    requiredPhotos
  ) {
    loading.value = false
    resultUrl.value = ''
    return
  }

  const ctx =
    canvas.value.getContext('2d')

  if (!ctx) {
    loading.value = false
    return
  }

  /*
   * CANVAS PORTRAIT
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
   * BACKGROUND
   */
  drawBackground(
    ctx,
    W,
    H
  )

  /* =================================================
     LOVE
  ================================================= */

  if (template.style === 'love') {

    drawText(
      ctx,
      '♡',
      600,
      80,
      55,
      '#db2777'
    )

    drawText(
      ctx,
      template.name,
      600,
      145,
      58,
      '#9d174d',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      'memories worth keeping',
      600,
      195,
      22,
      '#be185d',
      'normal'
    )

    const positions = [
      [90, 280],
      [610, 280],
      [90, 950],
      [610, 950]
    ]

    images.forEach((img, index) => {

      const [x, y] =
        positions[index]

      ctx.fillStyle =
        '#ffffff'

      ctx.shadowColor =
        'rgba(0,0,0,.15)'

      ctx.shadowBlur = 20

      roundedRect(
        ctx,
        x,
        y,
        480,
        570,
        30
      )

      ctx.fill()

      ctx.shadowBlur = 0

      drawRoundedImage(
        ctx,
        img,
        x + 18,
        y + 18,
        444,
        470,
        20
      )

      drawText(
        ctx,
        '♡',
        x + 240,
        y + 525,
        28,
        '#ec4899'
      )
    })

    drawText(
      ctx,
      '♡ forever memories ♡',
      600,
      1660,
      26,
      '#9d174d',
      'bold',
      'Georgia'
    )
  }

  /* =================================================
     KAWAII
  ================================================= */

  else if (template.style === 'kawaii') {

    drawText(
      ctx,
      template.name,
      600,
      100,
      58,
      '#be185d',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      'Captured moments',
      600,
      155,
      24,
      '#9d174d',
      'normal'
    )

    const positions = [
      [90, 240],
      [610, 240],
      [90, 900],
      [610, 900]
    ]

    images.forEach((img, index) => {

      const [x, y] =
        positions[index]

      ctx.fillStyle =
        'rgba(255,255,255,.92)'

      roundedRect(
        ctx,
        x,
        y,
        480,
        570,
        35
      )

      ctx.fill()

      drawRoundedImage(
        ctx,
        img,
        x + 15,
        y + 15,
        450,
        500,
        28
      )

      drawText(
        ctx,
        '♡',
        x + 240,
        y + 535,
        30,
        '#ec4899'
      )
    })

    drawText(
      ctx,
      'cute memories',
      600,
      1620,
      28,
      '#be185d',
      'bold',
      'Georgia'
    )
  }

  /* =================================================
     FILM
  ================================================= */

  else if (template.style === 'film') {

    ctx.fillStyle =
      '#181818'

    ctx.fillRect(
      50,
      50,
      1100,
      1700
    )

    drawText(
      ctx,
      'FILM',
      600,
      115,
      70,
      '#ffffff',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.name,
      600,
      175,
      24,
      '#dddddd',
      'normal'
    )

    let y = 250

    images.forEach((img, index) => {

      ctx.fillStyle =
        '#eeeeee'

      ctx.fillRect(
        150,
        y,
        900,
        330
      )

      drawCover(
        ctx,
        img,
        170,
        y + 20,
        860,
        280
      )

      drawText(
        ctx,
        `FRAME ${index + 1}`,
        600,
        y + 305,
        16,
        '#111111'
      )

      y += 375
    })

    drawText(
      ctx,
      'FILM MEMORIES',
      600,
      1690,
      20,
      '#ffffff'
    )
  }

  /* =================================================
     POLAROID - 3 FOTO
  ================================================= */

  else if (template.style === 'polaroid') {

    drawText(
      ctx,
      template.name,
      600,
      110,
      58,
      '#292524',
      'bold',
      'Georgia'
    )

    const positions = [
      [100, 260],
      [610, 260],
      [355, 940]
    ]

    images.forEach((img, index) => {

      const [x, y] =
        positions[index]

      ctx.save()

      ctx.translate(
        x + 220,
        y + 260
      )

      const rotation =
        index === 0
          ? -2
          : index === 1
            ? 2
            : -1

      ctx.rotate(
        rotation *
        Math.PI /
        180
      )

      ctx.fillStyle =
        '#ffffff'

      ctx.shadowColor =
        'rgba(0,0,0,.18)'

      ctx.shadowBlur = 20

      ctx.fillRect(
        -220,
        -260,
        440,
        560
      )

      ctx.shadowBlur = 0

      drawCover(
        ctx,
        img,
        -195,
        -235,
        390,
        390
      )

      drawText(
        ctx,
        `memory ${index + 1}`,
        0,
        225,
        20,
        '#44403c',
        'normal',
        'Georgia'
      )

      ctx.restore()
    })

    drawText(
      ctx,
      '♡ memories ♡',
      600,
      1640,
      28,
      '#57534e',
      'normal',
      'Georgia'
    )
  }

  /* =================================================
     MAGAZINE - 3 FOTO
  ================================================= */

  else if (template.style === 'magazine') {

    ctx.fillStyle =
      '#18181b'

    ctx.fillRect(
      45,
      45,
      1110,
      1710
    )

    drawText(
      ctx,
      'SPECIAL',
      600,
      110,
      24,
      '#ffffff'
    )

    drawText(
      ctx,
      template.name,
      600,
      180,
      72,
      '#ffffff',
      'bold',
      'Georgia'
    )

    /*
     * FOTO 1 BESAR
     */
    drawCover(
      ctx,
      images[0],
      100,
      280,
      1000,
      700
    )

    /*
     * FOTO 2
     */
    drawCover(
      ctx,
      images[1],
      100,
      1030,
      480,
      480
    )

    /*
     * FOTO 3
     */
    drawCover(
      ctx,
      images[2],
      620,
      1030,
      480,
      480
    )

    drawText(
      ctx,
      'MAGAZINE EDITION',
      600,
      1620,
      22,
      '#ffffff'
    )
  }

  /* =================================================
     MINIMAL
  ================================================= */

  else if (template.style === 'minimal') {

    drawText(
      ctx,
      template.name,
      600,
      100,
      48,
      '#18181b',
      'normal'
    )

    const count =
      images.length

    const gap = 30

    const top = 180

    const available =
      H - top - 150 -
      gap * (count - 1)

    const photoHeight =
      available / count

    images.forEach((img, index) => {

      drawCover(
        ctx,
        img,
        120,
        top +
          index *
          (photoHeight + gap),
        960,
        photoHeight
      )
    })

    drawText(
      ctx,
      'simple moments',
      600,
      1715,
      22,
      '#71717a',
      'normal'
    )
  }

  /* =================================================
     RETRO
  ================================================= */

  else if (template.style === 'retro') {

    drawText(
      ctx,
      template.name,
      600,
      110,
      62,
      '#7f1d1d',
      'bold',
      'Georgia'
    )

    const positions = [
      [100, 230],
      [610, 230],
      [100, 850],
      [610, 850]
    ]

    images.forEach((img, index) => {

      const [x, y] =
        positions[index]

      ctx.fillStyle =
        '#fef3c7'

      ctx.fillRect(
        x,
        y,
        470,
        520
      )

      drawCover(
        ctx,
        img,
        x + 20,
        y + 20,
        430,
        430
      )

      drawText(
        ctx,
        'GOOD TIMES',
        x + 235,
        y + 480,
        17,
        '#7f1d1d',
        'bold',
        'Georgia'
      )
    })
  }

  /* =================================================
     DARK LUXURY
  ================================================= */

  else if (template.style === 'luxury') {

    ctx.fillStyle =
      '#111111'

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    drawText(
      ctx,
      template.name,
      600,
      110,
      58,
      '#d4af37',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      'PRIVATE EDITION',
      600,
      165,
      20,
      '#ffffff'
    )

    const positions = [
      [100, 250],
      [620, 250],
      [100, 850],
      [620, 850]
    ]

    images.forEach((img, index) => {

      const [x, y] =
        positions[index]

      ctx.strokeStyle =
        '#d4af37'

      ctx.lineWidth = 3

      ctx.strokeRect(
        x,
        y,
        480,
        500
      )

      drawCover(
        ctx,
        img,
        x + 15,
        y + 15,
        450,
        450
      )
    })

    drawText(
      ctx,
      'LUXURY MEMORIES',
      600,
      1640,
      22,
      '#d4af37'
    )
  }

  /* =================================================
     BLUE
  ================================================= */

  else if (template.style === 'blue') {

    drawText(
      ctx,
      template.name,
      600,
      110,
      60,
      '#1d4ed8',
      'bold',
      'Georgia'
    )

    images.forEach((img, index) => {

      const x =
        index % 2 === 0
          ? 90
          : 610

      const y =
        index < 2
          ? 250
          : 930

      drawRoundedImage(
        ctx,
        img,
        x,
        y,
        480,
        560,
        30
      )
    })

    drawText(
      ctx,
      'GOOD VIBES',
      600,
      1650,
      25,
      '#1d4ed8'
    )
  }

  /* =================================================
     PURPLE
  ================================================= */

  else if (template.style === 'purple') {

    ctx.fillStyle =
      '#1e1b4b'

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    drawText(
      ctx,
      template.name,
      600,
      120,
      60,
      '#ddd6fe',
      'bold',
      'Georgia'
    )

    images.forEach((img, index) => {

      const y =
        240 + index * 350

      drawRoundedImage(
        ctx,
        img,
        120,
        y,
        960,
        300,
        25
      )
    })
  }

  /* =================================================
     CUTE / FLOWER / BEAR / DIARY
  ================================================= */

  else if (
    ['flower', 'bear', 'diary'].includes(
      template.style
    )
  ) {

    drawText(
      ctx,
      '♡',
      600,
      80,
      45,
      '#db2777'
    )

    drawText(
      ctx,
      template.name,
      600,
      140,
      58,
      '#9d174d',
      'bold',
      'Georgia'
    )

    const positions = [
      [90, 250],
      [610, 250],
      [90, 900],
      [610, 900]
    ]

    images.forEach((img, index) => {

      const [x, y] =
        positions[index]

      drawRoundedImage(
        ctx,
        img,
        x,
        y,
        480,
        550,
        35
      )
    })

    drawText(
      ctx,
      '♡ memories ♡',
      600,
      1640,
      28,
      '#be185d',
      'bold',
      'Georgia'
    )
  }

  /* =================================================
     COQUETTE
  ================================================= */

  else if (template.style === 'coquette') {

    drawText(
      ctx,
      '୨୧',
      600,
      90,
      50,
      '#be185d'
    )

    drawText(
      ctx,
      template.name,
      600,
      155,
      58,
      '#9f1239',
      'bold',
      'Georgia'
    )

    images.forEach((img, index) => {

      const x =
        index % 2 === 0
          ? 100
          : 620

      const y =
        index < 2
          ? 270
          : 940

      ctx.fillStyle =
        '#ffffff'

      roundedRect(
        ctx,
        x,
        y,
        480,
        540,
        30
      )

      ctx.fill()

      drawRoundedImage(
        ctx,
        img,
        x + 15,
        y + 15,
        450,
        450,
        25
      )

      drawText(
        ctx,
        '♡',
        x + 240,
        y + 495,
        28,
        '#be185d'
      )
    })
  }

  /* =================================================
     FRIENDS
  ================================================= */

  else if (template.style === 'friends') {

    drawText(
      ctx,
      'BEST FRIENDS',
      600,
      120,
      58,
      '#1d4ed8',
      'bold',
      'Arial'
    )

    images.forEach((img, index) => {

      const x =
        index % 2 === 0
          ? 90
          : 610

      const y =
        index < 2
          ? 250
          : 900

      drawRoundedImage(
        ctx,
        img,
        x,
        y,
        480,
        520,
        35
      )

      drawText(
        ctx,
        `#${index + 1}`,
        x + 240,
        y + 480,
        20,
        '#1d4ed8'
      )
    })
  }

  /* =================================================
     LETTER
  ================================================= */

  else if (template.style === 'letter') {

    drawText(
      ctx,
      'Dear Memories,',
      600,
      120,
      58,
      '#9a3412',
      'bold',
      'Georgia'
    )

    images.forEach((img, index) => {

      const y =
        230 + index * 360

      drawRoundedImage(
        ctx,
        img,
        120,
        y,
        960,
        300,
        20
      )
    })

    drawText(
      ctx,
      'with love ♡',
      600,
      1680,
      28,
      '#c2410c',
      'normal',
      'cursive'
    )
  }

  /* =================================================
     Y2K
  ================================================= */

  else if (template.style === 'y2k') {

    ctx.fillStyle =
      '#fae8ff'

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    drawText(
      ctx,
      '★ Y2K ★',
      600,
      110,
      65,
      '#c026d3',
      'bold',
      'Arial'
    )

    images.forEach((img, index) => {

      const x =
        index % 2 === 0
          ? 90
          : 610

      const y =
        index < 2
          ? 250
          : 900

      drawRoundedImage(
        ctx,
        img,
        x,
        y,
        480,
        540,
        35
      )
    })
  }

  /* =================================================
     NEWSPAPER
  ================================================= */

  else if (template.style === 'newspaper') {

    ctx.fillStyle =
      '#f5f5f4'

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    drawText(
      ctx,
      'THE MEMORY TIMES',
      600,
      100,
      55,
      '#292524',
      'bold',
      'Georgia'
    )

    ctx.strokeStyle =
      '#292524'

    ctx.lineWidth = 3

    ctx.beginPath()

    ctx.moveTo(
      80,
      170
    )

    ctx.lineTo(
      1120,
      170
    )

    ctx.stroke()

    images.forEach((img, index) => {

      const x =
        index % 2 === 0
          ? 90
          : 610

      const y =
        index < 2
          ? 240
          : 920

      drawCover(
        ctx,
        img,
        x,
        y,
        480,
        500
      )
    })
  }

  /* =================================================
     RED
  ================================================= */

  else if (template.style === 'red') {

    drawText(
      ctx,
      'LOVE',
      600,
      100,
      75,
      '#b91c1c',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      template.name,
      600,
      165,
      25,
      '#991b1b'
    )

    images.forEach((img, index) => {

      drawRoundedImage(
        ctx,
        img,
        100,
        240 + index * 350,
        1000,
        300,
        30
      )
    })
  }

  /* =================================================
     OCEAN
  ================================================= */

  else if (template.style === 'ocean') {

    drawText(
      ctx,
      'OCEAN',
      600,
      110,
      70,
      '#0369a1',
      'bold',
      'Georgia'
    )

    images.forEach((img, index) => {

      drawRoundedImage(
        ctx,
        img,
        100,
        230 + index * 350,
        1000,
        300,
        30
      )
    })

    drawText(
      ctx,
      'GOOD VIBES',
      600,
      1680,
      25,
      '#0369a1'
    )
  }

  /* =================================================
     GREEN
  ================================================= */

  else if (template.style === 'green') {

    drawText(
      ctx,
      template.name,
      600,
      120,
      60,
      '#047857',
      'normal',
      'Georgia'
    )

    images.forEach((img, index) => {

      drawCover(
        ctx,
        img,
        100,
        230 + index * 350,
        1000,
        300
      )
    })
  }

  /* =================================================
     STREET
  ================================================= */

  else if (template.style === 'street') {

    ctx.fillStyle =
      '#111827'

    ctx.fillRect(
      0,
      0,
      W,
      H
    )

    drawText(
      ctx,
      'STREET',
      600,
      120,
      75,
      '#ffffff',
      'bold',
      'Arial'
    )

    images.forEach((img, index) => {

      drawCover(
        ctx,
        img,
        80,
        240 + index * 350,
        1040,
        300
      )
    })
  }

  /* =================================================
     WEDDING
  ================================================= */

  else if (template.style === 'wedding') {

    drawText(
      ctx,
      '♡',
      600,
      70,
      45,
      '#78716c'
    )

    drawText(
      ctx,
      template.name,
      600,
      135,
      65,
      '#57534e',
      'normal',
      'Georgia'
    )

    images.forEach((img, index) => {

      drawRoundedImage(
        ctx,
        img,
        100,
        230 + index * 350,
        1000,
        300,
        25
      )
    })

    drawText(
      ctx,
      'forever & always',
      600,
      1680,
      25,
      '#78716c',
      'normal',
      'Georgia'
    )
  }

  /* =================================================
     VERTICAL
  ================================================= */

  else if (template.style === 'vertical') {

    drawText(
      ctx,
      template.name,
      600,
      100,
      60,
      '#be123c',
      'bold',
      'Georgia'
    )

    drawText(
      ctx,
      '♡ memories ♡',
      600,
      155,
      22,
      '#e11d48'
    )

    /*
     * 4 FOTO VERTICAL
     */
    const photoHeight = 330

    images.forEach((img, index) => {

      const y =
        220 +
        index *
        380

      ctx.fillStyle =
        '#ffffff'

      roundedRect(
        ctx,
        80,
        y,
        1040,
        photoHeight + 20,
        25
      )

      ctx.fill()

      drawRoundedImage(
        ctx,
        img,
        95,
        y + 10,
        1010,
        photoHeight,
        18
      )

      drawText(
        ctx,
        String(index + 1).padStart(2, '0'),
        600,
        y + photoHeight + 38,
        18,
        '#be123c'
      )
    })
  }

  /* =================================================
     FALLBACK
  ================================================= */

  else {

    drawText(
      ctx,
      template.name,
      600,
      110,
      58,
      '#18181b',
      'bold',
      'Georgia'
    )

    const count =
      images.length

    const gap = 30

    const top = 220

    const available =
      1500 -
      gap * (count - 1)

    const height =
      available / count

    images.forEach((img, index) => {

      drawRoundedImage(
        ctx,
        img,
        100,
        top +
          index *
          (height + gap),
        1000,
        height,
        25
      )
    })
  }

  /* =================================================
     RESULT
  ================================================= */

  resultUrl.value =
    canvas.value.toDataURL(
      'image/jpeg',
      0.95
    )

  loading.value = false
}

/* =====================================================
   DOWNLOAD
===================================================== */

const download = () => {

  if (!resultUrl.value) {
    return
  }

  const link =
    document.createElement('a')

  link.href =
    resultUrl.value

  link.download =
    `photobooth-${template.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')}.jpg`

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)
}

/* =====================================================
   RETAKE
===================================================== */

const retake = () => {

  /*
   * hapus foto lama
   */
  localStorage.removeItem(
    'photobooth_photos'
  )

  navigateTo(
    `/camera?template=${template.id}`
  )
}

/* =====================================================
   HOME
===================================================== */

const home = () => {

  localStorage.removeItem(
    'photobooth_photos'
  )

  navigateTo('/')
}
</script>

<template>
  <div class="page">

    <header class="header">

      <button
        class="home-button"
        @click="home"
      >
        ← Home
      </button>

      <div class="brand">
        📸
        <span>Photobooth</span>
      </div>

      <div class="template-badge">
        {{ template.name }}
      </div>

    </header>

    <main>

      <section class="hero">

        <div class="eyebrow">
          YOUR RESULT
        </div>

        <h1>
          {{ template.name }}
        </h1>

        <p>
          {{ template.category }}
          ·
          {{ template.photos }} Photos
        </p>

      </section>

      <div
        v-if="loading"
        class="loading"
      >
        <div class="spinner"></div>

        <strong>
          Membuat hasil foto...
        </strong>

        <span>
          Menyesuaikan layout
          {{ template.name }}
        </span>
      </div>

      <section
        v-else-if="resultUrl"
        class="result-section"
      >

        <div class="result-frame">

          <img
            :src="resultUrl"
            :alt="template.name"
          >

        </div>

        <div class="actions">

          <button
            class="download-button"
            @click="download"
          >
            <span>↓</span>
            Download JPG
          </button>

          <button
            class="retake-button"
            @click="retake"
          >
            📸 Foto Lagi
          </button>

        </div>

        <p class="info">
          {{ template.photos }}
          foto berhasil digabung
          menjadi satu gambar JPG.
        </p>

      </section>

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
          class="download-button"
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
    radial-gradient(
      circle at top,
      #ffffff 0%,
      #fafafa 55%,
      #f4f4f5 100%
    );

  color: #18181b;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.header {
  height: 76px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding:
    0 clamp(18px, 5vw, 70px);

  background:
    rgba(255,255,255,.9);

  backdrop-filter:
    blur(15px);

  border-bottom:
    1px solid #e4e4e7;

  position: sticky;

  top: 0;

  z-index: 20;
}

.home-button {
  border: none;

  background: transparent;

  color: #52525b;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;
}

.brand {
  display: flex;

  align-items: center;

  gap: 8px;

  font-size: 22px;

  font-weight: 900;

  color: #7c3aed;
}

.template-badge {
  padding:
    8px 14px;

  border-radius: 999px;

  background: #f4f4f5;

  color: #52525b;

  font-size: 12px;

  font-weight: 700;
}

main {
  width: 94%;

  max-width: 900px;

  margin:
    auto;

  padding:
    45px 0 90px;
}

.hero {
  text-align: center;

  margin-bottom: 35px;
}

.eyebrow {
  color: #7c3aed;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 4px;
}

.hero h1 {
  margin:
    8px 0;

  font-size:
    clamp(32px, 6vw, 52px);

  line-height: 1.1;

  font-family:
    Georgia,
    serif;
}

.hero p {
  margin: 0;

  color: #71717a;

  font-size: 15px;
}

.result-section {
  width: 100%;
}

.result-frame {
  width: 100%;

  max-width: 650px;

  margin:
    auto;

  padding: 12px;

  background:
    #ffffff;

  border-radius: 26px;

  box-shadow:
    0 25px 80px
    rgba(0,0,0,.15);

  border:
    1px solid
    rgba(0,0,0,.05);
}

.result-frame img {
  width: 100%;

  height: auto;

  display: block;

  border-radius: 17px;
}

.actions {
  display: flex;

  gap: 14px;

  justify-content: center;

  margin-top: 28px;
}

.actions button {
  min-height: 54px;

  padding:
    0 28px;

  border-radius: 15px;

  border: none;

  font-size: 15px;

  font-weight: 800;

  cursor: pointer;

  transition:
    transform .2s,
    box-shadow .2s;
}

.actions button:active {
  transform:
    scale(.97);
}

.download-button {
  color: white;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  box-shadow:
    0 12px 30px
    rgba(124,58,237,.25);
}

.retake-button {
  background: white;

  color: #3f3f46;

  border:
    1px solid
    #d4d4d8 !important;
}

.info {
  text-align: center;

  color: #a1a1aa;

  font-size: 13px;

  margin-top: 18px;
}

.loading {
  min-height: 300px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 10px;

  color: #52525b;
}

.loading span {
  color: #a1a1aa;

  font-size: 13px;
}

.spinner {
  width: 42px;

  height: 42px;

  border:
    4px solid
    #e4e4e7;

  border-top-color:
    #7c3aed;

  border-radius: 50%;

  animation:
    spin .8s linear infinite;

  margin-bottom: 8px;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

.empty {
  text-align: center;

  background: white;

  border:
    1px solid #e4e4e7;

  border-radius: 25px;

  padding: 70px 20px;
}

.empty-icon {
  font-size: 50px;

  margin-bottom: 15px;
}

.empty h2 {
  margin: 0 0 8px;
}

.empty p {
  color: #71717a;

  margin-bottom: 25px;
}

.canvas {
  display: none;
}

@media (max-width: 600px) {

  .header {
    height: 68px;
  }

  .brand {
    font-size: 19px;
  }

  .template-badge {
    display: none;
  }

  main {
    width: 94%;

    padding-top: 28px;
  }

  .hero {
    margin-bottom: 25px;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }

  .result-frame {
    padding: 8px;

    border-radius: 20px;
  }

  .result-frame img {
    border-radius: 13px;
  }
}

</style>