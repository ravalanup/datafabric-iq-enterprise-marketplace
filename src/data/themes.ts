export interface AppTheme {
  id: string;
  name: string;
  tagline: string;
  description: string;
  swatches: [string, string, string, string];
  tokens: {
    canvas: string;
    surface: string;
    surfaceSubtle: string;
    border: string;
    ink: string;
    primary: string;
    primaryHover: string;
    primarySoft: string;
    secondary: string;
    secondarySoft: string;
    sidebarBg: string;
    sidebarBorder: string;
    sidebarText: string;
    sidebarMuted: string;
    sidebarHoverBg: string;
    sidebarActiveBg: string;
    sidebarActiveText: string;
    heroBg: string;
    heroText: string;
    heroSubtext: string;
    heroBorder: string;
  };
}

export const APP_THEMES: AppTheme[] = [
  {
    id: 'chase-cobalt',
    name: 'Institutional Banking Blue',
    tagline: 'Crisp Cobalt & Teal Trust',
    description:
      'High-clarity financial dashboard palette pairing cobalt blue primary actions with deep navy ink and subtle teal secondary highlights.',
    swatches: ['#005EB8', '#0D9488', '#0A2540', '#F4F7FB'],
    tokens: {
      canvas: '#F4F7FB',
      surface: '#FFFFFF',
      surfaceSubtle: '#F8FAFC',
      border: '#E2E8F0',
      ink: '#0A2540',
      primary: '#005EB8',
      primaryHover: '#004488',
      primarySoft: '#EBF3FA',
      secondary: '#0D9488',
      secondarySoft: '#E6F7F5',
      sidebarBg: '#FFFFFF',
      sidebarBorder: '#E2E8F0',
      sidebarText: '#0F172A',
      sidebarMuted: '#64748B',
      sidebarHoverBg: '#F8FAFC',
      sidebarActiveBg: '#EBF3FA',
      sidebarActiveText: '#005EB8',
      heroBg: 'linear-gradient(135deg, #0A2540 0%, #0F3B66 60%, #005EB8 100%)',
      heroText: '#FFFFFF',
      heroSubtext: '#CBD5E1',
      heroBorder: '#0A2540',
    },
  },
  {
    id: 'midnight-executive',
    name: 'Midnight Executive Slate',
    tagline: 'Dark Navy Navigation & Royal Blue',
    description:
      'Contrasting obsidian-navy command sidebar paired with a bright analytical workspace, royal blue actions, and indigo AI accents.',
    swatches: ['#2563EB', '#6D28D9', '#0F172A', '#F5F7FC'],
    tokens: {
      canvas: '#F5F7FC',
      surface: '#FFFFFF',
      surfaceSubtle: '#F8FAFC',
      border: '#E2E8F0',
      ink: '#0F172A',
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      primarySoft: '#EFF4FF',
      secondary: '#6D28D9',
      secondarySoft: '#F3EEFE',
      sidebarBg: '#0F172A',
      sidebarBorder: '#1E293B',
      sidebarText: '#F8FAFC',
      sidebarMuted: '#94A3B8',
      sidebarHoverBg: '#1E293B',
      sidebarActiveBg: '#1E3A8A',
      sidebarActiveText: '#FFFFFF',
      heroBg: 'linear-gradient(135deg, #1E293B 0%, #1E3A8A 65%, #312E81 100%)',
      heroText: '#FFFFFF',
      heroSubtext: '#CBD5E1',
      heroBorder: '#1E293B',
    },
  },
  {
    id: 'emerald-wealth',
    name: 'Emerald Private Wealth',
    tagline: 'Forest Emerald & Warm Amber',
    description:
      'Private banking wealth aesthetic pairing rich emerald greens with warm amber highlights on soft sage-tinted white.',
    swatches: ['#047857', '#B45309', '#06281E', '#F3F8F5'],
    tokens: {
      canvas: '#F3F8F5',
      surface: '#FFFFFF',
      surfaceSubtle: '#F7FAF8',
      border: '#DCE7E1',
      ink: '#06281E',
      primary: '#047857',
      primaryHover: '#065F46',
      primarySoft: '#E6F4EE',
      secondary: '#B45309',
      secondarySoft: '#FEF3C7',
      sidebarBg: '#06281E',
      sidebarBorder: '#113E31',
      sidebarText: '#F0FDF4',
      sidebarMuted: '#A7F3D0',
      sidebarHoverBg: '#0C3B2D',
      sidebarActiveBg: '#047857',
      sidebarActiveText: '#FFFFFF',
      heroBg: 'linear-gradient(135deg, #06281E 0%, #064E3B 65%, #047857 100%)',
      heroText: '#FFFFFF',
      heroSubtext: '#D1FAE5',
      heroBorder: '#064E3B',
    },
  },
  {
    id: 'nordic-teal',
    name: 'Nordic Teal & Azure',
    tagline: 'Cloud Infrastructure Clarity',
    description:
      'Cool Scandinavian data-platform palette combining deep ocean teal with bright sky azure and airy ice-gray surfaces.',
    swatches: ['#0F766E', '#0284C7', '#112A30', '#F2F7F8'],
    tokens: {
      canvas: '#F2F7F8',
      surface: '#FFFFFF',
      surfaceSubtle: '#F6FAFB',
      border: '#DCE6E9',
      ink: '#112A30',
      primary: '#0F766E',
      primaryHover: '#115E59',
      primarySoft: '#E6F5F3',
      secondary: '#0284C7',
      secondarySoft: '#E0F2FE',
      sidebarBg: '#FFFFFF',
      sidebarBorder: '#DCE6E9',
      sidebarText: '#112A30',
      sidebarMuted: '#5C747A',
      sidebarHoverBg: '#F2F7F8',
      sidebarActiveBg: '#E6F5F3',
      sidebarActiveText: '#0F766E',
      heroBg: 'linear-gradient(135deg, #112A30 0%, #134E4A 60%, #0284C7 100%)',
      heroText: '#FFFFFF',
      heroSubtext: '#CCFBF1',
      heroBorder: '#134E4A',
    },
  },
  {
    id: 'sovereign-burgundy',
    name: 'Sovereign Capital Burgundy',
    tagline: 'Institutional Risk & Reserve',
    description:
      'Editorial investment-bank palette blending sovereign burgundy accents with steel blue analytics on warm alabaster.',
    swatches: ['#9F1239', '#1D4ED8', '#270A14', '#F9F6F7'],
    tokens: {
      canvas: '#F9F6F7',
      surface: '#FFFFFF',
      surfaceSubtle: '#FCF9FA',
      border: '#EAE0E3',
      ink: '#270A14',
      primary: '#9F1239',
      primaryHover: '#881337',
      primarySoft: '#FDF2F4',
      secondary: '#1D4ED8',
      secondarySoft: '#EFF6FF',
      sidebarBg: '#FFFFFF',
      sidebarBorder: '#EAE0E3',
      sidebarText: '#270A14',
      sidebarMuted: '#7A5D66',
      sidebarHoverBg: '#FDF2F4',
      sidebarActiveBg: '#FDF2F4',
      sidebarActiveText: '#9F1239',
      heroBg: 'linear-gradient(135deg, #270A14 0%, #6B102B 60%, #9F1239 100%)',
      heroText: '#FFFFFF',
      heroSubtext: '#FCE7F3',
      heroBorder: '#6B102B',
    },
  },
];

