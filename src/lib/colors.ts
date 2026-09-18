export interface Accent {
  background: string
  foreground: string
}

/**
 * Spectrum accents for doctor avatars — a warm-to-cool rotation that stays
 * readable on white and echoes the brand orange without shouting.
 */
const ACCENTS: readonly Accent[] = [
  { background: '#ffedd5', foreground: '#9a3412' }, // orange
  { background: '#ffe4e6', foreground: '#9f1239' }, // rose
  { background: '#fce7f3', foreground: '#9d174d' }, // pink
  { background: '#f3e8ff', foreground: '#6b21a8' }, // violet
  { background: '#e0e7ff', foreground: '#3730a3' }, // indigo
  { background: '#e0f2fe', foreground: '#075985' }, // sky
  { background: '#ccfbf1', foreground: '#115e59' }, // teal
  { background: '#d1fae5', foreground: '#065f46' }, // emerald
  { background: '#fef3c7', foreground: '#92400e' }, // amber
]

/** Deterministic accent so a doctor keeps the same color between syncs. */
export function accentFor(name: string): Accent {
  let hash = 0
  for (const character of name) {
    hash = (hash + (character.codePointAt(0) ?? 0)) % 997
  }
  return ACCENTS[hash % ACCENTS.length]
}
