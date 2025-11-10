import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-home-about',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './home-about.component.html',
})
export class HomeAboutComponent {}
