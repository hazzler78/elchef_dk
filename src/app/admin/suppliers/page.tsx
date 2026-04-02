'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = 'grodan2025';

type SupplierRow = {
  id: string;
  name: string;
  markup_ore_per_kwh: number | string;
  monthly_fee_dkk: number | string;
  notes: string | null;
  signup_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function num(v: number | string): number {
  const n = typeof v === 'string' ? parseFloat(v.replace(/\s/g, '').replace(',', '.')) : v;
  return Number.isFinite(n) ? n : 0;
}

function parseMarkupInput(s: string): number {
  const t = s.replace(/\s/g, '').replace(',', '.').trim();
  if (t === '' || t === '-' || t === '+') return 0;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

export default function AdminSuppliersPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const [newName, setNewName] = useState('');
  const [newMarkup, setNewMarkup] = useState('0');
  const [newFee, setNewFee] = useState('0');
  const [newNotes, setNewNotes] = useState('');
  const [newSignupUrl, setNewSignupUrl] = useState('');
  const [newSort, setNewSort] = useState('0');
  const [newActive, setNewActive] = useState(true);

  const [editDraft, setEditDraft] = useState<SupplierRow | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_authed') === 'true') {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed || typeof window === 'undefined') return;
    if (!sessionStorage.getItem('admin_pw')) {
      setMsg(
        'Du er logget ind uden gemt adgangskode til API. Log ind igen via /admin (eller her) for at kunne gemme og slette.'
      );
    }
  }, [authed]);

  const getAdminPw = () =>
    typeof window !== 'undefined' ? sessionStorage.getItem('admin_pw') || '' : '';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setMsg('');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );
      const { data, error: qErr } = await supabase
        .from('supplier_markups')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (qErr) throw qErr;
      setRows((data as SupplierRow[]) || []);
    } catch (e) {
      console.error(e);
      setMsg(e instanceof Error ? e.message : 'Kunne ikke hente leverandører');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) void load();
  }, [authed, load]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      sessionStorage.setItem('admin_pw', input);
      setError('');
      setMsg('');
    } else {
      setError('Forkert adgangskode!');
    }
  }

  async function addSupplier(e: React.FormEvent) {
    e.preventDefault();
    const pw = getAdminPw();
    if (!pw) {
      setMsg('Log ind igen fra /admin (adgangskode gemmes til API-kald).');
      return;
    }
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify({
          name: newName.trim(),
          markup_ore_per_kwh: (() => {
            const t = newMarkup.replace(/\s/g, '').replace(',', '.').trim();
            if (t === '' || t === '-' || t === '+') return 0;
            const n = parseFloat(t);
            return Number.isFinite(n) ? n : 0;
          })(),
          monthly_fee_dkk: parseFloat(newFee.replace(',', '.')) || 0,
          notes: newNotes.trim() || null,
          signup_url: newSignupUrl.trim() || null,
          sort_order: parseInt(newSort, 10) || 0,
          active: newActive,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Fejl');
      setNewName('');
      setNewMarkup('0');
      setNewFee('0');
      setNewNotes('');
      setNewSignupUrl('');
      setNewSort('0');
      setNewActive(true);
      await load();
      setMsg('Leverandør tilføjet.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Fejl');
    }
  }

  async function saveRow(row: SupplierRow) {
    const pw = getAdminPw();
    if (!pw) {
      setMsg('Log ind igen fra /admin.');
      return;
    }
    try {
      const res = await fetch('/api/admin/suppliers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': pw,
        },
        body: JSON.stringify({
          id: row.id,
          name: row.name.trim(),
          markup_ore_per_kwh: parseMarkupInput(String(row.markup_ore_per_kwh)),
          monthly_fee_dkk: num(String(row.monthly_fee_dkk)),
          notes: row.notes?.trim() || null,
          signup_url: row.signup_url?.trim() || null,
          sort_order: row.sort_order,
          active: row.active,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Fejl');
      await load();
      setEditDraft(null);
      setMsg('Gemt.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Fejl');
    }
  }

  async function deleteRow(id: string) {
    if (!confirm('Slette denne leverandør?')) return;
    const pw = getAdminPw();
    if (!pw) {
      setMsg('Log ind igen fra /admin.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/suppliers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': pw },
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Fejl');
      await load();
      setMsg('Slettet.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Fejl');
    }
  }

  function updateRow(id: string, patch: Partial<SupplierRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (!authed) {
    return (
      <div
        style={{
          maxWidth: 400,
          margin: '4rem auto',
          padding: 24,
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          background: 'white',
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Admin</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Adgangskode"
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 12,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Log ind
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link href="/admin">← Tilbage til admin</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/admin" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          ← Admin
        </Link>
        <h1 style={{ margin: 0, flex: 1 }}>Leverandører og påslag</h1>
        <button
          type="button"
          onClick={() => void load()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Genindlæs
        </button>
      </div>

      <p style={{ color: '#64748b', marginBottom: 24, maxWidth: 720 }}>
        Tilføj og rediger elleverandører med <strong>påslag</strong> (øre per kWh), valgfrit{' '}
        <strong>månedsgebyr</strong> (DKK) og <strong>tilmeldingslink</strong> (ekstern URL til postnummer, forbrug,
        CPR og signering). Data gemmes i Supabase — kør <code>supabase-supplier-markups.sql</code>, hvis tabellen
        mangler eller der er nye kolonner.
      </p>
      <p style={{ color: '#334155', marginBottom: 24, fontSize: 15 }}>
        <strong>Eksisterende leverandører:</strong> Klik <strong>Rediger</strong> for fuld formular i dialog, eller
        ret direkte i tabellen og klik <strong>Gem ændringer</strong>.
      </p>

      {editDraft && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-supplier-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditDraft(null);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 24,
              boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }}
          >
            <h2 id="edit-supplier-title" style={{ margin: '0 0 16px 0', fontSize: '1.25rem' }}>
              Rediger leverandør
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Navn</span>
                <input
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Påslag (øre/kWh){' '}
                  <span style={{ fontWeight: 400, color: '#64748b' }}>(negativ = rabat)</span>
                </span>
                <input
                  value={String(editDraft.markup_ore_per_kwh)}
                  onChange={(e) =>
                    setEditDraft((d) =>
                      d ? { ...d, markup_ore_per_kwh: e.target.value as unknown as number } : d
                    )
                  }
                  inputMode="decimal"
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Månedsgebyr (kr)</span>
                <input
                  value={String(editDraft.monthly_fee_dkk)}
                  onChange={(e) =>
                    setEditDraft((d) =>
                      d ? { ...d, monthly_fee_dkk: e.target.value as unknown as number } : d
                    )
                  }
                  inputMode="decimal"
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Sortering</span>
                <input
                  type="number"
                  value={editDraft.sort_order}
                  onChange={(e) =>
                    setEditDraft((d) =>
                      d ? { ...d, sort_order: parseInt(e.target.value, 10) || 0 } : d
                    )
                  }
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={editDraft.active}
                  onChange={(e) =>
                    setEditDraft((d) => (d ? { ...d, active: e.target.checked } : d))
                  }
                />
                <span>Aktiv (synlig på sitet)</span>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Noter (valgfrit)</span>
                <input
                  value={editDraft.notes || ''}
                  onChange={(e) =>
                    setEditDraft((d) => (d ? { ...d, notes: e.target.value || null } : d))
                  }
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Tilmeldingslink</span>
                <input
                  value={editDraft.signup_url || ''}
                  onChange={(e) =>
                    setEditDraft((d) => (d ? { ...d, signup_url: e.target.value || null } : d))
                  }
                  placeholder="https://"
                  style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => editDraft && void saveRow(editDraft)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Gem ændringer
              </button>
              <button
                type="button"
                onClick={() => setEditDraft(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Annuller
              </button>
            </div>
          </div>
        </div>
      )}

      {msg && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: '#f1f5f9',
            color: '#334155',
          }}
        >
          {msg}
        </div>
      )}

      <form
        onSubmit={addSupplier}
        style={{
          marginBottom: 32,
          padding: 20,
          background: '#f8fafc',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        }}
      >
        <h3 style={{ gridColumn: '1 / -1', margin: '0 0 8px 0' }}>Ny leverandør</h3>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Navn</span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Påslag (øre/kWh){' '}
            <span style={{ fontWeight: 400, color: '#64748b' }}>(negativ = rabat)</span>
          </span>
          <input
            value={newMarkup}
            onChange={(e) => setNewMarkup(e.target.value)}
            type="text"
            inputMode="decimal"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Månedsgebyr (kr)</span>
          <input
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            type="text"
            inputMode="decimal"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Sortering</span>
          <input
            value={newSort}
            onChange={(e) => setNewSort(e.target.value)}
            type="number"
            style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <input type="checkbox" checked={newActive} onChange={(e) => setNewActive(e.target.checked)} />
          Aktiv
        </label>
        <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Noter (valgfrit)</span>
          <input
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </label>
        <label style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Tilmeldingslink (https:// …)</span>
          <input
            value={newSignupUrl}
            onChange={(e) => setNewSignupUrl(e.target.value)}
            type="url"
            placeholder="https://partner.dk/..."
            style={{ padding: 8, borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </label>
        <button
          type="submit"
          style={{
            gridColumn: '1 / -1',
            justifySelf: 'start',
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Tilføj leverandør
        </button>
      </form>

      {loading ? (
        <p>Indlæser…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: '#64748b' }}>Ingen leverandører endnu — tilføj ovenfor.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: 10 }}>Navn</th>
                <th style={{ padding: 10 }}>Påslag (øre/kWh, − = rabat)</th>
                <th style={{ padding: 10 }}>Månedsgebyr (kr)</th>
                <th style={{ padding: 10 }}>Sortering</th>
                <th style={{ padding: 10 }}>Aktiv</th>
                <th style={{ padding: 10 }}>Noter</th>
                <th style={{ padding: 10 }}>Tilmeldingslink</th>
                <th style={{ padding: 10 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 8 }}>
                    <input
                      value={r.name}
                      onChange={(e) => updateRow(r.id, { name: e.target.value })}
                      style={{ width: '100%', minWidth: 140, padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={String(r.markup_ore_per_kwh)}
                      onChange={(e) =>
                        updateRow(r.id, { markup_ore_per_kwh: e.target.value as unknown as number })
                      }
                      style={{ width: 96, padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={String(r.monthly_fee_dkk)}
                      onChange={(e) =>
                        updateRow(r.id, { monthly_fee_dkk: e.target.value as unknown as number })
                      }
                      style={{ width: 96, padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="number"
                      value={r.sort_order}
                      onChange={(e) => updateRow(r.id, { sort_order: parseInt(e.target.value, 10) || 0 })}
                      style={{ width: 72, padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      type="checkbox"
                      checked={r.active}
                      onChange={(e) => updateRow(r.id, { active: e.target.checked })}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={r.notes || ''}
                      onChange={(e) => updateRow(r.id, { notes: e.target.value || null })}
                      style={{ width: '100%', minWidth: 120, padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      value={r.signup_url || ''}
                      onChange={(e) =>
                        updateRow(r.id, { signup_url: e.target.value || null })
                      }
                      type="url"
                      placeholder="https://"
                      style={{ width: '100%', minWidth: 200, padding: 6, borderRadius: 4, border: '1px solid #e2e8f0' }}
                    />
                  </td>
                  <td style={{ padding: 8, whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const current = rows.find((x) => x.id === r.id);
                        if (current) setEditDraft({ ...current });
                      }}
                      style={{
                        marginRight: 8,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #0ea5e9',
                        background: 'white',
                        color: '#0ea5e9',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Rediger
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const current = rows.find((x) => x.id === r.id);
                        if (current) void saveRow(current);
                      }}
                      style={{
                        marginRight: 8,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#0ea5e9',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Gem ændringer
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteRow(r.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#ef4444',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      Slet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
