import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

@Component({
  standalone: true,
  selector: 'app-home-footer',
  imports: [NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-footer.component.html',
})
export class HomeFooterComponent {
  @Input() groups: FooterGroup[] = [];
  @Input() copyrightHolder = '';
  year = new Date().getFullYear();
}
