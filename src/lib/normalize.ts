import type { MusicItem } from '../types'

/**
 * 规范化媒体地址，支持相对路径、http、https、协议相对地址
 */
export function normalizeMediaUrl(url: unknown): string {
  if (!url || typeof url !== 'string') return ''

  const trimmed = url.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return trimmed

  return trimmed
}

export function normalizeMusicItem(item: unknown): MusicItem | null {
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

export function normalizeMusicList(list: unknown): MusicItem[] {
  if (!Array.isArray(list)) return []
  return list
    .map(normalizeMusicItem)
    .filter((item): item is MusicItem => item !== null)
}
