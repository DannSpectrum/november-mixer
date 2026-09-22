// The function compiles to ESM (package.json "type": "module"), and Node's ESM
// resolver requires full relative specifiers at runtime — keep the .js
// extension (Vercel resolves it back to the TypeScript source when building).
import { buildDoctorIndex } from '../src/lib/doctors.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { google } from 'googleapis'

const SHEETS_READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'
const DEFAULT_SHEET_NAME = 'Sheet1'
const DEFAULT_CITIES_SHEET_NAME = 'Cities'
const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=60'

interface ServiceAccountCredentials {
  clientEmail: string
  privateKey: string
}

/** Accepts either a full service-account JSON blob or the two individual fields. */
function readCredentials(): ServiceAccountCredentials {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (rawJson) {
    const parsed = JSON.parse(rawJson) as { client_email?: string; private_key?: string }
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must contain client_email and private_key')
    }
    return { clientEmail: parsed.client_email, privateKey: parsed.private_key }
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  if (clientEmail && privateKey) {
    return { clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }
  }

  throw new Error(
    'Missing Google credentials: set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
  )
}

/**
 * GET /api/doctors — reads the private Google Sheet through a service account
 * and returns the grouped doctor index as JSON. Doctors come from the main tab
 * (RSVP column G must be "Yes"); location chips come from the "Cities" tab.
 * Cached at the edge for 30s so frequent polling stays cheap.
 */
export default async function handler(request: VercelRequest, response: VercelResponse): Promise<void> {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEET_ID')

    const sheetName = process.env.GOOGLE_SHEET_NAME ?? DEFAULT_SHEET_NAME
    const citiesSheetName = process.env.GOOGLE_CITIES_SHEET_NAME ?? DEFAULT_CITIES_SHEET_NAME
    const { clientEmail, privateKey } = readCredentials()

    const auth = new google.auth.JWT({ email: clientEmail, key: privateKey, scopes: [SHEETS_READONLY_SCOPE] })
    const sheets = google.sheets({ version: 'v4', auth })
    const [doctors, cities] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: `'${sheetName}'!A:G` }),
      sheets.spreadsheets.values.get({ spreadsheetId, range: `'${citiesSheetName}'!A:L` }),
    ])

    response.setHeader('Cache-Control', CACHE_CONTROL)
    response.status(200).json(buildDoctorIndex(doctors.data.values ?? [], cities.data.values ?? []))
  } catch (error) {
    console.error('[api/doctors]', error)
    const message = error instanceof Error ? error.message : 'Unexpected server error'
    response.status(500).json({ error: message })
  }
}
