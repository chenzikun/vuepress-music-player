interface MusicItem {
  title: string
  link: string
  cover?: string
}

export interface PageMusicConfig {
  hasPageMusic: boolean
  autoplay: boolean | null
  list: MusicItem[]
}

function normalizeMediaUrl(url: unknown): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return trimmed
  return trimmed
}

function normalizeMusicItem(item: unknown): MusicItem | null {
  if (!item || typeof item !== 'object') return null
  const record = item as Record<string, unknown>
  const link = normalizeMediaUrl(record.link)
  if (!link) return null
  const cover = record.cover ? normalizeMediaUrl(record.cover) : undefined
  return {
    title: typeof record.title === 'string' ? record.title : '',
    link,
    ...(cover ? { cover } : {})
  }
}

function normalizeMusicList(list: unknown): MusicItem[] {
  if (!Array.isArray(list)) return []
  return list
    .map(normalizeMusicItem)
    .filter((item): item is MusicItem => item !== null)
}

function normalizePageMusic(
  music: unknown,
  pageMusicList: unknown,
  musicAutoplay: unknown
): PageMusicConfig {
  if (music && typeof music === 'object') {
    const musicConfig = music as { autoplay?: boolean; list?: unknown }
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
