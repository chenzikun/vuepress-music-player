export interface PlaylistItem {
  title: string
  link: string
  cover?: string
}

export function playlistFingerprint(list: PlaylistItem[]): string {
  return list
    .map((item) => `${item.link}\0${item.title}\0${item.cover ?? ''}`)
    .join('\n')
}

export function playlistsEqual(a: PlaylistItem[], b: PlaylistItem[]): boolean {
  if (a.length !== b.length) return false
  return playlistFingerprint(a) === playlistFingerprint(b)
}
