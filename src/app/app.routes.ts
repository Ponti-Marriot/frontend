import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { SigninComponent } from './features/signin/signin.component';
import { AuthGuard } from './core/services/auth.guard';

export const routes: Routes = [
  // Public routes:
  { path: '', component: HomeComponent },
  { path: 'auth/signin', component: SigninComponent },

  // Protected routes:
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
