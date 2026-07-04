import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { supabase } from '../backend/supabase'

interface ProfileRow {
  id: string
  nickname: string
  description: string
  avatar_url: string
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return
      setIsLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setProfile(data as ProfileRow)
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [id])

  if (isLoading) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black/40">Loading profile...</span>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="px-8 py-12">
        <span className="text-sm font-medium text-black">Profile not found.</span>
      </div>
    )
  }

  return (
    <div className="px-8 py-12 flex justify-center">
      <div className="w-full max-w-lg">
        <div className="rounded-none border border-black bg-gray-100 w-24 h-24 flex items-center justify-center overflow-hidden mb-8">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.nickname} className="w-full h-full object-cover" />
          ) : (
            <UserRound size={32} strokeWidth={1.5} className="text-black/30" />
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-black mb-4">
          {profile.nickname || 'Unnamed creator'}
        </h1>

        <p className="text-sm text-black/60 leading-relaxed">
          {profile.description || 'This creator has not written a description yet.'}
        </p>
      </div>
    </div>
  )
}
