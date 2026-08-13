<template>
  <div
    v-if="enabled"
    ref="rootRef"
    class="vmp-navbar-player"
    :class="{ 'is-hover': isHover, 'is-playing': isPlaying, 'is-inserted': isInserted }"
    :style="fallbackStyle"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <button
      type="button"
      class="vmp-trigger"
      :aria-label="isPlaying ? '音乐播放中' : '音乐已暂停'"
      @click="togglePlay"
    >
      <PlayingIcon v-if="isPlaying" />
      <SvgImgIcon v-else name="icon" class="vmp-idle-icon" />
    </button>

    <div class="vmp-controls" role="toolbar" aria-label="音乐控制">
      <button type="button" class="vmp-btn" aria-label="上一首" @click.stop="playPrev">
        <SvgImgIcon name="last" />
      </button>

      <button type="button" class="vmp-btn vmp-btn-main" :aria-label="isPlaying ? '暂停' : '播放'" @click.stop="togglePlay">
        <SvgImgIcon :name="isPlaying ? 'stop' : 'play'" />
      </button>

      <button type="button" class="vmp-btn" aria-label="下一首" @click.stop="playNext">
        <SvgImgIcon name="next" />
      </button>

      <span class="vmp-divider" aria-hidden="true" />

      <button type="button" class="vmp-btn vmp-btn-info" aria-label="当前歌曲" :title="currentTitle" @click.stop="togglePlay">
        <img
          v-if="currentCover"
          class="vmp-cover-thumb"
          :src="currentCover"
          :alt="currentTitle"
        >
        <SvgImgIcon v-else name="icon" />
      </button>
    </div>

    <audio
      ref="audioRef"
      :src="currentMusic.link"
      preload="auto"
      @canplay="onAudioCanPlay"
      @timeupdate="onTimeUpdate"
      @ended="onAudioEnded"
      @play="onAudioPlay"
      @pause="onAudioPause"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePageData, usePageFrontmatter } from 'vuepress/client'
import PlayingIcon from './components/PlayingIcon.vue'
import SvgImgIcon from './components/SvgImgIcon.vue'
import { pluginConfig } from './config'
import { resolvePageMusic } from './pageMusic'

interface MusicItem {
  title: string
  link: string
  cover?: string
}

interface PageMusicConfig {
  hasPageMusic: boolean
  autoplay: boolean | null
  list: MusicItem[]
}

interface PageData {
  musicPlayer?: PageMusicConfig
}

const CONFIG = pluginConfig
const enabled = CONFIG.enabled
const globalAutoplay = CONFIG.autoplay
const globalMusicList = CONFIG.musicList || []
const navbarConfig = CONFIG.navbar || { insertIntoNav: true, fallbackRight: '7.5rem' }

const route = useRoute()
const pageData = usePageData<PageData>()
const frontmatter = usePageFrontmatter<Record<string, unknown>>()

const rootRef = ref<HTMLElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const musicList = ref<MusicItem[]>([])
const currentIndex = ref(0)
const isPlaying = ref(false)
const isHover = ref(false)
const isInserted = ref(false)
const pageAutoplay = ref<boolean | null>(null)
const pendingPlay = ref(false)
const isSwitchingTrack = ref(false)
const awaitingGestureUnlock = ref(false)

const GESTURE_EVENTS = ['click', 'keydown', 'touchstart', 'wheel', 'scroll'] as const
const gestureListenerOptions: Record<typeof GESTURE_EVENTS[number], AddEventListenerOptions | boolean> = {
  click: true,
  keydown: true,
  touchstart: { passive: true },
  wheel: { passive: true },
  scroll: { passive: true, capture: true }
}
let gestureListenersAttached = false

const currentMusic = computed(() => musicList.value[currentIndex.value] || { title: '', link: '' })
const currentTitle = computed(() => currentMusic.value.title || '未命名歌曲')
const currentCover = computed(() => currentMusic.value.cover || '')
const fallbackStyle = computed(() => {
  if (isInserted.value) return null
  return { right: navbarConfig.fallbackRight || '7.5rem' }
})

function shouldAutoplay(): boolean {
  if (typeof pageAutoplay.value === 'boolean') return pageAutoplay.value
  return globalAutoplay
}

function applyPlaylist(resetProgress: boolean) {
  const pageMusic = resolvePageMusic(frontmatter.value, pageData.value?.musicPlayer)
  const usePageList = pageMusic.hasPageMusic && pageMusic.list.length > 0

  musicList.value = usePageList ? pageMusic.list : globalMusicList
  pageAutoplay.value = usePageList ? pageMusic.autoplay : null

  if (resetProgress) {
    currentIndex.value = 0
    pausePlayback()
    if (shouldAutoplay()) {
      requestPlay()
    }
  }
}

function requestPlay() {
  pendingPlay.value = true
  isPlaying.value = true
  schedulePlay()
}

