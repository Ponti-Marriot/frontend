import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ReservationSummary,
  ReservationDetails,
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

type DateRangeFilter = 'all' | 'today' | '7d' | '30d';

@Component({
  selector: 'app-dashboard-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-reservations.component.html',
})
export class DashboardReservationsComponent implements OnInit {
  constructor(private reservationsService: ReservationsService) {
    // Effect para mantener currentPage dentro de [1, totalPages]
    effect(() => {
      const total = this.totalPages();
      const page = this.currentPage();
      const safe = Math.min(Math.max(1, page), total);
      if (safe !== page) {
        this.currentPage.set(safe);
      }
    });
  }

  // ===== State =====
  readonly reservations = signal<ReservationSummary[]>([]);

  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<'all' | ReservationStatus>('all');
  readonly selectedDateRange = signal<DateRangeFilter>('all');

  // Detalle (popup)
  readonly selectedReservationDetails = signal<ReservationDetails | null>(null);
  readonly isDetailsOpen = signal<boolean>(false);

  // ===== Options =====
  statusOptions = [
    { label: 'All statuses', value: 'all' as const },
    { label: 'Pending', value: 'PENDING' as ReservationStatus },
    { label: 'Confirmed', value: 'CONFIRMED' as ReservationStatus },
    { label: 'Checked-in', value: 'CHECKED_IN' as ReservationStatus },
    { label: 'Checked-out', value: 'CHECKED_OUT' as ReservationStatus },
    { label: 'Cancelled', value: 'CANCELLED' as ReservationStatus },
  ];

  dateRangeOptions = [
    { label: 'All time', value: 'all' as const },
    { label: 'Today', value: 'today' as const },
    { label: 'Last 7 days', value: '7d' as const },
    { label: 'Last 30 days', value: '30d' as const },
  ];

  // ===== Derived data =====

  /** Aplica filtros de texto, estado y rango de fechas */
  readonly filteredReservations = computed<ReservationSummary[]>(() => {
    const list = this.reservations();
    const term = this.searchTerm().trim().toLowerCase();
    const statusFilter = this.selectedStatus();
    const range = this.selectedDateRange();

    return list.filter((r) => {
      // 1) Filtro por texto
      const matchesTerm =
        term.length === 0 ||
        (r.reservationNumber ?? '').toLowerCase().includes(term) ||
        (r.guestName ?? '').toLowerCase().includes(term) ||
        (r.status ?? '').toString().toLowerCase().includes(term);

      if (!matchesTerm) return false;

      // 2) Filtro por estado
      if (statusFilter !== 'all') {
        const s = (r.status ?? '').toString().toUpperCase();
        if (s !== statusFilter) return false;
      }

      // 3) Filtro por rango de fechas (usamos checkIn)
      if (range !== 'all') {
        const checkInDate = new Date(r.checkIn);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (range === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          if (!(checkInDate >= today && checkInDate < tomorrow)) return false;
        }

        if (range === '7d' || range === '30d') {
          const days = range === '7d' ? 7 : 30;
          const start = new Date(today);
          start.setDate(today.getDate() - days);
          const end = new Date(today);
          end.setDate(today.getDate() + 1);
          if (!(checkInDate >= start && checkInDate < end)) return false;
        }
      }

      return true;
    });
  });

  /** Pagina el resultado filtrado */
  readonly paginatedReservations = computed<ReservationSummary[]>(() => {
    const pageSize = this.pageSize();
    const currentPage = this.currentPage();
    const list = this.filteredReservations();

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return list.slice(start, end);
  });

  readonly totalItems = computed<number>(
    () => this.filteredReservations().length
  );
  readonly totalPages = computed<number>(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );

  /** Tarjetas de stats calculadas localmente */
  readonly statCards = computed<StatCard[]>(() => {
    const list = this.reservations();

    const total = list.length;
    const pending = list.filter(
      (r) => this.normalizeStatus(r.status) === 'PENDING'
    ).length;
    const confirmed = list.filter(
      (r) => this.normalizeStatus(r.status) === 'CONFIRMED'
    ).length;
    const cancelled = list.filter(
      (r) => this.normalizeStatus(r.status) === 'CANCELLED'
    ).length;

    return [
      {
        title: 'Total Reservations',
        value: total.toString(),
        subtitle: '',
        color: 'blue',
        icon: 'pi pi-calendar',
      },
      {
        title: 'Confirmed',
        value: confirmed.toString(),
        subtitle: '',
        color: 'green',
        icon: 'pi pi-check-circle',
      },
      {
        title: 'Pending',
        value: pending.toString(),
        subtitle: '',
        color: 'yellow',
        icon: 'pi pi-clock',
      },
      {
        title: 'Cancelled',
        value: cancelled.toString(),
        subtitle: '',
        color: 'red',
        icon: 'pi pi-times-circle',
      },
    ];
  });

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.loadReservations();
  }

  // ===== Data loading =====
  private loadReservations(): void {
    this.reservationsService.getReservations().subscribe({
      next: (res) => {
        console.log('Reservations from API:', res);
        this.reservations.set(res);
        this.currentPage.set(1); // reseteamos página al cargar
      },
      error: (err) => {
        console.error('Error loading reservations', err);
        this.reservations.set([]);
        this.currentPage.set(1);
      },
    });
  }

  // ===== Filters & pagination =====

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
    this.selectedDateRange.set('all');
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
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

  // ===== Template helpers =====

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

  getStatusClass(status: ReservationStatus | string | undefined): string {
    const s = this.normalizeStatus(status);
    if (s === 'CONFIRMED') {
      return 'bg-blue-100 text-blue-800';
    }
    if (s === 'CHECKED_IN') {
      return 'bg-green-100 text-green-800';
    }
    if (s === 'CHECKED_OUT') {
      return 'bg-gray-100 text-gray-800';
    }
    if (s === 'PENDING') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (s === 'CANCELLED') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  private normalizeStatus(
    status: ReservationStatus | string | undefined
  ): string {
    return (status ?? '').toString().toUpperCase();
  }

  // ===== Detalle (popup, solo lectura) =====

  openDetails(r: ReservationSummary): void {
    this.reservationsService.getReservationById(r.id).subscribe({
      next: (details) => {
        this.selectedReservationDetails.set(details);
        this.isDetailsOpen.set(true);
      },
      error: (err) => {
        console.error('Error loading reservation details', err);
      },
    });
  }

  closeDetails(): void {
    this.isDetailsOpen.set(false);
    this.selectedReservationDetails.set(null);
  }

  getReservationInitial(): string {
    // Solo la "R"
    return 'R';
  }
}
