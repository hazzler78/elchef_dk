import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

function toAbsoluteUrl(possibleUrl: string, base: string): string | null {
  try {
    // Already absolute
    if (/^https?:\/\//i.test(possibleUrl)) return possibleUrl;
    return new URL(possibleUrl, base).toString();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const targetUrl = req.nextUrl.searchParams.get('url');
    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Fetch HTML with a sane UA
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ElchefBot/1.0; +https://elchef.se)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Fetch failed ${res.status}` }, { status: 502 });
    }
    const html = await res.text();

    // Try og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i) || html.match(/<meta[^>]+name=["']og:image["'][^>]*>/i);
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image(?:[:\w-]*)?["'][^>]*>/i);

    const contentExtractor = (tag: string | null) => {
      if (!tag) return null;
      const attr = tag.match(/content=["']([^"']+)["']/i);
      return attr ? attr[1] : null;
    };

    let img = contentExtractor(ogMatch?.[0] || null) || contentExtractor(twMatch?.[0] || null);

    // Fallback: first <img src="...">
    if (!img) {
      const imgTag = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      img = imgTag ? imgTag[1] : null;
    }

    if (!img) {
      return NextResponse.json({ imageUrl: null });
    }

    const abs = toAbsoluteUrl(img, targetUrl);
    return NextResponse.json({ imageUrl: abs || null });
  } catch (e) {
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}


