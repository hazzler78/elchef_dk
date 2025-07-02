import { NextRequest, NextResponse } from 'next/server';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validera e-postadress
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ogiltig e-postadress' },
        { status: 400 }
      );
    }

    // Kontrollera att API-nyckeln finns
    if (!MAILERLITE_API_KEY) {
      console.error('MAILERLITE_API_KEY saknas i miljövariabler');
      return NextResponse.json(
        { error: 'Konfigurationsfel' },
        { status: 500 }
      );
    }

    // Bygg body för Mailerlite
    const body: Record<string, unknown> = {
      email: email,
      status: 'active',
    };
    if (MAILERLITE_GROUP_ID && !isNaN(Number(MAILERLITE_GROUP_ID))) {
      body.groups = [Number(MAILERLITE_GROUP_ID)];
    }
    // Om grupp-ID saknas eller är ogiltigt, skicka inte 'groups' alls (prenumerant hamnar i "All subscribers")

    // Lägg till prenumerant i Mailerlite
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mailerlite API error:', errorData);
      // Hantera specifika fel
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Denna e-postadress är redan registrerad' },
          { status: 409 }
        );
      }
      if (errorData?.errors?.['groups.0']?.includes('The selected groups.0 is invalid.')) {
        return NextResponse.json(
          { error: 'Felaktigt grupp-ID för Mailerlite. Kontrollera att MAILERLITE_GROUP_ID är korrekt eller ta bort den från .env.local för att lägga till prenumeranter i "All subscribers".' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Kunde inte registrera e-postadressen' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Prenumeration registrerad',
        subscriber_id: data.data.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid registrering' },
      { status: 500 }
    );
  }
} 