// src/app/features/dashboard/components/dashboard-rooms/dashboard-rooms.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import {
  Room,
  RoomStatus,
  RoomFilters,
  RoomStats,
  PaginationData,
} from '../../models/rooms.model';
import { RoomsService } from '../../services/rooms.service';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './dashboard-rooms.component.html',
})
export class DashboardRoomsComponent implements OnInit {
  constructor(private roomsService: RoomsService) {}

  // ===== Signals =====
  rooms = signal<Room[]>([]);

  stats = signal<RoomStats>({
    totalRooms: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    avgRatePerNight: 0,
  });

  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(1);

  // ===== Filtros (ngModel) =====
  searchTerm = '';
  selectedRegion = 'all';
  selectedHotel = 'all';
  selectedStatus: string = 'all';
  selectedRoomType: string = 'all';

  // ===== Modal de detalles =====
  showDetails = false;
  selectedRoom: Room | null = null;

  // ===== Opciones de filtros =====
  regionOptions: SelectOption[] = [{ label: 'All regions', value: 'all' }];

  statusOptions: SelectOption[] = [
    { label: 'All status', value: 'all' },
    { label: 'Available', value: RoomStatus.AVAILABLE },
    { label: 'Occupied', value: RoomStatus.OCCUPIED },
    { label: 'Reserved', value: RoomStatus.RESERVED },
    { label: 'Maintenance', value: RoomStatus.MAINTENANCE },
  ];

  // aquí roomType es un string (simple, doble, familiar)
  roomTypeOptions: SelectOption[] = [{ label: 'All room types', value: 'all' }];

  // Hotels se calculan dinámicamente a partir de rooms()
  hotelOptions = computed<SelectOption[]>(() => {
    const opts: SelectOption[] = [{ label: 'All hotels', value: 'all' }];
    const seen = new Set<string>();

    this.rooms().forEach((r) => {
      const hotelId = r.hotel?.id;
      if (hotelId && !seen.has(hotelId)) {
        seen.add(hotelId);
        opts.push({
          label: r.hotel?.name ?? hotelId,
          value: hotelId,
        });
      }
    });

    return opts;
  });

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.loadStats();
    this.loadRooms();
  }

  // ===== Helpers para filtros/paginación =====
  private buildFilters(): RoomFilters {
    return {
      region: this.selectedRegion,
      hotel: this.selectedHotel,
      status: this.selectedStatus,
      roomType: this.selectedRoomType,
      searchTerm: this.searchTerm,
    };
  }

  private buildPagination(): PaginationData {
    return {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      totalItems: 0,
      totalPages: 0,
    };
  }

  // ===== Carga de datos =====
  private loadRooms(): void {
    const filters = this.buildFilters();
    const pagination = this.buildPagination();

    this.roomsService.getRooms(filters, pagination).subscribe({
      next: (res) => {
        this.rooms.set(res.data);
        this.currentPage.set(res.pagination.page);
        this.pageSize.set(res.pagination.pageSize);
        this.totalItems.set(res.pagination.totalItems);
        this.totalPages.set(res.pagination.totalPages);

        this.updateFilterOptionsFromRooms();
      },
      error: (err) => {
        console.error('Error loading rooms', err);
        this.rooms.set([]);
        this.totalItems.set(0);
        this.totalPages.set(1);
      },
    });
  }

  private loadStats(): void {
    this.roomsService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: (err) => {
        console.error('Error loading room stats', err);
      },
    });
  }

  private updateFilterOptionsFromRooms(): void {
    const rooms = this.rooms();

    // Regions (string coming from hotel.region)
    const regionSet = new Set<string>();
    rooms.forEach((r) => {
      if (r.hotel?.region) regionSet.add(r.hotel.region);
    });

    this.regionOptions = [
      { label: 'All regions', value: 'all' },
      ...Array.from(regionSet).map((r) => ({ label: r, value: r })),
    ];

    // Room types (room.roomType es string)
    const typeSet = new Set<string>();
    rooms.forEach((r) => {
      if (r.roomType) typeSet.add(r.roomType);
    });

    this.roomTypeOptions = [
      { label: 'All room types', value: 'all' },
      ...Array.from(typeSet).map((t) => ({ label: t, value: t })),
    ];
  }

  // ===== Eventos de filtros =====
  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadRooms();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRegion = 'all';
    this.selectedHotel = 'all';
    this.selectedStatus = 'all';
    this.selectedRoomType = 'all';
    this.currentPage.set(1);
    this.loadRooms();
  }

  // ===== Paginación =====
  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadRooms();
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

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // ===== Helpers de template =====
  formatCurrency(amount: number | undefined): string {
    const num = amount ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString();
  }

  getStatusClass(status: RoomStatus | string | undefined): string {
    const s = (status ?? '').toString().toLowerCase();

    if (s === RoomStatus.AVAILABLE.toLowerCase()) {
      return 'bg-green-100 text-green-700';
    }
    if (s === RoomStatus.OCCUPIED.toLowerCase()) {
      return 'bg-blue-100 text-blue-700';
    }
    if (s === RoomStatus.RESERVED.toLowerCase()) {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (s === RoomStatus.MAINTENANCE.toLowerCase()) {
      return 'bg-gray-200 text-gray-700';
    }
    return 'bg-gray-100 text-gray-600';
  }

  /** Inicial del tipo de habitación: S, D, F, etc. */
  getRoomInitial(roomType?: string | null): string {
    if (!roomType) return '?';
    const t = roomType.toLowerCase().trim();

    if (t.includes('familiar')) return 'F';
    if (t.includes('doble')) return 'D';
    if (t.includes('simple') || t.includes('sencilla')) return 'S';

    // En caso de que sea otro tipo, toma la primera letra
    return t.charAt(0).toUpperCase();
  }

  // ===== Modal de detalles =====
  viewDetails(room: Room): void {
    this.selectedRoom = room;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedRoom = null;
  }

  // (Acciones que ya no se usan en el HTML, las puedes borrar si quieres)
  exportData(): void {
    console.log('TODO: export rooms as CSV/XLSX');
  }
}
