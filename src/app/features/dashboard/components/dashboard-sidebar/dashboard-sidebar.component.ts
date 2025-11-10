import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-dashboard-sidebar',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-sidebar.component.html',
})
export class DashboardSidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() mobileOpen = false;
  @Output() itemClicked = new EventEmitter<string>();
  @Output() mobileToggle = new EventEmitter<void>();
}
