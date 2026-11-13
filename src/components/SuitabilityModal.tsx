import { FormEvent, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import {
  AIUseCase,
  DataProduct,
  PersonaRole,
  SuitabilityEvaluationResult,
} from '../types/marketplace.ts';
import { SuitabilityStatusLabel } from './StatusText.tsx';

interface SuitabilityModalProps {
  products: DataProduct[];
  initialProductId?: string;
  activeRole: PersonaRole;
  onClose: () => void;
  onEvaluated?: () => void;
}

const USE_CASES: AIUseCase[] = [
  'Analytics',
  'Personalization',
  'Forecasting',
  'RAG',
  'Model Training',
  'Agent Access',
];

export function SuitabilityModal({
  products,
  initialProductId,
  activeRole,
  onClose,
  onEvaluated,
}: SuitabilityModalProps) {
  const [productId, setProductId] = useState(initialProductId || products[0]?.id || 'customer-360');
  const [aiUseCase, setAiUseCase] = useState<AIUseCase>('Personalization');
  const [purpose, setPurpose] = useState('Customer retention & next-best-experience model');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuitabilityEvaluationResult | null>(null);

  const handleEvaluate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.evaluateSuitability({
        productId,
        aiUseCase,
        consumptionPurpose: purpose,
        personaRole: activeRole,
      });
      setResult(res.evaluation);
      onEvaluated?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--df-primary)]" />
            <h2 className="text-base font-semibold text-[var(--df-ink)]">
              AI Suitability Policy Evaluator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700"
            aria-label="Close evaluator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleEvaluate} className="p-6 space-y-4">
          <div className="p-3 rounded-md bg-[#F8FAFC] border border-slate-200 text-xs text-slate-600">
            Deterministic Policy Engine check — separates AI discovery from authorization decisions.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Data Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.accessClassification})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Intended AI Use Case
              </label>
              <select
                value={aiUseCase}
                onChange={(e) => setAiUseCase(e.target.value as AIUseCase)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
              >
                {USE_CASES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Consumption Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white text-xs font-medium disabled:opacity-60"
            >
              {loading ? 'Evaluating...' : 'Run Deterministic Policy Check'}
            </button>
          </div>

          {result && (
            <div className="mt-2 p-4 rounded-md border border-slate-200 bg-[#F8FAFC] space-y-2.5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <SuitabilityStatusLabel status={result.eligibilityStatus} />
                <span className="font-mono text-slate-500">
                  {result.policyRuleId} · {result.dataClassification}
                </span>
              </div>
              <p className="text-sm text-[#0F172A] leading-relaxed">{result.explanation}</p>
              <div className="space-y-1 text-slate-600">
                <div>
                  <strong className="text-slate-800">Restrictions:</strong>{' '}
                  {result.applicableRestrictions.join(' · ')}
                </div>
                <div>
                  <strong className="text-slate-800">Required Approvals:</strong>{' '}
                  {result.requiredApprovals.join(' · ')}
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Simulated Demo Policy Evaluation · Never delegated to LLM
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
