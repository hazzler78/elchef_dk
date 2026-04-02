import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeEnv(value: string | undefined): string | undefined {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.replace(/^"|"$/g, '');
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64url = parts[1];
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (b64.length % 4)) % 4;
    const padded = b64 + (pad ? '='.repeat(pad) : '');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** PostgREST uses the Bearer token role for RLS; anon key → insert fails on RLS tables. */
function assertServiceRoleJwt(apiKey: string): void {
  const payload = decodeJwtPayload(apiKey);
  const role = payload?.role;
  if (role === undefined || role === null) return;
  if (role !== 'service_role') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY must be the service_role secret (Supabase → Settings → API), not the anon key. ' +
        'Using the anon key causes RLS errors on INSERT/UPDATE/DELETE.'
    );
  }
}

export function getSupabaseServerClient(): SupabaseClient {
  const url =
    sanitizeEnv(process.env.SUPABASE_URL) ||
    sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) {
    throw new Error('Supabase credentials are not configured');
  }
  assertServiceRoleJwt(key);
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  });
}


