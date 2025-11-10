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
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  Guest,
  GuestStats,
  GuestStatus,
  GuestFilters,
  PaginationData,
} from '../../models/guest.model';
import { GuestsService } from '../../services/guests.service';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-guests',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    Select,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-guests.component.html',
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
export class DashboardGuestsComponent implements OnInit {
  stats = signal<GuestStats>({
    totalGuests: 0,
    activeGuests: 0,
    vipGuests: 0,
    newToday: 0,
  });

  guests = signal<Guest[]>([]);
  loading = signal(false);

  searchTerm = signal('');
  selectedStatus = signal<string>('all');
  selectedRoomType = signal<string>('all');

  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'VIP Active', value: GuestStatus.VIP_ACTIVE },
    { label: 'Active', value: GuestStatus.ACTIVE },
    { label: 'New', value: GuestStatus.NEW },
    { label: 'Checked Out', value: GuestStatus.CHECKED_OUT },
    { label: 'Cancelled', value: GuestStatus.CANCELLED },
  ];

  roomTypeOptions: DropdownOption[] = [
    { label: 'All Room Types', value: 'all' },
    { label: 'Single Room', value: 'Single Room' },
    { label: 'Double Room', value: 'Double Room' },
    { label: 'Suite', value: 'Suite' },
    { label: 'Family Room', value: 'Family Room' },
    { label: 'Deluxe Room', value: 'Deluxe Room' },
  ];

  selectedGuest = signal<Guest | null>(null);
  showDetailDialog = signal(false);

  constructor(
    private guestsService: GuestsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadGuests();
  }

  private loadStats(): void {
    this.guestsService.getStats().subscribe((stats) => {
      this.stats.set(stats);
    });
  }

  loadGuests(): void {
    this.loading.set(true);

    const filters: GuestFilters = {
      status:
        this.selectedStatus() !== 'all'
          ? (this.selectedStatus() as GuestStatus)
          : undefined,
      roomType:
        this.selectedRoomType() !== 'all' ? this.selectedRoomType() : undefined,
      searchTerm: this.searchTerm() || undefined,
    };

    const pagination: PaginationData = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      totalItems: 0,
      totalPages: 0,
    };

    this.guestsService.getGuests(filters, pagination).subscribe((result) => {
      this.guests.set(result.data);
      this.totalItems.set(result.pagination.totalItems);
      this.loading.set(false);
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadGuests();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadGuests();
    }
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStatus.set('all');
    this.selectedRoomType.set('all');
    this.currentPage.set(1);
    this.loadGuests();
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

  viewDetails(guest: Guest): void {
    this.selectedGuest.set(guest);
    this.showDetailDialog.set(true);
  }

  editGuest(guest: Guest): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Guest',
      detail: `Editing guest ${guest.name}`,
      life: 3000,
    });
  }

  deleteGuest(guest: Guest): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete guest ${guest.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.guestsService.deleteGuest(guest.id).subscribe((success) => {
          if (success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Guest deleted successfully',
              life: 3000,
            });
            this.loadGuests();
          }
        });
      },
    });
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Exporting guests data...',
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'vip_active':
      case 'vip active':
      case 'vip':
        return 'bg-yellow-100 text-yellow-700';
      case 'active':
      case 'checked_in':
        return 'bg-green-100 text-green-700';
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'checked_out':
      case 'checked out':
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
      case 'canceled':
      case 'blacklisted':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  }
}
