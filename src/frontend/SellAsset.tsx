import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { ASSET_CATEGORIES, categoryLabelKey } from '../lib/collectionCompleteness'
import { track } from '../lib/analytics'
import type { Asset, Collection } from '../types/database.types'

type NewAsset = Omit<Asset, 'id' | 'created_at' | 'description' | 'file_path' | 'file_size_bytes' | 'file_format'>

const STYLE_KEYS = ['lowPoly', 'cyberpunk', 'handPainted', 'realistic'] as const

export default function SellAsset() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const assetFileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [style, setStyle] = useState<string>(STYLE_KEYS[0])
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionId, setCollectionId] = useState<string>('')
  const [category, setCategory] = useState<string>('prop')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [styleScore, setStyleScore] = useState<number | null>(null)
  const [styleVerdict, setStyleVerdict] = useState<'pass' | 'review' | 'fail' | null>(null)
  const [isScoring, setIsScoring] = useState(false)

  // Advisory style check: scores the preview image against the collection
  // centroid. Never blocks submission - curators decide.
  const runStyleCheck = async (image: string, collection: string) => {
    if (!image || !collection) return
    setIsScoring(true)
    setStyleScore(null)
    setStyleVerdict(null)

    const { data } = await supabase.functions.invoke('style-score', {
      body: { image_url: image, collection_id: collection },
    })

    const result = data as { score?: number; verdict?: string } | null
    if (
      typeof result?.score === 'number' &&
      (result.verdict === 'pass' || result.verdict === 'review' || result.verdict === 'fail')
    ) {
      setStyleScore(result.score)
      setStyleVerdict(result.verdict)
    }
    setIsScoring(false)
  }
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

  useEffect(() => {
    supabase
      .from('collections')
      .select('*')
      .order('slug')
      .then(({ data }) => {
        const rows = (data as Collection[]) ?? []
        setCollections(rows)
        if (rows.length > 0) {
          setCollectionId(rows[0].id)
          setStyle(rows[0].style)
        }
      })
  }, [])

  const handleCollectionChange = (id: string) => {
    setCollectionId(id)
    const selected = collections.find((collection) => collection.id === id)
    if (selected) setStyle(selected.style)
    if (imageUrl) runStyleCheck(imageUrl, id)
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
    runStyleCheck(data.publicUrl, collectionId)
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

    if (!termsAccepted) {
      setError(t('license.sellerCheckboxRequired'))
      return
    }

    setIsPublishing(true)

    // Record acceptance of the seller terms on the profile.
    await supabase
      .from('profiles')
      .update({ sellers_accepted_terms_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('sellers_accepted_terms_at', null)

    const newAsset: NewAsset = {
      title,
      author_name: author,
      price: parseFloat(price),
      style,
      image_url: imageUrl,
      seller_id: user.id,
      ...(collectionId ? { collection_id: collectionId } : {}),
      ...(styleScore !== null && styleVerdict
        ? { style_score: styleScore, style_verdict: styleVerdict }
        : {}),
      category,
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

    track({ name: 'asset_submitted', props: { style, price: parseFloat(price) } })
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

          {collections.length > 0 ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="collection" className="text-xs font-medium text-black/60">
                {t('collections.picker')}
              </label>
              <select
                id="collection"
                value={collectionId}
                onChange={(e) => handleCollectionChange(e.target.value)}
                className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
              >
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {language === 'ru' ? collection.name_ru : collection.name_en}
                  </option>
                ))}
              </select>
              <span className="text-xs text-black/40">{t('collections.pickerHint')}</span>
            </div>
          ) : (
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
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-xs font-medium text-black/60">
              {t('marketplace.category')}
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            >
              {ASSET_CATEGORIES.map((key) => (
                <option key={key} value={key}>
                  {t(`marketplace.categories.${categoryLabelKey(key)}`)}
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

          {(isScoring || styleScore !== null) && (
            <div className="flex flex-col gap-2 border border-black p-4">
              <span className="text-xs font-medium text-black/60">{t('styleCheck.label')}</span>
              {isScoring ? (
                <span className="text-xs text-black/40">{t('styleCheck.scoring')}</span>
              ) : (
                styleScore !== null && (
                  <>
                    <div className="h-3 w-full border border-black">
                      <div
                        className="h-full bg-[#0000FF] transition-all"
                        style={{ width: `${Math.round(styleScore * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-black">
                      {t('styleCheck.match')}: {Math.round(styleScore * 100)}% —{' '}
                      {t(`styleCheck.verdict.${styleVerdict}`)}
                    </span>
                  </>
                )
              )}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded-none accent-[#0000FF] border border-black"
            />
            <span className="text-xs text-black/70 leading-relaxed">
              {t('license.sellerCheckbox')}{' '}
              <Link to="/license" className="text-[#0000FF] hover:text-black transition-colors underline underline-offset-2">
                {t('license.footerLink')}
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={isPublishing || !termsAccepted}
            className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors mt-2 disabled:opacity-50"
          >
            {isPublishing ? 'Publishing...' : 'Publish Asset'}
          </button>
        </form>
      </div>
    </div>
  )
}
