import { Check, Palette, X } from 'lucide-react';
import { APP_THEMES, AppTheme } from '../data/themes.ts';

interface ThemePickerModalProps {
  activeThemeId: string;
  onSelectTheme: (theme: AppTheme) => void;
  onClose: () => void;
}

export function ThemePickerModal({
  activeThemeId,
  onSelectTheme,
  onClose,
}: ThemePickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--df-primary)]" />
            <h2 className="text-base font-semibold text-[var(--df-ink)]">
              DataFabricIQ Color Themes
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700"
            aria-label="Close theme picker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">
            Preview and apply any enterprise color palette below. Changes take effect immediately
            across navigation, hero surfaces, charts, and primary actions.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {APP_THEMES.map((theme) => {
              const isSelected = theme.id === activeThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => onSelectTheme(theme)}
                  className={`w-full text-left p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-[var(--df-primary)] bg-[var(--df-primary-soft)]/50 ring-1 ring-[var(--df-primary)]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0F172A]">{theme.name}</span>
                      <span className="text-xs text-slate-500">· {theme.tagline}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{theme.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5" aria-label="Theme color swatches">
                      {theme.swatches.map((hex, i) => (
                        <span
                          key={`${theme.id}-${hex}-${i}`}
                          title={hex}
                          className="w-6 h-6 rounded-md border border-slate-300/80 shadow-2xs"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                    <div className="w-20 text-right">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--df-primary)]">
                          <Check className="w-3.5 h-3.5" />
                          Applied
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Apply</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Domain indicators & semantic governance states remain color-blind accessible across all themes.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[var(--df-primary)] hover:bg-[var(--df-primary-hover)] text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
