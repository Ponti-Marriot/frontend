// src/app/services/payments.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { backUrl } from '../models/URL/back';
import {
  Payment,
  PaymentFilters,
  PaginationData,
  PaymentStats,
} from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  private readonly apiUrl = `${backUrl}/api`;

  constructor(private http: HttpClient) {}

  // ---- Core data from backend ----

  getPayments(
    filters: PaymentFilters,
    pagination: PaginationData
  ): Observable<{ data: Payment[]; pagination: PaginationData }> {
    // 1. Load all payments from backend
    return this.http.get<Payment[]>(`${this.apiUrl}/payments`).pipe(
      map((payments) => {
        // 2. Apply filters in the frontend (pure functions, no mock data)
        const filtered = this.applyPaymentFilters(payments, filters);

        // 3. Apply pagination in the frontend
        const result = this.applyPagination(filtered, pagination);

        return result;
      })
    );
  }

  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/payments/${id}`);
  }

  getPaymentsByReservation(reservationId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.apiUrl}/reservations/${reservationId}/payments`
    );
  }

  // ---- Stats (computed from real data) ----

  getPaymentStats(): Observable<PaymentStats> {
    return this.http.get<Payment[]>(`${this.apiUrl}/payments`).pipe(
      map((payments) => {
        const completed = payments.filter(
          (p) => p.paymentStatus === 'completed'
        );
        const pending = payments.filter((p) => p.paymentStatus === 'pending');
        const failed = payments.filter((p) => p.paymentStatus === 'failed');

        const totalRevenue = completed.reduce(
          (sum, p) => sum + (p.amount ?? 0),
          0
        );

        const stats: PaymentStats = {
          totalRevenue,
          completed: completed.length,
          pending: pending.length,
          failed: failed.length,
        };

        return stats;
      })
    );
  }

  // ---- Export (assumes backend endpoint; no mock data) ----

  exportPayments(filters: PaymentFilters): Observable<Blob> {
    // Optional: pass filters as query params if your backend supports it
    let params = new HttpParams();
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.method) {
      params = params.set('method', filters.method);
    }
    if (filters.dateRange?.start) {
      params = params.set(
        'start',
        filters.dateRange.start.toISOString().substring(0, 10)
      );
    }
    if (filters.dateRange?.end) {
      params = params.set(
        'end',
        filters.dateRange.end.toISOString().substring(0, 10)
      );
    }

    return this.http.get(`${this.apiUrl}/payments/export`, {
      params,
      responseType: 'blob',
    });
  }

  // ---- Filtering & pagination helpers (pure front logic) ----

  private applyPaymentFilters(
    payments: Payment[],
    filters: PaymentFilters
  ): Payment[] {
    let result = [...payments];

    if (filters.status && filters.status !== 'all') {
      result = result.filter((p) => p.paymentStatus === filters.status);
    }

    if (filters.method && filters.method !== 'all') {
      // If you have a "method" field in Payment, filter here
      // result = result.filter((p) => p.method === filters.method);
    }

    if (filters.dateRange?.start) {
      const startTime = filters.dateRange.start.getTime();
      result = result.filter(
        (p) => new Date(p.createdAt).getTime() >= startTime
      );
    }

    if (filters.dateRange?.end) {
      const endTime = filters.dateRange.end.getTime();
      result = result.filter((p) => new Date(p.createdAt).getTime() <= endTime);
    }

    if (filters.searchTerm && filters.searchTerm.trim().length > 0) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter((p) =>
        (p.transactionId ?? '').toLowerCase().includes(term)
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
}
