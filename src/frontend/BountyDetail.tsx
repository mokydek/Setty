import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Download, FileArchive, ImageOff, Upload, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { supabase } from '../backend/supabase'
import { getSignedFileUrl, triggerDownload, uploadToBucket } from '../lib/assetFiles'
import {
  BOUNTY_TIMELINE,
  availableEvents,
  isBountyStatus,
  resolveBountyRole,
  timelineIndex,
  transition,
  type BountyRole,
  type BountyStatus,
} from '../lib/bountyMachine'
import {
  MAX_ASSET_FILE_BYTES,
  formatFileSize,
  isAllowedAssetFile,
} from '../lib/assetAccess'
import { track } from '../lib/analytics'
import { formatPrice } from '../lib/format'
import type { Bounty, BountySubmission } from '../types/database.types'

function StatusTimeline({ status }: { status: BountyStatus }) {
  const { t } = useLanguage()
  const current = timelineIndex(status)

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 border border-black px-4 py-3 w-fit">
        <X size={16} strokeWidth={1.5} className="text-black" />
        <span className="text-xs font-medium uppercase tracking-widest text-black">
          {t('bountyStatus.cancelled')}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {BOUNTY_TIMELINE.map((step, index) => {
        const reached = index <= current
        return (
          <div key={step} className="flex items-center">
            {index > 0 && (
              <div className={`h-px w-8 sm:w-14 ${index <= current ? 'bg-[#0000FF]' : 'bg-black/20'}`} />
            )}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`h-8 w-8 flex items-center justify-center border ${
                  reached ? 'border-[#0000FF] bg-[#0000FF]' : 'border-black/30 bg-white'
                }`}
              >
                {index < current || status === 'approved' || status === 'paid' ? (
                  <Check size={14} strokeWidth={2} className={reached ? 'text-white' : 'text-black/30'} />
                ) : (
                  <span className={`text-xs font-bold ${reached ? 'text-white' : 'text-black/30'}`}>
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium uppercase tracking-widest whitespace-nowrap ${
                  reached ? 'text-black' : 'text-black/30'
                }`}
              >
                {t(`bountyStatus.${step === 'in_progress' ? 'inProgress' : step}`)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SubmissionRow({
  submission,
  role,
  onApprove,
  onRequestChanges,
  isActing,
}: {
  submission: BountySubmission
  role: BountyRole
  onApprove: (submission: BountySubmission) => void
  onRequestChanges: (submission: BountySubmission, comment: string) => void
  isActing: boolean
}) {
  const { t } = useLanguage()
  const [previewFailed, setPreviewFailed] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const canReview = role === 'creator' && submission.status === 'pending'
  const canDownload =
    (role === 'artist') || (role === 'creator' && submission.status === 'approved')

  const handleDownload = async () => {
    setDownloadError(null)
    setIsDownloading(true)
    const { url, error } = await getSignedFileUrl('bounty-files', submission.file_path)
    setIsDownloading(false)
    if (!url) {
      setDownloadError(error ?? t('assetFile.downloadFailed'))
      return
    }
    triggerDownload(url, submission.file_path.split('/').pop() ?? 'bounty-work')
  }

  return (
    <div className="border border-black bg-white p-4 flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 border border-black/20 bg-gray-100 flex items-center justify-center overflow-hidden">
          {submission.preview_url && !previewFailed ? (
            <img
              src={submission.preview_url}
              alt=""
              onError={() => setPreviewFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageOff size={20} strokeWidth={1.5} className="text-black/30" />
          )}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <span
            className={`text-xs font-medium uppercase tracking-widest w-fit px-2 py-1 border ${
              submission.status === 'approved'
                ? 'border-[#0000FF] text-[#0000FF]'
                : submission.status === 'rejected'
                  ? 'border-black/30 text-black/40'
                  : 'border-black text-black'
            }`}
          >
            {t(`bountyDetail.submission.${submission.status}`)}
          </span>
          <span className="text-xs text-black/50">
            {new Date(submission.created_at).toLocaleString()}
          </span>
          {submission.comment && (
            <p className="text-sm text-black/70 leading-relaxed">{submission.comment}</p>
          )}
          {submission.status === 'rejected' && submission.rejection_comment && (
            <p className="text-sm text-black/60 leading-relaxed border-l-2 border-black pl-3">
              {t('bountyDetail.changeRequest')}: {submission.rejection_comment}
            </p>
          )}
        </div>
      </div>

      {downloadError && <span className="text-xs text-red-600">{downloadError}</span>}

      <div className="flex flex-wrap items-center gap-2">
        {canDownload && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-none border border-black text-black px-3 py-2 flex items-center gap-2 text-xs font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
          >
            <Download size={14} strokeWidth={1.5} />
            {isDownloading ? t('assetFile.preparing') : t('bountyDetail.downloadWork')}
          </button>
        )}

        {canReview && (
          <>
            <button
              onClick={() => onApprove(submission)}
              disabled={isActing}
              className="rounded-none bg-[#0000FF] text-white px-3 py-2 flex items-center gap-2 text-xs font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              <Check size={14} strokeWidth={1.5} />
              {t('bountyDetail.approve')}
            </button>
            <button
              onClick={() => setShowRejectForm((value) => !value)}
              disabled={isActing}
              className="rounded-none border border-black text-black px-3 py-2 text-xs font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              {t('bountyDetail.requestChanges')}
            </button>
          </>
        )}
      </div>

      {canReview && showRejectForm && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onRequestChanges(submission, rejectComment)
          }}
          className="flex flex-col gap-2"
        >
          <textarea
            required
            rows={3}
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder={t('bountyDetail.changeRequestPlaceholder')}
            className="rounded-none border border-black bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#0000FF] resize-none"
          />
          <button
            type="submit"
            disabled={isActing}
            className="rounded-none border border-black text-black px-3 py-2 text-xs font-medium hover:bg-black hover:text-white transition-colors w-fit disabled:opacity-50"
          >
            {t('bountyDetail.sendChangeRequest')}
          </button>
        </form>
      )}
    </div>
  )
}

export default function BountyDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const workFileInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [submissions, setSubmissions] = useState<BountySubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isActing, setIsActing] = useState(false)

  const [workFile, setWorkFile] = useState<File | null>(null)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [submitComment, setSubmitComment] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const fetchAll = useCallback(async () => {
    if (!id) return

    const { data, error: bountyError } = await supabase
      .from('bounties')
      .select('*')
      .eq('id', id)
      .single()

    if (bountyError || !data) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    setBounty(data as Bounty)

    const { data: subs } = await supabase
      .from('bounty_submissions')
      .select('*')
      .eq('bounty_id', id)
      .order('created_at', { ascending: false })

    setSubmissions((subs as BountySubmission[]) ?? [])
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  if (isLoading) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">{t('bountyDetail.loading')}</span>
      </div>
    )
  }

  if (notFound || !bounty || !isBountyStatus(bounty.status)) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black">{t('bountyDetail.notFound')}</span>
      </div>
    )
  }

  const status = bounty.status as BountyStatus
  const role = resolveBountyRole(bounty, user?.id)
  const events = availableEvents(status, role)

  const updateBountyStatus = async (next: BountyStatus, extra: Record<string, unknown> = {}) => {
    const { error: updateError } = await supabase
      .from('bounties')
      .update({ status: next, ...extra })
      .eq('id', bounty.id)
    if (updateError) throw new Error(updateError.message)
  }

  const handleAccept = async () => {
    if (!user) {
      navigate('/auth')
      return
    }
    const next = transition(status, 'accept', role)
    if (!next) return

    setIsActing(true)
    setError(null)
    try {
      await updateBountyStatus(next, { assignee_id: user.id })
      track({ name: 'bounty_accepted', props: { bounty_id: bounty.id } })
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setIsActing(false)
  }

  const handleCancel = async () => {
    const next = transition(status, 'cancel', role)
    if (!next) return
    if (!window.confirm(t('bountyDetail.cancelConfirm'))) return

    setIsActing(true)
    setError(null)
    try {
      await updateBountyStatus(next)
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setIsActing(false)
  }

  const handleWorkFileChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    setWorkFile(file)
  }

  const handlePreviewChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) setPreviewFile(file)
  }

  const handleSubmitWork = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    const next = transition(status, 'submit', role)
    if (!next) return

    if (!workFile) {
      setError(t('bountyDetail.workFileRequired'))
      return
    }

    setIsActing(true)
    setError(null)

    try {
      const workPath = `${user.id}/${bounty.id}/${workFile.name}`
      setUploadProgress(0)
      const { error: uploadError } = await uploadToBucket('bounty-files', workPath, workFile, setUploadProgress)
      setUploadProgress(null)
      if (uploadError) throw new Error(uploadError)

      let previewUrl: string | null = null
      if (previewFile) {
        const previewPath = `${user.id}/bounty-${bounty.id}-${previewFile.name}`
        const { error: previewError } = await supabase.storage
          .from('asset-images')
          .upload(previewPath, previewFile, { upsert: true })
        if (!previewError) {
          previewUrl = supabase.storage.from('asset-images').getPublicUrl(previewPath).data.publicUrl
        }
      }

      const { error: insertError } = await supabase.from('bounty_submissions').insert([
        {
          bounty_id: bounty.id,
          artist_id: user.id,
          file_path: workPath,
          preview_url: previewUrl,
          comment: submitComment || null,
        },
      ])
      if (insertError) throw new Error(insertError.message)

      await updateBountyStatus(next)
      track({ name: 'bounty_submitted', props: { bounty_id: bounty.id } })

      setWorkFile(null)
      setPreviewFile(null)
      setSubmitComment('')
      if (workFileInputRef.current) workFileInputRef.current.value = ''
      if (previewInputRef.current) previewInputRef.current.value = ''
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setIsActing(false)
  }

  const handleApprove = async (submission: BountySubmission) => {
    const next = transition(status, 'approve', role)
    if (!next) return

    setIsActing(true)
    setError(null)
    try {
      const { error: subError } = await supabase
        .from('bounty_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id)
      if (subError) throw new Error(subError.message)

      await updateBountyStatus(next)
      track({ name: 'bounty_approved', props: { bounty_id: bounty.id } })
      // TODO(payout): this is where the escrow payout hook will go once
      // seller payouts are implemented (release bounty.reward to the artist).
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setIsActing(false)
  }

  const handleRequestChanges = async (submission: BountySubmission, comment: string) => {
    const next = transition(status, 'requestChanges', role)
    if (!next) return

    setIsActing(true)
    setError(null)
    try {
      const { error: subError } = await supabase
        .from('bounty_submissions')
        .update({ status: 'rejected', rejection_comment: comment })
        .eq('id', submission.id)
      if (subError) throw new Error(subError.message)

      await updateBountyStatus(next)
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setIsActing(false)
  }

  return (
    <div className="px-8 py-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-black">{bounty.title}</h1>
            <span className="text-xl font-semibold text-[#0000FF] whitespace-nowrap">
              {formatPrice(bounty.reward, language)}
            </span>
          </div>
          <span className="text-xs font-medium text-black/50 uppercase tracking-widest">
            {t(`marketplace.styles.${bounty.style}`)}
          </span>
        </div>

        <StatusTimeline status={status} />

        <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">
          {bounty.description}
        </p>

        {error && (
          <div className="rounded-none border border-red-600 bg-white px-4 py-3">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {events.includes('accept') && (
            <button
              onClick={handleAccept}
              disabled={isActing}
              className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {t('bounties.acceptTask')}
            </button>
          )}
          {events.includes('cancel') && (
            <button
              onClick={handleCancel}
              disabled={isActing}
              className="rounded-none border border-black text-black px-6 py-3 text-sm font-medium hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              {t('bountyDetail.cancel')}
            </button>
          )}
        </div>

        {events.includes('submit') && (
          <form onSubmit={handleSubmitWork} className="border border-black p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold tracking-tight text-black">
              {t('bountyDetail.submitWork')}
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-black/60">
                {t('bountyDetail.workFile')}
              </label>
              <input
                ref={workFileInputRef}
                type="file"
                accept=".zip,.fbx,.glb,.png"
                onChange={handleWorkFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => workFileInputRef.current?.click()}
                disabled={isActing}
                className="rounded-none border border-black px-4 py-3 flex items-center gap-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 w-fit"
              >
                <FileArchive size={14} strokeWidth={1.5} />
                {workFile ? `${workFile.name} (${formatFileSize(workFile.size)})` : t('assetFile.choose')}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-black/60">
                {t('bountyDetail.previewImage')}
              </label>
              <input
                ref={previewInputRef}
                type="file"
                accept="image/*"
                onChange={handlePreviewChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => previewInputRef.current?.click()}
                disabled={isActing}
                className="rounded-none border border-black px-4 py-3 flex items-center gap-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 w-fit"
              >
                <Upload size={14} strokeWidth={1.5} />
                {previewFile ? previewFile.name : t('bountyDetail.choosePreview')}
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="submitComment" className="text-xs font-medium text-black/60">
                {t('bountyDetail.commentOptional')}
              </label>
              <textarea
                id="submitComment"
                rows={3}
                value={submitComment}
                onChange={(e) => setSubmitComment(e.target.value)}
                className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#0000FF] resize-none"
              />
            </div>

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

            <button
              type="submit"
              disabled={isActing}
              className="rounded-none bg-[#0000FF] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors w-fit disabled:opacity-50"
            >
              {isActing ? t('auth.pleaseWait') : t('bountyDetail.sendSubmission')}
            </button>
          </form>
        )}

        {(role === 'creator' || role === 'artist') && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold tracking-tight text-black">
              {t('bountyDetail.history')}
            </h2>
            {submissions.length === 0 ? (
              <span className="text-sm text-black/40">{t('bountyDetail.noSubmissions')}</span>
            ) : (
              submissions.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  role={role}
                  onApprove={handleApprove}
                  onRequestChanges={handleRequestChanges}
                  isActing={isActing}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
