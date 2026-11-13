# DataFabricIQ Testing Strategy

This document defines smoke tests, unit tests for the deterministic Policy Engine, end-to-end Playwright journeys, and performance benchmarks for **DataFabricIQ**.

## 1. Live API Smoke Tests (curl)

Run these commands while `npm run dev` is active on port `3000`:

```bash
# 1. Health check
curl -f -s http://localhost:3000/api/health

# 2. Bootstrap workspace state
curl -f -s http://localhost:3000/api/bootstrap | grep -q "customer-360"

# 3. Filtered catalog search
curl -f -s "http://localhost:3000/api/products?domain=Customer%20Experience&aiReady=AI-Ready%20Only" | grep -q "Customer Behavior"

# 4. Deterministic AI Suitability evaluation (Customer 360 + Personalization -> Conditional)
curl -f -s -X POST http://localhost:3000/api/governance/evaluate-suitability \
  -H "Content-Type: application/json" \
  -d '{"productId":"customer-360","aiUseCase":"Personalization","consumptionPurpose":"Ranker"}' \
  | grep -q '"eligibilityStatus":"Conditional"'

# 5. Deterministic Access Policy block (Finance Performance + Model Training -> Not eligible)
curl -f -s -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d '{"productId":"finance-performance","purpose":"Model Training","justification":"Train LLM","requesterRole":"AI Engineer"}' \
  | grep -q '"outcome":"Not eligible"'

# 6. AI Data Assistant grounded query
curl -f -s -X POST http://localhost:3000/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Compare Customer 360 and Customer Behavior."}' \
  | grep -q "LLM recommends. Policy Engine authorizes."
```

## 2. Unit Tests - Deterministic Policy Engine (`policyEngine.ts`)

Every rule in `src/services/policyEngine.ts` is pure and deterministic, making 100% branch coverage mandatory:

- **Draft Blocking**: `omnichannel-loyalty-signals` returns `Not eligible` (`POL-DRAFT-BLK-00`) regardless of persona or purpose.
- **SOX Enforcement**: `finance-performance` returns `Not eligible` (`POL-RST-SOX-09`) for `Personalization`, `Model Training`, and `RAG`, and `Pending governance review` for `Analytics` / `Forecasting`.
- **Workforce Privacy**: `workforce-capacity` blocks `Personalization`, `Model Training`, and `RAG` (`POL-HR-AI-07`).
- **Confidential Consent & PII**: `customer-360` returns `Automatically approved` (`POL-CONF-BI-02`) for `Analytics` with valid justification (>= 12 chars) and `Pending governance review` (`POL-CONF-AI-05`) for `RAG` / `Model Training`.
- **Internal Auto-Approval**: `customer-behavior` returns `Automatically approved` (`POL-INT-AUTO-01`) across `Analytics`, `Personalization`, `Forecasting`, and `Model Training`.
- **Scope Guard**: `operations-performance` returns `Not eligible` (`POL-SCOPE-BLK-06`) when requested for `Personalization`.

## 3. Contract & Schema Validation

- Validate that all `INITIAL_PRODUCTS` in `src/data/catalogData.ts` include all 6 `AIUseCase` entries, valid 5-stage `lineage` nodes, non-empty `schema` definitions, and consistent `quality.overall` scores.
- Validate `PATCH /api/products/:id` recalculates `metadataCompleteness` deterministically and updates `lastModified`.
- Validate `POST /api/analytics/event` increments `totalVisits` and `featureUsageBreakdown` accurately.

## 4. End-to-End Playwright Journeys

Automate the four acceptance journeys in headless Chromium:

1. **Journey A - Discover & Consume**: Search `"customer behavior"` on Home -> open `Customer 360` -> inspect Schema, Quality, Freshness, and Lineage tabs -> submit Access Request -> verify new request appears in **My Workspace**.
2. **Journey B - AI-Assisted Discovery**: Open **AI Data Assistant** -> click `"Compare Customer 360 and Customer Behavior."` -> verify grounded product cards render -> click `"Open Product Detail"` to navigate directly to the product view.
3. **Journey C - Governance**: Open **AI Suitability Policy Evaluator** -> select `Finance Performance` + `Model Training` -> verify deterministic `Not Approved` outcome and SOX policy rule ID.
4. **Journey D - Producer Management & Live Telemetry**: Open **Producer Workspace** -> select `Omnichannel Loyalty Signals` -> edit description & save -> verify completeness updates -> open **Analytics** (`Live Demo Visits & Feature Use`) and verify `Producer Metadata Edits` incremented.

## 5. Performance & Latency Benchmarks

| Operation | Target p50 | Target p95 | Notes |
| :--- | :--- | :--- | :--- |
| `GET /api/bootstrap` | < 15 ms | < 40 ms | In-memory / Redis cached in production |
| `GET /api/products` (filtered) | < 20 ms | < 60 ms | OpenSearch / indexed PostgreSQL target < 120 ms |
| `POST /api/governance/evaluate-suitability` | < 5 ms | < 15 ms | Pure deterministic rule execution |
| `POST /api/assistant/chat` (Fallback) | < 10 ms | < 30 ms | Local metadata matcher |
| `POST /api/assistant/chat` (Gemini) | < 1.5 s | < 3.5 s | `gemini-4-hydrogen` structured JSON output |
