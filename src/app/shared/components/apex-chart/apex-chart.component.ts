/**
 * @deprecated This component is deprecated. Please use `EChartsChartComponent` directly instead.
 *
 * Apex Chart Component (Deprecated)
 *
 * A deprecated chart component wrapper that converts ApexCharts-style configuration to ECharts format.
 * This component is being replaced by `EChartsChartComponent` which provides better performance and more features.
 *
 * Migration Guide:
 * - Replace `ApexChartComponent` with `EChartsChartComponent`
 * - Convert ApexCharts-style configuration to `EChartsOption` format
 * - Use `EChartsChartComponent` directly for better performance
 *
 * @example
 * ```html
 * <!-- Old -->
 * <app-apex-chart [type]="'line'" [series]="series" [categories]="categories" />
 *
 * <!-- New -->
 * <app-echarts-chart [options]="echartsOptions" [height]="'400px'" />
 * ```
 *
 * @see EChartsChartComponent
 * @see MIGRATION_GUIDE.md
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EChartsChartComponent, EChartsOption, EChartsData } from '../echarts-chart/echarts-chart.component';

@Component({
  selector: 'app-apex-chart',
  standalone: true,
  imports: [CommonModule, EChartsChartComponent],
  template: `
    <div class="apex-chart-container" [class]="customClass">
      <app-echarts-chart
        [options]="echartsOptions"
        [height]="height + 'px'"
        [showControls]="false"
        [showInfo]="false">
      </app-echarts-chart>
    </div>
  `,
  styles: [`
    .apex-chart-container {
      width: 100%;
    }
  `]
})
export class ApexChartComponent implements OnInit, OnChanges {
  /**
   * Chart type
   */
  @Input() type: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap' | 'candlestick' = 'line';

  /**
   * Chart series
   */
  @Input() series: Array<{ name: string; data: number[] }> = [];

  /**
   * Chart categories
   */
  @Input() categories: string[] = [];

  /**
   * Chart height
   */
  @Input() height: number = 350;

  /**
   * Chart width
   */
  @Input() width: string | number = '100%';

  /**
   * Chart title
   */
  @Input() title: string = '';

  /**
   * Chart subtitle
   */
  @Input() subtitle: string = '';

  /**
   * Chart colors
   */
  @Input() colors: string[] = [];

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Show legend
   */
  @Input() showLegend: boolean = true;

  /**
   * Show data labels
   */
  @Input() showDataLabels: boolean = false;

  /**
   * Show toolbar
   */
  @Input() showToolbar: boolean = false;

  /**
   * Show grid
   */
  @Input() showGrid: boolean = true;

  /**
   * Stroke width
   */
  @Input() strokeWidth: number = 2;

  /**
   * Curve type
   */
  @Input() curve: 'smooth' | 'straight' | 'stepline' = 'smooth';

  // These inputs are kept for compatibility but might not be fully supported in mapping
  /**
   * Chart labels (for pie charts)
   */
  @Input() labels: string[] = [];

  /**
   * X-axis configuration
   */
  @Input() xaxis: Record<string, unknown> = {};

  /**
   * Y-axis configuration
   */
  @Input() yaxis: Record<string, unknown> = {};

  /**
   * Grid configuration
   */
  @Input() grid: Record<string, unknown> = {};

  /**
   * Legend configuration
   */
  @Input() legend: Record<string, unknown> = {};

  /**
   * Data labels configuration
   */
  @Input() dataLabels: Record<string, unknown> = {};

  /**
   * Plot options configuration
   */
  @Input() plotOptions: Record<string, unknown> = {};

  /**
   * Fill configuration
   */
  @Input() fill: Record<string, unknown> = {};

  /**
   * Stroke configuration
   */
  @Input() stroke: Record<string, unknown> = {};

  /**
   * Tooltip configuration
   */
  @Input() tooltip: Record<string, unknown> = {};

  /**
   * Markers configuration
   */
  @Input() markers: Record<string, unknown> = {};

  /**
   * Theme configuration
   */
  @Input() theme: Record<string, unknown> = {};

  /**
   * Chart configuration
   */
  @Input() chartConfig: Record<string, unknown> = {};

  /**
   * Title configuration
   */
  @Input() titleConfig: Record<string, unknown> = {};

  /**
   * Responsive configuration
   */
  @Input() responsive: Array<Record<string, unknown>> = [];

  /**
   * ECharts options
   */
  echartsOptions: EChartsOption = {};

  ngOnInit() {
    this.updateChartOptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateChartOptions();
  }

  private updateChartOptions() {
    // Map ApexCharts inputs to ECharts options
    const options: any = {
      title: {
        text: this.title || (this.titleConfig && this.titleConfig['text'] as string) || '',
        subtext: this.subtitle,
        left: 'center',
        textStyle: { color: 'var(--color-white, #fff)' }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 26, 46, 0.9)', /* Using dark theme background */
        textStyle: { color: 'var(--color-white, #fff)' }
      },
      grid: {
        show: this.showGrid,
        containLabel: true,
        left: '3%',
        right: '4%',
        bottom: '3%'
      },
      legend: {
        show: this.showLegend,
        textStyle: { color: '#fff' },
        top: 'top'
      },
      xAxis: {
        type: 'category',
        data: this.categories.length > 0 ? this.categories : (this.xaxis && (this.xaxis['categories'] as string[])) || [],
        axisLabel: { color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#6b7280' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9ca3af' },
        splitLine: { show: this.showGrid, lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
      },
      series: this.mapSeries(),
      color: this.colors.length > 0 ? this.colors : [
        'var(--color-primary-500, #3b82f6)',
        'var(--color-purple-500, #8b5cf6)',
        'var(--color-info-500, #06b6d4)',
        'var(--color-success-500, #10b981)',
        'var(--color-warning-500, #f59e0b)'
      ],
      backgroundColor: 'transparent'
    };

    // Special handling for pie/donut
    if (this.type === 'pie' || this.type === 'donut') {
      options.xAxis = undefined;
      options.yAxis = undefined;
      options.tooltip = { trigger: 'item' };
    }

    this.echartsOptions = options;
  }

  /**
   * Map series to ECharts format
   */
  private mapSeries(): Array<Record<string, unknown>> {
    if (!this.series) return [];

    if (this.type === 'pie' || this.type === 'donut') {
      // ApexCharts series for pie is number[]
      // ECharts series for pie needs { value, name } objects
      const data = this.series.map((val, idx) => ({
        value: val,
        name: this.labels[idx] || `Item ${idx + 1}`
      }));

      return [{
        type: 'pie',
        radius: this.type === 'donut' ? ['40%', '70%'] : '50%',
        data: data,
        label: { show: this.showDataLabels, color: 'var(--color-white, #fff)' }
      }];
    }

    // Line/Bar/Area
    return this.series.map((s: { name: string; data: number[] }) => ({
      name: s.name,
      type: this.mapType(this.type),
      data: s.data,
      smooth: this.curve === 'smooth',
      areaStyle: this.type === 'area' ? { opacity: 0.3 } : undefined,
      label: { show: this.showDataLabels }
    }));
  }

  /**
   * Map ApexCharts type to ECharts type
   */
  private mapType(apexType: string): string {
    const map: Record<string, string> = {
      'line': 'line',
      'area': 'line', // ECharts uses line with areaStyle
      'bar': 'bar',
      'pie': 'pie',
      'donut': 'pie',
      'scatter': 'scatter',
      'bubble': 'scatter', // Approximate
      'radialBar': 'gauge', // Approximate or custom series
      'heatmap': 'heatmap',
      'treemap': 'treemap',
      'candlestick': 'candlestick'
    };
    return map[apexType] || 'line';
  }
}
