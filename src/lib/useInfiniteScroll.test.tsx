import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useInfiniteScroll } from './useInfiniteScroll'

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void

let observerCallback: ObserverCallback | null = null
const observeMock = vi.fn()
const disconnectMock = vi.fn()

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback
  }
  observe = observeMock
  disconnect = disconnectMock
  unobserve = vi.fn()
}

function Harness({
  hasMore,
  isLoading,
  onLoadMore,
}: {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}) {
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore })
  return <div ref={sentinelRef} data-testid="sentinel" />
}

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    observerCallback = null
    observeMock.mockClear()
    disconnectMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('observes the sentinel and fires onLoadMore when it intersects', () => {
    const onLoadMore = vi.fn()
    render(<Harness hasMore={true} isLoading={false} onLoadMore={onLoadMore} />)

    expect(observeMock).toHaveBeenCalledTimes(1)
    observerCallback?.([{ isIntersecting: true }])
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not fire when the sentinel is not intersecting', () => {
    const onLoadMore = vi.fn()
    render(<Harness hasMore={true} isLoading={false} onLoadMore={onLoadMore} />)

    observerCallback?.([{ isIntersecting: false }])
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('does not observe while loading or when there is nothing left', () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(
      <Harness hasMore={false} isLoading={false} onLoadMore={onLoadMore} />,
    )
    expect(observeMock).not.toHaveBeenCalled()

    rerender(<Harness hasMore={true} isLoading={true} onLoadMore={onLoadMore} />)
    expect(observeMock).not.toHaveBeenCalled()

    rerender(<Harness hasMore={true} isLoading={false} onLoadMore={onLoadMore} />)
    expect(observeMock).toHaveBeenCalledTimes(1)
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(
      <Harness hasMore={true} isLoading={false} onLoadMore={vi.fn()} />,
    )
    unmount()
    expect(disconnectMock).toHaveBeenCalled()
  })
})
