import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { backUrl } from '../models/URL/back';
import { HotelProperty, Location } from '../models/settings.model';
import {
  Room,
  RoomFilters,
  PaginationData,
  CreateRoomRequest,
} from '../models/rooms.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiUrl = `${backUrl}/api`;

  constructor(private http: HttpClient) {}

  // ---- Hotels ----

  getHotels(): Observable<HotelProperty[]> {
    return this.http.get<HotelProperty[]>(`${this.apiUrl}/hotels`);
  }

  getHotelById(id: string): Observable<HotelProperty | null> {
    return this.http
      .get<HotelProperty>(`${this.apiUrl}/hotels/${id}`)
      .pipe(map((h) => h ?? null));
  }

  // ---- Rooms grouped by hotel ----

  getRoomsByHotel(hotelId: string): Observable<Room[]> {
    // ahora el endpoint es /rooms/hotel/{hotelId}
    return this.http.get<Room[]>(`${this.apiUrl}/rooms/hotel/${hotelId}`);
  }

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

  // ---- CRUD Rooms ----

  createRoom(hotelId: string, payload: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(
      `${this.apiUrl}/rooms/hotel/${hotelId}`,
      payload
    );
  }

  updateRoom(roomId: string, payload: CreateRoomRequest): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/rooms/${roomId}`, payload);
  }

  deleteRoom(roomId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rooms/${roomId}`);
  }

  // ---- Locations ----

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`);
  }

  getLocationById(id: string): Observable<Location | null> {
    return this.http
      .get<Location>(`${this.apiUrl}/locations/${id}`)
      .pipe(map((loc) => loc ?? null));
  }

  // ---- Helpers ----

  private applyRoomFilters(rooms: Room[], filters: RoomFilters): Room[] {
    let result = [...rooms];

    // By hotel
    if (filters.hotel && filters.hotel !== 'all') {
      result = result.filter((r) => r.hotel?.id === filters.hotel);
    }

    // By status
    if (filters.status && filters.status !== 'all') {
      result = result.filter((r) => r.status === filters.status);
    }

    // By room type (ahora es string, no objeto)
    if (filters.roomType && filters.roomType !== 'all') {
      result = result.filter((r) => r.roomType === filters.roomType);
    }

    // (Se elimina filtro por floor porque RoomFilters ya no tiene 'floor')

    // By search
    if (filters.searchTerm?.trim()) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.roomNumber?.toLowerCase().includes(term) ||
          r.description?.toLowerCase().includes(term)
      );
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
    const data = items.slice(start, start + pagination.pageSize);

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
}
