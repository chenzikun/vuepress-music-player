import { describe, expect, it } from 'vitest'
import { pathsMatchRoute } from '../src/client/routePath'

const identityResolve = (pathname: string) => pathname

describe('pathsMatchRoute', () => {
  it('matches identical paths', () => {
    expect(pathsMatchRoute('/blog/l93szvrq/', '/blog/l93szvrq/', identityResolve)).toBe(true)
  })

  it('matches when page path encodes = as _', () => {
    expect(
      pathsMatchRoute(
        '/blog/6nT3oKBaORc_/',
        '/blog/6nT3oKBaORc=/',
        identityResolve
      )
    ).toBe(true)
  })

  it('returns false when paths differ', () => {
    expect(pathsMatchRoute('/blog/a/', '/blog/b/', identityResolve)).toBe(false)
  })

  it('returns false when either path is missing', () => {
    expect(pathsMatchRoute(undefined, '/blog/a/', identityResolve)).toBe(false)
    expect(pathsMatchRoute('/blog/a/', undefined, identityResolve)).toBe(false)
  })
})
