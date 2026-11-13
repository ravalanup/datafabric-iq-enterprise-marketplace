import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, Send, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import {
  AssistantMessage,
  AssistantSessionSummary,
  PersonaRole,
} from '../types/marketplace.ts';
import { CertificationLabel } from './StatusText.tsx';

interface AssistantViewProps {
  activeRole: PersonaRole;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  onSelectProduct: (productId: string) => void;
  onOpenSuitabilityModal: (productId?: string) => void;
  onHistoryUpdated: (history: AssistantSessionSummary[]) => void;
}

const EXAMPLE_PROMPTS = [
  'Which trusted dataset contains customer behavior?',
  'Can I use Customer 360 to train a personalization model?',
  'Which data products are suitable for forecasting?',
  'Compare Customer 360 and Customer Behavior.',
  'What is the lineage of the Reservations data product?',
  'How fresh is the Operations Performance data?',
];

export function AssistantView({
  activeRole,
  initialPrompt,
  onClearInitialPrompt,
  onSelectProduct,
  onOpenSuitabilityModal,
  onHistoryUpdated,
}: AssistantViewProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Ask me to find trusted datasets, compare data products, check freshness SLAs, trace lineage, or evaluate AI suitability. Every response is grounded strictly in DataFabricIQ catalog metadata.',
      timestamp: 'Ready',
      policyGuardrailNote: 'LLM recommends. Policy Engine authorizes.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTriggeredRef = useRef<string | null>(null);

  const sendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.askAssistant({
        prompt: trimmed,
        personaRole: activeRole,
      });
      setMessages((prev) => [...prev, res.message]);
      onHistoryUpdated(res.assistantHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach AI Data Assistant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && autoTriggeredRef.current !== initialPrompt) {
      autoTriggeredRef.current = initialPrompt;
      void sendPrompt(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--df-ink)]">AI Data Assistant</h1>
          <p className="mt-1 text-sm text-slate-600">
            Grounded discovery and decision support over enterprise data-product metadata.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-white border border-slate-200 text-xs font-medium text-[#0F172A] self-start">
          <ShieldCheck className="w-4 h-4 text-[var(--df-primary)]" />
          <span>LLM recommends. Policy Engine authorizes.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Conversation Panel */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-lg flex flex-col min-h-[560px]">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-[#0F172A]">
              <Bot className="w-4 h-4 text-[var(--df-primary)]" />
              Grounded Metadata Conversation
            </div>
            <span className="text-slate-500">Server-side Gemini proxy with deterministic fallback</span>
          </div>

          <div className="flex-1 p-5 space-y-5 overflow-y-auto max-h-[560px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-lg p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--df-primary)] text-white'
                      : 'bg-[#F8FAFC] border border-slate-200 text-[#0F172A]'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-200 space-y-3">
                      <div className="text-xs font-semibold text-[var(--df-ink)]">
                        Grounded Catalog Recommendations
                      </div>
                      {msg.recommendations.map((rec) => (
                        <div
                          key={rec.productId}
                          className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-sm font-semibold text-[#0F172A]">
                                {rec.productName}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-600">{rec.domain}</span>
                              <span className="text-slate-300">·</span>
                              <CertificationLabel status={rec.certificationStatus} />
                            </div>
                            <span className="text-xs font-mono font-semibold text-[#0F172A] tabular-nums">
                              Quality {rec.qualityScore}%
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">{rec.relevanceReason}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                            <div>
                              <span className="font-semibold text-slate-700">Owner:</span> {rec.owner}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-700">Freshness:</span>{' '}
                              {rec.freshnessLabel}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-slate-700">AI Suitability:</span>{' '}
                              {rec.aiSuitabilityNote}
                            </div>
                            <div className="sm:col-span-2">
                              <span className="font-semibold text-slate-700">Access Policy:</span>{' '}
                              {rec.accessRequirement}
                            </div>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(rec.productId)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--df-primary)] hover:underline"
                            >
                              Open Product Detail
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenSuitabilityModal(rec.productId)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-[var(--df-primary)]"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-[var(--df-primary)]" />
                              Verify Suitability Policy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.policyGuardrailNote && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span>{msg.policyGuardrailNote}</span>
                      {msg.providerMode && (
                        <span>
                          {msg.providerMode === 'gemini' ? 'Gemini Grounded' : 'Simulated Metadata Mode'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[11px] text-slate-400 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-4 max-w-[80%] text-xs text-slate-600">
                Searching DataFabricIQ catalog metadata and evaluating grounded recommendations...
              </div>
            )}

            {error && (
              <div className="p-3 rounded-md border border-red-200 bg-red-50 text-xs text-[#B91C1C]">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about datasets, AI suitability, lineage, comparisons, or freshness..."
              className="flex-1 h-10 px-3.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[var(--df-primary)] focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 px-4 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              Ask Assistant
            </button>
          </form>
        </section>

        {/* Example Prompts & Governance Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-[#0F172A]">Example Questions</h2>
            <p className="mt-1 text-xs text-slate-500">
              Click any prompt to test grounded catalog reasoning:
            </p>
            <div className="mt-3 space-y-2">
              {EXAMPLE_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendPrompt(q)}
                  disabled={loading}
                  className="w-full text-left p-2.5 rounded-md border border-slate-200 bg-[#F8FAFC] hover:border-[var(--df-primary)] hover:bg-white text-xs text-[#0F172A] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5 text-xs space-y-2">
            <div className="font-semibold text-[#0F172A]">Architecture Guardrail</div>
            <p className="text-slate-600 leading-relaxed">
              The AI Data Assistant reads published catalog metadata to recommend candidate datasets
              and explain quality, lineage, and access policies. It never grants entitlements—all
              access and AI-use approvals are enforced deterministically by the Policy Engine.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
