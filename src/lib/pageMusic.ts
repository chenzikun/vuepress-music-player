import { normalizeMusicList } from './normalize'
import type { PageMusicConfig, PageMusicFrontmatter } from '../types'

export function normalizePageMusic(
  music: unknown,
  pageMusicList: unknown,
  musicAutoplay: unknown
): PageMusicConfig {
  if (music && typeof music === 'object') {
    const musicConfig = music as PageMusicFrontmatter
    const normalizedList = normalizeMusicList(musicConfig.list)
    if (normalizedList.length > 0) {
      return {
        hasPageMusic: true,
        autoplay: typeof musicConfig.autoplay === 'boolean' ? musicConfig.autoplay : null,
        list: normalizedList
      }
    }
  }

  const normalizedPageList = normalizeMusicList(pageMusicList)
  if (normalizedPageList.length > 0) {
    return {
      hasPageMusic: true,
      autoplay: typeof musicAutoplay === 'boolean' ? musicAutoplay : null,
      list: normalizedPageList
    }
  }

  return {
    hasPageMusic: false,
    autoplay: null,
    list: []
  }
}

export function resolvePageMusic(
  frontmatter: Record<string, unknown> | undefined,
  pageMusic?: PageMusicConfig
): PageMusicConfig {
  if (pageMusic?.hasPageMusic && pageMusic.list.length > 0) {
    return pageMusic
  }

  return normalizePageMusic(
    frontmatter?.music,
    frontmatter?.musicList,
    frontmatter?.musicAutoplay
  )
}
