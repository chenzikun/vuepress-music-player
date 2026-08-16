import { describe, expect, it } from 'vitest'
import { resolveKeyboardShortcut, isPageActive } from '../src/client/keyboard'

describe('isPageActive', () => {
  it('requires document.hasFocus()', () => {
    expect(isPageActive({ hasFocus: () => true })).toBe(true)
    expect(isPageActive({ hasFocus: () => false })).toBe(false)
  })

  it('returns false when document is missing', () => {
    expect(isPageActive(undefined)).toBe(false)
  })
})

describe('resolveKeyboardShortcut', () => {
  it('maps space and arrow keys', () => {
    expect(resolveKeyboardShortcut(' ')).toBe('toggle')
    expect(resolveKeyboardShortcut('Spacebar')).toBe('toggle')
    expect(resolveKeyboardShortcut('ArrowLeft')).toBe('prev')
    expect(resolveKeyboardShortcut('ArrowRight')).toBe('next')
  })

  it('ignores unrelated keys', () => {
    expect(resolveKeyboardShortcut('Enter')).toBeNull()
  })
})
