import { useMemo } from 'react'
import { site } from '../config/site'
import { useScrollSpy } from '../hooks/useScrollSpy'
import { letterOf, type Doctor } from '../lib/doctors'
import { DoctorCard } from './DoctorCard'
import { EmptyState } from './EmptyState'
import { LetterNav } from './LetterNav'
import { SkeletonGrid } from './Skeleton'

interface DirectoryProps {
  doctors: readonly Doctor[]
  query: string
  isLoading: boolean
  hasError: boolean
  onRetry: () => void
  onClearSearch: () => void
  onSelectLocation: (location: string) => void
}

export function Directory({
  doctors,
  query,
  isLoading,
  hasError,
  onRetry,
  onClearSearch,
  onSelectLocation,
}: DirectoryProps) {
  const groups = useMemo(() => {
    const byLetter = new Map<string, Doctor[]>()
    for (const doctor of doctors) {
      const letter = letterOf(doctor.name)
      const bucket = byLetter.get(letter)
      if (bucket) bucket.push(doctor)
      else byLetter.set(letter, [doctor])
    }
    return [...byLetter.entries()]
  }, [doctors])

  const letters = groups.map(([letter]) => letter)
  const activeId = useScrollSpy(letters.map(sectionId))
  const activeLetter = groups.find(([letter]) => sectionId(letter) === activeId)?.[0]
  const showDirectory = !isLoading && !hasError && doctors.length > 0

  return (
    <section
      id="doctors"
      aria-labelledby="doctors-title"
      className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-24 pt-16 sm:px-6"
    >
      <h2 id="doctors-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Doctors at the {site.event.name}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Browse A–Z or search by name or location — the list stays up to date automatically.
      </p>

      {showDirectory && (
        <div className="sticky top-16 z-30 -mx-4 mt-6 border-b border-hairline/70 bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
          <LetterNav letters={letters} activeLetter={activeLetter} onSelect={scrollToLetter} />
        </div>
      )}

      <div className="mt-10">
        {isLoading && <SkeletonGrid />}

        {!isLoading && hasError && (
          <EmptyState
            title="We can’t reach the doctor list right now"
            description="The list refreshes automatically, or you can try again now."
            action={{ label: 'Try again', onClick: onRetry }}
          />
        )}

        {!isLoading && !hasError && doctors.length === 0 && (
          <EmptyState
            title={query ? `No doctors match “${query}”` : 'The list is empty'}
            description={
              query
                ? 'Try a different name or location — or clear the search to see everyone.'
                : 'Doctors will appear here as soon as the sheet has data.'
            }
            action={query ? { label: 'Clear search', onClick: onClearSearch } : undefined}
          />
        )}

        {showDirectory && (
          <div className="space-y-14">
            {groups.map(([letter, groupDoctors]) => (
              <section key={letter} id={sectionId(letter)} aria-label={`Doctors — ${letter}`} className="scroll-mt-36">
                <div className="mb-5 flex items-baseline gap-4">
                  <h3 className="text-3xl font-semibold tracking-tight">{letter}</h3>
                  <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                    {groupDoctors.length} {groupDoctors.length === 1 ? 'doctor' : 'doctors'}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-hairline" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupDoctors.map(doctor => (
                    <DoctorCard key={doctor.name} doctor={doctor} onSelectLocation={onSelectLocation} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function sectionId(letter: string): string {
  return `letter-${letter === '#' ? 'other' : letter}`
}

function scrollToLetter(letter: string): void {
  document.getElementById(sectionId(letter))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
