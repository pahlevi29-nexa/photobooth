<script setup lang="ts">
import { computed, ref } from 'vue'
import { templates } from '~/data/templates'

const selectedCategory = ref('All')
const currentPage = ref(1)

const perPage = 12

const categories = [
  'All',
  'Couple',
  'Cute',
  'Vintage',
  'Elegant',
  'Aesthetic',
  'Men',
  'Friends',
  'Minimal'
]

const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'All') {
    return templates
  }

  return templates.filter(
    template => template.category === selectedCategory.value
  )
})

const totalPages = computed(() => {
  return Math.ceil(
    filteredTemplates.value.length / perPage
  )
})

const displayedTemplates = computed(() => {
  const start =
    (currentPage.value - 1) * perPage

  return filteredTemplates.value.slice(
    start,
    start + perPage
  )
})

const selectCategory = (category: string) => {
  selectedCategory.value = category
  currentPage.value = 1
}

const selectTemplate = (id: number) => {
  navigateTo(`/camera?template=${id}`)
}
</script>

<template>

  <div class="page">

    <!-- HEADER -->

    <header class="header">

      <div class="brand">
        <div class="brand-icon">
          📸
        </div>

        <div>
          <h1>PhotoBooth</h1>
          <p>Capture your favorite moments</p>
        </div>
      </div>

      <div class="header-right">
        <span>24 Templates</span>
      </div>

    </header>


    <!-- HERO -->

    <section class="hero">

      <div class="hero-content">

        <span class="eyebrow">
          ✦ DIGITAL PHOTOBOOTH
        </span>

        <h2>
          Choose your
          <span>favorite template</span>
        </h2>

        <p>
          Pick a design, take your photos,
          and create memories worth keeping.
        </p>

      </div>

    </section>


    <!-- CATEGORY -->

    <section class="category-wrapper">

      <div class="categories">

        <button
          v-for="category in categories"
          :key="category"
          class="category"
          :class="{
            active:
              selectedCategory === category
          }"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>

      </div>

    </section>


    <!-- TEMPLATE -->

    <main class="content">

      <div class="top-bar">

        <div>
          <h3>
            Choose your template
          </h3>

          <p>
            {{ filteredTemplates.length }}
            templates available
          </p>
        </div>

        <div class="sort">
          ✨ Popular
        </div>

      </div>


      <!-- GRID -->

      <div class="template-grid">

        <article
          v-for="template in displayedTemplates"
          :key="template.id"
          class="template-card"
          @click="selectTemplate(template.id)"
        >

          <!-- PREVIEW -->

          <div
            class="template-image"
            :class="`style-${template.style}`"
            :style="{
              '--primary': template.colors[0],
              '--secondary': template.colors[1]
            }"
          >

            <!-- TOP LABEL -->

            <div class="template-top">

              <span class="template-badge">
                FREE
              </span>

              <span class="photo-count">
                {{ template.photos }} Photos
              </span>

            </div>


            <!-- VISUAL TEMPLATE -->

            <div class="design">

              <!-- LOVE -->

              <template
                v-if="
                  [
                    'love',
                    'coquette',
                    'flower',
                    'letter',
                    'red',
                    'diary',
                    'vertical'
                  ].includes(template.style)
                "
              >

                <div class="design-title">
                  {{ template.name }}
                </div>

                <div class="photo-stack">

                  <div
                    v-for="n in 4"
                    :key="n"
                    class="fake-photo"
                  >
                    <div class="fake-person">
                      ♡
                    </div>
                  </div>

                </div>

                <div class="design-footer">
                  ♡ memories ♡
                </div>

              </template>


              <!-- FILM -->

              <template
                v-else-if="
                  [
                    'film',
                    'retro'
                  ].includes(template.style)
                "
              >

                <div class="film-title">
                  FILM
                </div>

                <div class="film-strip">

                  <div
                    v-for="n in 4"
                    :key="n"
                    class="film-photo"
                  >
                    <span>📷</span>
                  </div>

                </div>

                <div class="film-text">
                  memories / 2026
                </div>

              </template>


              <!-- LUXURY -->

              <template
                v-else-if="
                  template.style === 'luxury'
                "
              >

                <div class="luxury-title">
                  LUXURY
                </div>

                <div class="luxury-grid">

                  <div
                    v-for="n in 4"
                    :key="n"
                  >
                    ♡
                  </div>

                </div>

                <div class="luxury-footer">
                  SPECIAL MOMENTS
                </div>

              </template>


              <!-- MAGAZINE -->

              <template
                v-else-if="
                  [
                    'magazine',
                    'newspaper',
                    'street'
                  ].includes(template.style)
                "
              >

                <div class="magazine-title">
                  VIBE
                </div>

                <div class="magazine-main">
                  PHOTO
                </div>

                <div class="magazine-small">

                  <div>01</div>
                  <div>02</div>
                  <div>03</div>

                </div>

                <div class="magazine-footer">
                  SPECIAL EDITION
                </div>

              </template>


              <!-- BLUE -->

              <template
                v-else-if="
                  [
                    'blue',
                    'ocean'
                  ].includes(template.style)
                "
              >

                <div class="blue-title">
                  GOOD
                  <br>
                  VIBES
                </div>

                <div class="blue-grid">

                  <div
                    v-for="n in 4"
                    :key="n"
                  >
                    ✦
                  </div>

                </div>

              </template>


              <!-- POLAROID -->

              <template
                v-else-if="
                  template.style === 'polaroid'
                "
              >

                <div class="polaroid-title">
                  POLAROID
                </div>

                <div class="polaroids">

                  <div
                    v-for="n in 3"
                    :key="n"
                    class="polaroid"
                  >
                    <div>📷</div>
                  </div>

                </div>

              </template>


              <!-- MINIMAL -->

              <template
                v-else-if="
                  template.style === 'minimal'
                "
              >

                <div class="minimal-title">
                  MEMORIES
                </div>

                <div class="minimal-grid">

                  <div
                    v-for="n in 4"
                    :key="n"
                  >
                    {{ n }}
                  </div>

                </div>

                <div class="minimal-footer">
                  PHOTOBOOTH
                </div>

              </template>


              <!-- DEFAULT -->

              <template v-else>

                <div class="default-title">
                  {{ template.name }}
                </div>

                <div class="default-grid">

                  <div
                    v-for="n in 4"
                    :key="n"
                  >
                    📷
                  </div>

                </div>

              </template>

            </div>


            <!-- HOVER -->

            <div class="hover-overlay">

              <div class="use-button">
                Use Template →
              </div>

            </div>

          </div>


          <!-- INFO -->

          <div class="template-info">

            <div>

              <h4>
                {{ template.name }}
              </h4>

              <p>
                {{ template.category }}
              </p>

            </div>

            <span class="arrow">
              →
            </span>

          </div>

        </article>

      </div>


      <!-- PAGINATION -->

      <div
        v-if="totalPages > 1"
        class="pagination"
      >

        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ←
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          :class="{
            active: currentPage === page
          }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>

        <button
          :disabled="
            currentPage === totalPages
          "
          @click="currentPage++"
        >
          →
        </button>

      </div>

    </main>


    <!-- FOOTER -->

    <footer>

      <strong>
        📸 PhotoBooth
      </strong>

      <span>
        Make memories. Keep them forever.
      </span>

    </footer>

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

  color: #18181b;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}


