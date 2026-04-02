/**
 * Validerer valgfri leverandør-URL til eksternt tilmeldingsflow (kun http/https).
 * Mangler der protokol (fx kun www.partner.dk), forsøges https:// foran.
 */
export function parseOptionalSignupUrl(
  raw: unknown
): { ok: true; url: string | null } | { ok: false; error: string } {
  if (raw === undefined || raw === null) {
    return { ok: true, url: null };
  }
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Tilmeldingslink skal være tekst (en webadresse).' };
  }
  const t = raw.trim();
  if (!t) {
    return { ok: true, url: null };
  }

  const tryParse = (s: string): URL | null => {
    try {
      const u = new URL(s);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        return null;
      }
      return u;
    } catch {
      return null;
    }
  };

  let u = tryParse(t);
  if (!u && !/^https?:\/\//i.test(t)) {
    u = tryParse(`https://${t.replace(/^\/+/, '')}`);
  }
  if (!u) {
    return {
      ok: false,
      error:
        'Ugyldigt tilmeldingslink. Brug en webadresse med domæne, fx https://partner.dk/tilmeld eller www.partner.dk',
    };
  }
  return { ok: true, url: u.toString() };
}
