// src/app/features/dashboard/models/guest.model.ts

export interface Guest {
  id: string;
  guestId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: GuestStatus;
  room: GuestRoom;
  checkIn: Date;
  checkOut: Date;
  nationality?: string;
  documentType?: string;
  documentNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  emergencyContact?: EmergencyContact;
  preferences?: GuestPreferences;
  loyaltyTier?: LoyaltyTier;
  totalStays?: number;
  totalSpent?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestRoom {
  number: string;
  type: string;
  floor?: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface GuestPreferences {
  bedType?: 'King' | 'Queen' | 'Twin' | 'Double';
  smokingRoom?: boolean;
  floorPreference?: 'High' | 'Low' | 'Any';
  specialRequests?: string;
}

export enum GuestStatus {
  VIP_ACTIVE = 'VIP Active',
  ACTIVE = 'Active',
  NEW = 'New',
  CHECKED_OUT = 'Checked Out',
  CANCELLED = 'Cancelled',
  BLACKLISTED = 'Blacklisted',
}

export enum LoyaltyTier {
  PLATINUM = 'Platinum',
  GOLD = 'Gold',
  SILVER = 'Silver',
  BRONZE = 'Bronze',
  STANDARD = 'Standard',
}

export interface GuestStats {
  totalGuests: number;
  activeGuests: number;
  vipGuests: number;
  newToday: number;
}

export interface GuestFilters {
  status?: GuestStatus | 'all';
  roomType?: string | 'all';
  searchTerm?: string;
  loyaltyTier?: LoyaltyTier | 'all';
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
