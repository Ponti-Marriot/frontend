import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { NgIf, NgOptimizedImage, NgFor } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

export interface HeroAction {
  label: string;
  href: string;
  ariaLabel?: string;
}

export interface Brand {
  name: string;
  logo: string;
}

@Component({
  standalone: true,
  selector: 'app-home-hero',
  imports: [NgIf, NgOptimizedImage, ButtonModule, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-hero.component.html',
})
export class HomeHeroComponent {
  @HostBinding('class') host = 'block';
  @Input() backgroundUrl = '/images/luxury-hotel-hero.jpeg';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() action?: HeroAction;
  @Input() minHeightClass = 'min-h-screen';
  @Input() brands: Brand[] = [];
  @Input() brandsTitle = '';
  @Output() actionClick = new EventEmitter<void>();

  constructor(private router: Router) {}

  onActionClick() {
    this.actionClick.emit();
    if (this.action?.href) {
      this.router.navigate([this.action.href]);
    }
  }
}
