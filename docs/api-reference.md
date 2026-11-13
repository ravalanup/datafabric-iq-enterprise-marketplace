# DataFabricIQ API Reference

Base URL (Local Dev): `http://localhost:3000`
Content Type: `application/json`

All endpoints are implemented in `server.ts` and consumed via `src/services/apiClient.ts`.

## 1. Health & Bootstrap

### `GET /api/health`

Verifies API availability.

**Response (`200 OK`)**
```json
{
  "status": "ok",
  "service": "DataFabricIQ API"
}
```

### `GET /api/bootstrap`

Loads initial products, personas, access requests, notifications, saved IDs, recently viewed IDs, assistant history, and live analytics summary.

**Response (`200 OK`)**
```json
{
  "products": ["...DataProduct[]"],
  "personas": ["...PersonaProfile[]"],
  "accessRequests": ["...AccessRequestRecord[]"],
  "notifications": ["...MarketplaceNotification[]"],
  "savedProductIds": ["customer-360", "customer-behavior"],
  "recentlyViewedIds": ["customer-360", "reservations"],
  "assistantHistory": ["...AssistantSessionSummary[]"],
  "analyticsSummary": { "totalVisits": 1, "uniqueSectionsVisited": 1 }
}
```

## 2. Catalog & Producer Endpoints

### `GET /api/products`

Filters and sorts data products.

**Query Parameters**
- `q` (string) - Natural-language or keyword search across name, domain, description, definition, owner, and keywords
- `domain` (string, default `All`) - Exact domain match
- `certification` (string, default `All`) - `Certified`, `In Review`, `Draft`
- `minQuality` (number, default `0`) - Minimum overall quality score
- `freshness` (string, default `All`) - `Under 30m`, `Under 2h`
- `aiReady` (string, default `All`) - `AI-Ready Only`
- `accessStatus` (string, default `All`) - Substring match on `accessEligibility`
- `interface` (string, default `All`) - `SQL`, `REST API`, `Python SDK`, `Feature Store`, `MCP Tool`, `Kafka Stream`
- `sort` (string, default `relevance`) - `relevance`, `trust`, `freshness`, `popularity`
- `includeDrafts` (boolean string, default `false`)

**Response (`200 OK`)**
```json
{
  "products": [
    {
      "id": "customer-360",
      "name": "Customer 360",
      "domain": "Customer Experience",
      "certificationStatus": "Certified",
      "quality": { "overall": 97 },
      "freshness": { "lastUpdated": "15 min ago", "status": "Within SLA" }
    }
  ]
}
```

### `GET /api/products/:id`

Returns full metadata, schema, lineage, quality history, and AI suitability for a single product. Returns `404` if not found.

### `PATCH /api/products/:id`

Updates product stewardship metadata from Producer Workspace and recalculates `metadataCompleteness` deterministically.

**Request Body**
```json
{
  "description": "Updated description...",
  "businessDefinition": "Updated canonical definition...",
  "owner": "Priya Nair",
  "certificationStatus": "Certified",
  "status": "Published",
  "freshnessSla": "< 60 minutes",
  "personaRole": "Data Product Producer"
}
```

**Response (`200 OK`)**
```json
{
  "product": { "id": "omnichannel-loyalty-signals", "metadataCompleteness": 95 },
  "notifications": ["...MarketplaceNotification[]"]
}
```

### `POST /api/products/:id/view` and `POST /api/products/:id/save`

- `POST /api/products/:id/view` (`{ "personaRole": "Consumer Analyst" }`) updates `recentlyViewedIds` and records a `product_viewed` telemetry event.
- `POST /api/products/:id/save` toggles bookmark status in `savedProductIds`.

## 3. Governance & Deterministic Policy Endpoints

### `POST /api/governance/evaluate-suitability`

Evaluates AI use-case suitability using deterministic policy rules in `src/services/policyEngine.ts`.

**Request Body**
```json
{
  "productId": "customer-360",
  "aiUseCase": "Personalization",
  "consumptionPurpose": "Next-best-experience ranking",
  "personaRole": "AI Engineer"
}
```

**Response (`200 OK`)**
```json
{
  "evaluation": {
    "productId": "customer-360",
    "productName": "Customer 360",
    "aiUseCase": "Personalization",
    "consumptionPurpose": "Next-best-experience ranking",
    "eligibilityStatus": "Conditional",
    "dataClassification": "Confidential",
    "applicableRestrictions": [
      "Consent flag filter enabled",
      "No raw contact export"
    ],
    "requiredApprovals": [
      "Automated policy guardrail verification (consent / masking / sandbox)"
    ],
    "explanation": "Approved when filtered to active marketing consent flags...",
    "policyRuleId": "RULE-CUS-PERS-CON",
    "evaluatedAt": "2026-11-13T23:15:00.000Z",
    "isSimulatedDemo": true
  }
}
```

