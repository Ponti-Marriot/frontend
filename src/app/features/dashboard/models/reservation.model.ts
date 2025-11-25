export enum ReservationStatus {
  CONFIRMED = 'Confirmed',
  CHECK_IN = 'Check-in',
  CHECK_OUT = 'Check-out',
  CANCELLED = 'Cancelled',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  NO_SHOW = 'No Show',
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  status: ReservationStatus | string;
  checkIn: string;
  checkOut: string;
  guestName?: string;
  roomId?: string;
  hotelId?: string;
  totalAmount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationFilters {
  status?: ReservationStatus | 'all';
  dateRange?: { start?: Date; end?: Date };
  searchTerm?: string;
}

export interface ReservationStats {
  total: number;
  confirmed: number;
  cancelled: number;
  pending: number;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
