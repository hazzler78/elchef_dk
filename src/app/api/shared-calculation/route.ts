import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'edge';

const PLATFORM_FALLBACK = 'ukendt kanal';
const INVOICE_MARKET = 'DK';

function parseLocalizedAmount(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(/[^0-9,.-]/g, '');
  if (!cleaned) return 0;

  const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function extractYearlySavings(text: string): number {
  if (!text) return 0;

  const yearlyPatterns = [
    /=\s*([0-9][0-9.\s,]*)\s*kr\/år/i,
    /(?:spar(?:er)?\s*i\s*alt|spara\s*totalt)\s*([0-9][0-9.\s,]*)\s*kr\/år/i,
    /(?:samlet|total)\s*besparelse[^0-9]{0,40}([0-9][0-9.\s,]*)\s*kr\/år/i,
    /(?:din\s*årlige\s*besparing|din\s*årlige\s*besparelse|din\s*årliga\s*besparing)[^0-9]{0,40}([0-9][0-9.\s,]*)\s*kr\/år/i,
    /(?:spara|spar(?:er)?)\s*([0-9][0-9.\s,]*)\s*kr\/år/i,
  ];
  for (const pattern of yearlyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseLocalizedAmount(match[1]);
      if (amount > 0) return Math.round(amount);
    }
  }

  const monthlyPatterns = [
    /(?:du\s*betaler|du\s*betalar)[^0-9]{0,40}([0-9][0-9.\s,]*)\s*kr\/m(?:å|a)nad/i,
    /(?:unødige|onödiga)\s*(?:omkostninger|kostnader)[^0-9]{0,60}([0-9][0-9.\s,]*)\s*kr\/m(?:å|a)nad/i,
  ];
  for (const pattern of monthlyPatterns) {
    const match = text.match(pattern);
    if (match) {
      const monthly = parseLocalizedAmount(match[1]);
      if (monthly > 0) return Math.round(monthly * 12);
    }
  }

  return 0;
}

export async function GET(req: NextRequest) {
  const idParam = req.nextUrl.searchParams.get('id');
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Ugyldigt id' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServerClient();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoice_ocr')
      .select('id, created_at, gpt_answer')
      .eq('id', id)
      .eq('market', INVOICE_MARKET)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Beregning ikke fundet' }, { status: 404 });
    }

    const { data: shareClick } = await supabase
      .from('share_clicks')
      .select('platform')
      .eq('log_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const savingsAmount = extractYearlySavings(invoice.gpt_answer || '');

    return NextResponse.json({
      id: String(invoice.id),
      savingsAmount,
      analysisDate: invoice.created_at,
      platform: shareClick?.platform || PLATFORM_FALLBACK,
      isAnonymous: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ukendt fejl';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
