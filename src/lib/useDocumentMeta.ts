import { useEffect } from 'react'

const DEFAULT_TITLE = 'Setty | The Minimalist Asset Marketplace'

// Per-route document metadata for the SPA. Sets the title and description
// on mount and restores the defaults on unmount.
export function useDocumentMeta(title?: string, description?: string) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Setty`
    }

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = meta?.content

    if (description && meta) {
      meta.content = description
    }

    return () => {
      document.title = DEFAULT_TITLE
      if (meta && previousDescription !== undefined) {
        meta.content = previousDescription
      }
    }
  }, [title, description])
}

// Injects a JSON-LD structured-data block for the current page.
export function useJsonLd(data: object | null) {
  useEffect(() => {
    if (!data) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [data ? JSON.stringify(data) : null]) // eslint-disable-line react-hooks/exhaustive-deps
}
