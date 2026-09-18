import { useMemo } from 'react'
import useSWR from 'swr'
import { site } from '../config/site'
import type { DoctorIndex } from '../lib/doctors'
import { buildSampleIndex } from '../lib/sample'

async function fetchDoctorIndex(path: string): Promise<DoctorIndex> {
  const response = await fetch(path, { headers: { accept: 'application/json' } })
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok || !contentType.includes('application/json')) {
    throw new Error(`Unable to reach the live directory (${response.status})`)
  }
  return (await response.json()) as DoctorIndex
}

export interface DoctorsResult {
  index: DoctorIndex | undefined
  source: 'live' | 'sample' | undefined
  isLoading: boolean
  error: Error | undefined
  retry: () => void
}

/**
 * Polls the live directory and keeps the last good payload while revalidating.
 * Local development falls back to sample data when the API is unavailable.
 */
export function useDoctors(): DoctorsResult {
  const { data, error, isLoading, mutate } = useSWR<DoctorIndex>(site.doctorsApiPath, fetchDoctorIndex, {
    refreshInterval: site.syncIntervalMs,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  const sample = useMemo(() => buildSampleIndex(), [])
  const useSample = !data && Boolean(error) && import.meta.env.DEV
  const activeError = error instanceof Error ? error : undefined

  return {
    index: data ?? (useSample ? sample : undefined),
    source: data ? 'live' : useSample ? 'sample' : undefined,
    isLoading: isLoading && !data,
    error: activeError,
    retry: () => {
      void mutate()
    },
  }
}
