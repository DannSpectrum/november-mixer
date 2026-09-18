import { useEffect, useState } from 'react'

/** Height of the sticky chrome above the sections (header + letter nav). */
const STICKY_OFFSET_PX = 140

/**
 * Tracks which letter section is currently in the active band below the
 * sticky header. Sections must render with matching `id`s.
 */
export function useScrollSpy(ids: readonly string[]): string | undefined {
  const [activeId, setActiveId] = useState<string>()
  const idKey = ids.join('|')

  useEffect(() => {
    const sectionIds = idKey ? idKey.split('|') : []
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    // No sections to observe (e.g. the directory is filtered empty) — the
    // stale active id is harmless because the nav isn't rendered either.
    if (sections.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        setActiveId(sectionIds.find(id => visible.has(id)))
      },
      { rootMargin: `-${STICKY_OFFSET_PX}px 0px -55% 0px`, threshold: 0 },
    )

    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [idKey])

  return activeId
}
