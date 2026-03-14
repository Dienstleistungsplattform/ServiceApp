// ─────────────────────────────────────────────────────────────────────────────
// api/mock.ts
//
// Mock-Daten für die Entwicklung ohne laufendes Backend.
// Aktivieren: VITE_USE_MOCK=true in .env.local
// Deaktivieren: VITE_USE_MOCK=false → echte Spring Boot API
// ─────────────────────────────────────────────────────────────────────────────

import type { Offer, Booking, Category, UserProfile } from '@/types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'all',     label: 'Alle',       icon: '✦', grad: 'linear-gradient(135deg,#1a1a2e,#3a3a6e)' },
  { id: 'beauty',  label: 'Beauty',     icon: '✿', grad: 'linear-gradient(135deg,#6d1530,#c05080)' },
  { id: 'health',  label: 'Gesundheit', icon: '♥', grad: 'linear-gradient(135deg,#0d4a35,#1a8c5e)' },
  { id: 'fitness', label: 'Fitness',    icon: '◈', grad: 'linear-gradient(135deg,#0d2a6e,#2060cc)' },
  { id: 'home',    label: 'Zuhause',    icon: '⌂', grad: 'linear-gradient(135deg,#5a2200,#b05000)' },
  { id: 'auto',    label: 'Fahrzeug',   icon: '◎', grad: 'linear-gradient(135deg,#1a2830,#2a5060)' },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 1, category: 'beauty',
    title: 'Haarschnitt & Styling', provider: 'Studio Lumière',
    price: 65, originalPrice: 85,
    date: '2025-02-24', time: '14:00',
    status: 'available', rating: 4.9, reviews: 128, duration: '75 Min',
    tags: ['Beliebt', '-24%'],
    description: 'Professioneller Haarschnitt und Styling durch erfahrene Stylisten. Inklusive Haarpflege-Behandlung, Farbberatung und persönlichem Styling-Coaching.',
  },
  {
    id: 2, category: 'health',
    title: 'Massage Therapie', provider: 'Wellness Oasis',
    price: 89, originalPrice: null,
    date: '2025-02-25', time: '10:00',
    status: 'available', rating: 4.7, reviews: 94, duration: '60 Min',
    tags: ['Neu'],
    description: 'Tiefenentspannende Ganzkörpermassage mit hochwertigen Aromatherapie-Ölen. Ideal bei Verspannungen, Stress und Muskelbeschwerden.',
  },
  {
    id: 3, category: 'fitness',
    title: 'Personal Training', provider: 'FitPrime Studio',
    price: 55, originalPrice: null,
    date: '2025-02-26', time: '08:00',
    status: 'last_spot', rating: 5.0, reviews: 57, duration: '50 Min',
    tags: ['Letzter Platz'],
    description: 'Individuell abgestimmtes Training mit Ihrem persönlichen Coach. Inklusive Eingangsanalyse, Trainingsplan und Ernährungsberatung.',
  },
  {
    id: 4, category: 'home',
    title: 'Reinigungsservice', provider: 'CleanPro',
    price: 120, originalPrice: 150,
    date: '2025-02-27', time: '09:00',
    status: 'available', rating: 4.6, reviews: 212, duration: '3 Std',
    tags: ['-20%'],
    description: 'Gründliche Reinigung Ihrer Wohnung oder Ihres Hauses – pünktlich, zuverlässig und diskret. Mit Eco-Reinigungsmitteln auf Wunsch.',
  },
  {
    id: 5, category: 'auto',
    title: 'Fahrzeugaufbereitung', provider: 'AutoGlanz',
    price: 99, originalPrice: null,
    date: '2025-02-28', time: '11:00',
    status: 'booked', rating: 4.8, reviews: 73, duration: '2 Std',
    tags: [],
    description: 'Innen- und Außenreinigung, Politur und Nano-Versiegelung – Ihr Fahrzeug erstrahlt in neuem Glanz. Inkl. Felgenreinigung.',
  },
  {
    id: 6, category: 'health',
    title: 'Yoga & Meditation', provider: 'ZenSpace',
    price: 35, originalPrice: null,
    date: '2025-03-01', time: '07:30',
    status: 'available', rating: 4.9, reviews: 188, duration: '90 Min',
    tags: ['Beliebt'],
    description: 'Morgen-Yoga für alle Levels. Atemübungen, Asanas und geführte Meditation in ruhiger Atmosphäre. Matten werden gestellt.',
  },
  {
    id: 7, category: 'beauty',
    title: 'Gesichtsbehandlung', provider: 'Pure Skin',
    price: 79, originalPrice: 95,
    date: '2025-03-02', time: '13:00',
    status: 'available', rating: 4.8, reviews: 61, duration: '60 Min',
    tags: ['-17%'],
    description: 'Professionelle Gesichtsreinigung und Pflege mit hochwertigen Produkten. Auf Ihren Hauttyp individuell abgestimmt.',
  },
  {
    id: 8, category: 'fitness',
    title: 'Pilates Kurs', provider: 'BodyBalance',
    price: 28, originalPrice: null,
    date: '2025-03-03', time: '18:30',
    status: 'available', rating: 4.6, reviews: 44, duration: '55 Min',
    tags: [],
    description: 'Sanftes Ganzkörpertraining zur Kräftigung der Tiefenmuskulatur. Ideal zur Haltungsverbesserung und Rehabilitation.',
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: 5,  category: 'auto',    title: 'Fahrzeugaufbereitung', provider: 'AutoGlanz',       price: 99, date: '2025-02-28', time: '11:00', status: 'booked',     duration: '2 Std',  rating: 4.8, reviews: 73,  description: 'Innen- und Außenreinigung, Politur und Nano-Versiegelung.' },
  { id: 10, category: 'beauty',  title: 'Haarschnitt',          provider: 'Studio Lumière',  price: 65, date: '2025-03-03', time: '14:00', status: 'confirmed',  duration: '75 Min', rating: 4.9, reviews: 128, description: 'Professioneller Haarschnitt und Styling.' },
  { id: 11, category: 'health',  title: 'Massage Therapie',     provider: 'Wellness Oasis',  price: 89, date: '2025-03-11', time: '10:00', status: 'confirmed',  duration: '60 Min', rating: 4.7, reviews: 94,  description: 'Tiefenentspannende Ganzkörpermassage.' },
  { id: 12, category: 'fitness', title: 'Personal Training',    provider: 'FitPrime Studio', price: 55, date: '2025-02-19', time: '08:00', status: 'completed',  duration: '50 Min', rating: 5.0, reviews: 57,  description: 'Individuell abgestimmtes Training.' },
];

export const MOCK_USER: UserProfile = {
  id: 1,
  firstName: 'Lena',
  lastName: 'Müller',
  email: 'lena.mueller@email.de',
  phone: '+49 151 12345678',
  plan: 'premium',
  stats: { bookings: 12, rating: 4.9, favorites: 4 },
};
