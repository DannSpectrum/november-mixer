/**
 * Shared directory logic — used by the Vercel API function (server) and the
 * React app (search, grouping, dev sample data). Keep this module pure:
 * no DOM, no network, no environment access.
 */

export interface DoctorRow {
  /** Display name exactly as written in the sheet (column A). */
  doctor: string
  /** Physical location (column B). */
  location: string
}

export interface Doctor {
  name: string
  locations: string[]
}

export interface DoctorIndex {
  doctors: Doctor[]
  locations: string[]
  letters: string[]
  /** ISO timestamp of when this index was generated. */
  updatedAt: string
}

const NAME_PREFIX = /^(dr|dra)\.?\s+/i
const NAME_SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv'])

function normalize(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function key(value: string): string {
  return value.toLowerCase()
}

function tokenizeName(name: string): string[] {
  return name.replace(NAME_PREFIX, '').split(' ').filter(Boolean)
}

/**
 * A–Z bucket for a doctor. Names are written "First Last" in the sheet, so
 * grouping is by the first name: "Michael Abdulian" → "M". Diacritics are
 * folded ("Ángel" → "A").
 */
export function letterOf(name: string): string {
  const first = tokenizeName(name)[0] ?? ''
  const initial = first
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .charAt(0)
    .toUpperCase()
  return /[A-Z]/.test(initial) ? initial : '#'
}

/** Two-letter monogram for avatar chips: "Dr. Mary-Anne O'Brien" → "MO". */
export function initialsOf(name: string): string {
  return tokenizeName(name)
    .filter(token => !NAME_SUFFIXES.has(token.toLowerCase()))
    .slice(0, 2)
    .map(token => token.charAt(0).toUpperCase())
    .join('')
}

export function locationLabel(count: number): string {
  return count === 1 ? '1 location' : `${count} locations`
}

function isHeaderRow(row: readonly unknown[]): boolean {
  const [first = '', second = ''] = row.map(cell => normalize(cell).toLowerCase())
  return first.includes('doctor') && second.includes('locat')
}

/** Converts raw sheet values into clean doctor–location pairs. */
export function parseRows(values: readonly (readonly unknown[])[]): DoctorRow[] {
  const rows: DoctorRow[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const row = Array.isArray(value) ? value : []
    if (isHeaderRow(row)) continue

    const doctor = normalize(row[0])
    const location = normalize(row[1])
    if (!doctor || !location) continue

    const dedupeKey = `${key(doctor)}|${key(location)}`
    if (seen.has(dedupeKey)) continue

    seen.add(dedupeKey)
    rows.push({ doctor, location })
  }

  return rows
}

function sortKeyOf(name: string): string {
  return name.replace(NAME_PREFIX, '')
}

function compareNames(a: Doctor, b: Doctor): number {
  return sortKeyOf(a.name).localeCompare(sortKeyOf(b.name), 'en', { sensitivity: 'base' })
}

/** Merges one-row-per-location pairs into one entry per doctor. */
export function groupDoctors(rows: readonly DoctorRow[]): Doctor[] {
  const byName = new Map<string, Doctor>()

  for (const { doctor, location } of rows) {
    const existing = byName.get(key(doctor))
    if (!existing) {
      byName.set(key(doctor), { name: doctor, locations: [location] })
      continue
    }
    if (!existing.locations.some(known => key(known) === key(location))) {
      existing.locations.push(location)
    }
  }

  return [...byName.values()].sort(compareNames)
}

/** Letters in document order, with the non-alphabetic bucket pushed last. */
export function lettersOf(doctors: readonly Doctor[]): string[] {
  const letters = [...new Set(doctors.map(doctor => letterOf(doctor.name)))]
  return letters.sort((a, b) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
}

/** Full payload consumed by the UI: sorted doctors, unique locations, letters. */
export function buildDoctorIndex(values: readonly (readonly unknown[])[]): DoctorIndex {
  const doctors = groupDoctors(parseRows(values))
  const locations = [...new Set(doctors.flatMap(doctor => doctor.locations))].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  )
  return { doctors, locations, letters: lettersOf(doctors), updatedAt: new Date().toISOString() }
}

/** Case-insensitive match against the name or any location. */
export function matchesQuery(doctor: Doctor, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    doctor.name.toLowerCase().includes(needle) ||
    doctor.locations.some(location => location.toLowerCase().includes(needle))
  )
}
