"use client";

import GlassButton from '@/components/GlassButton';

export default function GoHomeButton() {
  return (
    <GlassButton
      variant="primary"
      size="lg"
      onClick={() => window.open('/', '_self')}
      background={'linear-gradient(135deg, rgba(0,201,107,0.95), rgba(22,147,255,0.95))'}
    >
      Se ditt pris nu
    </GlassButton>
  );
} 