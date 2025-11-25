// src/app/services/reservations.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { backUrl } from '../models/URL/back';

import {
  Reservation,
  ReservationFilters,
  ReservationStats,
  PaginationData,
  ReservationStatus,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private readonly apiUrl = `${backUrl}/api`;

  constructor(private http: HttpClient) {}

  // ---- GET /api/reservations (lista completa, filtrada en front) ----
  getReservations(
    filters: ReservationFilters,
    pagination: PaginationData
  ): Observable<{ data: Reservation[]; pagination: PaginationData }> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`).pipe(
      map((reservations) => {
        const filtered = this.applyFilters(reservations, filters);
        const { data, pagination: pag } = this.applyPagination(
          filtered,
          pagination
        );
        return { data, pagination: pag };
      })
    );
  }

  // ---- GET /api/reservations/:id ----
  getReservationById(id: string): Observable<Reservation | null> {
    return this.http
      .get<Reservation>(`${this.apiUrl}/reservations/${id}`)
      .pipe(map((r) => r ?? null));
  }

  // ---- Stats calculados sobre los datos reales ----
  getReservationStats(): Observable<ReservationStats> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`).pipe(
      map((reservations) => {
        const total = reservations.length;

        const confirmed = reservations.filter((r) =>
          this.matchesStatus(r.status, ReservationStatus.CONFIRMED)
        ).length;

        const cancelled = reservations.filter((r) =>
          this.matchesStatus(r.status, ReservationStatus.CANCELLED)
        ).length;

        const pending = reservations.filter((r) =>
          this.matchesStatus(r.status, ReservationStatus.PENDING)
        ).length;

        return { total, confirmed, cancelled, pending };
      })
    );
  }

  // ---- Helpers internos ----

  private applyFilters(
    reservations: Reservation[],
    filters: ReservationFilters
  ): Reservation[] {
    let result = [...reservations];

    // Status
    if (filters.status && filters.status !== 'all') {
      result = result.filter((r) =>
        this.matchesStatus(r.status, filters.status as string)
      );
    }

    // Date range
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const start = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const end = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

      result = result.filter((r) => {
        const checkIn = new Date(r.checkIn);
        if (start && checkIn < start) return false;
        if (end && checkIn > end) return false;
        return true;
      });
    }

    // Search term (reservationNumber, guestName, status)
    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter((r) => {
        return (
          r.reservationNumber.toLowerCase().includes(term) ||
          (r.guestName ?? '').toLowerCase().includes(term) ||
          String(r.status).toLowerCase().includes(term)
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
    actual: ReservationStatus | string | undefined,
    expected: ReservationStatus | string
  ): boolean {
    if (!actual) return false;
    const a = String(actual).toLowerCase();
    const e = String(expected).toLowerCase();
    return a === e;
  }
}
