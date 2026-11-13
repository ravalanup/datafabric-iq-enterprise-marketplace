# DataFabricIQ Data Product Onboarding Guide

In **DataFabricIQ**, a data product is more than a raw table - it is a governed, documented, discoverable unit with clear ownership, quality SLAs, lineage, standardized interfaces, and explicit AI-use contracts. This guide explains how Data Product Producers onboard and certify products.

## 1. Required Data Product Contract

Before a product can move from `Draft` to `Published` and `Certified`, producers must define:

1. **Identity & Ownership**: `name`, `domain` (one of the 7 enterprise domains), `owner`, `ownerTeam`, and assigned `steward`.
2. **Business Context**:
   - `description` - Clear summary of dataset scope and value
   - `businessDefinition` - Canonical entity definition and refresh grain
   - `businessPurpose` - Why the product exists and which duplicate pipelines it replaces
   - `intendedConsumers` - Target analyst, ML, or application teams
3. **Schema & Field Classifications**:
   - Every column in `schema` must declare `name`, `type`, `nullable`, `sampleValue`, `description`, and `classification` (`Public`, `Internal`, `PII`, or `Financial`).
4. **Quality & Freshness SLAs**:
   - Measured across 5 dimensions (`accuracy`, `completeness`, `consistency`, `validity`, `timeliness`).
   - Freshness contract declaring `refreshFrequency` and `slaTarget`.
5. **5-Stage Lineage**:
   - Documented stages: `Source Systems` -> `Data Ingestion` -> `Transformation` -> `Data Product` -> `Consumer Applications`.
6. **Standardized Interfaces**:
   - At least one supported consumption interface (`SQL`, `REST API`, `Python SDK`, `Feature Store`, `MCP Tool`, `Kafka Stream`).
7. **AI Suitability Matrix**:
   - Explicit readiness verdict (`Approved`, `Conditional`, `Requires Review`, `Not Approved`) and required controls for all 6 AI use cases (`Analytics`, `Personalization`, `Forecasting`, `RAG`, `Model Training`, `Agent Access`).

## 2. Metadata Completeness Scoring

When producers update metadata in **Producer Workspace** (`PATCH /api/products/:id`), `server.ts` recalculates `metadataCompleteness` deterministically:

- Base schema & lineage contract: `70%`
- Detailed product description (`> 40` characters): `+10%`
- Canonical business definition (`> 40` characters): `+10%`
- Named product owner (`> 2` characters): `+5%`
- `Certified` governance verification: `+5%`

Total maximum score: `100%`.

## 3. Draft-to-Certified Promotion Checklist

Use **Omnichannel Loyalty Signals** in **Producer Workspace** as the reference onboarding flow:

1. **Resolve Open Quality Incidents**: Fix schema null-check failures (e.g., `INC-219`) and staging latency breaches (`INC-221`).
2. **Reach >= 90% Completeness**: Complete descriptions, business definitions, and column documentation.
3. **Verify Consent & Classification Tags**: Confirm whether any columns require `PII` or `Financial` classification so the Policy Engine applies appropriate access gates.
4. **Promote Status**: Update `Publication Status` to `Published` and `Certification Status` to `Certified` in Producer Workspace and save.
5. **Validate Discoverability**: Confirm the product appears in **Discover Data** and is cited accurately by the **AI Data Assistant**.
