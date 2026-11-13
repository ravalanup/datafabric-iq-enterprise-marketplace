export type NavSection =
  | 'home'
  | 'discover'
  | 'products'
  | 'assistant'
  | 'workspace'
  | 'producer'
  | 'analytics';

export type EnterpriseDomain =
  | 'Customer Experience'
  | 'Streaming and Digital Media'
  | 'Marketing'
  | 'Merchandise and Commerce'
  | 'Finance'
  | 'Workforce'
  | 'Operations';

export type CertificationStatus = 'Certified' | 'In Review' | 'Draft';
export type PublicationStatus = 'Published' | 'Draft';
export type AccessClassification = 'Internal' | 'Confidential' | 'Restricted';
export type AccessEligibility =
  | 'Eligible — Auto-Approved'
  | 'Eligible — Policy Review'
  | 'Restricted — Steward Approval';

export type FreshnessStatus = 'Within SLA' | 'Approaching SLA' | 'Pending SLA';

export type ConsumptionInterface =
  | 'SQL'
  | 'REST API'
  | 'Python SDK'
  | 'Feature Store'
  | 'MCP Tool'
  | 'Kafka Stream';

export type AIUseCase =
  | 'Analytics'
  | 'Personalization'
  | 'Forecasting'
  | 'RAG'
  | 'Model Training'
  | 'Agent Access';

export type SuitabilityVerdict =
  | 'Approved'
  | 'Conditional'
  | 'Requires Review'
  | 'Not Approved';

export type AccessPurpose =
  | 'Analytics'
  | 'Personalization'
  | 'Forecasting'
  | 'RAG'
  | 'Model Training'
  | 'Application Integration';

export type AccessOutcome =
  | 'Automatically approved'
  | 'Pending governance review'
  | 'Not eligible';

export type PersonaRole =
  | 'Consumer Analyst'
  | 'AI Engineer'
  | 'Data Product Producer'
  | 'Governance Steward';

export interface PersonaProfile {
  id: string;
  name: string;
  role: PersonaRole;
  department: string;
  email: string;
  entitlementTier: 'Standard' | 'ML & AI Sandbox' | 'Producer Owner' | 'Steward Admin';
  authProvider: 'Demo SSO' | 'Google OAuth (Simulated)' | 'GitHub OAuth (Simulated)';
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  classification: 'Public' | 'Internal' | 'PII' | 'Financial';
  description: string;
  sampleValue: string;
}

export interface QualityMetrics {
  overall: number;
  accuracy: number;
  completeness: number;
  consistency: number;
  validity: number;
  timeliness: number;
  trendDelta: number;
  monthlyHistory: Array<{ month: string; score: number }>;
}

export interface FreshnessDetails {
  lastUpdated: string;
  refreshFrequency: string;
  slaTarget: string;
  status: FreshnessStatus;
  latencyMinutes: number;
}

export interface LineageNode {
  stage: 'Source Systems' | 'Data Ingestion' | 'Transformation' | 'Data Product' | 'Consumer Applications';
  label: string;
  systems: string[];
  owner: string;
}

export interface AISuitabilityItem {
  useCase: AIUseCase;
  status: SuitabilityVerdict;
  summary: string;
  requiredControls: string[];
}

export interface UsageDetails {
  activeConsumers: number;
  monthlyQueries: number;
  reuseCount: number;
  dependentApps: string[];
  monthlyConsumerTrend: Array<{ month: string; consumers: number }>;
}

export interface DataProduct {
  id: string;
  name: string;
  domain: EnterpriseDomain;
  status: PublicationStatus;
  certificationStatus: CertificationStatus;
  owner: string;
  ownerTeam: string;
  steward: string;
  description: string;
  businessDefinition: string;
  businessPurpose: string;
  intendedConsumers: string[];
  keywords: string[];
  quality: QualityMetrics;
  freshness: FreshnessDetails;
  aiReady: boolean;
  accessClassification: AccessClassification;
  accessEligibility: AccessEligibility;
  accessPolicySummary: string;
  eligibleUserGroups: string[];
  interfaces: ConsumptionInterface[];
  schema: SchemaField[];
  lineage: LineageNode[];
  aiSuitability: AISuitabilityItem[];
  usage: UsageDetails;
  metadataCompleteness: number;
  openIncidents: Array<{
    id: string;
    severity: 'Low' | 'Medium' | 'High';
    title: string;
    openedAt: string;
  }>;
  improvementRecommendations: string[];
  publishedDate: string;
  lastModified: string;
}

export interface AccessRequestRecord {
  id: string;
  productId: string;
  productName: string;
  domain: EnterpriseDomain;
  requesterName: string;
  requesterRole: PersonaRole;
  purpose: AccessPurpose;
  justification: string;
  outcome: AccessOutcome;
  policyCode: string;
  rationale: string;
  conditions: string[];
  submittedAt: string;
  isSimulatedDemo: true;
}

export interface SuitabilityEvaluationResult {
  productId: string;
  productName: string;
  aiUseCase: AIUseCase;
  consumptionPurpose: string;
  eligibilityStatus: SuitabilityVerdict;
  dataClassification: AccessClassification;
  applicableRestrictions: string[];
  requiredApprovals: string[];
  explanation: string;
  policyRuleId: string;
  evaluatedAt: string;
  isSimulatedDemo: true;
}

export interface AssistantRecommendation {
  productId: string;
  productName: string;
  domain: EnterpriseDomain;
  qualityScore: number;
  freshnessLabel: string;
  certificationStatus: CertificationStatus;
  owner: string;
  relevanceReason: string;
  aiSuitabilityNote: string;
  accessRequirement: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: AssistantRecommendation[];
  policyGuardrailNote?: string;
  providerMode?: 'gemini' | 'simulated_fallback';
}

export interface AssistantSessionSummary {
  id: string;
  prompt: string;
  recommendedProducts: string[];
  timestamp: string;
  providerMode: 'gemini' | 'simulated_fallback';
}

export interface MarketplaceNotification {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
  category: 'access' | 'governance' | 'producer';
}

export type TelemetryEventType =
  | 'page_visit'
  | 'search_executed'
  | 'product_viewed'
  | 'ai_query'
  | 'suitability_checked'
  | 'access_requested'
  | 'metadata_updated';

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  section: NavSection;
  label: string;
  personaRole: PersonaRole;
  timestamp: string;
}

export interface LiveAnalyticsSummary {
  totalVisits: number;
  uniqueSectionsVisited: number;
  searchesExecuted: number;
  productsViewed: number;
  aiQueriesExecuted: number;
  suitabilityChecksRun: number;
  accessRequestsSubmitted: number;
  metadataUpdatesSaved: number;
  featureUsageBreakdown: Array<{ feature: string; count: number }>;
  sectionVisitBreakdown: Array<{ section: string; visits: number }>;
  recentEvents: TelemetryEvent[];
}
