<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { templates } from '~/data/templates'

/* =========================================================
   ROUTE & TEMPLATE
========================================================= */

const route = useRoute()

const templateId = Number(route.query.template || 1)

const template =
  templates.find((t) => t.id === templateId) ||
  templates[0]

/* =========================================================
   DATA
========================================================= */

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const canvas = ref<HTMLCanvasElement | null>(null)

/*
  JUMLAH FOTO SELALU MENGIKUTI TEMPLATE
*/
const requiredPhotos = template.photos

/* =========================================================
   TITLE & SUBTITLE
========================================================= */

const templateTitle = template.name

const templateSubtitle = (() => {
  switch (template.style) {
    case 'love':
      return 'Beautiful moments together'

    case 'kawaii':
      return 'Captured moments'

    case 'film':
      return 'Film memories'

    case 'polaroid':
      return 'Memories worth keeping'

    case 'friends':
      return 'Best moments with friends'

    case 'coquette':
      return 'Sweet little memories'

    case 'magazine':
      return 'Special edition'

    case 'luxury':
      return 'A timeless collection'

    case 'blue':
      return 'Good times, great memories'

    case 'purple':
      return 'Dreamy memories'

    case 'retro':
      return 'Good times'

    case 'flower':
      return 'Blooming memories'

    case 'minimal':
      return 'Simple moments'

    case 'letter':
      return 'A letter full of memories'

    case 'y2k':
      return 'Memories from another era'

    case 'bear':
      return 'Sweet memories'

    case 'newspaper':
      return 'The memory edition'

    case 'red':
      return 'Love captured forever'

    case 'ocean':
      return 'Good vibes by the ocean'

    case 'green':
      return 'Fresh memories'

    case 'diary':
      return 'Memories worth keeping'

    case 'street':
      return 'Captured in the moment'

    case 'wedding':
      return 'A beautiful day'

    case 'vertical':
      return 'Captured moments'

    case 'kemerdekaan':
      return 'Dirgahayu Republik Indonesia'

    case 'vintage-collage':
      return 'Memories from the good old days'

    case 'teddy-frame':
      return 'Good things are coming'

    case 'breaking-news':
      return 'Special photo edition'

    default:
      return 'Beautiful memories'
  }
})()

/* =========================================================
   LOAD
========================================================= */

onMounted(async () => {
  const saved = localStorage.getItem('photobooth_photos')

  if (saved) {
    try {
      const parsed = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        /*
          PENTING:
          HANYA AMBIL FOTO SESUAI JUMLAH TEMPLATE
        */
        photos.value = parsed
          .filter((photo) => typeof photo === 'string')
          .slice(0, requiredPhotos)
      }
    } catch {
      photos.value = []
    }
  }

  if (photos.value.length > 0) {
    await generate()
  } else {
    loading.value = false
  }
})

/* =========================================================
   LOAD IMAGE
========================================================= */

const loadImage = (
  src: string
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Gagal memuat gambar'))

    img.src = src
  })
}

/* =========================================================
   DRAW IMAGE COVER
========================================================= */

const cover = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  if (!img.width || !img.height) return

  const ratio = img.width / img.height
  const target = w / h

  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0

  if (ratio > target) {
    sw = img.height * target
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / target
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
    w,
    h
  )
}

/* =========================================================
   DRAW ROUNDED IMAGE
========================================================= */

const roundedImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) => {
  ctx.save()

  ctx.beginPath()

  ctx.roundRect(
    x,
    y,
    w,
    h,
    radius
  )

  ctx.clip()

  cover(
    ctx,
    img,
    x,
    y,
    w,
    h
  )

  ctx.restore()
}

/* =========================================================
   TEXT
========================================================= */

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

  ctx.font = `${weight} ${size}px ${font}`

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillText(
    value,
    x,
    y
  )
}

/* =========================================================
   BACKGROUND
========================================================= */

const drawBackground = (
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

  ctx.fillStyle = gradient

  ctx.fillRect(
    0,
    0,
    width,
    height
  )
}

/* =========================================================
   HEART
========================================================= */

const drawHeart = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
  ctx.save()

  ctx.fillStyle = color

  ctx.beginPath()

  const top = y - size * 0.3

  ctx.moveTo(x, y + size * 0.75)

  ctx.bezierCurveTo(
    x - size,
    y,
    x - size * 0.75,
    top,
    x,
    top + size * 0.35
  )

  ctx.bezierCurveTo(
    x + size * 0.75,
    top,
    x + size,
    y,
    x,
    y + size * 0.75
  )

  ctx.fill()

  ctx.restore()
}

