import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf, NgOptimizedImage } from '@angular/common';

export interface Brand {
  name: string;
  logo: string;
}

@Component({
  standalone: true,
  selector: 'app-home-brands',
  imports: [NgFor, NgIf, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-brands.component.html',
})
export class HomeBrandsComponent {
  @Input() title = 'Trusted by enterprises for mission-critical use cases';
  @Input() subtitle =
    'Payments systems, IAM, logistics, user accounts, and more';
  @Input() brands: Brand[] = [];
}
