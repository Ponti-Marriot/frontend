import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';

type PaymentStatus =
  | 'Completed'
  | 'Pending'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

type PaymentMethod =
  | 'Credit Card'
  | 'PayPal'
  | 'Bank Transfer'
  | 'Wallet'
  | 'Cash';

interface Payment {
  id: string;
  reference: string;
  customer: string;
  email: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: Date;
  description?: string;
  avatar?: string;
}

interface PaymentStats {
  totalRevenue: number;
  completed: number;
  pending: number;
  failed: number;
}

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-payments',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-payments.component.html',
})
export class DashboardPaymentsComponent implements OnInit {
  private allPayments = signal<Payment[]>([
    {
      id: 'PAY-001',
      reference: 'REF-2024-001',
      customer: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      amount: 1250.0,
      method: 'Credit Card',
      status: 'Completed',
      date: new Date('2024-10-25'),
      description: 'Room booking - Suite Premium',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah%20Johnson',
    },
    {
      id: 'PAY-002',
      reference: 'REF-2024-002',
      customer: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      amount: 890.5,
      method: 'PayPal',
      status: 'Pending',
      date: new Date('2024-10-26'),
      description: 'Room booking - Double Deluxe',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Mike%20Wilson',
    },
    {
      id: 'PAY-003',
      reference: 'REF-2024-003',
      customer: 'Laura Gómez',
      email: 'laura.gomez@example.com',
      amount: 620.0,
      method: 'Bank Transfer',
      status: 'Failed',
      date: new Date('2024-10-24'),
      description: 'Room booking - Standard',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Laura%20Gomez',
    },
    {
      id: 'PAY-004',
      reference: 'REF-2024-004',
      customer: 'Carlos Mendoza',
      email: 'carlos.mendoza@example.com',
      amount: 2100.0,
      method: 'Credit Card',
      status: 'Completed',
      date: new Date('2024-10-23'),
      description: 'Room booking - Suite Premium (3 nights)',
    },
    {
      id: 'PAY-005',
      reference: 'REF-2024-005',
      customer: 'Ana Martínez',
      email: 'ana.martinez@example.com',
      amount: 450.0,
      method: 'Cash',
      status: 'Completed',
      date: new Date('2024-10-27'),
      description: 'Additional services',
    },
    {
      id: 'PAY-006',
      reference: 'REF-2024-006',
      customer: 'Robert Smith',
      email: 'robert.smith@example.com',
      amount: 1550.0,
      method: 'Wallet',
      status: 'Pending',
      date: new Date('2024-10-27'),
      description: 'Room booking - Family Room',
    },
    {
      id: 'PAY-007',
      reference: 'REF-2024-007',
      customer: 'Jennifer Davis',
      email: 'jennifer.davis@example.com',
      amount: 780.0,
      method: 'PayPal',
      status: 'Completed',
      date: new Date('2024-10-22'),
      description: 'Room booking - Double Room',
    },
    {
      id: 'PAY-008',
      reference: 'REF-2024-008',
      customer: 'David Brown',
      email: 'david.brown@example.com',
      amount: 320.0,
      method: 'Credit Card',
      status: 'Refunded',
      date: new Date('2024-10-21'),
      description: 'Cancelled booking',
    },
    {
      id: 'PAY-009',
      reference: 'REF-2024-009',
      customer: 'María López',
      email: 'maria.lopez@example.com',
      amount: 960.0,
      method: 'Bank Transfer',
      status: 'Pending',
      date: new Date('2024-10-27'),
      description: 'Room booking - Standard (2 nights)',
    },
    {
      id: 'PAY-010',
      reference: 'REF-2024-010',
      customer: 'James Anderson',
      email: 'james.anderson@example.com',
      amount: 1890.0,
      method: 'Credit Card',
      status: 'Completed',
      date: new Date('2024-10-26'),
      description: 'Room booking - Suite Premium',
    },
  ]);

  stats = signal<PaymentStats>({
    totalRevenue: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  loading = signal(false);

  searchTerm = signal('');
  selectedStatus = signal<string>('all');
  selectedMethod = signal<string>('all');
  selectedDateRange = signal<string>('all');

  currentPage = signal(1);
  pageSize = signal(10);

  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Refunded', value: 'Refunded' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  methodOptions: DropdownOption[] = [
    { label: 'All Methods', value: 'all' },
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'PayPal', value: 'PayPal' },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Wallet', value: 'Wallet' },
    { label: 'Cash', value: 'Cash' },
  ];

