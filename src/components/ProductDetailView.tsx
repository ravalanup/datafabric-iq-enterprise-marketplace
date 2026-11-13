import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Cpu,
  Lock,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  AIUseCase,
  DataProduct,
  PersonaRole,
  SuitabilityEvaluationResult,
} from '../types/marketplace.ts';
import { apiClient } from '../services/apiClient.ts';
import {
  CertificationLabel,
  FreshnessLabel,
  SuitabilityStatusLabel,
} from './StatusText.tsx';

interface ProductDetailViewProps {
  product: DataProduct;
  isSaved: boolean;
  activeRole: PersonaRole;
  onBack: () => void;
  onToggleSave: (productId: string) => void;
  onOpenAccessRequest: (productId: string) => void;
  onSuitabilityEvaluated?: () => void;
}

type DetailTab =
  | 'overview'
  | 'schema'
  | 'quality'
  | 'freshness'
  | 'lineage'
  | 'access'
  | 'ai-suitability'
  | 'usage';

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'schema', label: 'Schema' },
  { id: 'quality', label: 'Quality' },
  { id: 'freshness', label: 'Freshness' },
  { id: 'lineage', label: 'Lineage' },
  { id: 'access', label: 'Access' },
  { id: 'ai-suitability', label: 'AI Suitability' },
  { id: 'usage', label: 'Usage' },
];

const AI_USE_CASES: AIUseCase[] = [
  'Analytics',
  'Personalization',
  'Forecasting',
  'RAG',
  'Model Training',
  'Agent Access',
];

