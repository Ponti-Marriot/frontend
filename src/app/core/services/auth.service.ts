import { Injectable } from '@angular/core';
import { EmpleadoDTO } from '../models/EmpleadoDTO';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioSubject = new BehaviorSubject<EmpleadoDTO | null>(null);

  setUsuario(usuario: EmpleadoDTO): void {
    this.usuarioSubject.next(usuario);
  }

  getUsuario(): Observable<EmpleadoDTO | null> {
    return this.usuarioSubject.asObservable();
  }

  getUsuarioValue(): EmpleadoDTO | null {
    return this.usuarioSubject.value;
  }
}
