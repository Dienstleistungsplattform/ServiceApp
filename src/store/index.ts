// ─────────────────────────────────────────────────────────────────────────────
// store/index.ts
//
// Zentraler State-Layer mit localStorage-Persistenz.
// Alle schreibenden Operationen versuchen zunächst die Spring Boot API –
// bei Fehler (oder VITE_USE_MOCK=true) wird localStorage als Fallback genutzt.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import type { Booking, BookingDraft, Offer, PaymentMethod } from '@/types';
import { MOCK_BOOKINGS, MOCK_OFFERS } from '@/api/mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const LS = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch { return fallback; }
  },
  set<T>(key: string, value: T): void {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
  },
};

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token')
        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
        : {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Offers store ──────────────────────────────────────────────────────────────
export function useOffersStore(categoryFilter: string | string[]) {
  const [offers, setOffers]   = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Normalize to array for consistent handling
  const categories = Array.isArray(categoryFilter) ? categoryFilter : [categoryFilter];
  const filterKey  = categories.join(',');

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      const hasAll = categories.includes('all') || categories.length === 0;
      const filtered = hasAll
        ? MOCK_OFFERS
        : MOCK_OFFERS.filter(o => categories.includes(o.category));
      setOffers(filtered);
      setLoading(false);
      return;
    }

    const hasAll = categories.includes('all') || categories.length === 0;
    const params = hasAll ? '' : `?category=${categories.join(',')}`;

    apiFetch<{ content: Offer[] }>(`/offers${params}`)
      .then(r => setOffers(r.content))
      .catch(err => {
        console.warn('API unreachable, using mock data:', err);
        const fallback = hasAll
          ? MOCK_OFFERS
          : MOCK_OFFERS.filter(o => categories.includes(o.category));
        setOffers(fallback);
        setError('Offline-Modus aktiv');
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  return { offers, loading, error };
}

// ── Bookings store ────────────────────────────────────────────────────────────
export function useBookingsStore() {
  const [bookings, setBookings] = useState<Booking[]>(() =>
    LS.get<Booking[]>('sa_bookings', MOCK_BOOKINGS as Booking[])
  );
  const [loading, setLoading] = useState(!USE_MOCK);

  // Sync to localStorage on every change
  useEffect(() => { LS.set('sa_bookings', bookings); }, [bookings]);

  // Initial fetch from API (skipped in mock mode)
  useEffect(() => {
    if (USE_MOCK) return;
    apiFetch<Booking[]>('/bookings')
      .then(data => { setBookings(data); LS.set('sa_bookings', data); })
      .catch(() => { /* keep localStorage data */ })
      .finally(() => setLoading(false));
  }, []);

  const book = useCallback(async (draft: BookingDraft, offer: Offer): Promise<Booking> => {
    const optimistic: Booking = {
      id: Date.now(),
      offerId: offer.id,
      category: offer.category,
      title: offer.title,
      provider: offer.provider,
      price: offer.price,
      date: draft.date,
      time: draft.time,
      status: 'confirmed',
      duration: offer.duration,
      rating: offer.rating,
      reviews: offer.reviews,
      description: offer.description,
      paymentMethod: draft.paymentMethod,
      bookedAt: new Date().toISOString(),
    };

    // Optimistic update
    setBookings(prev => [...prev, optimistic]);

    if (!USE_MOCK) {
      try {
        const confirmed = await apiFetch<Booking>('/bookings', {
          method: 'POST',
          body: JSON.stringify(draft),
        });
        // Replace optimistic with server response
        setBookings(prev => prev.map(b => b.id === optimistic.id ? confirmed : b));
        return confirmed;
      } catch {
        // Keep optimistic booking, mark as pending
        console.warn('Could not sync booking to server – saved locally');
      }
    }

    return optimistic;
  }, []);

  const cancel = useCallback(async (bookingId: number) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    if (!USE_MOCK) {
      apiFetch(`/bookings/${bookingId}`, { method: 'DELETE' }).catch(console.warn);
    }
  }, []);

  const upcoming = bookings.filter(b => b.status !== 'completed');
  const past      = bookings.filter(b => b.status === 'completed');

  return { bookings, upcoming, past, loading, book, cancel };
}

// ── Favorites store ───────────────────────────────────────────────────────────
export function useFavoritesStore(allOffers: Offer[]) {
  const [favIds, setFavIds] = useState<number[]>(() =>
    LS.get<number[]>('sa_favorites', [1, 2, 6, 7])
  );

  useEffect(() => { LS.set('sa_favorites', favIds); }, [favIds]);

  useEffect(() => {
    if (USE_MOCK) return;
    apiFetch<number[]>('/favorites')
      .then(ids => { setFavIds(ids); LS.set('sa_favorites', ids); })
      .catch(() => { /* keep localStorage */ });
  }, []);

  const add = useCallback((offerId: number) => {
    setFavIds(prev => prev.includes(offerId) ? prev : [...prev, offerId]);
    if (!USE_MOCK) {
      apiFetch(`/favorites/${offerId}`, { method: 'POST', body: '{}' }).catch(console.warn);
    }
  }, []);

  const remove = useCallback((offerId: number) => {
    setFavIds(prev => prev.filter(id => id !== offerId));
    if (!USE_MOCK) {
      apiFetch(`/favorites/${offerId}`, { method: 'DELETE' }).catch(console.warn);
    }
  }, []);

  const isFav = useCallback((id: number) => favIds.includes(id), [favIds]);
  const favoriteOffers = allOffers.filter(o => favIds.includes(o.id));

  return { favIds, favoriteOffers, isFav, add, remove };
}

// ── Payment methods ───────────────────────────────────────────────────────────
export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'card',    label: 'Kreditkarte',  icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { id: 'paypal',  label: 'PayPal',       icon: '🅿️', desc: 'Schnell & sicher' },
  { id: 'invoice', label: 'Rechnung',     icon: '🧾', desc: 'Zahlung innerhalb 14 Tagen' },
];



