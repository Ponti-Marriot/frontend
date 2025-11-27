// src/app/models/reservation.model.ts

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface ReservationSummary {
  id: string;
  reservationNumber: string;
  guestName: string | null;
  checkIn: string; // ISO
  checkOut: string; // ISO
  totalAmount: number;
  status: ReservationStatus | string;
}

export interface ReservationDetails extends ReservationSummary {
  guestId?: string | null;
  observations?: string | null;
  cancelledAt?: string | null;
  currency?: string | null;

  roomId?: string;
  roomTitle?: string;
  roomType?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  pricePerNight?: number | null;

  hotelId?: string;
  hotelName?: string;
  hotelAddress?: string;
  city?: string;
  country?: string;
  region?: string;
}
