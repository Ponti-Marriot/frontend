import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { backUrl } from '../models/URL/back';

import {
  Room,
  RoomFilters,
  RoomStats,
  RoomTypeStats,
  RoomReservation,
  AvailabilityDates,
  RoomService as RoomServiceModel,
  PaginationData,
  RoomStatus,
} from '../models/rooms.model';

@Injectable({
  providedIn: 'root',
})
export class RoomsService {
  private readonly apiUrl = `${backUrl}/api`;

  constructor(private http: HttpClient) {}

  // ---- Read rooms from backend ----

  getRooms(
    filters: RoomFilters,
    pagination: PaginationData
  ): Observable<{ data: Room[]; pagination: PaginationData }> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`).pipe(
      map((rooms) => {
        const filtered = this.applyRoomFilters(rooms, filters);
        const { data, pagination: pag } = this.applyPagination(
          filtered,
          pagination
        );
        return { data, pagination: pag };
      })
    );
  }

  getRoomById(id: string): Observable<Room | null> {
    return this.http
      .get<Room>(`${this.apiUrl}/rooms/${id}`)
      .pipe(map((room) => room ?? null));
  }

  getRoomsByHotel(hotelId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/hotels/${hotelId}/rooms`);
  }

  getRoomAvailability(roomId: string): Observable<AvailabilityDates[]> {
    return this.http.get<AvailabilityDates[]>(
      `${this.apiUrl}/rooms/${roomId}/availability`
    );
  }

  getRoomServices(roomId: string): Observable<RoomServiceModel[]> {
    return this.http.get<RoomServiceModel[]>(
      `${this.apiUrl}/rooms/${roomId}/services`
    );
  }

  // ---- Stats built on real data ----

  getStats(): Observable<RoomStats> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`).pipe(
      map((rooms) => {
        const totalRooms = rooms.length;

        const available = rooms.filter((r) =>
          this.matchesStatus(r.status, RoomStatus.AVAILABLE)
        ).length;

        const occupied = rooms.filter((r) =>
          this.matchesStatus(r.status, RoomStatus.OCCUPIED)
        ).length;

        const reserved = rooms.filter((r) =>
          this.matchesStatus(r.status, RoomStatus.RESERVED)
        ).length;

        const avgRatePerNight =
          rooms.reduce((sum, r) => sum + (r.price ?? 0), 0) /
          (rooms.length || 1);

        return {
          totalRooms,
          available,
          occupied,
          reserved,
          avgRatePerNight,
        };
      })
    );
  }

  getRoomTypeStats(): Observable<RoomTypeStats[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`).pipe(
      map((rooms) => {
        const statsMap = new Map<string, RoomTypeStats>();

        rooms.forEach((room) => {
          const typeName = room.roomType?.name ?? 'Unknown';
          const key = room.roomType?.id ?? typeName;
          const entry = statsMap.get(key) ?? {
            type: typeName,
            count: 0,
            totalRooms: 0,
            ratePerNight: 0,
          };
          entry.count += 1;
          entry.totalRooms += 1;
          entry.ratePerNight += room.price ?? 0;
          statsMap.set(key, entry);
        });

        return Array.from(statsMap.values()).map((s) => ({
          ...s,
          ratePerNight: s.ratePerNight / (s.count || 1),
        }));
      })
    );
  }

  // Opcional si implementas un endpoint:
  // GET /api/rooms/recent-reservations
  getRecentReservations(): Observable<RoomReservation[]> {
    return this.http.get<RoomReservation[]>(
      `${this.apiUrl}/rooms/recent-reservations`
    );
  }

  // ---- Filtering & pagination helpers ----

  private applyRoomFilters(rooms: Room[], filters: RoomFilters): Room[] {
    let result = [...rooms];

    if (filters.region && filters.region !== 'all') {
      result = result.filter((r) => r.hotel?.region === filters.region);
    }

    if (filters.hotel && filters.hotel !== 'all') {
      result = result.filter((r) => r.hotel?.id === filters.hotel);
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter((r) =>
        this.matchesStatus(r.status, filters.status!)
      );
    }

    if (filters.roomType && filters.roomType !== 'all') {
      result = result.filter((r) => r.roomType?.id === filters.roomType);
    }

    if (filters.floor && filters.floor !== 'all') {
      result = result.filter((r) => r.floor === filters.floor);
    }

    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter((r) => {
        return (
          (r.roomNumber ?? '').toLowerCase().includes(term) ||
          (r.title ?? '').toLowerCase().includes(term) ||
          (r.description ?? '').toLowerCase().includes(term) ||
          (r.hotel?.name ?? '').toLowerCase().includes(term) ||
          (r.roomType?.name ?? '').toLowerCase().includes(term)
        );
      });
    }

    return result;
  }

  private applyPagination<T>(
    items: T[],
    pagination: PaginationData
  ): { data: T[]; pagination: PaginationData } {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize || 1);
    const currentPage = Math.max(1, Math.min(pagination.page, totalPages));

    const start = (currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    const data = items.slice(start, end);

    return {
      data,
      pagination: {
        ...pagination,
        page: currentPage,
        totalItems,
        totalPages,
      },
    };
  }

  private matchesStatus(
    actual: RoomStatus | string | undefined,
    expected: RoomStatus | string
  ): boolean {
    if (!actual) return false;
    const a = String(actual).toLowerCase();
    const e = String(expected).toLowerCase();
    return a === e;
  }
}
