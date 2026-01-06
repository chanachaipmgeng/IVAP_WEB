/**
 * ECharts Chart Component
 *
 * A chart component wrapper for ECharts (Apache ECharts) library.
 * Provides comprehensive charting capabilities with support for multiple chart types,
 * interactive features, and extensive customization options.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-echarts-chart
 *   [options]="chartOptions"
 *   [height]="'400px'"
 *   [showControls]="true"
 *   [ariaLabel]="'Sales Chart'">
 * </app-echarts-chart>
 * ```
 */

import { Component, Input, OnInit, OnDestroy, forwardRef, ViewChild, ElementRef, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption, SeriesOption } from 'echarts';

/**
 * ECharts option type alias
 * Using the official EChartsOption type from echarts library
 */
export type { EChartsOption };

/**
 * ECharts data interface
 */
export interface EChartsData {
  labels: string[];
  datasets: {
    name: string;
    data: number[];
    type: 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'gauge' | 'funnel' | 'sankey' | 'treemap' | 'sunburst';
    color?: string;
    smooth?: boolean;
    areaStyle?: any;
    itemStyle?: any;
    label?: any;
    emphasis?: any;
  }[];
}

@Component({
  selector: 'app-echarts-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  template: `
    <div class="echarts-chart-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || label || 'Chart'">
      <label *ngIf="label" [for]="chartId" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1" [attr.aria-label]="'Required'">*</span>
      </label>

      <div class="chart-wrapper">
        <div
          #chartElement
          [id]="chartId"
          echarts
          [options]="chartOptions"
          [initOpts]="initOpts"
          [theme]="theme"
          [loading]="loading"
          [loadingOpts]="loadingOpts"
          (chartInit)="onChartInit($event)"
          (chartClick)="onChartClick($event)"
          (chartDblClick)="onChartDblClick($event)"
          (chartMouseDown)="onChartMouseDown($event)"
          (chartMouseUp)="onChartMouseUp($event)"
          (chartMouseOver)="onChartMouseOver($event)"
          (chartMouseOut)="onChartMouseOut($event)"
          (chartGlobalOut)="onChartGlobalOut($event)"
          (chartContextMenu)="onChartContextMenu($event)"
          (chartDataZoom)="onChartDataZoom($event)"
          (chartLegendSelectChanged)="onChartLegendSelectChanged($event)"
          (chartLegendSelected)="onChartLegendSelected($event)"
          (chartLegendUnselected)="onChartLegendUnselected($event)"
          (chartDataRangeSelected)="onChartDataRangeSelected($event)"
          (chartTimelineChanged)="onChartTimelineChanged($event)"
          (chartTimelinePlayChanged)="onChartTimelinePlayChanged($event)"
          (chartRestore)="onChartRestore($event)"
          (chartDataViewChanged)="onChartDataViewChanged($event)"
          (chartMagicTypeChanged)="onChartMagicTypeChanged($event)"
          (chartPieSelectChanged)="onChartPieSelectChanged($event)"
          (chartPieSelected)="onChartPieSelected($event)"
          (chartPieUnselected)="onChartPieUnselected($event)"
          (chartMapSelectChanged)="onChartMapSelectChanged($event)"
          (chartMapSelected)="onChartMapSelected($event)"
          (chartMapUnselected)="onChartMapUnselected($event)"
          (chartAxisAreaSelected)="onChartAxisAreaSelected($event)"
          (chartFocusNodeAdjacency)="onChartFocusNodeAdjacency($event)"
          (chartUnfocusNodeAdjacency)="onChartUnfocusNodeAdjacency($event)"
          (chartBrush)="onChartBrush($event)"
          (chartBrushEnd)="onChartBrushEnd($event)"
          (chartBrushSelected)="onChartBrushSelected($event)"
          (chartGlobalCursorTaken)="onChartGlobalCursorTaken($event)"
          (chartRendered)="onChartRendered($event)"
          (chartFinished)="onChartFinished($event)"
          role="img"
          [attr.aria-label]="ariaLabel || label || 'Chart'"
          [attr.aria-describedby]="errorMessage ? errorId : (showInfo ? infoId : null)"
          class="chart-element">
        </div>

        <!-- Chart Controls -->
        <div class="chart-controls" *ngIf="showControls" role="toolbar" [attr.aria-label]="'Chart controls'">
          <div class="control-group">
            <button
              type="button"
              (click)="refreshChart()"
              class="control-button"
              [attr.aria-label]="'Refresh chart'"
              [attr.title]="'Refresh Chart'">
              <span [attr.aria-hidden]="true">🔄</span>
            </button>
            <button
              type="button"
              (click)="downloadChart()"
              class="control-button"
              [attr.aria-label]="'Download chart'"
              [attr.title]="'Download Chart'">
              <span [attr.aria-hidden]="true">💾</span>
            </button>
            <button
              type="button"
              (click)="toggleFullscreen()"
              class="control-button"
              [attr.aria-label]="'Toggle fullscreen'"
              [attr.title]="'Toggle Fullscreen'">
              <span [attr.aria-hidden]="true">⛶</span>
            </button>
          </div>
        </div>

        <!-- Chart Info -->
        <div *ngIf="showInfo" [id]="infoId" class="chart-info" role="status" [attr.aria-live]="'polite'">
          <div class="info-item">
            <span class="info-label">Type:</span>
            <span class="info-value">{{ chartType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data Points:</span>
            <span class="info-value">{{ dataPoints }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Series:</span>
            <span class="info-value">{{ seriesCount }}</span>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" [id]="errorId" class="error-message text-red-500 text-sm mt-1" role="alert" [attr.aria-live]="'polite'">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .echarts-chart-container {
      width: 100%;
    }

    .chart-wrapper {
      position: relative;
      height: 400px;
      border-radius: 12px;
      overflow: hidden;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
    }

    .chart-element {
      height: 100%;
      width: 100%;
    }

    .chart-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .control-button {
      width: 40px;
      height: 40px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      backdrop-filter: blur(20px);
      color: var(--text-primary);
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .control-button:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: #3b82f6;
      transform: scale(1.05);
    }

    .chart-info {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      backdrop-filter: blur(20px);
      padding: 8px 12px;
      z-index: 1000;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
    }

    .info-label {
      color: var(--text-secondary);
    }

    .info-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    /* ECharts custom styling */
    ::ng-deep .echarts {
      background: transparent !important;
    }

    ::ng-deep .echarts .ec-tooltip {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 8px !important;
      backdrop-filter: blur(20px) !important;
      color: var(--text-primary) !important;
    }

    ::ng-deep .echarts .ec-legend {
      color: var(--text-primary) !important;
    }

    ::ng-deep .echarts .ec-axis {
      color: var(--text-secondary) !important;
    }

    ::ng-deep .echarts .ec-grid {
      border-color: var(--glass-border) !important;
    }

    ::ng-deep .echarts .ec-dataZoom {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 8px !important;
      backdrop-filter: blur(20px) !important;
    }

    ::ng-deep .echarts .ec-timeline {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 8px !important;
      backdrop-filter: blur(20px) !important;
    }

    ::ng-deep .echarts .ec-toolbox {
      background: var(--glass-bg) !important;
      border: 1px solid var(--glass-border) !important;
      border-radius: 8px !important;
      backdrop-filter: blur(20px) !important;
    }

    .fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9999 !important;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EChartsChartComponent),
      multi: true
    }
  ]
})
export class EChartsChartComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  /**
   * Chart element reference
   */
  @ViewChild('chartElement', { static: true }) chartElement!: ElementRef;

  /**
   * Chart label
   */
  @Input() label: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * Show controls
   */
  @Input() showControls: boolean = true;

  /**
   * Show info
   */
  @Input() showInfo: boolean = true;

  /**
   * Chart height
   */
  @Input() height: string = '400px';

  /**
   * Chart width
   */
  @Input() width: string = '100%';

  /**
   * Chart theme
   */
  @Input() theme: string = 'dark';

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Chart type
   */
  @Input() chartType: string = 'line';

  /**
   * Chart data
   */
  @Input() data: EChartsData | null = null;

  /**
   * Chart options
   */
  @Input() options: EChartsOption | null = null;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Chart options
   */
  chartOptions: EChartsOption = {};

  /**
   * Initialization options
   */
  initOpts = {
    renderer: 'canvas' as const,
    useDirtyRect: false
  };

  /**
   * Loading options
   */
  loadingOpts = {
    text: 'Loading...',
    color: '#3b82f6',
    textColor: '#ffffff',
    maskColor: 'rgba(0, 0, 0, 0.3)',
    zlevel: 0
  };

  /**
   * Chart instance
   */
  private chartInstance: echarts.ECharts | null = null;

  /**
   * Fullscreen state
   */
  private isFullscreen: boolean = false;

  /**
   * Unique chart ID
   */
  chartId: string = `echarts-chart-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique error ID
   */
  errorId: string = `${this.chartId}-error`;

  /**
   * Unique info ID
   */
  infoId: string = `${this.chartId}-info`;

  /**
   * Chart info - data points count
   */
  dataPoints: number = 0;

  /**
   * Chart info - series count
   */
  seriesCount: number = 0;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (value: EChartsOption) => {};

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => {};

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeChart();
  }

  /**
   * Handle input changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['options']) {
      this.updateChart();
    }
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  /**
   * Initialize chart
   */
  private initializeChart(): void {
    this.updateChart();
  }

  /**
   * Update chart
   */
  private updateChart(): void {
    if (this.options) {
      this.chartOptions = this.options;
    } else if (this.data) {
      this.chartOptions = this.convertDataToOptions(this.data);
    } else {
      this.chartOptions = this.getDefaultOptions();
    }

    this.updateChartInfo();
  }

  /**
   * Convert data to ECharts options
   */
  private convertDataToOptions(data: EChartsData): EChartsOption {
    const option: EChartsOption = {
      title: {
        text: 'Chart Title',
        left: 'center',
        textStyle: {
          color: '#ffffff',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        textStyle: {
          color: '#ffffff'
        }
      },
      legend: {
        data: data.datasets.map(dataset => dataset.name),
        textStyle: {
          color: '#ffffff'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisLine: {
          lineStyle: {
            color: '#6b7280'
          }
        },
        axisLabel: {
          color: '#9ca3af'
        }
      },
      yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#6b7280'
            }
          },
          axisLabel: {
            color: '#9ca3af'
          }
        },
        series: data.datasets.map(dataset => ({
          name: dataset.name,
          type: dataset.type,
          data: dataset.data,
          smooth: dataset.smooth || false,
          areaStyle: dataset.areaStyle,
          itemStyle: dataset.itemStyle || {
            color: dataset.color || '#3b82f6'
          },
          label: dataset.label,
          emphasis: dataset.emphasis
        })) as SeriesOption[],
        color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
        backgroundColor: 'transparent',
        textStyle: {
          color: '#ffffff'
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      };

    return option;
  }

  /**
   * Get default chart options
   */
  private getDefaultOptions(): EChartsOption {
      return {
        title: {
          text: 'Sample Chart',
          left: 'center',
          textStyle: {
            color: '#ffffff',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          data: ['Sample Data'],
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: {
            lineStyle: {
              color: '#6b7280'
            }
          },
          axisLabel: {
            color: '#9ca3af'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#6b7280'
            }
          },
          axisLabel: {
            color: '#9ca3af'
          }
        },
        series: [{
          name: 'Sample Data',
          type: 'line',
          data: [120, 200, 150, 80, 70, 110, 130],
          smooth: true,
          itemStyle: {
            color: '#3b82f6'
          }
        }],
        color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
        backgroundColor: 'transparent',
        textStyle: {
          color: '#ffffff'
        },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      };
  }

  /**
   * Update chart info
   */
  private updateChartInfo(): void {
      if (this.data) {
        this.dataPoints = this.data.labels.length;
        this.seriesCount = this.data.datasets.length;
      } else {
        this.dataPoints = 0;
        this.seriesCount = 0;
      }
    }

  /**
   * Handle chart initialization
   */
  onChartInit(chart: any): void {
    this.chartInstance = chart;
  }

  /**
   * Handle chart click
   */
  onChartClick(event: unknown): void {
    this.onTouched();
  }

  /**
   * Handle chart double click
   */
  onChartDblClick(event: unknown): void {
    // Chart double clicked - implement custom behavior if needed
  }

  /**
   * Handle chart mouse down
   */
  onChartMouseDown(event: unknown): void {
    // Chart mouse down - implement custom behavior if needed
  }

  /**
   * Handle chart mouse up
   */
  onChartMouseUp(event: unknown): void {
    // Chart mouse up - implement custom behavior if needed
  }

  /**
   * Handle chart mouse over
   */
  onChartMouseOver(event: unknown): void {
    // Chart mouse over - implement custom behavior if needed
  }

  /**
   * Handle chart mouse out
   */
  onChartMouseOut(event: unknown): void {
    // Chart mouse out - implement custom behavior if needed
  }

  /**
   * Handle chart global out
   */
  onChartGlobalOut(event: unknown): void {
    // Chart global out - implement custom behavior if needed
  }

  /**
   * Handle chart context menu
   */
  onChartContextMenu(event: unknown): void {
    // Chart context menu - implement custom behavior if needed
  }

  /**
   * Handle chart data zoom
   */
  onChartDataZoom(event: unknown): void {
    // Chart data zoom - implement custom behavior if needed
  }

  /**
   * Handle chart legend select changed
   */
  onChartLegendSelectChanged(event: unknown): void {
    // Chart legend select changed - implement custom behavior if needed
  }

  /**
   * Handle chart legend selected
   */
  onChartLegendSelected(event: unknown): void {
    // Chart legend selected - implement custom behavior if needed
  }

  /**
   * Handle chart legend unselected
   */
  onChartLegendUnselected(event: unknown): void {
    // Chart legend unselected - implement custom behavior if needed
  }

  /**
   * Handle chart data range selected
   */
  onChartDataRangeSelected(event: unknown): void {
    // Chart data range selected - implement custom behavior if needed
  }

  /**
   * Handle chart timeline changed
   */
  onChartTimelineChanged(event: unknown): void {
    // Chart timeline changed - implement custom behavior if needed
  }

  /**
   * Handle chart timeline play changed
   */
  onChartTimelinePlayChanged(event: unknown): void {
    // Chart timeline play changed - implement custom behavior if needed
  }

  /**
   * Handle chart restore
   */
  onChartRestore(event: unknown): void {
    // Chart restore - implement custom behavior if needed
  }

  /**
   * Handle chart data view changed
   */
  onChartDataViewChanged(event: unknown): void {
    // Chart data view changed - implement custom behavior if needed
  }

  /**
   * Handle chart magic type changed
   */
  onChartMagicTypeChanged(event: unknown): void {
    // Chart magic type changed - implement custom behavior if needed
  }

  /**
   * Handle chart pie select changed
   */
  onChartPieSelectChanged(event: unknown): void {
    // Chart pie select changed - implement custom behavior if needed
  }

  /**
   * Handle chart pie selected
   */
  onChartPieSelected(event: unknown): void {
    // Chart pie selected - implement custom behavior if needed
  }

  /**
   * Handle chart pie unselected
   */
  onChartPieUnselected(event: unknown): void {
    // Chart pie unselected - implement custom behavior if needed
  }

  /**
   * Handle chart map select changed
   */
  onChartMapSelectChanged(event: unknown): void {
    // Chart map select changed - implement custom behavior if needed
  }

  /**
   * Handle chart map selected
   */
  onChartMapSelected(event: unknown): void {
    // Chart map selected - implement custom behavior if needed
  }

  /**
   * Handle chart map unselected
   */
  onChartMapUnselected(event: unknown): void {
    // Chart map unselected - implement custom behavior if needed
  }

  /**
   * Handle chart axis area selected
   */
  onChartAxisAreaSelected(event: unknown): void {
    // Chart axis area selected - implement custom behavior if needed
  }

  /**
   * Handle chart focus node adjacency
   */
  onChartFocusNodeAdjacency(event: unknown): void {
    // Chart focus node adjacency - implement custom behavior if needed
  }

  /**
   * Handle chart unfocus node adjacency
   */
  onChartUnfocusNodeAdjacency(event: unknown): void {
    // Chart unfocus node adjacency - implement custom behavior if needed
  }

  /**
   * Handle chart brush
   */
  onChartBrush(event: unknown): void {
    // Chart brush - implement custom behavior if needed
  }

  /**
   * Handle chart brush end
   */
  onChartBrushEnd(event: unknown): void {
    // Chart brush end - implement custom behavior if needed
  }

  /**
   * Handle chart brush selected
   */
  onChartBrushSelected(event: unknown): void {
    // Chart brush selected - implement custom behavior if needed
  }

  /**
   * Handle chart global cursor taken
   */
  onChartGlobalCursorTaken(event: unknown): void {
    // Chart global cursor taken - implement custom behavior if needed
  }

  /**
   * Handle chart rendered
   */
  onChartRendered(event: unknown): void {
    // Chart rendered - implement custom behavior if needed
  }

  /**
   * Handle chart finished
   */
  onChartFinished(event: unknown): void {
    // Chart finished - implement custom behavior if needed
  }

  /**
   * Refresh chart
   */
  refreshChart(): void {
    if (this.chartInstance) {
      this.chartInstance.resize();
    }
  }

  /**
   * Download chart as image
   */
  downloadChart(): void {
    if (this.chartInstance) {
      const url = this.chartInstance.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#1a1a2e'
      });

      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = url;
      link.click();
    }
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    const chartWrapper = document.querySelector('.chart-wrapper') as HTMLElement;

    if (chartWrapper) {
      if (this.isFullscreen) {
        chartWrapper.classList.add('fullscreen');
      } else {
        chartWrapper.classList.remove('fullscreen');
      }
    }

    // Trigger chart resize
    setTimeout(() => {
      this.refreshChart();
    }, 100);
  }

  /**
   * Write value from form control
   */
  writeValue(value: EChartsOption): void {
    if (value) {
      this.options = value;
      this.updateChart();
    }
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: EChartsOption) => void): void {
    this.onChange = fn;
  }

  /**
   * Register onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    // Implementation for disabled state
  }
  }
