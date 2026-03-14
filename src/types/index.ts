export type OfferStatus = 'available' | 'last_spot' | 'booked' | 'confirmed' | 'completed';
export type CategoryId  = 'all' | 'beauty' | 'health' | 'fitness' | 'home' | 'auto';
export type PaymentMethod = 'card' | 'paypal' | 'invoice';

export interface Offer {
  id: number;
  category: CategoryId;
  title: string;
  provider: string;
  price: number;
  originalPrice: number | null;
  date: string;
  time: string;
  status: OfferStatus;
  rating: number;
  reviews: number;
  duration: string;
  tags: string[];
  description: string;
}

export interface TimeSlot { date: string; time: string; available: boolean; }

export interface Booking {
  id: number;
  offerId: number;
  category: CategoryId;
  title: string;
  provider: string;
  price: number;
  date: string;
  time: string;
  status: OfferStatus;
  duration: string;
  rating: number;
  reviews: number;
  description: string;
  paymentMethod: PaymentMethod;
  bookedAt: string;
}

export interface BookingDraft {
  offerId: number;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  agbAccepted: boolean;
}

export interface Category { id: CategoryId; label: string; icon: string; grad: string; }

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  plan: 'free' | 'premium';
  stats: { bookings: number; rating: number; favorites: number; };
}

export interface StatusConfig { label: string; color: string; bg: string; }
export interface ApiResponse<T> { data: T; message?: string; }
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
