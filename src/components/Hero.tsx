import { site } from '../config/site'
import { SearchBar } from './SearchBar'

interface HeroProps {
  query: string
  onQueryChange: (query: string) => void
  resultCount: number
  doctorCount: number
  locationCount: number
  isLoading: boolean
  hasError: boolean
}

export function Hero(props: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -top-16 right-0 h-72 w-72 rounded-full bg-[#ff2d78]/10 blur-3xl" />
        <div className="absolute left-1/3 top-32 h-64 w-64 rounded-full bg-[#7c5cff]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <h1
          className="animate-fade-rise mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
          style={{ animationDelay: '60ms' }}
        >
          <span className="bg-linear-to-r from-brand via-[#ff2d78] to-[#7c5cff] bg-clip-text text-transparent">
            {site.event.name}
          </span>
        </h1>

        <div
          className="animate-fade-rise mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-ink"
          style={{ animationDelay: '90ms' }}
        >
          <span>{site.event.date}</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
          <span>{site.event.time}</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-brand" />
          <span>{site.event.venue}</span>
        </div>

        <div className="animate-fade-rise mt-8 max-w-2xl" style={{ animationDelay: '120ms' }}>
          <SearchBar {...props} />
        </div>
      </div>
    </section>
  )
}
