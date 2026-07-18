import { useCallback, useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  rootMargin?: string
}

// Cursor-style infinite scroll: attach the returned ref to a sentinel
// element after the list; onLoadMore fires when it scrolls into view.
// A "Load more" button should be kept as a fallback for browsers without
// IntersectionObserver and as an accessible alternative.
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '400px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadMoreRef = useRef(onLoadMore)
  loadMoreRef.current = onLoadMore

  const canLoad = hasMore && !isLoading

  const setSentinel = useCallback((node: HTMLDivElement | null) => {
    sentinelRef.current = node
  }, [])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !canLoad || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreRef.current()
        }
      },
      { rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [canLoad, rootMargin])

  return setSentinel
}
