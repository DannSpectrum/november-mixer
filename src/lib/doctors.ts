/**
 * Shared directory logic — used by the Vercel API function (server) and the
 * React app (search, grouping). Keep this module pure:
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
  specialties: string[]
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

const DOCTOR_COLUMN = 0
const LOCATION_COLUMN = 1
const RSVP_COLUMN = 6 // column G
const RSVP_ACCEPTED = 'yes'

const CITY_NAME_COLUMN = 0 // column A of the Cities tab
const CITY_FIRST_COLUMN = 1 // column B
const CITY_LAST_COLUMN = 11 // column L

const SPECIALTY_NAME_COLUMN = 0 // column A of the Specialties tab
const SPECIALTY_VALUES_COLUMN = 1 // column B
const SPECIALTY_CODE = /\s*\([^)]*\)\s*$/

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
  if (count === 0) return 'Location to be announced'
  return count === 1 ? '1 location' : `${count} locations`
}

function isHeaderRow(row: readonly unknown[]): boolean {
  const first = normalize(row[DOCTOR_COLUMN]).toLowerCase()
  const second = normalize(row[LOCATION_COLUMN]).toLowerCase()
  return first.includes('doctor') && second.includes('locat')
}

/** Column G marks who is attending the event — only rows set to "Yes" make the list. */
function isAttending(row: readonly unknown[]): boolean {
  return normalize(row[RSVP_COLUMN]).toLowerCase() === RSVP_ACCEPTED
}

/** Converts raw sheet values into clean doctor–location pairs, attending doctors only. */
export function parseRows(values: readonly (readonly unknown[])[]): DoctorRow[] {
  const rows: DoctorRow[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const row = Array.isArray(value) ? value : []
    if (isHeaderRow(row) || !isAttending(row)) continue

    const doctor = normalize(row[DOCTOR_COLUMN])
    const location = normalize(row[LOCATION_COLUMN])
    if (!doctor || !location) continue

    const dedupeKey = `${key(doctor)}|${key(location)}`
    if (seen.has(dedupeKey)) continue

    seen.add(dedupeKey)
    rows.push({ doctor, location })
  }

  return rows
}

/** "{Last name}, {First name}" → "{First name} {Last name}" (suffixes stay last). */
function reorderName(raw: string): string {
  const [last = '', ...rest] = normalize(raw).split(',')
  const first = rest.join(',').trim()
  if (!first) return last
  const tokens = first.split(' ')
  const suffix =
    tokens.length > 1 && NAME_SUFFIXES.has(tokens[tokens.length - 1].toLowerCase()) ? tokens.pop() : undefined
  return `${tokens.join(' ')} ${last}${suffix ? ` ${suffix}` : ''}`
}

function isNameHeader(name: string): boolean {
  const value = name.toLowerCase()
  return value === 'doctor' || value === 'doctors'
}

/** Drops the trailing abbreviation code: "Orthopedics (ORTH)" → "Orthopedics". */
function normalizeSpecialty(raw: string): string {
  return normalize(raw).replace(SPECIALTY_CODE, '').trim()
}

/** City lists from the "Cities" tab, keyed by the normalized doctor name. */
function buildCityMap(values: readonly (readonly unknown[])[]): Map<string, string[]> {
  const citiesByName = new Map<string, string[]>()

  for (const value of values) {
    const row = Array.isArray(value) ? value : []
    const name = reorderName(normalize(row[CITY_NAME_COLUMN]))
    if (!name || isNameHeader(name)) continue

    const cities: string[] = []
    for (let column = CITY_FIRST_COLUMN; column <= CITY_LAST_COLUMN; column++) {
      const city = normalize(row[column])
      if (city && !cities.some(known => key(known) === key(city))) cities.push(city)
    }
    citiesByName.set(key(name), cities)
  }

  return citiesByName
}

/** Specialty lists from the "Specialties" tab, keyed by the normalized doctor name. */
function buildSpecialtyMap(values: readonly (readonly unknown[])[]): Map<string, string[]> {
  const specialtiesByName = new Map<string, string[]>()

  for (const value of values) {
    const row = Array.isArray(value) ? value : []
    const name = reorderName(normalize(row[SPECIALTY_NAME_COLUMN]))
    if (!name || isNameHeader(name)) continue

    const specialties: string[] = []
    for (const part of normalize(row[SPECIALTY_VALUES_COLUMN]).split(',')) {
      const specialty = normalizeSpecialty(part)
      if (specialty && !specialties.some(known => key(known) === key(specialty))) {
        specialties.push(specialty)
      }
    }
    specialtiesByName.set(key(name), specialties)
  }

  return specialtiesByName
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
      byName.set(key(doctor), { name: doctor, locations: [location], specialties: [] })
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

export interface DoctorSources {
  doctors: readonly (readonly unknown[])[]
  cities: readonly (readonly unknown[])[]
  specialties: readonly (readonly unknown[])[]
}

/**
 * Full payload consumed by the UI. Doctors come from the main tab (RSVP = "Yes"
 * only); location chips come from the "Cities" tab and specialty pills from the
 * "Specialties" tab.
 */
export function buildDoctorIndex({ doctors: doctorValues, cities: cityValues, specialties: specialtyValues }: DoctorSources): DoctorIndex {
  const citiesByName = buildCityMap(cityValues)
  const specialtiesByName = buildSpecialtyMap(specialtyValues)
  const doctors = groupDoctors(parseRows(doctorValues)).map(doctor => ({
    ...doctor,
    locations: citiesByName.get(key(doctor.name)) ?? [],
    specialties: specialtiesByName.get(key(doctor.name)) ?? [],
  }))
  const locations = [...new Set(doctors.flatMap(doctor => doctor.locations))].sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' }),
  )
  return { doctors, locations, letters: lettersOf(doctors), updatedAt: new Date().toISOString() }
}

/** Case-insensitive match against the name, any location, or any specialty. */
export function matchesQuery(doctor: Doctor, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    doctor.name.toLowerCase().includes(needle) ||
    doctor.locations.some(location => location.toLowerCase().includes(needle)) ||
    doctor.specialties.some(specialty => specialty.toLowerCase().includes(needle))
  )
}
