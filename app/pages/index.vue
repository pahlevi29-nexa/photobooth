<template>
  <main class="home">

    <div class="glow glow-one"></div>
    <div class="glow glow-two"></div>

    <nav>
      <div class="brand">
        <span>📸</span>
        PHOTOBOOTH
      </div>

      <div class="nav-text">
        CAPTURE THE MOMENT
      </div>
    </nav>

    <section class="hero">

      <div class="badge">
        ✨ YOUR MOMENT, YOUR STORY
      </div>

      <h1>
        Create Your
        <span>Perfect Moment.</span>
      </h1>

      <p>
        Ambil foto, pilih template favoritmu,
        dan abadikan momen dalam satu frame yang indah.
      </p>

      <NuxtLink
        to="/photobooth"
        class="start"
      >
        <span>Mulai Photobooth</span>
        <b>→</b>
      </NuxtLink>

      <div class="features">

        <div>
          <strong>12+</strong>
          <small>Templates</small>
        </div>

        <div>
          <strong>4</strong>
          <small>Photos</small>
        </div>

        <div>
          <strong>HD</strong>
          <small>Download</small>
        </div>

      </div>

    </section>

  </main>
</template>

<style scoped>

* {
  box-sizing: border-box;
}

.home {
  min-height: 100vh;
  overflow: hidden;
  position: relative;

  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(236, 72, 153, .20),
      transparent 35%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(139, 92, 246, .20),
      transparent 35%
    ),
    #09090b;

  color: white;
}

.glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.glow-one {
  background: #ec4899;
  opacity: .12;
  top: -200px;
  left: -100px;
}

.glow-two {
  background: #8b5cf6;
  opacity: .12;
  right: -150px;
  bottom: -150px;
}

nav {
  position: relative;
  z-index: 5;

  max-width: 1200px;
  margin: auto;
  padding: 28px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-weight: 900;
  letter-spacing: 2px;
  font-size: 17px;
}

.brand span {
  margin-right: 8px;
}

.nav-text {
  font-size: 11px;
  letter-spacing: 3px;
  color: #71717a;
}

.hero {
  position: relative;
  z-index: 2;

  min-height: calc(100vh - 90px);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 40px 25px 100px;
}

.badge {
  padding: 9px 16px;

  border: 1px solid rgba(255,255,255,.12);

  background: rgba(255,255,255,.04);

  border-radius: 999px;

  color: #f9a8d4;

  font-size: 10px;

  letter-spacing: 3px;

  margin-bottom: 30px;
}

h1 {
  max-width: 900px;

  margin: 0;

  font-size: clamp(55px, 9vw, 105px);

  line-height: .92;

  letter-spacing: -6px;

  font-weight: 900;
}

h1 span {
  display: block;

  background: linear-gradient(
    90deg,
    #f9a8d4,
    #c4b5fd
  );

  -webkit-background-clip: text;
  background-clip: text;

  -webkit-text-fill-color: transparent;

  color: transparent;
}

.hero p {
  max-width: 570px;

  margin: 30px 0;

  color: #a1a1aa;

  line-height: 1.8;

  font-size: 16px;
}

.start {
  display: inline-flex;

  align-items: center;

  gap: 20px;

  padding: 17px 24px 17px 28px;

  border-radius: 999px;

  color: #18181b;

  background: white;

  text-decoration: none;

  font-weight: 800;

  transition: .3s;
}

.start b {
  display: flex;

  align-items: center;
  justify-content: center;

  width: 34px;
  height: 34px;

  border-radius: 50%;

  background: #18181b;

  color: white;

  font-size: 20px;
}

.start:hover {
  transform: translateY(-4px);

  box-shadow:
    0 20px 60px rgba(255,255,255,.15);
}

.features {
  display: flex;

  gap: 45px;

  margin-top: 65px;
}

.features div {
  display: flex;

  flex-direction: column;

  gap: 5px;
}

.features strong {
  font-size: 22px;
}

.features small {
  color: #71717a;

  font-size: 10px;

  letter-spacing: 2px;

  text-transform: uppercase;
}

@media (max-width: 600px) {

  nav {
    padding: 20px;
  }

  .nav-text {
    display: none;
  }

  h1 {
    letter-spacing: -3px;
  }

  .hero p {
    font-size: 14px;
  }

  .features {
    gap: 25px;
  }

}

</style>