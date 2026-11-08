/**
 * Database reliability and safety helpers for Supabase operations
 */

export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean as Partial<T>;
}

export function handleDbError(error: unknown, operationContext: string): never {
  const message = error instanceof Error
    ? error.message
    : (typeof error === 'object' && error !== null && 'message' in error)
      ? String((error as { message: unknown }).message)
      : 'Unknown database error';

  throw new Error(`[Supabase ${operationContext}] ${message}`);
}
