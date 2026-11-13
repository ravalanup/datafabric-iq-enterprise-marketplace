import { FormEvent, useState } from 'react';
import { ArrowRight, Bot, Compass, Palette, Search, ShieldCheck } from 'lucide-react';
import { ILLUSTRATIVE_SUMMARY_METRICS } from '../data/catalogData.ts';
import { APP_THEMES, AppTheme, DOMAIN_COLOR_MAP } from '../data/themes.ts';
import { DataProduct, EnterpriseDomain } from '../types/marketplace.ts';
import { ProductCard } from './ProductCard.tsx';
import { CertificationLabel } from './StatusText.tsx';

interface HomeViewProps {
  products: DataProduct[];
  recentlyViewedIds: string[];
  savedProductIds: string[];
  activeTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onOpenThemeModal: () => void;
  onNaturalLanguageSearch: (query: string) => void;
  onAskAIWithPrompt: (query: string) => void;
  onSelectDomain: (domain: EnterpriseDomain) => void;
  onSelectProduct: (productId: string) => void;
  onToggleSave: (productId: string) => void;
  onOpenSuitabilityModal: () => void;
}

const POPULAR_DOMAINS: Array<{ domain: EnterpriseDomain; summary: string }> = [
  { domain: 'Customer Experience', summary: 'Customer 360, behavioral clickstream, loyalty signals' },
  { domain: 'Operations', summary: 'Reservations, facility throughput, SLA telemetry' },
  { domain: 'Merchandise and Commerce', summary: 'SKU sales, margin, basket affinity' },
  { domain: 'Streaming and Digital Media', summary: 'Playback retention, engagement, QoE' },
  { domain: 'Marketing', summary: 'Multi-touch attribution, campaign ROAS' },
  { domain: 'Finance', summary: 'SOX-governed GL revenue, cost centers, FP&A' },
  { domain: 'Workforce', summary: 'Aggregated shift coverage & staffing capacity' },
];

const EXAMPLE_PROMPT = 'Find trusted customer behavior data for a personalization model.';

const KPI_ACCENTS = [
  'var(--df-primary)',
  '#15803D',
  'var(--df-secondary)',
  '#6D28D9',
  '#0284C7',
];

