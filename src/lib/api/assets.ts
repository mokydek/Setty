import { supabase } from '../../backend/supabase'
import { fail, ok, type Result } from './result'
import type { Asset } from '../../types/database.types'

export async function getAssetById(id: string): Promise<Result<Asset>> {
  const { data, error } = await supabase.from('assets').select('*').eq('id', id).single()
  if (error || !data) return fail(error ?? 'Asset not found')
  return ok(data as Asset)
}

export async function getSellerAssets(sellerId: string): Promise<Result<Asset[]>> {
  const { data, error } = await supabase.from('assets').select('*').eq('seller_id', sellerId)
  if (error) return fail(error)
  return ok((data as Asset[]) ?? [])
}

export async function getPendingAssets(): Promise<Result<Asset[]>> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('review_status', 'pending')
    .order('created_at', { ascending: true })
  if (error) return fail(error)
  return ok((data as Asset[]) ?? [])
}

export async function deleteAsset(id: string): Promise<Result<null>> {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) return fail(error)
  return ok(null)
}

export async function setAssetReviewStatus(
  id: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
): Promise<Result<null>> {
  const { error } = await supabase
    .from('assets')
    .update({
      review_status: status,
      rejection_reason: status === 'rejected' ? (rejectionReason ?? '') : null,
    })
    .eq('id', id)
  if (error) return fail(error)
  return ok(null)
}
