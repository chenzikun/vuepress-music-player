export function isPageActive(doc?: Pick<Document, 'visibilityState' | 'hasFocus'>): boolean {
  if (!doc) return false
  return doc.visibilityState === 'visible' && doc.hasFocus()
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true

  return Boolean(target.closest('[contenteditable="true"], [contenteditable=""]'))
}

export type KeyboardShortcutAction = 'toggle' | 'prev' | 'next' | null

export function resolveKeyboardShortcut(key: string): KeyboardShortcutAction {
  switch (key) {
    case ' ':
    case 'Spacebar':
      return 'toggle'
    case 'ArrowLeft':
      return 'prev'
    case 'ArrowRight':
      return 'next'
    default:
      return null
  }
}
