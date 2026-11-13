import { useState, FormEvent } from 'react';
import { Bell, Check, Menu, Palette, Search, User } from 'lucide-react';
import { AppTheme } from '../data/themes.ts';
import { MarketplaceNotification, NavSection, PersonaProfile } from '../types/marketplace.ts';

interface TopBarProps {
  activeSection: NavSection;
  selectedProductName?: string | null;
  globalQuery: string;
  onGlobalSearch: (query: string) => void;
  notifications: MarketplaceNotification[];
  onMarkAllRead: () => void;
  activePersona: PersonaProfile;
  onOpenPersonaModal: () => void;
  activeTheme: AppTheme;
  onOpenThemeModal: () => void;
  onOpenMobileNav: () => void;
}

const SECTION_LABELS: Record<NavSection, string> = {
  home: 'Home',
  discover: 'Discover Data',
  products: 'Data Products',
  assistant: 'AI Data Assistant',
  workspace: 'My Workspace',
  producer: 'Producer Workspace',
  analytics: 'Analytics',
};

export function TopBar({
  activeSection,
  selectedProductName,
  globalQuery,
  onGlobalSearch,
  notifications,
  onMarkAllRead,
  activePersona,
  onOpenPersonaModal,
  activeTheme,
  onOpenThemeModal,
  onOpenMobileNav,
}: TopBarProps) {
  const [draftQuery, setDraftQuery] = useState(globalQuery);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onGlobalSearch(draftQuery);
  };

  return (
    <header className="h-16 bg-white border-b border-[var(--df-border)] px-4 lg:px-8 flex items-center justify-between gap-4 lg:gap-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="font-semibold text-[var(--df-ink)] whitespace-nowrap shrink-0">
            Enterprise Data Marketplace
          </span>
          <span className="text-slate-300 shrink-0">/</span>
          <span className="text-slate-600 truncate">
            {SECTION_LABELS[activeSection]}
            {activeSection === 'products' && selectedProductName ? ` · ${selectedProductName}` : ''}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="hidden md:flex flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder="Search products, domains, or business terms..."
          className="w-full h-9 pl-9 pr-3 text-sm bg-[var(--df-surface-subtle)] border border-[var(--df-border)] rounded-md text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:border-[var(--df-primary)] focus:bg-white transition-colors"
        />
      </form>

      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden xl:inline-block text-xs font-medium text-slate-500 whitespace-nowrap">
          Demo Environment
        </span>

        <button
          type="button"
          onClick={onOpenThemeModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--df-border)] bg-white hover:border-[var(--df-primary)] text-xs font-medium text-[#0F172A] transition-colors whitespace-nowrap shrink-0"
          title={`Current theme: ${activeTheme.name}`}
        >
          <Palette className="w-3.5 h-3.5 text-[var(--df-primary)]" />
          <span className="hidden sm:inline">Themes</span>
          <span className="flex items-center -space-x-1">
            <span
              className="w-2.5 h-2.5 rounded-full border border-white"
              style={{ backgroundColor: activeTheme.tokens.primary }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full border border-white"
              style={{ backgroundColor: activeTheme.tokens.secondary }}
            />
          </span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-md border border-[var(--df-border)] text-slate-600 hover:text-[#0F172A] hover:border-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-mono font-semibold flex items-center justify-center tabular-nums"
                style={{ backgroundColor: 'var(--df-primary)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0F172A]">Notifications</span>
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--df-primary)] hover:underline"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500">No marketplace notifications.</div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div key={n.id} className={`p-3.5 text-xs ${n.read ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#0F172A]">{n.title}</span>
                          <span className="text-slate-400 shrink-0">{n.timestamp}</span>
                        </div>
                        <p className="mt-1 text-slate-600 leading-relaxed">{n.detail}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenPersonaModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--df-border)] bg-white hover:border-slate-300 text-xs font-medium text-[#0F172A] transition-colors whitespace-nowrap shrink-0"
        >
          <User className="w-3.5 h-3.5 text-[var(--df-primary)]" />
          <span className="hidden sm:inline">{activePersona.name}</span>
          <span className="sm:hidden">Profile</span>
        </button>
      </div>
    </header>
  );
}
