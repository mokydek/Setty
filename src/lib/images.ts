// Requests a resized rendition from Supabase's image transformation CDN for
// grid thumbnails. Non-Supabase URLs are returned untouched.
export function thumbnailUrl(imageUrl: string, width = 600): string {
  if (!imageUrl.includes('/storage/v1/object/public/')) return imageUrl
  const transformed = imageUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/',
  )
  const separator = transformed.includes('?') ? '&' : '?'
  return `${transformed}${separator}width=${width}&quality=75`
}