/* HEADER */

.header {
  height: 78px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 5%;

  background: rgba(255,255,255,.92);

  border-bottom:
    1px solid #e4e4e7;

  position: sticky;
  top: 0;

  z-index: 20;

  backdrop-filter:
    blur(15px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 43px;
  height: 43px;

  display: grid;
  place-items: center;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      #7c3aed,
      #c026d3
    );

  color: white;

  font-size: 21px;
}

.brand h1 {
  margin: 0;

  font-size: 20px;
  font-weight: 800;
}

.brand p {
  margin: 2px 0 0;

  color: #71717a;

  font-size: 12px;
}

.header-right {
  color: #71717a;

  font-size: 13px;

  font-weight: 600;
}


/* HERO */

.hero {
  padding: 70px 20px 45px;

  text-align: center;

  background:
    radial-gradient(
      circle at 50% 0%,
      #f3e8ff,
      transparent 55%
    );
}

.hero-content {
  max-width: 700px;

  margin: auto;
}

.eyebrow {
  display: inline-block;

  margin-bottom: 15px;

  color: #7c3aed;

  font-size: 12px;
  font-weight: 800;

  letter-spacing: 2px;
}

.hero h2 {
  margin: 0;

  font-size:
    clamp(36px, 5vw, 62px);

  line-height: 1.05;

  letter-spacing: -2px;

  font-weight: 900;
}

