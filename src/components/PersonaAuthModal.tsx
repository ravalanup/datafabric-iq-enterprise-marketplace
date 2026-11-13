import { Check, Github, Globe, UserCheck, X } from 'lucide-react';
import { PersonaProfile } from '../types/marketplace.ts';

interface PersonaAuthModalProps {
  personas: PersonaProfile[];
  activePersona: PersonaProfile;
  onSelectPersona: (persona: PersonaProfile) => void;
  onSimulateOAuth: (provider: 'Google OAuth (Simulated)' | 'GitHub OAuth (Simulated)') => void;
  onClose: () => void;
}

export function PersonaAuthModal({
  personas,
  activePersona,
  onSelectPersona,
  onSimulateOAuth,
  onClose,
}: PersonaAuthModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[var(--df-primary)]" />
            <h2 className="text-base font-semibold text-[var(--df-ink)]">
              Demo Persona & OAuth Sign-In Preview
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700"
            aria-label="Close persona modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Switch personas instantly to test how DataFabricIQ policy rules evaluate access requests
            across roles, or preview simulated Google/GitHub OAuth sign-on for stakeholder demos.
          </p>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#0F172A]">Select Active Demo Persona</div>
            {personas.map((persona) => {
              const isCurrent = persona.id === activePersona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    onSelectPersona(persona);
                    onClose();
                  }}
                  className={`w-full p-3.5 rounded-md border text-left flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'border-[var(--df-primary)] bg-[var(--df-primary-soft)]/60'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {persona.name} · {persona.role}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {persona.department} · Tier: {persona.entitlementTier}
                    </div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-[var(--df-primary)] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-2.5">
            <div className="text-xs font-semibold text-[#0F172A]">
              Simulated OAuth Provider Preview (Vercel / Supabase Auth Roadmap)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onSimulateOAuth('Google OAuth (Simulated)');
                  onClose();
                }}
                className="h-10 px-3 rounded-md border border-slate-200 hover:border-[var(--df-primary)] bg-white text-xs font-medium text-[#0F172A] inline-flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4 text-[var(--df-primary)]" />
                Sign in with Google (Demo)
              </button>
              <button
                type="button"
                onClick={() => {
                  onSimulateOAuth('GitHub OAuth (Simulated)');
                  onClose();
                }}
                className="h-10 px-3 rounded-md border border-slate-200 hover:border-[var(--df-primary)] bg-white text-xs font-medium text-[#0F172A] inline-flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4 text-[#0F172A]" />
                Sign in with GitHub (Demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
