import { describe, expect, it } from 'vitest'
import { normalizePageMusic, resolvePageMusic } from '../src/lib/pageMusic'

describe('normalizePageMusic', () => {
  it('reads music.list from frontmatter', () => {
    expect(
      normalizePageMusic(
        {
          autoplay: true,
          list: [{ title: '月光', link: '/music/a.mp3' }]
        },
        undefined,
        undefined
      )
    ).toEqual({
      hasPageMusic: true,
      autoplay: true,
      list: [{ title: '月光', link: '/music/a.mp3' }]
    })
  })

  it('returns empty config when no page music exists', () => {
    expect(normalizePageMusic(undefined, undefined, undefined)).toEqual({
      hasPageMusic: false,
      autoplay: null,
      list: []
    })
  })
})

describe('resolvePageMusic', () => {
  it('prefers pageData.musicPlayer when present', () => {
    expect(
      resolvePageMusic(
        {
          music: {
            list: [{ title: 'Frontmatter', link: '/front.mp3' }]
          }
        },
        {
          hasPageMusic: true,
          autoplay: false,
          list: [{ title: 'Page Data', link: '/page.mp3' }]
        }
      )
    ).toEqual({
      hasPageMusic: true,
      autoplay: false,
      list: [{ title: 'Page Data', link: '/page.mp3' }]
    })
  })

  it('falls back to frontmatter when pageData is empty', () => {
    expect(
      resolvePageMusic(
        {
          music: {
            autoplay: true,
            list: [{ title: '月光', link: '/music/a.mp3' }]
          }
        },
        {
          hasPageMusic: false,
          autoplay: null,
          list: []
        }
      )
    ).toEqual({
      hasPageMusic: true,
      autoplay: true,
      list: [{ title: '月光', link: '/music/a.mp3' }]
    })
  })
})
