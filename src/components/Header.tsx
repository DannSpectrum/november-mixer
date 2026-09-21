import { site } from '../config/site'

export type SyncStatus = 'live' | 'loading' | 'offline'

interface HeaderProps {
  status: SyncStatus
}

export function Header({ status }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline/80 bg-canvas/80 backdrop-blur-xl">
      <div aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-brand via-[#ff2d78] to-[#7c5cff]" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="shrink-0" aria-label={`${site.name} — back to top`}>
          <img src="/images/logo-full.webp" alt={site.name} className="h-8 w-auto sm:h-9" />
        </a>
        <div className="flex items-center gap-2.5">
          <a
            href="#doctors"
            className="hidden rounded-btn px-3 py-2 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-brand-tint hover:text-brand-text sm:block"
          >
            Doctors
          </a>
          <SyncBadge status={status} />
        </div>
      </div>
    </header>
  )
}

const STATUS_STYLES: Record<SyncStatus, { dot: string; label: string; pulse: boolean }> = {
  live: { dot: 'bg-emerald-500', label: 'Live', pulse: true },
  loading: { dot: 'bg-ink-muted', label: 'Connecting…', pulse: true },
  offline: { dot: 'bg-rose-500', label: 'Reconnecting…', pulse: false },
}

function SyncBadge({ status }: HeaderProps) {
  const style = STATUS_STYLES[status]

  return (
    <span className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted">
      <span className="relative flex h-2 w-2">
        {style.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${style.dot}`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${style.dot}`} />
      </span>
      <span>{style.label}</span>
    </span>
  )
}
