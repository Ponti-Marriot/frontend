import { Injectable } from '@angular/core';
import { backUrl } from '../models/URL/back';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpleadoDTO } from '../models/EmpleadoDTO';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  
  baseUrl = backUrl + "/usuarios/inicioSesion"

  constructor(private http: HttpClient) { }

  login(correo: string, contrasenia: string): Observable<EmpleadoDTO> {
    return this.http.get<EmpleadoDTO>(this.baseUrl, { params: {
      correo: correo,
      contrasenia: contrasenia
    }});
  }
}
