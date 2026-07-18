// Single source of truth for Supabase row shapes used across the app.
// Column names here must match the real schema exactly. See CLAUDE session
// history for the style_key -> style and author -> author_name incidents
// that this file exists to prevent from happening again.

export interface Asset {
  id: string
  created_at?: string
  title: string
  author_name: string
  price: number
  style: string
  image_url: string
  seller_id: string
  description?: string
  file_path?: string | null
  file_size_bytes?: number | null
  file_format?: string | null
  review_status?: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null
}

export interface Bounty {
  id: string
  created_at?: string
  title: string
  description: string
  style: string
  reward: number
  status: string
  user_id: string
  assignee_id?: string | null
}

export interface BountySubmission {
  id: string
  created_at: string
  bounty_id: string
  artist_id: string
  file_path: string
  preview_url?: string | null
  comment?: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejection_comment?: string | null
}

export interface Profile {
  id: string
  nickname: string
  description: string
  avatar_url: string
  role?: 'user' | 'curator'
}

export interface Purchase {
  id: string
  created_at: string
  user_id: string
  asset_id: string
  assets: Asset
}
