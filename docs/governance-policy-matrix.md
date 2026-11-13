# DataFabricIQ Governance Policy Matrix

**Architectural Rule**: **LLM recommends. Policy Engine authorizes.**

All access decisions and AI suitability evaluations in `src/services/policyEngine.ts` are strictly deterministic and auditable via `policyCode` and `policyRuleId`.

## 1. Access Request Policy Codes (`evaluateAccessPolicy`)

| Policy Code | Trigger Condition | Outcome | Required Controls / Notes |
| :--- | :--- | :--- | :--- |
| `POL-DRAFT-BLK-00` | `product.status === "Draft"` or `certificationStatus === "Draft"` | `Not eligible` | Product must resolve open incidents and pass certification before consumption |
| `POL-RST-SOX-09` | `Restricted` classification + `Personalization`, `Model Training`, or `RAG` | `Not eligible` | Blocked by SOX / Enterprise AI Policy |
| `POL-RST-STW-04` | `Restricted` classification + `Governance Steward` + `Analytics` / `Forecasting` / `Application Integration` | `Pending governance review` | Requires Finance Controller co-signature and audit trail |
| `POL-RST-REV-02` | `Restricted` classification + non-steward role + `Analytics` / `Forecasting` / `Application Integration` | `Pending governance review` | Domain Controller & Steward review, 90-day time-bound entitlement |
| `POL-HR-AI-07` | `Confidential` + `Workforce` domain + `Personalization`, `Model Training`, or `RAG` | `Not eligible` | Prohibited under Enterprise HR AI Governance Policy |
| `POL-CONF-STW-01` | `Confidential` + `Governance Steward` + `Analytics` or `Forecasting` | `Automatically approved` | Audit telemetry active, confidential handling acknowledged |
| `POL-CONF-BI-02` | `Confidential` (`customer-360`) + `Analytics` or `Forecasting` + justification >= 12 chars | `Automatically approved` | Default PII masking applied on `interaction_history`; export disabled |
| `POL-CONF-REV-03` | `Confidential` (other domains) + `Analytics` or `Forecasting` | `Pending governance review` | Steward SLA < 4 business hours, least-privilege projection |
| `POL-CONF-AI-05` | `Confidential` + `Personalization`, `RAG`, `Model Training`, or `Application Integration` | `Pending governance review` | Consent flag verification, PII tokenization check, approved service principal |
| `POL-SCOPE-BLK-06` | `operations-performance` + `Personalization` | `Not eligible` | Dataset contains facility telemetry with zero customer identifiers |
| `POL-INT-AUTO-01` | `Internal` non-PII / pseudonymized certified products | `Automatically approved` | Immediate rate-limited consumption interface provisioned |

## 2. AI Suitability Matrix by Data Product (`evaluateAISuitability`)

Verdicts returned: `Approved`, `Conditional`, `Requires Review`, `Not Approved`.

| Data Product | Classification | Analytics | Personalization | Forecasting | RAG | Model Training | Agent Access |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Customer 360 | `Confidential` | Approved | Conditional | Approved | Requires Review | Conditional | Requires Review |
| Customer Behavior | `Internal` | Approved | Approved | Approved | Conditional | Approved | Conditional |
| Reservations | `Confidential` | Approved | Requires Review | Approved | Conditional | Conditional | Requires Review |
| Operations Performance | `Internal` | Approved | Not Approved | Approved | Approved | Approved | Approved |
| Merchandise Sales | `Internal` | Approved | Conditional | Approved | Approved | Approved | Conditional |
| Streaming Engagement | `Internal` | Approved | Approved | Approved | Conditional | Approved | Conditional |
| Marketing Campaign Performance | `Confidential` | Approved | Requires Review | Approved | Conditional | Conditional | Requires Review |
| Finance Performance | `Restricted` | Requires Review | Not Approved | Conditional | Not Approved | Not Approved | Not Approved |
| Workforce Capacity & Scheduling | `Confidential` | Requires Review | Not Approved | Conditional | Not Approved | Not Approved | Not Approved |
| Omnichannel Loyalty Signals | `Confidential` (Draft) | Not Approved | Not Approved | Not Approved | Not Approved | Not Approved | Not Approved |

## 3. Policy Rule ID Convention

`evaluateAISuitability` generates deterministic rule IDs in the format:

`RULE-<DOMAIN_3>-<USECASE_4>-<CLASSIFICATION_3>`

Example: `Customer 360` (`Customer Experience`, `Confidential`) evaluated for `Personalization` produces `RULE-CUS-PERS-CON`.
