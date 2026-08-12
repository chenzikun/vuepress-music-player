<template>
  <img :src="src" class="vmp-icon" alt="" aria-hidden="true">
</template>

<script setup lang="ts">
import { computed } from 'vue'
import iconUrl from '../assets/images/icon.svg'
import playUrl from '../assets/images/play.svg'
import stopUrl from '../assets/images/stop.svg'
import lastUrl from '../assets/images/last.svg'
import nextUrl from '../assets/images/next.svg'

export type SvgIconName = 'icon' | 'play' | 'stop' | 'last' | 'next'

const sources: Record<SvgIconName, string> = {
  icon: iconUrl,
  play: playUrl,
  stop: stopUrl,
  last: lastUrl,
  next: nextUrl
}

const props = defineProps<{
  name: SvgIconName
}>()

const src = computed(() => sources[props.name])
</script>
