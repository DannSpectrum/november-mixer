interface LetterNavProps {
  letters: readonly string[]
  activeLetter?: string
  onSelect: (letter: string) => void
}

export function LetterNav({ letters, activeLetter, onSelect }: LetterNavProps) {
  return (
    <nav
      aria-label="Jump to letter"
      className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {letters.map(letter => {
        const isActive = letter === activeLetter
        return (
          <button
            key={letter}
            type="button"
            onClick={() => onSelect(letter)}
            aria-current={isActive ? 'true' : undefined}
            className={`h-8 min-w-8 shrink-0 rounded-full px-2 text-[13px] font-semibold transition-colors duration-200 ${
              isActive
                ? 'bg-brand-tint text-brand-text ring-1 ring-brand/30'
                : 'text-ink-muted hover:bg-brand-tint/60 hover:text-brand-text'
            }`}
          >
            {letter}
          </button>
        )
      })}
    </nav>
  )
}