.hero h2 span {
  display: block;

  background:
    linear-gradient(
      90deg,
      #7c3aed,
      #c026d3,
      #ec4899
    );

  -webkit-background-clip: text;
  background-clip: text;

  -webkit-text-fill-color: transparent;
}

.hero p {
  max-width: 520px;

  margin: 20px auto 0;

  color: #71717a;

  font-size: 16px;

  line-height: 1.6;
}


/* CATEGORY */

.category-wrapper {
  width: 90%;

  max-width: 1250px;

  margin: auto;
}

.categories {
  display: flex;

  gap: 8px;

  padding: 5px;

  overflow-x: auto;

  scrollbar-width: none;

  border-bottom:
    1px solid #e4e4e7;
}

.categories::-webkit-scrollbar {
  display: none;
}

.category {
  flex-shrink: 0;

  padding: 10px 18px;

  border-radius: 999px;

  background: transparent;

  color: #71717a;

  font-weight: 600;

  transition: .2s;
}

.category:hover {
  color: #7c3aed;

  background: #f5f3ff;
}

.category.active {
  background: #7c3aed;

  color: white;

  box-shadow:
    0 5px 15px
    rgba(124,58,237,.25);
}


/* CONTENT */

.content {
  width: 90%;

  max-width: 1250px;

  margin: auto;

  padding: 35px 0 70px;
}

.top-bar {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 20px;
}

.top-bar h3 {
  margin: 0;

  font-size: 20px;
}

.top-bar p {
  margin: 4px 0 0;

  color: #a1a1aa;

  font-size: 13px;
}

.sort {
  padding: 9px 14px;

  border:
    1px solid #e4e4e7;

  border-radius: 10px;

  background: white;

  color: #52525b;

  font-size: 13px;

  font-weight: 600;
}


/* GRID */

.template-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 22px 16px;
}


/* CARD */

.template-card {
  cursor: pointer;

  min-width: 0;
}

.template-card:hover
.template-image {
  transform:
    translateY(-5px);

  box-shadow:
    0 18px 35px
    rgba(0,0,0,.14);
}

.template-card:hover
.hover-overlay {
  opacity: 1;
}

.template-image {
  position: relative;

  aspect-ratio: 0.72;

  overflow: hidden;

  border-radius: 13px;

  border:
    2px solid #a855f7;

  background:
    var(--primary);

  transition: .25s;

  box-shadow:
    0 5px 15px
    rgba(0,0,0,.08);
}


/* TOP */

.template-top {
  position: absolute;

  top: 9px;
  left: 9px;
  right: 9px;

  display: flex;

  justify-content:
    space-between;

  z-index: 5;
}

.template-badge {
  padding: 3px 7px;

  border-radius: 5px;

  background: #7c3aed;

  color: white;

  font-size: 8px;

  font-weight: 900;
}

.photo-count {
  padding: 3px 7px;

  border-radius: 5px;

  background:
    rgba(255,255,255,.85);

  color: #52525b;

  font-size: 8px;

  font-weight: 700;
}


/* DESIGN */

.design {
  position: absolute;

  inset: 0;

  padding: 32px 15px 15px;

  display: flex;

  flex-direction: column;

  align-items: center;

  text-align: center;
}


/* LOVE */

.style-love {
  background:
    linear-gradient(
      145deg,
      #ffe4ec,
      #fff7fa
    );
}

.style-coquette {
  background:
    radial-gradient(
      circle,
      #fda4af 1px,
      transparent 1px
    ),
    #fff1f2;

  background-size: 14px 14px;
}

.design-title {
  color: #be185d;

  font-family: Georgia, serif;

  font-size: 19px;

  font-weight: 800;

  margin-bottom: 10px;
}

