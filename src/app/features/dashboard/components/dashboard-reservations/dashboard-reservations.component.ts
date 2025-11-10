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
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  Reservation,
  ReservationStats,
  ReservationStatus,
  RoomType,
  ReservationFilters,
  PaginationData,
} from '../../models/reservation.model';
import { ReservationsService } from '../../services/reservations.service';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-reservations',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    Select,
    DatePicker,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-reservations.component.html',
  styles: [
    `
      :host ::ng-deep {
        /* Estilos para Select (Dropdown) */
        .custom-dropdown .p-select {
          width: 100%;
          height: 42px;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background-color: white !important;
          display: flex;
          align-items: center;
        }

        .custom-dropdown .p-select:hover {
          border-color: #9ca3af;
        }

        .custom-dropdown .p-select-label {
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #374151;
          line-height: 1.25rem;
        }

        .custom-dropdown .p-select-dropdown {
          width: 2.5rem;
          color: #6b7280;
        }

        .custom-dropdown .p-select:not(.p-disabled):focus,
        .custom-dropdown .p-select:not(.p-disabled).p-focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }

        /* Panel del dropdown */
        .p-select-overlay {
          background: white !important;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          margin-top: 0.25rem;
          z-index: 1100;
        }

        .p-select-list-container {
          background: white !important;
        }

        .p-select-list {
          padding: 0.25rem;
        }

        .p-select-option {
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: #374151;
          border-radius: 0.375rem;
          margin: 0.125rem 0;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .p-select-option:hover {
          background-color: #f3f4f6 !important;
        }

        .p-select-option.p-select-option-selected {
          background-color: #fef3c7 !important;
          color: #92400e;
          font-weight: 500;
        }

        /* Estilos para DatePicker */
        .custom-datepicker .p-datepicker {
          width: 100%;
        }

        .custom-datepicker .p-datepicker-input-icon-container {
          position: relative;
        }

        .custom-datepicker input {
          width: 100%;
          height: 42px;
          padding: 0.625rem 2.5rem 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
          background-color: white !important;
        }

        .custom-datepicker input:hover {
          border-color: #9ca3af;
        }

        .custom-datepicker input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }

        .custom-datepicker .p-datepicker-dropdown,
        .custom-datepicker .p-datepicker-trigger {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          background: transparent;
          border: none;
        }

        /* Panel del datepicker */
        .p-datepicker {
          background: white !important;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          padding: 1rem;
        }

        .p-datepicker .p-datepicker-header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .p-datepicker table {
          margin: 0;
        }

        .p-datepicker table td {
          padding: 0.25rem;
        }

        .p-datepicker table td > span {
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .p-datepicker table td > span:hover {
          background-color: #f3f4f6;
        }

        .p-datepicker table td > span.p-datepicker-today > span {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: 600;
        }

        .p-datepicker table td > span.p-datepicker-selected {
          background-color: #f59e0b !important;
          color: white !important;
        }

        /* Toast messages */
        .p-toast .p-toast-message {
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        /* Confirm dialog */
        .p-dialog {
          border-radius: 0.75rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .p-dialog .p-dialog-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .p-dialog .p-dialog-content {
          padding: 1.5rem;
        }

        .p-dialog .p-dialog-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
      }
    `,
  ],
})
export class DashboardReservationsComponent implements OnInit {
  stats = signal<ReservationStats>({
    totalReservations: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    revenueToday: 0,
    totalChange: '',
    checkInPending: 0,
    checkOutOverdue: 0,
    revenueChange: '',
  });

  reservations = signal<Reservation[]>([]);
  loading = signal(false);

  searchTerm = signal('');
  selectedStatus = signal<string>('all');
  selectedRoomType = signal<string>('all');
  dateRange = signal<Date[] | null>(null);

  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Confirmed', value: ReservationStatus.CONFIRMED },
    { label: 'Check-in', value: ReservationStatus.CHECK_IN },
    { label: 'Check-out', value: ReservationStatus.CHECK_OUT },
    { label: 'Pending', value: ReservationStatus.PENDING },
    { label: 'Completed', value: ReservationStatus.COMPLETED },
    { label: 'Cancelled', value: ReservationStatus.CANCELLED },
    { label: 'No Show', value: ReservationStatus.NO_SHOW },
  ];

  roomTypeOptions: DropdownOption[] = [
    { label: 'All Room Types', value: 'all' },
    { label: 'Single Room', value: RoomType.SINGLE },
    { label: 'Double Room', value: RoomType.DOUBLE },
    { label: 'Suite', value: RoomType.SUITE },
    { label: 'Family Room', value: RoomType.FAMILY },
    { label: 'Deluxe Room', value: RoomType.DELUXE },
    { label: 'Presidential Suite', value: RoomType.PRESIDENTIAL },
  ];

  selectedReservation = signal<Reservation | null>(null);
  showDetailDialog = signal(false);

  constructor(
    private reservationsService: ReservationsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadReservations();
  }

  private loadStats(): void {
    this.reservationsService.getStats().subscribe((stats) => {
      this.stats.set(stats);
    });
  }

  loadReservations(): void {
    this.loading.set(true);

    const filters: ReservationFilters = {
      status:
        this.selectedStatus() !== 'all'
          ? (this.selectedStatus() as ReservationStatus)
          : undefined,
      roomType:
        this.selectedRoomType() !== 'all'
          ? (this.selectedRoomType() as RoomType)
          : undefined,
      searchTerm: this.searchTerm() || undefined,
      dateRange: this.dateRange()
        ? {
            start: this.dateRange()![0],
            end: this.dateRange()![1] || this.dateRange()![0],
          }
        : undefined,
    };

    const pagination: PaginationData = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      totalItems: 0,
      totalPages: 0,
    };

    this.reservationsService
      .getReservations(filters, pagination)
      .subscribe((result) => {
        this.reservations.set(result.data);
        this.totalItems.set(result.pagination.totalItems);
        this.loading.set(false);
      });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadReservations();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadReservations();
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
    this.selectedRoomType.set('all');
    this.dateRange.set(null);
    this.currentPage.set(1);
    this.loadReservations();
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // Ellipsis
      }

      // Show pages around current page
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // Ellipsis
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  }

  viewDetails(reservation: Reservation): void {
    this.selectedReservation.set(reservation);
    this.showDetailDialog.set(true);
  }

  editReservation(reservation: Reservation): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Reservation',
      detail: `Editing reservation ${reservation.reservationNumber}`,
      life: 3000,
    });
  }

  deleteReservation(reservation: Reservation): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete reservation ${reservation.reservationNumber}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.reservationsService
          .deleteReservation(reservation.id)
          .subscribe((success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: 'Reservation deleted successfully',
                life: 3000,
              });
              this.loadReservations();
            }
          });
      },
    });
  }

  changeStatus(reservation: Reservation, newStatus: ReservationStatus): void {
    this.reservationsService
      .updateReservationStatus(reservation.id, newStatus)
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Reservation status changed to ${newStatus}`,
          life: 3000,
        });
        this.loadReservations();
      });
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Exporting reservations data...',
      life: 3000,
    });
  }

  printTable(): void {
    window.print();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'checked_in':
      case 'Check-in':
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
      case 'Pending':
        return 'bg-blue-100 text-blue-700';
      case 'checked_out':
      case 'Completed':
        return 'bg-gray-100 text-gray-700';
      case 'canceled':
      case 'Cancelled':
      case 'No Show':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }
}
