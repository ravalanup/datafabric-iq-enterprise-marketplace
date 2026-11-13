import {
  BarChart3,
  Bot,
  Briefcase,
  Compass,
  Database,
  Home,
  Layers,
  UserCheck,
  X,
} from 'lucide-react';
import { NavSection, PersonaProfile } from '../types/marketplace.ts';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  activePersona: PersonaProfile;
  onOpenPersonaModal: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{ id: NavSection; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover Data', icon: Compass },
  { id: 'products', label: 'Data Products', icon: Database },
  { id: 'assistant', label: 'AI Data Assistant', icon: Bot },
  { id: 'workspace', label: 'My Workspace', icon: Briefcase },
  { id: 'producer', label: 'Producer Workspace', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function Sidebar({
  activeSection,
  onNavigate,
  activePersona,
  onOpenPersonaModal,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const content = (
    <div
      className="flex flex-col h-full w-[252px] border-r transition-colors"
      style={{
        backgroundColor: 'var(--df-sidebar-bg)',
        borderColor: 'var(--df-sidebar-border)',
        color: 'var(--df-sidebar-text)',
      }}
    >
      <div
        className="px-5 h-16 flex items-center justify-between border-b shrink-0"
        style={{ borderColor: 'var(--df-sidebar-border)' }}
      >
        <button
          type="button"
          onClick={() => {
            onNavigate('home');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 text-left"
        >
          <span
            className="w-7 h-7 rounded-md text-white flex items-center justify-center font-semibold text-xs tracking-tight shadow-xs"
            style={{ backgroundColor: 'var(--df-primary)' }}
          >
            DF
          </span>
          <span
            className="font-semibold text-[16px] tracking-tight whitespace-nowrap"
            style={{ color: 'var(--df-sidebar-text)' }}
          >
            DataFabricIQ
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 opacity-70 hover:opacity-100"
          aria-label="Close navigation menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              style={
                active
                  ? {
                      backgroundColor: 'var(--df-sidebar-active-bg)',
                      color: 'var(--df-sidebar-active-text)',
                    }
                  : {
                      color: 'var(--df-sidebar-text)',
                    }
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                active ? '' : 'opacity-80 hover:opacity-100 hover:bg-black/5'
              }`}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={{
                  color: active ? 'var(--df-sidebar-active-text)' : 'var(--df-sidebar-muted)',
                }}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div
        className="p-3 border-t"
        style={{ borderColor: 'var(--df-sidebar-border)' }}
      >
        <div className="px-2 py-1.5">
          <div className="text-[11px] font-medium" style={{ color: 'var(--df-sidebar-muted)' }}>
            Active Persona
          </div>
          <div className="mt-0.5 text-sm font-semibold truncate">{activePersona.name}</div>
          <div className="text-xs truncate opacity-80">{activePersona.role}</div>
          <div className="mt-1 text-[11px] truncate" style={{ color: 'var(--df-sidebar-muted)' }}>
            {activePersona.authProvider}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenPersonaModal}
          className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md border transition-colors whitespace-nowrap bg-white/95 text-[#0F172A] border-slate-200 hover:border-[var(--df-primary)]"
        >
          <UserCheck className="w-3.5 h-3.5 text-[var(--df-primary)]" />
          Switch Persona / OAuth
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
