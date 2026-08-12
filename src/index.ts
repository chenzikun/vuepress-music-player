import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { normalizeMusicList } from './lib/normalize'
import { normalizePageMusic } from './lib/pageMusic'
import type {
  MusicItem,
  MusicPlayerOptions,
  VuePressPageData
} from './types'

function buildPluginHooks(opts: MusicPlayerOptions) {
  const {
    enabled = true,
    autoplay = false,
    musicList = [],
    navbar = {}
  } = opts

  if (!enabled) {
    return {}
  }

  if (!Array.isArray(musicList) || musicList.length === 0) {
    console.warn('[vuepress-plugin-music-player] musicList is empty or missing.')
  }

  const NAVBAR = {
    insertIntoNav: navbar.insertIntoNav !== false,
    fallbackRight: navbar.fallbackRight || '7.5rem'
  }

  const normalizedMusicList = normalizeMusicList(musicList)
  const moduleDir = dirname(fileURLToPath(import.meta.url))
  const clientDir = resolve(moduleDir, './client')

  const pluginConfig = {
    enabled: true,
    autoplay: Boolean(autoplay),
    musicList: normalizedMusicList,
    navbar: NAVBAR
  }

  return {
    name: 'vuepress-plugin-music-player',
    define() {
      return {
        MUSIC_PLAYER_CONFIG: pluginConfig
      }
    },
    // VuePress 1
    extendPageData($page: VuePressPageData) {
      const frontmatter = $page.frontmatter || {}
      $page.musicPlayer = normalizePageMusic(
        frontmatter.music,
        frontmatter.musicList as MusicItem[] | undefined,
        frontmatter.musicAutoplay
      )
    },
    enhanceAppFiles: resolve(clientDir, './enhanceAppFile.js'),
    globalUIComponents: 'MusicPlayer',
    // VuePress 2
    extendsPage(page: {
      frontmatter: Record<string, unknown>
      data: Record<string, unknown>
    }) {
      const frontmatter = page.frontmatter || {}
      page.data.musicPlayer = normalizePageMusic(
        frontmatter.music,
        frontmatter.musicList,
        frontmatter.musicAutoplay
      )
    },
    clientConfigFile: resolve(clientDir, './clientConfig.ts')
  }
}

const plugin = (opts: MusicPlayerOptions = {}) => buildPluginHooks(opts)

export default plugin

export type {
  MusicItem,
  MusicPlayerOptions,
  NavbarOptions,
  PageMusicConfig,
  PageMusicFrontmatter,
  MusicPlayerPluginConfig
} from './types'
