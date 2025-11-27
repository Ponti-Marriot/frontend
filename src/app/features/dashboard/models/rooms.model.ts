export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  MAINTENANCE = 'Maintenance',
}

export interface Room {
  id: string;

  // Base
  title?: string;
  description?: string;

  // AHORA roomType es string (no objeto)
  roomType?: string;

  createdAt?: string;
  updatedAt?: string;

  // Campos agregados desde backend
  roomNumber?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;

  status?: RoomStatus | string;

  hotel?: {
    id: string;
    name?: string;
    city?: string;
    region?: string;
    country?: string;
  };

  currentGuest?: string;
  checkOutDate?: string;
}

export interface RoomFilters {
  region?: string;
  hotel?: string;
  status?: string;
  roomType?: string;
  searchTerm?: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface RoomStats {
  totalRooms: number;
  available: number;
  occupied: number;
  reserved: number;
  avgRatePerNight: number;
}

export interface CreateRoomRequest {
  hotel_property_id: string;
  room_type: string;
  price_per_night: number;
  bedrooms?: number;
  bathrooms?: number;
}
