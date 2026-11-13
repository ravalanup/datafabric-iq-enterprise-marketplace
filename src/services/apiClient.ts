import {
  AccessPurpose,
  AccessRequestRecord,
  AIUseCase,
  AssistantMessage,
  AssistantSessionSummary,
  DataProduct,
  LiveAnalyticsSummary,
  MarketplaceNotification,
  NavSection,
  PersonaProfile,
  PersonaRole,
  SuitabilityEvaluationResult,
  TelemetryEventType,
} from '../types/marketplace.ts';

export interface BootstrapPayload {
  products: DataProduct[];
  personas: PersonaProfile[];
  accessRequests: AccessRequestRecord[];
  notifications: MarketplaceNotification[];
  savedProductIds: string[];
  recentlyViewedIds: string[];
  assistantHistory: AssistantSessionSummary[];
  analyticsSummary: LiveAnalyticsSummary;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const apiClient = {
  bootstrap(): Promise<BootstrapPayload> {
    return requestJson('/api/bootstrap');
  },

  recordView(productId: string, personaRole: PersonaRole): Promise<{ recentlyViewedIds: string[] }> {
    return requestJson(`/api/products/${encodeURIComponent(productId)}/view`, {
      method: 'POST',
      body: JSON.stringify({ personaRole }),
    });
  },

  toggleSave(productId: string): Promise<{ savedProductIds: string[]; saved: boolean }> {
    return requestJson(`/api/products/${encodeURIComponent(productId)}/save`, {
      method: 'POST',
    });
  },

  updateProductMetadata(
    productId: string,
    payload: {
      description: string;
      businessDefinition: string;
      owner: string;
      certificationStatus: DataProduct['certificationStatus'];
      status: DataProduct['status'];
      freshnessSla: string;
      personaRole: PersonaRole;
    }
  ): Promise<{ product: DataProduct; notifications: MarketplaceNotification[] }> {
    return requestJson(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  evaluateSuitability(payload: {
    productId: string;
    aiUseCase: AIUseCase;
    consumptionPurpose: string;
    personaRole: PersonaRole;
  }): Promise<{ evaluation: SuitabilityEvaluationResult }> {
    return requestJson('/api/governance/evaluate-suitability', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  submitAccessRequest(payload: {
    productId: string;
    purpose: AccessPurpose;
    justification: string;
    requesterName: string;
    requesterRole: PersonaRole;
  }): Promise<{
    accessRequest: AccessRequestRecord;
    accessRequests: AccessRequestRecord[];
    notifications: MarketplaceNotification[];
  }> {
    return requestJson('/api/access-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  markAllNotificationsRead(): Promise<{ notifications: MarketplaceNotification[] }> {
    return requestJson('/api/notifications/read-all', { method: 'POST' });
  },

  askAssistant(payload: {
    prompt: string;
    personaRole: PersonaRole;
  }): Promise<{
    message: AssistantMessage;
    assistantHistory: AssistantSessionSummary[];
  }> {
    return requestJson('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  trackEvent(payload: {
    type: TelemetryEventType;
    section: NavSection;
    label: string;
    personaRole: PersonaRole;
  }): Promise<{ summary: LiveAnalyticsSummary }> {
    return requestJson('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAnalyticsSummary(): Promise<{ summary: LiveAnalyticsSummary }> {
    return requestJson('/api/analytics/summary');
  },
};
