import { useEffect, useState, type FormEvent } from 'react'
import { UserRound } from 'lucide-react'
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

  const [nickname, setNickname] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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

        <div className="rounded-none border border-black bg-gray-100 w-24 h-24 flex items-center justify-center overflow-hidden mb-8">
          {avatarUrl ? (
            <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
          ) : (
            <UserRound size={32} strokeWidth={1.5} className="text-black/30" />
          )}
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
