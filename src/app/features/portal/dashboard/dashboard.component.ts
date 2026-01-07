import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router'; // Added Router, RouterModule
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
// Removed LoadingComponent import
import { EChartsChartComponent, EChartsOption } from '../../../shared/components/echarts-chart/echarts-chart.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { MaterialService } from '../../../shared/services/material.service';
import { ApiService } from '../../../core/services/api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { GuestService } from '../../../core/services/guest.service';
import { PortalStatistics, Dashboard } from '../../../core/models/portal.model';
import { BaseComponent } from '../../../core/base/base.component';

interface ModuleShortcut {
  id: string;
  icon: string;
  label: string;
  description: string;
  route: string;
  colorClass: string; // Tailwind text color class for icon
  bgClass: string;    // Tailwind bg color class for icon container
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule, // Added RouterModule
    GlassCardComponent,
    // Removed LoadingComponent from imports
    EChartsChartComponent,
    PageLayoutComponent,
    StatisticsGridComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router); // Inject Router

  // Local state
  private dashboardData = signal<Dashboard | null>(null);
  private statisticsData = signal<PortalStatistics | null>(null);
  private loadingState = signal(false);

  // Getters
  getLoading = () => this.loadingState.asReadonly();
  getStatistics = () => this.statisticsData.asReadonly();
  getDashboard = () => this.dashboardData.asReadonly();

  // Additional statistics signals
  visitorStats = signal<any>(null);
  guestStats = signal<any>(null);
  vehicleStats = signal<any>(null);
  deviceStats = signal<any>(null);
  errorMessage = signal<string>('');

  // Module Shortcuts Data
  moduleShortcuts = signal<ModuleShortcut[]>([
    {
      id: 'company',
      icon: '🏢',
      label: 'การจัดการข้อมูลบริษัท',
      description: 'Overview, Profile, Structure, Reports',
      route: '/portal/company-dashboard',
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      id: 'face-recognition',
      icon: '👁️',
      label: 'Face Recognition',
      description: 'Live Monitor, Enrollment, Watchlist',
      route: '/portal/face-recognition-live',
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
      id: 'event',
      icon: '🎉',
      label: 'Event Management',
      description: 'Events, Registration, Kiosk Config',
      route: '/portal/event-dashboard',
      colorClass: 'text-pink-600 dark:text-pink-400',
      bgClass: 'bg-pink-100 dark:bg-pink-900/30'
    },
    {
      id: 'video-analytics',
      icon: '🔬',
      label: 'Video Analytics',
      description: 'Playback, Heatmaps, Zone Config',
      route: '/portal/video-analytics',
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      id: 'access-control',
      icon: '🚪',
      label: 'Access Control',
      description: 'Doors, Access Groups, Schedules',
      route: '/portal/access-dashboard',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      id: 'attendance',
      icon: '📋',
      label: 'Attendance',
      description: 'Time Records, Shifts, Leaves',
      route: '/portal/attendance-dashboard',
      colorClass: 'text-teal-600 dark:text-teal-400',
      bgClass: 'bg-teal-100 dark:bg-teal-900/30'
    },
    {
      id: 'visitor',
      icon: '🚶',
      label: 'Visitor Management',
      description: 'Visitors, Invitations, Blacklist',
      route: '/portal/visitor-dashboard',
      colorClass: 'text-cyan-600 dark:text-cyan-400',
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/30'
    },
    {
      id: 'parking',
      icon: '🚗',
      label: 'Vehicle & Parking',
      description: 'Parking Lots, Vehicles, Rules',
      route: '/portal/parking-dashboard',
      colorClass: 'text-orange-600 dark:text-orange-400',
      bgClass: 'bg-orange-100 dark:bg-orange-900/30'
    },
    {
      id: 'surveillance',
      icon: '🛡️',
      label: 'Smart Surveillance',
      description: 'GIS Map, Alerts, Incident Reports',
      route: '/portal/surveillance-map',
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-100 dark:bg-red-900/30'
    },
    {
      id: 'system',
      icon: '⚙️',
      label: 'System Management',
      description: 'Users, Devices, Settings, Logs',
      route: '/portal/hardware-status-dashboard',
      colorClass: 'text-gray-600 dark:text-gray-400',
      bgClass: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      id: 'kiosk',
      icon: '🌐',
      label: 'Public & Kiosk',
      description: 'Kiosk Display, Self Service',
      route: '/kiosk/default-device',
      colorClass: 'text-lime-600 dark:text-lime-400',
      bgClass: 'bg-lime-100 dark:bg-lime-900/30'
    },
    {
      id: 'demo',
      icon: '🧪',
      label: 'Demo & Lab',
      description: 'Experimental Features, UI Components',
      route: '/portal/advanced-ui-demo',
      colorClass: 'text-violet-600 dark:text-violet-400',
      bgClass: 'bg-violet-100 dark:bg-violet-900/30'
    }
  ]);

  /**
   * TrackBy function for recent check-ins
   */
  trackByCheckIn(index: number, checkIn: any): string {
    return checkIn.id || index.toString();
  }

  /**
   * TrackBy function for upcoming events
   */
  trackByEvent(index: number, event: any): string {
    return event.id || index.toString();
  }

  // Computed signals
  stats = computed(() => this.getStatistics()());
  recentCheckIns = computed(() => this.getRecentCheckIns());
  upcomingEvents = computed(() => this.getUpcomingEvents());

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    return [
      {
        icon: '👥',
        label: this.i18n.t('pages.dashboard.totalEmployees'),
        value: s.totalEmployees || 0,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✓',
        label: this.i18n.t('pages.dashboard.activeEmployees'),
        value: s.activeEmployees || 0,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '👤',
        label: this.i18n.t('pages.dashboard.totalVisitors'),
        value: s.totalVisitors || 0,
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      },
      {
        icon: '🎉',
        label: this.i18n.t('pages.dashboard.totalEvents'),
        value: s.totalEvents || 0,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('pages.dashboard.refreshData'),
      variant: 'secondary',
      onClick: () => this.refreshData()
    }
  ]);

  // ECharts Options - computed from data
  attendanceChartOptions = computed<EChartsOption>(() => {
    const presentLabel = this.i18n.t('pages.dashboard.present');
    const absentLabel = this.i18n.t('pages.dashboard.absent');
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        textStyle: { color: '#ffffff' }
      },
      legend: {
        data: [presentLabel, absentLabel],
        textStyle: { color: '#ffffff' },
        top: 'top'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#6b7280' } },
        axisLabel: { color: '#9ca3af' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#6b7280' } },
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: 'rgba(59, 130, 246, 0.1)' } }
      },
      series: [
        {
          name: presentLabel,
          type: 'line',
          data: [85, 92, 78, 96, 88, 45, 32],
          smooth: true,
          areaStyle: { opacity: 0.2 },
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6', width: 2 }
        },
        {
          name: absentLabel,
          type: 'line',
          data: [15, 8, 22, 4, 12, 55, 68],
          smooth: true,
          areaStyle: { opacity: 0.2 },
          itemStyle: { color: '#ef4444' },
          lineStyle: { color: '#ef4444', width: 2 }
        }
      ],
      color: ['#3b82f6', '#ef4444'],
      backgroundColor: 'transparent',
      textStyle: { color: '#ffffff' },
      animation: true,
      animationDuration: 1000
    };
  });

  doorChartOptions = computed<EChartsOption>(() => {
    const onlineLabel = this.i18n.t('pages.dashboard.online');
    const offlineLabel = this.i18n.t('pages.dashboard.offline');
    const maintenanceLabel = this.i18n.t('pages.dashboard.maintenance');
    
    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        textStyle: { color: '#ffffff' },
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        data: [onlineLabel, offlineLabel, maintenanceLabel],
        textStyle: { color: '#ffffff' },
        bottom: 'bottom'
      },
      series: [
        {
          name: 'Doors',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#ffffff'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          data: [
            { value: 8, name: onlineLabel, itemStyle: { color: '#10b981' } },
            { value: 2, name: offlineLabel, itemStyle: { color: '#ef4444' } },
            { value: 1, name: maintenanceLabel, itemStyle: { color: '#f59e0b' } }
          ]
        }
      ],
      backgroundColor: 'transparent',
      textStyle: { color: '#ffffff' },
      animation: true,
      animationDuration: 1000
    };
  });

  constructor(
    private api: ApiService,
    private dashboardService: DashboardService,
    private auth: AuthService,
    public i18n: I18nService,
    private material: MaterialService,
    private guestService: GuestService
  ) {
    super();
    effect(() => {
      this.i18n.currentLanguage();
      this.updateChartLabels();
    });
  }

  ngOnInit(): void {
    this.updateChartLabels();
    this.loadDashboardData();
  }

  updateChartLabels(): void {
    // Chart options are computed signals, automatic update
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  loadDashboardData(): void {
    this.errorMessage.set('');
    this.loadingState.set(true);

    const companyId = this.auth.currentUser()?.companyId;
    // For demo/dev purposes, load mock data even without company ID
    // In production, this would return or handle error
    
    const companyIdStr = companyId ? String(companyId) : 'mock-company-id';

    // Load dashboard stats
    this.subscribe(
      this.dashboardService.getDashboardStats(companyIdStr),
      (response) => {
        this.dashboardData.set({
          id: companyIdStr,
          companyId: companyIdStr,
          summary: response.summary,
          chartData: response.chart_data,
          recentActivity: response.recent_activity || []
        } as any);
        this.loadingState.set(false);
      },
      (error) => {
        // Fallback to mock data if API fails
        this.loadingState.set(false);
      }
    );

    // Mock initial stats
    this.statisticsData.set({
      totalEmployees: 142,
      activeEmployees: 128,
      totalVisitors: 45,
      activeVisitors: 12,
      totalGuests: 8,
      activeGuests: 3,
      totalVehicles: 85,
      parkedVehicles: 60,
      totalEvents: 5,
      upcomingEvents: 2,
      totalDoors: 24,
      onlineDoors: 22,
      totalLocations: 3,
      activeLocations: 3,
      totalShifts: 4,
      activeShifts: 2,
      totalReports: 156,
      unreadNotifications: 3
    });
  }

  loadVisitorStatistics(): void {}
  loadGuestStatistics(): void {}
  loadVehicleStatistics(): void {}
  loadDeviceStatistics(): void {}

  getRecentCheckIns(): any[] {
    return [
      { id: '1', name: 'John Doe', time: '9:15 AM', status: 'present' },
      { id: '2', name: 'Jane Smith', time: '9:20 AM', status: 'present' },
      { id: '3', name: 'Mike Johnson', time: '9:25 AM', status: 'late' }
    ];
  }

  getUpcomingEvents(): any[] {
    return [
      { id: '1', name: 'Team Meeting', date: 'Today 2:00 PM', type: 'Meeting' },
      { id: '2', name: 'Training Session', date: 'Tomorrow 10:00 AM', type: 'Training' },
      { id: '3', name: 'Company Event', date: 'Friday 6:00 PM', type: 'Event' }
    ];
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  refreshData(): void {
    this.material.showInfoSnackbar(this.i18n.t('pages.dashboard.refreshingDashboardData'));
    this.loadDashboardData();
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
