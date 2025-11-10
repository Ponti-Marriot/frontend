// src/app/core/services/dashboard/rooms.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Room,
  RoomStats,
  RoomStatus,
  RoomTypeStats,
  RoomReservation,
  RoomFilters,
  PaginationData,
  Hotel,
  BedType,
} from '../models/rooms.model';

@Injectable({
  providedIn: 'root',
})
export class RoomsService {
  private mockRooms: Room[] = this.generateMockRooms();
  private mockHotels: Hotel[] = this.generateMockHotels();

  getStats(): Observable<RoomStats> {
    const stats: RoomStats = {
      totalRooms: 248,
      available: 186,
      occupied: 62,
      avgRatePerNight: 320,
    };
    return of(stats).pipe(delay(300));
  }

  getRoomTypeStats(): Observable<RoomTypeStats[]> {
    const stats: RoomTypeStats[] = [
      {
        type: 'Single Room',
        totalRooms: 82,
        available: 64,
        ratePerNight: 180,
        image:
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
        description: 'Perfect for solo travelers',
      },
      {
        type: 'Double Room',
        totalRooms: 122,
        available: 89,
        ratePerNight: 280,
        image:
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
        description: 'Perfect for solo travelers',
      },
      {
        type: 'Family Suit',
        totalRooms: 42,
        available: 33,
        ratePerNight: 480,
        image:
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
        description: 'Perfect for solo travelers',
      },
    ];
    return of(stats).pipe(delay(300));
  }

  getRecentReservations(): Observable<RoomReservation[]> {
    const reservations: RoomReservation[] = [
      {
        id: '1',
        guest: 'Ramon Ridwan',
        roomType: 'Double Room',
        room: 'Suite 501 - Family',
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-18'),
        status: 'Confirmed',
        total: 840,
      },
      {
        id: '2',
        guest: 'Ramon Ridwan',
        roomType: 'Single Room',
        room: 'Suite 501 - Family',
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-18'),
        status: 'Processing',
        total: 360,
      },
      {
        id: '3',
        guest: 'Ramon Ridwan',
        roomType: 'Single Room',
        room: 'Suite 501 - Family',
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-18'),
        status: 'Confirmed',
        total: 180,
      },
      {
        id: '4',
        guest: 'Ramon Ridwan',
        roomType: 'Family Room',
        room: 'Suite 501 - Family',
        checkIn: new Date('2024-01-15'),
        checkOut: new Date('2024-01-18'),
        status: 'Canceled',
        total: 1250,
      },
    ];
    return of(reservations).pipe(delay(300));
  }

  getHotels(): Observable<Hotel[]> {
    return of(this.mockHotels).pipe(delay(300));
  }

  getRooms(
    filters: RoomFilters,
    pagination: PaginationData
  ): Observable<{ data: Room[]; pagination: PaginationData }> {
    let filtered = [...this.mockRooms];

    // Apply filters
    if (filters.hotel) {
      filtered = filtered.filter((r) => r.hotel.id === filters.hotel);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.roomType && filters.roomType !== 'all') {
      filtered = filtered.filter((r) => r.roomType.name === filters.roomType);
    }

    if (filters.floor && filters.floor !== 'all') {
      filtered = filtered.filter((r) => r.floor === filters.floor);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.roomNumber.toLowerCase().includes(term) ||
          r.roomType.name.toLowerCase().includes(term)
      );
    }

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const data = filtered.slice(start, end);

    return of({
      data,
      pagination: { ...pagination, totalItems, totalPages },
    }).pipe(delay(500));
  }

  updateRoomStatus(id: string, status: RoomStatus): Observable<Room> {
    const room = this.mockRooms.find((r) => r.id === id);
    if (room) {
      room.status = status;
      room.updatedAt = new Date();
    }
    return of(room!).pipe(delay(500));
  }

  private generateMockHotels(): Hotel[] {
    return [
      {
        id: 'hotel-1',
        name: 'Ponti Marriott New York',
        city: 'New York',
        country: 'USA',
        address: '123 Manhattan Ave',
        totalRooms: 150,
      },
      {
        id: 'hotel-2',
        name: 'Ponti Marriott Los Angeles',
        city: 'Los Angeles',
        country: 'USA',
        address: '456 Hollywood Blvd',
        totalRooms: 98,
      },
    ];
  }

  private generateMockRooms(): Room[] {
    const statuses = Object.values(RoomStatus);
    const roomTypes = [
      {
        id: '1',
        name: 'Single Room',
        description: 'Perfect for solo travelers',
        basePrice: 180,
        image: '',
        features: ['WiFi', 'TV', 'AC'],
      },
      {
        id: '2',
        name: 'Double Room',
        description: 'Ideal for couples',
        basePrice: 280,
        image: '',
        features: ['WiFi', 'TV', 'AC', 'Mini Bar'],
      },
      {
        id: '3',
        name: 'Family Suit',
        description: 'Spacious for families',
        basePrice: 480,
        image: '',
        features: ['WiFi', 'TV', 'AC', 'Kitchen', 'Living Room'],
      },
    ];

    return Array.from({ length: 248 }, (_, i) => {
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const floor = Math.floor(Math.random() * 15) + 1;
      const roomNum = `${floor}${(Math.floor(Math.random() * 20) + 1)
        .toString()
        .padStart(2, '0')}`;
      const hotel =
        this.mockHotels[Math.floor(Math.random() * this.mockHotels.length)];

      return {
        id: `room-${i + 1}`,
        roomNumber: roomNum,
        roomType,
        hotel,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        floor,
        price: roomType.basePrice,
        capacity:
          roomType.name === 'Single Room'
            ? 1
            : roomType.name === 'Double Room'
            ? 2
            : 4,
        beds: {
          type: roomType.name === 'Single Room' ? BedType.SINGLE : BedType.KING,
          quantity: roomType.name === 'Family Suit' ? 2 : 1,
        },
        amenities: roomType.features,
        images: [roomType.image],
        description: roomType.description,
        size: Math.floor(Math.random() * 30) + 20,
        view: Math.random() > 0.5 ? 'City View' : 'Ocean View',
        lastCleaned: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
  }
}
