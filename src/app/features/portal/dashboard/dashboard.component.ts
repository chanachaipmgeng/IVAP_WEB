/**
 * Dashboard Component
 *
 * Main dashboard component displaying portal statistics, charts, recent check-ins, and upcoming events.
 * Provides real-time data visualization and quick access to key metrics.
 *
 * @example
 * ```html
 * <app-dashboard></app-dashboard>
 * ```
 */

import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { EChartsChartComponent, EChartsOption } from '../../../shared/components/echarts-chart/echarts-chart.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    GlassCardComponent,
    LoadingComponent,
    EChartsChartComponent,
    PageLayoutComponent,
    StatisticsGridComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);

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
        icon: '✓',
        label: this.i18n.t('pages.dashboard.activeVisitors'),
        value: s.activeVisitors || 0,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '🎉',
        label: this.i18n.t('pages.dashboard.totalEvents'),
        value: s.totalEvents || 0,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '📅',
        label: this.i18n.t('pages.dashboard.upcomingEvents'),
        value: s.upcomingEvents || 0,
        iconBgClass: 'bg-indigo-100 dark:bg-indigo-900'
      },
      {
        icon: '🚪',
        label: this.i18n.t('pages.dashboard.totalDoors'),
        value: s.totalDoors || 0,
        iconBgClass: 'bg-pink-100 dark:bg-pink-900'
      },
      {
        icon: '🟢',
        label: this.i18n.t('pages.dashboard.onlineDoors'),
        value: s.onlineDoors || 0,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
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
    // Update chart labels when language changes
    // effect() must be called in constructor (injection context)
    effect(() => {
      // Access the signal to create a dependency
      this.i18n.currentLanguage();
      this.updateChartLabels();
    });
  }

  ngOnInit(): void {
    this.updateChartLabels();
    this.loadDashboardData();
  }

  /**
   * Update chart labels based on current language
   * Note: Chart options are now computed signals that automatically update when language changes
   */
  updateChartLabels(): void {
    // Chart options are computed signals, so they automatically update when i18n.currentLanguage() changes
    // No manual update needed
  }

  /**
   * Load dashboard data and statistics
   */
  loadDashboardData(): void {
    this.errorMessage.set('');
    this.loadingState.set(true);

    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.errorMessage.set('Company ID not found');
      this.loadingState.set(false);
      return;
    }

    // Convert companyId to string (UUID)
    const companyIdStr = String(companyId);

    // Load dashboard stats
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.dashboardService.getDashboardStats(companyIdStr),
      (response) => {
        // Map response to Dashboard format
        this.dashboardData.set({
          id: companyId,
          companyId: companyId,
          summary: response.summary,
          chartData: response.chart_data,
          recentActivity: response.recent_activity || []
        } as any);
        this.loadingState.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set(this.i18n.t('common.errorLoadingData'));
        this.loadingState.set(false);
      }
    );

    // Load statistics (using dashboard stats as portal statistics)
    this.subscribe(
      this.dashboardService.getDashboardStats(companyIdStr),
      (response) => {
        // Map dashboard stats to PortalStatistics format
        const stats: PortalStatistics = {
          totalEmployees: 0, // Should come from another endpoint
          activeEmployees: 0,
          totalVisitors: 0,
          activeVisitors: 0,
          totalGuests: 0,
          activeGuests: 0,
          totalVehicles: 0,
          parkedVehicles: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          totalDoors: 0,
          onlineDoors: 0,
          totalLocations: 0,
          activeLocations: 0,
          totalShifts: 0,
          activeShifts: 0,
          totalReports: 0,
          unreadNotifications: 0
        };
        this.statisticsData.set(stats);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for statistics as it's not critical
      }
    );

    // Load additional statistics
    this.loadVisitorStatistics();
    this.loadGuestStatistics();
    this.loadVehicleStatistics();
    this.loadDeviceStatistics();
  }

  /**
   * Load visitor statistics
   */
  loadVisitorStatistics(): void {
    const companyId = this.auth.currentUser()?.companyId || '';
    if (!companyId) return;
    this.api.get<any>(`/visitors/company/${companyId}/statistics`).subscribe({
      next: (response) => {
        this.visitorStats.set(response.data || response);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for statistics as it's not critical
      }
    });
  }

  /**
   * Load guest statistics
   */
  loadGuestStatistics(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.guestService.getGuestStats(),
      (stats) => {
        this.guestStats.set(stats);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for statistics as it's not critical
      }
    );
  }

  /**
   * Load vehicle statistics
   */
  loadVehicleStatistics(): void {
    const companyId = this.auth.currentUser()?.companyId || '';
    if (!companyId) return;
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<any>(`/vehicles/company/${companyId}/statistics`),
      (response) => {
        this.vehicleStats.set(response.data || response);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for statistics as it's not critical
      }
    );
  }

  /**
   * Load device statistics
   */
  loadDeviceStatistics(): void {
    const companyId = this.auth.currentUser()?.companyId || '';
    if (!companyId) return;
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<any>(`/devices/company/${companyId}/devices/statistics`),
      (response) => {
        this.deviceStats.set(response.data || response);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for statistics as it's not critical
      }
    );
  }

  /**
   * Get recent check-ins (mock data)
   */
  getRecentCheckIns(): any[] {
    // Mock data for recent check-ins
    return [
      { id: '1', name: 'John Doe', time: '9:15 AM', status: 'present' },
      { id: '2', name: 'Jane Smith', time: '9:20 AM', status: 'present' },
      { id: '3', name: 'Mike Johnson', time: '9:25 AM', status: 'late' }
    ];
  }

  /**
   * Get upcoming events (mock data)
   */
  getUpcomingEvents(): any[] {
    // Mock data for upcoming events
    return [
      { id: '1', name: 'Team Meeting', date: 'Today 2:00 PM', type: 'Meeting' },
      { id: '2', name: 'Training Session', date: 'Tomorrow 10:00 AM', type: 'Training' },
      { id: '3', name: 'Company Event', date: 'Friday 6:00 PM', type: 'Event' }
    ];
  }

  /**
   * Get current date formatted string
   */
  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Refresh dashboard data
   */
  refreshData(): void {
    this.material.showInfoSnackbar(this.i18n.t('pages.dashboard.refreshingDashboardData'));
    this.loadDashboardData();
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}

