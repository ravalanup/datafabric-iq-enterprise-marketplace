# DataFabricIQ Security and Compliance Architecture

This document defines the security controls implemented in **DataFabricIQ** and the enterprise compliance architecture required for production deployment (SOX, GDPR/CCPA, and AI Governance).

## 1. Core Security Invariant: LLM Recommends, Policy Engine Authorizes

- The AI Data Assistant (`@google/genai` via `/api/assistant/chat`) is strictly a discovery and decision-support layer.
- It never evaluates user entitlements, issues access tokens, or overrides data classification restrictions.
- All authorization outcomes (`Automatically approved`, `Pending governance review`, `Not eligible`) and AI suitability verdicts (`Approved`, `Conditional`, `Requires Review`, `Not Approved`) are computed exclusively by deterministic code in `src/services/policyEngine.ts`.

## 2. Pre-LLM PII Redaction and Metadata-Only Grounding

- **Zero Row-Level Exposure**: In the current prototype and production design, `/api/assistant/chat` sends only catalog-level metadata (`name`, `domain`, `description`, `qualityOverall`, `freshness`, `aiSuitability`, `lineage` stages, and `schema` column names/types/classifications) to Gemini.
- **No Production Records**: Customer records, PII payloads (`interaction_history`), reservation details, or financial ledger figures are never included in LLM prompts.
- **Pre-RAG Tokenization Gate**: For downstream consumer applications requesting `RAG` or `Model Training` on `Confidential` products (`Customer 360`, `Reservations`), the Policy Engine enforces mandatory PII redaction (`POL-CONF-AI-05`) and Steward sign-off before vector indexing.

## 3. Server-Side RBAC and Persona / Tenant Isolation

- **Prototype State**: The demo persona switcher allows testing role behavior (`Consumer Analyst`, `AI Engineer`, `Data Product Producer`, `Governance Steward`) via explicit `requesterRole` passed to server endpoints.
- **Production Enforcement**:
  - Client-supplied roles must be replaced by cryptographic JWT claims issued by the enterprise Identity Provider (Amazon Cognito / Okta / Microsoft Entra ID / Supabase Auth).
  - Every `/api/*` endpoint validates bearer tokens server-side and derives `userId`, `department`, `entitlementTier`, and `tenantId` from signed claims.
  - Database queries enforce PostgreSQL Row-Level Security (RLS) so Producers can only `PATCH` data products owned by their assigned team (`owner_team_id`) and Stewards can only approve requests within their governed domain scope.

## 4. Regulatory & Enterprise Compliance Controls

### SOX Financial Controls (`Finance Performance`)

- Classified as `Restricted`.
- `evaluateAccessPolicy` blocks `Personalization`, `Model Training`, and `RAG` (`POL-RST-SOX-09`) and enforces dual-control review (`POL-RST-STW-04` / `POL-RST-REV-02`) for `Analytics` and `Forecasting`.
- Production deployments require immutable audit trails recording requester identity, business justification, approver identity, policy code, and query timestamps retained for 7 years in WORM storage (Amazon S3 Object Lock).

### Privacy & Consent Enforcement (`Customer 360`, `Customer Behavior`, `Workforce`)

- **GDPR / CCPA Consent**: `Customer 360` carries `Conditional` suitability for `Personalization`, requiring active marketing consent flags (`consent_status`) and prohibiting raw contact exports.
- **Pseudonymization at Source**: `Customer Behavior` strips direct identifiers before landing (`session_token`, `customer_hash`), enabling `Internal` auto-approved ML experimentation without PII exposure.
- **Workforce k-Anonymity**: `Workforce Capacity & Scheduling` enforces role/region aggregation (`minimum group size >= 15`) and blocks general `RAG`, `Model Training`, and `Agent Access` (`POL-HR-AI-07`).

## 5. Secrets Management & Transport Security

- `GEMINI_API_KEY` is accessed solely in `server.ts` via `process.env.GEMINI_API_KEY` and is never bundled into Vite client assets.
- Production deployments must store all API keys, OAuth client secrets, and database credentials in AWS Secrets Manager or KMS-encrypted environment stores, enforce TLS 1.3 in transit, and apply WAF rate limiting on `/api/assistant/chat` and `/api/products`.
