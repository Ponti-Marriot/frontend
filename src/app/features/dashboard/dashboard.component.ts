import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from '../../core/services/keycloack.service';
import { DashboardOverviewComponent } from './components/dashboard-overview/dashboard-overview.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import {
  DashboardSidebarComponent,
  MenuItem,
} from './components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardReservationsComponent } from './components/dashboard-reservations/dashboard-reservations.component';
import { DashboardRoomsComponent } from './components/dashboard-rooms/dashboard-rooms.component';
import { DashboardPaymentsComponent } from './components/dashboard-payments/dashboard-payments.component';
import { DashboardReportsComponent } from './components/dashboard-reports/dashboard-reports.component';
import { DashboardSettingsComponent } from './components/dashboard-settings/dashboard-settings.component';

type DashboardView =
  | 'overview'
  | 'reservations'
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
    DashboardPaymentsComponent,
    DashboardReportsComponent,
    DashboardSettingsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);

  currentView = signal<DashboardView>('overview');

  currentUser = signal({
    name: 'Usuario',
    role: 'User',
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
    { id: 'rooms', label: 'Rooms', icon: 'rooms', active: false },
    { id: 'payments', label: 'Payments', icon: 'payments', active: false },
    { id: 'reports', label: 'Reports', icon: 'reports', active: false },
    { id: 'account', label: 'Room Settings', icon: 'account', active: false },
  ]);

  isOverview = computed(() => this.currentView() === 'overview');
  isReservations = computed(() => this.currentView() === 'reservations');
  isRooms = computed(() => this.currentView() === 'rooms');
  isPayments = computed(() => this.currentView() === 'payments');
  isReports = computed(() => this.currentView() === 'reports');
  isAccount = computed(() => this.currentView() === 'account');

  mobileMenuOpen = signal(false);

  ngOnInit(): void {
    const userName = this.keycloakService.getUserName();
    const role = this.keycloakService.hasRole('admin')
      ? 'Administrator'
      : 'User';

    this.currentUser.set({
      name: userName,
      role: role,
      avatar: '/images/lebroun.jpeg',
    });
  }

  changeView(viewId: string): void {
    this.currentView.set(viewId as DashboardView);
    this.menuItems.update((items) =>
      items.map((item) => ({ ...item, active: item.id === viewId }))
    );
    if (this.mobileMenuOpen()) {
      this.toggleMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((state) => !state);
  }

  onMenuItemSelected(item: MenuItem): void {
    this.changeView(item.id);
  }

  onMenuToggle(): void {
    this.toggleMobileMenu();
  }

  logout(): void {
    this.keycloakService.logout();
  }

  getCurrentTitle(): string {
    const titles: Record<DashboardView, string> = {
      overview: 'Dashboard',
      reservations: 'Reservations Management',
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
      rooms: 'Manage hotel rooms',
      payments: 'Track all transactions',
      reports: 'View detailed analytics',
      account: 'Manage your account',
    };
    return subtitles[this.currentView()];
  }
}