export function HomeView({
  products,
  recentlyViewedIds,
  savedProductIds,
  activeTheme,
  onSelectTheme,
  onOpenThemeModal,
  onNaturalLanguageSearch,
  onAskAIWithPrompt,
  onSelectDomain,
  onSelectProduct,
  onToggleSave,
  onOpenSuitabilityModal,
}: HomeViewProps) {
  const [query, setQuery] = useState('');
  const [listMode, setListMode] = useState<'recommended' | 'most-used' | 'recent'>('recommended');

  const published = products.filter((p) => p.status === 'Published');

  const recommendedProducts = published.filter((p) =>
    ['customer-360', 'customer-behavior', 'reservations'].includes(p.id)
  );
  const mostUsedProducts = [...published]
    .sort((a, b) => b.usage.activeConsumers - a.usage.activeConsumers)
    .slice(0, 3);
  const recentlyPublishedProducts = [...published]
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, 3);

  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => published.find((p) => p.id === id))
    .filter((p): p is DataProduct => Boolean(p))
    .slice(0, 4);

  const displayedShowcase =
    listMode === 'recommended'
      ? recommendedProducts
      : listMode === 'most-used'
        ? mostUsedProducts
        : recentlyPublishedProducts;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNaturalLanguageSearch(query.trim() || EXAMPLE_PROMPT);
  };

  return (
    <div className="space-y-8">
      {/* Executive Banking-Grade Gradient Hero */}
      <section
        className="rounded-xl p-6 lg:p-8 border shadow-xs transition-all"
        style={{
          background: 'var(--df-hero-bg)',
          color: 'var(--df-hero-text)',
          borderColor: 'var(--df-hero-border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-3xl flex-1">
            <div className="text-xs font-medium opacity-90" style={{ color: 'var(--df-hero-subtext)' }}>
              Enterprise AI-Ready Data Marketplace · Governed Self-Service
            </div>
            <h1 className="mt-2 text-3xl lg:text-[36px] font-bold tracking-tight [text-wrap:balance]">
              What are you trying to build?
            </h1>
            <p
              className="mt-2 text-sm leading-relaxed max-w-2xl"
              style={{ color: 'var(--df-hero-subtext)' }}
            >
              Discover certified, policy-governed data products across enterprise domains for analytics,
              forecasting, personalization, RAG, and agentic AI initiatives.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={EXAMPLE_PROMPT}
                  className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-white/20 rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-11 px-5 rounded-md bg-white text-[#0A2540] hover:bg-slate-100 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Compass className="w-4 h-4 text-[var(--df-primary)]" />
                Discover Data
              </button>
              <button
                type="button"
                onClick={() => onAskAIWithPrompt(query.trim() || EXAMPLE_PROMPT)}
                className="h-11 px-4 rounded-md bg-white/10 border border-white/25 hover:bg-white/20 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Bot className="w-4 h-4" />
                Ask AI Assistant
              </button>
            </form>

            <div
              className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs"
              style={{ color: 'var(--df-hero-subtext)' }}
            >
              <span>Example query:</span>
              <button
                type="button"
                onClick={() => setQuery(EXAMPLE_PROMPT)}
                className="text-white hover:underline text-left font-medium"
              >
                “{EXAMPLE_PROMPT}”
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenSuitabilityModal}
                className="inline-flex items-center gap-1 text-white/90 hover:text-white font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Run AI Suitability Check
              </button>
            </div>
          </div>

          {/* Quick Theme Switcher Card inside Hero */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-lg p-4 lg:w-64 shrink-0">
            <div className="flex items-center justify-between text-xs font-medium text-white">
              <span className="inline-flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Color Theme
              </span>
              <button
                type="button"
                onClick={onOpenThemeModal}
                className="text-white/90 hover:text-white underline text-[11px]"
              >
                View all 5
              </button>
            </div>
            <div className="mt-1 text-xs text-white/80 truncate">{activeTheme.name}</div>
            <div className="mt-3 flex items-center gap-2">
              {APP_THEMES.map((theme) => {
                const isSelected = theme.id === activeTheme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    title={theme.name}
                    aria-label={`Apply ${theme.name} theme`}
                    onClick={() => onSelectTheme(theme)}
                    className={`w-7 h-7 rounded-md border-2 transition-transform flex items-center justify-center ${
                      isSelected ? 'border-white scale-105' : 'border-white/30 hover:scale-105'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${theme.tokens.primary} 55%, ${theme.tokens.secondary} 55%)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Illustrative Marketplace Summary Strip */}
      <section aria-label="Marketplace summary metrics">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-semibold text-[#0F172A]">Marketplace Overview</h2>
          <span className="text-xs text-slate-500">All figures below are illustrative demo data</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ILLUSTRATIVE_SUMMARY_METRICS.map((metric, idx) => (
            <div
              key={metric.label}
              className="bg-white border border-[var(--df-border)] rounded-lg overflow-hidden"
            >
              <div className="h-1" style={{ backgroundColor: KPI_ACCENTS[idx % KPI_ACCENTS.length] }} />
              <div className="p-4">
                <div className="text-xs text-slate-500">{metric.label}</div>
                <div className="mt-1.5 text-2xl font-mono font-semibold text-[var(--df-ink)] tabular-nums">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs font-medium" style={{ color: KPI_ACCENTS[idx % KPI_ACCENTS.length] }}>
                  {metric.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Showcase Tabs */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Featured Data Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated for metadata completeness, SLA freshness, and AI-readiness
            </p>
          </div>

          <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-md self-start">
            {(
              [
                { id: 'recommended', label: 'Recommended' },
                { id: 'most-used', label: 'Most Used' },
                { id: 'recent', label: 'Recently Published' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setListMode(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  listMode === tab.id
                    ? 'bg-white text-[var(--df-primary)] shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedShowcase.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={savedProductIds.includes(product.id)}
              onSelect={onSelectProduct}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      </section>

      {/* Split Ledger: Popular Enterprise Domains & Recently Viewed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[var(--df-border)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A]">Popular Enterprise Domains</h2>
            <span className="text-xs text-slate-500">Select a domain to filter catalog</span>
          </div>
          <div className="divide-y divide-slate-100">
            {POPULAR_DOMAINS.map((item) => {
              const count = published.filter((p) => p.domain === item.domain).length;
              const dColor = DOMAIN_COLOR_MAP[item.domain]?.dot ?? '#005EB8';
              return (
                <button
                  key={item.domain}
                  type="button"
                  onClick={() => onSelectDomain(item.domain)}
                  className="w-full py-3 flex items-center justify-between gap-4 text-left hover:bg-[var(--df-surface-subtle)] px-2 -mx-2 rounded transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: dColor }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#0F172A] group-hover:text-[var(--df-primary)] transition-colors">
                        {item.domain}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">{item.summary}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-xs font-mono text-slate-600 tabular-nums">
                    <span>{count} {count === 1 ? 'product' : 'products'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--df-primary)]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[var(--df-border)] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A]">Recently Viewed Products</h2>
            <span className="text-xs text-slate-500">Your session history</span>
          </div>
          {recentlyViewedProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6">
              Select any data product to track your recently inspected datasets here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentlyViewedProducts.map((product) => {
                const dColor = DOMAIN_COLOR_MAP[product.domain]?.text ?? 'var(--df-primary)';
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => onSelectProduct(product.id)}
                    className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-[var(--df-surface-subtle)] px-2 -mx-2 rounded transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#0F172A] group-hover:text-[var(--df-primary)] truncate">
                        {product.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium" style={{ color: dColor }}>{product.domain}</span>
                        <span aria-hidden="true">·</span>
                        <CertificationLabel status={product.certificationStatus} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold text-[#0F172A] tabular-nums">
                        {product.quality.overall}%
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {product.freshness.lastUpdated}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
