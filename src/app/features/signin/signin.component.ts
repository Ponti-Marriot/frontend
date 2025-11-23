import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SigninLayoutComponent } from './components/signin-layout/signin-layout.component';
import { SigninVisualComponent } from './components/signin-visual/signin-visual.component';
import { SigninFormComponent } from './components/signin-form/signin-form.component';
import { SigninVisualConfig } from './models/signin.model';

@Component({
  standalone: true,
  selector: 'app-signin',
  imports: [SigninLayoutComponent, SigninVisualComponent, SigninFormComponent],
  templateUrl: './signin.component.html',
})
export class SigninComponent {
  visualConfig: SigninVisualConfig = {
    imageSrc: '/images/luxury-hotel-signin.jpeg',
    imageAlt: '3D Objects Illustration',
  };

  constructor(private router: Router) {}

  onFormSubmit(event: { mode: string; data: any }): void {
    if (event.mode === 'signin') {
      console.log('Sign in attempt:', event.data);
      
    } else if (event.mode === 'forgot') {
      console.log('Password reset request:', event.data);
      alert('Reset link sent to your email!');
    }
  }
}
