import { useEffect, useState } from 'react';
import { AccessRequestModal } from './components/AccessRequestModal.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { AssistantView } from './components/AssistantView.tsx';
import { DataProductsCatalogView } from './components/DataProductsCatalogView.tsx';
import { DiscoverView } from './components/DiscoverView.tsx';
import { HomeView } from './components/HomeView.tsx';
import { MyWorkspaceView } from './components/MyWorkspaceView.tsx';
import { PersonaAuthModal } from './components/PersonaAuthModal.tsx';
import { ProducerWorkspaceView } from './components/ProducerWorkspaceView.tsx';
import { ProductDetailView } from './components/ProductDetailView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { SuitabilityModal } from './components/SuitabilityModal.tsx';
import { ThemePickerModal } from './components/ThemePickerModal.tsx';
import { TopBar } from './components/TopBar.tsx';
import { DEMO_PERSONAS } from './data/catalogData.ts';
import { APP_THEMES, AppTheme, applyThemeTokens } from './data/themes.ts';
import { apiClient } from './services/apiClient.ts';
import {
  AccessRequestRecord,
  AssistantSessionSummary,
  DataProduct,
  EnterpriseDomain,
  LiveAnalyticsSummary,
  MarketplaceNotification,
  NavSection,
  PersonaProfile,
} from './types/marketplace.ts';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [activeTheme, setActiveTheme] = useState<AppTheme>(() => {
    const savedId = typeof window !== 'undefined' ? window.localStorage.getItem('dfiq_theme') : null;
    return APP_THEMES.find((t) => t.id === savedId) ?? APP_THEMES[0];
  });
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  useEffect(() => {
    applyThemeTokens(activeTheme);
    try {
      window.localStorage.setItem('dfiq_theme', activeTheme.id);
    } catch {
      // ignore storage failure
    }
  }, [activeTheme]);

  const [products, setProducts] = useState<DataProduct[]>([]);
  const [personas, setPersonas] = useState<PersonaProfile[]>(DEMO_PERSONAS);
  const [activePersona, setActivePersona] = useState<PersonaProfile>(DEMO_PERSONAS[0]);
  const [accessRequests, setAccessRequests] = useState<AccessRequestRecord[]>([]);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [assistantHistory, setAssistantHistory] = useState<AssistantSessionSummary[]>([]);
  const [liveSummary, setLiveSummary] = useState<LiveAnalyticsSummary>({
    totalVisits: 1,
    uniqueSectionsVisited: 1,
    searchesExecuted: 0,
    productsViewed: 0,
    aiQueriesExecuted: 0,
    suitabilityChecksRun: 0,
    accessRequestsSubmitted: 0,
    metadataUpdatesSaved: 0,
    featureUsageBreakdown: [],
    sectionVisitBreakdown: [],
    recentEvents: [],
  });

  // Navigation & filter handoff state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [discoverDomain, setDiscoverDomain] = useState<EnterpriseDomain | 'All'>('All');
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | null>(null);

  // Modals
  const [accessModalProductId, setAccessModalProductId] = useState<string | null>(null);
  const [suitabilityModalProductId, setSuitabilityModalProductId] = useState<string | undefined>(undefined);
  const [suitabilityModalOpen, setSuitabilityModalOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const data = await apiClient.bootstrap();
        if (!active) return;
        setProducts(data.products);
        setPersonas(data.personas);
        setActivePersona(data.personas[0]);
        setAccessRequests(data.accessRequests);
        setNotifications(data.notifications);
        setSavedProductIds(data.savedProductIds);
        setRecentlyViewedIds(data.recentlyViewedIds);
        setAssistantHistory(data.assistantHistory);
        setLiveSummary(data.analyticsSummary);
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load DataFabricIQ workspace.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  const refreshAnalytics = async () => {
    try {
      const res = await apiClient.getAnalyticsSummary();
      setLiveSummary(res.summary);
    } catch {
      // ignore transient telemetry read error
    }
  };

  const trackAndNavigate = (section: NavSection, clearProduct = true) => {
    setActiveSection(section);
    if (clearProduct) setSelectedProductId(null);
    void apiClient
      .trackEvent({
        type: 'page_visit',
        section,
        label: `Visited ${section}`,
        personaRole: activePersona.role,
      })
      .then((res) => setLiveSummary(res.summary))
      .catch(() => {});
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActiveSection('products');
    void apiClient
      .recordView(productId, activePersona.role)
      .then((res) => {
        setRecentlyViewedIds(res.recentlyViewedIds);
        void refreshAnalytics();
      })
      .catch(() => {});
  };

  const handleGlobalSearch = (query: string) => {
    setDiscoverQuery(query);
    setDiscoverDomain('All');
    setSelectedProductId(null);
    setActiveSection('discover');
    if (query.trim()) {
      void apiClient
        .trackEvent({
          type: 'search_executed',
          section: 'discover',
          label: `Searched: "${query.trim()}"`,
          personaRole: activePersona.role,
        })
        .then((res) => setLiveSummary(res.summary))
        .catch(() => {});
    }
  };

  const handleSelectDomain = (domain: EnterpriseDomain) => {
    setDiscoverDomain(domain);
    setDiscoverQuery('');
    setSelectedProductId(null);
    setActiveSection('discover');
    void apiClient
      .trackEvent({
        type: 'page_visit',
        section: 'discover',
        label: `Filtered Discover by ${domain}`,
        personaRole: activePersona.role,
      })
      .then((res) => setLiveSummary(res.summary))
      .catch(() => {});
  };

  const handleAskAIWithPrompt = (prompt: string) => {
    setAssistantInitialPrompt(prompt);
    setSelectedProductId(null);
    trackAndNavigate('assistant', true);
  };

  const handleToggleSave = (productId: string) => {
    void apiClient
      .toggleSave(productId)
      .then((res) => setSavedProductIds(res.savedProductIds))
      .catch(() => {});
  };

  const handleMarkAllRead = () => {
    void apiClient
      .markAllNotificationsRead()
      .then((res) => setNotifications(res.notifications))
      .catch(() => {});
  };

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) ?? null
    : null;

  const accessModalProduct = accessModalProductId
    ? products.find((p) => p.id === accessModalProductId) ?? null
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--df-canvas)] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-md w-full space-y-3">
          <div className="text-sm font-semibold text-[var(--df-ink)]">Loading DataFabricIQ</div>
          <div className="h-2.5 bg-slate-100 rounded w-3/4 animate-pulse" />
          <div className="h-2.5 bg-slate-100 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[var(--df-canvas)] flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md w-full space-y-3">
          <h1 className="text-base font-semibold text-[#B91C1C]">Workspace Initialization Error</h1>
          <p className="text-sm text-slate-600">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-[var(--df-primary)] text-white text-xs font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--df-canvas)] text-[#0F172A] transition-colors">
      <Sidebar
        activeSection={activeSection}
        onNavigate={(section) => trackAndNavigate(section, true)}
        activePersona={activePersona}
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeSection={activeSection}
          selectedProductName={selectedProduct?.name}
          globalQuery={discoverQuery}
          onGlobalSearch={handleGlobalSearch}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          activePersona={activePersona}
          onOpenPersonaModal={() => setPersonaModalOpen(true)}
          activeTheme={activeTheme}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-[1320px] w-full mx-auto">
          {activeSection === 'home' && (
            <HomeView
              products={products}
              recentlyViewedIds={recentlyViewedIds}
              savedProductIds={savedProductIds}
              activeTheme={activeTheme}
              onSelectTheme={setActiveTheme}
              onOpenThemeModal={() => setThemeModalOpen(true)}
              onNaturalLanguageSearch={handleGlobalSearch}
              onAskAIWithPrompt={handleAskAIWithPrompt}
              onSelectDomain={handleSelectDomain}
              onSelectProduct={handleSelectProduct}
              onToggleSave={handleToggleSave}
              onOpenSuitabilityModal={() => {
                setSuitabilityModalProductId('customer-360');
                setSuitabilityModalOpen(true);
              }}
            />
          )}

          {activeSection === 'discover' && (
            <DiscoverView
              products={products}
              initialQuery={discoverQuery}
              initialDomain={discoverDomain}
              savedProductIds={savedProductIds}
              onSelectProduct={handleSelectProduct}
              onToggleSave={handleToggleSave}
              onSearchTracked={(q) => {
                void apiClient
                  .trackEvent({
                    type: 'search_executed',
                    section: 'discover',
                    label: `Discover query: "${q}"`,
                    personaRole: activePersona.role,
                  })
                  .then((res) => setLiveSummary(res.summary))
                  .catch(() => {});
              }}
              onAskAIWithPrompt={handleAskAIWithPrompt}
            />
          )}

          {activeSection === 'products' &&
            (selectedProduct ? (
              <ProductDetailView
                product={selectedProduct}
                isSaved={savedProductIds.includes(selectedProduct.id)}
                activeRole={activePersona.role}
                onBack={() => setSelectedProductId(null)}
                onToggleSave={handleToggleSave}
                onOpenAccessRequest={(id) => setAccessModalProductId(id)}
                onSuitabilityEvaluated={() => void refreshAnalytics()}
              />
            ) : (
              <DataProductsCatalogView
                products={products}
                onSelectProduct={handleSelectProduct}
                onOpenSuitabilityModal={(id) => {
                  setSuitabilityModalProductId(id);
                  setSuitabilityModalOpen(true);
                }}
              />
            ))}

          {activeSection === 'assistant' && (
            <AssistantView
              activeRole={activePersona.role}
              initialPrompt={assistantInitialPrompt}
              onClearInitialPrompt={() => setAssistantInitialPrompt(null)}
              onSelectProduct={handleSelectProduct}
              onOpenSuitabilityModal={(id) => {
                setSuitabilityModalProductId(id);
                setSuitabilityModalOpen(true);
              }}
              onHistoryUpdated={(hist) => {
                setAssistantHistory(hist);
                void refreshAnalytics();
              }}
            />
          )}

          {activeSection === 'workspace' && (
            <MyWorkspaceView
              activePersona={activePersona}
              products={products}
              accessRequests={accessRequests}
              savedProductIds={savedProductIds}
              recentlyViewedIds={recentlyViewedIds}
              assistantHistory={assistantHistory}
              onSelectProduct={handleSelectProduct}
              onToggleSave={handleToggleSave}
              onOpenAssistantPrompt={handleAskAIWithPrompt}
            />
          )}

          {activeSection === 'producer' && (
            <ProducerWorkspaceView
              products={products}
              activeRole={activePersona.role}
              onProductUpdated={(updated, newNotifs) => {
                setProducts((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p))
                );
                setNotifications(newNotifs);
                void refreshAnalytics();
              }}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {activeSection === 'analytics' && (
            <AnalyticsView
              products={products}
              liveSummary={liveSummary}
              onRefreshLiveSummary={() => void refreshAnalytics()}
            />
          )}
        </main>
      </div>

      {accessModalProduct && (
        <AccessRequestModal
          product={accessModalProduct}
          activePersona={activePersona}
          onClose={() => setAccessModalProductId(null)}
          onSubmitted={(_req, allReqs, newNotifs) => {
            setAccessRequests(allReqs);
            setNotifications(newNotifs);
            void refreshAnalytics();
          }}
          onViewInWorkspace={() => trackAndNavigate('workspace', true)}
        />
      )}

      {suitabilityModalOpen && (
        <SuitabilityModal
          products={products}
          initialProductId={suitabilityModalProductId}
          activeRole={activePersona.role}
          onClose={() => setSuitabilityModalOpen(false)}
          onEvaluated={() => void refreshAnalytics()}
        />
      )}

      {personaModalOpen && (
        <PersonaAuthModal
          personas={personas}
          activePersona={activePersona}
          onSelectPersona={(p) => setActivePersona(p)}
          onSimulateOAuth={(provider) =>
            setActivePersona((prev) => ({
              ...prev,
              authProvider: provider,
            }))
          }
          onClose={() => setPersonaModalOpen(false)}
        />
      )}

      {themeModalOpen && (
        <ThemePickerModal
          activeThemeId={activeTheme.id}
          onSelectTheme={(theme) => setActiveTheme(theme)}
          onClose={() => setThemeModalOpen(false)}
        />
      )}
    </div>
  );
}
