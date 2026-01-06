/**
 * @deprecated This component is deprecated. Please use `EChartsChartComponent` directly instead.
 *
 * Chart Component (Deprecated)
 *
 * A deprecated chart component wrapper that converts Chart.js-style data to ApexCharts format.
 * This component is being replaced by `EChartsChartComponent` which provides better performance and more features.
 *
 * Migration Guide:
 * - Replace `ChartComponent` with `EChartsChartComponent`
 * - Convert `ChartData` format to `EChartsOption` format
 * - Use `EChartsChartComponent` directly for better performance
 *
 * @example
 * ```html
 * <!-- Old -->
 * <app-chart [data]="chartData" [options]="chartOptions" />
 *
 * <!-- New -->
 * <app-echarts-chart [options]="echartsOptions" [height]="'400px'" />
 * ```
 *
 * @see EChartsChartComponent
 * @see MIGRATION_GUIDE.md
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApexChartComponent } from '../apex-chart/apex-chart.component';

/**
 * Chart data interface
 */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, ApexChartComponent],
  template: `
    <div class="chart-container" [class]="customClass || ''" role="img" [attr.aria-label]="ariaLabel || title || 'Chart'">
      <app-apex-chart
        [type]="apexType"
        [series]="apexSeries"
        [categories]="apexCategories"
        [title]="title"
        [height]="height"
        [colors]="colors"
        [showLegend]="showLegend"
        [showDataLabels]="showDataLabels"
        [showToolbar]="showToolbar"
        [showGrid]="showGrid"
        [strokeWidth]="strokeWidth"
        [curve]="curve"
        [customClass]="customClass || ''"
        [ariaLabel]="ariaLabel || title || 'Chart'">
      </app-apex-chart>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
      /* Using design tokens for spacing if needed */
    }
  `]
})
export class ChartComponent implements OnInit, OnDestroy {
  @Input() type: string = 'line'; // Simplified type
  @Input() data: ChartData = { labels: [], datasets: [] };
  @Input() options: any = {};
  @Input() height: number = 400;
  @Input() useApexCharts: boolean = true; // Deprecated, always true (ECharts via wrapper)
  @Input() title: string = '';
  @Input() colors: string[] = [];

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;
  @Input() showLegend: boolean = true;
  @Input() showDataLabels: boolean = false;
  @Input() showToolbar: boolean = false;
  @Input() showGrid: boolean = true;
  @Input() strokeWidth: number = 2;
  @Input() curve: 'smooth' | 'straight' | 'stepline' = 'smooth';
  @Input() customClass: string = '';
  @Input() series: any[] = [];
  @Input() categories: string[] = [];

  // ApexCharts properties (Adapter)
  apexType: any = 'line';
  apexSeries: any[] = [];
  apexCategories: string[] = [];

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.convertToApexCharts();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Convert Chart.js data to ApexCharts format
   */
  private convertToApexCharts(): void {
    // Use provided series and categories if available, otherwise convert from ChartData
    if (this.series.length > 0) {
      this.apexSeries = this.series;
    } else {
      this.apexSeries = this.data.datasets.map(dataset => ({
        name: dataset.label,
        data: dataset.data,
        color: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor
      }));
    }

    if (this.categories.length > 0) {
      this.apexCategories = this.categories;
    } else {
      this.apexCategories = this.data.labels;
    }

    // Map type
    const typeMap: Record<string, string> = {
      'line': 'line',
      'bar': 'bar',
      'pie': 'pie',
      'doughnut': 'donut',
      'radar': 'radialBar',
      'scatter': 'scatter',
      'bubble': 'bubble'
    };

    this.apexType = typeMap[this.type] || 'line';

    // Set colors if not provided
    if (this.colors.length === 0 && this.data.datasets.length > 0) {
      this.colors = this.data.datasets.map(dataset =>
        Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor || '#3b82f6'
      );
    }
  }
}
