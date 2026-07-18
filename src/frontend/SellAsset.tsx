import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileArchive, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'
import { uploadAssetFile } from '../lib/assetFiles'
import {
  MAX_ASSET_FILE_BYTES,
  formatFileSize,
  getFileExtension,
  isAllowedAssetFile,
} from '../lib/assetAccess'
import type { Asset } from '../types/database.types'

type NewAsset = Omit<Asset, 'id' | 'created_at' | 'description' | 'file_path' | 'file_size_bytes' | 'file_format'>

const STYLE_KEYS = ['lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

export default function SellAsset() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const assetFileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [style, setStyle] = useState<string>(STYLE_KEYS[0])
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleAssetFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    if (!isAllowedAssetFile(file.name)) {
      setError(t('assetFile.badFormat'))
      return
    }
    if (file.size > MAX_ASSET_FILE_BYTES) {
      setError(t('assetFile.tooLarge'))
      return
    }

    setAssetFile(file)
  }

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setError(null)
    setIsUploading(true)

    const filePath = `${user.id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('asset-images')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setIsUploading(false)
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage.from('asset-images').getPublicUrl(filePath)
    setImageUrl(data.publicUrl)
    setIsUploading(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!user) {
      setError('You must be signed in to publish an asset.')
      return
    }

    if (!assetFile) {
      setError(t('assetFile.required'))
      return
    }

    setIsPublishing(true)

    const newAsset: NewAsset = {
      title,
      author_name: author,
      price: parseFloat(price),
      style,
      image_url: imageUrl,
      seller_id: user.id,
    }

    const { data, error: insertError } = await supabase
      .from('assets')
      .insert([newAsset])
      .select()

    if (insertError) {
      setIsPublishing(false)
      setError(insertError.message)
      return
    }

    if (!data || data.length === 0) {
      setIsPublishing(false)
      setError(
        'The asset was submitted but nothing was returned by the database. This usually means a SELECT policy is missing on the assets table, so the row may exist but cannot be read back.',
      )
      return
    }

    const assetId = (data[0] as Asset).id
    const filePath = `${user.id}/${assetId}/${assetFile.name}`

    setUploadProgress(0)
    const { error: uploadError } = await uploadAssetFile(filePath, assetFile, setUploadProgress)

    if (uploadError) {
      // Do not leave a file-less asset in the catalogue.
      await supabase.from('assets').delete().eq('id', assetId)
      setUploadProgress(null)
      setIsPublishing(false)
      setError(uploadError)
      return
    }

    const { error: fileUpdateError } = await supabase
      .from('assets')
      .update({
        file_path: filePath,
        file_size_bytes: assetFile.size,
        file_format: getFileExtension(assetFile.name),
      })
      .eq('id', assetId)

    setUploadProgress(null)
    setIsPublishing(false)

    if (fileUpdateError) {
      setError(fileUpdateError.message)
      return
    }

    setMessage(t('sell.sentForReview'))
    setTitle('')
    setAuthor('')
    setStyle(STYLE_KEYS[0])
    setPrice('')
    setImageUrl('')
    setAssetFile(null)
    if (assetFileInputRef.current) assetFileInputRef.current.value = ''
  }

  return (
    <div className="px-8 py-12 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Sell an Asset</h1>
        <p className="text-sm text-black/60 mb-8">
          Publish a single asset to the Setty marketplace.
        </p>

        {message && (
          <div className="rounded-none border border-black bg-white px-4 py-3 mb-6 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-black">{message}</span>
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="text-sm font-semibold text-[#0000FF] hover:text-black transition-colors whitespace-nowrap"
            >
              View Marketplace
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-xs font-medium text-black/60">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="author" className="text-xs font-medium text-black/60">
              Author Name
            </label>
            <input
              id="author"
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="style" className="text-xs font-medium text-black/60">
              Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            >
              {STYLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t(`marketplace.styles.${key}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-xs font-medium text-black/60">
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="imageUrl" className="text-xs font-medium text-black/60">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                id="imageUrl"
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://"
                className="flex-1 rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-none border border-black px-4 py-3 flex items-center gap-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <Upload size={14} strokeWidth={1.5} />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assetFile" className="text-xs font-medium text-black/60">
              {t('assetFile.label')}
            </label>
            <input
              ref={assetFileInputRef}
              id="assetFile"
              type="file"
              accept=".zip,.fbx,.glb,.png"
              onChange={handleAssetFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => assetFileInputRef.current?.click()}
              disabled={isPublishing}
              className="rounded-none border border-black px-4 py-3 flex items-center gap-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <FileArchive size={14} strokeWidth={1.5} />
              {assetFile ? assetFile.name : t('assetFile.choose')}
            </button>
            {assetFile ? (
              <span className="text-xs text-black/60">
                {t('assetFile.format')}: {getFileExtension(assetFile.name).toUpperCase()} &middot;{' '}
                {t('assetFile.size')}: {formatFileSize(assetFile.size)}
              </span>
            ) : (
              <span className="text-xs text-black/40">{t('assetFile.hint')}</span>
            )}
            {uploadProgress !== null && (
              <div className="flex flex-col gap-1">
                <div className="h-2 w-full border border-black">
                  <div
                    className="h-full bg-[#0000FF] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs text-black/60">
                  {t('assetFile.uploading')} {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPublishing}
            className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-50"
          >
            {isPublishing ? 'Publishing...' : 'Publish Asset'}
          </button>
        </form>
      </div>
    </div>
  )
}
