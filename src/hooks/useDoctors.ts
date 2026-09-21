import useSWR from 'swr'
import { site } from '../config/site'
import type { DoctorIndex } from '../lib/doctors'

async function fetchDoctorIndex(path: string): Promise<DoctorIndex> {
  const response = await fetch(path, { headers: { accept: 'application/json' } })
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok || !contentType.includes('application/json')) {
    throw new Error(`Unable to reach the doctor list (${response.status})`)
  }
  return (await response.json()) as DoctorIndex
}

export interface DoctorsResult {
  index: DoctorIndex | undefined
  isLoading: boolean
  error: Error | undefined
  retry: () => void
}

/**
 * Polls the live doctor list and keeps the last good payload while
 * revalidating. Failures surface as a retryable error state.
 */
export function useDoctors(): DoctorsResult {
  const { data, error, isLoading, mutate } = useSWR<DoctorIndex>(site.doctorsApiPath, fetchDoctorIndex, {
    refreshInterval: site.syncIntervalMs,
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  return {
    index: data,
    isLoading: isLoading && !data,
    error: error instanceof Error ? error : undefined,
    retry: () => {
      void mutate()
    },
  }
}
