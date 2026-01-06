/**
 * ECharts Demo Component
 *
 * Demo component showcasing ECharts chart component with various chart types.
 * Demonstrates line, bar, pie, scatter, radar, gauge, funnel, sankey, treemap, and sunburst charts.
 *
 * @example
 * ```html
 * <app-echarts-demo></app-echarts-demo>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { EChartsChartComponent, EChartsData, EChartsOption } from '../../../shared/components/echarts-chart/echarts-chart.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-echarts-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    EChartsChartComponent
  ],
  templateUrl: './echarts-demo.component.html',
  styleUrl: './echarts-demo.component.scss'
})
export class EChartsDemoComponent implements OnInit {
  // Chart Data
  selectedChartType = signal<string>('line');
  chartData = signal<EChartsData | null>(null);
  customOptions = signal<EChartsOption | null>(null);

  // Demo data
  demoData = signal({
    totalCharts: 0,
    activeCharts: 0,
    lastUpdated: new Date()
  });

  // Chart types
  chartTypes = [
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'pie', label: 'Pie Chart', icon: '🥧' },
    { value: 'scatter', label: 'Scatter Plot', icon: '🔵' },
    { value: 'radar', label: 'Radar Chart', icon: '🕸️' },
    { value: 'gauge', label: 'Gauge Chart', icon: '⏱️' },
    { value: 'funnel', label: 'Funnel Chart', icon: '🔽' },
    { value: 'sankey', label: 'Sankey Diagram', icon: '🌊' },
    { value: 'treemap', label: 'Treemap', icon: '🌳' },
    { value: 'sunburst', label: 'Sunburst', icon: '☀️' }
  ];

  // Sample datasets
  sampleDatasets = {
    sales: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          name: 'Sales',
          data: [120, 200, 150, 80, 70, 110],
          type: 'line' as const,
          color: '#3b82f6',
          smooth: true
        },
        {
          name: 'Profit',
          data: [80, 150, 120, 60, 50, 90],
          type: 'line' as const,
          color: '#10b981',
          smooth: true
        }
      ]
    },
    revenue: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          name: 'Revenue',
          data: [1000, 1200, 1100, 1300],
          type: 'bar' as const,
          color: '#8b5cf6'
        }
      ]
    },
    distribution: {
      labels: ['Desktop', 'Mobile', 'Tablet', 'Other'],
      datasets: [
        {
          name: 'Device Distribution',
          data: [45, 35, 15, 5],
          type: 'pie' as const,
          color: '#06b6d4'
        }
      ]
    },
    performance: {
      labels: ['CPU', 'Memory', 'Disk', 'Network', 'GPU'],
      datasets: [
        {
          name: 'Performance',
          data: [85, 70, 60, 90, 75],
          type: 'radar' as const,
          color: '#f59e0b'
        }
      ]
    }
  };

  constructor(private i18n: I18nService) {}

  ngOnInit(): void {
    this.loadDemoData();
    this.generateChart();
  }

  loadDemoData(): void {
    this.demoData.update(data => ({
      ...data,
      totalCharts: this.chartTypes.length,
      activeCharts: 1,
      lastUpdated: new Date()
    }));
  }

  generateChart(): void {
    const chartType = this.selectedChartType();
    let data: EChartsData | null = null;

    switch (chartType) {
      case 'line':
        data = this.sampleDatasets.sales;
        break;
      case 'bar':
        data = this.sampleDatasets.revenue;
        break;
      case 'pie':
        data = this.sampleDatasets.distribution;
        break;
      case 'radar':
        data = this.sampleDatasets.performance;
        break;
      default:
        data = this.sampleDatasets.sales;
    }

    this.chartData.set(data);
    this.updateDemoData();
  }

  updateDemoData(): void {
    this.demoData.update(data => ({
      ...data,
      activeCharts: 1,
      lastUpdated: new Date()
    }));
  }

  onChartTypeChange(chartType: string): void {
    this.selectedChartType.set(chartType);
    this.generateChart();
  }

  generateCustomChart(): void {
    const customOption: EChartsOption = {
      title: {
        text: 'Custom ECharts Configuration',
        left: 'center',
        textStyle: {
          color: '#ffffff',
          fontSize: 20
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
        data: ['Custom Series 1', 'Custom Series 2'],
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
        data: ['A', 'B', 'C', 'D', 'E', 'F'],
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
      series: [
        {
          name: 'Custom Series 1',
          type: 'line',
          data: [120, 200, 150, 80, 70, 110],
          smooth: true,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
              ]
            }
          },
          itemStyle: {
            color: '#3b82f6'
          }
        },
        {
          name: 'Custom Series 2',
          type: 'bar',
          data: [80, 150, 120, 60, 50, 90],
          itemStyle: {
            color: '#10b981'
          }
        }
      ],
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#ffffff'
      },
      animation: true,
      animationDuration: 2000,
      animationEasing: 'elasticOut'
    };

    this.customOptions.set(customOption);
    this.updateDemoData();
  }

  generateRandomData(): void {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const randomData = labels.map(() => Math.floor(Math.random() * 200) + 50);

    const data: EChartsData = {
      labels: labels,
      datasets: [
        {
          name: 'Random Data',
          data: randomData,
          type: this.selectedChartType() as any,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          smooth: true
        }
      ]
    };

    this.chartData.set(data);
    this.updateDemoData();
  }

  exportChart(): void {
    // This would be handled by the chart component
    console.log('Exporting chart...');
  }

  resetChart(): void {
    this.chartData.set(null);
    this.customOptions.set(null);
    this.updateDemoData();
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}



