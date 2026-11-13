import { ArrowRight, Bookmark, Cpu } from 'lucide-react';
import { DOMAIN_COLOR_MAP } from '../data/themes.ts';
import { DataProduct } from '../types/marketplace.ts';
import { CertificationLabel, FreshnessLabel } from './StatusText.tsx';

interface ProductCardProps {
  product: DataProduct;
  isSaved?: boolean;
  onSelect: (productId: string) => void;
  onToggleSave?: (productId: string) => void;
}

export function ProductCard({ product, isSaved, onSelect, onToggleSave }: ProductCardProps) {
  const domainColor = DOMAIN_COLOR_MAP[product.domain] ?? {
    text: '#005EB8',
    bg: '#EBF3FA',
    dot: '#005EB8',
  };

  return (
    <article
      className="group bg-white border border-[var(--df-border)] rounded-lg overflow-hidden flex flex-col justify-between transition-all hover:border-[var(--df-primary)] cursor-pointer"
      onClick={() => onSelect(product.id)}
    >
      <div className="h-1 w-full" style={{ backgroundColor: domainColor.dot }} />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold truncate" style={{ color: domainColor.text }}>
                  {product.domain}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <CertificationLabel status={product.certificationStatus} />
              </div>
              <h3 className="mt-1.5 text-base font-semibold text-[#0F172A] group-hover:text-[var(--df-primary)] transition-colors">
                {product.name}
              </h3>
            </div>
            {onToggleSave && (
              <button
                type="button"
                aria-label={isSaved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(product.id);
                }}
                className={`p-1.5 rounded-md border transition-colors shrink-0 ${
                  isSaved
                    ? 'border-[var(--df-primary)]/30 bg-[var(--df-primary-soft)] text-[var(--df-primary)]'
                    : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          <p className="mt-2.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-slate-500">Quality</div>
              <div className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                {product.quality.overall}%
              </div>
            </div>
            <div>
              <div className="text-slate-500">Freshness</div>
              <div className="mt-0.5">
                <FreshnessLabel status={product.freshness.status} text={product.freshness.lastUpdated} />
              </div>
            </div>
            <div>
              <div className="text-slate-500">AI Ready</div>
              <div className="mt-0.5 inline-flex items-center gap-1 font-medium text-[#0F172A]">
                <Cpu
                  className="w-3.5 h-3.5"
                  style={{ color: product.aiReady ? 'var(--df-secondary)' : '#94A3B8' }}
                />
                {product.aiReady ? 'Yes' : 'Restricted'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 truncate">
            <span className="text-slate-700 font-medium">{product.owner}</span>
            <span aria-hidden="true"> · </span>
            <span>{product.interfaces.slice(0, 3).join(', ')}</span>
            {product.interfaces.length > 3 ? ` +${product.interfaces.length - 3}` : ''}
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--df-primary)] shrink-0">
            Inspect
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
