# DataFabricIQ Production Roadmap

This document maps the gaps between the current **DataFabricIQ** interactive prototype and a full enterprise production platform (supporting **AWS** or **Vercel + Supabase** deployments), organized into a 4-phase engineering delivery roadmap.

## 1. Prototype-to-Production Gap Matrix

| Capability | Current Prototype | Production Target |
| :--- | :--- | :--- |
| Data Persistence | In-memory store in `server.ts` | PostgreSQL (Amazon RDS or Supabase Postgres) with migrations and Row-Level Security |
| Authentication & Identity | Instant 4-persona demo switcher + simulated OAuth | Enterprise OIDC / SAML 2.0 (Amazon Cognito / Okta / Entra ID or Supabase Google/GitHub OAuth) |
| Catalog Search | In-memory keyword token scoring | Hybrid BM25 + semantic vector search (Amazon OpenSearch or `pgvector`) |
| Access Provisioning | Deterministic decision recorded in `My Workspace` | Automated IAM / Lake Formation / Snowflake / Databricks role grants + ServiceNow/Jira approval webhooks |
| Metadata & Lineage Sync | Seeded JSON + Producer Workspace inline edits | Automated OpenLineage, dbt, Airflow, and Great Expectations / Monte Carlo ingestion |
| AI Assistant | Server-side `gemini-4-hydrogen` + simulated fallback | Multi-provider LLM gateway (Gemini / Bedrock / OpenAI) with Redis prompt/catalog caching and streaming SSE |
| Visit & Audit Analytics | In-memory session telemetry (`LiveAnalyticsSummary`) | Kinesis / EventBridge -> S3 Parquet / Athena + immutable 7-year governance audit store |

## 2. Four-Phase Engineering Delivery Roadmap

### Phase 1 - Persistent Foundation, Identity & Serverless Packaging (Weeks 1-3)

- **Database Schema & Migrations**: Stand up PostgreSQL (`data_products`, `schema_fields`, `lineage_nodes`, `access_requests`, `suitability_evaluations`, `telemetry_events`) and implement a repository interface swapping out `server.ts` in-memory arrays.
- **Live Authentication**: Integrate OAuth / OIDC login (Google/GitHub for Vercel+Supabase or Amazon Cognito for AWS) and derive `requesterRole` and `entitlementTier` exclusively from verified JWT claims.
- **Deployment Target**: Deploy initial staging build to Vercel Serverless Functions (or AWS ECS Fargate) with CI/CD checks (`tsc --noEmit`, unit tests, build).

### Phase 2 - Automated Metadata, Quality & Lineage Ingestion (Weeks 4-7)

- **Metadata Harvesters**: Build scheduled and event-driven connectors for Snowflake, BigQuery, Databricks Unity Catalog, and AWS Glue Data Catalog.
- **OpenLineage & Quality Hooks**: Ingest dbt test results and pipeline run events so `quality`, `freshness.lastUpdated`, `freshness.status`, and `openIncidents` update automatically in near real time.
- **Hybrid Semantic Discovery**: Index product definitions and column glossaries using `pgvector` or Amazon OpenSearch so natural-language queries in **Discover Data** achieve high recall across thousands of datasets.

### Phase 3 - Closed-Loop Governance & Automated Entitlement Fulfillment (Weeks 8-11)

- **Policy Engine Externalization**: Optionally back `src/services/policyEngine.ts` with versioned OPA (Open Policy Agent) / Cedar policy bundles managed by Governance Stewards.
- **Steward Approval Workflows**: Integrate `Pending governance review` outcomes with Slack, Jira, and ServiceNow interactive approval webhooks.
- **Just-in-Time Provisioning**: Automatically provision scoped SQL views, REST API keys, Feature Store tokens, and MCP tool permissions upon `Automatically approved` or steward sign-off.

### Phase 4 - Enterprise Scale, Multi-Region Resilience & FinOps Analytics (Weeks 12-16)

- **AI Assistant Hardening**: Add SSE streaming, Redis caching for repeated catalog questions, rate limiting per user/team, and automated evaluation harnesses verifying zero metadata hallucination.
- **Long-Term Telemetry & Cost Attribution**: Stream all visit, search, reuse, and query metrics to S3/Athena or ClickHouse to track duplicate pipeline savings and business ROI per domain.
- **Compliance Audits**: Enable immutable WORM audit logs for SOX-governed financial products (`Finance Performance`) and automated quarterly access recertification campaigns.
