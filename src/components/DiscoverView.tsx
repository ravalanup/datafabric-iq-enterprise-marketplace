import { useEffect, useMemo, useState } from 'react';
import { Bot, RotateCcw, Search } from 'lucide-react';
import { DataProduct, EnterpriseDomain } from '../types/marketplace.ts';
import { ProductCard } from './ProductCard.tsx';

interface DiscoverViewProps {
  products: DataProduct[];
  initialQuery?: string;
  initialDomain?: EnterpriseDomain | 'All';
  savedProductIds: string[];
  onSelectProduct: (productId: string) => void;
  onToggleSave: (productId: string) => void;
  onSearchTracked: (query: string) => void;
  onAskAIWithPrompt: (query: string) => void;
}

const DOMAINS: Array<EnterpriseDomain | 'All'> = [
  'All',
  'Customer Experience',
  'Streaming and Digital Media',
  'Marketing',
  'Merchandise and Commerce',
  'Finance',
  'Workforce',
  'Operations',
];

export function DiscoverView({
  products,
  initialQuery = '',
  initialDomain = 'All',
  savedProductIds,
  onSelectProduct,
  onToggleSave,
  onSearchTracked,
  onAskAIWithPrompt,
}: DiscoverViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [domain, setDomain] = useState<EnterpriseDomain | 'All'>(initialDomain);
  const [certification, setCertification] = useState<string>('All');
  const [minQuality, setMinQuality] = useState<number>(0);
  const [freshness, setFreshness] = useState<string>('All');
  const [aiReady, setAiReady] = useState<string>('All');
  const [accessStatus, setAccessStatus] = useState<string>('All');
  const [iface, setIface] = useState<string>('All');
  const [sort, setSort] = useState<'relevance' | 'trust' | 'freshness' | 'popularity'>('relevance');

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setDomain(initialDomain);
  }, [initialDomain]);

  const publishedProducts = useMemo(
    () => products.filter((p) => p.status === 'Published'),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let list = publishedProducts;

    if (domain !== 'All') list = list.filter((p) => p.domain === domain);
    if (certification !== 'All') list = list.filter((p) => p.certificationStatus === certification);
    if (minQuality > 0) list = list.filter((p) => p.quality.overall >= minQuality);
    if (freshness === 'Under 30m') list = list.filter((p) => p.freshness.latencyMinutes <= 30);
    if (freshness === 'Under 2h') list = list.filter((p) => p.freshness.latencyMinutes <= 120);
    if (aiReady === 'AI-Ready Only') list = list.filter((p) => p.aiReady);
    if (accessStatus !== 'All') {
      list = list.filter((p) => p.accessEligibility.toLowerCase().includes(accessStatus.toLowerCase()));
    }
    if (iface !== 'All') {
      list = list.filter((p) => p.interfaces.includes(iface as DataProduct['interfaces'][number]));
    }

    const q = query.trim().toLowerCase();
    if (q) {
      const stopWords = new Set(['find', 'trusted', 'data', 'for', 'a', 'an', 'the', 'with', 'and', 'model', 'to']);
      const tokens = q
        .split(/[\s,?.!]+/)
        .filter((t) => t.length > 1 && !stopWords.has(t));
      const effectiveTokens = tokens.length > 0 ? tokens : q.split(/\s+/).filter(Boolean);

      list = list
        .map((p) => {
          const hay = `${p.name} ${p.domain} ${p.description} ${p.businessDefinition} ${p.businessPurpose} ${p.owner} ${p.keywords.join(' ')}`.toLowerCase();
          const hits = effectiveTokens.reduce((acc, tok) => (hay.includes(tok) ? acc + 1 : acc), 0);
          return { product: p, hits };
        })
        .filter((item) => item.hits > 0)
        .sort((a, b) => b.hits - a.hits || b.product.quality.overall - a.product.quality.overall)
        .map((item) => item.product);
    }

    if (sort === 'trust') {
      list = [...list].sort((a, b) => b.quality.overall - a.quality.overall);
    } else if (sort === 'freshness') {
      list = [...list].sort((a, b) => a.freshness.latencyMinutes - b.freshness.latencyMinutes);
    } else if (sort === 'popularity') {
      list = [...list].sort((a, b) => b.usage.activeConsumers - a.usage.activeConsumers);
    }

    return list;
  }, [
    publishedProducts,
    domain,
    certification,
    minQuality,
    freshness,
    aiReady,
    accessStatus,
    iface,
    query,
    sort,
  ]);

  const resetFilters = () => {
    setQuery('');
    setDomain('All');
    setCertification('All');
    setMinQuality(0);
    setFreshness('All');
    setAiReady('All');
    setAccessStatus('All');
    setIface('All');
    setSort('relevance');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--df-ink)]">Discover Data Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search by product name, business term, domain, or natural-language use case.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAskAIWithPrompt(query.trim() || 'Which trusted dataset contains customer behavior?')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 bg-white hover:border-[var(--df-primary)] text-xs font-medium text-[#0F172A] transition-colors whitespace-nowrap self-start"
        >
          <Bot className="w-4 h-4 text-[var(--df-primary)]" />
          Ask AI Assistant Instead
        </button>
      </div>

      {/* Search & Multi-Facet Filter Bar */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  onSearchTracked(query.trim());
                }
              }}
              placeholder="e.g. Find trusted customer behavior data for a personalization model"
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[var(--df-primary)] focus:bg-white transition-colors"
            />
          </div>
          <select
            aria-label="Sort data products"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="trust">Sort: Trust & Quality Score</option>
            <option value="freshness">Sort: Freshness (Fastest)</option>
            <option value="popularity">Sort: Popularity (Consumers)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          <select
            aria-label="Filter by domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value as EnterpriseDomain | 'All')}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'Domain: All' : d}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by certification"
            value={certification}
            onChange={(e) => setCertification(e.target.value)}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value="All">Certification: All</option>
            <option value="Certified">Certified</option>
            <option value="In Review">In Review</option>
          </select>

          <select
            aria-label="Filter by quality score"
            value={minQuality}
            onChange={(e) => setMinQuality(Number(e.target.value))}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value={0}>Quality: All</option>
            <option value={90}>Quality: 90%+</option>
            <option value={95}>Quality: 95%+</option>
          </select>

          <select
            aria-label="Filter by freshness"
            value={freshness}
            onChange={(e) => setFreshness(e.target.value)}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value="All">Freshness: All</option>
            <option value="Under 30m">Under 30 min</option>
            <option value="Under 2h">Under 2 hours</option>
          </select>

          <select
            aria-label="Filter by AI readiness"
            value={aiReady}
            onChange={(e) => setAiReady(e.target.value)}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value="All">AI Readiness: All</option>
            <option value="AI-Ready Only">AI-Ready Only</option>
          </select>

          <select
            aria-label="Filter by access status"
            value={accessStatus}
            onChange={(e) => setAccessStatus(e.target.value)}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value="All">Access: All</option>
            <option value="Auto-Approved">Auto-Approved</option>
            <option value="Policy Review">Policy Review</option>
            <option value="Steward Approval">Steward Approval</option>
          </select>

          <select
            aria-label="Filter by consumption method"
            value={iface}
            onChange={(e) => setIface(e.target.value)}
            className="h-9 px-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] focus:outline-none focus:border-[var(--df-primary)]"
          >
            <option value="All">Interface: All</option>
            <option value="SQL">SQL</option>
            <option value="REST API">REST API</option>
            <option value="Python SDK">Python SDK</option>
            <option value="Feature Store">Feature Store</option>
            <option value="MCP Tool">MCP Tool</option>
            <option value="Kafka Stream">Kafka Stream</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span className="tabular-nums">
            Showing <strong className="text-[#0F172A]">{filteredProducts.length}</strong> of{' '}
            {publishedProducts.length} published products
          </span>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-[var(--df-primary)] hover:underline font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset filters
          </button>
        </div>
      </section>

      {/* Results Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <h2 className="text-base font-semibold text-[#0F172A]">No matching data products found</h2>
          <p className="mt-1 text-sm text-slate-600">
            Adjust your domain, quality, or interface filters, or reset to view all published enterprise products.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 rounded-md bg-[var(--df-primary)] text-white text-xs font-medium hover:bg-[var(--df-primary-hover)] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSaved={savedProductIds.includes(product.id)}
              onSelect={onSelectProduct}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