// ── Time slots with discount ──────────────────────────────────────────────────
export interface TimeSlotEntry {
  time: string;
  discount: number; // 0 = kein Rabatt
}

export interface DaySlots {
  date: string;
  label: string;
  slots: TimeSlotEntry[];
  maxDiscount: number; // höchster Rabatt des Tages fürs Datum-Badge
}

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const ALL_TIMES = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00'];
const DISCOUNT_STEPS = [0,0,0,0,5,10,10,15,20,25];

export function generateTimeSlots(baseDate: string): DaySlots[] {
  const base = new Date(baseDate);
  const days: DaySlots[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso   = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('de-DE', { weekday:'short', day:'numeric', month:'short' });
    const seed  = d.getDate() * 31 + d.getMonth() * 12 + i * 7;
    const slots: TimeSlotEntry[] = ALL_TIMES
      .filter((_,ti) => seededRand(seed + ti) > 0.3)
      .map((time, ti) => ({
        time,
        discount: DISCOUNT_STEPS[Math.floor(seededRand(seed + ti + 100) * DISCOUNT_STEPS.length)],
      }));
    days.push({ date: iso, label, slots, maxDiscount: Math.max(0, ...slots.map(s => s.discount)) });
  }
  return days;
}

// ── User profile store (localStorage-persistent) ──────────────────────────────
export interface UserData {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
}

const USER_DEFAULT: UserData = {
  firstName: 'Lena', lastName: 'Müller',
  email: 'lena.mueller@email.de', phone: '+49 151 12345678',
};

export function useUserStore() {
  const [user, setUser] = useState<UserData>(() =>
    LS.get<UserData>('sa_user', USER_DEFAULT)
  );

  const update = useCallback((patch: Partial<UserData>) => {
    setUser(prev => {
      const next = { ...prev, ...patch };
      LS.set('sa_user', next);
      return next;
    });
  }, []);

  return { user, update };
}
