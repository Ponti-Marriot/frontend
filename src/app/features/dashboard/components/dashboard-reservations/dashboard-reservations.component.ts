// src/app/dashboard/dashboard-reservations.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  Reservation,
  ReservationFilters,
  ReservationStats,
  PaginationData,
  ReservationStatus,
} from '../../models/reservation.model';
import { ReservationsService } from '../../services/reservations.service';

interface StatCard {
  title: string;
  value: string;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon: string; // PrimeIcons class
}

@Component({
  selector: 'app-dashboard-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-reservations.component.html',
})
export class DashboardReservationsComponent implements OnInit {
  constructor(private reservationsService: ReservationsService) {}

  // ---- State ----
  readonly reservations = signal<Reservation[]>([]);

  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly totalPages = signal<number>(1);

  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<'all' | ReservationStatus>('all');
  readonly selectedDateRange = signal<string>('all'); // 'all' | 'today' | '7d' | '30d'

  readonly stats = signal<ReservationStats | null>(null);

  // ---- Options ----
  statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Confirmed', value: ReservationStatus.CONFIRMED },
    { label: 'Check-in', value: ReservationStatus.CHECK_IN },
    { label: 'Check-out', value: ReservationStatus.CHECK_OUT },
    { label: 'Pending', value: ReservationStatus.PENDING },
    { label: 'Cancelled', value: ReservationStatus.CANCELLED },
    { label: 'Completed', value: ReservationStatus.COMPLETED },
    { label: 'No Show', value: ReservationStatus.NO_SHOW },
  ];

  dateRangeOptions = [
    { label: 'All time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
  ];

  // ---- Stat cards ----
  readonly statCards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) {
      return [
        {
          title: 'Total Reservations',
          value: '0',
          subtitle: '',
          color: 'blue',
          icon: 'pi pi-calendar',
        },
        {
          title: 'Confirmed',
          value: '0',
          subtitle: '',
          color: 'green',
          icon: 'pi pi-check-circle',
        },
        {
          title: 'Pending',
          value: '0',
          subtitle: '',
          color: 'yellow',
          icon: 'pi pi-clock',
        },
        {
          title: 'Cancelled',
          value: '0',
          subtitle: '',
          color: 'red',
          icon: 'pi pi-times-circle',
        },
      ];
    }

    return [
      {
        title: 'Total Reservations',
        value: s.total.toString(),
        subtitle: '',
        color: 'blue',
        icon: 'pi pi-calendar',
      },
      {
        title: 'Confirmed',
        value: s.confirmed.toString(),
        subtitle: '',
        color: 'green',
        icon: 'pi pi-check-circle',
      },
      {
        title: 'Pending',
        value: s.pending.toString(),
        subtitle: '',
        color: 'yellow',
        icon: 'pi pi-clock',
      },
      {
        title: 'Cancelled',
        value: s.cancelled.toString(),
        subtitle: '',
        color: 'red',
        icon: 'pi pi-times-circle',
      },
    ];
  });

  ngOnInit(): void {
    this.loadStats();
    this.loadReservations();
  }

  // ---- Data loading ----

  private buildDateRangeFromSelected(): ReservationFilters['dateRange'] {
    const v = this.selectedDateRange();

    if (v === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (v === '7d' || v === '30d') {
      const days = v === '7d' ? 7 : 30;
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    return undefined;
  }

  private loadReservations(): void {
    const filters: ReservationFilters = {
      status: this.selectedStatus(),
      dateRange: this.buildDateRangeFromSelected(),
      searchTerm: this.searchTerm(),
    };

    const pagination: PaginationData = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      totalItems: 0,
      totalPages: 0,
    };

    this.reservationsService.getReservations(filters, pagination).subscribe({
      next: (res) => {
        this.reservations.set(res.data);
        this.currentPage.set(res.pagination.page);
        this.pageSize.set(res.pagination.pageSize);
        this.totalItems.set(res.pagination.totalItems);
        this.totalPages.set(res.pagination.totalPages);
      },
      error: (err) => {
        console.error('Error loading reservations', err);
        this.reservations.set([]);
        this.totalItems.set(0);
        this.totalPages.set(1);
      },
    });
  }

  private loadStats(): void {
    this.reservationsService.getReservationStats().subscribe({
      next: (s) => this.stats.set(s),
      error: (err) => {
        console.error('Error loading reservation stats', err);
        this.stats.set(null);
      },
    });
  }

  // ---- Filters & pagination ----

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadReservations();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
    this.selectedDateRange.set('all');
    this.currentPage.set(1);
    this.loadReservations();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadReservations();
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [];
    pages.push(1);

    let start = Math.max(2, current - 1);
    let end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push(-1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) pages.push(-1);

    pages.push(total);
    return pages;
  }

  // ---- Template helpers ----

  formatDate(iso: string | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  formatCurrency(amount: number | undefined): string {
    const num = amount ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  }

  getStatusClass(status: string | ReservationStatus | undefined): string {
    const s = String(status ?? '').toLowerCase();
    if (s === ReservationStatus.CONFIRMED.toLowerCase()) {
      return 'bg-blue-100 text-blue-800';
    }
    if (s === ReservationStatus.CHECK_IN.toLowerCase()) {
      return 'bg-green-100 text-green-800';
    }
    if (s === ReservationStatus.CHECK_OUT.toLowerCase()) {
      return 'bg-gray-100 text-gray-800';
    }
    if (s === ReservationStatus.PENDING.toLowerCase()) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (s === ReservationStatus.CANCELLED.toLowerCase()) {
      return 'bg-red-100 text-red-800';
    }
    if (s === ReservationStatus.COMPLETED.toLowerCase()) {
      return 'bg-emerald-100 text-emerald-800';
    }
    if (s === ReservationStatus.NO_SHOW.toLowerCase()) {
      return 'bg-orange-100 text-orange-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ---- Actions (por ahora logs; luego los conectas a REST) ----

  viewDetails(r: Reservation): void {
    console.log('Reservation details:', r);
  }

  cancelReservation(r: Reservation): void {
    console.log('TODO cancel reservation via REST:', r);
  }

  checkIn(r: Reservation): void {
    console.log('TODO check-in via REST:', r);
  }

  checkOut(r: Reservation): void {
    console.log('TODO check-out via REST:', r);
  }

  private normalizeStatus(
    status: ReservationStatus | string | undefined
  ): string {
    return (status ?? '').toString().toLowerCase();
  }

  isConfirmed(r: Reservation): boolean {
    return this.normalizeStatus(r.status) === 'confirmed';
  }

  isCheckIn(r: Reservation): boolean {
    const s = this.normalizeStatus(r.status);
    return s === 'check-in' || s === 'check_in';
  }

  isCancellable(r: Reservation): boolean {
    const s = this.normalizeStatus(r.status);
    return s !== 'cancelled' && s !== 'completed';
  }
}
