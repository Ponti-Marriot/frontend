import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

import {
  Payment,
  PaymentFilters,
  PaginationData,
  PaymentStatus,
} from '../../models/payment.model';
import { PaymentsService } from '../../services/payments.service';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | null;
  color: 'blue' | 'green' | 'yellow' | 'red';
  icon: 'dollar' | 'check-circle' | 'clock' | 'times-circle';
}

@Component({
  selector: 'app-dashboard-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './dashboard-payments.component.html',
})
export class DashboardPaymentsComponent implements OnInit {
  // ---- State (signals) ----
  readonly payments = signal<Payment[]>([]);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly totalPages = signal<number>(1);

  readonly searchTerm = signal<string>('');
  readonly selectedStatus = signal<string>('all');
  readonly selectedMethod = signal<string>('all');
  readonly selectedDateRange = signal<string>('all');

  // Modal state for payment details
  readonly showDetails = signal<boolean>(false);
  readonly selectedPayment = signal<Payment | null>(null);

  // ---- Filter options ----
  statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Completed', value: PaymentStatus.COMPLETED },
    { label: 'Pending', value: PaymentStatus.PENDING },
    { label: 'Failed', value: PaymentStatus.FAILED },
    { label: 'Refunded', value: PaymentStatus.REFUNDED },
    { label: 'Cancelled', value: PaymentStatus.CANCELLED },
  ];

  methodOptions = [
    { label: 'All methods', value: 'all' },
    { label: 'Not specified', value: 'none' },
  ];

  dateRangeOptions = [
    { label: 'All time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
  ];

  // ---- Stat cards computed from payments list ----
  readonly statCards = computed<StatCard[]>(() => {
    const list = this.payments();

    if (!list || list.length === 0) {
      return [
        {
          title: 'Total Revenue',
          value: '$0.00',
          change: 'No data yet',
          trend: null,
          color: 'blue',
          icon: 'dollar',
        },
        {
          title: 'Completed Payments',
          value: '0',
          change: '',
          trend: null,
          color: 'green',
          icon: 'check-circle',
        },
        {
          title: 'Pending Payments',
          value: '0',
          change: '',
          trend: null,
          color: 'yellow',
          icon: 'clock',
        },
        {
          title: 'Failed Payments',
          value: '0',
          change: '',
          trend: null,
          color: 'red',
          icon: 'times-circle',
        },
      ];
    }

    const normalize = (s: string | undefined | null) => (s ?? '').toLowerCase();

    const totalRevenue = list
      .filter((p) => normalize(p.paymentStatus) === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);

    const completed = list.filter(
      (p) => normalize(p.paymentStatus) === PaymentStatus.COMPLETED
    ).length;

    const pending = list.filter(
      (p) => normalize(p.paymentStatus) === PaymentStatus.PENDING
    ).length;

    const failed = list.filter((p) => {
      const st = normalize(p.paymentStatus);
      return st === PaymentStatus.FAILED || st === PaymentStatus.CANCELLED;
    }).length;

    return [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        change: '',
        trend: totalRevenue > 0 ? 'up' : null,
        color: 'blue',
        icon: 'dollar',
      },
      {
        title: 'Completed Payments',
        value: completed.toString(),
        change: '',
        trend: completed > 0 ? 'up' : null,
        color: 'green',
        icon: 'check-circle',
      },
      {
        title: 'Pending Payments',
        value: pending.toString(),
        change: '',
        trend: pending > 0 ? 'down' : null,
        color: 'yellow',
        icon: 'clock',
      },
      {
        title: 'Failed Payments',
        value: failed.toString(),
        change: '',
        trend: failed > 0 ? 'down' : null,
        color: 'red',
        icon: 'times-circle',
      },
    ];
  });

  constructor(private readonly paymentsService: PaymentsService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  // ---- Data loading ----

  private buildDateRangeFromSelected(): PaymentFilters['dateRange'] {
    const value = this.selectedDateRange();

    if (value === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start: today, end };
    }

    if (value === '7d' || value === '30d') {
      const days = value === '7d' ? 7 : 30;
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    // 'all'
    return undefined;
  }

  private loadPayments(): void {
    const filters: PaymentFilters = {
      status: this.selectedStatus() as PaymentStatus | 'all' | undefined,
      method: this.selectedMethod(),
      dateRange: this.buildDateRangeFromSelected(),
      searchTerm: this.searchTerm(),
    };

    const pagination: PaginationData = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      totalItems: 0,
      totalPages: 0,
    };

    this.paymentsService.getPayments(filters, pagination).subscribe({
      next: (result) => {
        this.payments.set(result.data);
        this.currentPage.set(result.pagination.page);
        this.pageSize.set(result.pagination.pageSize);
        this.totalItems.set(result.pagination.totalItems);
        this.totalPages.set(result.pagination.totalPages);
      },
      error: (err) => {
        console.error('Error loading payments', err);
        this.payments.set([]);
        this.totalItems.set(0);
        this.totalPages.set(1);
      },
    });
  }

  // ---- Filters & pagination ----

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadPayments();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
    this.selectedMethod.set('all');
    this.selectedDateRange.set('all');
    this.currentPage.set(1);
    this.loadPayments();
  }

  exportData(): void {
    const filters: PaymentFilters = {
      status: this.selectedStatus() as PaymentStatus | 'all' | undefined,
      method: this.selectedMethod(),
      dateRange: this.buildDateRangeFromSelected(),
      searchTerm: this.searchTerm(),
    };

    this.paymentsService.exportPayments(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payments.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error exporting payments', err),
    });
  }

  printTable(): void {
    window.print();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadPayments();
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

    if (start > 2) pages.push(-1); // ellipsis

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < total - 1) pages.push(-1); // ellipsis

    pages.push(total);
    return pages;
  }

  // ---- Actions ----

  viewDetails(payment: Payment): void {
    this.selectedPayment.set(payment);
    this.showDetails.set(true);
  }

  closeDetails(): void {
    this.showDetails.set(false);
    this.selectedPayment.set(null);
  }

  refundPayment(payment: Payment): void {
    console.log('Refund payment (TODO REST endpoint)', payment);
  }

  approvePayment(payment: Payment): void {
    console.log('Approve payment (TODO REST endpoint)', payment);
  }

  cancelPayment(payment: Payment): void {
    console.log('Cancel payment (TODO REST endpoint)', payment);
  }

  // ---- Helpers ----

  formatCurrency(value: number | null | undefined): string {
    const num = value ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  }

  formatDate(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString();
  }

  getStatusClass(status: string | undefined): string {
    const s = (status ?? '').toLowerCase();
    if (s === PaymentStatus.COMPLETED) {
      return 'bg-green-100 text-green-800';
    }
    if (s === PaymentStatus.PENDING) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (s === PaymentStatus.FAILED || s === PaymentStatus.CANCELLED) {
      return 'bg-red-100 text-red-800';
    }
    if (s === PaymentStatus.REFUNDED) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}
