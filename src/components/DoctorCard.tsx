import { accentFor } from '../lib/colors'
import { initialsOf, locationLabel, type Doctor } from '../lib/doctors'
import { LocationChip } from './LocationChip'

interface DoctorCardProps {
  doctor: Doctor
  onSelectLocation: (location: string) => void
}

export function DoctorCard({ doctor, onSelectLocation }: DoctorCardProps) {
  const accent = accentFor(doctor.name)

  return (
    <article className="flex h-full flex-col gap-4 rounded-card border border-hairline bg-surface p-5 shadow-xs transition duration-300 ease-soft hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: accent.background, color: accent.foreground }}
        >
          {initialsOf(doctor.name)}
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-[15px] font-semibold leading-snug text-ink">{doctor.name}</h4>
          <p className="text-[13px] text-ink-muted">{locationLabel(doctor.locations.length)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {doctor.locations.map(location => (
          <LocationChip key={location} location={location} onSelect={onSelectLocation} />
        ))}
      </div>
    </article>
  )
}
