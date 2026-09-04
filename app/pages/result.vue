<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { templates } from '~/data/templates'

const route = useRoute()
const templateId = computed(() => Number(route.query.template || 1))
const template = computed(() => templates.find(t => t.id === templateId.value) || templates[0])

const photos = ref<string[]>([])
const resultUrl = ref('')
const loading = ref(true)
const errorMessage = ref('')
const canvas = ref<HTMLCanvasElement | null>(null)

const photoCount = computed(() => {
  const n = Number(template.value?.photos ?? 4)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 4
})

const title = computed(() => template.value?.name || 'PhotoBooth')
const subtitle = computed(() => {
  const map: Record<string, string> = {
    love: '♡ memories ♡', kawaii: 'Captured moments', film: 'FILM MEMORIES', polaroid: 'classic memories',
    friends: 'best moments together', coquette: 'pretty little moments', magazine: 'SPECIAL EDITION', luxury: 'SPECIAL MOMENTS',
    blue: 'GOOD VIBES', purple: 'MIDNIGHT MEMORIES', retro: 'memories / 2026', flower: 'blooming memories',
    minimal: 'simple memories', letter: 'with love', y2k: 'GOOD TIMES', bear: 'sweet memories', newspaper: 'THE PHOTO ISSUE',
    red: 'made with love', ocean: 'good vibes only', green: 'soft moments', diary: 'dear diary', street: 'CITY MEMORIES',
    wedding: 'forever starts here', vertical: '♡ memories ♡'
  }
  return map[template.value?.style || ''] || 'Captured moments'
})

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => reject(new Error('Gagal memuat foto'))
  img.src = src
})

const roundedRect = (ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) => {
  const rr = Math.min(r, w/2, h/2)
  ctx.beginPath(); ctx.moveTo(x+rr,y); ctx.lineTo(x+w-rr,y)
  ctx.quadraticCurveTo(x+w,y,x+w,y+rr); ctx.lineTo(x+w,y+h-rr)
  ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h); ctx.lineTo(x+rr,y+h)
  ctx.quadraticCurveTo(x,y+h,x,y+h-rr); ctx.lineTo(x,y+rr)
  ctx.quadraticCurveTo(x,y,x+rr,y); ctx.closePath()
}

const contain = (ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number,r=0,bg='#fff') => {
  const ratio = img.width/img.height, box = w/h
  let dw=w, dh=h
  if (ratio > box) dh=w/ratio; else dw=h*ratio
  const dx=x+(w-dw)/2, dy=y+(h-dh)/2
  ctx.save(); if(r){roundedRect(ctx,x,y,w,h,r);ctx.clip()}
  ctx.fillStyle=bg; ctx.fillRect(x,y,w,h); ctx.drawImage(img,dx,dy,dw,dh); ctx.restore()
}

const cover = (ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number,r=0) => {
  const ratio=img.width/img.height, box=w/h
  let sx=0,sy=0,sw=img.width,sh=img.height
  if(ratio>box){sw=img.height*box;sx=(img.width-sw)/2}else{sh=img.width/box;sy=(img.height-sh)*0.18}
  ctx.save(); if(r){roundedRect(ctx,x,y,w,h,r);ctx.clip()}
  ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h); ctx.restore()
}

const text = (ctx:CanvasRenderingContext2D,v:string,x:number,y:number,size:number,color:string,weight='700',font='Arial',align:CanvasTextAlign='center') => {
  ctx.fillStyle=color; ctx.font=`${weight} ${size}px ${font}`; ctx.textAlign=align; ctx.textBaseline='middle'; ctx.fillText(v,x,y)
}

const bg = (ctx:CanvasRenderingContext2D,W:number,H:number) => {
  const c=template.value?.colors || ['#fdf2f8','#fbcfe8']
  const g=ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)
}

const frame = (ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number,r=22,mode:'cover'|'contain'='cover') => {
  ctx.save(); ctx.shadowColor='rgba(0,0,0,.14)';ctx.shadowBlur=20;ctx.shadowOffsetY=8;ctx.fillStyle='#fff';roundedRect(ctx,x-10,y-10,w+20,h+20,r+5);ctx.fill();ctx.restore()
  mode==='contain' ? contain(ctx,img,x,y,w,h,r) : cover(ctx,img,x,y,w,h,r)
}

