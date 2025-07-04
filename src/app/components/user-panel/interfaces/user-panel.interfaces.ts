// =============================================================================
// INTERFACES - UserPanel Component
// =============================================================================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate?: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  avatar?: string;
  stats: UserStats;
  preferences: UserPreferences;
}

export interface UserStats {
  trips: number;
  countries: number;
  rating: number;
}

export interface UserPreferences {
  travelStyle: 'luxury' | 'comfort' | 'budget' | 'adventure';
  accommodation: 'hotel' | 'apartment' | 'hostel' | 'resort';
}

export interface Booking {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  guests: number;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  imageUrl: string;
}

export interface Favorite {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface TabItem {
  id: UserPanelTab;
  label: string;
  icon: string;
  active: boolean;
}

export interface BookingFilter {
  id: string;
  label: string;
  value: 'all' | 'upcoming' | 'completed' | 'cancelled';
  active: boolean;
}

export type UserPanelTab = 'personal' | 'bookings' | 'favorites' | 'payments' | 'security' | 'notifications';

export interface UserPanelConfig {
  showStats: boolean;
  allowAvatarEdit: boolean;
  enableNotifications: boolean;
}