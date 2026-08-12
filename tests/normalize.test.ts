import { describe, it, expect } from 'vitest'
import {
  normalizeMediaUrl,
  normalizeMusicItem,
  normalizeMusicList
} from '../src/lib/normalize'

describe('normalizeMediaUrl', () => {
  it('keeps https urls', () => {
    expect(normalizeMediaUrl('https://cdn.example.com/music.mp3')).toBe(
      'https://cdn.example.com/music.mp3'
    )
  })

  it('keeps http urls', () => {
    expect(normalizeMediaUrl('http://example.com/cover.jpg')).toBe(
      'http://example.com/cover.jpg'
    )
  })

  it('keeps site-relative paths', () => {
    expect(normalizeMediaUrl('/music/song.mp3')).toBe('/music/song.mp3')
  })

  it('keeps protocol-relative urls', () => {
    expect(normalizeMediaUrl('//cdn.example.com/cover.jpg')).toBe(
      '//cdn.example.com/cover.jpg'
    )
  })

  it('returns empty string for invalid input', () => {
    expect(normalizeMediaUrl(undefined)).toBe('')
    expect(normalizeMediaUrl('   ')).toBe('')
  })
})

describe('normalizeMusicItem', () => {
  it('normalizes a valid music item', () => {
    expect(
      normalizeMusicItem({
        title: 'Remote BGM',
        link: 'https://example.com/bgm.mp3',
        cover: 'https://example.com/cover.jpg'
      })
    ).toEqual({
      title: 'Remote BGM',
      link: 'https://example.com/bgm.mp3',
      cover: 'https://example.com/cover.jpg'
    })
  })

  it('drops items without link', () => {
    expect(normalizeMusicItem({ title: 'No Link' })).toBeNull()
  })
})

describe('normalizeMusicList', () => {
  it('filters invalid entries', () => {
    expect(
      normalizeMusicList([
        { title: 'A', link: '/a.mp3' },
        { title: 'B' },
        null
      ])
    ).toEqual([{ title: 'A', link: '/a.mp3' }])
  })
})
