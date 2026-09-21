import { useCallback, useMemo, useState } from 'react'
import { Directory } from './components/Directory'
import { Footer } from './components/Footer'
import { Header, type SyncStatus } from './components/Header'
import { Hero } from './components/Hero'
import { useDoctors } from './hooks/useDoctors'
import { matchesQuery } from './lib/doctors'

export default function App() {
  const { index, isLoading, error, retry } = useDoctors()
  const [query, setQuery] = useState('')

  const doctors = useMemo(() => index?.doctors ?? [], [index])
  const filteredDoctors = useMemo(() => doctors.filter(doctor => matchesQuery(doctor, query)), [doctors, query])

  const status: SyncStatus = index ? 'live' : isLoading ? 'loading' : 'offline'
  const isUnavailable = Boolean(error) && !index

  const handleSelectLocation = useCallback((location: string) => {
    setQuery(location)
    document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleClearSearch = useCallback(() => setQuery(''), [])

  return (
    <div id="top" className="min-h-dvh">
      <Header status={status} />
      <main>
        <Hero
          query={query}
          onQueryChange={setQuery}
          resultCount={filteredDoctors.length}
          doctorCount={doctors.length}
          locationCount={index?.locations.length ?? 0}
          isLoading={isLoading}
          hasError={isUnavailable}
        />
        <Directory
          doctors={filteredDoctors}
          query={query}
          isLoading={isLoading}
          hasError={isUnavailable}
          onRetry={retry}
          onClearSearch={handleClearSearch}
          onSelectLocation={handleSelectLocation}
        />
      </main>
      <Footer />
    </div>
  )
}