  dateRangeOptions: DropdownOption[] = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Last 90 Days', value: 'quarter' },
  ];

  selectedPayment = signal<Payment | null>(null);
  showDetailDialog = signal(false);

  statCards = computed(() => [
    {
      title: 'Total Revenue',
      value: this.formatCurrency(this.stats().totalRevenue),
      change: '+12.5% from last month',
      icon: 'dollar',
      color: 'blue',
      trend: 'up',
    },
    {
      title: 'Completed',
      value: this.stats().completed.toLocaleString(),
      change: '+8.2% from last month',
      icon: 'check-circle',
      color: 'green',
      trend: 'up',
    },
    {
      title: 'Pending',
      value: this.stats().pending.toLocaleString(),
      change: this.stats().pending + ' awaiting',
      icon: 'clock',
      color: 'yellow',
      trend: 'up',
    },
    {
      title: 'Failed',
      value: this.stats().failed.toLocaleString(),
      change: 'Need attention',
      icon: 'times-circle',
      color: 'red',
      trend: 'down',
    },
  ]);

  filteredPaymentsCount = computed(() => {
    let filtered = this.applyAllFilters(this.allPayments());
    return filtered.length;
  });

  totalItems = computed(() => this.filteredPaymentsCount());
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  payments = computed(() => {
    let filtered = this.applyAllFilters(this.allPayments());

    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();

    return filtered.slice(start, end);
  });

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private applyAllFilters(list: Payment[]): Payment[] {
    let filtered = list;

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (payment) =>
          payment.customer.toLowerCase().includes(search) ||
          payment.email.toLowerCase().includes(search) ||
          payment.id.toLowerCase().includes(search) ||
          payment.reference.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(
        (payment) => payment.status === this.selectedStatus()
      );
    }

    if (this.selectedMethod() !== 'all') {
      filtered = filtered.filter(
        (payment) => payment.method === this.selectedMethod()
      );
    }

    if (this.selectedDateRange() !== 'all') {
      const now = new Date();
      const range = this.selectedDateRange();

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.date);
        const diffTime = now.getTime() - paymentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (range) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'quarter':
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  private loadStats(): void {
    const payments = this.allPayments();

    const totalRevenue = payments
      .filter((p) => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);

    this.stats.set({
      totalRevenue,
      completed: payments.filter((p) => p.status === 'Completed').length,
      pending: payments.filter((p) => p.status === 'Pending').length,
      failed: payments.filter((p) => p.status === 'Failed').length,
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
    this.selectedMethod.set('all');
    this.selectedDateRange.set('all');
    this.currentPage.set(1);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (current > 3) {
        pages.push(-1);
      }

      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1);
      }

      pages.push(total);
    }

    return pages;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-orange-100 text-orange-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  viewDetails(payment: Payment): void {
    this.selectedPayment.set(payment);
    this.showDetailDialog.set(true);
  }

  refundPayment(payment: Payment): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to refund payment ${
        payment.id
      } of ${this.formatCurrency(payment.amount)}?`,
      header: 'Refund Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.allPayments.update((payments) =>
          payments.map((p) =>
            p.id === payment.id
              ? { ...p, status: 'Refunded' as PaymentStatus }
              : p
          )
        );
        this.loadStats();
        this.messageService.add({
          severity: 'success',
          summary: 'Refunded',
          detail: `Payment ${payment.id} has been refunded`,
          life: 3000,
        });
      },
    });
  }

  approvePayment(payment: Payment): void {
    this.confirmationService.confirm({
      message: `Approve payment ${payment.id} of ${this.formatCurrency(
        payment.amount
      )}?`,
      header: 'Approve Payment',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.allPayments.update((payments) =>
          payments.map((p) =>
            p.id === payment.id
              ? { ...p, status: 'Completed' as PaymentStatus }
              : p
          )
        );
        this.loadStats();
        this.messageService.add({
          severity: 'success',
          summary: 'Approved',
          detail: `Payment ${payment.id} has been approved`,
          life: 3000,
        });
      },
    });
  }

  cancelPayment(payment: Payment): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel payment ${payment.id}?`,
      header: 'Cancel Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.allPayments.update((payments) =>
          payments.map((p) =>
            p.id === payment.id
              ? { ...p, status: 'Cancelled' as PaymentStatus }
              : p
          )
        );
        this.loadStats();
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: `Payment ${payment.id} has been cancelled`,
          life: 3000,
        });
      },
    });
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Exporting payments data...',
      life: 3000,
    });
  }

  printTable(): void {
    window.print();
  }
}
