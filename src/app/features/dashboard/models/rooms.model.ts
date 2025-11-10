// src/app/features/dashboard/models/room.model.ts

export interface Room {
  id: string;
  roomNumber: string;
  roomType: RoomType;
  hotel: Hotel;
  status: RoomStatus;
  floor: number;
  price: number;
  capacity: number;
  beds: BedConfiguration;
  amenities: string[];
  images: string[];
  description: string;
  size: number; // in square meters
  view?: string;
  lastCleaned?: Date;
  maintenanceNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  totalRooms: number;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  features: string[];
}

export interface BedConfiguration {
  type: BedType;
  quantity: number;
}

export enum BedType {
  KING = 'King',
  QUEEN = 'Queen',
  DOUBLE = 'Double',
  SINGLE = 'Single',
  TWIN = 'Twin',
}

export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  MAINTENANCE = 'Maintenance',
  CLEANING = 'Cleaning',
  OUT_OF_SERVICE = 'Out of Service',
}

export interface RoomStats {
  totalRooms: number;
  available: number;
  occupied: number;
  avgRatePerNight: number;
}

export interface RoomTypeStats {
  type: string;
  totalRooms: number;
  available: number;
  ratePerNight: number;
  image: string;
  description: string;
}

export interface RoomReservation {
  id: string;
  guest: string;
  avatar?: string;
  roomType: string;
  room: string;
  checkIn: Date;
  checkOut: Date;
  status: 'Confirmed' | 'Processing' | 'Canceled';
  total: number;
}

export interface RoomFilters {
  hotel?: string;
  status?: RoomStatus | 'all';
  roomType?: string | 'all';
  floor?: number | 'all';
  searchTerm?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
