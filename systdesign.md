# DataFabricIQ System Design and Production Architecture

This document explains the layered architecture of **DataFabricIQ**, how the current prototype separates concerns cleanly, and how to deploy a full production implementation on **AWS** (as well as an alternative serverless deployment on **Vercel + Supabase**).

## 1. Current Prototype Architecture (Modular Monolith)

The current prototype runs as a single Node.js service (`server.ts`) serving both REST APIs (`/api/*`) and the React 19 SPA (`vite.middlewares` in dev, `dist/` static assets in production).

```
+-------------------------------------------------------------------------+
| PRESENTATION LAYER (React 19 + TypeScript + Tailwind CSS v4)            |
|  - Sidebar (7 views) + TopBar (Global search, Themes, Notifications)    |
|  - CSS Variable Theme Engine (5 institutional color palettes)           |
|  - Views: Home, Discover, Product Detail, Assistant, Workspaces, KPIs   |
+------------------------------------+------------------------------------+
                                     | Typed fetch (/api/*)
+------------------------------------v------------------------------------+
| API & POLICY GATEWAY (Express in server.ts)                             |
|  - Catalog endpoints (/api/products, /api/products/:id)                 |
|  - Governance endpoint (/api/governance/evaluate-suitability)           |
|  - Access workflow (/api/access-requests)                               |
|  - AI Discovery proxy (/api/assistant/chat)                             |
|  - Live telemetry (/api/analytics/event, /api/analytics/summary)        |
+-------+----------------------------+----------------------------+-------+
        |                            |                            |
+-------v---------+       +----------v----------+      +----------v-------+
| POLICY ENGINE   |       | AI DISCOVERY ADAPTER|      | REPOSITORY STORE |
| policyEngine.ts |       | @google/genai       |      | In-Memory Store  |
| Deterministic   |       | gemini-4-hydrogen   |      | 10 Products,     |
| POL-* & RULE-*  |       | + Metadata Fallback |      | Requests, Events |
+-----------------+       +---------------------+      +------------------+
```

### Architectural Invariants

1. **LLM recommends. Policy Engine authorizes.** - The Gemini model receives only catalog metadata (never customer rows) and returns structured product recommendations. Access and suitability decisions are strictly computed by `evaluateAccessPolicy` and `evaluateAISuitability`.
2. **No Client-Side Secrets** - `GEMINI_API_KEY` is read exclusively inside `server.ts`.
3. **Repository Abstraction** - All state mutations pass through `/api/*` endpoints, making storage replacement (PostgreSQL, DynamoDB, or Supabase) transparent to the UI.

## 2. Production AWS Architecture (Full Functionality)

To move beyond the in-memory demo store into a multi-tenant, high-availability enterprise deployment on AWS:

```
                    +-----------------------+
                    |   Amazon CloudFront   |
                    |  (CDN + WAF + TLS)    |
                    +-----+------------+----+
                          |            |
            Static Assets |            | /api/*
                          v            v
               +----------+---+   +----+--------------------+
               | Amazon S3    |   | AWS ALB / API Gateway   |
               | (React SPA)  |   +----+--------------------+
               +--------------+        |
                                       v
                    +------------------+------------------+
                    | Amazon ECS Fargate (Node/TS API)    |
                    |  - Auth & RBAC Middleware (Cognito) |
                    |  - Deterministic Policy Engine      |
                    |  - Grounded LLM Gateway             |
                    |  - Telemetry & Audit Emitter        |
                    +---+--------+-----------+--------+---+
                        |        |           |        |
         +--------------+        |           |        +---------------+
         v                       v           v                        v
+--------+--------+    +---------+----+  +---+------------+   +-------+----------+
| Amazon RDS      |    | Amazon       |  | Amazon         |   | AWS Secrets Mgr  |
| PostgreSQL      |    | OpenSearch   |  | EventBridge +  |   | + Gemini /       |
| (Catalog, RBAC, |    | (Semantic +  |  | Kinesis / S3   |   | Amazon Bedrock   |
| Requests, Audit)|    | Facet Search)|  | (Telemetry &   |   | (LLM Providers)  |
+-----------------+    +--------------+  | Data Lineage)  |   +------------------+
                                         +----------------+
```

