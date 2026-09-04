export interface TemplateSlot {
  x: number
  y: number
  width: number
  height: number
  rotate?: number
}

export interface PhotoTemplate {
  id: number
  name: string
  category: string
  photos: number
  style: string
  colors: string[]

  // Untuk template berbasis frame/gambar
  frame?: string
  frameWidth?: number
  frameHeight?: number
  slots?: TemplateSlot[]
}

export const templates: PhotoTemplate[] = [

  // =====================================================
  // TEMPLATE LAMA
  // =====================================================

  {
    id: 1,
    name: 'Sweet Love',
    category: 'Couple',
    photos: 4,
    style: 'love',
    colors: ['#ffe4ec', '#ff8fab']
  },

  {
    id: 2,
    name: 'Kawaii Pink',
    category: 'Cute',
    photos: 4,
    style: 'kawaii',
    colors: ['#fff0f6', '#f472b6']
  },

  {
    id: 3,
    name: 'Film Memories',
    category: 'Vintage',
    photos: 4,
    style: 'film',
    colors: ['#e7dfd3', '#433d38']
  },

  {
    id: 4,
    name: 'Classic Polaroid',
    category: 'Vintage',
    photos: 3,
    style: 'polaroid',
    colors: ['#f5f5f5', '#222']
  },

  {
    id: 5,
    name: 'Best Friends',
    category: 'Friends',
    photos: 4,
    style: 'friends',
    colors: ['#dbeafe', '#3b82f6']
  },

  {
    id: 6,
    name: 'Coquette',
    category: 'Cute',
    photos: 4,
    style: 'coquette',
    colors: ['#fff1f2', '#be185d']
  },

  {
    id: 7,
    name: 'Magazine',
    category: 'Aesthetic',
    photos: 3,
    style: 'magazine',
    colors: ['#f4f4f5', '#18181b']
  },

  {
    id: 8,
    name: 'Dark Luxury',
    category: 'Elegant',
    photos: 4,
    style: 'luxury',
    colors: ['#18181b', '#d4af37']
  },

  {
    id: 9,
    name: 'Blue Boy',
    category: 'Men',
    photos: 4,
    style: 'blue',
    colors: ['#dbeafe', '#1d4ed8']
  },

  {
    id: 10,
    name: 'Purple Night',
    category: 'Aesthetic',
    photos: 4,
    style: 'purple',
    colors: ['#ede9fe', '#7c3aed']
  },

  {
    id: 11,
    name: 'Retro Camera',
    category: 'Vintage',
    photos: 4,
    style: 'retro',
    colors: ['#fef3c7', '#92400e']
  },

  {
    id: 12,
    name: 'Flower Diary',
    category: 'Cute',
    photos: 4,
    style: 'flower',
    colors: ['#fce7f3', '#db2777']
  },

  {
    id: 13,
    name: 'Minimal Day',
    category: 'Minimal',
    photos: 4,
    style: 'minimal',
    colors: ['#ffffff', '#171717']
  },

  {
    id: 14,
    name: 'Love Letter',
    category: 'Couple',
    photos: 4,
    style: 'letter',
    colors: ['#fff7ed', '#c2410c']
  },

  {
    id: 15,
    name: 'Y2K Star',
    category: 'Aesthetic',
    photos: 4,
    style: 'y2k',
    colors: ['#fae8ff', '#c026d3']
  },

  {
    id: 16,
    name: 'Sweet Bear',
    category: 'Cute',
    photos: 4,
    style: 'bear',
    colors: ['#fef3c7', '#92400e']
  },

  {
    id: 17,
    name: 'Newspaper',
    category: 'Vintage',
    photos: 4,
    style: 'newspaper',
    colors: ['#f5f5f4', '#292524']
  },

  {
    id: 18,
    name: 'Red Romance',
    category: 'Couple',
    photos: 4,
    style: 'red',
    colors: ['#fee2e2', '#b91c1c']
  },

  {
    id: 19,
    name: 'Ocean',
    category: 'Men',
    photos: 4,
    style: 'ocean',
    colors: ['#cffafe', '#0369a1']
  },

  {
    id: 20,
    name: 'Soft Green',
    category: 'Minimal',
    photos: 4,
    style: 'green',
    colors: ['#ecfdf5', '#047857']
  },

  {
    id: 21,
    name: 'Pink Diary',
    category: 'Cute',
    photos: 4,
    style: 'diary',
    colors: ['#fce7f3', '#9d174d']
  },

  {
    id: 22,
    name: 'Street',
    category: 'Men',
    photos: 4,
    style: 'street',
    colors: ['#e5e7eb', '#111827']
  },

  {
    id: 23,
    name: 'Wedding',
    category: 'Elegant',
    photos: 4,
    style: 'wedding',
    colors: ['#fafaf9', '#78716c']
  },

  {
    id: 24,
    name: 'Vertical Love',
    category: 'Couple',
    photos: 4,
    style: 'vertical',
    colors: ['#ffe4e6', '#e11d48']
  },

  // =====================================================
  // TEMPLATE BARU
  // =====================================================

  {
    id: 25,
    name: 'Dirgahayu RI',
    category: 'Event',
    photos: 1,
    style: 'frame',
    colors: ['#ffffff', '#b91c1c'],

    frame: '/templates/dirgahayu-ri.png',
    frameWidth: 474,
    frameHeight: 632,

    slots: [
      {
        x: 58,
        y: 65,
        width: 358,
        height: 478
      }
    ]
  },

  {
    id: 26,
    name: 'Bingkai Masa',
    category: 'Vintage',
    photos: 7,
    style: 'frame',
    colors: ['#111111', '#ffffff'],

    frame: '/templates/bingkai-masa.png',
    frameWidth: 474,
    frameHeight: 842,

    slots: [

      // KIRI - 3 FOTO
      {
        x: 45,
        y: 285,
        width: 145,
        height: 125,
        rotate: -14
      },

      {
        x: 62,
        y: 420,
        width: 145,
        height: 125,
        rotate: -14
      },

      {
        x: 85,
        y: 555,
        width: 145,
        height: 125,
        rotate: -14
      },

      // KANAN - 4 FOTO
      {
        x: 250,
        y: 285,
        width: 160,
        height: 120,
        rotate: 7
      },

      {
        x: 250,
        y: 410,
        width: 160,
        height: 120,
        rotate: 7
      },

      {
        x: 250,
        y: 535,
        width: 160,
        height: 120,
        rotate: 7
      },

      {
        x: 250,
        y: 660,
        width: 160,
        height: 120,
        rotate: 7
      }
    ]
  },

  {
    id: 27,
    name: 'Sweet Camera',
    category: 'Cute',
    photos: 3,
    style: 'frame',
    colors: ['#ffffff', '#8b1e3f'],

    frame: '/templates/sweet-camera.png',
    frameWidth: 474,
    frameHeight: 842,

    slots: [

      {
        x: 135,
        y: 145,
        width: 205,
        height: 92
      },

      {
        x: 135,
        y: 240,
        width: 205,
        height: 92
      },

      {
        x: 135,
        y: 337,
        width: 205,
        height: 155
      }
    ]
  },

  {
    id: 28,
    name: 'Breaking News',
    category: 'Aesthetic',
    photos: 4,
    style: 'frame',
    colors: ['#f5f1e8', '#292524'],

    frame: '/templates/breaking-news.png',
    frameWidth: 736,
    frameHeight: 1104,

    slots: [

      // FOTO UTAMA
      {
        x: 35,
        y: 305,
        width: 666,
        height: 430
      },

      // FOTO KECIL 1
      {
        x: 35,
        y: 890,
        width: 205,
        height: 140
      },

      // FOTO KECIL 2
      {
        x: 265,
        y: 890,
        width: 205,
        height: 140
      },

      // FOTO KECIL 3
      {
        x: 495,
        y: 890,
        width: 205,
        height: 140
      }
    ]
  }
]