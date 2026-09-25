interface LocationChipProps {
  location: string
  onSelect: (location: string) => void
}

export function LocationChip({ location, onSelect }: LocationChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(location)}
      title={`Show doctors at ${location}`}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-hairline bg-canvas px-2.5 py-1 text-left text-xs text-ink-soft transition-colors duration-200 hover:border-brand/40 hover:bg-brand-tint hover:text-brand-text cursor-pointer"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-3 w-3 shrink-0 opacity-70"
      >
        <path d="M12 21s-6.5-5.3-6.5-10a6.5 6.5 0 1 1 13 0c0 4.7-6.5 10-6.5 10Z" />
        <circle cx="12" cy="11" r="2.2" />
      </svg>
      <span className="truncate">{location}</span>
    </button>
  )
}
