# DataFabricIQ Operations Runbook

This runbook provides operational triage and recovery procedures for **DataFabricIQ** in staging and production environments.

## 1. Gemini 429 Quota Exceeded or Upstream AI Outage

### Symptoms
- Assistant responses switch to `providerMode: "simulated_fallback"` (UI footer displays `Simulated Metadata Mode`).
- Server logs emit `Gemini call unavailable or errored; falling back to deterministic metadata assistant` with status `429 RESOURCE_EXHAUSTED` or `503`.

### Immediate Verification
1. Verify fallback health by sending a test query:
   ```bash
   curl -s -X POST http://localhost:3000/api/assistant/chat \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Which trusted dataset contains customer behavior?"}'
   ```
   Confirm `recommendations` and `policyGuardrailNote` still return `200 OK`.
2. Check quota usage and billing tier for `GEMINI_API_KEY` in the project Secrets / Google AI Studio console.

### Mitigation
- Enable exponential backoff with jitter (1s, 2s, 4s) and response caching for identical catalog queries (for example, the 6 starter prompts) using Redis / ElastiCache with a 15-minute TTL.
- If quota exhaustion persists, route non-critical discovery queries to the deterministic metadata adapter or a secondary configured provider without impacting access authorization.

## 2. Stale Data Product Freshness SLA Breach

### Symptoms
- Producer Workspace shows `Pending SLA` or `Approaching SLA` on a product (for example, `INC-221` staging batch delay or `INC-198` connector rate-limit lag).
- Consumers report outdated `visit_date` or `metric_window_utc` values.

### Triage Steps
1. Inspect the product's **Freshness** and **Lineage** tabs to identify the upstream ingestion stage (`Source Systems` -> `Data Ingestion` -> `Transformation`).
2. Check open incidents in Producer Workspace for connector throttling or schema validation errors (`INC-219` null-check failure).
3. Update product status or incident notes via `PATCH /api/products/:id` so downstream analysts see accurate trust status before running models.
4. Once upstream pipeline recovery completes, verify latency drops below `slaTarget` and close the incident.

## 3. Governance Review Queue Backlog

### Symptoms
- Elevated count of `Pending governance review` requests in **My Workspace** exceeding the 4-hour steward SLA (`POL-CONF-REV-03`, `POL-CONF-AI-05`).

### Triage Steps
1. Query `/api/access-requests` and group pending items by `policyCode` and `domain`.
2. Determine if a single product lacks an anonymized or pre-tokenized projection (for example, `Reservations` or `Customer 360` for `RAG` / `Model Training`).
3. Work with the Product Owner in **Producer Workspace** to publish a pre-masked view so qualifying teams can transition from `Pending governance review` to `Automatically approved` via deterministic rules.

## 4. Catalog Search or API Latency Spike

### Symptoms
- `GET /api/products` or `POST /api/assistant/chat` p95 latency exceeds 500ms (catalog) or 4s (AI assistant).

### Triage Steps
1. Check `GET /api/analytics/summary` for sudden surges in `searchesExecuted` or `aiQueriesExecuted` (potential automated scraping or runaway client loop).
2. Inspect `/api/health` and server memory/CPU utilization.
3. In production AWS deployments:
   - Check RDS PostgreSQL slow-query logs and OpenSearch shard health.
   - Verify CloudFront / Redis cache hit ratios for `GET /api/products` and `GET /api/bootstrap`.
   - Enforce per-user rate limits at AWS WAF / API Gateway (e.g., 30 req/min on `/api/assistant/chat`).
