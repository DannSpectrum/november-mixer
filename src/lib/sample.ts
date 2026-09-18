import { buildDoctorIndex, type DoctorIndex, type DoctorRow } from './doctors'

/**
 * Development-only fallback so the page renders fully without Google
 * credentials (`npm run dev`). The Vercel function never imports this file.
 */
const SAMPLE_ROWS: readonly DoctorRow[] = [
  { doctor: 'Dr. Sofia Alvarez', location: 'Makati Medical Center' },
  { doctor: 'Dr. Sofia Alvarez', location: 'Spectrum Clinic — Ortigas' },
  { doctor: 'Dr. Ramon Bautista', location: 'St. Luke’s Medical Center — BGC' },
  { doctor: 'Dr. Wei Chen', location: 'The Medical City — Pasig' },
  { doctor: 'Dr. Juan Miguel Dela Cruz', location: 'Cardinal Santos Medical Center' },
  { doctor: 'Dr. Juan Miguel Dela Cruz', location: 'Spectrum Clinic — Quezon City' },
  { doctor: 'Dr. Juan Miguel Dela Cruz', location: 'UST Hospital' },
  { doctor: 'Dr. Tomas Estrada', location: 'Makati Medical Center' },
  { doctor: 'Dr. Tomas Estrada', location: 'The Medical City — Pasig' },
  { doctor: 'Dr. Ary Gravesen', location: 'Spectrum Clinic — Alabang' },
  { doctor: 'Dr. Peter Lim', location: 'Spectrum Clinic — Cebu' },
  { doctor: 'Dr. Rafael Mercado', location: 'Davao Doctors Hospital' },
  { doctor: 'Dr. Liza Navarro', location: 'Spectrum Clinic — Davao' },
  { doctor: 'Dr. Mary-Anne O’Brien', location: 'Makati Medical Center' },
  { doctor: 'Dr. José Peña', location: 'St. Luke’s Medical Center — Quezon City' },
  { doctor: 'Dr. Miguel Reyes', location: 'Cardinal Santos Medical Center' },
  { doctor: 'Dr. Camille Santos', location: 'The Medical City — Pasig' },
  { doctor: 'Dr. Camille Santos', location: 'Spectrum Clinic — Ortigas' },
  { doctor: 'Dr. John Smith Jr.', location: 'Spectrum Clinic — Makati' },
  { doctor: 'Dr. Grace Tan', location: 'Chong Hua Hospital — Cebu' },
  { doctor: 'Dr. Ana Villanueva', location: 'UST Hospital' },
]

export function buildSampleIndex(): DoctorIndex {
  return buildDoctorIndex(SAMPLE_ROWS.map(row => [row.doctor, row.location]))
}
