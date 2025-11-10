import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  iconColor: string;
}

interface Reservation {
  guest: string;
  avatar: string;
  roomType: string;
  room: string;
  checkIn: string;
  checkOut: string;
  status: 'Confirmed' | 'Processing' | 'Canceled';
  total: number;
}

interface GuestStat {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
}

interface RoomStat {
  title: string;
  value: number;
  icon: string;
  iconColor: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-overview',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-overview.component.html',
})
export class DashboardOverviewComponent implements OnInit {
  // Stats Cards
  stats = signal<StatCard[]>([
    {
      title: 'Total Reservations',
      value: '2,847',
      change: '+8.2% from last month',
      trend: 'up',
      icon: 'clipboard',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Check-ins Today',
      value: 127,
      change: '23 pending',
      trend: 'up',
      icon: 'login',
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'Check-outs Today',
      value: 94,
      change: '7 overdue',
      trend: 'down',
      icon: 'logout',
      iconColor: 'bg-red-100 text-red-600',
    },
    {
      title: 'Revenue Today',
      value: '$48,920',
      change: '+8% vs yesterday',
      trend: 'up',
      icon: 'dollar',
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
  ]);

  // Recent Reservations
  reservations = signal<Reservation[]>([
    {
      guest: 'Ramon Ridwan',
      avatar: '',
      roomType: 'Double Room',
      room: 'Suite 501 - Family',
      checkIn: 'Jan 18, 2024',
      checkOut: 'Jan 18, 2024',
      status: 'Confirmed',
      total: 840,
    },
    {
      guest: 'Ramon Ridwan',
      avatar: '',
      roomType: 'Single Room',
      room: 'Suite 501 - Family',
      checkIn: 'Jan 18, 2024',
      checkOut: 'Jan 18, 2024',
      status: 'Processing',
      total: 360,
    },
    {
      guest: 'Ramon Ridwan',
      avatar: '',
      roomType: 'Single Room',
      room: 'Suite 501 - Family',
      checkIn: 'Jan 18, 2024',
      checkOut: 'Jan 18, 2024',
      status: 'Confirmed',
      total: 180,
    },
    {
      guest: 'Ramon Ridwan',
      avatar: '',
      roomType: 'Family Room',
      room: 'Suite 501 - Family',
      checkIn: 'Jan 18, 2024',
      checkOut: 'Jan 18, 2024',
      status: 'Canceled',
      total: 1250,
    },
  ]);

  currentPage = signal(1);
  totalResults = 97;

  // Guest Stats
  guestStats = signal<GuestStat[]>([
    {
      title: 'Total Guests',
      value: 1247,
      icon: 'users',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Active Guests',
      value: 342,
      icon: 'user-check',
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'VIP Guests',
      value: 94,
      icon: 'crown',
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'New Today',
      value: 23,
      icon: 'user-plus',
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ]);

  // Room Stats
  roomStats = signal<RoomStat[]>([
    {
      title: 'Total Rooms',
      value: 248,
      icon: 'building',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Available',
      value: 186,
      icon: 'check-circle',
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'Occupied',
      value: 62,
      icon: 'home',
      iconColor: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Avg. Rate/Night',
      value: 320,
      icon: 'currency',
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ]);

  // Wallet info
  walletBalance = signal(30000.0);
  walletEarnings = signal(120000.0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    console.log('Loading dashboard data...');
  }

  getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
      Confirmed: 'bg-green-100 text-green-700',
      Processing: 'bg-blue-100 text-blue-700',
      Canceled: 'bg-red-100 text-red-700',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-700';
  }

  changePage(page: number): void {
    if (page >= 1 && page <= Math.ceil(this.totalResults / 10)) {
      this.currentPage.set(page);
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalResults / 10);
  }
}
