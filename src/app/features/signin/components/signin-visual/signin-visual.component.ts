import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-signin-visual',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signin-visual.component.html',
})
export class SigninVisualComponent {
  @Input() imageSrc = '';
  @Input() imageAlt = '3D Illustration';
}
