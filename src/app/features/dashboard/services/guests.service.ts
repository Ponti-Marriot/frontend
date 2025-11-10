// src/app/core/services/dashboard/guests.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Guest,
  GuestStats,
  GuestStatus,
  LoyaltyTier,
  GuestFilters,
  PaginationData,
} from '../models/guest.model';

@Injectable({
  providedIn: 'root',
})
export class GuestsService {
  private mockGuests: Guest[] = this.generateMockData();

  getStats(): Observable<GuestStats> {
    const stats: GuestStats = {
      totalGuests: 1247,
      activeGuests: 342,
      vipGuests: 94,
      newToday: 23,
    };
    return of(stats).pipe(delay(300));
  }

  getGuests(
    filters: GuestFilters,
    pagination: PaginationData
  ): Observable<{ data: Guest[]; pagination: PaginationData }> {
    let filtered = [...this.mockGuests];

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((g) => g.status === filters.status);
    }

    if (filters.roomType && filters.roomType !== 'all') {
      filtered = filtered.filter((g) => g.room.type === filters.roomType);
    }

    if (filters.loyaltyTier && filters.loyaltyTier !== 'all') {
      filtered = filtered.filter((g) => g.loyaltyTier === filters.loyaltyTier);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(term) ||
          g.email.toLowerCase().includes(term) ||
          g.guestId.toLowerCase().includes(term) ||
          g.phone.includes(term)
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

  getGuestById(id: string): Observable<Guest | null> {
    const guest = this.mockGuests.find((g) => g.id === id);
    return of(guest || null).pipe(delay(300));
  }

  updateGuestStatus(id: string, status: GuestStatus): Observable<Guest> {
    const guest = this.mockGuests.find((g) => g.id === id);
    if (guest) {
      guest.status = status;
      guest.updatedAt = new Date();
    }
    return of(guest!).pipe(delay(500));
  }

  deleteGuest(id: string): Observable<boolean> {
    const index = this.mockGuests.findIndex((g) => g.id === id);
    if (index > -1) {
      this.mockGuests.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  private generateMockData(): Guest[] {
    const statuses = Object.values(GuestStatus);
    const roomTypes = [
      'Single Room',
      'Double Room',
      'Suite',
      'Family Room',
      'Deluxe Room',
    ];
    const loyaltyTiers = Object.values(LoyaltyTier);
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
      'Robert Davis',
      'Olivia Martinez',
      'William Moore',
      'Ava Thomas',
    ];

    return Array.from({ length: 97 }, (_, i) => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() - Math.floor(Math.random() * 15));
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 7) + 1);

      const guestName = names[Math.floor(Math.random() * names.length)];
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const roomNumber = `${Math.floor(Math.random() * 8) + 1}${(
        Math.floor(Math.random() * 20) + 1
      )
        .toString()
        .padStart(2, '0')}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const loyaltyTier =
        loyaltyTiers[Math.floor(Math.random() * loyaltyTiers.length)];

      return {
        id: `guest-${i + 1}`,
        guestId: `#GU${(i + 1).toString().padStart(4, '0')}`,
        name: guestName,
        email: `${guestName.toLowerCase().replace(' ', '.')}@gmail.com`,
        phone: `+1-234-567-${Math.floor(Math.random() * 9000) + 1000}`,
        avatar: '',
        status,
        room: {
          number: roomNumber,
          type: roomType,
          floor: parseInt(roomNumber[0]),
        },
        checkIn,
        checkOut,
        nationality: 'USA',
        documentType: 'Passport',
        documentNumber: `P${Math.floor(Math.random() * 900000) + 100000}`,
        address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        city: 'New York',
        country: 'United States',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        emergencyContact: {
          name: 'Emergency Contact',
          phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
          relationship: 'Family',
        },
        preferences: {
          bedType: 'King',
          smokingRoom: false,
          floorPreference: 'High',
          specialRequests: Math.random() > 0.7 ? 'Late check-in' : undefined,
        },
        loyaltyTier,
        totalStays: Math.floor(Math.random() * 50) + 1,
        totalSpent: Math.floor(Math.random() * 50000) + 1000,
        createdAt: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      };
    });
  }
}
