/**
 * Event Check-in History Component
 *
 * Component for viewing event check-in history and records.
 * Displays check-in records with filtering and search functionality.
 *
 * @example
 * ```html
 * <app-event-checkin-history></app-event-checkin-history>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../../../shared/components/glass-button/glass-button.component';
import { PageLayoutComponent, PageAction } from '../../../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../../../shared/components/filter-section/filter-section.component';
import { ApiService } from '../../../../../core/services/api.service';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';
import { EventService } from '../../../../../core/services/event.service';
import { I18nService } from '../../../../../core/services/i18n.service';

/**
 * Check-in record interface
 */
interface CheckInRecord {
  attendee_id?: string;  // snake_case
  member_id: string;  // snake_case
  first_name?: string;  // snake_case
  last_name?: string;  // snake_case
  email?: string;
  member_first_name?: string;  // snake_case
  member_last_name?: string;  // snake_case
  member_email?: string;  // snake_case
  check_in_time: string;  // snake_case
  status: string;
}

@Component({
  selector: 'app-event-checkin-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    PageLayoutComponent,
    FilterSectionComponent
  ],
  templateUrl: './event-checkin-history.component.html',
  styleUrl: './event-checkin-history.component.scss'
})
export class EventCheckinHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);
  private api = inject(ApiService);
  private eventService = inject(EventService);
  private i18n = inject(I18nService);

  event_id = signal<string>('');  // snake_case
  event_name = signal<string>('');  // snake_case
  checkInRecords = signal<CheckInRecord[]>([]);
  loading = signal(false);
  errorMessage = signal<string>('');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(50);
  totalRecords = signal(0);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Filters
  searchTerm = signal('');
  dateFilter = signal<string>('');

  // Grouped by date
  groupedRecords = computed(() => {
    const records = this.checkInRecords();
    const grouped: { [key: string]: CheckInRecord[] } = {};

    records.forEach(record => {
      if (record.check_in_time) {  // snake_case
        const date = new Date(record.check_in_time);  // snake_case
        const dateKey = date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(record);
      }
    });

    // Sort records within each date group by time (newest first)
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
      const timeA = new Date(a.check_in_time).getTime();  // snake_case
      const timeB = new Date(b.check_in_time).getTime();  // snake_case
      return timeB - timeA;
      });
    });

    return grouped;
  });

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('common.search'),
      type: 'text',
      placeholder: this.i18n.t('common.searchPlaceholder'),
      value: this.searchTerm()
    },
    {
      key: 'date',
      label: this.i18n.t('common.date'),
      type: 'date',
      value: this.dateFilter()
    }
  ]);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.back'),
      variant: 'secondary',
      onClick: () => this.goBack()
    },
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadCheckInHistory()
    },
    {
      label: this.i18n.t('common.export'),
      variant: 'primary',
      onClick: () => this.exportToCSV()
    }
  ]);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = params['eventId'];
      if (eventId) {
        this.event_id.set(eventId);  // snake_case
        this.loadEventDetails();
        this.loadCheckInHistory();
      }
    });
  }

  loadEventDetails(): void {
    const eventId = this.event_id();  // snake_case
    if (!eventId) return;

    this.api.get<any>(`/events/${eventId}`).subscribe({
      next: (event) => {
        this.event_name.set(event.event_name || event.name || 'Event');  // snake_case
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
      }
    });
  }

  loadCheckInHistory(): void {
    const eventId = this.event_id();  // snake_case
    if (!eventId) return;

    this.loading.set(true);
    this.errorMessage.set('');

    // Load all attendees and filter only checked-in ones
    this.eventService.getAttendees(eventId).subscribe({
      next: (attendees: any[]) => {
        // Filter only checked-in attendees
        const checkedInRecords = attendees.filter((attendee: any) => 
          attendee.status === 'CHECKED_IN' && attendee.check_in_time  // snake_case
        );

        // Sort by check-in time (newest first)
        checkedInRecords.sort((a: any, b: any) => {
          const timeA = new Date(a.check_in_time).getTime();  // snake_case
          const timeB = new Date(b.check_in_time).getTime();  // snake_case
          return timeB - timeA;
        });

        // Apply search filter
        let filtered = checkedInRecords;
        if (this.searchTerm()) {
          const search = this.searchTerm().toLowerCase();
          filtered = checkedInRecords.filter((record: any) => {
            const firstName = (record.member_first_name || record.first_name || '').toLowerCase();  // snake_case
            const lastName = (record.member_last_name || record.last_name || '').toLowerCase();  // snake_case
            const email = (record.member_email || record.email || '').toLowerCase();  // snake_case
            return firstName.includes(search) || lastName.includes(search) || email.includes(search);
          });
        }

        // Apply date filter
        if (this.dateFilter()) {
          const filterDate = new Date(this.dateFilter());
          filtered = filtered.filter((record: any) => {
            const checkInDate = new Date(record.check_in_time);  // snake_case
            return checkInDate.toDateString() === filterDate.toDateString();
          });
        }

        this.checkInRecords.set(filtered);
        this.totalRecords.set(filtered.length);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Check-in History ได้');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchTerm.set(event.value);
    } else if (event.key === 'date') {
      this.dateFilter.set(event.value);
    }
    this.currentPage.set(1);
    this.loadCheckInHistory();
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCheckInHistory();
    }
  }

  goBack(): void {
    this.router.navigate(['/portal/events']);
  }

  exportToCSV(): void {
    const records = this.checkInRecords();
    if (records.length === 0) {
      this.errorHandler.showError('ไม่มีข้อมูลที่จะ Export');
      return;
    }

    // CSV Headers
    const headers = ['First Name', 'Last Name', 'Email', 'Check-in Time', 'Status'];
    const rows = records.map(record => [
      record.first_name || record.member_first_name || '',  // snake_case
      record.last_name || record.member_last_name || '',  // snake_case
      record.email || record.member_email || '',  // snake_case
      record.check_in_time ? this.formatDateTime(record.check_in_time) : '',  // snake_case
      record.status || 'CHECKED_IN'
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `event-checkin-history-${this.event_name()}-${new Date().toISOString().split('T')[0]}.csv`);  // snake_case
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.errorHandler.showSuccess('Export CSV สำเร็จ');
  }

  formatDateTime(dateTime: string): string {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getDateKeys(): string[] {
    return Object.keys(this.groupedRecords()).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });
  }

  getTodayCheckIns(): number {
    const today = new Date();
    const todayKey = today.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return this.groupedRecords()[todayKey]?.length || 0;
  }

  // Expose Math for template
  Math = Math;

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

