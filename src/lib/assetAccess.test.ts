import { describe, expect, it } from 'vitest'
import {
  formatFileSize,
  getFileExtension,
  isAllowedAssetFile,
  resolveAssetAction,
} from './assetAccess'

describe('resolveAssetAction', () => {
  it('shows the own-listing state to the seller regardless of ownership or price', () => {
    expect(
      resolveAssetAction({ isOwnListing: true, alreadyOwned: false, price: 10 }),
    ).toBe('ownListing')
    expect(
      resolveAssetAction({ isOwnListing: true, alreadyOwned: true, price: 0 }),
    ).toBe('ownListing')
  })

  it('offers download when the asset has been purchased', () => {
    expect(
      resolveAssetAction({ isOwnListing: false, alreadyOwned: true, price: 25 }),
    ).toBe('download')
    expect(
      resolveAssetAction({ isOwnListing: false, alreadyOwned: true, price: 0 }),
    ).toBe('download')
  })

  it('offers buy for a paid asset that is not yet owned', () => {
    expect(
      resolveAssetAction({ isOwnListing: false, alreadyOwned: false, price: 9.99 }),
    ).toBe('buy')
  })

  it('offers free download for a free asset that is not yet owned', () => {
    expect(
      resolveAssetAction({ isOwnListing: false, alreadyOwned: false, price: 0 }),
    ).toBe('freeDownload')
  })
})

describe('getFileExtension', () => {
  it('extracts the lowercased extension', () => {
    expect(getFileExtension('Model.FBX')).toBe('fbx')
    expect(getFileExtension('pack.tar.zip')).toBe('zip')
  })

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('README')).toBe('')
    expect(getFileExtension('trailing.')).toBe('')
  })
})

describe('isAllowedAssetFile', () => {
  it('accepts zip, fbx, glb and png', () => {
    expect(isAllowedAssetFile('a.zip')).toBe(true)
    expect(isAllowedAssetFile('b.fbx')).toBe(true)
    expect(isAllowedAssetFile('c.glb')).toBe(true)
    expect(isAllowedAssetFile('d.png')).toBe(true)
  })

  it('rejects other formats', () => {
    expect(isAllowedAssetFile('e.exe')).toBe(false)
    expect(isAllowedAssetFile('f.jpg')).toBe(false)
    expect(isAllowedAssetFile('no-extension')).toBe(false)
  })
})

describe('formatFileSize', () => {
  it('formats bytes, kilobytes, megabytes and gigabytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(formatFileSize(3 * 1024 * 1024 * 1024)).toBe('3.00 GB')
  })
})
