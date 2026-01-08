import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, NgxEchartsModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit {
  stats = signal([
    { label: 'Total Companies', value: '15', change: '+2', trend: 'up' },
    { label: 'Total Users', value: '1,245', change: '+45', trend: 'up' },
    { label: 'Active Modules', value: '45', change: '+5', trend: 'up' },
    { label: 'System Health', value: '99.9%', change: '0%', trend: 'stable' }
  ]);

  revenueChartOption: EChartsOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [{
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#6366f1' }
    }]
  };

  usageChartOption: EChartsOption = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'Module Usage',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 1048, name: 'Attendance' },
        { value: 735, name: 'Access Control' },
        { value: 580, name: 'Visitor' },
        { value: 484, name: 'Parking' },
        { value: 300, name: 'Video Analytics' }
      ]
    }]
  };

  constructor() {}

  ngOnInit() {}
}





