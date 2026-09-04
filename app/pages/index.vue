<template>
  <div class="home">
    <div class="overlay"></div>

    <main class="content">
      <div class="camera-icon">
        📸
      </div>

      <p class="subtitle">
        CAPTURE YOUR MOMENTS
      </p>

      <h1>
        PHOTO<span>BOOTH</span>
      </h1>

      <p class="description">
        Abadikan momen terbaikmu dengan cara yang lebih menyenangkan.
      </p>

      <NuxtLink to="/photobooth" class="start-button">
        Mulai Photobooth
        <span>→</span>
      </NuxtLink>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.home {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, #4c1d95, transparent 35%),
    radial-gradient(circle at bottom right, #be185d, transparent 35%),
    #09090b;
  color: white;
}

.overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      135deg,
      rgba(255,255,255,0.03),
      transparent
    );
}

.content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 30px;
  max-width: 800px;
}

.camera-icon {
  width: 90px;
  height: 90px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(20px);
  font-size: 42px;
  border: 1px solid rgba(255,255,255,0.15);
}

.subtitle {
  font-size: 13px;
  letter-spacing: 5px;
  color: #d8b4fe;
  margin-bottom: 15px;
}

h1 {
  margin: 0;
  font-size: clamp(55px, 10vw, 110px);
  font-weight: 900;
  letter-spacing: -5px;
  line-height: 0.9;
}

h1 span {
  display: block;
  background: linear-gradient(90deg, #f9a8d4, #c4b5fd);
  -webkit-background-clip: text;
  color: transparent;
}

.description {
  margin: 30px auto;
  max-width: 500px;
  color: #a1a1aa;
  font-size: 17px;
  line-height: 1.7;
}

.start-button {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  padding: 17px 28px;
  border-radius: 999px;
  background: white;
  color: #18181b;
  text-decoration: none;
  font-weight: 700;
  transition: 0.3s;
}

.start-button span {
  font-size: 22px;
}

.start-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(255,255,255,0.15);
}
</style>