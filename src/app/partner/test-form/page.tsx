"use client";

import SalesysForm from "@/components/SalesysForm";

export default function PartnerTestFormPage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Testa Salesys‑formulär</h1>
      <p style={{ color: "#475569", marginBottom: 20 }}>
        Denna sida är för att testa inbäddningen av Salesys‑formulär i Vercel Preview.
      </p>

      <SalesysForm
        containerId="salesys-form-test"
        formId="tmp-9075a4d0-eca0-4466-86db-6ae1c41f05d9"
        options={{ width: "100%" }}
      />
    </main>
  );
}


