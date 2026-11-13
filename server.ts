import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  DEMO_PERSONAS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRODUCTS,
} from './src/data/catalogData.ts';
import { evaluateAccessPolicy, evaluateAISuitability } from './src/services/policyEngine.ts';
import {
  AccessPurpose,
  AIUseCase,
  AssistantRecommendation,
  AssistantSessionSummary,
  DataProduct,
  LiveAnalyticsSummary,
  MarketplaceNotification,
  NavSection,
  PersonaRole,
  TelemetryEvent,
  TelemetryEventType,
} from './src/types/marketplace.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Modular in-memory repository store (swappable with Supabase / PostgreSQL in production)
const store = {
  products: structuredClone(INITIAL_PRODUCTS) as DataProduct[],
  accessRequests: structuredClone(INITIAL_ACCESS_REQUESTS),
  notifications: structuredClone(INITIAL_NOTIFICATIONS) as MarketplaceNotification[],
  savedProductIds: ['customer-360', 'customer-behavior'] as string[],
  recentlyViewedIds: ['customer-360', 'reservations', 'operations-performance'] as string[],
  assistantHistory: [
    {
      id: 'hist-1',
      prompt: 'Which trusted dataset contains customer behavior?',
      recommendedProducts: ['Customer Behavior', 'Customer 360'],
      timestamp: 'Today · 10:12 AM',
      providerMode: 'simulated_fallback' as const,
    },
  ] as AssistantSessionSummary[],
  telemetryEvents: [
    {
      id: 'evt-seed-1',
      type: 'page_visit' as TelemetryEventType,
      section: 'home' as NavSection,
      label: 'Visited Home Executive Overview',
      personaRole: 'Consumer Analyst' as PersonaRole,
      timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    },
    {
      id: 'evt-seed-2',
      type: 'product_viewed' as TelemetryEventType,
      section: 'products' as NavSection,
      label: 'Inspected Customer 360',
      personaRole: 'Consumer Analyst' as PersonaRole,
      timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    },
    {
      id: 'evt-seed-3',
      type: 'ai_query' as TelemetryEventType,
      section: 'assistant' as NavSection,
      label: 'Queried AI Data Assistant: customer behavior',
      personaRole: 'AI Engineer' as PersonaRole,
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
  ] as TelemetryEvent[],
};

function recordTelemetry(
  type: TelemetryEventType,
  section: NavSection,
  label: string,
  personaRole: PersonaRole = 'Consumer Analyst'
) {
  const evt: TelemetryEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    section,
    label,
    personaRole,
    timestamp: new Date().toISOString(),
  };
  store.telemetryEvents.unshift(evt);
  if (store.telemetryEvents.length > 200) {
    store.telemetryEvents.length = 200;
  }
  return evt;
}

function buildAnalyticsSummary(): LiveAnalyticsSummary {
  const events = store.telemetryEvents;
  const pageVisits = events.filter((e) => e.type === 'page_visit');
  const uniqueSections = new Set(pageVisits.map((e) => e.section));

  const sectionCounts = new Map<string, number>();
  for (const e of pageVisits) {
    sectionCounts.set(e.section, (sectionCounts.get(e.section) ?? 0) + 1);
  }

  const featureMap: Record<string, number> = {
    'Catalog Discovery Searches': events.filter((e) => e.type === 'search_executed').length,
    'Product Detail Inspections': events.filter((e) => e.type === 'product_viewed').length,
    'AI Assistant Prompts': events.filter((e) => e.type === 'ai_query').length,
    'AI Suitability Checks': events.filter((e) => e.type === 'suitability_checked').length,
    'Access Requests Submitted': events.filter((e) => e.type === 'access_requested').length,
    'Producer Metadata Edits': events.filter((e) => e.type === 'metadata_updated').length,
  };

  return {
    totalVisits: pageVisits.length,
    uniqueSectionsVisited: uniqueSections.size,
    searchesExecuted: featureMap['Catalog Discovery Searches'],
    productsViewed: featureMap['Product Detail Inspections'],
    aiQueriesExecuted: featureMap['AI Assistant Prompts'],
    suitabilityChecksRun: featureMap['AI Suitability Checks'],
    accessRequestsSubmitted: featureMap['Access Requests Submitted'],
    metadataUpdatesSaved: featureMap['Producer Metadata Edits'],
    featureUsageBreakdown: Object.entries(featureMap).map(([feature, count]) => ({
      feature,
      count,
    })),
    sectionVisitBreakdown: Array.from(sectionCounts.entries()).map(([section, visits]) => ({
      section,
      visits,
    })),
    recentEvents: events.slice(0, 15),
  };
}

