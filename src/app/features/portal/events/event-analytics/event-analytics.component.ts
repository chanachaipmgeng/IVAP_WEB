/**
 * Event Analytics Component
 *
 * Component for displaying event analytics and statistics.
 * Shows registration trends, attendance rates, and event performance metrics.
 *
 * @example
 * ```html
 * <app-event-analytics></app-event-analytics>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { PageLayoutComponent, PageAction } from '../../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../../shared/components/filter-section/filter-section.component';
import { ApiService } from '../../../../core/services/api.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { EventService } from '../../../../core/services/event.service';
import { I18nService } from '../../../../core/services/i18n.service';

/**
 * Event statistics interface
 */
interface EventStats {
  eventId: string;
  eventName: string;
  totalRegistrations: number;
  checkedIn: number;
  attendanceRate: number;
  confirmedEmails: number;
  startDate: string;
  endDate: string;
  status: string;
}

/**
 * Analytics data interface
 */
interface AnalyticsData {
  totalEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
  averageAttendanceRate: number;
  eventsByStatus: { [key: string]: number };
  eventsByType: { [key: string]: number };
  registrationTrend: { date: string; count: number }[];
  attendanceTrend: { date: string; count: number }[];
  topEvents: EventStats[];
}

@Component({
  selector: 'app-event-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageLayoutComponent,
    FilterSectionComponent
  ],
  templateUrl: './event-analytics.component.html',
  styleUrl: './event-analytics.component.scss'
})
export class EventAnalyticsComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);
  private api = inject(ApiService);
  private eventService = inject(EventService);
  private i18n = inject(I18nService);
  private router = inject(Router);

  loading = signal(false);
  analyticsData = signal<AnalyticsData | null>(null);
  events = signal<any[]>([]);
  errorMessage = signal<string>('');

  // Computed for easier template access
  data = computed(() => this.analyticsData());

  // Filters
  dateRange = signal<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  filterStatus = signal<string>('');
  filterEventType = signal<string>('');

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'dateStart',
      label: 'Start Date',
      type: 'date',
      value: this.dateRange().start
    },
    {
      key: 'dateEnd',
      label: 'End Date',
      type: 'date',
      value: this.dateRange().end
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' }
      ],
      value: this.filterStatus()
    },
    {
      key: 'eventType',
      label: 'Event Type',
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'meeting', label: 'Meeting' },
        { value: 'training', label: 'Training' },
        { value: 'conference', label: 'Conference' },
        { value: 'social', label: 'Social' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'seminar', label: 'Seminar' },
        { value: 'webinar', label: 'Webinar' },
        { value: 'other', label: 'Other' }
      ],
      value: this.filterEventType()
    }
  ]);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.back'),
      variant: 'secondary',
      onClick: () => this.router.navigate(['/portal/events'])
    },
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadAnalytics()
    }
  ]);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // Load all events first
    const params: any = {
      page: 1,
      size: 1000, // Get all events for analytics
      status: this.filterStatus() || undefined,
      eventType: this.filterEventType() || undefined
    };

    this.eventService.getAll(params).subscribe({
      next: (response) => {
        const events = response.data || [];
        this.events.set(events);

        // Load statistics for each event
        this.loadEventStatistics(events);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Analytics ได้');
        this.loading.set(false);
      }
    });
  }

  loadEventStatistics(events: any[]): void {
    const eventStatsPromises = events.map(event => {
      const eventId = event.eventId || event.id;
      return this.api.get<any>(`/events/${eventId}/statistics`).toPromise().catch(() => null);
    });

    Promise.all(eventStatsPromises).then((statsResults) => {
      const eventStats: EventStats[] = [];
      let totalRegistrations = 0;
      let totalCheckedIn = 0;
      const eventsByStatus: { [key: string]: number } = {};
      const eventsByType: { [key: string]: number } = {};

      events.forEach((event, index) => {
        const stats = statsResults[index];
        if (stats) {
          const data = stats.data || stats;
          const registrations = data.total_registrations || data.totalRegistrations || 0;
          const checkedIn = data.checked_in || data.checkedIn || 0;
          const attendanceRate = registrations > 0 ? (checkedIn / registrations) * 100 : 0;

          totalRegistrations += registrations;
          totalCheckedIn += checkedIn;

          eventStats.push({
            eventId: event.eventId || event.id,
            eventName: event.eventName || event.name || 'Unknown',
            totalRegistrations: registrations,
            checkedIn: checkedIn,
            attendanceRate: Math.round(attendanceRate * 100) / 100,
            confirmedEmails: data.confirmed_emails || data.confirmedEmails || 0,
            startDate: event.startDate || event.start_date,
            endDate: event.endDate || event.end_date,
            status: event.status || 'draft'
          });

          // Count by status
          const status = event.status || 'draft';
          eventsByStatus[status] = (eventsByStatus[status] || 0) + 1;

          // Count by type
          const eventType = event.eventType || event.event_type || 'other';
          eventsByType[eventType] = (eventsByType[eventType] || 0) + 1;
        }
      });

      // Sort top events by attendance rate
      const topEvents = [...eventStats]
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, 10);

      const averageAttendanceRate = eventStats.length > 0
        ? eventStats.reduce((sum, e) => sum + e.attendanceRate, 0) / eventStats.length
        : 0;

      // Build registration and attendance trends (simplified - group by month)
      const registrationTrend: { date: string; count: number }[] = [];
      const attendanceTrend: { date: string; count: number }[] = [];

      // Group by month
      const monthlyData: { [key: string]: { registrations: number; checkIns: number } } = {};
      eventStats.forEach(stat => {
        if (stat.startDate) {
          const date = new Date(stat.startDate);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { registrations: 0, checkIns: 0 };
          }
          monthlyData[monthKey].registrations += stat.totalRegistrations;
          monthlyData[monthKey].checkIns += stat.checkedIn;
        }
      });

      Object.keys(monthlyData).sort().forEach(monthKey => {
        registrationTrend.push({ date: monthKey, count: monthlyData[monthKey].registrations });
        attendanceTrend.push({ date: monthKey, count: monthlyData[monthKey].checkIns });
      });

      const analyticsData: AnalyticsData = {
        totalEvents: events.length,
        totalRegistrations,
        totalCheckedIn,
        averageAttendanceRate: Math.round(averageAttendanceRate * 100) / 100,
        eventsByStatus,
        eventsByType,
        registrationTrend,
        attendanceTrend,
        topEvents
      };

      this.analyticsData.set(analyticsData);
      this.loading.set(false);
    }).catch((error) => {
      this.errorHandler.handleApiError(error);
      this.loading.set(false);
    });
  }

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'dateStart') {
      this.dateRange.set({ ...this.dateRange(), start: event.value });
    } else if (event.key === 'dateEnd') {
      this.dateRange.set({ ...this.dateRange(), end: event.value });
    } else if (event.key === 'status') {
      this.filterStatus.set(event.value);
    } else if (event.key === 'eventType') {
      this.filterEventType.set(event.value);
    }
    this.loadAnalytics();
  }

  clearFilters(): void {
    this.dateRange.set({ start: '', end: '' });
    this.filterStatus.set('');
    this.filterEventType.set('');
    this.loadAnalytics();
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'published': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status] || colors['draft'];
  }

  getMaxValue(data: { date: string; count: number }[]): number {
    if (data.length === 0) return 100;
    return Math.max(...data.map(d => d.count), 100);
  }

  getBarHeight(value: number, max: number): string {
    if (max === 0) return '0%';
    return `${(value / max) * 100}%`;
  }

  // Helper methods for template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getAnalyticsData(): AnalyticsData | null {
    return this.analyticsData();
  }

  // Helper methods for accessing nested properties
  getEventsByStatus(status: string): number {
    return this.data()?.eventsByStatus?.[status] || 0;
  }

  getEventsByType(type: string): number {
    return this.data()?.eventsByType?.[type] || 0;
  }

  getTotalEvents(): number {
    return this.data()?.totalEvents || 0;
  }

  getStatusPercentage(status: string): number {
    const data = this.data();
    if (!data || !data.totalEvents) return 0;
    return ((data.eventsByStatus[status] || 0) / data.totalEvents) * 100;
  }

  getTypePercentage(type: string): number {
    const data = this.data();
    if (!data || !data.totalEvents) return 0;
    return ((data.eventsByType[type] || 0) / data.totalEvents) * 100;
  }

  getRegistrationTrend(): { date: string; count: number }[] {
    return this.data()?.registrationTrend || [];
  }

  getAttendanceTrend(): { date: string; count: number }[] {
    return this.data()?.attendanceTrend || [];
  }

  getTopEvents(): EventStats[] {
    return this.data()?.topEvents || [];
  }

  getMaxRegValue(): number {
    const trend = this.getRegistrationTrend();
    return this.getMaxValue(trend);
  }

  getMaxAttValue(): number {
    const trend = this.getAttendanceTrend();
    return this.getMaxValue(trend);
  }

  getRegistrationBarHeight(count: number): string {
    const maxReg = this.getMaxRegValue();
    return this.getBarHeight(count, maxReg);
  }

  getAttendanceBarHeight(count: number): string {
    const maxAtt = this.getMaxAttValue();
    return this.getBarHeight(count, maxAtt);
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

