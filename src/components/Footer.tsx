import { site } from '../config/site'

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 sm:px-6">
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-ink-muted">
          <span>Powered by</span>
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-medium text-ink transition-colors duration-200 hover:text-brand-text"
          >
            <img src="/images/logo-icon.webp" alt="" className="h-5 w-5" />
            {site.name}
          </a>
        </p>
        <span aria-hidden className="h-px w-24 bg-linear-to-r from-brand via-[#ff2d78] to-[#7c5cff]" />
        <p className="text-xs text-ink-muted">
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
