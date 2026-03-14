// ─────────────────────────────────────────────────────────────────────────────
// config.ts – Frontend-only Konstanten (kein API-Call nötig)
// ─────────────────────────────────────────────────────────────────────────────

import type { Category, StatusConfig, CategoryId, OfferStatus } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'all',     label: 'Alle',       icon: '✦', grad: 'linear-gradient(135deg,#1a1a2e,#3a3a6e)' },
  { id: 'beauty',  label: 'Beauty',     icon: '✿', grad: 'linear-gradient(135deg,#6d1530,#c05080)' },
  { id: 'health',  label: 'Gesundheit', icon: '♥', grad: 'linear-gradient(135deg,#0d4a35,#1a8c5e)' },
  { id: 'fitness', label: 'Fitness',    icon: '◈', grad: 'linear-gradient(135deg,#0d2a6e,#2060cc)' },
  { id: 'home',    label: 'Zuhause',    icon: '⌂', grad: 'linear-gradient(135deg,#5a2200,#b05000)' },
  { id: 'auto',    label: 'Fahrzeug',   icon: '◎', grad: 'linear-gradient(135deg,#1a2830,#2a5060)' },
];

export const STATUS_CONFIG: Record<OfferStatus, StatusConfig> = {
  available: { label: 'Verfügbar',      color: '#2d6a4f', bg: '#e8f5e9' },
  last_spot: { label: 'Letzter Platz!', color: '#c05300', bg: '#fff3e0' },
  booked:    { label: 'Gebucht',        color: '#1565c0', bg: '#e3f2fd' },
  confirmed: { label: 'Bestätigt',      color: '#6a1099', bg: '#f3e5f5' },
  completed: { label: 'Abgeschlossen',  color: '#555555', bg: '#f0f0f0' },
};

export const NAV_ITEMS = [
  { id: 'explore',   icon: '✦', label: 'Entdecken' },
  { id: 'bookings',  icon: '📋', label: 'Buchungen' },
  { id: 'favorites', icon: '♥',  label: 'Favoriten' },
  { id: 'profile',   icon: '◉',  label: 'Profil'    },
] as const;

export type NavId = typeof NAV_ITEMS[number]['id'];

export const catMap = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
) as Record<CategoryId, Category>;

export const MOBILE_BREAKPOINT = 768;
