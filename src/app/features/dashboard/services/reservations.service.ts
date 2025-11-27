// src/app/services/reservations.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { backUrl } from '../models/URL/back';
import {
  ReservationSummary,
  ReservationDetails,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationsService {
  private readonly apiUrl = `${backUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  // Lista de reservas para la tabla (summary)
  getReservations(): Observable<ReservationSummary[]> {
    return this.http.get<ReservationSummary[]>(this.apiUrl);
  }

  // Detalle de una reserva para el popup
  getReservationById(id: string): Observable<ReservationDetails> {
    return this.http.get<ReservationDetails>(`${this.apiUrl}/${id}`);
  }
}
