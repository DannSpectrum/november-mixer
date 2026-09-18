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
    // TODO: replace the placeholders below with the real November Mixer details.
    name: 'November Mixer',
    date: 'November 2026',
    time: 'Time to be announced',
    venue: 'Venue to be announced',
  },
} as const
