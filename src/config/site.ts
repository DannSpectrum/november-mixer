/**
 * Single source of truth for brand copy, links and the featured event.
 * Everything the site needs to know outside of the doctor data lives here.
 */
export const site = {
  name: 'Spectrum Medical Evaluators',
  url: 'https://spectrummedeval.com',
  doctorsApiPath: '/api/doctors',
  /** How often the client re-checks the live doctor list (milliseconds). */
  syncIntervalMs: 60_000,
  event: {
    name: 'November Mixer',
    date: 'Friday, November 20, 2026',
    time: '6:30 PM – 9:30 PM',
    venue: 'Santa Barbara Room, 3649 Mission Inn Avenue, Riverside, CA 92501',
  },
} as const
