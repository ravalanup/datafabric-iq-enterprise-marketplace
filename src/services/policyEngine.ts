import {
  AccessOutcome,
  AccessPurpose,
  AIUseCase,
  DataProduct,
  PersonaRole,
  SuitabilityEvaluationResult,
  SuitabilityVerdict,
} from '../types/marketplace.ts';

export interface AccessEvaluationOutput {
  outcome: AccessOutcome;
  policyCode: string;
  rationale: string;
  conditions: string[];
}

/**
 * Deterministic Policy Engine — Authorization & AI Suitability
 * Architectural invariant: LLM recommends; Policy Engine authorizes.
 */
export function evaluateAccessPolicy(
  product: DataProduct,
  purpose: AccessPurpose,
  requesterRole: PersonaRole,
  justification: string
): AccessEvaluationOutput {
  if (product.status === 'Draft' || product.certificationStatus === 'Draft') {
    return {
      outcome: 'Not eligible',
      policyCode: 'POL-DRAFT-BLK-00',
      rationale: `${product.name} is currently in Draft status (${product.metadataCompleteness}% metadata completeness) and has not passed enterprise certification gates.`,
      conditions: [
        'Product owner must resolve open incidents and achieve Certified status',
        'Consume only in Producer Sandbox after certification',
      ],
    };
  }

  // Strictly Restricted products (e.g., SOX Finance)
  if (product.accessClassification === 'Restricted') {
    if (
      purpose === 'Personalization' ||
      purpose === 'Model Training' ||
      purpose === 'RAG'
    ) {
      return {
        outcome: 'Not eligible',
        policyCode: 'POL-RST-SOX-09',
        rationale: `${product.name} carries Restricted classification (${product.domain}). Enterprise governance prohibits ${purpose} consumption on restricted financial records.`,
        conditions: [
          'Blocked by SOX / Enterprise AI Policy',
          'Use aggregated non-restricted planning products instead',
        ],
      };
    }

    if (requesterRole === 'Governance Steward') {
      return {
        outcome: 'Pending governance review',
        policyCode: 'POL-RST-STW-04',
        rationale: `Even for Governance Stewards, ${product.name} requires dual-control Finance Controller co-signature for ${purpose}.`,
        conditions: [
          'Finance Controller secondary approval required',
          'Audit logging enforced on all queries',
        ],
      };
    }

    return {
      outcome: 'Pending governance review',
      policyCode: 'POL-RST-REV-02',
      rationale: `${product.name} is Restricted. ${purpose} access requires formal Governance Steward and Domain Controller review of your justification.`,
      conditions: [
        'Domain Controller & Governance Steward sign-off',
        'Time-bound 90-day entitlement with row-level audit trail',
      ],
    };
  }

  // Confidential products (Customer 360, Reservations, Marketing, Workforce)
  if (product.accessClassification === 'Confidential') {
    if (product.domain === 'Workforce' && (purpose === 'Personalization' || purpose === 'Model Training' || purpose === 'RAG')) {
      return {
        outcome: 'Not eligible',
        policyCode: 'POL-HR-AI-07',
        rationale: `${product.name} is governed by Workforce Privacy Policy; ${purpose} is prohibited on employee capacity data.`,
        conditions: ['Prohibited under HR AI Governance Policy'],
      };
    }

    if (requesterRole === 'Governance Steward' && (purpose === 'Analytics' || purpose === 'Forecasting')) {
      return {
        outcome: 'Automatically approved',
        policyCode: 'POL-CONF-STW-01',
        rationale: `Governance Steward role is pre-authorized for ${purpose} on ${product.name} under audit telemetry.`,
        conditions: ['Standard audit log enabled', 'Confidential handling banner acknowledged'],
      };
    }

    if (purpose === 'Analytics' || purpose === 'Forecasting') {
      if (product.id === 'customer-360' && justification.trim().length >= 12) {
        return {
          outcome: 'Automatically approved',
          policyCode: 'POL-CONF-BI-02',
          rationale: `${product.name} allows streamlined approval for internal ${purpose} when PII fields are masked in the standard BI projection.`,
          conditions: [
            'Default PII masking applied on interaction_history',
            'Export outside enterprise boundary disabled',
          ],
        };
      }
      return {
        outcome: 'Pending governance review',
        policyCode: 'POL-CONF-REV-03',
        rationale: `${product.name} contains Confidential domain attributes. Steward review confirms least-privilege projection for ${purpose}.`,
        conditions: ['Steward SLA: < 4 business hours', 'Least-privilege schema scope'],
      };
    }

    // Personalization, RAG, Model Training, Application Integration on Confidential
    return {
      outcome: 'Pending governance review',
      policyCode: 'POL-CONF-AI-05',
      rationale: `${purpose} on Confidential product ${product.name} requires Governance Steward verification of consent flags, PII redaction, and sandbox isolation.`,
      conditions: [
        'Marketing consent & PII tokenization check required',
        'Approved ML / Application service principal required',
      ],
    };
  }

  // Internal (non-PII / pseudonymized) products: Customer Behavior, Operations Performance, Merchandise Sales, Streaming Engagement
  if (product.id === 'operations-performance' && purpose === 'Personalization') {
    return {
      outcome: 'Not eligible',
      policyCode: 'POL-SCOPE-BLK-06',
      rationale: `${product.name} contains facility telemetry with no customer identifiers and is not eligible for Personalization workflows.`,
      conditions: ['Select Customer Behavior or Customer 360 for personalization use cases'],
    };
  }

  return {
    outcome: 'Automatically approved',
    policyCode: 'POL-INT-AUTO-01',
    rationale: `${product.name} is Certified with Internal (pseudonymized/non-PII) classification. ${purpose} is automatically approved for ${requesterRole}.`,
    conditions: [
      'Rate-limited consumption interface provisioned immediately',
      'Usage telemetry logged for marketplace governance',
    ],
  };
}