function schedulePlay(attempt = 0) {
  if (typeof window === 'undefined') return
  if (!pendingPlay.value) return

  nextTick(() => {
    const audio = audioRef.value
    if (!audio || !currentMusic.value.link) {
      if (attempt < 20) {
        window.setTimeout(() => schedulePlay(attempt + 1), 50)
      }
      return
    }

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      void tryStartPlayback()
    }
  })
}

function onAudioCanPlay(event: Event) {
  if ((event.target as HTMLAudioElement) !== audioRef.value) return
  if (pendingPlay.value) {
    void tryStartPlayback()
  }
}

function onAudioPlay(event: Event) {
  if ((event.target as HTMLAudioElement) !== audioRef.value) return
  isPlaying.value = true
  pendingPlay.value = false
  isSwitchingTrack.value = false
}

function onAudioPause(event: Event) {
  if ((event.target as HTMLAudioElement) !== audioRef.value) return
  if (isSwitchingTrack.value || pendingPlay.value) return
  isPlaying.value = false
}

function onAudioEnded() {
  playNext(true)
}

function removeGestureUnlockListeners() {
  if (typeof document === 'undefined') return
  for (const event of GESTURE_EVENTS) {
    document.removeEventListener(event, onUserGesture, gestureListenerOptions[event])
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onUserGesture, gestureListenerOptions.scroll)
    window.removeEventListener('wheel', onUserGesture, gestureListenerOptions.wheel)
  }
  gestureListenersAttached = false
}

function attachGestureUnlockListeners() {
  if (typeof document === 'undefined' || gestureListenersAttached) return
  gestureListenersAttached = true
  for (const event of GESTURE_EVENTS) {
    if (event === 'scroll' || event === 'wheel') continue
    document.addEventListener(event, onUserGesture, gestureListenerOptions[event])
  }
  window.addEventListener('scroll', onUserGesture, gestureListenerOptions.scroll)
  window.addEventListener('wheel', onUserGesture, gestureListenerOptions.wheel)
}

function onUserGesture() {
  if (!awaitingGestureUnlock.value && !pendingPlay.value) return
  if (isPlaying.value) {
    removeGestureUnlockListeners()
    return
  }

  pendingPlay.value = true
  isPlaying.value = true
  void tryStartPlayback()
}

async function tryStartPlayback() {
  const audio = audioRef.value
  if (!audio || !currentMusic.value.link) return

  try {
    await audio.play()
    awaitingGestureUnlock.value = false
    removeGestureUnlockListeners()
  } catch {
    if (!isSwitchingTrack.value) {
      isPlaying.value = false
      if (pendingPlay.value) {
        awaitingGestureUnlock.value = true
        attachGestureUnlockListeners()
      } else {
        awaitingGestureUnlock.value = false
      }
    }
  }
}

function syncPlaylistWithRoute() {
  const routePath = route?.path
  if (!routePath) return

  const pagePath = pageData.value?.path
  // pageData 未就绪时仍应用全局列表；就绪后需与 route 对齐再切换页面列表
  if (pagePath && pagePath !== routePath) return
  applyPlaylist(true)
}

function findNavbarContainer(): HTMLElement | null {
  return document.querySelector('.vp-navbar .content-body')
    || document.querySelector('.vp-navbar .content')
    || document.querySelector('.nav-links')
    || document.querySelector('.navbar .links')
}

function findNavbarAnchor(container: HTMLElement): Element | null {
  return container.querySelector('.social-links, .vp-navbar-social-links, .extra, .vp-navbar-extra')
}

function isHiddenNavbarHost(element: Element | null): boolean {
  if (!element) return true
  return Boolean(
    element.closest('.vp-navbar-extra')
    || element.closest('.vp-flyout')
  )
}

function insertIntoNavbar() {
  if (typeof window === 'undefined') return
  if (!navbarConfig.insertIntoNav) return
  const root = rootRef.value
  if (!root) return

  const container = findNavbarContainer()
  if (!container) {
    isInserted.value = false
    return
  }

  if (container.contains(root) && !isHiddenNavbarHost(root.parentElement)) {
    isInserted.value = true
    return
  }

  if (isHiddenNavbarHost(root.parentElement)) {
    root.remove()
  }

  const anchor = findNavbarAnchor(container)
  if (anchor) {
    container.insertBefore(root, anchor)
  } else {
    container.appendChild(root)
  }

  isInserted.value = true
}

function scheduleNavbarInsert(attempt = 0) {
  if (typeof window === 'undefined') return
  insertIntoNavbar()
  if (!isInserted.value && attempt < 30) {
    window.setTimeout(() => scheduleNavbarInsert(attempt + 1), 100)
  }
}

function togglePlay() {
  if (isPlaying.value) {
    pausePlayback()
  } else {
    startPlayback()
  }
}

function startPlayback() {
  requestPlay()
}