// 2x2 = same structure shown by Kawaii/Sweet Love/Luxury/Blue/etc. in the template picker.
const layoutTwoByTwo = (ctx:CanvasRenderingContext2D, images:HTMLImageElement[], W:number, H:number) => {
  const c=template.value.colors
  text(ctx,title.value,W/2,105,58,c?.[1] || '#831843','700','Georgia')
  text(ctx,subtitle.value,W/2,150,22,c?.[1] || '#9d174d','400')
  const gap=46, w=500, h=620, startX=(W-(w*2+gap))/2, startY=230
  images.slice(0,4).forEach((img,i)=>{
    const col=i%2,row=Math.floor(i/2),x=startX+col*(w+gap),y=startY+row*(h+gap)
    frame(ctx,img,x,y,w,h,28,'cover')
    text(ctx,String(i+1).padStart(2,'0'),x+w/2,y+h+30,17,c?.[1] || '#831843','700')
  })
  text(ctx,'♡ memories ♡',W/2,H-65,25,c?.[1] || '#be185d','700','cursive')
}

// Film/retro preview is one vertical strip with 4 frames.
const layoutFilm = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => {
  ctx.fillStyle='#171717';roundedRect(ctx,55,45,W-110,H-90,18);ctx.fill()
  text(ctx,title.value,W/2,105,52,'#fff','700','Georgia');text(ctx,subtitle.value,W/2,145,18,'#ddd','400')
  const x=150,w=900,h=310,gap=72,startY=195
  images.slice(0,4).forEach((img,i)=>{const y=startY+i*(h+gap);ctx.fillStyle='#fff';ctx.fillRect(x-14,y-14,w+28,h+28);cover(ctx,img,x,y,w,h,2);text(ctx,`FRAME ${i+1}`,W/2,y+h+37,15,'#222','700')})
  text(ctx,'FILM • 2026',W/2,H-50,18,'#fff','700')
}

// Polaroid preview is explicitly 3 cards vertically.
const layoutPolaroid = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => {
  text(ctx,title.value,W/2,90,55,'#222','700','Georgia');text(ctx,subtitle.value,W/2,130,18,'#666','400')
  const x=150,w=900,h=430,startY=190,gap=95
  images.slice(0,3).forEach((img,i)=>{const y=startY+i*(h+gap);ctx.save();ctx.translate(W/2,y+h/2);ctx.rotate((i===1?1.3:-1.3)*Math.PI/180);ctx.shadowColor='rgba(0,0,0,.15)';ctx.shadowBlur=18;ctx.shadowOffsetY=8;ctx.fillStyle='#fff';ctx.fillRect(-w/2,-h/2,w,h);ctx.restore();contain(ctx,img,x,y,w,330,4,'#ddd');text(ctx,`memory ${i+1}`,W/2,y+375,19,'#444','400','cursive')})
}

// Magazine/newspaper/street preview: one large photo + remaining small photos.
const layoutEditorial = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => {
  ctx.fillStyle=template.value.style==='newspaper'?'#f5f5f4':'#18181b';ctx.fillRect(55,45,W-110,H-90)
  const dark=template.value.style!=='newspaper'; const fg=dark?'#fff':'#222'
  text(ctx,title.value.toUpperCase(),W/2,105,48,fg,'700','Georgia');text(ctx,subtitle.value,W/2,145,18,fg,'400')
  if(images[0]) cover(ctx,images[0],105,205,990,650,8)
  const count=images.length
  const smallW=count===3?480:315, gap=30
  const total=smallW*count+(count-1)*gap
  const sx=(W-total)/2
  images.slice(1).forEach((img,i)=>{cover(ctx,img,sx+i*(smallW+gap),900,smallW,560,8);text(ctx,String(i+2).padStart(2,'0'),sx+i*(smallW+gap)+smallW/2,1490,17,fg,'700')})
  text(ctx,'SPECIAL EDITION',W/2,H-60,18,fg,'700')
}

const layoutMinimal = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => {
  text(ctx,title.value.toUpperCase(),W/2,100,48,'#18181b','400','Arial');text(ctx,subtitle.value,W/2,140,18,'#666','400')
  const gap=30,w=500,h=650,sx=(W-(w*2+gap))/2,sy=220
  images.slice(0,4).forEach((img,i)=>{const x=sx+(i%2)*(w+gap),y=sy+Math.floor(i/2)*(h+gap);cover(ctx,img,x,y,w,h,4);text(ctx,String(i+1).padStart(2,'0'),x+w/2,y+h+20,15,'#555','700')})
  text(ctx,'PHOTOBOOTH',W/2,H-55,16,'#555','700')
}

