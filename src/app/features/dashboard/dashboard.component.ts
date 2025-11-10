import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import {
  DashboardSidebarComponent,
  MenuItem,
} from './components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardReservationsComponent } from './components/dashboard-reservations/dashboard-reservations.component';
import { DashboardRoomsComponent } from './components/dashboard-rooms/dashboard-rooms.component';
import { DashboardGuestsComponent } from './components/dashboard-guests/dashboard-guests.component';
import { DashboardPaymentsComponent } from './components/dashboard-payments/dashboard-payments.component';
import { DashboardReportsComponent } from './components/dashboard-reports/dashboard-reports.component';
import { SettingsComponent } from './components/dashboard-settings/dashboard-settings.component';

type DashboardView =
  | 'overview'
  | 'reservations'
  | 'guests'
  | 'rooms'
  | 'payments'
  | 'reports'
  | 'account';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    DashboardOverviewComponent,
    DashboardHeaderComponent,
    DashboardSidebarComponent,
    DashboardReservationsComponent,
    DashboardRoomsComponent,
    DashboardGuestsComponent,
    DashboardPaymentsComponent,
    DashboardReportsComponent,
    SettingsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  currentView = signal<DashboardView>('overview');

  currentUser = signal({
    name: 'Ramon Ridwan',
    role: 'Administrator',
    avatar: '/images/lebroun.jpeg',
  });

  menuItems = signal<MenuItem[]>([
    { id: 'overview', label: 'Dashboard', icon: 'dashboard', active: true },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: 'reservations',
      active: false,
    },
    { id: 'guests', label: 'Guests', icon: 'guests', active: false },
    { id: 'rooms', label: 'Rooms', icon: 'rooms', active: false },
    { id: 'payments', label: 'Payments', icon: 'payments', active: false },
    { id: 'reports', label: 'Reports', icon: 'reports', active: false },
    {
      id: 'account',
      label: 'Settings',
      icon: 'settings',
      active: false,
    },
  ]);

  isOverview = computed(() => this.currentView() === 'overview');
  isReservations = computed(() => this.currentView() === 'reservations');
  isGuests = computed(() => this.currentView() === 'guests');
  isRooms = computed(() => this.currentView() === 'rooms');
  isPayments = computed(() => this.currentView() === 'payments');
  isReports = computed(() => this.currentView() === 'reports');
  isAccount = computed(() => this.currentView() === 'account');

  mobileMenuOpen = signal(false);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  changeView(viewId: string): void {
    this.currentView.set(viewId as DashboardView);

    this.menuItems.update((items) =>
      items.map((item) => ({
        ...item,
        active: item.id === viewId,
      }))
    );

    if (this.mobileMenuOpen()) {
      this.toggleMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((state) => !state);
  }

  private loadInitialData(): void {
    console.log('Dashboard initialized');
  }

  logout(): void {
    this.router.navigate(['/signin']);
  }

  getCurrentTitle(): string {
    const titles: Record<DashboardView, string> = {
      overview: 'Dashboard',
      reservations: 'Reservations Management',
      guests: 'Guests Management',
      rooms: 'Rooms Management',
      payments: 'Payments',
      reports: 'Reports & Analytics',
      account: 'Account Settings',
    };
    return titles[this.currentView()];
  }

  getCurrentSubtitle(): string {
    const subtitles: Record<DashboardView, string> = {
      overview: 'Resume of the platform',
      reservations: 'Manage and monitor all hotel reservations',
      guests: 'View and manage guests',
      rooms: 'Manage hotel rooms',
      payments: 'Track all transactions',
      reports: 'View detailed analytics',
      account: 'Manage your account',
    };
    return subtitles[this.currentView()];
  }
}
