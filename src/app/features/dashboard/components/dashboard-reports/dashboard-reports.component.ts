import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';

// D3
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './dashboard-reports.component.html',
})
export class DashboardReportsComponent implements AfterViewInit {
  @ViewChild('revenueChart') revenueChart?: ElementRef<SVGElement>;
  @ViewChild('occupancyChart') occupancyChart?: ElementRef<SVGElement>;

  chartMode: 'monthly' | 'weekly' = 'monthly';

  selectedRange = 'Last 30 Days';
  dateRanges = [
    { label: 'Last 7 Days', value: 'Last 7 Days' },
    { label: 'Last 30 Days', value: 'Last 30 Days' },
    { label: 'Last 90 Days', value: 'Last 90 Days' },
  ];

  searchTerm = signal<string>('');

  private _revenueDataMonthly = signal([
    { label: 'Jan', value: 220000 },
    { label: 'Feb', value: 240000 },
    { label: 'Mar', value: 260000 },
    { label: 'Apr', value: 230000 },
    { label: 'May', value: 280000 },
    { label: 'Jun', value: 290000 },
    { label: 'Jul', value: 310000 },
    { label: 'Aug', value: 300000 },
    { label: 'Sep', value: 320000 },
    { label: 'Oct', value: 290000 },
    { label: 'Nov', value: 300000 },
    { label: 'Dec', value: 295000 },
  ]);

  private _revenueDataWeekly = signal([
    { label: 'Wk 1', value: 54000 },
    { label: 'Wk 2', value: 61000 },
    { label: 'Wk 3', value: 58000 },
    { label: 'Wk 4', value: 72000 },
    { label: 'Wk 5', value: 69000 },
    { label: 'Wk 6', value: 75000 },
    { label: 'Wk 7', value: 73000 },
    { label: 'Wk 8', value: 76000 },
  ]);

  occupancyData = signal({
    occupied: 87.3,
    available: 12.7,
  });

  private _transactions = signal([
    {
      id: '#TXN-001247',
      guest: 'John Anderson',
      roomType: 'Deluxe Suite',
      amount: 450,
      date: '2024-12-15',
      status: 'Confirmed',
    },
    {
      id: '#TXN-001246',
      guest: 'Sarah Williams',
      roomType: 'Standard Double',
      amount: 280,
      date: '2024-12-14',
      status: 'Pending',
    },
    {
      id: '#TXN-001245',
      guest: 'Michael Chen',
      roomType: 'Family Room',
      amount: 380,
      date: '2024-12-13',
      status: 'Confirmed',
    },
  ]);

  filteredTxs = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    return this._transactions().filter(
      (tx) =>
        tx.guest.toLowerCase().includes(term) ||
        tx.id.toLowerCase().includes(term)
    );
  });

  stats = computed(() => [
    {
      title: 'Total Revenue',
      value: this.formatCurrency(284590),
      change: '+12.5% from last month',
      trend: 'up',
      icon: 'pi pi-dollar',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Reservations',
      value: '1,247',
      change: '+8.2% from last month',
      trend: 'up',
      icon: 'pi pi-calendar',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Occupancy Rate',
      value: '87.3%',
      change: '+3.1% from last month',
      trend: 'up',
      icon: 'pi pi-building',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Avg. Daily Rate',
      value: '$228',
      change: '+5.7% from last month',
      trend: 'up',
      icon: 'pi pi-wallet',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ]);

  ngAfterViewInit() {
    this.safeRenderCharts();
  }

  updateCharts() {
    this.safeRenderCharts();
  }
  setChartMode(mode: 'monthly' | 'weekly') {
    this.chartMode = mode;
    this.safeRenderCharts();
  }

  onSearchChange(next: string) {
    this.searchTerm.set(next);
  }

  formatCurrency(v: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(v);
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private safeRenderCharts() {
    if (this.revenueChart?.nativeElement) {
      this.renderRevenueChart();
    }
    if (this.occupancyChart?.nativeElement) {
      this.renderOccupancyChart();
    }
  }

  private renderRevenueChart() {
    const data =
      this.chartMode === 'monthly'
        ? this._revenueDataMonthly()
        : this._revenueDataWeekly();

    const svgEl = this.revenueChart!.nativeElement;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const x = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right]);

    const maxY = d3.max(data, (d) => d.value) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxY * 1.1])
      .range([height - margin.bottom, margin.top]);

    const lineGen = d3
      .line<{ label: string; value: number }>()
      .x((d) => x(d.label)!)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2)
      .attr('d', lineGen);

    svg
      .selectAll('circle.point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d) => x(d.label)!)
      .attr('cy', (d) => y(d.value))
      .attr('r', 4)
      .attr('fill', '#2563eb');

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll('text')
      .attr('fill', '#6b7280')
      .style('font-size', '10px');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickFormat((d) => d3.format('$~s')(d as number))
      )
      .call((g) =>
        g.selectAll('text').attr('fill', '#6b7280').style('font-size', '10px')
      )
      .call((g) => g.selectAll('line').attr('stroke', '#e5e7eb'))
      .call((g) => g.select('.domain').attr('stroke', '#9ca3af'));
  }

  private renderOccupancyChart() {
    const occ = this.occupancyData();
    const pieData = [
      { label: 'Occupied', value: occ.occupied, color: '#2563eb' },
      { label: 'Available', value: occ.available, color: '#d1d5db' },
    ];

    const svgEl = this.occupancyChart!.nativeElement;
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 250;
    const radius = Math.min(width, height) / 2;

    const arcGen = d3
      .arc<d3.PieArcDatum<(typeof pieData)[number]>>()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const pieGen = d3.pie<(typeof pieData)[number]>().value((d) => d.value);

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const arcs = g
      .selectAll('g.slice')
      .data(pieGen(pieData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    arcs
      .append('path')
      .attr('d', arcGen as any)
      .attr('fill', (d) => d.data.color);

    // texto central
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#1f2937') // gray-800
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text(`${occ.occupied}%`);
  }
}
