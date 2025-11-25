import { Injectable } from '@angular/core';
import { EmpleadoDTO } from '../models/EmpleadoDTO';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuarioSubject = new BehaviorSubject<EmpleadoDTO | null>(null);

  setUsuario(usuario: EmpleadoDTO): void {
    this.usuarioSubject.next(usuario);
    if (usuario.accessToken) {
      localStorage.setItem('accessToken', usuario.accessToken);
    }
    if (usuario.refreshToken) {
      localStorage.setItem('refreshToken', usuario.refreshToken);
    }
  }

  getUsuario(): Observable<EmpleadoDTO | null> {
    return this.usuarioSubject.asObservable();
  }

  getUsuarioValue(): EmpleadoDTO | null {
    return this.usuarioSubject.value;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    this.usuarioSubject.next(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
