// src/app/dashboard/dashboard-reports.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

// D3
import * as d3 from 'd3';

import {
  ReportsService,
  DateRangeFilter,
} from '../../services/reports.service';
import {
  Report,
  RevenuePoint,
  OccupancySnapshot,
} from '../../models/reports.model';
import {
  Payment,
  PaymentFilters,
  PaginationData as PaymentPagination,
} from '../../models/payment.model';
import { PaymentsService } from '../../services/payments.service';

interface DateRangeOption {
  label: string;
  value: '7d' | '30d' | '90d' | 'all';
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | null;
  color: string; // clases Tailwind, ej: "bg-blue-100 text-blue-600"
  icon: string; // icono PrimeIcons, ej: "pi pi-dollar"
}

interface ReportTransactionRow {
  id: string; // payment.id
  transactionId: string;
  reservationId: string;
  amount: number;
  date: string; // ISO
  status: string;
}

@Component({
  selector: 'app-dashboard-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule],
  templateUrl: './dashboard-reports.component.html',
})
export class DashboardReportsComponent implements OnInit, AfterViewInit {
  // ---- ViewChild para los SVG de D3 ----
  @ViewChild('revenueChart', { static: false })
  revenueChartRef!: ElementRef<SVGSVGElement>;

  @ViewChild('occupancyChart', { static: false })
  occupancyChartRef!: ElementRef<SVGSVGElement>;

  private viewReady = false;

  // ---- Estado principal ----
  private readonly _reports = signal<Report[]>([]);
  readonly stats = signal<StatCard[]>([]);

  // Para la tabla de transacciones
  private readonly _transactions = signal<ReportTransactionRow[]>([]);
  readonly searchTerm = signal<string>('');

