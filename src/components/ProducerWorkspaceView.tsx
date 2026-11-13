import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Edit3, Save } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import {
  CertificationStatus,
  DataProduct,
  MarketplaceNotification,
  PersonaRole,
  PublicationStatus,
} from '../types/marketplace.ts';
import { CertificationLabel, FreshnessLabel } from './StatusText.tsx';

interface ProducerWorkspaceViewProps {
  products: DataProduct[];
  activeRole: PersonaRole;
  onProductUpdated: (product: DataProduct, notifications: MarketplaceNotification[]) => void;
  onSelectProduct: (productId: string) => void;
}

export function ProducerWorkspaceView({
  products,
  activeRole,
  onProductUpdated,
  onSelectProduct,
}: ProducerWorkspaceViewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    products.find((p) => p.status === 'Draft')?.id ?? products[0]?.id ?? ''
  );

  const selected = products.find((p) => p.id === selectedId) ?? products[0];

  const [description, setDescription] = useState(selected?.description ?? '');
  const [businessDefinition, setBusinessDefinition] = useState(selected?.businessDefinition ?? '');
  const [owner, setOwner] = useState(selected?.owner ?? '');
  const [certificationStatus, setCertificationStatus] = useState<CertificationStatus>(
    selected?.certificationStatus ?? 'Certified'
  );
  const [status, setStatus] = useState<PublicationStatus>(selected?.status ?? 'Published');
  const [freshnessSla, setFreshnessSla] = useState(selected?.freshness.slaTarget ?? '< 60 minutes');
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selected) {
      setDescription(selected.description);
      setBusinessDefinition(selected.businessDefinition);
      setOwner(selected.owner);
      setCertificationStatus(selected.certificationStatus);
      setStatus(selected.status);
      setFreshnessSla(selected.freshness.slaTarget);
      setSaveNotice(null);
    }
  }, [selectedId]);

  const publishedCount = products.filter((p) => p.status === 'Published').length;
  const draftCount = products.filter((p) => p.status === 'Draft').length;
  const openIncidentsTotal = products.reduce((sum, p) => sum + p.openIncidents.length, 0);
  const avgCompleteness = Math.round(
    products.reduce((sum, p) => sum + p.metadataCompleteness, 0) / Math.max(1, products.length)
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setSaveNotice(null);
    try {
      const res = await apiClient.updateProductMetadata(selected.id, {
        description,
        businessDefinition,
        owner,
        certificationStatus,
        status,
        freshnessSla,
        personaRole: activeRole,
      });
      onProductUpdated(res.product, res.notifications);
      setSaveNotice(`Saved metadata for ${res.product.name} (${res.product.metadataCompleteness}% completeness).`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--df-ink)]">Producer Workspace</h1>
        <p className="mt-1 text-sm text-slate-600">
          Steward product health, resolve quality incidents, complete metadata contracts, and manage certification readiness.
        </p>
      </div>

      {/* Producer KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg divide-y lg:divide-y-0 sm:divide-x divide-slate-200">
        <div className="p-4">
          <div className="text-xs text-slate-500">Published Products</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[#0F172A] tabular-nums">
            {publishedCount}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Draft Products</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[#B45309] tabular-nums">
            {draftCount}
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Avg Metadata Completeness</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[var(--df-primary)] tabular-nums">
            {avgCompleteness}%
          </div>
        </div>
        <div className="p-4">
          <div className="text-xs text-slate-500">Open Quality Incidents</div>
          <div className="mt-1 text-2xl font-mono font-semibold text-[#B91C1C] tabular-nums">
            {openIncidentsTotal}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Product Portfolio Table */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F172A]">Owned & Managed Data Products</h2>
            <span className="text-xs text-slate-500">Select a product to edit metadata</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">State</th>
                  <th className="py-2.5 px-4 text-right">Completeness</th>
                  <th className="py-2.5 px-4 text-right">Quality</th>
                  <th className="py-2.5 px-4 text-right">Consumers</th>
                  <th className="py-2.5 px-4 text-right">Incidents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {products.map((p) => {
                  const isSelected = p.id === selected?.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[var(--df-primary-soft)]/70' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0F172A]">{p.name}</div>
                        <div className="text-[11px] text-slate-500">{p.owner}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <CertificationLabel status={p.certificationStatus} />
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#0F172A]">
                        {p.metadataCompleteness}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#0F172A]">
                        {p.quality.overall}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {p.usage.activeConsumers}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {p.openIncidents.length > 0 ? (
                          <span className="text-[#B91C1C] font-semibold">{p.openIncidents.length}</span>
                        ) : (
                          <span className="text-[#15803D]">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Health Summary & Inline Metadata Editor */}
        {selected && (
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-[var(--df-primary)]" />
                  Product Health & Metadata Editor
                </div>
                <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">{selected.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => onSelectProduct(selected.id)}
                className="text-xs font-medium text-[var(--df-primary)] hover:underline shrink-0"
              >
                Open Consumer View
              </button>
            </div>

            {/* Health Snapshot */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F8FAFC] border border-slate-200 rounded-md text-xs">
              <div>
                <div className="text-slate-500">Quality</div>
                <div className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                  {selected.quality.overall}%
                </div>
              </div>
              <div>
                <div className="text-slate-500">Freshness</div>
                <div className="mt-0.5">
                  <FreshnessLabel status={selected.freshness.status} text={selected.freshness.status} />
                </div>
              </div>
              <div>
                <div className="text-slate-500">Completeness</div>
                <div className="mt-0.5 font-mono font-semibold text-[var(--df-primary)] tabular-nums">
                  {selected.metadataCompleteness}%
                </div>
              </div>
            </div>

            {/* Open Incidents */}
            {selected.openIncidents.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#B91C1C] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Open Incidents ({selected.openIncidents.length})
                </div>
                {selected.openIncidents.map((inc) => (
                  <div key={inc.id} className="p-2.5 rounded border border-red-200 bg-red-50/50 text-xs">
                    <div className="font-mono font-semibold text-[#0F172A]">
                      {inc.id} · {inc.severity} Severity
                    </div>
                    <div className="text-slate-700 mt-0.5">{inc.title}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#0F172A]">Improvement Recommendations</div>
              <ul className="space-y-1 text-xs text-slate-600">
                {selected.improvementRecommendations.map((rec) => (
                  <li key={rec}>• {rec}</li>
                ))}
              </ul>
            </div>

            {/* Editable Metadata Form */}
            <form onSubmit={handleSave} className="space-y-3 pt-3 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Freshness SLA</label>
                  <input
                    type="text"
                    value={freshnessSla}
                    onChange={(e) => setFreshnessSla(e.target.value)}
                    className="w-full h-9 px-3 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PublicationStatus)}
                    className="w-full h-9 px-2.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[var(--df-primary)]"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Certification Status
                  </label>
                  <select
                    value={certificationStatus}
                    onChange={(e) => setCertificationStatus(e.target.value as CertificationStatus)}
                    className="w-full h-9 px-2.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[var(--df-primary)]"
                  >
                    <option value="Certified">Certified</option>
                    <option value="In Review">In Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#005EB8]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Business Definition
                </label>
                <textarea
                  rows={2}
                  value={businessDefinition}
                  onChange={(e) => setBusinessDefinition(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-[#005EB8]"
                />
              </div>

              {saveNotice && (
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-[#15803D] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveNotice}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full h-9 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving Metadata...' : 'Save Product Metadata'}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
