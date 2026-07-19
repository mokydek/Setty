// Centralized result type for the data-access layer: every api function
// returns Result<T> instead of throwing or leaking PostgrestError shapes
// into components.

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export function ok<T>(data: T): Result<T> {
  return { ok: true, data }
}

export function fail<T>(error: { message: string } | string | null | undefined): Result<T> {
  const message =
    typeof error === 'string' ? error : (error?.message ?? 'Unknown error')
  return { ok: false, error: message }
}
