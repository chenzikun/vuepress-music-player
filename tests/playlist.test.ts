import { describe, expect, it } from 'vitest'
import { playlistFingerprint, playlistsEqual } from '../src/client/playlist'

describe('playlistFingerprint', () => {
  it('changes when link changes', () => {
    const a = [{ title: 'A', link: '/a.mp3' }]
    const b = [{ title: 'A', link: '/b.mp3' }]
    expect(playlistFingerprint(a)).not.toBe(playlistFingerprint(b))
  })

  it('is stable for same list', () => {
    const list = [
      { title: 'A', link: '/a.mp3', cover: '/a.jpg' },
      { title: 'B', link: '/b.mp3' }
    ]
    expect(playlistsEqual(list, [...list])).toBe(true)
  })
})
