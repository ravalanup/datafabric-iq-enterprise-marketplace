# DataFabricIQ User Guide

This guide explains the four enterprise personas built into **DataFabricIQ**, how each role uses the application visually in the browser, and how teams can interact with DataFabricIQ programmatically via its REST API.

## 1. Enterprise Personas

Use the **Switch Persona / OAuth** button in the bottom-left sidebar (or the profile button in the top bar) to switch roles instantly during a demo or preview simulated Google/GitHub OAuth sign-in.

| Persona | Name | Role | Entitlement Tier | Primary Focus |
| :--- | :--- | :--- | :--- | :--- |
| Consumer Analyst | Elena Vance | `Consumer Analyst` | `Standard` | Discovering certified datasets, checking freshness SLAs, requesting BI/Analytics access |
| AI Engineer | Marcus Chen | `AI Engineer` | `ML & AI Sandbox` | Evaluating AI suitability for Personalization, RAG, Forecasting, Model Training, and MCP Agents |
| Data Product Producer | Priya Nair | `Data Product Producer` | `Producer Owner` | Monitoring product health, resolving open incidents, editing metadata, certifying drafts |
| Governance Steward | David Morales | `Governance Steward` | `Steward Admin` | Auditing classifications, verifying deterministic policy outcomes, overseeing compliance |

## 2. Visual Workflows by Persona

### Consumer Analyst Journey (Discover and Consume)

1. **Start on Home**: Enter a natural-language goal in the search bar (for example, `"Find trusted customer behavior data for a personalization model."`) and click **Discover Data**.
2. **Filter in Discover Data**: Narrow results by Domain (`Customer Experience`), Certification (`Certified`), Quality (`90%+`), Freshness (`Under 30m`), or Consumption Interface (`SQL`, `REST API`, `Python SDK`).
3. **Inspect Customer 360**: Click the **Customer 360** card to open its 8-tab detail workspace:
   - **Overview**: Review business definition, purpose, owner, and intended consumers.
   - **Schema**: Inspect column types, nullability, and field-level PII/Financial classifications (`customer_id`, `customer_segment`, `interaction_history`, `engagement_score`).
   - **Quality & Freshness**: Verify the 97% overall score and `< 60 minutes` SLA compliance.
   - **Lineage**: Trace data across all 5 stages from `Source Systems` through `Consumer Applications`.
4. **Request Access**: Click **Request Access**, select your purpose (`Analytics`, `Personalization`, `Forecasting`, `RAG`, `Model Training`, or `Application Integration`), provide a business justification, and submit.
5. **Track in My Workspace**: Click **View in My Workspace** to inspect the deterministic policy outcome (`Automatically approved`, `Pending governance review`, or `Not eligible`), saved products, and recently viewed items.

### AI Engineer Journey (AI-Assisted Discovery & Suitability)

1. **Open AI Data Assistant**: Click **AI Data Assistant** in the left sidebar or **Ask AI Assistant** from Home.
2. **Run Grounded Queries**: Click any starter question (such as `"Compare Customer 360 and Customer Behavior."` or `"Which data products are suitable for forecasting?"`) or type your own question.
3. **Review Grounded Citations**: Inspect the returned quality score, freshness, owner, AI suitability summary, and access policy for each recommended product.
4. **Verify Deterministically**: Click **Verify Suitability Policy** (or open the **AI Suitability** tab on any product) to run the Policy Engine across `Analytics`, `Personalization`, `Forecasting`, `RAG`, `Model Training`, and `Agent Access`.
5. **Copy Consumption Snippets**: In a product's **Access** tab, select `SQL`, `Python SDK`, `REST API`, `Feature Store`, or `MCP Tool` to preview standardized integration snippets.

### Data Product Producer Journey (Stewardship & Metadata Editing)

1. **Open Producer Workspace**: Navigate to **Producer Workspace** in the sidebar.
2. **Review Portfolio Health**: Check published vs. draft counts, average metadata completeness, and open incidents (for example, `Omnichannel Loyalty Signals` in `Draft` status with `INC-219`).
3. **Edit Metadata**: Select any product in the left table, update `Owner`, `Freshness SLA`, `Publication Status`, `Certification Status`, `Product Description`, or `Business Definition`, and click **Save Product Metadata**.
4. **Verify Completeness Recalculation**: Completeness scores update deterministically and emit a notification in the top bar.

### Governance Steward & Executive Journey (Compliance & Analytics)

1. **Test Policy Boundaries**: Switch to `Governance Steward` or `Consumer Analyst`, then evaluate `Finance Performance` (Restricted/SOX) or `Customer 360` (Confidential/PII) in the **AI Suitability Policy Evaluator** to verify deterministic blocks and review gates.
2. **Inspect Analytics**: Open **Analytics** in the sidebar and toggle between:
   - **Live Demo Visits & Feature Use**: Real-time counts of section visits, catalog searches, product inspections, AI queries, suitability checks, and governance actions captured during the active session.
   - **Enterprise KPIs (Demo)**: Illustrative enterprise metrics across Adoption, Discovery, Access, Reuse, Trust, and AI Enablement.
3. **Switch Visual Color Themes**: Click **Themes** in the top bar (or use the quick theme swatches in the Home hero) to switch between all 5 institutional color palettes.

## 3. Programmatic Usage (REST API)

All marketplace workflows can also be invoked programmatically against the Express API server on port `3000`.

### Search Published Data Products

```bash
curl -s "http://localhost:3000/api/products?q=customer&aiReady=AI-Ready%20Only&sort=trust" | jq
```

### Run Deterministic AI Suitability Check

```bash
curl -s -X POST "http://localhost:3000/api/governance/evaluate-suitability" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "customer-360",
    "aiUseCase": "Personalization",
    "consumptionPurpose": "Next-best-experience ranking",
    "personaRole": "AI Engineer"
  }' | jq
```

### Submit an Access Request

```bash
curl -s -X POST "http://localhost:3000/api/access-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "customer-behavior",
    "purpose": "Personalization",
    "justification": "Train digital funnel ranking model",
    "requesterName": "Marcus Chen",
    "requesterRole": "AI Engineer"
  }' | jq
```

### Query the Grounded AI Data Assistant

```bash
curl -s -X POST "http://localhost:3000/api/assistant/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Compare Customer 360 and Customer Behavior.",
    "personaRole": "AI Engineer"
  }' | jq
```