export function ProductDetailView({
  product,
  isSaved,
  activeRole,
  onBack,
  onToggleSave,
  onOpenAccessRequest,
  onSuitabilityEvaluated,
}: ProductDetailViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedInterface, setSelectedInterface] = useState(product.interfaces[0] ?? 'SQL');

  // Inline AI Suitability Evaluator state
  const [evalUseCase, setEvalUseCase] = useState<AIUseCase>('Personalization');
  const [evalPurpose, setEvalPurpose] = useState('Customer-facing recommendation ranking');
  const [evalResult, setEvalResult] = useState<SuitabilityEvaluationResult | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const handleRunSuitability = async () => {
    setEvalLoading(true);
    try {
      const res = await apiClient.evaluateSuitability({
        productId: product.id,
        aiUseCase: evalUseCase,
        consumptionPurpose: evalPurpose,
        personaRole: activeRole,
      });
      setEvalResult(res.evaluation);
      onSuitabilityEvaluated?.();
    } finally {
      setEvalLoading(false);
    }
  };

  const getInterfaceSnippet = (iface: string) => {
    const slug = product.id.replace(/-/g, '_');
    if (iface === 'SQL') {
      return `SELECT * FROM enterprise_gold.${slug}\nWHERE updated_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'\nLIMIT 100;`;
    }
    if (iface === 'Python SDK') {
      return `from datafabriciq import MarketplaceClient\nclient = MarketplaceClient(env="enterprise")\ndf = client.read_product("${product.id}", purpose="analytics")`;
    }
    if (iface === 'REST API') {
      return `GET https://api.datafabriciq.internal/v1/products/${product.id}/records\nAuthorization: Bearer <entitlement-token>`;
    }
    if (iface === 'MCP Tool') {
      return `mcp_tool: "dfiq.query_${slug}"\npolicy_scope: "read_only_governed"`;
    }
    return `feature_store.get_online_features(product="${product.id}", entity_keys=["customer_id"])`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[var(--df-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </button>

        <div className="mt-3 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">{product.domain}</span>
              <span aria-hidden="true">·</span>
              <CertificationLabel status={product.certificationStatus} />
              <span aria-hidden="true">·</span>
              <span>Owner: {product.owner}</span>
              <span aria-hidden="true">·</span>
              <FreshnessLabel status={product.freshness.status} text={`Updated ${product.freshness.lastUpdated}`} />
            </div>
            <h1 className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-[#0A2540]">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(product.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                isSaved
                  ? 'border-[#005EB8]/40 bg-[#EBF3FA] text-[var(--df-primary)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
              {isSaved ? 'Saved' : 'Save Product'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai-suitability')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-200 bg-white hover:border-[#005EB8] text-xs font-medium text-[#0F172A] transition-colors whitespace-nowrap"
            >
              <Cpu className="w-3.5 h-3.5 text-[var(--df-primary)]" />
              AI Suitability
            </button>
            <button
              type="button"
              onClick={() => onOpenAccessRequest(product.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              Request Access
            </button>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-500">Overall Quality</div>
            <div className="mt-0.5 text-base font-mono font-semibold text-[#0F172A] tabular-nums">
              {product.quality.overall}%
            </div>
          </div>
          <div>
            <div className="text-slate-500">Classification</div>
            <div className="mt-0.5 text-sm font-semibold text-[#0F172A]">
              {product.accessClassification}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Active Consumers</div>
            <div className="mt-0.5 text-base font-mono font-semibold text-[#0F172A] tabular-nums">
              {product.usage.activeConsumers} teams
            </div>
          </div>
          <div>
            <div className="text-slate-500">Interfaces</div>
            <div className="mt-0.5 text-sm font-medium text-[#0F172A] truncate">
              {product.interfaces.join(', ')}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg px-2 flex items-center gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'border-[#005EB8] text-[var(--df-primary)]'
                : 'border-transparent text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-slate-200 rounded-b-lg p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">Business Definition</h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {product.businessDefinition}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">Business Purpose</h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {product.businessPurpose}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#0F172A]">Intended Consumers</h2>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {product.intendedConsumers.map((consumer) => (
                    <li key={consumer} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#005EB8] shrink-0" />
                      <span>{consumer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6 space-y-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Domain</div>
                <div className="mt-0.5 font-medium text-[#0F172A]">{product.domain}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Product Owner</div>
                <div className="mt-0.5 font-medium text-[#0F172A]">{product.owner}</div>
                <div className="text-xs text-slate-500">{product.ownerTeam}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Data Steward</div>
                <div className="mt-0.5 font-medium text-[#0F172A]">{product.steward}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Metadata Completeness</div>
                <div className="mt-0.5 font-mono font-semibold text-[#0F172A] tabular-nums">
                  {product.metadataCompleteness}%
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Published / Last Modified</div>
                <div className="mt-0.5 font-mono text-xs text-slate-700 tabular-nums">
                  {product.publishedDate} · {product.lastModified}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                Published Schema Contract ({product.schema.length} fields)
              </h2>
              <span className="text-xs text-slate-500">Types & classifications enforced at publish time</span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-4">Field Name</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Nullable</th>
                    <th className="py-2.5 px-4">Classification</th>
                    <th className="py-2.5 px-4">Sample Value</th>
                    <th className="py-2.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {product.schema.map((field) => (
                    <tr key={field.name} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-4 font-mono font-semibold text-[#0F172A] whitespace-nowrap">
                        {field.name}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {field.type}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                        {field.nullable ? 'Yes' : 'No'}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {field.classification}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 max-w-[200px] truncate">
                        {field.sampleValue}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 min-w-[240px]">
                        {field.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-[#0F172A]">Data Quality Dimensions</h2>
                <span className="text-xs font-mono text-[#15803D] tabular-nums">
                  Overall: {product.quality.overall}% (+{product.quality.trendDelta} pts / 90d)
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Accuracy', score: product.quality.accuracy, color: 'var(--df-primary)' },
                  { label: 'Completeness', score: product.quality.completeness, color: '#0284C7' },
                  { label: 'Consistency', score: product.quality.consistency, color: 'var(--df-secondary)' },
                  { label: 'Validity', score: product.quality.validity, color: '#15803D' },
                  { label: 'Timeliness', score: product.quality.timeliness, color: '#6D28D9' },
                ].map((dim) => (
                  <div key={dim.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{dim.label}</span>
                      <span className="font-mono font-semibold text-[#0F172A] tabular-nums">
                        {dim.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6">
              <h3 className="text-sm font-semibold text-[#0F172A]">6-Month Quality Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated daily validation pass rate</p>
              <div className="mt-6 flex items-end justify-between gap-3 h-40 pt-4 border-b border-slate-200">
                {product.quality.monthlyHistory.map((pt) => (
                  <div key={pt.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-600 tabular-nums">
                      {pt.score}%
                    </span>
                    <div
                      className="w-full max-w-[34px] bg-[var(--df-primary)]/85 rounded-t"
                      style={{ height: `${Math.max(20, (pt.score - 60) * 2.5)}px` }}
                    />
                    <span className="text-xs text-slate-500 pb-1">{pt.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'freshness' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
              <div className="text-xs text-slate-500">Last Updated Timestamp</div>
              <div className="mt-1.5 text-lg font-mono font-semibold text-[#0F172A] tabular-nums">
                {product.freshness.lastUpdated}
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
              <div className="text-xs text-slate-500">Refresh Frequency</div>
              <div className="mt-1.5 text-sm font-semibold text-[#0F172A]">
                {product.freshness.refreshFrequency}
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
              <div className="text-xs text-slate-500">Freshness SLA</div>
              <div className="mt-1.5 text-lg font-mono font-semibold text-[#0F172A] tabular-nums">
                {product.freshness.slaTarget}
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
              <div className="text-xs text-slate-500">Current SLA Status</div>
              <div className="mt-1.5">
                <FreshnessLabel status={product.freshness.status} text={product.freshness.status} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lineage' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A]">End-to-End Data Lineage</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Traceable flow from operational source systems through governed transformations to consumer applications.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-stretch pt-2">
              {product.lineage.map((node, idx) => {
                const stageColors = ['#64748B', '#0284C7', '#6D28D9', 'var(--df-primary)', 'var(--df-secondary)'];
                const accent = stageColors[idx % stageColors.length];
                return (
                  <div key={node.stage} className="flex items-stretch gap-2">
                    <div
                      className={`flex-1 rounded-md border overflow-hidden flex flex-col justify-between ${
                        node.stage === 'Data Product'
                          ? 'border-[var(--df-primary)] bg-[var(--df-primary-soft)]/50'
                          : 'border-slate-200 bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="h-1" style={{ backgroundColor: accent }} />
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] font-semibold" style={{ color: accent }}>
                            {node.stage}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-[#0F172A]">{node.label}</div>
                          <ul className="mt-2.5 space-y-1 text-xs text-slate-600">
                            {node.systems.map((sys) => (
                              <li key={sys}>• {sys}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                          Owner: {node.owner}
                        </div>
                      </div>
                    </div>
                    {idx < product.lineage.length - 1 && (
                      <div className="hidden lg:flex items-center text-slate-400 shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="text-xs text-slate-500">Access Classification & Policy</div>
                <div className="mt-1 text-base font-semibold text-[#0F172A]">
                  {product.accessClassification} · {product.accessEligibility}
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {product.accessPolicySummary}
                </p>
              </div>

              <div>
                <div className="text-xs font-semibold text-[#0F172A]">Eligible User Groups</div>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {product.eligibleUserGroups.map((grp) => (
                    <li key={grp}>• {grp}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onOpenAccessRequest(product.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--df-primary)] hover:bg-[#004488] text-white text-xs font-medium transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                Request Access to {product.name}
              </button>
            </div>

            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
                <Terminal className="w-4 h-4 text-[#005EB8]" />
                Standardized Consumption Interfaces
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.interfaces.map((iface) => (
                  <button
                    key={iface}
                    type="button"
                    onClick={() => setSelectedInterface(iface)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      selectedInterface === iface
                        ? 'bg-[var(--df-primary)] text-white border-[#005EB8]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {iface}
                  </button>
                ))}
              </div>
              <pre className="p-3.5 rounded-md bg-[#0F172A] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                {getInterfaceSnippet(selectedInterface)}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'ai-suitability' && (
          <div className="space-y-8">
            <div className="p-4 rounded-md bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-[#0F172A]">Governance Principle:</strong> AI suitability depends on
              data classification (<strong>{product.accessClassification}</strong>), intended purpose, user
              entitlement, and applicable enterprise policies. Decisions are enforced deterministically by
              the Policy Engine—never by an LLM.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.aiSuitability.map((item) => (
                <div key={item.useCase} className="p-4 border border-slate-200 rounded-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#0F172A]">{item.useCase}</span>
                      <SuitabilityStatusLabel status={item.status} />
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                    Controls: {item.requiredControls.join(' · ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Deterministic AI Suitability Checker */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <ShieldCheck className="w-4 h-4 text-[#005EB8]" />
                Interactive AI Suitability Evaluator (Deterministic Policy Engine)
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Intended AI Use Case
                  </label>
                  <select
                    value={evalUseCase}
                    onChange={(e) => setEvalUseCase(e.target.value as AIUseCase)}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#005EB8]"
                  >
                    {AI_USE_CASES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Consumption Purpose
                  </label>
                  <input
                    type="text"
                    value={evalPurpose}
                    onChange={(e) => setEvalPurpose(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#005EB8]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRunSuitability}
                  disabled={evalLoading}
                  className="h-10 px-4 rounded-md bg-[var(--df-primary)] hover:bg-[#004488] text-white text-xs font-medium transition-colors disabled:opacity-60"
                >
                  {evalLoading ? 'Evaluating Policy...' : 'Evaluate Suitability'}
                </button>
              </div>

              {evalResult && (
                <div className="mt-4 p-4 rounded-md border border-slate-200 bg-[#F8FAFC] space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <SuitabilityStatusLabel status={evalResult.eligibilityStatus} />
                      <span className="font-mono text-slate-500">{evalResult.policyRuleId}</span>
                    </div>
                    <span className="text-slate-500">
                      Simulated Demo Policy Evaluation · Classification: {evalResult.dataClassification}
                    </span>
                  </div>
                  <p className="text-sm text-[#0F172A]">{evalResult.explanation}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="font-semibold text-slate-700">Applicable Restrictions: </span>
                      <span className="text-slate-600">{evalResult.applicableRestrictions.join('; ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Required Approvals: </span>
                      <span className="text-slate-600">{evalResult.requiredApprovals.join('; ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
                  <div className="text-xs text-slate-500">Active Consumers</div>
                  <div className="mt-1 text-xl font-mono font-semibold text-[#0F172A] tabular-nums">
                    {product.usage.activeConsumers}
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
                  <div className="text-xs text-slate-500">Monthly Queries</div>
                  <div className="mt-1 text-xl font-mono font-semibold text-[#0F172A] tabular-nums">
                    {product.usage.monthlyQueries.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-md bg-[#F8FAFC]">
                  <div className="text-xs text-slate-500">Reuse Count</div>
                  <div className="mt-1 text-xl font-mono font-semibold text-[#0F172A] tabular-nums">
                    {product.usage.reuseCount}x
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#0F172A]">Dependent Applications</h3>
                <ul className="mt-2 divide-y divide-slate-100 border border-slate-200 rounded-md">
                  {product.usage.dependentApps.map((app) => (
                    <li key={app} className="px-4 py-2.5 text-sm text-slate-700">
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-6 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6">
              <h3 className="text-sm font-semibold text-[#0F172A]">Consumer Adoption Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active consuming teams over last 6 months</p>
              <div className="mt-6 flex items-end justify-between gap-4 h-44 pt-4 border-b border-slate-200">
                {product.usage.monthlyConsumerTrend.map((pt) => (
                  <div key={pt.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-mono text-slate-700 tabular-nums">{pt.consumers}</span>
                    <div
                      className="w-full max-w-[38px] bg-[#005EB8] rounded-t"
                      style={{ height: `${Math.max(14, pt.consumers * 5)}px` }}
                    />
                    <span className="text-xs text-slate-500 pb-1">{pt.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
