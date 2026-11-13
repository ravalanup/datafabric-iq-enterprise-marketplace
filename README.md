# DataFabricIQ - Enterprise AI-Ready Data Marketplace

DataFabricIQ is an interactive enterprise SaaS prototype that turns fragmented organizational datasets into discoverable, governed, and AI-ready data products. It demonstrates how natural-language discovery, metadata stewardship, deterministic policy enforcement, and self-service access workflows operate together to accelerate analytics, machine learning, RAG, and agentic AI initiatives.

> Note: This prototype uses synthetic enterprise data and simulated demo policy evaluations. It does not connect to any real organization's internal systems or production data.

## Core Architecture Principle

**LLM recommends. Policy Engine authorizes.**

The AI Data Assistant (powered server-side by Google Gemini `gemini-4-hydrogen` with a deterministic metadata fallback) interprets user intent, compares products, and recommends relevant datasets grounded strictly in catalog metadata. All access approvals and AI suitability verdicts are computed deterministically by the Policy Engine in `src/services/policyEngine.ts` - never by the LLM.

## Key Features

- **Executive Home Dashboard** - Natural-language search prompt ("What are you trying to build?"), illustrative marketplace summary metrics, popular enterprise domains, recently viewed tracking, and quick color-theme switching.
- **Multi-Facet Discover Catalog** - Search across product names, business terms, domains, and use cases with filters for domain, certification status, quality score, freshness SLA, AI readiness, access eligibility, consumption interface, and sorting.
- **8-Tab Data Product Detail Workspace** - Full inspection for **Customer 360** and 9 other enterprise products across 7 domains: Overview, Schema, Quality & 6-month trend, Freshness SLAs, 5-stage Visual Lineage, Access & connection snippets, AI Suitability (6 use cases + interactive evaluator), and Usage.
- **Grounded AI Data Assistant** - Server-side `@google/genai` proxy grounded strictly in DataFabricIQ catalog JSON, with automatic deterministic fallback when `GEMINI_API_KEY` is unavailable.
- **Access Request & AI Suitability Workflows** - Step-by-step access request modal (`Automatically approved`, `Pending governance review`, `Not eligible`) and standalone AI Suitability Evaluator (`Approved`, `Conditional`, `Requires Review`, `Not Approved`) synced live with **My Workspace**.
- **Producer Workspace** - Owner health dashboard showing published and draft products, metadata completeness, open incidents, improvement recommendations, and persistent inline metadata editing.
- **Analytics & Live Session Telemetry** - Tracks real visits, section navigation, searches, product inspections, AI queries, suitability checks, and governance actions alongside illustrative executive KPIs.
- **5 Enterprise Color Themes** - Runtime CSS-variable theming (`Institutional Banking Blue`, `Midnight Executive Slate`, `Emerald Private Wealth`, `Nordic Teal & Azure`, `Sovereign Capital Burgundy`).

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Express (`server.ts`) with Vite dev middleware (`tsx server.ts`)
- **AI SDK**: `@google/genai` (`gemini-4-hydrogen`) via server-side `/api/assistant/chat`
- **Persistence (Demo)**: Modular in-memory repository store in `server.ts` (designed for swap to PostgreSQL / RDS / Supabase)

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation & Local Run

```bash
npm install
cp .env.example .env
# Optional: set GEMINI_API_KEY in .env (falls back to deterministic metadata engine if omitted)
npm run dev
```

Open `http://localhost:3000`.

### Build & Typecheck

```bash
npm run lint
npm run build
```

## Documentation Index

- [User Guide](./userguide.md) - Personas, visual walkthroughs, and API usage examples
- [System Design & AWS Architecture](./systdesign.md) - Production AWS and Vercel/Supabase architectures beyond the demo store
- [Developer Guide](./dev.md) - Codebase structure, component map, theming, and extension guide
- [API Reference](./docs/api-reference.md) - REST endpoints, JSON schemas, and deterministic policy rules
- [Governance Policy Matrix](./docs/governance-policy-matrix.md) - Complete `POL-*` and `RULE-*` authorization tables
- [Data Product Onboarding](./docs/data-product-onboarding.md) - Producer metadata contracts, completeness scoring, and certification gates
- [Security & Compliance](./docs/security-compliance.md) - Pre-LLM PII isolation, RBAC, SOX/GDPR controls, and audit logging
- [Operations Runbook](./docs/runbook.md) - Incident playbooks for Gemini 429 failover, SLA lag, and latency triage
- [Testing Strategy](./docs/testing.md) - Smoke curl checks, deterministic policy unit tests, Playwright E2E, and benchmarks
- [Production Roadmap](./docs/roadmap.md) - Prototype-to-production gap analysis and 4-phase delivery plan
