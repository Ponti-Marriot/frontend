import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import {
  Room,
  RoomStatus,
  RoomFilters,
  PaginationData,
  CreateRoomRequest,
} from '../../models/rooms.model';
import { HotelProperty, Location } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-dashboard-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './dashboard-settings.component.html',
})
export class DashboardSettingsComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}

  // ======= DATA =======
  allLocations: Location[] = [];
  allHotels: HotelProperty[] = [];

  regions = signal<string[]>([]);
  hotels = signal<HotelProperty[]>([]);
  rooms = signal<Room[]>([]);

  isLoading = signal<boolean>(false);

  // ======= FILTERS (header) =======
  selectedRegion: string | null = null; // usamos Location.state como "region"
  selectedHotelId: string | null = null;

  regionOptions: SelectOption[] = [];
  hotelOptions: SelectOption[] = [];

  // ======= MODAL =======
  showModal = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  modalMode: 'view' | 'edit' | 'create' = 'view';
  currentRoom: Room | null = null;
  roomToDelete = signal<Room | null>(null);

  // Form model basado en CreateRoomRequest + selección de hotel/region
  roomForm: {
    id?: string;
    region: string | null;
    hotelPropertyId: string | null;
    title: string;
    roomType: string;
    pricePerNight: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    description: string;
    roomServiceIds: string[];
  } = this.emptyRoomForm();

  // Exponer enum por si lo quieres usar en el template
  RoomStatus = RoomStatus;

  ngOnInit(): void {
    this.loadLocationsAndHotels();
  }

  // ======= INIT: LOCATIONS + HOTELS =======
  private loadLocationsAndHotels(): void {
    // 1) Cargar locations
    this.settingsService.getLocations().subscribe({
      next: (locs) => {
        this.allLocations = locs;

        // Construir regiones a partir de Location.state
        const regionSet = new Set<string>();
        locs.forEach((l) => {
          if (l.state) regionSet.add(l.state);
        });

        const regionsArray = Array.from(regionSet);
        this.regions.set(regionsArray);

        this.regionOptions = regionsArray.map((r) => ({
          label: r,
          value: r,
        }));

        // 2) Cargar hoteles
        this.settingsService.getHotels().subscribe({
          next: (hotels) => {
            this.allHotels = hotels;

            // Region inicial: primera disponible
            if (regionsArray.length > 0) {
              this.selectedRegion = regionsArray[0];
              this.updateHotelsForRegion(this.selectedRegion);
            }
          },
          error: (err) => {
            console.error('Error loading hotels', err);
            this.allHotels = [];
          },
        });
      },
      error: (err) => {
        console.error('Error loading locations', err);
        this.allLocations = [];
      },
    });
  }

  // ======= REGION / HOTEL SELECTION =======

  onRegionChange(region: string): void {
    this.selectedRegion = region;
    this.updateHotelsForRegion(region);
  }

  private updateHotelsForRegion(region: string | null): void {
    if (!region) {
      this.hotels.set([]);
      this.hotelOptions = [];
      this.selectedHotelId = null;
      this.rooms.set([]);
      return;
    }

    // Hoteles cuyo Location.state coincide con la región
    const hotelsForRegion: HotelProperty[] = [];
    this.allHotels.forEach((h) => {
      const loc = this.allLocations.find((l) => l.id === h.locationId);
      if (loc && loc.state === region) {
        hotelsForRegion.push(h);
      }
    });

    this.hotels.set(hotelsForRegion);
    this.hotelOptions = hotelsForRegion.map((h) => ({
      label: h.name ?? h.id,
      value: h.id,
    }));

    if (hotelsForRegion.length > 0) {
      this.selectedHotelId = hotelsForRegion[0].id;
      this.loadRoomsForHotel(this.selectedHotelId);
    } else {
      this.selectedHotelId = null;
      this.rooms.set([]);
    }
  }

  onHotelChange(hotelId: string): void {
    this.selectedHotelId = hotelId;
    this.loadRoomsForHotel(hotelId);
  }

  // ======= ROOMS =======

  private loadRoomsForHotel(hotelId: string | null): void {
    if (!hotelId) {
      this.rooms.set([]);
      return;
    }

    this.isLoading.set(true);
    this.settingsService.getRoomsByHotel(hotelId).subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading rooms by hotel', err);
        this.rooms.set([]);
        this.isLoading.set(false);
      },
    });
  }

  // ======= HELPERS VIEW =======

  formatCurrency(amount: number | undefined): string {
    const num = amount ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
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

  getRoomInitial(roomType?: string | null): string {
    if (!roomType) return '?';
    const t = roomType.toLowerCase().trim();

    if (t.includes('familiar')) return 'F';
    if (t.includes('doble')) return 'D';
    if (t.includes('simple') || t.includes('sencilla')) return 'S';
    return t.charAt(0).toUpperCase();
  }

  // ======= MODAL CRUD =======

  private emptyRoomForm() {
    return {
      region: this.selectedRegion,
      hotelPropertyId: this.selectedHotelId,
      title: '',
      roomType: '',
      pricePerNight: null,
      bedrooms: null,
      bathrooms: null,
      description: '',
      roomServiceIds: [] as string[],
    };
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.currentRoom = null;

    this.roomForm = this.emptyRoomForm();

    this.showModal.set(true);
  }

  openViewModal(room: Room): void {
    this.modalMode = 'view';
    this.currentRoom = room;
    this.fillFormFromRoom(room);
    this.showModal.set(true);
  }

  openEditModal(room: Room): void {
    this.modalMode = 'edit';
    this.currentRoom = room;
    this.fillFormFromRoom(room);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  private fillFormFromRoom(room: Room): void {
    // Buscar la región del hotel
    let regionFromRoom: string | null = null;
    if (room.hotel?.region) {
      regionFromRoom = room.hotel.region;
    } else if (room.hotel?.id) {
      const hotel = this.allHotels.find((h) => h.id === room.hotel!.id);
      if (hotel) {
        const loc = this.allLocations.find((l) => l.id === hotel.locationId);
        regionFromRoom = loc?.state ?? null;
      }
    }

    this.roomForm = {
      id: room.id,
      region: regionFromRoom ?? this.selectedRegion,
      hotelPropertyId: room.hotel?.id ?? this.selectedHotelId,
      title: room.title ?? '',
      roomType: room.roomType ?? '',
      pricePerNight: room.price ?? null,
      bedrooms: room.bedrooms ?? null,
      bathrooms: room.bathrooms ?? null,
      description: room.description ?? '',
      roomServiceIds: [],
    };
  }

  // Cambio de región dentro del modal
  onModalRegionChange(region: string): void {
    this.roomForm.region = region;

    // Actualizar hoteles mostrados en el header y en el modal
    this.onRegionChange(region);

    // Forzar a que el usuario vuelva a escoger hotel
    this.roomForm.hotelPropertyId = null;
  }

  // Cambio de hotel dentro del modal
  onModalHotelChange(hotelId: string): void {
    this.roomForm.hotelPropertyId = hotelId;
  }

  // ======= SAVE (CREATE / UPDATE) =======

  saveRoom(): void {
    if (!this.roomForm.hotelPropertyId) {
      alert('Please select a hotel to create/edit a room.');
      return;
    }

    const payload: CreateRoomRequest = {
      hotelPropertyId: this.roomForm.hotelPropertyId,
      title: this.roomForm.title,
      description: this.roomForm.description || undefined,
      roomType: this.roomForm.roomType,
      pricePerNight: this.roomForm.pricePerNight ?? 0,
      bedrooms: this.roomForm.bedrooms ?? undefined,
      bathrooms: this.roomForm.bathrooms ?? undefined,
      roomServiceIds: this.roomForm.roomServiceIds.length
        ? this.roomForm.roomServiceIds
        : undefined,
    };

    if (this.modalMode === 'create') {
      this.settingsService
        .createRoom(this.roomForm.hotelPropertyId, payload)
        .subscribe({
          next: (created) => {
            // Recargar lista (en settings no son miles, es barato)
            this.loadRoomsForHotel(this.roomForm.hotelPropertyId);
            this.showModal.set(false);
          },
          error: (err) => {
            console.error('Error creating room', err);
          },
        });
    } else if (this.modalMode === 'edit' && this.currentRoom) {
      this.settingsService.updateRoom(this.currentRoom.id, payload).subscribe({
        next: (updated) => {
          // Actualizar lista local
          this.rooms.update((list) =>
            list.map((r) => (r.id === updated.id ? updated : r))
          );
          this.showModal.set(false);
        },
        error: (err) => {
          console.error('Error updating room', err);
        },
      });
    }
  }

  // ======= DELETE =======

  openDeleteConfirm(room: Room): void {
    this.roomToDelete.set(room);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.roomToDelete.set(null);
  }

  confirmDelete(): void {
    const room = this.roomToDelete();
    if (!room) return;

    this.settingsService.deleteRoom(room.id).subscribe({
      next: () => {
        this.rooms.update((list) => list.filter((r) => r.id !== room.id));
        this.showDeleteConfirm.set(false);
        this.roomToDelete.set(null);
      },
      error: (err) => {
        console.error('Error deleting room', err);
        this.showDeleteConfirm.set(false);
        this.roomToDelete.set(null);
      },
    });
  }
}
