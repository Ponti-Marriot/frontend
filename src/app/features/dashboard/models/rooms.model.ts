export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  MAINTENANCE = 'Maintenance',
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
}

export interface Room {
  id: string;

  // Campos base de la tabla rooms
  title?: string;
  description?: string;
  roomType?: RoomType;
  availabilityDatesId?: string;
  createdAt?: string;
  updatedAt?: string;

  // Campos de UI / agregados desde el back
  status?: RoomStatus | string;
  roomNumber?: string;
  floor?: string;
  price?: number;

  hotel?: {
    id: string;
    name?: string;
    locationName?: string; // ciudad / sucursal
    region?: string; // ej. "Andean", "Caribbean", etc.
  };

  currentGuest?: string;
  checkOutDate?: string; // ISO string para "Current Guest"
}

export interface AvailabilityDates {
  id: string;
  roomId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  createdAt: string;
}

export interface RoomService {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface RoomReservation {
  id: string;
  reservationNumber: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  roomNumber?: string;
  hotelName?: string;
}

export interface RoomStats {
  totalRooms: number;
  available: number;
  occupied: number;
  reserved: number;
  avgRatePerNight: number;
}

export interface RoomTypeStats {
  type: string;
  count: number;
  totalRooms: number;
  ratePerNight: number;
}

export interface RoomFilters {
  region?: string;
  hotel?: string;
  status?: string;
  roomType?: string;
  floor?: string;
  searchTerm?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
