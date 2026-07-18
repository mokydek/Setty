import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

const STYLE_KEYS = ['lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

export default function EditAsset() {
  const { id } = useParams<{ id: string }>()
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
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null)
  const [currentFileSize, setCurrentFileSize] = useState<number | null>(null)
  const [currentFileFormat, setCurrentFileFormat] = useState<string | null>(null)
  const [newAssetFile, setNewAssetFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notFound, setNotFound] = useState(false)
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

    setNewAssetFile(file)
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

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id || !user) return
      setIsLoading(true)

      const { data, error: fetchError } = await supabase
        .from('assets')
        .select('*')
        .eq('id', id)
        .eq('seller_id', user.id)
        .single()

      if (fetchError || !data) {
        setNotFound(true)
      } else {
        setTitle(data.title ?? '')
        setAuthor(data.author_name ?? '')
        setStyle(data.style ?? STYLE_KEYS[0])
        setPrice(String(data.price ?? ''))
        setImageUrl(data.image_url ?? '')
        setCurrentFilePath(data.file_path ?? null)
        setCurrentFileSize(data.file_size_bytes ?? null)
        setCurrentFileFormat(data.file_format ?? null)
      }

      setIsLoading(false)
    }

    fetchAsset()
  }, [id, user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!user || !id) return

    setIsSaving(true)

    let fileColumns: Record<string, string | number> = {}

    if (newAssetFile) {
      const filePath = `${user.id}/${id}/${newAssetFile.name}`
      setUploadProgress(0)
      const { error: uploadError } = await uploadAssetFile(filePath, newAssetFile, setUploadProgress)
      setUploadProgress(null)

      if (uploadError) {
        setIsSaving(false)
        setError(uploadError)
        return
      }

      fileColumns = {
        file_path: filePath,
        file_size_bytes: newAssetFile.size,
        file_format: getFileExtension(newAssetFile.name),
      }
    }

    const { error: updateError } = await supabase
      .from('assets')
      .update({
        title,
        author_name: author,
        price: parseFloat(price),
        style,
        image_url: imageUrl,
        ...fileColumns,
      })
      .eq('id', id)
      .eq('seller_id', user.id)

    setIsSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    if (newAssetFile) {
      setCurrentFilePath(`${user.id}/${id}/${newAssetFile.name}`)
      setCurrentFileSize(newAssetFile.size)
      setCurrentFileFormat(getFileExtension(newAssetFile.name))
      setNewAssetFile(null)
      if (assetFileInputRef.current) assetFileInputRef.current.value = ''
    }

    setMessage('Saved.')
  }

  if (isLoading) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">Loading listing...</span>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black">
          Listing not found, or it does not belong to you.
        </span>
      </div>
    )
  }

  return (
    <div className="px-8 py-12 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Edit Listing</h1>
        <p className="text-sm text-black/60 mb-8">Update your published asset.</p>

        {message && (
          <div className="rounded-none border border-black bg-white px-4 py-3 mb-6 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-black">{message}</span>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-sm font-semibold text-[#0000FF] hover:text-black transition-colors whitespace-nowrap"
            >
              Back to Dashboard
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
            {currentFilePath ? (
              <span className="text-xs text-black/60">
                {t('assetFile.current')}: {currentFilePath.split('/').pop()}
                {currentFileFormat ? ` · ${t('assetFile.format')}: ${currentFileFormat.toUpperCase()}` : ''}
                {currentFileSize ? ` · ${t('assetFile.size')}: ${formatFileSize(currentFileSize)}` : ''}
              </span>
            ) : (
              <span className="text-xs text-black/40">{t('assetFile.noFile')}</span>
            )}
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
              disabled={isSaving}
              className="rounded-none border border-black px-4 py-3 flex items-center gap-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <FileArchive size={14} strokeWidth={1.5} />
              {newAssetFile ? newAssetFile.name : t('assetFile.choose')}
            </button>
            <span className="text-xs text-black/40">{t('assetFile.replaceHint')}</span>
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
            disabled={isSaving}
            className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