.photo-stack {
  width: 90%;

  flex: 1;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 7px;
}

.fake-photo {
  position: relative;

  overflow: hidden;

  border-radius: 5px;

  background:
    linear-gradient(
      145deg,
      #f9a8d4,
      #fbcfe8
    );

  border:
    2px solid white;

  box-shadow:
    0 3px 8px
    rgba(0,0,0,.1);
}

.fake-photo:nth-child(2) {
  transform: rotate(2deg);
}

.fake-photo:nth-child(3) {
  transform: rotate(-2deg);
}

.fake-person {
  height: 100%;

  display: grid;

  place-items: center;

  font-size: 25px;

  color: rgba(190,24,93,.5);
}

.design-footer {
  color: #be185d;

  font-size: 10px;

  margin-top: 10px;
}


/* FILM */

.style-film,
.style-retro {
  background:
    #292524;

  color: white;
}

.film-title {
  font-family: Georgia, serif;

  font-size: 22px;

  letter-spacing: 4px;

  margin-bottom: 10px;
}

.film-strip {
  width: 90%;

  flex: 1;

  padding: 5px;

  background: #111;

  display: flex;

  flex-direction: column;

  gap: 5px;
}

.film-photo {
  flex: 1;

  display: grid;

  place-items: center;

  background:
    linear-gradient(
      135deg,
      #a8a29e,
      #57534e
    );

  font-size: 20px;
}

.film-text {
  margin-top: 8px;

  font-size: 8px;

  letter-spacing: 2px;
}


/* LUXURY */

.style-luxury {
  background:
    linear-gradient(
      145deg,
      #09090b,
      #27272a
    );

  color: #d4af37;
}

.luxury-title {
  font-family: Georgia, serif;

  font-size: 22px;

  letter-spacing: 5px;

  margin-bottom: 15px;
}

.luxury-grid {
  flex: 1;

  width: 88%;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 7px;
}

.luxury-grid div {
  display: grid;

  place-items: center;

  border:
    1px solid #d4af37;

  color: #d4af37;

  font-size: 18px;

  background:
    #18181b;
}

.luxury-footer {
  margin-top: 10px;

  font-size: 8px;

  letter-spacing: 3px;
}


/* MAGAZINE */

.style-magazine,
.style-newspaper,
.style-street {
  background: #f4f4f5;

  color: #18181b;
}

.magazine-title {
  font-size: 32px;

  font-weight: 1000;

  letter-spacing: -2px;
}

.magazine-main {
  width: 90%;

  flex: 1;

  margin: 10px;

  display: grid;

  place-items: center;

  background:
    linear-gradient(
      135deg,
      #d4d4d8,
      #71717a
    );

  color: white;

  font-size: 18px;

  font-weight: 900;
}

.magazine-small {
  width: 90%;

  display: grid;

  grid-template-columns:
    repeat(3,1fr);

  gap: 5px;
}

.magazine-small div {
  height: 45px;

  display: grid;

  place-items: center;

  background: #e4e4e7;

  font-size: 10px;

  font-weight: 800;
}

.magazine-footer {
  margin-top: 8px;

  font-size: 8px;

  letter-spacing: 2px;
}


/* BLUE */

.style-blue,
.style-ocean {
  background:
    linear-gradient(
      150deg,
      #dbeafe,
      #bfdbfe
    );
}

.blue-title {
  align-self: flex-start;

  color: #1e3a8a;

  font-size: 24px;

  font-weight: 1000;

  text-align: left;

  line-height: .9;
}

.blue-grid {
  flex: 1;

  width: 90%;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 7px;

  margin-top: 15px;
}

.blue-grid div {
  display: grid;

  place-items: center;

  background:
    #93c5fd;

  border-radius: 8px;

  color: #1e3a8a;

  font-size: 20px;
}


/* POLAROID */

.style-polaroid {
  background: #d4d4d8;
}

.polaroid-title {
  font-family: Georgia, serif;

  font-size: 18px;

  margin-bottom: 10px;
}

.polaroids {
  flex: 1;

  width: 90%;

  display: flex;

  flex-direction: column;

  gap: 7px;
}

