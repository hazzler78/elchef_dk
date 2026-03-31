'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const ADMIN_PASSWORD = "grodan2025";

interface PostalCodeStats {
  electricityArea: string;
  count: number;
  percentage: number;
}

interface PostalCodeDetail {
  postal_code: string;
  electricity_area: string;
  form_type: string;
  created_at: string;
}

export default function PostalCodesAdmin() {
  const [stats, setStats] = useState<PostalCodeStats[]>([]);
  const [topPostalCodes, setTopPostalCodes] = useState<Array<{ postal_code: string; count: number }>>([]);
  const [recentSearches, setRecentSearches] = useState<PostalCodeDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | '90d' | 'all'>('30d');
  const [totalSearches, setTotalSearches] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') setAuthed(true);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
      );

      // Calculate date range
      let fromISO: string | null = null;
      if (dateRange !== 'all') {
        const fromDate = new Date();
        if (dateRange === '24h') {
          fromDate.setHours(fromDate.getHours() - 24);
        } else {
          const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
          fromDate.setDate(fromDate.getDate() - days);
        }
        fromISO = fromDate.toISOString();
      }

      // Build query
      let query = supabase.from('postal_code_searches').select('*', { count: 'exact' });
      if (fromISO) {
        query = query.gte('created_at', fromISO);
      }

      // Get total count
      const { count: total, error: countError } = await query;
      if (countError) throw countError;
      setTotalSearches(total || 0);

      // Get statistics by electricity area
      let areaQuery = supabase
        .from('postal_code_searches')
        .select('electricity_area', { count: 'exact' });
      if (fromISO) {
        areaQuery = areaQuery.gte('created_at', fromISO);
      }

      const { data: areaData, error: areaError } = await areaQuery;
      if (areaError) throw areaError;

      // Count by area
      const areaCounts: Record<string, number> = {};
      if (areaData) {
        areaData.forEach((item: { electricity_area: string }) => {
          areaCounts[item.electricity_area] = (areaCounts[item.electricity_area] || 0) + 1;
        });
      }

      // Convert to array and calculate percentages
      const statsArray: PostalCodeStats[] = Object.entries(areaCounts)
        .map(([area, count]) => ({
          electricityArea: area,
          count,
          percentage: total ? (count / total) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      setStats(statsArray);

      // Get top postal codes
      let postalCodeQuery = supabase
        .from('postal_code_searches')
        .select('postal_code', { count: 'exact' });
      if (fromISO) {
        postalCodeQuery = postalCodeQuery.gte('created_at', fromISO);
      }

      const { data: postalCodeData, error: postalCodeError } = await postalCodeQuery;
      if (postalCodeError) throw postalCodeError;

      // Count by postal code
      const postalCodeCounts: Record<string, number> = {};
      if (postalCodeData) {
        postalCodeData.forEach((item: { postal_code: string }) => {
          postalCodeCounts[item.postal_code] = (postalCodeCounts[item.postal_code] || 0) + 1;
        });
      }

      // Get top 10 postal codes
      const topCodes = Object.entries(postalCodeCounts)
        .map(([code, count]) => ({ postal_code: code, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTopPostalCodes(topCodes);

      // Get recent searches
      let recentQuery = supabase
        .from('postal_code_searches')
        .select('postal_code, electricity_area, form_type, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (fromISO) {
        recentQuery = recentQuery.gte('created_at', fromISO);
      }

      const { data: recentData, error: recentError } = await recentQuery;
      if (recentError) throw recentError;
      setRecentSearches(recentData || []);
    } catch (err) {
      console.error('Error fetching postal code stats:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (authed) {
      fetchStats();
    }
  }, [authed, fetchStats]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem('admin_authed', 'true');
      setError('');
    } else {
      setError('Forkert adgangskode!');
    }
  }

  const getAreaName = (area: string) => {
    const names: Record<string, string> = {
      'se1': 'SE1 (Norra Sverige)',
      'se2': 'SE2 (Södra Sverige)',
      'se3': 'SE3 (Mitt Sverige)',
      'se4': 'SE4 (Sydvästra Sverige)'
    };
    return names[area] || area;
  };

  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      'se1': '#3b82f6', // blue
      'se2': '#10b981', // green
      'se3': '#f59e0b', // amber
      'se4': '#ef4444'  // red
    };
    return colors[area] || '#6b7280';
  };

  if (!authed) {
    return (
      <div style={{ 
        maxWidth: 400, 
        margin: '4rem auto', 
        padding: 24, 
        border: '1px solid #e5e7eb', 
        borderRadius: 12,
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Adminindlogning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Adgangskode"
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16, 
              marginBottom: 12, 
              borderRadius: 8, 
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box'
            }}
            autoFocus
          />
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: 12, 
              fontSize: 16, 
              borderRadius: 8, 
              background: 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Log ind
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1400, 
      margin: '2rem auto', 
      padding: 24,
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 32
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: 8,
            fontWeight: 700,
            color: '#1f2937'
          }}>
            📍 Postnummersökningar
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Se vilka elområden som är mest populära baserat på kunders postnummersökningar
          </p>
        </div>
        <Link 
          href="/admin" 
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#f3f4f6', 
            borderRadius: 8, 
            textDecoration: 'none',
            color: '#374151',
            fontWeight: 500
          }}
        >
          ← Tillbaka
        </Link>
      </div>

      {/* Date Range Selector */}
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        gap: 8,
        flexWrap: 'wrap'
      }}>
        {(['24h', '7d', '30d', '90d', 'all'] as const).map(range => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              background: dateRange === range ? 'var(--primary)' : 'white',
              color: dateRange === range ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: dateRange === range ? 600 : 400
            }}
          >
            {range === 'all' ? 'Alla' : range === '24h' ? '24 timmar' : range === '7d' ? '7 dagar' : range === '30d' ? '30 dagar' : '90 dagar'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#6b7280' }}>Laddar...</div>
        </div>
      ) : error ? (
        <div style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '1rem', 
          borderRadius: 8,
          marginBottom: 24
        }}>
          {error}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 8 }}>
                Totalt antal sökningar
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                {totalSearches.toLocaleString('sv-SE')}
              </div>
            </div>
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 8 }}>
                Antal elområden
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937' }}>
                {stats.length}
              </div>
            </div>
          </div>

          {/* Electricity Area Statistics */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: 32
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 600 }}>
              Populära elområden
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats.map((stat) => (
                <div key={stat.electricityArea}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: getAreaColor(stat.electricityArea)
                      }} />
                      <span style={{ fontWeight: 600, color: '#1f2937' }}>
                        {getAreaName(stat.electricityArea)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {stat.count.toLocaleString('sv-SE')} sökningar
                      </span>
                      <span style={{ 
                        fontWeight: 600, 
                        color: '#1f2937',
                        minWidth: 60,
                        textAlign: 'right'
                      }}>
                        {stat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div style={{
                    height: 8,
                    background: '#f3f4f6',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${stat.percentage}%`,
                      background: getAreaColor(stat.electricityArea),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              ))}
              {stats.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Inga sökningar hittades för den valda perioden
                </div>
              )}
            </div>
          </div>

          {/* Top Postal Codes */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            marginBottom: 32
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 600 }}>
              Mest sökta postnummer
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {topPostalCodes.map((item) => (
                <div key={item.postal_code} style={{
                  padding: 12,
                  background: '#f9fafb',
                  borderRadius: 8,
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 4 }}>
                    {item.postal_code}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {item.count} {item.count === 1 ? 'sökning' : 'sökningar'}
                  </div>
                </div>
              ))}
              {topPostalCodes.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Inga postnummer hittades
                </div>
              )}
            </div>
          </div>

          {/* Recent Searches */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', fontWeight: 600 }}>
              Senaste sökningar
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Postnummer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Elområde</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Formulärtyp</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSearches.map((search, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', color: '#1f2937' }}>{search.postal_code}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: `${getAreaColor(search.electricity_area)}20`,
                          color: getAreaColor(search.electricity_area),
                          fontWeight: 500,
                          fontSize: '0.875rem'
                        }}>
                          {search.electricity_area}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.875rem' }}>
                        {search.form_type || '-'}
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.875rem' }}>
                        {new Date(search.created_at).toLocaleString('sv-SE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                  {recentSearches.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        Inga sökningar hittades
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
