'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const ADMIN_PASSWORD = "grodan2025";

interface DashboardStats {
  // Funnel metrics
  pageViews: number;
  aiAnalyses: number;
  contractClicks: number;
  formSubmissions: number;
  
  // Business metrics
  totalSavings: number;
  averageSavings: number;
  newsletterSubs: number;
  
  // Engagement
  contractClicksWithAi: number;
  contractClicksWithoutAi: number;
  socialShares: number;
  
  // A/B Tests
  heroWinner: { variant: string; ctr: number } | null;
  bannerWinner: { variant: string; ctr: number } | null;
  
  // Growth (vs previous period)
  pageViewsGrowth: number;
  aiAnalysesGrowth: number;
  
  // UTM Performance
  topUtmSources: Array<{ source: string; visits: number; conversions: number }>;
  topUtmCampaigns: Array<{ campaign: string; visits: number; conversions: number }>;
  
  // Time-based
  dailyStats: Array<{ date: string; views: number; analyses: number; clicks: number }>;
  
  // Contract preference
  rorligtVsFastpris: { rorligt: number; fastpris: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');

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

      // Calculate date ranges
      const fromDate = new Date();
      if (dateRange === '24h') {
        fromDate.setHours(fromDate.getHours() - 24);
      } else {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        fromDate.setDate(fromDate.getDate() - days);
      }
      const fromISO = fromDate.toISOString();
      
      // For growth comparison
      const prevFromDate = new Date(fromDate);
      if (dateRange === '24h') {
        prevFromDate.setHours(prevFromDate.getHours() - 24);
      } else {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        prevFromDate.setDate(prevFromDate.getDate() - days);
      }
      const prevFromISO = prevFromDate.toISOString();

      // 1. Page Views
      const { count: pageViews, error: pageViewsError } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromISO);

      if (pageViewsError) {
        console.error('Page views error:', pageViewsError);
        throw new Error(`Page views: ${pageViewsError.message}`);
      }

      const { count: prevPageViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevFromISO)
        .lt('created_at', fromISO);

