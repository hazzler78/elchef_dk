"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_PASSWORD = "grodan2025";

type BannerClick = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  href: string | null;
  variant: string | null;
};

type BannerImpression = {
  id: number;
  created_at: string;
  session_id: string | null;
  user_agent: string | null;
  referer: string | null;
  variant: string | null;
};

export default function AdminBannerClicks() {
  const [logs, setLogs] = useState<BannerClick[]>([]);
  const [impressions, setImpressions] = useState<BannerImpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banner_clicks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setLogs(data as BannerClick[]);
    const imp = await supabase
      .from('banner_impressions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!imp.error && imp.data) setImpressions(imp.data as BannerImpression[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchLogs();
  }, [authed]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setError('');
    } else {
      setError('Fel lösenord!');
    }
  }

  if (!authed) {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
            style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
            autoFocus
          />
          <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 6, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600 }}>
            Logga in
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    );
  }

  const filtered = logs.filter(l =>
    !search ||
    (l.session_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.user_agent || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.href || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.variant || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: 24 }}>
      <h1>Bannerklick (Admin)</h1>
      <p style={{ color: '#64748b', marginTop: 4, marginBottom: 12 }}>
        CTR = klick / visningar per variant (senaste hämtningen)
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          placeholder="Sök (session, agent, href, variant)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }}
        />
        <button onClick={fetchLogs} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Uppdatera</button>
      </div>
      {loading && <p>Laddar...</p>}
      {!loading && filtered.length === 0 && <p>Inga klickloggar.</p>}

      {!loading && filtered.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Datum</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Variant</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Session</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Href</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Referer</th>
              <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Agent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id}>
                <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{new Date(l.created_at).toLocaleString()}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{l.variant}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12 }}>{l.session_id}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.href || ''}>{l.href}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.referer || ''}>{l.referer}</td>
                <td style={{ padding: 8, border: '1px solid #e5e7eb', fontSize: 12 }}>{l.user_agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* CTR per variant */}
      {!loading && (
        <div style={{ marginTop: 24 }}>
          <h2>CTR per variant</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Variant</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Visningar</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Klick</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>CTR</th>
              </tr>
            </thead>
            <tbody>
              {['A','B'].map(v => {
                const vClicks = logs.filter(l => l.variant === v).length;
                const vImps = impressions.filter(i => i.variant === v).length;
                const ctr = vImps > 0 ? `${((vClicks / vImps) * 100).toFixed(1)}%` : '—';
                return (
                  <tr key={v}>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{v}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{vImps}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{vClicks}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{ctr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


