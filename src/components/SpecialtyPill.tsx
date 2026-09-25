interface SpecialtyPillProps {
  specialty: string
  onSelect: (specialty: string) => void
}

export function SpecialtyPill({ specialty, onSelect }: SpecialtyPillProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(specialty)}
      title={`Show doctors in ${specialty}`}
      className="inline-flex max-w-full items-center rounded-full bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-text transition-colors duration-200 hover:bg-brand/20 cursor-pointer"
    >
      <span className="truncate">{specialty}</span>
    </button>
  )
}