### AWS Component Mapping

1. **Frontend Hosting (Amazon S3 + CloudFront + AWS WAF)**:
   - Build the Vite SPA (`npm run build`) to static assets in S3 behind CloudFront with OAC (Origin Access Control) and AWS WAF rate-limiting rules.
2. **Authentication & Enterprise Federation (Amazon Cognito / Okta / Entra ID)**:
   - Replace the demo persona switcher with OIDC / SAML 2.0 federation via Amazon Cognito.
   - Map IdP security groups (`grp-analytics`, `grp-ml-sandbox`, `grp-data-stewards`, `grp-finance-fpa`) into JWT claims verified by server middleware on every `/api/*` call.
3. **Compute & API Layer (Amazon ECS Fargate or AWS Lambda)**:
   - Run stateless TypeScript API containers on ECS Fargate behind an Application Load Balancer (ALB) for predictable latency and SSE streaming support for the AI Assistant.
4. **Transactional & Governance Store (Amazon RDS PostgreSQL)**:
   - Store `data_products`, `schema_fields`, `lineage_nodes`, `access_requests`, `suitability_evaluations`, `notifications`, and immutable `audit_logs`.
   - Enforce PostgreSQL Row-Level Security (RLS) for producer ownership and tenant isolation.
5. **Catalog Discovery & Semantic Search (Amazon OpenSearch Service)**:
   - Index product definitions, business glossary terms, and field descriptions using hybrid BM25 + vector embeddings (`pgvector` on RDS or OpenSearch) to replace in-memory keyword scoring at 10,000+ dataset scale.
6. **Real-Time Entitlement Provisioning (AWS Step Functions + Lake Formation / Snowflake / Databricks)**:
   - When `evaluateAccessPolicy` outputs `Automatically approved`, trigger an asynchronous Step Functions workflow that grants scoped read roles in AWS Lake Formation, Snowflake, or Databricks Unity Catalog and mints short-lived STS / OAuth credentials.
   - When `Pending governance review` is returned, route an approval task to ServiceNow, Jira, or Slack with webhook callback to update `access_requests`.
7. **Live Lineage, Quality & Freshness Ingestion (AWS Glue / OpenLineage / EventBridge)**:
   - Ingest OpenLineage events from dbt, Airflow, and Spark jobs into EventBridge to keep quality scores, freshness timestamps, and incident alerts (`INC-*`) synchronized in real time.
8. **AI Discovery Gateway (Google Gemini / Amazon Bedrock Adapter)**:
   - Store `GEMINI_API_KEY` in AWS Secrets Manager. Maintain a provider interface so teams can route queries to `gemini-4-hydrogen` or VPC-private Amazon Bedrock endpoints depending on data sensitivity.
9. **Visit, Feature & Audit Telemetry (Amazon Kinesis Data Firehose + S3 + Athena / QuickSight)**:
   - Stream UI telemetry (`page_visit`, `search_executed`, `ai_query`) and immutable governance audit events to S3 Parquet partitioned by date, queryable via Athena and surfaced in the Analytics dashboard.

## 3. Alternative Serverless Deployment Path (Vercel + Supabase)

If you prefer a lighter serverless stack prior to full AWS migration:

- **Hosting & API**: Deploy the React frontend to Vercel Edge and port each Express handler in `server.ts` into Vercel Serverless Functions under `/api/*.ts`.
- **Database & Auth**: Use **Supabase PostgreSQL** (with `pgvector` for semantic catalog search) and **Supabase Auth** configured with Google and GitHub OAuth providers.
- **Policy Enforcement**: Keep `src/services/policyEngine.ts` shared across Vercel Serverless Functions and reinforce data boundaries with Supabase RLS policies.
