export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export function withUtm(href: string, defaults: UtmParams = {}): string {
  try {
    const base = href || '/';
    const [path, existingQuery] = base.split('?');
    const params = new URLSearchParams(existingQuery || '');

    const d: UtmParams = {
      utm_source: 'site',
      ...defaults,
    };

    if (d.utm_source) params.set('utm_source', d.utm_source);
    if (d.utm_medium) params.set('utm_medium', d.utm_medium);
    if (d.utm_campaign) params.set('utm_campaign', d.utm_campaign);
    if (d.utm_content) params.set('utm_content', d.utm_content);

    const qs = params.toString();
    if (!qs) return path;
    return `${path}?${qs}`;
  } catch {
    return href;
  }
}

export function withDefaultCtaUtm(href: string, medium: string, content?: string, campaign?: string): string {
  return withUtm(href, {
    utm_source: 'site',
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
  });
}

/**
 * Hämta UTM-parametrar från URL:en (för tracking)
 */
export function getUTMParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
  } catch {
    return {};
  }
}


