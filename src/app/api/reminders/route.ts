import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CustomerReminder } from '@/lib/types';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Helper function to calculate reminder date (11 months before contract expiry)
function calculateReminderDate(contractStartDate: string, contractType: string): string {
  const startDate = new Date(contractStartDate);
  let expiryDate: Date;
  
  switch (contractType) {
    case '12_months':
      expiryDate = new Date(startDate.getTime() + 12 * 30 * 24 * 60 * 60 * 1000);
      break;
    case '24_months':
      expiryDate = new Date(startDate.getTime() + 24 * 30 * 24 * 60 * 60 * 1000);
      break;
    case '36_months':
      expiryDate = new Date(startDate.getTime() + 36 * 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      throw new Error('Invalid contract type');
  }
  
  // Subtract 11 months (30 days * 11)
  const reminderDate = new Date(expiryDate.getTime() - 11 * 30 * 24 * 60 * 60 * 1000);
  return reminderDate.toISOString().split('T')[0];
}

// POST: Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const data: CustomerReminder = await request.json();
    
    // Validate required fields
    if (!data.customer_name || !data.email || !data.contract_type || !data.contract_start_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate reminder date
    const reminderDate = calculateReminderDate(data.contract_start_date, data.contract_type);
    
    const reminderData = {
      customer_name: data.customer_name,
      email: data.email,
      phone: data.phone || null,
      contract_type: data.contract_type,
      contract_start_date: data.contract_start_date,
      reminder_date: reminderDate,
      is_sent: false,
      notes: data.notes || null
    };

    const { data: insertedReminder, error } = await supabase
      .from('customer_reminders')
      .insert([reminderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return NextResponse.json(
        { error: 'Failed to create reminder' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reminder: insertedReminder
    });

  } catch (error) {
    console.error('Error in POST /api/reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get reminders that are due today
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: dueReminders, error } = await supabase
      .from('customer_reminders')
      .select('*')
      .eq('reminder_date', today)
      .eq('is_sent', false);

    if (error) {
      console.error('Error fetching due reminders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reminders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      dueReminders: dueReminders || []
    });

  } catch (error) {
    console.error('Error in GET /api/reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}