import { supabase } from '../../backend/supabase'
import { fail, ok, type Result } from './result'
import type { Asset, Purchase } from '../../types/database.types'

export async function getOwnedAssets(userId: string): Promise<Result<Asset[]>> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*, assets(*)')
    .eq('user_id', userId)
  if (error) return fail(error)
  return ok(((data as Purchase[]) ?? []).map((purchase) => purchase.assets))
}

export async function hasPurchased(userId: string, assetId: string): Promise<Result<boolean>> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('asset_id', assetId)
    .maybeSingle()
  if (error) return fail(error)
  return ok(!!data)
}

// Dev-only free acquisition path (VITE_PAYMENTS_ENABLED=false); real
// purchases are written by the ls-webhook Edge Function.
export async function recordFreePurchase(userId: string, assetId: string): Promise<Result<null>> {
  const { error } = await supabase
    .from('purchases')
    .insert([{ user_id: userId, asset_id: assetId }])
  if (error) return fail(error)
  return ok(null)
}
