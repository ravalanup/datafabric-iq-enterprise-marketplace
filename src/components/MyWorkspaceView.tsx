import { useState } from 'react';
import { ArrowRight, Bookmark, Bot, Clock, ShieldCheck } from 'lucide-react';
import {
  AccessRequestRecord,
  AssistantSessionSummary,
  DataProduct,
  PersonaProfile,
} from '../types/marketplace.ts';
import { AccessOutcomeLabel, CertificationLabel } from './StatusText.tsx';

interface MyWorkspaceViewProps {
  activePersona: PersonaProfile;
  products: DataProduct[];
  accessRequests: AccessRequestRecord[];
  savedProductIds: string[];
  recentlyViewedIds: string[];
  assistantHistory: AssistantSessionSummary[];
  onSelectProduct: (productId: string) => void;
  onToggleSave: (productId: string) => void;
  onOpenAssistantPrompt: (prompt: string) => void;
}

export function MyWorkspaceView({
  activePersona,
  products,
  accessRequests,
  savedProductIds,
  recentlyViewedIds,
  assistantHistory,
  onSelectProduct,
  onToggleSave,
  onOpenAssistantPrompt,
}: MyWorkspaceViewProps) {
  const [requestFilter, setRequestFilter] = useState<'all' | 'approved' | 'pending' | 'blocked'>('all');

  const approvedCount = accessRequests.filter((r) => r.outcome === 'Automatically approved').length;
  const pendingCount = accessRequests.filter((r) => r.outcome === 'Pending governance review').length;

  const filteredRequests = accessRequests.filter((req) => {
    if (requestFilter === 'approved') return req.outcome === 'Automatically approved';
    if (requestFilter === 'pending') return req.outcome === 'Pending governance review';
    if (requestFilter === 'blocked') return req.outcome === 'Not eligible';
    return true;
  });

  const savedProducts = savedProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is DataProduct => Boolean(p));

  const recentlyViewed = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is DataProduct => Boolean(p));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--df-ink)]">My Workspace</h1>
        <p className="mt-1 text-sm text-slate-600">
          Personal hub for {activePersona.name} ({activePersona.role}) — saved datasets, access requests, and assistant sessions.
        </p>
      </div>

      {/* Summary Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg divide-y lg:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-4">
          <div className="text-xs text-slate-500">Approved Products</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[#15803D] tabular-nums">
            {approvedCount}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Pending Approvals</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[#B45309] tabular-nums">
            {pendingCount}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Saved Products</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[#0F172A] tabular-nums">
            {savedProducts.length}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">AI Assistant Queries</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[var(--df-primary)] tabular-nums">
            {assistantHistory.length}
          </div>
        </div>
      </div>

      {/* Access Requests & Approvals */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#0F172A]">
              Access Requests & Policy Evaluations
            </h2>
            <p className="text-xs text-slate-500">
              All decisions reflect simulated demo policy evaluations from the deterministic Policy Engine.
            </p>
          </div>
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-md self-start">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'approved', label: 'Approved' },
                { id: 'pending', label: 'Pending' },
                { id: 'blocked', label: 'Not Eligible' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRequestFilter(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  requestFilter === tab.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No access requests match the selected filter. Open any data product and select Request Access to submit one.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="font-mono font-semibold text-slate-500">{req.id}</span>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(req.productId)}
                      className="text-sm font-semibold text-[#0F172A] hover:text-[var(--df-primary)]"
                    >
                      {req.productName}
                    </button>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">Purpose: {req.purpose}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-500">{req.policyCode}</span>
                  </div>
                  <p className="text-xs text-slate-600">{req.rationale}</p>
                  <div className="text-[11px] text-slate-500">
                    Justification: “{req.justification}” · Simulated Demo Policy Evaluation
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-start lg:items-end gap-1.5">
                  <AccessOutcomeLabel outcome={req.outcome} />
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {new Date(req.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved Products, Recently Viewed, and Assistant History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <Bookmark className="w-4 h-4 text-[var(--df-primary)]" />
            Saved Products
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {savedProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No saved products yet.</p>
            ) : (
              savedProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(p.id)}
                    className="text-left min-w-0 group"
                  >
                    <div className="text-sm font-medium text-[#0F172A] group-hover:text-[var(--df-primary)] truncate">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>{p.domain}</span>
                      <span>·</span>
                      <CertificationLabel status={p.certificationStatus} />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSave(p.id)}
                    className="text-xs text-slate-500 hover:text-[#B91C1C]"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <Clock className="w-4 h-4 text-[var(--df-primary)]" />
            Recently Viewed
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {recentlyViewed.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProduct(p.id)}
                className="w-full py-3 flex items-center justify-between gap-2 text-left hover:bg-[#F8FAFC] px-2 -mx-2 rounded group"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[#0F172A] group-hover:text-[var(--df-primary)] truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Quality {p.quality.overall}% · {p.freshness.lastUpdated}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--df-primary)] shrink-0" />
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
            <Bot className="w-4 h-4 text-[var(--df-primary)]" />
            Recent AI Conversations
          </div>
          <div className="mt-3 divide-y divide-slate-100">
            {assistantHistory.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenAssistantPrompt(item.prompt)}
                className="w-full py-3 text-left hover:bg-[#F8FAFC] px-2 -mx-2 rounded group"
              >
                <div className="text-xs font-medium text-[#0F172A] group-hover:text-[var(--df-primary)] line-clamp-2">
                  “{item.prompt}”
                </div>
                <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
                  <span className="truncate">
                    {item.recommendedProducts.length > 0
                      ? item.recommendedProducts.join(', ')
                      : 'Catalog check'}
                  </span>
                  <span className="shrink-0 ml-2">{item.timestamp}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 rounded-md bg-white border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-[#005EB8] shrink-0" />
        <span>
          Workspace approvals and entitlements shown here are generated by the simulated demo Policy Engine.
        </span>
      </div>
    </div>
  );
}
