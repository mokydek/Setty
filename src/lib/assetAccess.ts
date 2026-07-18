// Pure helpers for deciding what action an asset page should offer and for
// presenting file metadata. Kept free of React and Supabase so the logic is
// unit-testable.

export type AssetAction = 'ownListing' | 'download' | 'buy' | 'freeDownload'

export interface AssetAccessInput {
  isOwnListing: boolean
  alreadyOwned: boolean
  price: number
}

export function resolveAssetAction({ isOwnListing, alreadyOwned, price }: AssetAccessInput): AssetAction {
  if (isOwnListing) return 'ownListing'
  if (alreadyOwned) return 'download'
  if (price > 0) return 'buy'
  return 'freeDownload'
}

export const MAX_ASSET_FILE_BYTES = 200 * 1024 * 1024

export const ALLOWED_ASSET_FILE_EXTENSIONS = ['zip', 'fbx', 'glb', 'png'] as const

export function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf('.')
  if (dot === -1 || dot === fileName.length - 1) return ''
  return fileName.slice(dot + 1).toLowerCase()
}

export function isAllowedAssetFile(fileName: string): boolean {
  return (ALLOWED_ASSET_FILE_EXTENSIONS as readonly string[]).includes(getFileExtension(fileName))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
