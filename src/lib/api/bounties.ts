import { supabase } from '../../backend/supabase'
import { fail, ok, type Result } from './result'
import type { Bounty, BountySubmission } from '../../types/database.types'

export async function getAllBounties(): Promise<Result<Bounty[]>> {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return fail(error)
  return ok((data as Bounty[]) ?? [])
}

export async function getBountyById(id: string): Promise<Result<Bounty>> {
  const { data, error } = await supabase.from('bounties').select('*').eq('id', id).single()
  if (error || !data) return fail(error ?? 'Bounty not found')
  return ok(data as Bounty)
}

export async function getBountiesByCreator(userId: string): Promise<Result<Bounty[]>> {
  const { data, error } = await supabase.from('bounties').select('*').eq('user_id', userId)
  if (error) return fail(error)
  return ok((data as Bounty[]) ?? [])
}

export async function getBountiesByAssignee(userId: string): Promise<Result<Bounty[]>> {
  const { data, error } = await supabase.from('bounties').select('*').eq('assignee_id', userId)
  if (error) return fail(error)
  return ok((data as Bounty[]) ?? [])
}

export async function createBounty(input: {
  title: string
  description: string
  style: string
  reward: number
  user_id: string
}): Promise<Result<null>> {
  const { error } = await supabase.from('bounties').insert([{ ...input, status: 'open' }])
  if (error) return fail(error)
  return ok(null)
}

export async function acceptBounty(bountyId: string, userId: string): Promise<Result<null>> {
  const { error } = await supabase
    .from('bounties')
    .update({ status: 'in_progress', assignee_id: userId })
    .eq('id', bountyId)
  if (error) return fail(error)
  return ok(null)
}

export async function updateBountyStatus(
  bountyId: string,
  status: string,
  extra: Record<string, unknown> = {},
): Promise<Result<null>> {
  const { error } = await supabase
    .from('bounties')
    .update({ status, ...extra })
    .eq('id', bountyId)
  if (error) return fail(error)
  return ok(null)
}

export async function deleteBounty(bountyId: string): Promise<Result<null>> {
  const { error } = await supabase.from('bounties').delete().eq('id', bountyId)
  if (error) return fail(error)
  return ok(null)
}

export async function getBountySubmissions(bountyId: string): Promise<Result<BountySubmission[]>> {
  const { data, error } = await supabase
    .from('bounty_submissions')
    .select('*')
    .eq('bounty_id', bountyId)
    .order('created_at', { ascending: false })
  if (error) return fail(error)
  return ok((data as BountySubmission[]) ?? [])
}
