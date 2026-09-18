interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  resultCount: number
  doctorCount: number
  locationCount: number
  isLoading: boolean
  hasError: boolean
}

export function SearchBar({
  query,
  onQueryChange,
  resultCount,
  doctorCount,
  locationCount,
  isLoading,
  hasError,
}: SearchBarProps) {
  return (
    <div>
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id="doctor-search"
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search by doctor or location…"
          autoComplete="off"
          className="h-14 w-full rounded-2xl border border-hairline bg-surface pl-12 pr-12 text-base text-ink shadow-sm outline-none transition duration-200 ease-soft placeholder:text-ink-muted/70 focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink-muted transition-colors duration-200 hover:bg-brand-tint hover:text-brand-text"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
        {statusLabel(query, resultCount, doctorCount, locationCount, isLoading, hasError)}
      </p>
    </div>
  )
}

function statusLabel(
  query: string,
  resultCount: number,
  doctorCount: number,
  locationCount: number,
  isLoading: boolean,
  hasError: boolean,
): string {
  if (isLoading) return 'Loading the doctor list…'
  if (hasError) return 'The doctor list is temporarily unavailable — retrying shortly.'
  if (query) return `Showing ${resultCount} of ${doctorCount} doctors`
  return `${doctorCount} doctors across ${locationCount} locations`
}