function toRecommendation(product: DataProduct, reason: string, aiNote?: string): AssistantRecommendation {
  const approvedUses = product.aiSuitability
    .filter((s) => s.status === 'Approved' || s.status === 'Conditional')
    .map((s) => `${s.useCase} (${s.status})`)
    .slice(0, 3)
    .join(', ');

  return {
    productId: product.id,
    productName: product.name,
    domain: product.domain,
    qualityScore: product.quality.overall,
    freshnessLabel: `${product.freshness.lastUpdated} · ${product.freshness.status}`,
    certificationStatus: product.certificationStatus,
    owner: product.owner,
    relevanceReason: reason,
    aiSuitabilityNote: aiNote || (approvedUses ? `Suitable for: ${approvedUses}` : 'Restricted / Draft — see suitability matrix'),
    accessRequirement: `${product.accessClassification} · ${product.accessEligibility}`,
  };
}

function runSimulatedMetadataAssistant(prompt: string): {
  content: string;
  recommendations: AssistantRecommendation[];
} {
  const q = prompt.toLowerCase();
  const published = store.products.filter((p) => p.status === 'Published');

  // Comparison intent
  if (q.includes('compare') && (q.includes('customer 360') || q.includes('customer behavior'))) {
    const c360 = store.products.find((p) => p.id === 'customer-360')!;
    const cb = store.products.find((p) => p.id === 'customer-behavior')!;
    return {
      content:
        `Here is a grounded comparison between **Customer 360** and **Customer Behavior**:\n\n` +
        `• **Scope & Grain**: *Customer 360* (${c360.quality.overall}% quality, ${c360.freshness.lastUpdated}) is an identity-resolved golden customer profile combining CRM, reservations, and purchase history. *Customer Behavior* (${cb.quality.overall}% quality, ${cb.freshness.lastUpdated}) is a pseudonymized digital clickstream & session intent stream.\n` +
        `• **AI & Personalization**: *Customer Behavior* is **Approved** for Personalization and Model Training with **Auto-Approved** Internal access. *Customer 360* is **Conditional** for Personalization (requires consent filter) and **Conditional / Requires Review** for Model Training and RAG due to PII in \`interaction_history\`.\n` +
        `• **Recommendation**: Start with *Customer Behavior* for rapid personalization sequence modeling; request *Customer 360* when you need LTV tiers or offline reservation joins.`,
      recommendations: [
        toRecommendation(cb, 'Fastest path for pseudonymized personalization & sequence models.', 'Personalization: Approved · Model Training: Approved'),
        toRecommendation(c360, 'Complete customer entity with LTV, reservations, and engagement score.', 'Personalization: Conditional (consent required) · Analytics: Approved'),
      ],
    };
  }

  // Lineage question
  if (q.includes('lineage')) {
    const target =
      published.find((p) => q.includes(p.name.toLowerCase())) ||
      published.find((p) => p.id === 'reservations')!;
    const chain = target.lineage.map((n) => `${n.stage} (${n.systems.join(', ')})`).join(' -> ');
    return {
      content:
        `Grounded lineage for **${target.name}** (Owner: ${target.owner}, ${target.certificationStatus}):\n\n` +
        `${chain}\n\n` +
        `Quality stands at **${target.quality.overall}%** and freshness is **${target.freshness.lastUpdated}** (${target.freshness.slaTarget}).`,
      recommendations: [
        toRecommendation(target, `End-to-end 5-stage lineage verified under ${target.ownerTeam}.`),
      ],
    };
  }

  // Freshness question
  if (q.includes('fresh') || q.includes('stale') || q.includes('sla') || q.includes('updated')) {
    const target = published.find((p) => q.includes(p.name.toLowerCase()));
    if (target) {
      return {
        content:
          `**${target.name}** was last updated **${target.freshness.lastUpdated}** on a **${target.freshness.refreshFrequency}** cadence. ` +
          `Its freshness SLA is **${target.freshness.slaTarget}** and current status is **${target.freshness.status}**.`,
        recommendations: [
          toRecommendation(target, `Freshness verified: ${target.freshness.lastUpdated} (${target.freshness.status}).`),
        ],
      };
    }
  }

  // Customer 360 + personalization model question
  if (q.includes('customer 360') && (q.includes('personalization') || q.includes('train'))) {
    const c360 = store.products.find((p) => p.id === 'customer-360')!;
    const cb = store.products.find((p) => p.id === 'customer-behavior')!;
    return {
      content:
        `**Customer 360** is **Conditional** for Personalization and Model Training—not automatically approved without policy checks.\n\n` +
        `• **Why**: It carries **Confidential** classification with PII inside \`interaction_history\`.\n` +
        `• **Policy Requirements**: Active marketing consent flags must be enforced for Personalization, and Model Training requires a de-identified snapshot in the ML Sandbox.\n` +
        `• **Alternative**: If you need immediate, PII-free training data, **Customer Behavior** is **Approved** and Auto-Approved for Personalization and Model Training.`,
      recommendations: [
        toRecommendation(c360, 'Conditional for Personalization & Model Training pending consent & de-identification controls.', 'Personalization: Conditional · Model Training: Conditional'),
        toRecommendation(cb, 'Immediate PII-free behavioral alternative.', 'Personalization: Approved · Model Training: Approved'),
      ],
    };
  }

  // Forecasting intent
  if (q.includes('forecast')) {
    const forecastReady = published
      .filter((p) => p.aiSuitability.some((a) => a.useCase === 'Forecasting' && (a.status === 'Approved' || a.status === 'Conditional')))
      .sort((a, b) => b.quality.overall - a.quality.overall)
      .slice(0, 4);
    return {
      content:
        `Based on DataFabricIQ metadata, these certified products are evaluated for **Forecasting**:\n\n` +
        forecastReady
          .map(
            (p) =>
              `• **${p.name}** (${p.domain}) — Quality ${p.quality.overall}%, updated ${p.freshness.lastUpdated}, Forecasting status: **${p.aiSuitability.find((a) => a.useCase === 'Forecasting')?.status}**.`
          )
          .join('\n'),
      recommendations: forecastReady.map((p) =>
        toRecommendation(
          p,
          p.aiSuitability.find((a) => a.useCase === 'Forecasting')?.summary || 'Suitable for forecasting.'
        )
      ),
    };
  }

  // Customer behavior / personalization general search
  if (q.includes('behavior') || q.includes('personaliz') || q.includes('customer')) {
    const matched = published
      .filter((p) => p.id === 'customer-behavior' || p.id === 'customer-360' || p.id === 'streaming-engagement')
      .slice(0, 3);
    return {
      content:
        `I found **${matched.length} trusted, certified data products** matching customer behavior and personalization:\n\n` +
        `1. **Customer Behavior** — Highest immediate fit for personalization models (Internal pseudonymized, Quality 95%, updated 8 min ago, Auto-Approved).\n` +
        `2. **Customer 360** — Unified customer profile with engagement score and purchase history (Confidential, Quality 97%, Personalization is Conditional pending consent check).\n` +
        `3. **Streaming Engagement** — Digital media playback affinity signals (Internal, Quality 92%, updated 5 min ago).`,
      recommendations: matched.map((p) =>
        toRecommendation(p, p.businessPurpose)
      ),
    };
  }

  // Keyword fallback across all products
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  const scored = published
    .map((p) => {
      const hay = `${p.name} ${p.domain} ${p.description} ${p.businessPurpose} ${p.keywords.join(' ')}`.toLowerCase();
      const score = tokens.reduce((acc, tok) => (hay.includes(tok) ? acc + 1 : acc), 0);
      return { product: p, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.product.quality.overall - a.product.quality.overall)
    .slice(0, 3);

  if (scored.length === 0) {
    return {
      content:
        `No published DataFabricIQ product in the current catalog directly matches "${prompt}". ` +
        `Try asking about customer behavior, Customer 360, reservations, forecasting datasets, operations freshness, or finance governance controls.`,
      recommendations: [],
    };
  }

  return {
    content:
      `Here are the closest grounded matches from the **DataFabricIQ** catalog for your query:\n\n` +
      scored
        .map(
          ({ product }) =>
            `• **${product.name}** (${product.domain}) — ${product.certificationStatus}, Quality **${product.quality.overall}%**, updated **${product.freshness.lastUpdated}**.`
        )
        .join('\n'),
    recommendations: scored.map(({ product }) => toRecommendation(product, product.description)),
  };
}

async function runGeminiAssistant(prompt: string): Promise<{
  content: string;
  recommendations: AssistantRecommendation[];
  providerMode: 'gemini' | 'simulated_fallback';
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    const sim = runSimulatedMetadataAssistant(prompt);
    return { ...sim, providerMode: 'simulated_fallback' };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const catalogSnapshot = store.products.map((p) => ({
      id: p.id,
      name: p.name,
      domain: p.domain,
      status: p.status,
      certificationStatus: p.certificationStatus,
      owner: p.owner,
      description: p.description,
      qualityOverall: p.quality.overall,
      freshness: p.freshness,
      aiReady: p.aiReady,
      accessClassification: p.accessClassification,
      accessEligibility: p.accessEligibility,
      interfaces: p.interfaces,
      aiSuitability: p.aiSuitability,
      lineage: p.lineage.map((l) => `${l.stage}: ${l.systems.join(', ')}`),
      schemaFields: p.schema.map((s) => `${s.name} (${s.type}, ${s.classification})`),
    }));

    const systemInstruction = `You are the DataFabricIQ AI Data Assistant inside an enterprise data marketplace.
Rules you MUST obey:
1. Ground 100% of your answer strictly in the provided DataFabricIQ Catalog JSON below. Never invent products, columns, quality scores, timestamps, owners, or lineage stages.
2. If the catalog does not contain information asked by the user, explicitly state that it is unavailable in the catalog.
3. Explain why recommended products are relevant, including quality score, freshness, certification status, owner, AI-use-case suitability, and access requirements.
4. CRITICAL GOVERNANCE RULE: "LLM recommends. Policy Engine authorizes." Never grant access or override policy checks; tell users to submit an Access Request or run the deterministic AI Suitability Evaluator.
5. Keep answers concise, executive-ready, and structured.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Catalog Metadata JSON:\n${JSON.stringify(catalogSnapshot)}\n\nUser Question: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description: 'Grounded, well-structured explanation answering the user question using catalog metadata only.',
            },
            recommendedProductIds: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  relevanceReason: { type: Type.STRING },
                  aiSuitabilityNote: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      answer?: string;
      recommendedProductIds?: Array<{
        productId: string;
        relevanceReason: string;
        aiSuitabilityNote?: string;
      }>;
    };

    const recs: AssistantRecommendation[] = [];
    for (const item of parsed.recommendedProductIds ?? []) {
      const prod = store.products.find((p) => p.id === item.productId);
      if (prod) {
        recs.push(toRecommendation(prod, item.relevanceReason, item.aiSuitabilityNote));
      }
    }

    if (!parsed.answer) {
      throw new Error('Empty Gemini response text');
    }

    return {
      content: parsed.answer,
      recommendations: recs,
      providerMode: 'gemini',
    };
  } catch (error) {
    console.warn('Gemini call unavailable or errored; falling back to deterministic metadata assistant:', error);
    const sim = runSimulatedMetadataAssistant(prompt);
    return { ...sim, providerMode: 'simulated_fallback' };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'DataFabricIQ API' });
  });

  // Bootstrap initial workspace payload
  app.get('/api/bootstrap', (_req, res) => {
    res.json({
      products: store.products,
      personas: DEMO_PERSONAS,
      accessRequests: store.accessRequests,
      notifications: store.notifications,
      savedProductIds: store.savedProductIds,
      recentlyViewedIds: store.recentlyViewedIds,
      assistantHistory: store.assistantHistory,
      analyticsSummary: buildAnalyticsSummary(),
    });
  });

  // Search & filter catalog products
  app.get('/api/products', (req, res) => {
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const domain = String(req.query.domain ?? 'All');
    const certification = String(req.query.certification ?? 'All');
    const minQuality = Number(req.query.minQuality ?? 0);
    const freshness = String(req.query.freshness ?? 'All');
    const aiReady = String(req.query.aiReady ?? 'All');
    const accessStatus = String(req.query.accessStatus ?? 'All');
    const iface = String(req.query.interface ?? 'All');
    const sort = String(req.query.sort ?? 'relevance');
    const includeDrafts = String(req.query.includeDrafts ?? 'false') === 'true';

    let list = store.products.filter((p) => (includeDrafts ? true : p.status === 'Published'));

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

    if (q) {
      const tokens = q.split(/\s+/).filter((t) => t.length > 1);
      list = list
        .map((p) => {
          const hay = `${p.name} ${p.domain} ${p.description} ${p.businessDefinition} ${p.businessPurpose} ${p.owner} ${p.keywords.join(' ')}`.toLowerCase();
          const hits = tokens.reduce((acc, tok) => (hay.includes(tok) ? acc + 1 : acc), 0);
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

    res.json({ products: list });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = store.products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Data product not found' });
    }
    res.json({ product });
  });

  // Producer Workspace metadata update
  app.patch('/api/products/:id', (req, res) => {
    const idx = store.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Data product not found' });
    }
    const existing = store.products[idx];
    const {
      description,
      businessDefinition,
      owner,
      certificationStatus,
      status,
      freshnessSla,
      personaRole,
    } = req.body as {
      description?: string;
      businessDefinition?: string;
      owner?: string;
      certificationStatus?: DataProduct['certificationStatus'];
      status?: DataProduct['status'];
      freshnessSla?: string;
      personaRole?: PersonaRole;
    };

    const updated: DataProduct = {
      ...existing,
      description: description ?? existing.description,
      businessDefinition: businessDefinition ?? existing.businessDefinition,
      owner: owner ?? existing.owner,
      certificationStatus: certificationStatus ?? existing.certificationStatus,
      status: status ?? existing.status,
      freshness: freshnessSla
        ? { ...existing.freshness, slaTarget: freshnessSla }
        : existing.freshness,
      lastModified: new Date().toISOString().slice(0, 10),
    };

    // Recalculate completeness deterministically
    let completeness = 70;
    if (updated.description.length > 40) completeness += 10;
    if (updated.businessDefinition.length > 40) completeness += 10;
    if (updated.owner.trim().length > 2) completeness += 5;
    if (updated.certificationStatus === 'Certified') completeness += 5;
    updated.metadataCompleteness = Math.min(100, completeness);

    store.products[idx] = updated;

    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `Metadata Updated: ${updated.name}`,
      detail: `Owner ${updated.owner} saved stewardship updates (${updated.certificationStatus}, ${updated.metadataCompleteness}% completeness).`,
      timestamp: 'Just now',
      read: false,
      category: 'producer',
    });

    recordTelemetry('metadata_updated', 'producer', `Updated metadata for ${updated.name}`, personaRole || 'Data Product Producer');
    res.json({ product: updated, notifications: store.notifications });
  });

  // Track viewed product
  app.post('/api/products/:id/view', (req, res) => {
    const product = store.products.find((p) => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const personaRole = (req.body?.personaRole as PersonaRole) || 'Consumer Analyst';

    store.recentlyViewedIds = [
      product.id,
      ...store.recentlyViewedIds.filter((id) => id !== product.id),
    ].slice(0, 6);

    recordTelemetry('product_viewed', 'products', `Inspected ${product.name}`, personaRole);
    res.json({ recentlyViewedIds: store.recentlyViewedIds });
  });

  // Toggle saved product
  app.post('/api/products/:id/save', (req, res) => {
    const id = req.params.id;
    const exists = store.savedProductIds.includes(id);
    store.savedProductIds = exists
      ? store.savedProductIds.filter((x) => x !== id)
      : [id, ...store.savedProductIds];
    res.json({ savedProductIds: store.savedProductIds, saved: !exists });
  });

  // Deterministic AI Suitability Evaluation
  app.post('/api/governance/evaluate-suitability', (req, res) => {
    const { productId, aiUseCase, consumptionPurpose, personaRole } = req.body as {
      productId: string;
      aiUseCase: AIUseCase;
      consumptionPurpose: string;
      personaRole?: PersonaRole;
    };
    const product = store.products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Data product not found' });

    const evaluation = evaluateAISuitability(product, aiUseCase, consumptionPurpose || 'Enterprise Initiative');
    recordTelemetry(
      'suitability_checked',
      'products',
      `Evaluated ${product.name} for ${aiUseCase} (${evaluation.eligibilityStatus})`,
      personaRole || 'AI Engineer'
    );
    res.json({ evaluation });
  });

  // Submit Access Request -> Deterministic Policy Engine
  app.get('/api/access-requests', (_req, res) => {
    res.json({ accessRequests: store.accessRequests });
  });

  app.post('/api/access-requests', (req, res) => {
    const { productId, purpose, justification, requesterName, requesterRole } = req.body as {
      productId: string;
      purpose: AccessPurpose;
      justification: string;
      requesterName?: string;
      requesterRole?: PersonaRole;
    };

    const product = store.products.find((p) => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Data product not found' });

    const role: PersonaRole = requesterRole || 'Consumer Analyst';
    const decision = evaluateAccessPolicy(product, purpose, role, justification || '');

    const record = {
      id: `REQ-${Math.floor(4020 + Math.random() * 900)}`,
      productId: product.id,
      productName: product.name,
      domain: product.domain,
      requesterName: requesterName || 'Elena Vance',
      requesterRole: role,
      purpose,
      justification: justification || 'Enterprise analytical evaluation',
      outcome: decision.outcome,
      policyCode: decision.policyCode,
      rationale: decision.rationale,
      conditions: decision.conditions,
      submittedAt: new Date().toISOString(),
      isSimulatedDemo: true as const,
    };

    store.accessRequests.unshift(record);
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: `${record.id}: ${record.outcome}`,
      detail: `${product.name} (${purpose}) evaluated under ${decision.policyCode}.`,
      timestamp: 'Just now',
      read: false,
      category: 'access',
    });

    recordTelemetry(
      'access_requested',
      'workspace',
      `Requested ${product.name} for ${purpose} (${decision.outcome})`,
      role
    );

    res.json({
      accessRequest: record,
      accessRequests: store.accessRequests,
      notifications: store.notifications,
    });
  });

  // Mark notifications read
  app.post('/api/notifications/read-all', (_req, res) => {
    store.notifications = store.notifications.map((n) => ({ ...n, read: true }));
    res.json({ notifications: store.notifications });
  });

  // AI Data Assistant (Server-side Gemini proxy with deterministic metadata fallback)
  app.post('/api/assistant/chat', async (req, res) => {
    const { prompt, personaRole } = req.body as {
      prompt: string;
      personaRole?: PersonaRole;
    };

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await runGeminiAssistant(prompt.trim());

    const historyEntry: AssistantSessionSummary = {
      id: `hist-${Date.now()}`,
      prompt: prompt.trim(),
      recommendedProducts: result.recommendations.map((r) => r.productName),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      providerMode: result.providerMode,
    };
    store.assistantHistory.unshift(historyEntry);
    store.assistantHistory = store.assistantHistory.slice(0, 12);

    recordTelemetry(
      'ai_query',
      'assistant',
      `AI Assistant: "${prompt.trim().slice(0, 48)}${prompt.trim().length > 48 ? '...' : ''}"`,
      personaRole || 'AI Engineer'
    );

    res.json({
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: result.recommendations,
        policyGuardrailNote: 'LLM recommends. Policy Engine authorizes.',
        providerMode: result.providerMode,
      },
      assistantHistory: store.assistantHistory,
    });
  });

  // Analytics & Live Visit / Feature Usage Tracking
  app.post('/api/analytics/event', (req, res) => {
    const { type, section, label, personaRole } = req.body as {
      type: TelemetryEventType;
      section: NavSection;
      label: string;
      personaRole?: PersonaRole;
    };
    recordTelemetry(type, section, label, personaRole || 'Consumer Analyst');
    res.json({ summary: buildAnalyticsSummary() });
  });

  app.get('/api/analytics/summary', (_req, res) => {
    res.json({ summary: buildAnalyticsSummary() });
  });

  // Vite dev middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`DataFabricIQ server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start DataFabricIQ server:', err);
  process.exit(1);
});
