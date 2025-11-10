import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-signin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signin-layout.component.html',
})
export class SigninLayoutComponent {}
