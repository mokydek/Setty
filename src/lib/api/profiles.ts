import { supabase } from '../../backend/supabase'
import { fail, ok, type Result } from './result'
import type { Profile } from '../../types/database.types'

export async function getProfile(userId: string): Promise<Result<Profile | null>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) return fail(error)
  return ok((data as Profile | null) ?? null)
}

export async function getProfileRole(userId: string): Promise<Result<string | null>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  if (error) return fail(error)
  return ok((data as { role?: string } | null)?.role ?? null)
}

export async function setProfileLocale(userId: string, locale: string): Promise<Result<null>> {
  const { error } = await supabase.from('profiles').update({ locale }).eq('id', userId)
  if (error) return fail(error)
  return ok(null)
}
