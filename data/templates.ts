export type TemplateLayout =
  | 'vertical'
  | 'film'
  | 'grid'
  | 'polaroid'
  | 'editorial'
  | 'scrapbook'
  | 'magazine'
  | 'retro'
  | 'minimal'
  | 'cute'
  | 'dark'
  | 'classic'

export interface PhotoTemplate {
  id: number
  name: string
  category: string
  layout: TemplateLayout
  colors: [string, string]
  title: string
  subtitle: string
}

export const templates: PhotoTemplate[] = [

  {
    id: 1,
    name: 'Sweet Love',
    category: 'Romantic',
    layout: 'vertical',
    colors: ['#fff1f6', '#ffd6e7'],
    title: 'SWEET LOVE',
    subtitle: 'little moments, big memories'
  },

  {
    id: 2,
    name: 'Film Story',
    category: 'Aesthetic',
    layout: 'film',
    colors: ['#1f1f1f', '#555555'],
    title: 'FILM STORY',
    subtitle: 'ROLL • FRAME • MEMORY'
  },

  {
    id: 3,
    name: 'Four Moments',
    category: 'Classic',
    layout: 'grid',
    colors: ['#f8f7f4', '#e9e4dc'],
    title: 'FOUR MOMENTS',
    subtitle: 'captured together'
  },

  {
    id: 4,
    name: 'Polaroid Diary',
    category: 'Vintage',
    layout: 'polaroid',
    colors: ['#f5efe5', '#e4d4c2'],
    title: 'POLAROID DIARY',
    subtitle: 'dear memories'
  },

  {
    id: 5,
    name: 'Editorial',
    category: 'Elegant',
    layout: 'editorial',
    colors: ['#f5f1ec', '#ded6cb'],
    title: 'EDITORIAL',
    subtitle: 'ISSUE 01 • MEMORY'
  },

  {
    id: 6,
    name: 'Scrapbook',
    category: 'Cute',
    layout: 'scrapbook',
    colors: ['#fff7d6', '#ffd6df'],
    title: 'OUR DAY',
    subtitle: '♡ keep this forever ♡'
  },

  {
    id: 7,
    name: 'Magazine',
    category: 'Fashion',
    layout: 'magazine',
    colors: ['#f4f0ff', '#dcd0ff'],
    title: 'THE MOMENT',
    subtitle: 'SPECIAL EDITION'
  },

  {
    id: 8,
    name: 'Retro Club',
    category: 'Retro',
    layout: 'retro',
    colors: ['#f8d99b', '#d98282'],
    title: 'RETRO CLUB',
    subtitle: 'GOOD TIMES ONLY'
  },

  {
    id: 9,
    name: 'Clean Memories',
    category: 'Minimal',
    layout: 'minimal',
    colors: ['#ffffff', '#f1f1f1'],
    title: 'MEMORIES',
    subtitle: 'simple & timeless'
  },

  {
    id: 10,
    name: 'Cute Diary',
    category: 'Cute',
    layout: 'cute',
    colors: ['#ffe5f0', '#eadcff'],
    title: 'CUTE DIARY',
    subtitle: '♡ smile today ♡'
  },

  {
    id: 11,
    name: 'Midnight',
    category: 'Dark',
    layout: 'dark',
    colors: ['#15151a', '#30263c'],
    title: 'MIDNIGHT',
    subtitle: 'NIGHT • LIGHTS • MEMORIES'
  },

  {
    id: 12,
    name: 'Classic Booth',
    category: 'Photobooth',
    layout: 'classic',
    colors: ['#eeeeee', '#ffffff'],
    title: 'PHOTOBOOTH',
    subtitle: 'MEMORY NO. 001'
  }

]