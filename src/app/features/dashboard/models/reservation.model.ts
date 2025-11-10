// src/app/features/dashboard/models/reservation.model.ts

export interface Reservation {
  id: string;
  reservationNumber: string;
  guest: Guest;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  status: ReservationStatus;
  total: number;
  nights: number;
  guests: number;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  nationality?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor?: number;
  features?: string[];
}

export enum RoomType {
  SINGLE = 'Single Room',
  DOUBLE = 'Double Room',
  SUITE = 'Suite',
  FAMILY = 'Family Room',
  DELUXE = 'Deluxe Room',
  PRESIDENTIAL = 'Presidential Suite',
}

export enum ReservationStatus {
  CONFIRMED = 'Confirmed',
  CHECK_IN = 'Check-in',
  CHECK_OUT = 'Check-out',
  CANCELLED = 'Cancelled',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  NO_SHOW = 'No Show',
}

export interface ReservationStats {
  totalReservations: number;
  checkInsToday: number;
  checkOutsToday: number;
  revenueToday: number;
  totalChange: string;
  checkInPending: number;
  checkOutOverdue: number;
  revenueChange: string;
}

export interface ReservationFilters {
  status?: ReservationStatus | 'all';
  roomType?: RoomType | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
