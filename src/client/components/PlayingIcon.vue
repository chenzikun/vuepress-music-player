<template>
  <svg
    class="vmp-icon vmp-equalizer"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path class="vmp-bar vmp-bar-1" d="M505.735529 247.205647c13.432471 0 24.515765 10.059294 26.142118 23.070118l0.210824 3.312941V730.352941a26.352941 26.352941 0 0 1-52.525177 3.312941l-0.180706-3.312941V273.558588c0-14.546824 11.776-26.352941 26.352941-26.352941z" />
    <path class="vmp-bar vmp-bar-2" d="M663.853176 124.235294c13.432471 0 24.515765 10.059294 26.142118 23.04l0.210824 3.312941v702.735059a26.352941 26.352941 0 0 1-52.525177 3.312941l-0.180706-3.312941V150.588235c0-14.546824 11.776-26.352941 26.352941-26.352941z" />
    <path class="vmp-bar vmp-bar-3" d="M189.500235 247.205647c13.432471 0 24.515765 10.059294 26.142118 23.070118l0.210823 3.312941V730.352941a26.352941 26.352941 0 0 1-52.525176 3.312941l-0.180706-3.312941V273.558588c0-14.546824 11.776-26.352941 26.352941-26.352941z" />
    <path class="vmp-bar vmp-bar-4" d="M821.970824 317.500235c13.432471 0 24.515765 10.029176 26.142117 23.04l0.210824 3.312941v316.235295a26.352941 26.352941 0 0 1-52.525177 3.312941l-0.180706-3.312941v-316.235295c0-14.576941 11.776-26.352941 26.352942-26.352941z" />
    <path class="vmp-bar vmp-bar-5" d="M347.617882 370.206118c13.432471 0 24.515765 10.029176 26.142118 23.04l0.210824 3.312941v210.823529a26.352941 26.352941 0 0 1-52.525177 3.312941l-0.180706-3.312941v-210.823529c0-14.576941 11.776-26.352941 26.352941-26.352941z" />
  </svg>
</template>

<script setup lang="ts">
</script>

<style scoped>
.vmp-icon {
  display: block;
  width: 1.15rem;
  height: 1.15rem;
  color: inherit;
}

.vmp-bar {
  fill: currentColor;
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: vmp-bar-dance 0.85s ease-in-out infinite;
}

.vmp-bar-1 {
  animation-delay: 0s;
  animation-duration: 0.75s;
}

.vmp-bar-2 {
  animation-delay: 0.12s;
  animation-duration: 0.95s;
}

.vmp-bar-3 {
  animation-delay: 0.24s;
  animation-duration: 0.8s;
}

.vmp-bar-4 {
  animation-delay: 0.08s;
  animation-duration: 1.05s;
}

.vmp-bar-5 {
  animation-delay: 0.18s;
  animation-duration: 0.88s;
}

@keyframes vmp-bar-dance {
  0%, 100% {
    transform: scaleY(0.35);
  }

  50% {
    transform: scaleY(1);
  }
}
</style>
