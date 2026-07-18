import { describe, expect, it } from 'vitest'
import {
  availableEvents,
  resolveBountyRole,
  timelineIndex,
  transition,
} from './bountyMachine'

describe('resolveBountyRole', () => {
  const bounty = { user_id: 'creator-1', assignee_id: 'artist-1' }

  it('identifies the creator, the artist and everyone else', () => {
    expect(resolveBountyRole(bounty, 'creator-1')).toBe('creator')
    expect(resolveBountyRole(bounty, 'artist-1')).toBe('artist')
    expect(resolveBountyRole(bounty, 'someone-else')).toBe('visitor')
    expect(resolveBountyRole(bounty, null)).toBe('visitor')
  })
})

describe('transition', () => {
  it('lets a non-creator accept an open bounty', () => {
    expect(transition('open', 'accept', 'visitor')).toBe('in_progress')
    expect(transition('open', 'accept', 'artist')).toBe('in_progress')
    expect(transition('open', 'accept', 'creator')).toBeNull()
  })

  it('lets only the artist submit, and only while in progress', () => {
    expect(transition('in_progress', 'submit', 'artist')).toBe('submitted')
    expect(transition('in_progress', 'submit', 'creator')).toBeNull()
    expect(transition('open', 'submit', 'artist')).toBeNull()
    expect(transition('submitted', 'submit', 'artist')).toBeNull()
  })

  it('lets only the creator review a submitted bounty', () => {
    expect(transition('submitted', 'approve', 'creator')).toBe('approved')
    expect(transition('submitted', 'requestChanges', 'creator')).toBe('in_progress')
    expect(transition('submitted', 'approve', 'artist')).toBeNull()
    expect(transition('submitted', 'requestChanges', 'artist')).toBeNull()
  })

  it('lets the creator cancel only while open', () => {
    expect(transition('open', 'cancel', 'creator')).toBe('cancelled')
    expect(transition('in_progress', 'cancel', 'creator')).toBeNull()
    expect(transition('open', 'cancel', 'artist')).toBeNull()
  })

  it('allows nothing from terminal states', () => {
    for (const role of ['creator', 'artist', 'visitor'] as const) {
      expect(availableEvents('approved', role)).toEqual([])
      expect(availableEvents('cancelled', role)).toEqual([])
      expect(availableEvents('paid', role)).toEqual([])
    }
  })
})

describe('availableEvents', () => {
  it('matches the transition table', () => {
    expect(availableEvents('open', 'creator')).toEqual(['cancel'])
    expect(availableEvents('open', 'visitor')).toEqual(['accept'])
    expect(availableEvents('in_progress', 'artist')).toEqual(['submit'])
    expect(availableEvents('submitted', 'creator')).toEqual(['approve', 'requestChanges'])
    expect(availableEvents('in_progress', 'visitor')).toEqual([])
  })
})

describe('timelineIndex', () => {
  it('maps statuses onto the visible timeline', () => {
    expect(timelineIndex('open')).toBe(0)
    expect(timelineIndex('in_progress')).toBe(1)
    expect(timelineIndex('submitted')).toBe(2)
    expect(timelineIndex('approved')).toBe(3)
    expect(timelineIndex('paid')).toBe(4)
    expect(timelineIndex('cancelled')).toBe(-1)
  })
})