### `GET /api/access-requests` & `POST /api/access-requests`

Submits an access request and evaluates deterministic outcome (`Automatically approved`, `Pending governance review`, or `Not eligible`).

**Request Body (`POST`)**
```json
{
  "productId": "customer-360",
  "purpose": "Analytics",
  "justification": "Build quarterly executive retention scorecard",
  "requesterName": "Elena Vance",
  "requesterRole": "Consumer Analyst"
}
```

**Deterministic Policy Evaluation Rules (`evaluateAccessPolicy`)**
- Draft products -> `Not eligible` (`POL-DRAFT-BLK-00`)
- `Restricted` products (e.g., `Finance Performance`) for `Personalization`, `Model Training`, or `RAG` -> `Not eligible` (`POL-RST-SOX-09`)
- `Restricted` products for `Analytics`, `Forecasting`, or `Application Integration` -> `Pending governance review` (`POL-RST-REV-02` / `POL-RST-STW-04`)
- `Confidential` products in `Workforce` for AI training/RAG/personalization -> `Not eligible` (`POL-HR-AI-07`)
- `Confidential` `Customer 360` for `Analytics` / `Forecasting` with justification >= 12 chars -> `Automatically approved` (`POL-CONF-BI-02`) with PII masking conditions
- `Confidential` products for `Personalization`, `RAG`, `Model Training`, `Application Integration` -> `Pending governance review` (`POL-CONF-AI-05`)
- `Internal` non-PII products (except `operations-performance` for `Personalization` which returns `Not eligible` via `POL-SCOPE-BLK-06`) -> `Automatically approved` (`POL-INT-AUTO-01`)

## 4. AI Data Assistant Endpoint

### `POST /api/assistant/chat`

Server-side Gemini proxy (`gemini-4-hydrogen`) grounded strictly in serialized catalog metadata, with automatic deterministic fallback if `GEMINI_API_KEY` is missing, placeholder, or errors.

**Request Body**
```json
{
  "prompt": "Compare Customer 360 and Customer Behavior.",
  "personaRole": "AI Engineer"
}
```

**Response (`200 OK`)**
```json
{
  "message": {
    "id": "msg-1763075000",
    "role": "assistant",
    "content": "Grounded comparison prose...",
    "timestamp": "03:15 PM",
    "recommendations": [
      {
        "productId": "customer-behavior",
        "productName": "Customer Behavior",
        "domain": "Customer Experience",
        "qualityScore": 95,
        "freshnessLabel": "8 min ago - Within SLA",
        "certificationStatus": "Certified",
        "owner": "Hannah Brooks",
        "relevanceReason": "Fastest path for pseudonymized personalization models.",
        "aiSuitabilityNote": "Personalization: Approved - Model Training: Approved",
        "accessRequirement": "Internal - Eligible - Auto-Approved"
      }
    ],
    "policyGuardrailNote": "LLM recommends. Policy Engine authorizes.",
    "providerMode": "gemini"
  },
  "assistantHistory": ["...AssistantSessionSummary[]"]
}
```

## 5. Telemetry & Notifications Endpoints

- `POST /api/analytics/event` - Logs `page_visit`, `search_executed`, `product_viewed`, `ai_query`, `suitability_checked`, `access_requested`, or `metadata_updated`.
- `GET /api/analytics/summary` - Returns live `LiveAnalyticsSummary` counters, feature breakdown, section visit breakdown, and recent events.
- `POST /api/notifications/read-all` - Marks all unread workspace notifications as read.

## 6. Error & Production Webhook Patterns

- **Standard Error Envelope**: Non-2xx responses return `{ "error": "Human-readable message" }` (`400` validation error, `404` unknown product).
- **Gemini Fallback**: Any `400`/`403`/`429`/`5xx` from Gemini inside `/api/assistant/chat` logs a server warning and automatically serves `providerMode: "simulated_fallback"` so discovery remains available.
- **Production Governance Webhooks**: In production deployments, `POST /api/access-requests` emits outbound signed webhook events (HMAC-SHA256) to ServiceNow/Jira when `outcome === "Pending governance review"` and listens on a signed callback endpoint (`POST /api/webhooks/governance-decision`) to update entitlement status once a steward approves or rejects.
