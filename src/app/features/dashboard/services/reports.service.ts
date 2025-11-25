// src/app/services/reports.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { backUrl } from '../models/URL/back';
import { Report } from '../models/reports.model';

export interface DateRangeFilter {
  start?: Date;
  end?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = `${backUrl}/api`;

  constructor(private http: HttpClient) {}

  getReports(range?: DateRangeFilter): Observable<Report[]> {
    if (range?.start && range?.end) {
      const params = new HttpParams()
        .set('start', this.toDateString(range.start))
        .set('end', this.toDateString(range.end));

      return this.http.get<Report[]>(`${this.apiUrl}/reports/range`, {
        params,
      });
    }

    return this.http.get<Report[]>(`${this.apiUrl}/reports`);
  }

  getReportById(id: string): Observable<Report | null> {
    return this.http
      .get<Report>(`${this.apiUrl}/reports/${id}`)
      .pipe(map((r) => r ?? null));
  }

  // Helper para formatear Date -> yyyy-MM-dd
  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