export const DOMAIN_COLOR_MAP: Record<string, { text: string; bg: string; dot: string }> = {
  'Customer Experience': { text: '#005EB8', bg: '#EBF3FA', dot: '#005EB8' },
  'Streaming and Digital Media': { text: '#6D28D9', bg: '#F3EEFE', dot: '#6D28D9' },
  Marketing: { text: '#B45309', bg: '#FEF3C7', dot: '#D97706' },
  'Merchandise and Commerce': { text: '#0F766E', bg: '#E6F5F3', dot: '#0D9488' },
  Finance: { text: '#047857', bg: '#E6F4EE', dot: '#059669' },
  Workforce: { text: '#4338CA', bg: '#EEF2FF', dot: '#4F46E5' },
  Operations: { text: '#0369A1', bg: '#E0F2FE', dot: '#0284C7' },
};

export function applyThemeTokens(theme: AppTheme) {
  const root = document.documentElement;
  const t = theme.tokens;
  root.style.setProperty('--df-canvas', t.canvas);
  root.style.setProperty('--df-surface', t.surface);
  root.style.setProperty('--df-surface-subtle', t.surfaceSubtle);
  root.style.setProperty('--df-border', t.border);
  root.style.setProperty('--df-ink', t.ink);
  root.style.setProperty('--df-primary', t.primary);
  root.style.setProperty('--df-primary-hover', t.primaryHover);
  root.style.setProperty('--df-primary-soft', t.primarySoft);
  root.style.setProperty('--df-secondary', t.secondary);
  root.style.setProperty('--df-secondary-soft', t.secondarySoft);
  root.style.setProperty('--df-sidebar-bg', t.sidebarBg);
  root.style.setProperty('--df-sidebar-border', t.sidebarBorder);
  root.style.setProperty('--df-sidebar-text', t.sidebarText);
  root.style.setProperty('--df-sidebar-muted', t.sidebarMuted);
  root.style.setProperty('--df-sidebar-hover-bg', t.sidebarHoverBg);
  root.style.setProperty('--df-sidebar-active-bg', t.sidebarActiveBg);
  root.style.setProperty('--df-sidebar-active-text', t.sidebarActiveText);
  root.style.setProperty('--df-hero-bg', t.heroBg);
  root.style.setProperty('--df-hero-text', t.heroText);
  root.style.setProperty('--df-hero-subtext', t.heroSubtext);
  root.style.setProperty('--df-hero-border', t.heroBorder);
}
