import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Removed edge runtime to avoid potential issues with Supabase client

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

    const { data: signed, error: signErr } = await supabase
      .storage
      .from('invoice-ocr')
      .createSignedUrl(fileRow.storage_key, 60 * 10); // 10 minutes

    if (signErr || !signed?.signedUrl) {
      console.error('Storage error when creating signed URL:', signErr);
      return NextResponse.json({ 
        error: 'Could not create signed URL', 
        details: signErr?.message || 'Unknown storage error'
      }, { status: 500 });
    }

    return NextResponse.json({ url: signed.signedUrl });
  } catch (err) {
    console.error('Unexpected error in file-url API:', err);
    return NextResponse.json({ 
      error: 'Server error', 
      details: String(err) 
    }, { status: 500 });
  }
}


