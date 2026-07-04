import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { UserRound, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../backend/supabase'

interface ProfileRow {
  id: string
  nickname: string
  description: string
  avatar_url: string
}

export default function Profile() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return
      setIsLoading(true)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!fetchError && data) {
        const profile = data as ProfileRow
        setNickname(profile.nickname ?? '')
        setDescription(profile.description ?? '')
        setAvatarUrl(profile.avatar_url ?? '')
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setError(null)
    setMessage(null)
    setIsUploading(true)

    const filePath = `${user.id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setIsUploading(false)
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    setAvatarUrl(data.publicUrl)
    setIsUploading(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!user) return

    setIsSaving(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nickname,
        description,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id)

    setIsSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setMessage('Profile updated.')
  }

  if (isLoading) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">Loading profile...</span>
      </div>
    )
  }

  return (
    <div className="px-8 py-12 flex justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Profile</h1>
        <p className="text-sm text-black/60 mb-8">Manage your public creator profile.</p>

        <div className="flex items-center gap-6 mb-8">
          <div className="rounded-none border border-black bg-gray-100 w-24 h-24 flex items-center justify-center overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
            ) : (
              <UserRound size={32} strokeWidth={1.5} className="text-black/30" />
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-none border border-black px-4 py-2 flex items-center gap-2 text-sm font-medium text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              <Upload size={14} strokeWidth={1.5} />
              {isUploading ? 'Uploading...' : 'Upload Avatar'}
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-none border border-black bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-black">{message}</span>
          </div>
        )}

        {error && (
          <div className="rounded-none border border-red-600 bg-white px-4 py-3 mb-6">
            <span className="text-sm font-medium text-red-600">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="avatarUrl" className="text-xs font-medium text-black/60">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://"
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="nickname" className="text-xs font-medium text-black/60">
              Nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-xs font-medium text-black/60">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-none border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-0 focus:border-[#0000FF] resize-none"
            />
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
