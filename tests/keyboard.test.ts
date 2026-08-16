import { describe, expect, it } from 'vitest'
import { resolveKeyboardShortcut, isPageActive } from '../src/client/keyboard'

describe('isPageActive', () => {
  it('requires visible and focused document', () => {
    expect(isPageActive({ visibilityState: 'visible', hasFocus: () => true })).toBe(true)
    expect(isPageActive({ visibilityState: 'hidden', hasFocus: () => true })).toBe(false)
    expect(isPageActive({ visibilityState: 'visible', hasFocus: () => false })).toBe(false)
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
