import { ArrowRight, ShieldCheck } from 'lucide-react';
import { DataProduct } from '../types/marketplace.ts';
import { CertificationLabel, FreshnessLabel } from './StatusText.tsx';

interface DataProductsCatalogViewProps {
  products: DataProduct[];
  onSelectProduct: (productId: string) => void;
  onOpenSuitabilityModal: (productId?: string) => void;
}

export function DataProductsCatalogView({
  products,
  onSelectProduct,
  onOpenSuitabilityModal,
}: DataProductsCatalogViewProps) {
  const published = products.filter((p) => p.status === 'Published');
  const flagship = published.find((p) => p.id === 'customer-360') ?? published[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--df-ink)]">Data Products Registry</h1>
          <p className="mt-1 text-sm text-slate-600">
            Governed enterprise data products with standardized interfaces, owners, quality SLAs, and AI-readiness contracts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenSuitabilityModal(flagship?.id)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white text-xs font-medium transition-colors whitespace-nowrap self-start"
        >
          <ShieldCheck className="w-4 h-4" />
          Evaluate AI Suitability
        </button>
      </div>

      {flagship && (
        <section className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[var(--df-primary)]">
              Primary Flagship Example · {flagship.domain}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[#0F172A]">{flagship.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{flagship.description}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelectProduct(flagship.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-[var(--df-primary)] text-[var(--df-primary)] hover:bg-[var(--df-primary-soft)] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Inspect Customer 360
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quality</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">Consumers</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {published.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => onSelectProduct(product.id)}
                  className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-[#0F172A] whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{product.domain}</td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{product.owner}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <CertificationLabel status={product.certificationStatus} />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#0F172A] tabular-nums">
                    {product.quality.overall}%
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <FreshnessLabel status={product.freshness.status} text={product.freshness.lastUpdated} />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {product.accessClassification}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {product.usage.activeConsumers}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product.id);
                      }}
                      className="text-xs font-medium text-[var(--df-primary)] hover:underline"
                    >
                      Open Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
