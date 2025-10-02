import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceIdParam = searchParams.get('invoiceId');
    const invoiceId = invoiceIdParam ? parseInt(invoiceIdParam, 10) : NaN;
    if (!invoiceIdParam || Number.isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Missing or invalid invoiceId' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // First check if the invoice_ocr_files table exists and has data
    const { data: fileRow, error } = await supabase
      .from('invoice_ocr_files')
      .select('storage_key')
      .eq('invoice_ocr_id', invoiceId)
      .single();

    if (error) {
      console.error('Database error when fetching file:', error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        hint: 'Make sure the invoice_ocr_files table exists. Run the SQL in supabase-invoice-ocr-files.sql'
      }, { status: 500 });
    }

    if (!fileRow) {
      return NextResponse.json({ 
        error: 'No image found for this invoice',
        details: `No file record found for invoice ID ${invoiceId}`
      }, { status: 404 });
    }

    // Create a proxy URL that will handle authentication and serve the image
    const proxyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'}/api/invoice-ocr/proxy-image?key=${encodeURIComponent(fileRow.storage_key)}`;
    
    return NextResponse.json({ url: proxyUrl });
  } catch (err) {
    console.error('Unexpected error in file-url API:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: String(err) 
    }, { status: 500 });
  }
}


