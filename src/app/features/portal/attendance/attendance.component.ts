/**
 * Attendance Component
 *
 * Attendance management component with timestamp approval/rejection, filtering, statistics,
 * and export functionality. Supports bulk operations, individual timestamp management,
 * and comprehensive reporting.
 *
 * @example
 * ```html
 * <app-attendance></app-attendance>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { ApiService } from '../../../core/services/api.service';
import { ReportService } from '../../../core/services/report.service';
import { TimestampService } from '../../../core/services/timestamp.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ExportService } from '../../../core/services/export.service';
import { Attendance, PortalForm } from '../../../core/models/portal.model';
import { AttendanceReportFilters } from '../../../core/models/report.model';
import { EmployeeTimestamp } from '../../../core/models/timestamp.model';
import { environment } from '../../../../environments/environment';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    GlassButtonComponent,
    ModalComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss'
})
export class AttendanceComponent extends BaseComponent implements OnInit {
  // Local state for attendance records
  private attendanceRecords = signal<(Attendance | EmployeeTimestamp)[]>([]);
  private loadingState = signal(false);

  // Getters
  getAttendanceRecords = () => this.attendanceRecords.asReadonly();
  getLoading = () => this.loadingState.asReadonly();

  // Computed signals - records can be Attendance or EmployeeTimestamp
  records = computed(() => this.getAttendanceRecords()() as (Attendance | EmployeeTimestamp)[]);

  // Bulk selection
  selectedTimestamps = signal<Set<string>>(new Set());
  showRejectModal = signal(false);
  rejectReason = signal('');
  rejectingTimestampId = signal<string | null>(null);
  processingTimestampId = signal<string | null>(null);

  // Computed signals for statistics
  presentCount = computed(() => this.records().filter((r: any) => r.status === 'present' || r.status === 'approved').length);
  absentCount = computed(() => this.records().filter((r: any) => r.status === 'absent').length);
  lateCount = computed(() => this.records().filter((r: any) => r.status === 'late').length);
  pendingCount = computed(() => this.records().filter((r: any) => (r as any).status === 'pending').length);

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => [
    {
      icon: '✅',
      label: 'Present',
      value: this.presentCount(),
      iconBgClass: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: '❌',
      label: 'Absent',
      value: this.absentCount(),
      iconBgClass: 'bg-red-100 dark:bg-red-900'
    },
    {
      icon: '⏰',
      label: 'Late',
      value: this.lateCount(),
      iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      icon: '⏳',
      label: 'Pending',
      value: this.pendingCount(),
      iconBgClass: 'bg-blue-100 dark:bg-blue-900'
    }
  ]);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '📊 Export Excel',
      variant: 'primary',
      onClick: () => this.exportAttendanceReport()
    },
    {
      label: this.i18n.t('common.export'),
      variant: 'secondary',
      onClick: () => this.exportToCSV()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      value: this.filters.startDate
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: 'date',
      value: this.filters.endDate
    },
    {
      key: 'employeeName',
      label: 'Employee Name',
      type: 'text',
      placeholder: 'Search by name...',
      value: this.filters.employeeName
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'auto_approved', label: 'Auto Approved' }
      ],
      value: this.filters.status
    },
    {
      key: 'timestampType',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'CHECK_IN', label: 'Check In' },
        { value: 'CHECK_OUT', label: 'Check Out' }
      ],
      value: this.filters.timestampType
    }
  ]);

  // Get company ID from current user
  companyId = computed(() => {
    const user = this.auth.currentUser();
    return user?.companyId?.toString() || '';
  });

  filters = {
    startDate: '',
    endDate: '',
    employeeName: '',
    timestampType: '',
    status: ''
  };

  constructor(
    private api: ApiService,
    private reportService: ReportService,
    private timestampService: TimestampService,
    private auth: AuthService,
    private i18n: I18nService,
    private exportService: ExportService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeDateRange();
    this.loadRecords();
  }

  /**
   * Initialize date range filter to current month
   */
  initializeDateRange(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filters.startDate = firstDay.toISOString().split('T')[0];
    this.filters.endDate = today.toISOString().split('T')[0];
  }

  loadRecords(): void {
    const companyId = this.companyId();
    if (!companyId) {
      console.error('Company ID not found');
      this.loadingState.set(false);
      return;
    }

    this.loadingState.set(true);
    const filters: any = {
      page: 1,
      size: 1000
    };
    if (this.filters.startDate) filters.start_date = this.filters.startDate;
    if (this.filters.endDate) filters.end_date = this.filters.endDate;
    if (this.filters.employeeName) filters.company_employee_id = this.filters.employeeName;
    if (this.filters.timestampType) filters.timestamp_type = this.filters.timestampType;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.timestampService.getTimestamps(companyId, filters),
      (response: { data?: EmployeeTimestamp[] } | EmployeeTimestamp[]) => {
        const records = Array.isArray(response) ? response : (response.data || []);
        // Filter by status if needed
        let filteredRecords: (Attendance | EmployeeTimestamp)[] = records;
        if (this.filters.status) {
          filteredRecords = records.filter((r) => r.status === this.filters.status);
        }
        this.attendanceRecords.set(filteredRecords);
        this.loadingState.set(false);
      },
      (error) => {
        console.error('Error loading timestamps:', error);
        this.attendanceRecords.set([]);
        this.loadingState.set(false);
      }
    );
  }

  /**
   * Handle filter change
   */
  onFilterChange(event: { key: string; value: unknown }): void {
    const key = event.key as keyof typeof this.filters;
    if (key in this.filters) {
      this.filters[key] = String(event.value);
    }
    this.applyFilters();
  }

  /**
   * Get record ID for trackBy
   */
  getRecordId(record: Attendance | EmployeeTimestamp): string {
    return (record as any).timestampId || (record as any).id || '';
  }

  /**
   * Apply filters and reload records
   */
  applyFilters(): void {
    this.selectedTimestamps.set(new Set());
    this.loadRecords();
  }

  /**
   * Toggle timestamp selection
   */
  toggleSelection(timestampId: string): void {
    const selected = new Set(this.selectedTimestamps());
    if (selected.has(timestampId)) {
      selected.delete(timestampId);
    } else {
      selected.add(timestampId);
    }
    this.selectedTimestamps.set(selected);
  }

  /**
   * Check if timestamp is selected
   */
  isSelected(timestampId: string): boolean {
    return this.selectedTimestamps().has(timestampId);
  }

  /**
   * Select all pending timestamps
   */
  selectAll(): void {
    const pendingRecords = this.records().filter((r) => (r as any).status === 'pending');
    const selected = new Set(pendingRecords.map((r) => (r as any).timestampId || (r as any).id));
    this.selectedTimestamps.set(selected);
  }

  /**
   * Deselect all timestamps
   */
  deselectAll(): void {
    this.selectedTimestamps.set(new Set());
  }

  approveTimestamp(timestampId: string): void {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Company ID not found. Please login again.');
      return;
    }

    this.processingTimestampId.set(timestampId);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.timestampService.approveTimestamp(companyId, timestampId),
      () => {
        alert('Timestamp approved successfully!');
        this.loadRecords();
        // Remove from selection
        const selected = new Set(this.selectedTimestamps());
        selected.delete(timestampId);
        this.selectedTimestamps.set(selected);
        this.processingTimestampId.set(null);
      },
      (error: any) => {
        console.error('Error approving timestamp:', error);
        alert('Error approving timestamp: ' + (error.error?.detail || error.message || 'Unknown error'));
        this.processingTimestampId.set(null);
      }
    );
  }

  rejectTimestamp(timestampId: string, reason: string): void {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Company ID not found. Please login again.');
      return;
    }

    if (!reason || reason.trim().length === 0) {
      alert('Please provide a rejection reason.');
      return;
    }

    this.processingTimestampId.set(timestampId);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.timestampService.rejectTimestamp(companyId, timestampId, reason),
      () => {
        alert('Timestamp rejected successfully!');
        this.loadRecords();
        // Remove from selection
        const selected = new Set(this.selectedTimestamps());
        selected.delete(timestampId);
        this.selectedTimestamps.set(selected);
        this.showRejectModal.set(false);
        this.rejectReason.set('');
        this.rejectingTimestampId.set(null);
        this.processingTimestampId.set(null);
      },
      (error: any) => {
        console.error('Error rejecting timestamp:', error);
        alert('Error rejecting timestamp: ' + (error.error?.detail || error.message || 'Unknown error'));
        this.processingTimestampId.set(null);
      }
    );
  }

  openRejectModal(timestampId: string): void {
    this.rejectingTimestampId.set(timestampId);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectReason.set('');
    this.rejectingTimestampId.set(null);
  }

  confirmReject(): void {
    const timestampId = this.rejectingTimestampId();
    const reason = this.rejectReason();
    if (timestampId && reason) {
      this.rejectTimestamp(timestampId, reason);
    }
  }

  /**
   * Bulk approve selected timestamps
   */
  bulkApproveTimestamps(): void {
    const selected = Array.from(this.selectedTimestamps());
    if (selected.length === 0) {
      alert('Please select at least one timestamp to approve.');
      return;
    }

    const companyId = this.companyId();
    if (!companyId) {
      alert('Company ID not found. Please login again.');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selected.length} timestamp(s)?`)) {
      return;
    }

    this.processingTimestampId.set('bulk');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.timestampService.bulkApproveTimestamps(companyId, selected),
      (response: EmployeeTimestamp[]) => {
        const approved = response.length;
        let message = `Bulk approval completed!\nApproved: ${approved}`;
        alert(message);
        this.loadRecords();
        this.selectedTimestamps.set(new Set());
        this.processingTimestampId.set(null);
      },
      (error) => {
        console.error('Error bulk approving timestamps:', error);
        const errorMessage = (error as any).error?.detail || (error as any).message || 'Unknown error';
        alert('Error bulk approving timestamps: ' + errorMessage);
        this.processingTimestampId.set(null);
      }
    );
  }

  /**
   * Export attendance report to Excel
   */
  exportAttendanceReport(): void {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Company ID not found. Please login again.');
      return;
    }

    const startDate = this.filters.startDate || this.getDefaultStartDate();
    const endDate = this.filters.endDate || this.getDefaultEndDate();

    const filters: AttendanceReportFilters = {
      startDate,
      endDate
    };
    if (this.filters.employeeName) {
      filters.employeeIds = [this.filters.employeeName];
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.reportService.exportAttendanceReport(filters, 'excel'),
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_report_${startDate}_${endDate}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        alert('รายงานถูก Export ไปยัง Downloads folder แล้ว');
      },
      (error) => {
        console.error('Error exporting attendance report:', error);
        alert('เกิดข้อผิดพลาดในการ Export รายงาน');
      }
    );
  }

  /**
   * Get default start date (first day of current month)
   */
  getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  }

  /**
   * Get default end date (today)
   */
  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  exportToCSV(): void {
    const companyId = this.companyId();
    if (!companyId) {
      // Fallback to old export method
      const records = this.records();
      if (!records || records.length === 0) {
        alert('No attendance records to export');
        return;
      }

      const exportData = records.map((record: any) => {
        return {
          'Employee Name': record.employee?.member ?
            `${record.employee.member.firstName || ''} ${record.employee.member.lastName || ''}`.trim() || record.employee.member.email :
            record.employeeName || '-',
          'Date': this.formatDate(record.timestamp || record.date) || '-',
          'Type': record.timestampType || '-',
          'Status': record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : '-',
          'Location': record.locationName || record.location || '-',
        };
      });

      this.exportService.exportToExcel(exportData, 'attendance_records', 'Attendance Records');
      return;
    }

    const filters: any = {};
    if (this.filters.startDate) filters.start_date = this.filters.startDate;
    if (this.filters.endDate) filters.end_date = this.filters.endDate;
    if (this.filters.employeeName) filters.company_employee_id = this.filters.employeeName;
    if (this.filters.timestampType) filters.timestamp_type = this.filters.timestampType;
    if (this.filters.status) filters.status = this.filters.status;

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.timestampService.exportTimestamps(companyId, filters);
    this.subscribe(
      obs,
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timestamps_${companyId}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting timestamps:', error);
        alert('Error exporting timestamps. Please try again.');
      }
    );
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: string): string {
    if (!status) return '-';
    const statusMap: Record<string, string> = {
      'pending': '⏳ Pending',
      'approved': '✅ Approved',
      'rejected': '❌ Rejected',
      'auto_approved': '✅ Auto Approved'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      'pending': 'text-orange-600 dark:text-orange-400 font-medium',
      'approved': 'text-green-600 dark:text-green-400 font-medium',
      'rejected': 'text-red-600 dark:text-red-400 font-medium',
      'auto_approved': 'text-blue-600 dark:text-blue-400 font-medium'
    };
    return classMap[status] || 'text-gray-600 dark:text-gray-400';
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }

  /**
   * TrackBy function for attendance records
   */
  trackByRecord(index: number, record: Attendance | EmployeeTimestamp): string {
    return this.getRecordId(record) || index.toString();
  }

  // Helper methods to safely access EmployeeTimestamp properties
  getRecordTimestampId(record: Attendance | EmployeeTimestamp): string {
    return (record as any).timestampId || (record as any).id || '';
  }

  getRecordEmployee(record: Attendance | EmployeeTimestamp): any {
    return (record as any).employee;
  }

  getRecordTimestamp(record: Attendance | EmployeeTimestamp): string | undefined {
    return (record as any).timestamp || (record as any).date;
  }

  getRecordTimestampType(record: Attendance | EmployeeTimestamp): string {
    return (record as any).timestampType || (record as any).type || '';
  }

  getRecordLocationName(record: Attendance | EmployeeTimestamp): string {
    return (record as any).locationName || (record as any).location || '-';
  }

  isPendingStatus(record: Attendance | EmployeeTimestamp): boolean {
    return (record as any).status === 'pending';
  }

  getRecordEmployeeName(record: Attendance | EmployeeTimestamp): string {
    return (record as any).employeeName || '-';
  }

  getRecordDate(record: Attendance | EmployeeTimestamp): string | undefined {
    return (record as any).date;
  }

  /**
   * Format date string for display
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format date time string for display
   */
  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