.polaroid {
  flex: 1;

  padding: 5px 5px 14px;

  background: white;

  box-shadow:
    0 4px 10px
    rgba(0,0,0,.12);

  transform: rotate(-2deg);

  display: grid;

  place-items: center;
}

.polaroid:nth-child(2) {
  transform: rotate(2deg);
}

.polaroid div {
  width: 100%;
  height: 100%;

  display: grid;

  place-items: center;

  background: #d4d4d8;
}


/* MINIMAL */

.style-minimal {
  background: white;

  color: #171717;
}

.minimal-title {
  font-size: 25px;

  font-weight: 900;

  letter-spacing: 4px;

  margin-bottom: 15px;
}

.minimal-grid {
  flex: 1;

  width: 90%;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 8px;
}

.minimal-grid div {
  display: grid;

  place-items: center;

  border:
    1px solid #d4d4d8;

  color: #a1a1aa;

  font-size: 10px;
}

.minimal-footer {
  margin-top: 10px;

  font-size: 8px;

  letter-spacing: 3px;
}


/* DEFAULT */

.default-title {
  font-weight: 900;

  font-size: 18px;

  margin-bottom: 15px;
}

.default-grid {
  flex: 1;

  width: 90%;

  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 7px;
}

.default-grid div {
  display: grid;

  place-items: center;

  background:
    var(--secondary);

  color: white;

  border-radius: 7px;
}


/* HOVER */

.hover-overlay {
  position: absolute;

  inset: 0;

  display: grid;

  place-items: center;

  background:
    rgba(124,58,237,.18);

  backdrop-filter:
    blur(2px);

  opacity: 0;

  transition: .2s;

  z-index: 10;
}

.use-button {
  padding: 10px 15px;

  border-radius: 10px;

  background: white;

  color: #7c3aed;

  font-size: 12px;

  font-weight: 800;

  box-shadow:
    0 8px 20px
    rgba(0,0,0,.15);
}


/* INFO */

.template-info {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 10px 3px;
}

.template-info h4 {
  margin: 0;

  font-size: 14px;

  font-weight: 800;
}

.template-info p {
  margin: 3px 0 0;

  color: #a1a1aa;

  font-size: 11px;
}

.arrow {
  width: 27px;
  height: 27px;

  display: grid;
  place-items: center;

  border-radius: 50%;

  background: #f4f4f5;

  color: #71717a;

  transition: .2s;
}

.template-card:hover .arrow {
  background: #7c3aed;

  color: white;
}


/* PAGINATION */

.pagination {
  display: flex;

  justify-content: center;

  gap: 6px;

  margin-top: 45px;
}

.pagination button {
  width: 36px;
  height: 36px;

  border:
    1px solid #e4e4e7;

  border-radius: 9px;

  background: white;

  color: #52525b;

  font-weight: 700;
}

.pagination button:hover:not(:disabled) {
  border-color: #a855f7;

  color: #7c3aed;
}

.pagination button.active {
  background: #7c3aed;

  color: white;

  border-color: #7c3aed;
}

.pagination button:disabled {
  opacity: .35;

  cursor: not-allowed;
}


/* FOOTER */

footer {
  padding: 35px 20px;

  border-top:
    1px solid #e4e4e7;

  display: flex;

  justify-content: center;

  gap: 12px;

  color: #71717a;

  font-size: 12px;
}

footer strong {
  color: #18181b;
}


/* RESPONSIVE */

@media (max-width: 950px) {

  .template-grid {
    grid-template-columns:
      repeat(3, 1fr);
  }

}

@media (max-width: 700px) {

  .header {
    height: 68px;

    padding: 0 4%;
  }

  .header-right {
    display: none;
  }

  .hero {
    padding:
      50px 20px 30px;
  }

  .template-grid {
    grid-template-columns:
      repeat(2, 1fr);

    gap: 16px 10px;
  }

  .content,
  .category-wrapper {
    width: 94%;
  }

  .top-bar {
    align-items: flex-start;
  }

}

@media (max-width: 400px) {

  .template-grid {
    gap: 12px 8px;
  }

  .template-info h4 {
    font-size: 12px;
  }

  .template-info p {
    font-size: 10px;
  }

}

</style>