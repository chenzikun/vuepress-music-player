export interface MusicItem {
  title: string
  link: string
  cover?: string
}

export interface NavbarOptions {
  insertIntoNav?: boolean
  fallbackRight?: string
}

export interface MusicPlayerOptions {
  enabled?: boolean
  autoplay?: boolean
  musicList?: MusicItem[]
  navbar?: NavbarOptions
}

export interface MusicPlayerPluginConfig {
  enabled: boolean
  autoplay: boolean
  musicList: MusicItem[]
  navbar: Required<NavbarOptions>
}

export interface PageMusicFrontmatter {
  autoplay?: boolean
  list?: MusicItem[]
}

export interface PageMusicConfig {
  hasPageMusic: boolean
  autoplay: boolean | null
  list: MusicItem[]
}

export interface VuePressPageData {
  frontmatter: Record<string, unknown>
  musicPlayer?: PageMusicConfig
}

export type VuePressPlugin = (
  options?: MusicPlayerOptions,
  context?: unknown
) => Record<string, unknown> | void

declare global {
  const MUSIC_PLAYER_CONFIG: MusicPlayerPluginConfig
}

export {}
