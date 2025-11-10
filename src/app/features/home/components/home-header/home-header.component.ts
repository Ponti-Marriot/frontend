import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { NgFor, NgIf, NgOptimizedImage } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-home-header',
  imports: [NgFor, NgIf, NgOptimizedImage, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-header.component.html',
})
export class HomeHeaderComponent {
  @HostBinding('class') host = 'block fixed top-0 left-0 right-0 z-50';
  @Input() logoSrc = '';
  @Input() logoAlt = 'Logo';
  @Input() navLinks: NavLink[] = [];
  @Input() ctaLabel = '';
  @Input() ctaHref = '';
  @Output() navClicked = new EventEmitter<string>();
  @Output() ctaClicked = new EventEmitter<void>();

  mobileOpen = false;

  constructor(private router: Router) {}

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  onCtaClick() {
    this.ctaClicked.emit();
    if (this.ctaHref) {
      this.router.navigate([this.ctaHref]);
    }
  }
}