const layoutCute = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => {
  text(ctx,'♡',W/2,70,55,'#db2777');text(ctx,title.value,W/2,125,52,'#db2777','700','cursive')
  const gap=40,w=500,h=620,sx=(W-(w*2+gap))/2,sy=200
  images.slice(0,4).forEach((img,i)=>{const x=sx+(i%2)*(w+gap),y=sy+Math.floor(i/2)*(h+gap);frame(ctx,img,x,y,w,h,38,'cover')})
  text(ctx,subtitle.value,W/2,H-55,25,'#be185d','700','cursive')
}

const layoutLuxury = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => {
  ctx.fillStyle='#141414';ctx.fillRect(0,0,W,H);text(ctx,title.value.toUpperCase(),W/2,95,50,'#d4af37','700','Georgia');text(ctx,subtitle.value,W/2,140,18,'#fff','400')
  const gap=35,w=515,h=650,sx=(W-(w*2+gap))/2,sy=210
  images.slice(0,4).forEach((img,i)=>{const x=sx+(i%2)*(w+gap),y=sy+Math.floor(i/2)*(h+gap);cover(ctx,img,x,y,w,h,4);ctx.strokeStyle='#d4af37';ctx.lineWidth=5;ctx.strokeRect(x,y,w,h)})
  text(ctx,'✦ SPECIAL MOMENTS ✦',W/2,H-50,18,'#d4af37','700')
}

const layoutDefault = (ctx:CanvasRenderingContext2D,images:HTMLImageElement[],W:number,H:number) => layoutTwoByTwo(ctx,images,W,H)

const generate = async () => {
  if(!canvas.value) return
  loading.value=true;errorMessage.value=''
  try {
    const loaded:HTMLImageElement[]=[]
    // IMPORTANT: use exactly the amount configured by the selected template.
    for(const src of photos.value.slice(0,photoCount.value)) { try { loaded.push(await loadImage(src)) } catch(e){ console.warn(e) } }
    if(loaded.length!==photoCount.value){ throw new Error(`Foto tidak lengkap (${loaded.length}/${photoCount.value})`) }
    await nextTick()
    const ctx=canvas.value.getContext('2d');if(!ctx) throw new Error('Canvas tidak tersedia')
    const W=1200,H=1800;canvas.value.width=W;canvas.value.height=H;ctx.clearRect(0,0,W,H);bg(ctx,W,H)
    const style=template.value.style
    if(['love','kawaii','friends','coquette','flower','letter','y2k','bear','red','ocean','blue','purple','green','diary','wedding','vertical'].includes(style)) layoutTwoByTwo(ctx,loaded,W,H)
    else if(['film','retro'].includes(style)) layoutFilm(ctx,loaded,W,H)
    else if(style==='polaroid') layoutPolaroid(ctx,loaded,W,H)
    else if(['magazine','newspaper','street'].includes(style)) layoutEditorial(ctx,loaded,W,H)
    else if(style==='minimal') layoutMinimal(ctx,loaded,W,H)
    else if(style==='luxury') layoutLuxury(ctx,loaded,W,H)
    else if(style==='cute') layoutCute(ctx,loaded,W,H)
    else layoutDefault(ctx,loaded,W,H)
    resultUrl.value=canvas.value.toDataURL('image/jpeg',0.95)
  } catch(e) { console.error(e);errorMessage.value=e instanceof Error?e.message:'Gagal membuat hasil foto.' }
  finally { loading.value=false }
}

