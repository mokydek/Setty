// Pure state machine for the bounty lifecycle. All status decisions go
// through here so the transition rules are unit-testable and identical
// everywhere they are rendered.
//
//   open -> in_progress (artist accepts)
//   in_progress -> submitted (artist uploads work)
//   submitted -> approved (creator accepts)
//   submitted -> in_progress (creator requests changes)
//   open -> cancelled (creator)
//   approved -> paid (future payout hook)

export type BountyStatus =
  | 'open'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'paid'
  | 'cancelled'

export type BountyRole = 'creator' | 'artist' | 'visitor'

export type BountyEvent = 'accept' | 'submit' | 'approve' | 'requestChanges' | 'cancel'

interface BountyParties {
  user_id: string
  assignee_id?: string | null
}

export function resolveBountyRole(bounty: BountyParties, userId: string | null | undefined): BountyRole {
  if (!userId) return 'visitor'
  if (bounty.user_id === userId) return 'creator'
  if (bounty.assignee_id === userId) return 'artist'
  return 'visitor'
}

// Returns the next status, or null when the event is not allowed for this
// role in this status.
export function transition(
  status: BountyStatus,
  event: BountyEvent,
  role: BountyRole,
): BountyStatus | null {
  switch (event) {
    case 'accept':
      // Any signed-in non-creator can pick up an open bounty.
      return status === 'open' && role !== 'creator' ? 'in_progress' : null
    case 'submit':
      return status === 'in_progress' && role === 'artist' ? 'submitted' : null
    case 'approve':
      return status === 'submitted' && role === 'creator' ? 'approved' : null
    case 'requestChanges':
      return status === 'submitted' && role === 'creator' ? 'in_progress' : null
    case 'cancel':
      return status === 'open' && role === 'creator' ? 'cancelled' : null
  }
}

export function availableEvents(status: BountyStatus, role: BountyRole): BountyEvent[] {
  const events: BountyEvent[] = ['accept', 'submit', 'approve', 'requestChanges', 'cancel']
  return events.filter((event) => transition(status, event, role) !== null)
}

// Ordered steps for the status timeline. cancelled is rendered separately.
export const BOUNTY_TIMELINE: readonly BountyStatus[] = ['open', 'in_progress', 'submitted', 'approved']

export function timelineIndex(status: BountyStatus): number {
  const index = BOUNTY_TIMELINE.indexOf(status)
  if (index !== -1) return index
  // paid sits past the end of the visible timeline; cancelled before it.
  return status === 'paid' ? BOUNTY_TIMELINE.length : -1
}

export function isBountyStatus(value: string): value is BountyStatus {
  return ['open', 'in_progress', 'submitted', 'approved', 'paid', 'cancelled'].includes(value)
}