export function evaluateAISuitability(
  product: DataProduct,
  aiUseCase: AIUseCase,
  consumptionPurpose: string
): SuitabilityEvaluationResult {
  const matched = product.aiSuitability.find((item) => item.useCase === aiUseCase);
  const verdict: SuitabilityVerdict = matched ? matched.status : 'Requires Review';

  const requiredApprovals: string[] = [];
  if (verdict === 'Approved') {
    requiredApprovals.push('None — Automatic entitlement upon workspace request');
  } else if (verdict === 'Conditional') {
    requiredApprovals.push('Automated policy guardrail verification (consent / masking / sandbox)');
  } else if (verdict === 'Requires Review') {
    requiredApprovals.push('Data Governance Steward sign-off');
    if (product.accessClassification === 'Restricted') {
      requiredApprovals.push('Domain Finance Controller co-approval');
    }
  } else {
    requiredApprovals.push('Blocked by Enterprise Data & AI Governance Policy');
  }

  const restrictions = matched?.requiredControls.length
    ? matched.requiredControls
    : ['Standard enterprise acceptable-use policy'];

  const policyRuleId = `RULE-${product.domain.slice(0, 3).toUpperCase()}-${aiUseCase.replace(/\s+/g, '').slice(0, 4).toUpperCase()}-${product.accessClassification.slice(0, 3).toUpperCase()}`;

  return {
    productId: product.id,
    productName: product.name,
    aiUseCase,
    consumptionPurpose,
    eligibilityStatus: verdict,
    dataClassification: product.accessClassification,
    applicableRestrictions: restrictions,
    requiredApprovals,
    explanation: matched
      ? `${matched.summary} Evaluated against ${product.accessClassification} classification and intended purpose "${consumptionPurpose}".`
      : `Default governance review triggered for ${aiUseCase} on ${product.name}.`,
    policyRuleId,
    evaluatedAt: new Date().toISOString(),
    isSimulatedDemo: true,
  };
}
