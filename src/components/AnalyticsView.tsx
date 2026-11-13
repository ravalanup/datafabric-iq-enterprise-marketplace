import { useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { ANALYTICS_DASHBOARD_DEMO_DATA } from '../data/catalogData.ts';
import { DataProduct, LiveAnalyticsSummary } from '../types/marketplace.ts';

interface AnalyticsViewProps {
  products: DataProduct[];
  liveSummary: LiveAnalyticsSummary;
  onRefreshLiveSummary: () => void;
}

export function AnalyticsView({
  products,
  liveSummary,
  onRefreshLiveSummary,
}: AnalyticsViewProps) {
  const [tab, setTab] = useState<'enterprise' | 'live'>('live');

  const topUsed = [...products]
    .filter((p) => p.status === 'Published')
    .sort((a, b) => b.usage.monthlyQueries - a.usage.monthlyQueries)
    .slice(0, 5);

  const maxFeatureCount = Math.max(
    1,
    ...liveSummary.featureUsageBreakdown.map((f) => f.count)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A2540]">
            Marketplace Analytics & Telemetry
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Live session visit & feature analytics paired with executive enterprise marketplace KPIs.
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 rounded-md self-start">
          <button
            type="button"
            onClick={() => setTab('live')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                tab === 'live'
                  ? 'bg-white text-[var(--df-primary)] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Live Demo Visits & Feature Use
            </button>
            <button
              type="button"
              onClick={() => setTab('enterprise')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                tab === 'enterprise'
                  ? 'bg-white text-[var(--df-primary)] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Enterprise KPIs (Demo)
            </button>
          </div>
        </div>

        {tab === 'live' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white border border-[var(--df-border)] rounded-lg px-5 py-3 text-xs">
              <div className="flex items-center gap-2 text-[#0F172A] font-medium">
                <Activity className="w-4 h-4 text-[var(--df-primary)]" />
                <span>Real-time session telemetry captured from live interactions in this demo</span>
              </div>
              <button
                type="button"
                onClick={onRefreshLiveSummary}
                className="inline-flex items-center gap-1.5 text-[var(--df-primary)] font-medium hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {/* Live Visit & Feature Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-[var(--df-border)] rounded-lg overflow-hidden">
                <div className="h-1 bg-[var(--df-primary)]" />
                <div className="p-4">
                  <div className="text-xs text-slate-500">Total Section Visits</div>
                  <div className="mt-1 text-2xl font-mono font-semibold text-[var(--df-ink)] tabular-nums">
                    {liveSummary.totalVisits}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {liveSummary.uniqueSectionsVisited} of 7 sections explored
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[var(--df-border)] rounded-lg overflow-hidden">
                <div className="h-1 bg-[#0284C7]" />
                <div className="p-4">
                  <div className="text-xs text-slate-500">Product Inspections</div>
                  <div className="mt-1 text-2xl font-mono font-semibold text-[var(--df-ink)] tabular-nums">
                    {liveSummary.productsViewed}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {liveSummary.searchesExecuted} catalog searches run
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[var(--df-border)] rounded-lg overflow-hidden">
                <div className="h-1 bg-[var(--df-secondary)]" />
                <div className="p-4">
                  <div className="text-xs text-slate-500">AI Assistant Queries</div>
                  <div className="mt-1 text-2xl font-mono font-semibold text-[var(--df-secondary)] tabular-nums">
                    {liveSummary.aiQueriesExecuted}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {liveSummary.suitabilityChecksRun} policy checks run
                  </div>
                </div>
              </div>
              <div className="bg-white border border-[var(--df-border)] rounded-lg overflow-hidden">
                <div className="h-1 bg-[#15803D]" />
                <div className="p-4">
                  <div className="text-xs text-slate-500">Governance Actions</div>
                  <div className="mt-1 text-2xl font-mono font-semibold text-[#15803D] tabular-nums">
                    {liveSummary.accessRequestsSubmitted + liveSummary.metadataUpdatesSaved}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {liveSummary.accessRequestsSubmitted} access · {liveSummary.metadataUpdatesSaved} metadata edits
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Feature Usage Breakdown */}
              <section className="lg:col-span-6 bg-white border border-[var(--df-border)] rounded-lg p-5 space-y-4">
                <h2 className="text-sm font-semibold text-[#0F172A]">Feature Usage Breakdown</h2>
                <div className="space-y-3">
                  {liveSummary.featureUsageBreakdown.map((item, idx) => {
                    const barColors = [
                      'var(--df-primary)',
                      '#0284C7',
                      'var(--df-secondary)',
                      '#6D28D9',
                      '#15803D',
                      '#D97706',
                    ];
                    return (
                      <div key={item.feature}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700 font-medium">{item.feature}</span>
                          <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                            {item.count}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.max(4, (item.count / maxFeatureCount) * 100)}%`,
                              backgroundColor: barColors[idx % barColors.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-semibold text-[#0F172A] mb-2">Visits by Navigation Section</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {liveSummary.sectionVisitBreakdown.map((sec) => (
                      <div key={sec.section} className="p-2.5 rounded border border-slate-200 bg-[var(--df-surface-subtle)]">
                        <div className="text-slate-500 capitalize">{sec.section}</div>
                        <div className="font-mono font-semibold text-[#0F172A] tabular-nums">
                          {sec.visits}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Live Event Stream */}
              <section className="lg:col-span-6 bg-white border border-[var(--df-border)] rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-[#0F172A]">Recent Demo Activity Log</h2>
                </div>
                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {liveSummary.recentEvents.map((evt) => (
                    <div key={evt.id} className="px-5 py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-medium text-[#0F172A] truncate">{evt.label}</div>
                        <div className="text-slate-500">
                          {evt.personaRole} · {evt.section}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--df-border)] rounded-lg px-5 py-3 text-xs text-slate-600">
              <strong className="text-[#0F172A]">Illustrative Demo Data:</strong> The enterprise adoption,
              discovery, access, reuse, trust, and AI enablement KPIs below are conceptual prototype figures—not
              actual organizational results.
            </div>

            {/* 6 Enterprise Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(
                [
                  { title: 'Adoption', color: 'var(--df-primary)', items: ANALYTICS_DASHBOARD_DEMO_DATA.adoption },
                  { title: 'Discovery', color: '#0284C7', items: ANALYTICS_DASHBOARD_DEMO_DATA.discovery },
                  { title: 'Access', color: 'var(--df-secondary)', items: ANALYTICS_DASHBOARD_DEMO_DATA.access },
                  { title: 'Reuse', color: '#6D28D9', items: ANALYTICS_DASHBOARD_DEMO_DATA.reuse },
                  { title: 'Trust & Quality', color: '#15803D', items: ANALYTICS_DASHBOARD_DEMO_DATA.trust },
                  { title: 'AI Enablement', color: '#D97706', items: ANALYTICS_DASHBOARD_DEMO_DATA.aiEnablement },
                ] as const
              ).map((pillar) => (
                <section key={pillar.title} className="bg-white border border-[var(--df-border)] rounded-lg overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: pillar.color }} />
                  <div className="p-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-sm font-semibold text-[var(--df-ink)]">{pillar.title}</h2>
                      <span className="text-[11px] text-slate-400">Demo KPIs</span>
                    </div>
                    <div className="mt-3 divide-y divide-slate-100">
                      {pillar.items.map((metric) => (
                        <div key={metric.label} className="py-2.5 flex items-baseline justify-between gap-3">
                          <div>
                            <div className="text-xs text-slate-600">{metric.label}</div>
                            <div className="text-[11px] text-slate-400">{metric.delta}</div>
                          </div>
                          <div className="text-base font-mono font-semibold text-[#0F172A] tabular-nums text-right">
                            {metric.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Monthly Trend & Top Reused Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <section className="lg:col-span-6 bg-white border border-[var(--df-border)] rounded-lg p-5">
                <h2 className="text-sm font-semibold text-[#0F172A]">
                  Monthly Active Consumers & Reuse Rate (Illustrative Demo)
                </h2>
                <div className="mt-6 flex items-end justify-between gap-3 h-44 pt-4 border-b border-slate-200">
                  {ANALYTICS_DASHBOARD_DEMO_DATA.monthlyAdoptionTrend.map((pt, idx) => (
                    <div key={pt.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-600 tabular-nums">{pt.mau}</span>
                      <div
                        className="w-full max-w-[36px] rounded-t transition-colors"
                        style={{
                          height: `${Math.round(pt.mau / 12)}px`,
                          backgroundColor: idx % 2 === 0 ? 'var(--df-primary)' : 'var(--df-secondary)',
                        }}
                      />
                      <span className="text-xs text-slate-500 pb-1">{pt.month}</span>
                    </div>
                  ))}
                </div>
              </section>

            <section className="lg:col-span-6 bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">Most-Used Data Products</h2>
                <span className="text-xs text-slate-500">Monthly query volume</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">Domain</th>
                    <th className="py-2.5 px-4 text-right">Consumers</th>
                    <th className="py-2.5 px-4 text-right">Monthly Queries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {topUsed.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-semibold text-[#0F172A]">{p.name}</td>
                      <td className="py-2.5 px-4 text-slate-600">{p.domain}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                        {p.usage.activeConsumers}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#0F172A]">
                        {p.usage.monthlyQueries.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
