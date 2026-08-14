import { describe, expect, it } from 'vitest'
import { resolveKeyboardShortcut } from '../src/client/keyboard'

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
