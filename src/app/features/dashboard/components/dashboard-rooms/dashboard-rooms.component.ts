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
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';

type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

interface Room {
  id: string;
  number: string;
  typeId: string;
  status: RoomStatus;
  floor: number;
  notes?: string;
  region: string;
  hotelId: string;
  currentGuest?: string;
  checkOutDate?: Date;
}

interface RoomType {
  id: string;
  name: string;
  description: string;
  ratePerNight: number;
}

interface RoomStats {
  totalRooms: number;
  available: number;
  occupied: number;
  reserved: number;
}

interface HotelOption {
  label: string;
  value: string;
  region: string;
}

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-rooms',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-rooms.component.html',
})
export class DashboardRoomsComponent implements OnInit {
  // Room types definitions
  private roomTypes: RoomType[] = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Basic room with queen bed',
      ratePerNight: 280000,
    },
    {
      id: 'double-deluxe',
      name: 'Double Deluxe',
      description: 'Two double beds',
      ratePerNight: 420000,
    },
    {
      id: 'suite-premium',
      name: 'Suite Premium',
      description: 'Suite with private lounge',
      ratePerNight: 680000,
    },
    {
      id: 'family',
      name: 'Family Room',
      description: 'Large room for families',
      ratePerNight: 550000,
    },
  ];

  // Hotels data
  private hotelsData: HotelOption[] = [
    { label: 'Bogotá · Centro', value: 'bog-centro', region: 'Bogotá' },
    { label: 'Bogotá · Aeropuerto', value: 'bog-airport', region: 'Bogotá' },
    { label: 'Medellín · Poblado', value: 'med-poblado', region: 'Medellín' },
    {
      label: 'Cartagena · Bocagrande',
      value: 'ctg-bocagrande',
      region: 'Cartagena',
    },
  ];

  // Sample rooms data
  private allRooms = signal<Room[]>([
    {
      id: 'room-101',
      number: '101',
      typeId: 'standard',
      status: 'available',
      floor: 1,
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'room-102',
      number: '102',
      typeId: 'standard',
      status: 'occupied',
      floor: 1,
      region: 'Bogotá',
      hotelId: 'bog-centro',
      currentGuest: 'María López',
      checkOutDate: new Date('2025-10-30'),
    },
    {
      id: 'room-201',
      number: '201',
      typeId: 'double-deluxe',
      status: 'reserved',
      floor: 2,
      region: 'Bogotá',
      hotelId: 'bog-centro',
      currentGuest: 'Juan Martínez',
      checkOutDate: new Date('2025-10-29'),
    },
    {
      id: 'room-305',
      number: '305',
      typeId: 'double-deluxe',
      status: 'occupied',
      floor: 3,
      notes: 'Cliente corporativo',
      region: 'Bogotá',
      hotelId: 'bog-centro',
      currentGuest: 'Camila Ortega',
      checkOutDate: new Date('2025-10-28'),
    },
    {
      id: 'room-306',
      number: '306',
      typeId: 'double-deluxe',
      status: 'reserved',
      floor: 3,
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'room-401',
      number: '401',
      typeId: 'suite-premium',
      status: 'available',
      floor: 4,
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'room-1208',
      number: '1208',
      typeId: 'suite-premium',
      status: 'available',
      floor: 12,
      region: 'Bogotá',
      hotelId: 'bog-airport',
    },
    {
      id: 'room-504',
      number: '504',
      typeId: 'standard',
      status: 'available',
      floor: 5,
      region: 'Medellín',
      hotelId: 'med-poblado',
    },
    {
      id: 'room-505',
      number: '505',
      typeId: 'family',
      status: 'occupied',
      floor: 5,
      region: 'Medellín',
      hotelId: 'med-poblado',
      currentGuest: 'Daniel Herrera',
      checkOutDate: new Date('2025-10-31'),
    },
    {
      id: 'room-301',
      number: '301',
      typeId: 'double-deluxe',
      status: 'maintenance',
      floor: 3,
      region: 'Cartagena',
      hotelId: 'ctg-bocagrande',
      notes: 'AC repair scheduled',
    },
  ]);

  stats = signal<RoomStats>({
    totalRooms: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
  });

  loading = signal(false);

  searchTerm = signal('');
  selectedRegion = signal<string>('all');
  selectedHotel = signal<string>('all');
  selectedStatus = signal<string>('all');
  selectedRoomType = signal<string>('all');

  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = computed(() => this.filteredRoomsCount());
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  regionOptions: DropdownOption[] = [
    { label: 'All Regions', value: 'all' },
    { label: 'Bogotá', value: 'Bogotá' },
    { label: 'Medellín', value: 'Medellín' },
    { label: 'Cartagena', value: 'Cartagena' },
  ];

  hotelOptions = computed(() => {
    const region = this.selectedRegion();
    if (region === 'all') {
      return [{ label: 'All Hotels', value: 'all' }, ...this.hotelsData];
    }
    return [
      { label: 'All Hotels', value: 'all' },
      ...this.hotelsData.filter((h) => h.region === region),
    ];
  });

  statusOptions: DropdownOption[] = [
    { label: 'All Status', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'Occupied', value: 'occupied' },
    { label: 'Reserved', value: 'reserved' },
    { label: 'Maintenance', value: 'maintenance' },
  ];

  roomTypeOptions: DropdownOption[] = [
    { label: 'All Room Types', value: 'all' },
    { label: 'Standard', value: 'standard' },
    { label: 'Double Deluxe', value: 'double-deluxe' },
    { label: 'Suite Premium', value: 'suite-premium' },
    { label: 'Family Room', value: 'family' },
  ];

  selectedRoom = signal<Room | null>(null);
  showDetailDialog = signal(false);

  // Computed rooms with filters applied
  rooms = computed(() => {
    let filtered = this.allRooms();

    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (room) =>
          room.number.toLowerCase().includes(search) ||
          this.getRoomTypeName(room.typeId).toLowerCase().includes(search) ||
          (room.currentGuest &&
            room.currentGuest.toLowerCase().includes(search))
      );
    }

    // Filter by region
    if (this.selectedRegion() !== 'all') {
      filtered = filtered.filter(
        (room) => room.region === this.selectedRegion()
      );
    }

    // Filter by hotel
    if (this.selectedHotel() !== 'all') {
      filtered = filtered.filter(
        (room) => room.hotelId === this.selectedHotel()
      );
    }

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(
        (room) => room.status === this.selectedStatus()
      );
    }

    // Filter by room type
    if (this.selectedRoomType() !== 'all') {
      filtered = filtered.filter(
        (room) => room.typeId === this.selectedRoomType()
      );
    }

    // Apply pagination
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();

    return filtered.slice(start, end);
  });

  // Computed total items (separated from rooms to avoid signal writing in computed)
  filteredRoomsCount = computed(() => {
    let filtered = this.allRooms();

    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(
        (room) =>
          room.number.toLowerCase().includes(search) ||
          this.getRoomTypeName(room.typeId).toLowerCase().includes(search) ||
          (room.currentGuest &&
            room.currentGuest.toLowerCase().includes(search))
      );
    }

    if (this.selectedRegion() !== 'all') {
      filtered = filtered.filter(
        (room) => room.region === this.selectedRegion()
      );
    }

    if (this.selectedHotel() !== 'all') {
      filtered = filtered.filter(
        (room) => room.hotelId === this.selectedHotel()
      );
    }

    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(
        (room) => room.status === this.selectedStatus()
      );
    }

    if (this.selectedRoomType() !== 'all') {
      filtered = filtered.filter(
        (room) => room.typeId === this.selectedRoomType()
      );
    }

    return filtered.length;
  });

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    const rooms = this.allRooms();

    this.stats.set({
      totalRooms: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      occupied: rooms.filter((r) => r.status === 'occupied').length,
      reserved: rooms.filter((r) => r.status === 'reserved').length,
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
    this.selectedRegion.set('all');
    this.selectedHotel.set('all');
    this.selectedStatus.set('all');
    this.selectedRoomType.set('all');
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

  // Helper methods
  getRoomTypeName(typeId: string): string {
    return this.roomTypes.find((t) => t.id === typeId)?.name || typeId;
  }

  getRoomTypeDescription(typeId: string): string {
    return this.roomTypes.find((t) => t.id === typeId)?.description || 'Room';
  }

  getRoomRate(typeId: string): number {
    return this.roomTypes.find((t) => t.id === typeId)?.ratePerNight || 0;
  }

  getHotelName(hotelId: string): string {
    return this.hotelsData.find((h) => h.value === hotelId)?.label || hotelId;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'occupied':
        return 'bg-blue-100 text-blue-700';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700';
      case 'maintenance':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // CRUD Operations
  viewDetails(room: Room): void {
    this.selectedRoom.set(room);
    this.showDetailDialog.set(true);
  }

  addRoom(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Add Room',
      detail: 'Opening room creation form...',
      life: 3000,
    });
    // Here you would open a dialog or navigate to a form
  }

  editRoom(room: Room): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Edit Room',
      detail: `Editing room ${room.number}`,
      life: 3000,
    });
    // Here you would open an edit dialog or form
  }

  deleteRoom(room: Room): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete room ${room.number}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.allRooms.update((rooms) => rooms.filter((r) => r.id !== room.id));
        this.loadStats();
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: 'Room deleted successfully',
          life: 3000,
        });
      },
    });
  }

  markAsAvailable(room: Room): void {
    this.allRooms.update((rooms) =>
      rooms.map((r) =>
        r.id === room.id
          ? {
              ...r,
              status: 'available' as RoomStatus,
              currentGuest: undefined,
              checkOutDate: undefined,
            }
          : r
      )
    );
    this.loadStats();
    this.messageService.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Room ${room.number} is now available`,
      life: 3000,
    });
  }

  markAsOccupied(room: Room): void {
    this.allRooms.update((rooms) =>
      rooms.map((r) =>
        r.id === room.id ? { ...r, status: 'occupied' as RoomStatus } : r
      )
    );
    this.loadStats();
    this.messageService.add({
      severity: 'info',
      summary: 'Status Updated',
      detail: `Room ${room.number} is now occupied`,
      life: 3000,
    });
  }

  exportData(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'Exporting rooms data...',
      life: 3000,
    });
  }
}