function pausePlayback() {
  pendingPlay.value = false
  awaitingGestureUnlock.value = false
  isSwitchingTrack.value = false
  const audio = audioRef.value
  if (audio) audio.pause()
  isPlaying.value = false
  removeGestureUnlockListeners()
}

function switchTrack(nextIndex: number, shouldContinue: boolean) {
  isSwitchingTrack.value = true
  currentIndex.value = nextIndex
  if (shouldContinue) {
    pendingPlay.value = true
    isPlaying.value = true
    nextTick(() => {
      const audio = audioRef.value
      if (audio && currentMusic.value.link) {
        audio.load()
      }
      schedulePlay()
    })
  } else {
    isSwitchingTrack.value = false
  }
}

function playPrev() {
  if (!musicList.value.length) return
  const nextIndex = currentIndex.value === 0
    ? musicList.value.length - 1
    : currentIndex.value - 1
  switchTrack(nextIndex, true)
}

function playNext(_fromEnded = false) {
  if (!musicList.value.length) return
  const nextIndex = (currentIndex.value + 1) % musicList.value.length
  switchTrack(nextIndex, true)
}

function onTimeUpdate(event: Event) {
  const target = event.target as HTMLAudioElement
  const { duration, currentTime } = target
  if (!duration) return
}

watch(
  () => ({
    routePath: route?.path,
    pagePath: pageData.value?.path,
    musicPlayer: pageData.value?.musicPlayer,
    music: frontmatter.value?.music
  }),
  () => {
    syncPlaylistWithRoute()
  },
  { deep: true, immediate: true }
)

watch(() => route?.path, () => {
  nextTick(() => scheduleNavbarInsert())
})

onMounted(() => {
  nextTick(() => {
    scheduleNavbarInsert()
    const routePath = route?.path
    const pagePath = pageData.value?.path
    if (pagePath && routePath && pagePath !== routePath) return
    if (!musicList.value.length) {
      applyPlaylist(false)
    }
    if (shouldAutoplay()) {
      attachGestureUnlockListeners()
      if (!isPlaying.value) {
        requestPlay()
      }
    }
  })
})

onBeforeUnmount(() => {
  removeGestureUnlockListeners()
  pausePlayback()
})
</script>

<style scoped>
.vmp-navbar-player {
  position: fixed;
  top: 0.6rem;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  height: 2.4rem;
  color: #707070;
  user-select: none;
}

.vmp-navbar-player.is-inserted {
  position: relative;
  top: auto;
  right: auto !important;
  margin: 0;
  height: auto;
  flex-shrink: 0;
}

/* 插入后替代 Plume 的 .appearance + .social-links::before 相邻选择器 */
.vmp-navbar-player.is-inserted::before,
.vmp-navbar-player.is-inserted::after {
  width: 1px;
  height: 24px;
  flex-shrink: 0;
  content: "";
  background-color: var(--vp-c-divider, rgba(127, 127, 127, 0.25));
  transition: background-color 0.25s ease;
}

.vmp-navbar-player.is-inserted::before {
  margin-right: 8px;
  margin-left: 16px;
}

.vmp-navbar-player.is-inserted::after {
  margin-right: 8px;
  margin-left: 8px;
}

.vmp-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: inherit;
  transition: color 0.2s ease;
}

.vmp-trigger:hover,
.vmp-navbar-player.is-hover .vmp-trigger {
  color: #333;
}

.vmp-icon {
  width: 1.15rem;
  height: 1.15rem;
  fill: currentColor;
}

.vmp-idle-icon {
  opacity: 0.75;
}

.vmp-controls {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  pointer-events: none;
  transition: max-width 0.25s ease, opacity 0.2s ease, margin 0.25s ease;
}

.vmp-navbar-player.is-hover .vmp-controls {
  max-width: 12rem;
  opacity: 1;
  margin-left: 0.25rem;
  pointer-events: auto;
}

.vmp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  color: #bfbfbf;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.vmp-btn :deep(.vmp-icon) {
  width: 0.95rem;
  height: 0.95rem;
}

.vmp-btn:hover {
  color: #707070;
  background-color: rgba(127, 127, 127, 0.08);
}

.vmp-btn-main :deep(.vmp-icon) {
  width: 1rem;
  height: 1rem;
}

.vmp-cover-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 2px;
  object-fit: cover;
}

.vmp-divider {
  width: 1px;
  height: 1rem;
  margin: 0 0.15rem;
  background: rgba(127, 127, 127, 0.25);
}

.dark .vmp-navbar-player,
html.dark .vmp-navbar-player,
body.dark .vmp-navbar-player {
  color: #aaa;
}

.dark .vmp-btn,
html.dark .vmp-btn,
body.dark .vmp-btn {
  color: #888;
}

.dark .vmp-btn:hover,
html.dark .vmp-btn:hover,
body.dark .vmp-btn:hover {
  color: #ddd;
  background-color: rgba(255, 255, 255, 0.06);
}
</style>