  // Filtro de rango
  readonly dateRanges: DateRangeOption[] = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'All time', value: 'all' },
  ];
  selectedRange: DateRangeOption['value'] = '30d';

  // Modo de gráfica (por ahora solo afecta los botones / future use)
  chartMode: 'monthly' | 'weekly' = 'monthly';

  // Transacciones filtradas por buscador
  readonly filteredTxs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this._transactions();
    }

    return this._transactions().filter((tx) => {
      return (
        tx.transactionId.toLowerCase().includes(term) ||
        tx.reservationId.toLowerCase().includes(term) ||
        tx.status.toLowerCase().includes(term)
      );
    });
  });

  constructor(
    private readonly reportsService: ReportsService,
    private readonly paymentsService: PaymentsService
  ) {}

  // ---------------- Ciclo de vida ----------------

  ngOnInit(): void {
    this.loadDataForCurrentRange();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.updateCharts();
  }

  // ---------------- Carga de datos ----------------

  private buildRangeFilter(): DateRangeFilter | undefined {
    const value = this.selectedRange;

    if (value === 'all') return undefined;

    const end = new Date();
    const start = new Date();

    if (value === '7d') {
      start.setDate(end.getDate() - 7);
    } else if (value === '30d') {
      start.setDate(end.getDate() - 30);
    } else if (value === '90d') {
      start.setDate(end.getDate() - 90);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private loadDataForCurrentRange(): void {
    const range = this.buildRangeFilter();

    // 1) Reports agregados
    this.reportsService.getReports(range).subscribe({
      next: (reports) => {
        this._reports.set(reports ?? []);
        this.updateStatsFromReports(reports ?? []);
        this.updateCharts();
      },
      error: (err) => {
        console.error('Error loading reports', err);
        this._reports.set([]);
        this.stats.set([]);
        this.updateCharts();
      },
    });

    // 2) Transacciones recientes (payments reales)
    this.loadRecentTransactions(range);
  }

  private loadRecentTransactions(range?: DateRangeFilter): void {
    const filters: PaymentFilters = {
      status: 'all',
      method: 'all',
      dateRange: range,
      searchTerm: '',
    };

    const pagination: PaymentPagination = {
      page: 1,
      pageSize: 200, // traemos varios y luego tomamos los últimos 20
      totalItems: 0,
      totalPages: 0,
    };

    this.paymentsService.getPayments(filters, pagination).subscribe({
      next: (result) => {
        const payments: Payment[] = result.data ?? [];

        // Ordenar por fecha (desc) y mapear a filas de reporte
        const sorted = [...payments].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        const rows: ReportTransactionRow[] = sorted.slice(0, 20).map((p) => ({
          id: p.id,
          transactionId: p.transactionId,
          reservationId: p.reservationId,
          amount: p.amount,
          date: p.createdAt,
          status:
            typeof p.paymentStatus === 'string'
              ? p.paymentStatus
              : String(p.paymentStatus),
        }));

        this._transactions.set(rows);
      },
      error: (err) => {
        console.error('Error loading recent transactions', err);
        this._transactions.set([]);
      },
    });
  }

  // ---------------- KPIs ----------------

  private updateStatsFromReports(reports: Report[]): void {
    if (!reports || reports.length === 0) {
      this.stats.set([
        {
          title: 'Total Revenue',
          value: '$0',
          change: 'No data',
          trend: null,
          color: 'bg-blue-100 text-blue-600',
          icon: 'pi pi-dollar',
        },
        {
          title: 'Total Reservations',
          value: '0',
          change: '',
          trend: null,
          color: 'bg-green-100 text-green-600',
          icon: 'pi pi-calendar',
        },
        {
          title: 'Avg Daily Revenue',
          value: '$0',
          change: '',
          trend: null,
          color: 'bg-amber-100 text-amber-600',
          icon: 'pi pi-chart-line',
        },
        {
          title: 'Avg Price/Night',
          value: '$0',
          change: '',
          trend: null,
          color: 'bg-purple-100 text-purple-600',
          icon: 'pi pi-moon',
        },
      ]);
      return;
    }

    const totalRevenue = reports.reduce(
      (sum, r) => sum + (r.totalRevenue ?? 0),
      0
    );
    const totalReservations = reports.reduce(
      (sum, r) => sum + (r.totalReservations ?? 0),
      0
    );
    const avgPrice =
      reports.reduce((sum, r) => sum + (r.avgPricePerNight ?? 0), 0) /
      reports.length;

    const uniqueDates = new Set(reports.map((r) => r.createdAt)).size || 1;
    const avgDailyRevenue = totalRevenue / uniqueDates;

    this.stats.set([
      {
        title: 'Total Revenue',
        value: this.formatCurrency(totalRevenue),
        change: '',
        trend: 'up',
        color: 'bg-blue-100 text-blue-600',
        icon: 'pi pi-dollar',
      },
      {
        title: 'Total Reservations',
        value: totalReservations.toString(),
        change: '',
        trend: 'up',
        color: 'bg-green-100 text-green-600',
        icon: 'pi pi-calendar',
      },
      {
        title: 'Avg Daily Revenue',
        value: this.formatCurrency(avgDailyRevenue),
        change: '',
        trend: 'up',
        color: 'bg-amber-100 text-amber-600',
        icon: 'pi pi-chart-line',
      },
      {
        title: 'Avg Price/Night',
        value: this.formatCurrency(avgPrice),
        change: '',
        trend: null,
        color: 'bg-purple-100 text-purple-600',
        icon: 'pi pi-moon',
      },
    ]);
  }

  // ---------------- Gráficas ----------------

  setChartMode(mode: 'monthly' | 'weekly'): void {
    this.chartMode = mode;
    this.updateCharts();
  }

  updateCharts(): void {
    if (!this.viewReady) return;

    const reports = this._reports();
    this.drawRevenueChart(reports);
    this.drawOccupancyChart(reports);
  }

  private buildRevenueSeries(reports: Report[]): RevenuePoint[] {
    if (!reports || reports.length === 0) return [];

    // groupBy fecha
    const map = new Map<string, number>();

    for (const r of reports) {
      const date = r.createdAt; // yyyy-MM-dd
      map.set(date, (map.get(date) ?? 0) + (r.totalRevenue ?? 0));
    }

    const series: RevenuePoint[] = Array.from(map.entries())
      .map(([date, total]) => ({ date, totalRevenue: total }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    return series;
  }

  private drawRevenueChart(reports: Report[]): void {
    const svgEl = this.revenueChartRef?.nativeElement;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const data = this.buildRevenueSeries(reports);
    if (data.length === 0) {
      return;
    }

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = svgEl.clientWidth || 600;
    const height = svgEl.clientHeight || 256;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const parseDate = d3.timeParse('%Y-%m-%d');

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalRevenue) ?? 0])
      .nice()
      .range([chartHeight, 0]);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Ejes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3.axisBottom(x).tickFormat((d) => {
          const dt = parseDate(String(d));
          if (!dt) return String(d);
          return d3.timeFormat('%b %d')(dt);
        }) as any
      )
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#6b7280');

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((v) =>
            d3.format('~s')(Number(v)).replace('G', 'B').replace('M', 'M')
          ) as any
      )
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#6b7280');

    // Barras
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.date) ?? 0)
      .attr('y', (d) => y(d.totalRevenue))
      .attr('width', x.bandwidth())
      .attr('height', (d) => chartHeight - y(d.totalRevenue))
      .attr('fill', '#f59e0b'); // amber-500
  }

  private buildOccupancySnapshot(reports: Report[]): OccupancySnapshot {
    if (!reports || reports.length === 0) {
      return { occupiedPercentage: 0, availablePercentage: 100 };
    }

    const totalReservations = reports.reduce(
      (sum, r) => sum + (r.totalReservations ?? 0),
      0
    );
    const days = new Set(reports.map((r) => r.createdAt)).size || 1;
    const avgReservationsPerDay = totalReservations / days;

    // Sin total de rooms, tomamos un techo razonable (ejemplo: 100),
    // para tener una métrica relativa pero basada en datos reales.
    const logicalMaxRooms = 100;
    let occupiedPct = (avgReservationsPerDay / logicalMaxRooms) * 100;

    if (!isFinite(occupiedPct) || occupiedPct < 0) occupiedPct = 0;
    if (occupiedPct > 100) occupiedPct = 100;

    return {
      occupiedPercentage: occupiedPct,
      availablePercentage: 100 - occupiedPct,
    };
  }

  private drawOccupancyChart(reports: Report[]): void {
    const svgEl = this.occupancyChartRef?.nativeElement;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const occ = this.buildOccupancySnapshot(reports);

    const width = svgEl.clientWidth || 400;
    const height = svgEl.clientHeight || 256;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const data = [
      { label: 'Occupied', value: occ.occupiedPercentage, color: '#3b82f6' }, // blue-500
      { label: 'Available', value: occ.availablePercentage, color: '#e5e7eb' }, // gray-200
    ];

    const pie = d3
      .pie<{ label: string; value: number; color: string }>()
      .sort(null)
      .value((d) => d.value);

    const arcGen = d3
      .arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arcGen as any)
      .attr('fill', (d) => d.data.color);

    // Texto central
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#1f2937') // gray-800
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text(`${occ.occupiedPercentage.toFixed(0)}%`);
  }

  // ---------------- Handlers desde el template ----------------

  updateChartsFromUI(): void {
    this.loadDataForCurrentRange();
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  // ---------------- Helpers ----------------

  formatCurrency(value: number | null | undefined): string {
    const num = value ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  }

  formatDate(isoString: string | null | undefined): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString();
  }
}
