// Shared Supabase mock so tests never hit the network. Usage in a test file:
//
//   vi.mock('../backend/supabase', async () =>
//     (await import('../test/supabaseMock')).supabaseModuleMock(),
//   )
//
// The mock is a permissive chainable query builder: every filter/order call
// returns the builder, and awaiting it resolves to the configured result.

import { vi } from 'vitest'

export interface QueryResult {
  data: unknown
  error: { message: string } | null
  count?: number | null
}

const EMPTY: QueryResult = { data: [], error: null, count: 0 }

// Chainable, thenable query builder.
export function createQueryBuilder(result: QueryResult = EMPTY) {
  const builder: Record<string, unknown> = {}
  const chain = () => builder

  for (const method of [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'or', 'is', 'in', 'order', 'range', 'limit', 'textSearch',
  ]) {
    builder[method] = vi.fn(chain)
  }

  builder.single = vi.fn(() => Promise.resolve({ ...result, data: firstRow(result.data) }))
  builder.maybeSingle = vi.fn(() => Promise.resolve({ ...result, data: firstRow(result.data) }))
  builder.then = (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject)

  return builder
}

function firstRow(data: unknown): unknown {
  return Array.isArray(data) ? (data[0] ?? null) : data
}

export interface SupabaseMockOptions {
  // Per-table query results, e.g. { assets: { data: [...], error: null } }
  tables?: Record<string, QueryResult>
  session?: { user: { id: string; email?: string } } | null
}

export function createSupabaseMock(options: SupabaseMockOptions = {}) {
  const { tables = {}, session = null } = options

  return {
    from: vi.fn((table: string) => createQueryBuilder(tables[table] ?? EMPTY)),
    rpc: vi.fn(() => createQueryBuilder(EMPTY)),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session } })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: session?.user ?? null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'mock' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.test/mock.png' } })),
        createSignedUrl: vi.fn(() =>
          Promise.resolve({ data: { signedUrl: 'https://example.test/signed' }, error: null }),
        ),
      })),
    },
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  }
}

// Drop-in module factory for vi.mock('../backend/supabase', ...).
export function supabaseModuleMock(options: SupabaseMockOptions = {}) {
  return { supabase: createSupabaseMock(options) }
}