      // 2. AI Analyses
      const { count: aiAnalyses } = await supabase
        .from('invoice_ocr')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromISO);

      const { count: prevAiAnalyses } = await supabase
        .from('invoice_ocr')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevFromISO)
        .lt('created_at', fromISO);

      // 3. Contract Clicks
      const { data: contractClicksData } = await supabase
        .from('contract_clicks')
        .select('*')
        .gte('created_at', fromISO);

      const contractClicks = contractClicksData?.length || 0;
      const contractClicksWithAi = contractClicksData?.filter(c => c.log_id !== null).length || 0;
      const contractClicksWithoutAi = contractClicks - contractClicksWithAi;
      
      const rorligt = contractClicksData?.filter(c => c.contract_type === 'rorligt').length || 0;
      const fastpris = contractClicksData?.filter(c => c.contract_type === 'fastpris').length || 0;

      // Calculate total savings
      const savingsAmounts = (contractClicksData || [])
        .map(c => (typeof c.savings_amount === 'number' ? c.savings_amount : 0))
        .filter(v => v > 0);
      const totalSavings = savingsAmounts.reduce((sum, amount) => sum + amount, 0);
      const averageSavings = savingsAmounts.length > 0 ? totalSavings / savingsAmounts.length : 0;

      // 4. Form Submissions
      const { count: formSubmissions } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromISO);

      const { data: contactsData } = await supabase
        .from('contacts')
        .select('subscribe_newsletter')
        .gte('created_at', fromISO);
      
      const newsletterSubs = contactsData?.filter(c => c.subscribe_newsletter).length || 0;

      // 5. Social Shares
      const { count: socialShares } = await supabase
        .from('share_clicks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fromISO);

      // 6. A/B Test Results - Hero
      const { data: heroImpressions } = await supabase
        .from('hero_impressions')
        .select('variant')
        .gte('created_at', fromISO);

      const { data: heroClicks } = await supabase
        .from('hero_clicks')
        .select('variant')
        .gte('created_at', fromISO);

      let heroWinner = null;
      if (heroImpressions && heroClicks) {
        const heroA_imp = heroImpressions.filter(h => h.variant === 'A').length;
        const heroB_imp = heroImpressions.filter(h => h.variant === 'B').length;
        const heroA_clk = heroClicks.filter(h => h.variant === 'A').length;
        const heroB_clk = heroClicks.filter(h => h.variant === 'B').length;
        
        const ctrA = heroA_imp > 0 ? (heroA_clk / heroA_imp) : 0;
        const ctrB = heroB_imp > 0 ? (heroB_clk / heroB_imp) : 0;
        
        if (ctrA > 0 || ctrB > 0) {
          heroWinner = ctrA >= ctrB 
            ? { variant: 'A', ctr: ctrA * 100 }
            : { variant: 'B', ctr: ctrB * 100 };
        }
      }

      // 7. A/B Test Results - Banner
      const { data: bannerImpressions } = await supabase
        .from('banner_impressions')
        .select('variant')
        .gte('created_at', fromISO);

      const { data: bannerClicks } = await supabase
        .from('banner_clicks')
        .select('variant')
        .gte('created_at', fromISO);

      let bannerWinner = null;
      if (bannerImpressions && bannerClicks) {
        const bannerA_imp = bannerImpressions.filter(b => b.variant === 'A').length;
        const bannerB_imp = bannerImpressions.filter(b => b.variant === 'B').length;
        const bannerA_clk = bannerClicks.filter(b => b.variant === 'A').length;
        const bannerB_clk = bannerClicks.filter(b => b.variant === 'B').length;
        
        const ctrA = bannerA_imp > 0 ? (bannerA_clk / bannerA_imp) : 0;
        const ctrB = bannerB_imp > 0 ? (bannerB_clk / bannerB_imp) : 0;
        
        if (ctrA > 0 || ctrB > 0) {
          bannerWinner = ctrA >= ctrB 
            ? { variant: 'A', ctr: ctrA * 100 }
            : { variant: 'B', ctr: ctrB * 100 };
        }
      }

      // 8. UTM Performance
      const { data: pageViewsData } = await supabase
        .from('page_views')
        .select('utm_source, utm_campaign, session_id')
        .gte('created_at', fromISO);

      // Top UTM Sources
      const sourceMap = new Map<string, { visits: number; sessions: Set<string> }>();
      pageViewsData?.forEach(pv => {
        const source = pv.utm_source || 'direct';
        if (!sourceMap.has(source)) {
          sourceMap.set(source, { visits: 0, sessions: new Set() });
        }
        const entry = sourceMap.get(source)!;
        entry.visits++;
        if (pv.session_id) entry.sessions.add(pv.session_id);
      });

      const topUtmSources = Array.from(sourceMap.entries())
        .map(([source, data]) => ({
          source,
          visits: data.visits,
          conversions: 0 // Could calculate from contract_clicks with matching UTM
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

      // Top UTM Campaigns
      const campaignMap = new Map<string, { visits: number; sessions: Set<string> }>();
      pageViewsData?.forEach(pv => {
        const campaign = pv.utm_campaign || 'none';
        if (campaign === 'none') return;
        if (!campaignMap.has(campaign)) {
          campaignMap.set(campaign, { visits: 0, sessions: new Set() });
        }
        const entry = campaignMap.get(campaign)!;
        entry.visits++;
        if (pv.session_id) entry.sessions.add(pv.session_id);
      });

      const topUtmCampaigns = Array.from(campaignMap.entries())
        .map(([campaign, data]) => ({
          campaign,
          visits: data.visits,
          conversions: 0
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

      // 9. Daily Stats (last 7 days regardless of range)
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      
      const { data: recentPageViews } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', last7Days.toISOString());

      const { data: recentAnalyses } = await supabase
        .from('invoice_ocr')
        .select('created_at')
        .gte('created_at', last7Days.toISOString());

      const { data: recentClicks } = await supabase
        .from('contract_clicks')
        .select('created_at')
        .gte('created_at', last7Days.toISOString());

      // Group by date
      const dailyMap = new Map<string, { views: number; analyses: number; clicks: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, { views: 0, analyses: 0, clicks: 0 });
      }

      recentPageViews?.forEach(pv => {
        const date = pv.created_at.split('T')[0];
        if (dailyMap.has(date)) {
          dailyMap.get(date)!.views++;
        }
      });

      recentAnalyses?.forEach(a => {
        const date = a.created_at.split('T')[0];
        if (dailyMap.has(date)) {
          dailyMap.get(date)!.analyses++;
        }
      });

      recentClicks?.forEach(c => {
        const date = c.created_at.split('T')[0];
        if (dailyMap.has(date)) {
          dailyMap.get(date)!.clicks++;
        }
      });

      const dailyStats = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate growth
      const pageViewsGrowth = prevPageViews && prevPageViews > 0 
        ? ((pageViews || 0) - prevPageViews) / prevPageViews * 100 
        : 0;
      
      const aiAnalysesGrowth = prevAiAnalyses && prevAiAnalyses > 0
        ? ((aiAnalyses || 0) - prevAiAnalyses) / prevAiAnalyses * 100
        : 0;

      setStats({
        pageViews: pageViews || 0,
        aiAnalyses: aiAnalyses || 0,
        contractClicks,
        formSubmissions: formSubmissions || 0,
        totalSavings,
        averageSavings,
        newsletterSubs,
        contractClicksWithAi,
        contractClicksWithoutAi,
        socialShares: socialShares || 0,
        heroWinner,
        bannerWinner,
        pageViewsGrowth,
        aiAnalysesGrowth,
        topUtmSources,
        topUtmCampaigns,
        dailyStats,
        rorligtVsFastpris: { rorligt, fastpris }
      });

    } catch (e) {
      setError('Kunde inte hämta data: ' + (e instanceof Error ? e.message : 'Okänt fel'));
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (!authed) return;
    fetchStats();
  }, [authed, fetchStats]);

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
      <div style={{ 
        maxWidth: 400, 
        margin: '4rem auto', 
        padding: 24, 
        border: '1px solid #e5e7eb', 
        borderRadius: 12,
        background: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Admininloggning</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Lösenord"
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
            Logga in
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ 
      maxWidth: 1400, 
      margin: '2rem auto', 
      padding: 24,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 32
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
            📊 Dashboard
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Översikt över Elchef.se&apos;s prestanda
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as '24h' | '7d' | '30d' | '90d')}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 8, 
              border: '1px solid #cbd5e1',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <option value="24h">Senaste 24 timmarna</option>
            <option value="7d">Senaste 7 dagarna</option>
            <option value="30d">Senaste 30 dagarna</option>
            <option value="90d">Senaste 90 dagarna</option>
          </select>
          <Link href="/admin" style={{ 
            padding: '8px 16px', 
            borderRadius: 8, 
            border: '1px solid #cbd5e1',
            textDecoration: 'none',
            color: '#374151',
            fontSize: 14,
            fontWeight: 500
          }}>
            ← Tillbaka
          </Link>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '1.25rem', color: '#6b7280' }}>Laddar dashboard...</p>
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: 16, 
          borderRadius: 8,
          marginBottom: 24
        }}>
          <strong>Fel:</strong> {error}
          <div style={{ marginTop: 8, fontSize: '0.875rem' }}>
            Kontrollera att page_views tabellen existerar i Supabase och att RLS-policies tillåter läsning.
          </div>
        </div>
      )}
      
      {!loading && !error && stats && stats.pageViews === 0 && (
        <div style={{ 
          background: '#fffbeb', 
          border: '1px solid #fbbf24', 
          color: '#92400e', 
          padding: 16, 
          borderRadius: 8,
          marginBottom: 24
        }}>
          <strong>ℹ️ Ingen data ännu:</strong> Inga besökare har registrerats i page_views tabellen. 
          Besøg startsiden eller /sammenlign-elpriser for at generere data.
          <div style={{ marginTop: 8, fontSize: '0.875rem' }}>
            Tracking er aktiveret på: / og /sammenlign-elpriser
          </div>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Hero Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            <MetricCard 
              title="Besökare"
              value={stats.pageViews}
              growth={stats.pageViewsGrowth}
              icon="👥"
              color="#3b82f6"
            />
            <MetricCard 
              title="AI-analyser"
              value={stats.aiAnalyses}
              growth={stats.aiAnalysesGrowth}
              icon="🤖"
              color="#8b5cf6"
            />
            <MetricCard 
              title="Kontraktsklick"
              value={stats.contractClicks}
              icon="📈"
              color="#10b981"
            />
            <MetricCard 
              title="Leads"
              value={stats.formSubmissions}
              icon="✉️"
              color="#f59e0b"
            />
          </div>

          {/* Conversion Funnel */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Conversion Funnel</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FunnelStep 
                label="Besökare"
                value={stats.pageViews}
                percent={100}
                color="#3b82f6"
              />
              <FunnelArrow />
              <FunnelStep 
                label="AI-analyser"
                value={stats.aiAnalyses}
                percent={stats.pageViews > 0 ? (stats.aiAnalyses / stats.pageViews * 100) : 0}
                color="#8b5cf6"
              />
              <FunnelArrow />
              <FunnelStep 
                label="Kontraktsklick"
                value={stats.contractClicks}
                percent={stats.aiAnalyses > 0 ? (stats.contractClicks / stats.aiAnalyses * 100) : 0}
                color="#10b981"
              />
              <FunnelArrow />
              <FunnelStep 
                label="Leads"
                value={stats.formSubmissions}
                percent={stats.contractClicks > 0 ? (stats.formSubmissions / stats.contractClicks * 100) : 0}
                color="#f59e0b"
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24,
            marginBottom: 24
          }}>
            {/* Business Impact */}
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Affärspåverkan</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 4 }}>Total besparing</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {formatCurrency(stats.totalSavings)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 4 }}>Genomsnittlig besparing</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {formatCurrency(stats.averageSavings)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 4 }}>Nyhetsbrevsprenumeranter</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {stats.newsletterSubs}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 4 }}>Sociala delningar</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {stats.socialShares}
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Preference */}
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Avtalsval</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Rörligt avtal</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {stats.rorligtVsFastpris.rorligt} ({stats.contractClicks > 0 ? ((stats.rorligtVsFastpris.rorligt / stats.contractClicks) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div style={{ 
                    height: 12, 
                    background: '#e5e7eb', 
                    borderRadius: 6, 
                    overflow: 'hidden' 
                  }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--secondary)', 
                      width: `${stats.contractClicks > 0 ? (stats.rorligtVsFastpris.rorligt / stats.contractClicks * 100) : 0}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Fastpris</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      {stats.rorligtVsFastpris.fastpris} ({stats.contractClicks > 0 ? ((stats.rorligtVsFastpris.fastpris / stats.contractClicks) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div style={{ 
                    height: 12, 
                    background: '#e5e7eb', 
                    borderRadius: 6, 
                    overflow: 'hidden' 
                  }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--primary)', 
                      width: `${stats.contractClicks > 0 ? (stats.rorligtVsFastpris.fastpris / stats.contractClicks * 100) : 0}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div style={{ 
                  marginTop: 12,
                  padding: 16,
                  background: '#f9fafb',
                  borderRadius: 8
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: 4 }}>
                    Klick med AI-analys
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {stats.contractClicksWithAi} av {stats.contractClicks} 
                    <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280', marginLeft: 8 }}>
                      ({stats.contractClicks > 0 ? ((stats.contractClicksWithAi / stats.contractClicks) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Trend Chart */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Senaste 7 dagarna</h2>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, minWidth: 600 }}>
                {stats.dailyStats.map((day, index) => {
                  const maxVal = Math.max(...stats.dailyStats.map(d => d.views));
                  const date = new Date(day.date);
                  const dateLabel = date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={index} style={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        width: '100%'
                      }}>
                        <div style={{ 
                          height: 100,
                          width: '100%',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          gap: 2
                        }}>
                          <div style={{ 
                            width: '30%',
                            height: `${maxVal > 0 ? (day.views / maxVal * 100) : 0}%`,
                            minHeight: day.views > 0 ? 4 : 0,
                            background: '#3b82f6',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }} title={`Besök: ${day.views}`} />
                          <div style={{ 
                            width: '30%',
                            height: `${maxVal > 0 ? (day.analyses / maxVal * 100) : 0}%`,
                            minHeight: day.analyses > 0 ? 4 : 0,
                            background: '#8b5cf6',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }} title={`AI: ${day.analyses}`} />
                          <div style={{ 
                            width: '30%',
                            height: `${maxVal > 0 ? (day.clicks / maxVal * 100) : 0}%`,
                            minHeight: day.clicks > 0 ? 4 : 0,
                            background: '#10b981',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }} title={`Klick: ${day.clicks}`} />
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#6b7280',
                          textAlign: 'center'
                        }}>
                          {dateLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 24, 
                marginTop: 16,
                fontSize: '0.875rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: '#3b82f6', borderRadius: 2 }} />
                  <span>Besök</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: '#8b5cf6', borderRadius: 2 }} />
                  <span>AI-analyser</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: '#10b981', borderRadius: 2 }} />
                  <span>Kontraktsklick</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column: A/B Tests and UTM */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 24,
            marginBottom: 24
          }}>
            {/* A/B Test Results */}
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>A/B Test - Vinnare</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ 
                  padding: 16, 
                  background: '#f0f9ff',
                  borderRadius: 8,
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: 4 }}>
                        Hero (huvudrubrik)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0c4a6e' }}>
                        {stats.heroWinner ? `Variant ${stats.heroWinner.variant}` : 'Ingen data'}
                      </div>
                      {stats.heroWinner && (
                        <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                          CTR: {stats.heroWinner.ctr.toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <Link href="/admin/hero-analytics" style={{ 
                      padding: '6px 12px',
                      background: '#0ea5e9',
                      color: 'white',
                      borderRadius: 6,
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}>
                      Detaljer →
                    </Link>
                  </div>
                </div>

                <div style={{ 
                  padding: 16, 
                  background: '#faf5ff',
                  borderRadius: 8,
                  border: '1px solid #e9d5ff'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#7c3aed', marginBottom: 4 }}>
                        Banner (AI-kalkylator)
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6d28d9' }}>
                        {stats.bannerWinner ? `Variant ${stats.bannerWinner.variant}` : 'Ingen data'}
                      </div>
                      {stats.bannerWinner && (
                        <div style={{ fontSize: '0.875rem', color: '#7c3aed' }}>
                          CTR: {stats.bannerWinner.ctr.toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <Link href="/admin/banner-clicks" style={{ 
                      padding: '6px 12px',
                      background: '#8b5cf6',
                      color: 'white',
                      borderRadius: 6,
                      textDecoration: 'none',
                      fontSize: '0.875rem'
                    }}>
                      Detaljer →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Top UTM Sources */}
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Trafikkällor (Top 5)</h2>
              {stats.topUtmSources.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {stats.topUtmSources.map((source, index) => (
                    <div key={index} style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#f9fafb',
                      borderRadius: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1f2937' }}>
                            {source.source}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {source.visits} besök
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center', margin: '2rem 0' }}>
                  Ingen UTM-data tillgänglig ännu
                </p>
              )}
            </div>
          </div>

          {/* Top Campaigns */}
          {stats.topUtmCampaigns.length > 0 && (
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: 24,
              marginBottom: 24,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Aktiva kampanjer (Top 5)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {stats.topUtmCampaigns.map((campaign, index) => (
                  <div key={index} style={{ 
                    padding: 16,
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: 8,
                    border: '1px solid #fbbf24'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: 4 }}>
                      #{index + 1}
                    </div>
                    <div style={{ fontWeight: 600, color: '#78350f', marginBottom: 4 }}>
                      {campaign.campaign}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#78350f' }}>
                      {campaign.visits}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                      besök
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div style={{ 
            background: 'white',
            borderRadius: 12,
            padding: 24,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem' }}>Djupdyk i data</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12
            }}>
              <QuickLink href="/admin/form-analytics" icon="📝" label="Formulär" />
              <QuickLink href="/admin/contract-clicks" icon="📈" label="Kontraktsklick" />
              <QuickLink href="/admin/funnel" icon="🔄" label="Funnel" />
              <QuickLink href="/admin/hero-analytics" icon="🎯" label="Hero A/B" />
              <QuickLink href="/admin/banner-clicks" icon="🎨" label="Banner A/B" />
              <QuickLink href="/admin/chatlog" icon="💬" label="Chattloggar" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  growth, 
  icon, 
  color 
}: { 
  title: string; 
  value: number; 
  growth?: number; 
  icon: string; 
  color: string;
}) {
  return (
    <div style={{ 
      background: 'white',
      borderRadius: 12,
      padding: 20,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        position: 'absolute',
        top: -10,
        right: -10,
        fontSize: '4rem',
        opacity: 0.1
      }}>
        {icon}
      </div>
      <div style={{ 
        fontSize: '0.875rem', 
        color: '#6b7280', 
        marginBottom: 8,
        fontWeight: 500
      }}>
        {title}
      </div>
      <div style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: color,
        marginBottom: 4
      }}>
        {value.toLocaleString('sv-SE')}
      </div>
      {growth !== undefined && growth !== 0 && (
        <div style={{ 
          fontSize: '0.875rem',
          color: growth > 0 ? '#10b981' : '#ef4444',
          fontWeight: 500
        }}>
          {growth > 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}% vs föregående period
        </div>
      )}
    </div>
  );
}

function FunnelStep({ 
  label, 
  value, 
  percent, 
  color 
}: { 
  label: string; 
  value: number; 
  percent: number; 
  color: string;
}) {
  return (
    <div style={{ 
      flex: 1,
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '0.875rem', 
        color: '#6b7280',
        marginBottom: 8 
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '1.75rem', 
        fontWeight: 'bold',
        color: color,
        marginBottom: 4
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: '0.875rem',
        color: '#9ca3af',
        fontWeight: 500
      }}>
        {percent.toFixed(1)}%
      </div>
    </div>
  );
}

function FunnelArrow() {
  return (
    <div style={{ 
      fontSize: '1.5rem',
      color: '#d1d5db',
      marginTop: 24
    }}>
      →
    </div>
  );
}

function QuickLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: string; 
  label: string;
}) {
  return (
    <Link href={href} style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 16px',
      background: '#f9fafb',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      textDecoration: 'none',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: 500,
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#f3f4f6';
      e.currentTarget.style.borderColor = '#cbd5e1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#f9fafb';
      e.currentTarget.style.borderColor = '#e5e7eb';
    }}
    >
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
