import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

interface HotelOption {
  label: string;
  value: string;
  region: string;
}

interface RoomType {
  id: string;
  type: string;
  description: string;
  ratePerNight: number;
  totalRooms: number;
  available: number;
  image: string;
}

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
}

type ReservationStatus = 'upcoming' | 'checked_in' | 'checked_out' | 'canceled';

interface ReservationRow {
  id: string;
  guest: string;
  avatar?: string;
  roomType: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: ReservationStatus;
  total: number;
  region: string;
  hotelId: string;
}

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, TooltipModule],
  templateUrl: './dashboard-settings.component.html',
})
export class SettingsComponent {
  private _hotels = signal<HotelOption[]>([
    { label: 'Bogotá · Centro', value: 'bog-centro', region: 'Bogotá' },
    { label: 'Bogotá · Aeropuerto', value: 'bog-airport', region: 'Bogotá' },
    {
      label: 'Medellín · Poblado',
      value: 'med-poblado',
      region: 'Medellín',
    },
    {
      label: 'Cartagena · Bocagrande',
      value: 'ctg-bocagrande',
      region: 'Cartagena',
    },
  ]);

  selectedRegionSig = signal<string>('Bogotá');

  selectedHotelSig = signal<string>('bog-centro');
  selectedHotel = this.selectedHotelSig();

  selectedStatus = 'all';
  selectedRoomType = 'all';

  statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Upcoming', value: 'upcoming' },
    { label: 'Checked In', value: 'checked_in' },
    { label: 'Checked Out', value: 'checked_out' },
    { label: 'Canceled', value: 'canceled' },
  ];

  roomTypeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'Standard', value: 'standard' },
    { label: 'Double Deluxe', value: 'double-deluxe' },
    { label: 'Suite Premium', value: 'suite-premium' },
  ];

  loadingSig = signal<boolean>(false);

  private _roomTypes = signal<RoomType[]>([
    {
      id: 'standard',
      type: 'Standard',
      description: 'Habitación básica con cama queen, Wi-Fi y escritorio.',
      ratePerNight: 280000,
      totalRooms: 34,
      available: 12,
      image: '/images/simple-room.webp',
    },
    {
      id: 'double-deluxe',
      type: 'Double Deluxe',
      description:
        'Dos camas dobles, vista interna, ideal para familias o grupos.',
      ratePerNight: 420000,
      totalRooms: 18,
      available: 4,
      image: '/images/doble-room.webp',
    },
    {
      id: 'suite-premium',
      type: 'Suite Premium',
      description:
        'Suite con sala privada, minibar y balcón. Opción ejecutiva.',
      ratePerNight: 680000,
      totalRooms: 6,
      available: 1,
      image: '/images/family-room.webp',
    },
  ]);

  private _rooms = signal<Room[]>([
    {
      id: 'room-305',
      number: '305',
      typeId: 'double-deluxe',
      status: 'occupied',
      floor: 3,
      notes: 'Cliente corporativo, checkout 28 Oct',
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'room-306',
      number: '306',
      typeId: 'double-deluxe',
      status: 'reserved',
      floor: 3,
      notes: 'Check-in 27 Oct 15:00',
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'room-1208',
      number: '1208',
      typeId: 'suite-premium',
      status: 'available',
      floor: 12,
      notes: 'Listo, housekeeping OK',
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
  ]);

  // Reservas (tabla)
  private _reservations = signal<ReservationRow[]>([
    {
      id: 'res-1001',
      guest: 'Camila Ortega',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Camila%20Ortega',
      roomType: 'Double Deluxe',
      room: '305',
      checkIn: '2025-10-25',
      checkOut: '2025-10-28',
      status: 'checked_in',
      total: 840000,
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'res-1002',
      guest: 'Juan Martínez',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Juan%20Martinez',
      roomType: 'Double Deluxe',
      room: '306',
      checkIn: '2025-10-27',
      checkOut: '2025-10-29',
      status: 'upcoming',
      total: 560000,
      region: 'Bogotá',
      hotelId: 'bog-centro',
    },
    {
      id: 'res-1003',
      guest: 'María López',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Maria%20Lopez',
      roomType: 'Suite Premium',
      room: '1208',
      checkIn: '2025-10-20',
      checkOut: '2025-10-23',
      status: 'checked_out',
      total: 2040000,
      region: 'Bogotá',
      hotelId: 'bog-airport',
    },
    {
      id: 'res-1004',
      guest: 'Daniel Herrera',
      roomType: 'Standard',
      room: '504',
      checkIn: '2025-10-24',
      checkOut: '2025-10-26',
      status: 'checked_in',
      total: 560000,
      region: 'Medellín',
      hotelId: 'med-poblado',
    },
  ]);

  // --------- Computed (UI) ---------

  hotelOptions = computed(() => {
    const region = this.selectedRegionSig();
    return this._hotels().filter((h) => h.region === region);
  });

  // Cards KPI arriba
  stats = computed(() => {
    const hotelId = this.selectedHotelSig();
    const roomsInHotel = this._rooms().filter((r) => r.hotelId === hotelId);

    const totalRooms = roomsInHotel.length;
    const available = roomsInHotel.filter(
      (r) => r.status === 'available'
    ).length;
    const occupied = roomsInHotel.filter((r) => r.status === 'occupied').length;

    // Tarifa promedio
    let acc = 0;
    let n = 0;
    for (const r of roomsInHotel) {
      const t = this._roomTypes().find((rt) => rt.id === r.typeId);
      if (t) {
        acc += t.ratePerNight;
        n++;
      }
    }
    const avgRate = n > 0 ? acc / n : 0;

    return [
      {
        title: 'Total Rooms',
        value: totalRooms,
        trend: 'up',
        change: '+2%',
        icon: 'building',
        iconColor: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Available',
        value: available,
        trend: 'up',
        change: '+5%',
        icon: 'check-circle',
        iconColor: 'bg-green-100 text-green-600',
      },
      {
        title: 'Occupied',
        value: occupied,
        trend: 'down',
        change: '-1%',
        icon: 'home',
        iconColor: 'bg-yellow-100 text-yellow-600',
      },
      {
        title: 'Avg. Rate/Night',
        value: this.formatCurrency(avgRate),
        trend: 'up',
        change: '+3%',
        icon: 'currency',
        iconColor: 'bg-purple-100 text-purple-600',
      },
    ];
  });

  roomTypeStats = computed(() => this._roomTypes());

  // Reservas filtradas por hotel / status / type
  reservations = computed(() => {
    const h = this.selectedHotelSig();
    const statusFilter = this.selectedStatus;
    const typeFilter = this.selectedRoomType;

    return this._reservations().filter((r) => {
      if (r.hotelId !== h) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      if (typeFilter !== 'all') {
        const normalizedType = r.roomType.toLowerCase().replace(/\s+/g, '-');
        if (normalizedType !== typeFilter) return false;
      }

      return true;
    });
  });

  // Paginación
  currentPageSig = signal<number>(1);
  pageSize = 10;

  currentPage = () => this.currentPageSig();
  totalResults = computed(() => this.reservations().length);

  getTotalPages(): number {
    const total = this.totalResults();
    if (total === 0) return 1;
    return Math.ceil(total / this.pageSize);
  }

  pageRange() {
    // Devuelve [1,2,...,N] para iterar en el template
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  paginatedReservations = computed(() => {
    const page = this.currentPageSig();
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.reservations().slice(start, end);
  });

  // Guest stats / wallet / room stats (para las secciones inferiores)
  guestStats = signal([
    {
      title: 'Total Guests',
      value: 128,
      icon: 'users',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Checked In',
      value: 42,
      icon: 'user-check',
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'VIP / Loyalty',
      value: 9,
      icon: 'crown',
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'New Today',
      value: 6,
      icon: 'user-plus',
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ]);

  walletEarnings = signal<number>(12500000);
  walletBalance = signal<number>(3200000);

  roomStats = signal([
    {
      title: 'Total Rooms',
      value: 58,
      icon: 'building',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Available Now',
      value: 17,
      icon: 'check-circle',
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'Currently Occupied',
      value: 36,
      icon: 'home',
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Avg Rate/Night',
      value: '420.000',
      icon: 'currency',
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ]);

  // --------- Helpers de UI ---------

  min(a: number, b: number): number {
    return a < b ? a : b;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  getStatusClass(status: ReservationStatus): string {
    switch (status) {
      case 'checked_in':
        return 'bg-green-100 text-green-700';
      case 'upcoming':
        return 'bg-blue-100 text-blue-700';
      case 'checked_out':
        return 'bg-gray-100 text-gray-700';
      case 'canceled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  changePage(page: number) {
    if (page < 1) return;
    if (page > this.getTotalPages()) return;
    this.currentPageSig.set(page);
  }

  // Handlers dropdown
  onHotelChange(newHotel: string) {
    this.selectedHotelSig.set(newHotel);
    this.syncLoadingPulse();
  }

  onStatusChange(newStatus: string) {
    this.selectedStatus = newStatus;
    this.syncLoadingPulse();
  }

  onRoomTypeChange(newType: string) {
    this.selectedRoomType = newType;
    this.syncLoadingPulse();
  }

  // Cambiar región
  changeRegion(region: string) {
    this.selectedRegionSig.set(region);

    // Re-map hotel si cambia de región
    const firstHotel = this.hotelOptions()[0];
    if (firstHotel) {
      this.selectedHotelSig.set(firstHotel.value);
      this.selectedHotel = firstHotel.value;
    }

    this.syncLoadingPulse();
  }

  private syncLoadingPulse() {
    this.loadingSig.set(true);
    setTimeout(() => this.loadingSig.set(false), 200);
  }

  // CRUD demo
  createRoom() {
    console.log('createRoom()');
  }

  markAsAvailable(roomId: string) {
    this._rooms.update((list) =>
      list.map((r) => (r.id === roomId ? { ...r, status: 'available' } : r))
    );
  }

  markAsOccupied(roomId: string) {
    this._rooms.update((list) =>
      list.map((r) => (r.id === roomId ? { ...r, status: 'occupied' } : r))
    );
  }

  markAsReserved(roomId: string) {
    this._rooms.update((list) =>
      list.map((r) => (r.id === roomId ? { ...r, status: 'reserved' } : r))
    );
  }

  deleteRoom(roomId: string) {
    this._rooms.update((list) => list.filter((r) => r.id !== roomId));
  }

  viewRoomDetails(roomType: RoomType) {
    console.log('viewRoomDetails()', roomType);
  }

  editRoom(roomType: RoomType) {
    console.log('editRoom()', roomType);
  }

  _dbg = effect(() => {
    console.log(
      '[rooms-dashboard] hotel=',
      this.selectedHotelSig(),
      'region=',
      this.selectedRegionSig(),
      'reservationsFiltered=',
      this.reservations().length
    );
  });
}
