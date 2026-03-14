import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Contrast targets (WCAG):
//   text          > 12:1  – headings, prices, labels
//   textSecondary >  7:1  – provider names, subtitles
//   textMuted     >  4.5:1 – meta info, dates, durations  ← was failing before
//   textSubtle    >  2.5:1 – purely decorative (dividers, placeholder hints)
//   navMuted      >  4.5:1 – inactive nav items           ← was failing before
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeColors {
  bg: string; bgSecondary: string; bgCard: string; bgInput: string;
  border: string; borderLight: string; inputBorder: string;
  // Four text levels – use the highest contrast appropriate
  text: string;           // primary labels, headings        >12:1
  textSecondary: string;  // provider names, descriptions    > 7:1
  textMuted: string;      // dates, durations, review counts > 4.5:1
  textSubtle: string;     // placeholders, decorative only   > 2.5:1
  navBg: string; navBorder: string; navText: string; navMuted: string;
  topbar: string; topbarBorder: string;
  accent: string; accentGrad: string;
  shadow: string; chip: string; chipText: string; statsBg: string;
}

const LIGHT: ThemeColors = {
  bg:            '#f2f2f7',
  bgSecondary:   '#f0f0f5',
  bgCard:        '#ffffff',
  bgInput:       '#f4f4f6',
  border:        '#e0e0e8',
  borderLight:   '#ebebf0',
  inputBorder:   '#d8d8e0',

  text:          '#0f0f1a',   // 18.5:1 on white
  textSecondary: '#3a3a50',   //  9.2:1 on white
  textMuted:     '#6e6e88',   //  4.7:1 on white, 4.4:1 on bgCard ✓
  textSubtle:    '#9898b0',   //  2.7:1 – only for truly decorative elements

  navBg:         '#ffffff',
  navBorder:     '#e8e8f0',
  navText:       '#0f0f1a',   // same as text
  navMuted:      '#6e6e88',   //  4.7:1 on white ✓ (was #cccccc = 1.6:1!)

  topbar:        '#ffffff',
  topbarBorder:  '#ebebf0',

  accent:        '#1a1a2e',
  accentGrad:    'linear-gradient(135deg,#1a1a2e,#3a3a6e)',

  shadow:        '0 2px 16px rgba(0,0,0,0.09)',
  chip:          '#ffffff',
  chipText:      '#3a3a50',   //  9.2:1 ✓
  statsBg:       '#f0f0f5',
};

const DARK: ThemeColors = {
  bg:            '#0e0e18',
  bgSecondary:   '#161626',
  bgCard:        '#1c1c30',   // slightly bluer than before for visible separation
  bgInput:       '#252542',

  border:        '#2e2e50',
  borderLight:   '#242440',
  inputBorder:   '#363660',

  text:          '#f0f0ff',   // 14.8:1 on bgCard ✓
  textSecondary: '#b8b8d8',   //  8.6:1 on bgCard ✓ (was #a0a0c0 = 6.6 – still ok, but richer)
  textMuted:     '#8888aa',   //  4.9:1 on bgCard ✓ (was #606080 = 2.8:1 – FAILING!)
  textSubtle:    '#565678',   //  2.4:1 – only timestamps, divider labels

  navBg:         '#12121f',
  navBorder:     '#1e1e36',
  navText:       '#e8e8ff',   // 15.4:1 on navBg ✓
  navMuted:      '#8080b0',   //  5.0:1 on navBg ✓ (was #3a3a60 = 1.7:1 – FAILING!)

  topbar:        '#1a1a2e',
  topbarBorder:  '#28284a',

  accent:        '#8878ff',   // slightly lighter than before for better contrast on dark bg
  accentGrad:    'linear-gradient(135deg,#5040c8,#8878ff)',

  shadow:        '0 2px 20px rgba(0,0,0,0.55)',
  chip:          '#252542',
  chipText:      '#b8b8d8',   //  7.7:1 on chip ✓
  statsBg:       '#161626',
};

interface ThemeCtx { dark: boolean; toggle: () => void; c: ThemeColors; }
const Ctx = createContext<ThemeCtx>({ dark: false, toggle: () => {}, c: LIGHT });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    try { return localStorage.getItem('sa_dark') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem('sa_dark', String(dark)); } catch { /**/ }
    document.body.style.background = dark ? '#0e0e18' : '#f2f2f7';
  }, [dark]);
  const toggle = useCallback(() => setDark(v => !v), []);
  return <Ctx.Provider value={{ dark, toggle, c: dark ? DARK : LIGHT }}>{children}</Ctx.Provider>;
}

export function useTheme() { return useContext(Ctx); }
