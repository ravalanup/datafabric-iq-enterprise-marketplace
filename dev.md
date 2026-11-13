# DataFabricIQ Developer Guide

This guide helps engineers navigate the **DataFabricIQ** codebase, understand where state, policy logic, themes, and API routes live, and extend the application safely.

## 1. Repository Layout

- `server.ts` - Express backend entry point, Vite dev middleware, in-memory repository store, REST endpoints, deterministic policy integration, server-side Gemini proxy (`@google/genai`), and live telemetry aggregator.
- `src/types/marketplace.ts` - All shared TypeScript interfaces (`DataProduct`, `AccessRequestRecord`, `SuitabilityEvaluationResult`, `AssistantMessage`, `PersonaProfile`, `LiveAnalyticsSummary`).
- `src/data/catalogData.ts` - Synthetic enterprise seed data (10 data products across 7 business domains, 4 personas, initial access requests, notifications, and illustrative executive KPIs).
- `src/data/themes.ts` - 5 curated enterprise color themes (`APP_THEMES`), domain color mappings (`DOMAIN_COLOR_MAP`), and `applyThemeTokens()`.
- `src/services/policyEngine.ts` - Pure deterministic governance rules (`evaluateAccessPolicy` and `evaluateAISuitability`). Shared by server routes and testable independently.
- `src/services/apiClient.ts` - Typed frontend HTTP client for all `/api/*` routes.
- `src/App.tsx` - Root shell managing bootstrap loading, active navigation section, active persona, active color theme (`localStorage` key `dfiq_theme`), and modal orchestration.

### UI Components (`src/components/`)

| Component | Responsibility |
| :--- | :--- |
| `Sidebar.tsx` | Persistent 7-section left navigation, mobile drawer, and active persona footer |
| `TopBar.tsx` | Contextual breadcrumb, global search bar, Themes button, Notifications popover, Profile button |
| `HomeView.tsx` | Natural-language search hero, inline theme swatches, 5 summary KPIs, showcases, domains, recently viewed |
| `DiscoverView.tsx` | Multi-facet catalog search (domain, certification, quality, freshness, AI readiness, access, interface, sort) |
| `DataProductsCatalogView.tsx` | High-density tabular product registry and Customer 360 quick entry |
| `ProductDetailView.tsx` | 8-tab product inspector (Overview, Schema, Quality, Freshness, Lineage, Access, AI Suitability, Usage) |
| `AssistantView.tsx` | Conversational AI Data Assistant UI with 6 starter prompts and grounded recommendation cards |
| `MyWorkspaceView.tsx` | Access request tracker with status filters, saved products, recently viewed, and AI query history |
| `ProducerWorkspaceView.tsx` | Product health table, open incidents, improvement recommendations, and persistent metadata editor |
| `AnalyticsView.tsx` | Toggleable Live Demo Visits & Feature Use telemetry + Illustrative Enterprise KPIs |
| `AccessRequestModal.tsx` | Interactive access request submission and deterministic policy decision confirmation |
| `SuitabilityModal.tsx` | Standalone deterministic AI Suitability Policy Evaluator modal |
| `PersonaAuthModal.tsx` | Instant 4-persona role switcher and simulated Google/GitHub OAuth preview |
| `ThemePickerModal.tsx` | Visual color-theme studio with live 4-swatch preview and instant apply |
| `StatusText.tsx` | Zero-pill semantic status labels (`CertificationLabel`, `FreshnessLabel`, `SuitabilityStatusLabel`, `AccessOutcomeLabel`) |

## 2. Common Development Tasks

### Adding a New Data Product

1. Add a new `DataProduct` object to `INITIAL_PRODUCTS` in `src/data/catalogData.ts`.
2. Ensure `domain` matches one of the 7 `EnterpriseDomain` union values in `src/types/marketplace.ts`.
3. Provide all 6 `aiSuitability` entries (`Analytics`, `Personalization`, `Forecasting`, `RAG`, `Model Training`, `Agent Access`) so the Policy Engine and UI matrix render complete verdicts.
4. Restart the dev server (`npm run dev`) so `server.ts` reloads the seed store.

### Updating Deterministic Policy Rules

1. Edit `evaluateAccessPolicy` or `evaluateAISuitability` in `src/services/policyEngine.ts`.
2. Never delegate authorization or suitability decisions to Gemini. Keep policy rules pure functions of `(product, purpose/useCase, personaRole, justification)`.
3. Return clear `policyCode` / `policyRuleId` strings and human-readable `rationale` / `conditions`.

### Adding or Customizing a Color Theme

1. Add a new `AppTheme` entry to `APP_THEMES` in `src/data/themes.ts` with all 21 token fields (`canvas`, `surface`, `primary`, `sidebarBg`, `heroBg`, etc.).
2. Verify WCAG AA contrast (at least 4.5:1) between `sidebarText` / `sidebarActiveText` and their backgrounds, as well as `heroText` over `heroBg`.
3. The new theme automatically appears in both `ThemePickerModal.tsx` and the Home hero quick-swatch bar.

### Swapping the In-Memory Store for PostgreSQL / Supabase

1. Replace the `store` object in `server.ts` with async repository functions querying your database.
2. Keep the exact JSON request/response shapes defined in `docs/api-reference.md` so `src/services/apiClient.ts` and all React components require zero changes.

## 3. Scripts and Verification

```bash
npm run dev     # Start Express + Vite dev server on port 3000 via tsx
npm run lint    # Run TypeScript typechecking (tsc --noEmit)
npm run build   # Build production client bundle to dist/
npm run start   # Run server in production mode (NODE_ENV=production)
```
