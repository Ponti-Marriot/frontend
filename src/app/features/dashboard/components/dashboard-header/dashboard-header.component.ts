import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  name: string;
  role: string;
  avatar: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-header',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  @Input() title = 'Reservations Management';
  @Input() subtitle = 'Manage and monitor all hotel reservations';
  @Input() currentUser: User = {
    name: 'Ramon Ridwan',
    role: 'Administrator',
    avatar: '/images/user-avatar-placeholder.png',
  };

  @Output() menuToggle = new EventEmitter<void>();
}