/* =========================================================
   DECORATIVE FRAME
========================================================= */

const drawFrame = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = '#ffffff',
  radius = 20,
  border = 12
) => {
  ctx.save()

  ctx.fillStyle = color

  ctx.beginPath()

  ctx.roundRect(
    x,
    y,
    w,
    h,
    radius
  )

  ctx.fill()

  ctx.restore()
}

/* =========================================================
   GENERATE
========================================================= */

const generate = async () => {
  if (!canvas.value) return

  loading.value = true

  try {
    /*
      ================================================
      LOAD FOTO SESUAI TEMPLATE
      ================================================
    */

    const selectedPhotos =
      photos.value.slice(
        0,
        requiredPhotos
      )

    const images: HTMLImageElement[] = []

    for (const photo of selectedPhotos) {
      try {
        const img = await loadImage(photo)
        images.push(img)
      } catch {
        // Abaikan gambar yang gagal
      }
    }

    if (!images.length) {
      loading.value = false
      return
    }

    const ctx =
      canvas.value.getContext('2d')

    if (!ctx) {
      loading.value = false
      return
    }

    /*
      ================================================
      CANVAS
      ================================================
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

    drawBackground(
      ctx,
      W,
      H
    )

    /*
      ================================================
      STYLE 1
      SWEET LOVE
      ================================================
    */

    if (template.style === 'love') {
      drawText(
        ctx,
        templateTitle,
        600,
        125,
        62,
        '#9d174d',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        170,
        24,
        '#be185d',
        'normal'
      )

      const positions = [
        [100, 250],
        [610, 250],
        [100, 900],
        [610, 900]
      ]

      images.forEach((img, i) => {
        const position = positions[i]

        if (!position) return

        const [x, y] = position

        drawFrame(
          ctx,
          x - 10,
          y - 10,
          480,
          500,
          '#ffffff',
          20,
          10
        )

        roundedImage(
          ctx,
          img,
          x,
          y,
          460,
          460,
          12
        )

        drawHeart(
          ctx,
          x + 230,
          y + 420,
          25,
          '#ec4899'
        )
      })

      drawText(
        ctx,
        '♡ memories ♡',
        600,
        1600,
        28,
        '#9d174d',
        'normal',
        'Georgia'
      )
    }

    /*
      ================================================
      STYLE 2
      KAWAII
      ================================================
    */

    else if (template.style === 'kawaii') {
      drawText(
        ctx,
        templateTitle,
        600,
        120,
        62,
        '#9d174d',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        165,
        24,
        '#be185d',
        'normal'
      )

      const positions = [
        [100, 250],
        [610, 250],
        [100, 850],
        [610, 850]
      ]

      images.forEach((img, i) => {
        const position = positions[i]

        if (!position) return

        const [x, y] = position

        drawFrame(
          ctx,
          x - 15,
          y - 15,
          490,
          500,
          '#ffffff',
          22
        )

        roundedImage(
          ctx,
          img,
          x,
          y,
          460,
          470,
          20
        )
      })

      drawText(
        ctx,
        '♡ memories ♡',
        600,
        1510,
        28,
        '#be185d',
        'normal',
        'Georgia'
      )
    }

    /*
      ================================================
      STYLE 3
      FILM
      ================================================
    */

    else if (template.style === 'film') {
      ctx.fillStyle = '#111111'

      ctx.fillRect(
        70,
        50,
        1060,
        1700
      )

      drawText(
        ctx,
        'FILM',
        600,
        145,
        70,
        '#ffffff',
        'bold',
        'Georgia'
      )

      images.forEach((img, i) => {
        const y = 220 + i * 370

        if (y + 320 > 1700) return

        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
          160,
          y,
          880,
          320
        )

        cover(
          ctx,
          img,
          180,
          y + 20,
          840,
          280
        )

        drawText(
          ctx,
          `FRAME ${String(i + 1).padStart(2, '0')}`,
          600,
          y + 305,
          16,
          '#111111'
        )
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1700,
        20,
        '#ffffff',
        'normal'
      )
    }

    /*
      ================================================
      STYLE 4
      POLAROID
      ================================================
    */

    else if (template.style === 'polaroid') {
      drawText(
        ctx,
        templateTitle,
        600,
        120,
        58,
        '#44403c',
        'bold',
        'Georgia'
      )

      const positions = [
        [100, 250],
        [610, 250],
        [100, 930]
      ]

      images.forEach((img, i) => {
        const position = positions[i]

        if (!position) return

        const [x, y] = position

        ctx.save()

        ctx.translate(
          x + 220,
          y + 250
        )

        ctx.rotate(
          (i % 2 === 0 ? -2 : 2) *
          Math.PI /
          180
        )

        ctx.fillStyle = '#ffffff'

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

        drawText(
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

    /*
      ================================================
      STYLE 5
      MAGAZINE
      ================================================
    */

    else if (template.style === 'magazine') {
      ctx.fillStyle = '#18181b'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      drawText(
        ctx,
        'SPECIAL EDITION',
        600,
        100,
        26,
        '#ffffff'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        185,
        72,
        '#ffffff',
        'bold',
        'Georgia'
      )

      if (images[0]) {
        cover(
          ctx,
          images[0],
          80,
          260,
          1040,
          650
        )
      }

      if (images[1]) {
        cover(
          ctx,
          images[1],
          80,
          950,
          500,
          500
        )
      }

      if (images[2]) {
        cover(
          ctx,
          images[2],
          620,
          950,
          500,
          500
        )
      }

      drawText(
        ctx,
        templateSubtitle,
        600,
        1580,
        22,
        '#ffffff',
        'normal'
      )
    }

    /*
      ================================================
      STYLE 6
      RETRO
      ================================================
    */

    else if (template.style === 'retro') {
      drawText(
        ctx,
        templateTitle,
        600,
        130,
        65,
        '#7f1d1d',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        175,
        20,
        '#7f1d1d'
      )

      images.forEach((img, i) => {
        const x =
          100 + (i % 2) * 510

        const y =
          260 +
          Math.floor(i / 2) * 600

        ctx.fillStyle = '#fef3c7'

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

        drawText(
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

    /*
      ================================================
      STYLE 7
      MINIMAL
      ================================================
    */

    else if (template.style === 'minimal') {
      drawText(
        ctx,
        templateTitle,
        600,
        110,
        50,
        '#18181b',
        'normal',
        'Arial'
      )

      images.forEach((img, i) => {
        const y =
          180 + i * 390

        cover(
          ctx,
          img,
          150,
          y,
          900,
          330
        )
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1720,
        20,
        '#71717a',
        'normal'
      )
    }

    /*
      ================================================
      STYLE 8
      DARK LUXURY
      ================================================
    */

    else if (
      template.style === 'luxury' ||
      template.style === 'dark'
    ) {
      ctx.fillStyle = '#101014'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      drawText(
        ctx,
        templateTitle,
        600,
        130,
        68,
        '#ffffff',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        175,
        18,
        '#d4af37',
        'normal'
      )

      images.forEach((img, i) => {
        const y =
          250 + i * 360

        cover(
          ctx,
          img,
          100,
          y,
          1000,
          310
        )
      })

      drawText(
        ctx,
        '✦',
        600,
        1730,
        35,
        '#d4af37'
      )
    }

    /*
      ================================================
      STYLE 9
      CUTE
      ================================================
    */

    else if (
      template.style === 'cute' ||
      template.style === 'flower' ||
      template.style === 'bear'
    ) {
      drawText(
        ctx,
        '♡',
        600,
        110,
        65,
        '#db2777'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        180,
        58,
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
            ? 280
            : 850

        roundedImage(
          ctx,
          img,
          x,
          y,
          480,
          480,
          35
        )
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1500,
        28,
        '#be185d',
        'bold',
        'cursive'
      )
    }

    /*
      ================================================
      STYLE 10
      VERTICAL
      ================================================
    */

    else if (
      template.style === 'vertical'
    ) {
      drawText(
        ctx,
        templateTitle,
        600,
        105,
        60,
        '#9d174d',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        150,
        24,
        '#be185d',
        'normal'
      )

      let y = 210

      images.forEach((img, i) => {
        if (y + 365 > H) return

        ctx.fillStyle = '#ffffff'

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

        drawText(
          ctx,
          String(i + 1).padStart(2, '0'),
          600,
          y + 365,
          18,
          '#9d174d'
        )

        y += 395
      })
    }

    /*
      ================================================
      STYLE 11
      NEWSPAPER
      ================================================
    */

    else if (
      template.style === 'newspaper'
    ) {
      ctx.fillStyle = '#f5f5f4'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      drawText(
        ctx,
        'PHOTOBOOTH',
        600,
        90,
        28,
        '#292524',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'MEMORIES EDITION',
        600,
        170,
        70,
        '#292524',
        'bold',
        'Georgia'
      )

      const first = images[0]

      if (first) {
        cover(
          ctx,
          first,
          70,
          240,
          1060,
          650
        )
      }

      images.slice(1).forEach((img, i) => {
        const x =
          70 + i * 350

        cover(
          ctx,
          img,
          x,
          950,
          320,
          420
        )
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1510,
        25,
        '#44403c',
        'normal',
        'Georgia'
      )
    }

    /*
      ================================================
      STYLE 12
      RED ROMANCE
      ================================================
    */

    else if (
      template.style === 'red'
    ) {
      drawText(
        ctx,
        '♥',
        600,
        100,
        60,
        '#b91c1c'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        180,
        65,
        '#991b1b',
        'bold',
        'Georgia'
      )

      images.forEach((img, i) => {
        const x =
          100 + (i % 2) * 510

        const y =
          270 +
          Math.floor(i / 2) * 600

        roundedImage(
          ctx,
          img,
          x,
          y,
          470,
          470,
          25
        )
      })
    }

    /*
      ================================================
      STYLE 13
      BLUE / OCEAN
      ================================================
    */

    else if (
      template.style === 'blue' ||
      template.style === 'ocean'
    ) {
      drawText(
        ctx,
        templateTitle,
        600,
        120,
        60,
        '#075985',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        170,
        22,
        '#0369a1'
      )

      images.forEach((img, i) => {
        const y =
          230 + i * 390

        roundedImage(
          ctx,
          img,
          100,
          y,
          1000,
          340,
          25
        )
      })
    }

    /*
      ================================================
      STYLE 14
      PURPLE / Y2K
      ================================================
    */

    else if (
      template.style === 'purple' ||
      template.style === 'y2k'
    ) {
      drawText(
        ctx,
        templateTitle,
        600,
        125,
        65,
        '#7c3aed',
        'bold',
        'Georgia'
      )

      images.forEach((img, i) => {
        const x =
          i % 2 === 0
            ? 100
            : 620

        const y =
          i < 2
            ? 280
            : 900

        ctx.save()

        ctx.translate(
          x + 230,
          y + 230
        )

        ctx.rotate(
          (i % 2 ? 2 : -2) *
          Math.PI /
          180
        )

        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
          -240,
          -240,
          480,
          500
        )

        cover(
          ctx,
          img,
          -220,
          -220,
          440,
          440
        )

        ctx.restore()
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1600,
        25,
        '#7c3aed'
      )
    }

    /*
      ================================================
      STYLE 15
      KEMERDEKAAN INDONESIA
      ================================================
    */

    else if (
      template.style === 'kemerdekaan'
    ) {
      /*
        BACKGROUND MERAH PUTIH
      */

      ctx.fillStyle = '#ffffff'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      /*
        HEADER MERAH
      */

      ctx.fillStyle = '#dc2626'

      ctx.fillRect(
        0,
        0,
        W,
        300
      )

      drawText(
        ctx,
        'DIRGAHAYU',
        600,
        90,
        45,
        '#ffffff',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'REPUBLIK INDONESIA',
        600,
        155,
        55,
        '#ffffff',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'MERDEKA!',
        600,
        225,
        38,
        '#ffffff',
        'bold'
      )

      /*
        FOTO UTAMA
      */

      if (images[0]) {
        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
          90,
          350,
          1020,
          1000
        )

        cover(
          ctx,
          images[0],
          115,
          375,
          970,
          950
        )
      }

      /*
        FOOTER
      */

      ctx.fillStyle = '#dc2626'

      ctx.fillRect(
        0,
        1500,
        W,
        300
      )

      drawText(
        ctx,
        '17 AGUSTUS',
        600,
        1600,
        40,
        '#ffffff',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'INDONESIA',
        600,
        1660,
        35,
        '#ffffff',
        'bold'
      )

      drawText(
        ctx,
        'DIRGAHAYU REPUBLIK INDONESIA',
        600,
        1730,
        22,
        '#ffffff'
      )
    }

    /*
      ================================================
      STYLE 16
      VINTAGE COLLAGE
      ================================================
    */

    else if (
      template.style === 'vintage-collage'
    ) {
      ctx.fillStyle = '#181818'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      /*
        BACKGROUND TITLE
      */

      drawText(
        ctx,
        'VINTAGE',
        600,
        110,
        58,
        '#ffffff',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'MEMORIES',
        600,
        175,
        70,
        '#ffffff',
        'bold',
        'Georgia'
      )

      /*
        6 FOTO
      */

      images.forEach((img, i) => {
        const col =
          i % 2

        const row =
          Math.floor(i / 2)

        const x =
          col === 0
            ? 100
            : 620

        const y =
          250 + row * 480

        ctx.save()

        ctx.translate(
          x + 220,
          y + 190
        )

        ctx.rotate(
          (i % 2 === 0 ? -3 : 3) *
          Math.PI /
          180
        )

        ctx.fillStyle = '#ffffff'

        ctx.fillRect(
          -220,
          -190,
          440,
          410
        )

        cover(
          ctx,
          img,
          -200,
          -170,
          400,
          350
        )

        drawText(
          ctx,
          `MEMORY ${i + 1}`,
          0,
          205,
          14,
          '#222222'
        )

        ctx.restore()
      })
    }

    /*
      ================================================
      STYLE 17
      TEDDY FRAME
      ================================================
    */

    else if (
      template.style === 'teddy-frame'
    ) {
      ctx.fillStyle = '#ffffff'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      drawText(
        ctx,
        'GOOD THINGS',
        600,
        110,
        48,
        '#7f1d1d',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'ARE COMING',
        600,
        170,
        40,
        '#991b1b',
        'bold',
        'Georgia'
      )

      /*
        3 FOTO
      */

      const positions = [
        [180, 300],
        [180, 760],
        [180, 1220]
      ]

      images.forEach((img, i) => {
        const position =
          positions[i]

        if (!position) return

        const [x, y] =
          position

        /*
          FRAME MERAH
        */

        ctx.strokeStyle =
          '#7f1d1d'

        ctx.lineWidth = 18

        ctx.strokeRect(
          x,
          y,
          840,
          360
        )

        cover(
          ctx,
          img,
          x + 18,
          y + 18,
          804,
          324
        )
      })

      drawText(
        ctx,
        '♡ memories ♡',
        600,
        1710,
        30,
        '#7f1d1d',
        'bold',
        'cursive'
      )
    }

    /*
      ================================================
      STYLE 18
      BREAKING NEWS
      ================================================
    */

    else if (
      template.style === 'breaking-news'
    ) {
      ctx.fillStyle = '#f5f0df'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      /*
        HEADER
      */

      ctx.strokeStyle =
        '#292524'

      ctx.lineWidth = 8

      ctx.beginPath()

      ctx.moveTo(60, 100)
      ctx.lineTo(1140, 100)

      ctx.moveTo(60, 180)
      ctx.lineTo(1140, 180)

      ctx.stroke()

      drawText(
        ctx,
        'PHOTOBOOTH',
        600,
        90,
        26,
        '#292524',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'BREAKING NEWS',
        600,
        155,
        64,
        '#292524',
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        'VOL. 12.3',
        1030,
        90,
        20,
        '#292524',
        'bold',
        'Georgia'
      )

      /*
        FOTO UTAMA
      */

      if (images[0]) {
        cover(
          ctx,
          images[0],
          60,
          250,
          1080,
          620
        )
      }

      /*
        DESKRIPSI
      */

      drawText(
        ctx,
        templateSubtitle,
        600,
        925,
        24,
        '#292524',
        'normal',
        'Georgia'
      )

      /*
        FOTO BAWAH
      */

      const bottomPhotos =
        images.slice(1)

      bottomPhotos.forEach(
        (img, i) => {
          const x =
            60 + i * 365

          cover(
            ctx,
            img,
            x,
            1020,
            335,
            400
          )
        }
      )

      /*
        FOOTER
      */

      ctx.strokeStyle =
        '#292524'

      ctx.lineWidth = 8

      ctx.beginPath()

      ctx.moveTo(60, 1500)
      ctx.lineTo(1140, 1500)

      ctx.moveTo(60, 1570)
      ctx.lineTo(1140, 1570)

      ctx.stroke()

      drawText(
        ctx,
        'SPECIAL PHOTO EDITION',
        600,
        1640,
        30,
        '#292524',
        'bold',
        'Georgia'
      )
    }

    /*
      ================================================
      STYLE 19
      FRIENDS
      ================================================
    */

    else if (
      template.style === 'friends'
    ) {
      drawText(
        ctx,
        templateTitle,
        600,
        120,
        60,
        '#1d4ed8',
        'bold',
        'Georgia'
      )

      images.forEach((img, i) => {
        const x =
          i % 2 === 0
            ? 100
            : 620

        const y =
          i < 2
            ? 270
            : 900

        roundedImage(
          ctx,
          img,
          x,
          y,
          470,
          470,
          25
        )
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1600,
        28,
        '#1d4ed8'
      )
    }

    /*
      ================================================
      STYLE 20
      COQUETTE / DIARY / LETTER
      ================================================
    */

    else if (
      template.style === 'coquette' ||
      template.style === 'diary' ||
      template.style === 'letter'
    ) {
      drawText(
        ctx,
        '♡',
        600,
        100,
        60,
        '#be185d'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        180,
        60,
        '#9d174d',
        'bold',
        'Georgia'
      )

      let y = 270

      images.forEach((img, i) => {
        roundedImage(
          ctx,
          img,
          120,
          y,
          960,
          300,
          25
        )

        drawText(
          ctx,
          `♡ ${String(i + 1).padStart(2, '0')} ♡`,
          600,
          y + 335,
          18,
          '#be185d'
        )

        y += 360
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1680,
        24,
        '#9d174d',
        'normal',
        'Georgia'
      )
    }

    /*
      ================================================
      STYLE 21
      WEDDING
      ================================================
    */

    else if (
      template.style === 'wedding'
    ) {
      ctx.fillStyle = '#fafaf9'

      ctx.fillRect(
        0,
        0,
        W,
        H
      )

      drawText(
        ctx,
        'OUR',
        600,
        110,
        25,
        '#78716c'
      )

      drawText(
        ctx,
        templateTitle,
        600,
        185,
        72,
        '#57534e',
        'bold',
        'Georgia'
      )

      images.forEach((img, i) => {
        const y =
          270 + i * 370

        roundedImage(
          ctx,
          img,
          100,
          y,
          1000,
          310,
          20
        )
      })

      drawText(
        ctx,
        templateSubtitle,
        600,
        1730,
        22,
        '#78716c',
        'normal',
        'Georgia'
      )
    }

    /*
      ================================================
      STYLE 22
      GENERIC FALLBACK
      ================================================
      
      Tidak lagi menggunakan layout classic secara
      sembarangan. Layout mengikuti jumlah foto.
    */

    else {
      drawText(
        ctx,
        templateTitle,
        600,
        120,
        60,
        template.colors[1],
        'bold',
        'Georgia'
      )

      drawText(
        ctx,
        templateSubtitle,
        600,
        165,
        22,
        template.colors[1],
        'normal'
      )

      /*
        Kalau 1 foto
      */

      if (images.length === 1) {
        roundedImage(
          ctx,
          images[0],
          100,
          260,
          1000,
          1200,
          30
        )
      }

      /*
        Kalau 2 foto
      */

      else if (images.length === 2) {
        images.forEach((img, i) => {
          roundedImage(
            ctx,
            img,
            100,
            280 + i * 650,
            1000,
            560,
            25
          )
        })
      }

      /*
        Kalau 3 foto
      */

      else if (images.length === 3) {
        images.forEach((img, i) => {
          roundedImage(
            ctx,
            img,
            100,
            250 + i * 470,
            1000,
            400,
            25
          )
        })
      }

      /*
        4+ foto
      */

      else {
        images.forEach((img, i) => {
          const col =
            i % 2

          const row =
            Math.floor(i / 2)

          const x =
            100 + col * 510

          const y =
            260 + row * 600

          roundedImage(
            ctx,
            img,
            x,
            y,
            470,
            500,
            25
          )
        })
      }
    }

    /*
      ================================================
      EXPORT JPG
      ================================================
    */

    resultUrl.value =
      canvas.value.toDataURL(
        'image/jpeg',
        0.95
      )
  } catch (error) {
    console.error(
      'Gagal membuat hasil:',
      error
    )

    resultUrl.value = ''
  } finally {
    loading.value = false
  }
}

/* =========================================================
   DOWNLOAD
========================================================= */

const download = () => {
  if (!resultUrl.value) return

  const safeName =
    template.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const a =
    document.createElement('a')

  a.href =
    resultUrl.value

  a.download =
    `photobooth-${safeName}.jpg`

  document.body.appendChild(a)

  a.click()

  document.body.removeChild(a)
}

/* =========================================================
   RETAKE
========================================================= */

const retake = () => {
  /*
    HAPUS FOTO LAMA AGAR PENGAMBILAN BARU
    DIMULAI DARI AWAL
  */

  localStorage.removeItem(
    'photobooth_photos'
  )

  navigateTo(
    `/camera?template=${template.id}`
  )
}

/* =========================================================
   HOME
========================================================= */

const home = () => {
  navigateTo('/')
}
</script>

<template>
  <div class="page">

    <!-- =========================================
         HEADER
    ========================================== -->

    <header class="header">

      <button
        class="home-btn"
        @click="home"
      >
        ← Home
      </button>

      <div class="brand">
        <span class="brand-icon">
          📸
        </span>

        <strong>
          Photobooth
        </strong>
      </div>

      <span class="template-name">
        {{ template.name }}
      </span>

    </header>

    <!-- =========================================
         MAIN
    ========================================== -->

    <main>

      <section class="heading">

        <small>
          YOUR RESULT
        </small>

        <h1>
          {{ template.name }}
        </h1>

        <p>
          Beautiful moments captured together.
        </p>

      </section>

      <!-- =======================================
           LOADING
      ======================================== -->

      <div
        v-if="loading"
        class="loading"
      >

        <div class="spinner"></div>

        <h3>
          Membuat hasil foto...
        </h3>

        <p>
          Menyesuaikan dengan template
          {{ template.name }}
        </p>

      </div>

      <!-- =======================================
           RESULT
      ======================================== -->

      <div
        v-else-if="resultUrl"
        class="result"
      >

        <div class="image-box">

          <img
            :src="resultUrl"
            :alt="`Hasil ${template.name}`"
          >

        </div>

        <!-- =====================================
             INFO JUMLAH FOTO
        ====================================== -->

        <div class="photo-info">

          <span>
            {{ photos.length }}
            /
            {{ template.photos }}
            foto
          </span>

          <span>
            {{ template.category }}
          </span>

        </div>

        <!-- =====================================
             BUTTONS
        ====================================== -->

        <div class="buttons">

          <button
            class="download"
            @click="download"
          >
            <span>↓</span>
            Download JPG
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
          <b>1 gambar JPG</b>
          menggunakan template
          <b>{{ template.name }}</b>.

        </p>

      </div>

      <!-- =======================================
           EMPTY
      ======================================== -->

      <div
        v-else
        class="empty"
      >

        <div class="empty-icon">
          📷
        </div>

        <h2>
          Belum ada foto
        </h2>

        <p>
          Silakan ambil
          {{ template.photos }}
          foto untuk template ini.
        </p>

        <button
          class="download"
          @click="retake"
        >
          📸 Ambil Foto
        </button>

      </div>

    </main>

    <!-- =========================================
         CANVAS
    ========================================== -->

    <canvas
      ref="canvas"
      class="canvas"
    />

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

.page {
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
    Arial,
    Helvetica,
    sans-serif;
}

/* =====================================================
   HEADER
===================================================== */

.header {
  height: 72px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    0 5%;

  background:
    rgba(255, 255, 255, 0.96);

  border-bottom:
    1px solid #e4e4e7;

  position: sticky;

  top: 0;

  z-index: 20;

  backdrop-filter:
    blur(15px);
}

.home-btn {
  border: none;

  background: transparent;

  cursor: pointer;

  font-size: 15px;

  font-weight: 700;

  color: #52525b;

  transition:
    0.2s ease;
}

.home-btn:hover {
  color: #7c3aed;

  transform:
    translateX(-2px);
}

/* =====================================================
   BRAND
===================================================== */

.brand {
  display: flex;

  align-items: center;

  gap: 9px;

  font-size: 20px;
}

.brand-icon {
  font-size: 25px;
}

.brand strong {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  -webkit-background-clip: text;

  background-clip: text;

  color: transparent;
}

.template-name {
  color: #71717a;

  font-size: 13px;

  font-weight: 600;
}

/* =====================================================
   MAIN
===================================================== */

main {
  width: 92%;

  max-width: 850px;

  margin:
    0 auto;

  padding:
    55px 0 90px;
}

/* =====================================================
   HEADING
===================================================== */

.heading {
  text-align: center;

  margin-bottom: 38px;
}

.heading small {
  color: #7c3aed;

  font-size: 11px;

  font-weight: 900;

  letter-spacing: 3px;
}

.heading h1 {
  margin:
    10px 0 8px;

  font-family:
    Georgia,
    serif;

  font-size: 42px;

  line-height: 1.15;
}

.heading p {
  margin: 0;

  color: #71717a;

  font-size: 16px;
}

/* =====================================================
   RESULT
===================================================== */

.result {
  width: 100%;
}

/* =====================================================
   IMAGE BOX
===================================================== */

.image-box {
  width: 100%;

  max-width: 650px;

  margin:
    0 auto;

  padding: 12px;

  background:
    #ffffff;

  border:
    1px solid #e4e4e7;

  border-radius:
    22px;

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.13);

  transition:
    0.3s ease;
}

.image-box:hover {
  transform:
    translateY(-3px);

  box-shadow:
    0 30px 80px
    rgba(0, 0, 0, 0.16);
}

.image-box img {
  width: 100%;

  display: block;

  border-radius:
    13px;
}

/* =====================================================
   PHOTO INFO
===================================================== */

.photo-info {
  display: flex;

  justify-content: center;

  align-items: center;

  gap: 10px;

  margin-top: 18px;
}

.photo-info span {
  padding:
    7px 12px;

  border-radius:
    999px;

  background:
    #f4f4f5;

  color:
    #71717a;

  font-size: 12px;

  font-weight: 700;
}

/* =====================================================
   BUTTONS
===================================================== */

.buttons {
  display: flex;

  justify-content: center;

  gap: 12px;

  margin-top: 22px;
}

.buttons button {
  border: none;

  padding:
    14px 25px;

  border-radius:
    13px;

  font-size: 14px;

  font-weight: 800;

  cursor: pointer;

  transition:
    0.2s ease;
}

/* =====================================================
   DOWNLOAD
===================================================== */

.download {
  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #db2777
    );

  color: white;

  box-shadow:
    0 8px 25px
    rgba(124, 58, 237, 0.25);
}

.download:hover {
  transform:
    translateY(-2px);

  box-shadow:
    0 12px 30px
    rgba(124, 58, 237, 0.35);
}

.download:active {
  transform:
    scale(0.98);
}

/* =====================================================
   RETAKE
===================================================== */

.retake {
  background:
    white;

  color:
    #52525b;

  border:
    1px solid #d4d4d8 !important;
}

.retake:hover {
  background:
    #fafafa;

  border-color:
    #a1a1aa !important;
}

/* =====================================================
   INFO
===================================================== */

.info {
  margin-top: 18px;

  text-align: center;

  color: #a1a1aa;

  font-size: 12px;

  line-height: 1.6;
}

.info b {
  color:
    #71717a;
}

/* =====================================================
   LOADING
===================================================== */

.loading {
  min-height: 420px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;
}

.spinner {
  width: 42px;

  height: 42px;

  border:
    4px solid #e4e4e7;

  border-top-color:
    #7c3aed;

  border-radius:
    50%;

  animation:
    spin 0.8s linear infinite;

  margin-bottom: 20px;
}

.loading h3 {
  margin:
    0 0 7px;

  font-size: 17px;
}

.loading p {
  margin: 0;

  color: #a1a1aa;

  font-size: 13px;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

/* =====================================================
   EMPTY
===================================================== */

.empty {
  padding:
    80px 30px;

  text-align: center;

  background:
    white;

  border:
    1px solid #e4e4e7;

  border-radius:
    22px;

  box-shadow:
    0 20px 50px
    rgba(0, 0, 0, 0.07);
}

.empty-icon {
  font-size: 60px;

  margin-bottom: 15px;
}

.empty h2 {
  margin:
    0 0 8px;

  font-family:
    Georgia,
    serif;

  font-size: 28px;
}

.empty p {
  color:
    #71717a;

  font-size: 14px;

  margin:
    0 auto 25px;

  max-width: 400px;
}

/* =====================================================
   CANVAS
===================================================== */

.canvas {
  display: none;
}

/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 600px) {
  .header {
    height: 65px;

    padding:
      0 18px;
  }

  .brand {
    font-size: 17px;
  }

  .brand-icon {
    font-size: 21px;
  }

  .template-name {
    display: none;
  }

  main {
    width: 94%;

    padding:
      35px 0 70px;
  }

  .heading {
    margin-bottom: 25px;
  }

  .heading small {
    font-size: 9px;

    letter-spacing: 2.5px;
  }

  .heading h1 {
    font-size: 31px;
  }

  .heading p {
    font-size: 14px;
  }

  .image-box {
    padding: 8px;

    border-radius: 18px;
  }

  .image-box img {
    border-radius: 11px;
  }

  .photo-info {
    gap: 7px;
  }

  .photo-info span {
    font-size: 11px;

    padding:
      6px 10px;
  }

  .buttons {
    flex-direction: column;

    gap: 9px;
  }

  .buttons button {
    width: 100%;

    padding:
      15px 20px;
  }

  .empty {
    padding:
      60px 20px;
  }
}
</style>