import { FormEvent, useState } from 'react';
import { CheckCircle2, Lock, X } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import {
  AccessPurpose,
  AccessRequestRecord,
  DataProduct,
  MarketplaceNotification,
  PersonaProfile,
} from '../types/marketplace.ts';
import { AccessOutcomeLabel } from './StatusText.tsx';

interface AccessRequestModalProps {
  product: DataProduct;
  activePersona: PersonaProfile;
  onClose: () => void;
  onSubmitted: (
    request: AccessRequestRecord,
    allRequests: AccessRequestRecord[],
    notifications: MarketplaceNotification[]
  ) => void;
  onViewInWorkspace: () => void;
}

const PURPOSES: AccessPurpose[] = [
  'Analytics',
  'Personalization',
  'Forecasting',
  'RAG',
  'Model Training',
  'Application Integration',
];

export function AccessRequestModal({
  product,
  activePersona,
  onClose,
  onSubmitted,
  onViewInWorkspace,
}: AccessRequestModalProps) {
  const [purpose, setPurpose] = useState<AccessPurpose>('Personalization');
  const [justification, setJustification] = useState(
    `Evaluate ${product.name} signals for enterprise ${activePersona.department} workflow.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AccessRequestRecord | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setError('Please enter a brief business justification.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiClient.submitAccessRequest({
        productId: product.id,
        purpose,
        justification: justification.trim(),
        requesterName: activePersona.name,
        requesterRole: activePersona.role,
      });
      setResult(res.accessRequest);
      onSubmitted(res.accessRequest, res.accessRequests, res.notifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate access policy.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--df-primary)]" />
            <h2 className="text-base font-semibold text-[var(--df-ink)]">Request Data Product Access</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="p-3.5 rounded-md bg-[#F8FAFC] border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500">Selected Data Product</div>
              <div className="text-sm font-semibold text-[#0F172A]">
                {product.name} · {product.domain}
              </div>
              <div className="text-slate-600">
                Classification: <strong>{product.accessClassification}</strong> · Requester:{' '}
                <strong>{activePersona.name}</strong> ({activePersona.role})
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Intended Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as AccessPurpose)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Business Justification
              </label>
              <textarea
                rows={3}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explain your intended analytical, ML, or application use case..."
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[var(--df-primary)]"
              />
            </div>

            {error && <div className="text-xs text-[#B91C1C]">{error}</div>}

            <div className="text-[11px] text-slate-500">
              Evaluated deterministically by the Policy Engine (simulated demo policy evaluation).
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white text-xs font-medium disabled:opacity-60"
              >
                {submitting ? 'Evaluating Policy...' : 'Submit Access Request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <CheckCircle2 className="w-4 h-4 text-[var(--df-primary)]" />
                Request {result.id} Recorded
              </div>
              <AccessOutcomeLabel outcome={result.outcome} />
            </div>

            <div className="p-4 rounded-md bg-[#F8FAFC] border border-slate-200 space-y-2 text-xs">
              <div className="font-mono text-slate-500">
                Policy Rule: {result.policyCode} · Simulated Demo Policy Evaluation
              </div>
              <p className="text-sm text-[#0F172A] leading-relaxed">{result.rationale}</p>
              <div className="pt-1">
                <span className="font-semibold text-slate-700">Applicable Conditions:</span>
                <ul className="mt-1 space-y-0.5 text-slate-600">
                  {result.conditions.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewInWorkspace();
                }}
                className="px-4 py-2 rounded-md bg-[#005EB8] hover:bg-[#004488] text-white text-xs font-medium"
              >
                View in My Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