const download = async () => {
  if(!resultUrl.value) return
  try {
    const blob=await (await fetch(resultUrl.value)).blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`photobooth-${title.value.toLowerCase().replace(/\s+/g,'-')}.jpg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
  } catch { window.open(resultUrl.value,'_blank') }
}

const retake=()=>navigateTo(`/camera?template=${template.value.id}`)
const home=()=>navigateTo('/')

onMounted(async()=>{
  try { const saved=localStorage.getItem('photobooth_photos'); const parsed=saved?JSON.parse(saved):[];photos.value=Array.isArray(parsed)?parsed:[] } catch { photos.value=[] }
  if(photos.value.length) await generate(); else loading.value=false
})
</script>

<template>
  <div class="page">
    <header class="header">
      <button class="home-btn" @click="home">← <span>Home</span></button>
      <div class="brand">📸 <span>Photobooth</span></div>
      <div class="template-badge">{{ template.name }} • {{ photoCount }} Photos</div>
    </header>
    <main class="main">
      <section class="heading"><div class="eyebrow">YOUR MEMORIES</div><h1>Your Result</h1><p>{{ subtitle }}</p></section>
      <div v-if="loading" class="state-card"><div class="loader"></div><h2>Membuat hasil foto...</h2><p>Menyesuaikan dengan template {{ template.name }}.</p></div>
      <div v-else-if="errorMessage" class="state-card error"><div class="state-icon">⚠️</div><h2>Hasil belum lengkap</h2><p>{{ errorMessage }}</p><button class="primary-btn" @click="retake">Foto Lagi</button></div>
      <section v-else-if="resultUrl" class="result-section">
        <div class="result-card"><img :src="resultUrl" alt="Hasil Photobooth" class="result-image"></div>
        <div class="actions"><button class="download-btn" @click="download">↓ Download JPG</button><button class="retake-btn" @click="retake">📸 Foto Lagi</button></div>
        <div class="result-info"><div class="check">✓</div><div><strong>{{ template.name }} berhasil dibuat</strong><span>{{ photoCount }} foto • layout mengikuti template yang dipilih</span></div></div>
      </section>
      <section v-else class="state-card"><div class="state-icon">📷</div><h2>Belum ada foto</h2><p>Ambil foto terlebih dahulu.</p><button class="primary-btn" @click="retake">Ambil Foto</button></section>
    </main>
    <canvas ref="canvas" class="hidden-canvas"></canvas>
  </div>
</template>

<style scoped>
*{box-sizing:border-box}.page{min-height:100vh;background:radial-gradient(circle at top left,#fdf2f8,transparent 35%),radial-gradient(circle at bottom right,#f3e8ff,transparent 35%),#fafafa;color:#18181b;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.header{height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 5%;background:rgba(255,255,255,.94);backdrop-filter:blur(18px);border-bottom:1px solid rgba(0,0,0,.06);position:sticky;top:0;z-index:20}.home-btn{border:0;background:none;display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:#52525b;cursor:pointer}.brand{display:flex;align-items:center;gap:8px;font-size:21px;font-weight:900;color:#7c3aed}.template-badge{padding:8px 13px;border-radius:999px;background:#f5f3ff;color:#7c3aed;font-size:12px;font-weight:800}.main{width:92%;max-width:820px;margin:auto;padding:48px 0 90px}.heading{text-align:center;margin-bottom:30px}.eyebrow{color:#7c3aed;font-size:11px;font-weight:900;letter-spacing:4px;margin-bottom:10px}.heading h1{margin:0;font-family:Georgia,serif;font-size:clamp(34px,6vw,52px);line-height:1.05}.heading p{margin:12px auto 0;color:#71717a;font-size:15px}.result-card{width:min(100%,620px);margin:auto;padding:14px;background:#fff;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.15);border:1px solid rgba(0,0,0,.05)}.result-image{width:100%;display:block;border-radius:18px;height:auto}.actions{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px}.actions button,.primary-btn{min-height:56px;border-radius:16px;border:0;font-size:15px;font-weight:850;cursor:pointer}.download-btn{background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff}.retake-btn{background:#fff;color:#3f3f46;border:1px solid #d4d4d8!important}.result-info{margin:18px auto 0;display:flex;align-items:center;gap:12px;width:min(100%,620px);padding:15px 17px;border:1px solid #e4e4e7;border-radius:16px;background:#fff}.result-info .check{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#dcfce7;color:#15803d;font-weight:900}.result-info strong,.result-info span{display:block}.result-info strong{font-size:14px}.result-info span{margin-top:3px;color:#71717a;font-size:12px}.state-card{background:#fff;border:1px solid #e4e4e7;border-radius:24px;padding:70px 25px;text-align:center}.state-card h2{margin:15px 0 6px}.state-card p{color:#71717a}.state-card.error{border-color:#fecaca}.state-icon{font-size:42px}.primary-btn{padding:0 24px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff}.loader{width:42px;height:42px;border:4px solid #e9d5ff;border-top-color:#7c3aed;border-radius:50%;margin:auto;animation:spin .8s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.hidden-canvas{display:none}@media(max-width:600px){.header{padding:0 18px}.template-badge{display:none}.main{width:94%;padding-top:30px}.actions{grid-template-columns:1fr}.result-card{padding:8px;border-radius:20px}.result-image{border-radius:14px}.heading h1{font-size:36px}}
</style>
