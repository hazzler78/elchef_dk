"use client";

import Link from "next/link";

export default function PartnerTestFormPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Skjematest</h1>
      <p style={{ color: "#475569", marginBottom: 20 }}>
        Indlejrede skemaer er fjernet fra denne side. Brug de offentlige flows på hjemmesiden.
      </p>
      <Link href="/skift-elaftale" style={{ color: "#2563eb", fontWeight: 600 }}>
        Gå til skift elaftale →
      </Link>
    </main>
  );
}
