import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const logPath = join(process.cwd(), 'grokchat.log');
    const data = await readFile(logPath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="grokchat.log"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Loggfilen finns inte.' }, { status: 404 });
  }
} 