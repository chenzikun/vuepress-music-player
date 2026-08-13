import { h } from 'vue'
import { ClientOnly, defineClientConfig } from 'vuepress/client'
import MusicPlayer from './MusicPlayer.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('MusicPlayer', MusicPlayer)
  },
  rootComponents: [
    () => h(ClientOnly, null, { default: () => h(MusicPlayer) })
  ]
})
