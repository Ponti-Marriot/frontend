// src/app/features/dashboard/services/reservations.service.ts

import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Reservation,
  ReservationStats,
  ReservationStatus,
  RoomType,
  ReservationFilters,
  PaginationData,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private mockReservations: Reservation[] = this.generateMockData();

  getStats(): Observable<ReservationStats> {
    const stats: ReservationStats = {
      totalReservations: 2847,
      checkInsToday: 127,
      checkOutsToday: 94,
      revenueToday: 48920,
      totalChange: '+12% from last month',
      checkInPending: 23,
      checkOutOverdue: 7,
      revenueChange: '+8% vs yesterday',
    };
    return of(stats).pipe(delay(300));
  }

  getReservations(
    filters: ReservationFilters,
    pagination: PaginationData
  ): Observable<{ data: Reservation[]; pagination: PaginationData }> {
    let filtered = [...this.mockReservations];

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.roomType && filters.roomType !== 'all') {
      filtered = filtered.filter((r) => r.room.type === filters.roomType);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.guest.name.toLowerCase().includes(term) ||
          r.guest.email.toLowerCase().includes(term) ||
          r.reservationNumber.toLowerCase().includes(term) ||
          r.room.number.toLowerCase().includes(term)
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(
        (r) =>
          r.checkIn >= filters.dateRange!.start &&
          r.checkIn <= filters.dateRange!.end
      );
    }

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const data = filtered.slice(start, end);

    const result = {
      data,
      pagination: {
        ...pagination,
        totalItems,
        totalPages,
      },
    };

    return of(result).pipe(delay(500));
  }

  getReservationById(id: string): Observable<Reservation | null> {
    const reservation = this.mockReservations.find((r) => r.id === id);
    return of(reservation || null).pipe(delay(300));
  }

  updateReservationStatus(
    id: string,
    status: ReservationStatus
  ): Observable<Reservation> {
    const reservation = this.mockReservations.find((r) => r.id === id);
    if (reservation) {
      reservation.status = status;
      reservation.updatedAt = new Date();
    }
    return of(reservation!).pipe(delay(500));
  }

  deleteReservation(id: string): Observable<boolean> {
    const index = this.mockReservations.findIndex((r) => r.id === id);
    if (index > -1) {
      this.mockReservations.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  private generateMockData(): Reservation[] {
    const statuses = Object.values(ReservationStatus);
    const roomTypes = Object.values(RoomType);
    const names = [
      'Ramon Ridwan',
      'Maria Garcia',
      'John Smith',
      'Ana Martinez',
      'Carlos Rodriguez',
      'Sofia Chen',
      'Michael Brown',
      'Laura Wilson',
      'David Lee',
      'Emma Johnson',
      'James Taylor',
      'Isabella Anderson',
    ];

    return Array.from({ length: 97 }, (_, i) => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30) - 15);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 1);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      const guestName = names[Math.floor(Math.random() * names.length)];
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const roomNumber = `${Math.floor(Math.random() * 8) + 1}${(
        Math.floor(Math.random() * 20) + 1
      )
        .toString()
        .padStart(2, '0')}`;

      return {
        id: `res-${i + 1}`,
        reservationNumber: `#RES-2024-${(i + 1).toString().padStart(3, '0')}`,
        guest: {
          id: `guest-${i + 1}`,
          name: guestName,
          email: `${guestName.toLowerCase().replace(' ', '.')}@gmail.com`,
          phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
          avatar: '',
          nationality: 'USA',
          documentType: 'Passport',
          documentNumber: `P${Math.floor(Math.random() * 900000) + 100000}`,
        },
        room: {
          id: `room-${roomNumber}`,
          number: roomNumber,
          type: roomType,
          floor: parseInt(roomNumber[0]),
          features: ['WiFi', 'TV', 'Air Conditioning'],
        },
        checkIn,
        checkOut,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total: Math.floor(Math.random() * 1500) + 200,
        nights,
        guests: Math.floor(Math.random() * 4) + 1,
        specialRequests:
          Math.random() > 0.7 ? 'Late check-in requested' : undefined,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      };
    });
  }
}
