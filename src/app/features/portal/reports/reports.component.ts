/**
 * Reports Component
 *
 * Comprehensive reporting component for generating and exporting various report types.
 * Supports attendance, employee, visitor, vehicle, and custom reports with filtering and export functionality.
 *
 * @example
 * ```html
 * <app-reports></app-reports>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ExportService } from '../../../core/services/export.service';
import { ReportService } from '../../../core/services/report.service';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

/**
 * Report type interface
 */
interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'attendance' | 'employee' | 'visitor' | 'vehicle' | 'custom';
}

/**
 * Report filters interface
 */
interface ReportFilters {
  companyId?: string;
  startDate: string;
  endDate: string;
  employeeId?: string;
  departmentId?: string;
  reportFormat?: 'table' | 'chart' | 'both';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    GlassButtonComponent,
    PageLayoutComponent,
    FilterSectionComponent,
    EmptyStateComponent
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  private http = inject(HttpClient);
  private exportService = inject(ExportService);
  private reportService = inject(ReportService);
  private apiUrl = `${environment.apiUrl}/reports`;

  // Signals
  isLoading = signal(false);
  selectedReport = signal<ReportType | null>(null);
  reportData = signal<any>(null);
  showFilters = signal(true);

  // Filters
  filters = signal<ReportFilters>({
    startDate: this.getDefaultStartDate(),
    endDate: this.getDefaultEndDate(),
    reportFormat: 'table'
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '🔄 Refresh',
      variant: 'secondary',
      onClick: () => this.loadReports()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'startDate',
      label: 'Start Date',
      type: 'date',
      value: this.filters().startDate
    },
    {
      key: 'endDate',
      label: 'End Date',
      type: 'date',
      value: this.filters().endDate
    },
    {
      key: 'reportFormat',
      label: 'Format',
      type: 'select',
      options: [
        { value: 'table', label: 'Table' },
        { value: 'chart', label: 'Chart' },
        { value: 'both', label: 'Both' }
      ],
      value: this.filters().reportFormat
    }
  ]);

  onFilterChange(event: { key: string; value: any }): void {
    const currentFilters = this.filters();
    (currentFilters as any)[event.key] = event.value;
    this.filters.set({ ...currentFilters });
  }

  loadReports(): void {
    // Reload reports if needed
  }

  // Available Reports
  availableReports: ReportType[] = [
    {
      id: 'attendance-summary',
      name: 'รายงานสรุปการเข้างาน',
      description: 'สรุปการเข้างาน มาสาย ขาดงาน ของพนักงาน',
      icon: '📊',
      category: 'attendance'
    },
    {
      id: 'attendance-detail',
      name: 'รายงานการเข้างานรายละเอียด',
      description: 'รายงานการเข้างานแบบรายละเอียดทุกวัน',
      icon: '📋',
      category: 'attendance'
    },
    {
      id: 'late-arrival',
      name: 'รายงานการมาสาย',
      description: 'รายงานพนักงานที่มาสาย',
      icon: '⏰',
      category: 'attendance'
    },
    {
      id: 'absence',
      name: 'รายงานการขาดงาน',
      description: 'รายงานพนักงานที่ขาดงาน',
      icon: '❌',
      category: 'attendance'
    },
    {
      id: 'overtime',
      name: 'รายงานการทำงานล่วงเวลา',
      description: 'รายงานชั่วโมงการทำงานล่วงเวลา',
      icon: '🌙',
      category: 'attendance'
    },
    {
      id: 'employee-performance',
      name: 'รายงานประสิทธิภาพพนักงาน',
      description: 'วิเคราะห์ประสิทธิภาพการทำงานของพนักงาน',
      icon: '📈',
      category: 'employee'
    },
    {
      id: 'employee-summary',
      name: 'รายงานสรุปพนักงาน',
      description: 'ข้อมูลสรุปของพนักงานทั้งหมด',
      icon: '👥',
      category: 'employee'
    },
    {
      id: 'visitor-statistics',
      name: 'รายงานสถิติผู้เยี่ยม',
      description: 'สถิติและแนวโน้มผู้เยี่ยม',
      icon: '🚶',
      category: 'visitor'
    },
    {
      id: 'visitor-log',
      name: 'บันทึกผู้เยี่ยม',
      description: 'บันทึกการเข้าออกของผู้เยี่ยม',
      icon: '📝',
      category: 'visitor'
    },
    {
      id: 'vehicle-usage',
      name: 'รายงานการใช้ยานพาหนะ',
      description: 'สถิติการใช้ยานพาหนะและที่จอดรถ',
      icon: '🚗',
      category: 'vehicle'
    },
    {
      id: 'parking-occupancy',
      name: 'รายงานการใช้ที่จอดรถ',
      description: 'สถิติการใช้ที่จอดรถ',
      icon: '🅿️',
      category: 'vehicle'
    }
  ];

  // Computed
  reportsByCategory = computed(() => {
    const reports = this.availableReports;
    return {
      attendance: reports.filter(r => r.category === 'attendance'),
      employee: reports.filter(r => r.category === 'employee'),
      visitor: reports.filter(r => r.category === 'visitor'),
      vehicle: reports.filter(r => r.category === 'vehicle'),
      custom: reports.filter(r => r.category === 'custom')
    };
  });

  ngOnInit() {
    // Initial load if needed
  }

  getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date.toISOString().split('T')[0];
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  selectReport(report: ReportType) {
    this.selectedReport.set(report);
    this.reportData.set(null);
  }

  generateReport() {
    const report = this.selectedReport();
    if (!report) {
      alert('กรุณาเลือกรายงานที่ต้องการ');
      return;
    }

    this.isLoading.set(true);
    const filters = this.filters();

    // Call API based on report type
    let apiEndpoint = '';

    switch (report.id) {
      case 'attendance-summary':
        apiEndpoint = `${this.apiUrl}/attendance-summary/${filters.companyId || 'default'}`;
        break;
      case 'employee-performance':
        apiEndpoint = `${this.apiUrl}/employee-performance/${filters.companyId || 'default'}`;
        break;
      case 'visitor-statistics':
        apiEndpoint = `${this.apiUrl}/visitor-statistics/${filters.companyId || 'default'}`;
        break;
      default:
        apiEndpoint = `${this.apiUrl}/custom`;
    }

    this.http.post(apiEndpoint, filters).subscribe({
      next: (data) => {
        this.reportData.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error generating report:', error);
        // Mock data for demo
        this.generateMockData(report.id);
        this.isLoading.set(false);
      }
    });
  }

  generateMockData(reportId: string) {
    // Generate mock data based on report type
    const mockData: any = {
      reportId,
      generatedAt: new Date().toISOString(),
      filters: this.filters(),
      data: []
    };

    switch (reportId) {
      case 'attendance-summary':
        mockData.data = this.getMockAttendanceData();
        break;
      case 'employee-performance':
        mockData.data = this.getMockPerformanceData();
        break;
      case 'visitor-statistics':
        mockData.data = this.getMockVisitorData();
        break;
      default:
        mockData.data = [];
    }

    this.reportData.set(mockData);
  }

  getMockAttendanceData() {
    return [
      { employeeName: 'สมชาย ใจดี', present: 20, late: 2, absent: 0, overtime: 5 },
      { employeeName: 'สมหญิง รักงาน', present: 19, late: 1, absent: 2, overtime: 3 },
      { employeeName: 'ประเสริฐ ทำดี', present: 22, late: 0, absent: 0, overtime: 8 },
      { employeeName: 'สุดา มั่นใจ', present: 18, late: 3, absent: 1, overtime: 2 },
      { employeeName: 'วิชัย ชอบทำ', present: 21, late: 1, absent: 0, overtime: 6 }
    ];
  }

  getMockPerformanceData() {
    return [
      { employeeName: 'สมชาย ใจดี', tasksCompleted: 45, rating: 4.5, efficiency: 92 },
      { employeeName: 'สมหญิง รักงาน', tasksCompleted: 38, rating: 4.2, efficiency: 88 },
      { employeeName: 'ประเสริฐ ทำดี', tasksCompleted: 52, rating: 4.8, efficiency: 95 },
      { employeeName: 'สุดา มั่นใจ', tasksCompleted: 41, rating: 4.3, efficiency: 85 },
      { employeeName: 'วิชัย ชอบทำ', tasksCompleted: 48, rating: 4.6, efficiency: 91 }
    ];
  }

  getMockVisitorData() {
    return [
      { date: '2025-10-01', visitors: 45 },
      { date: '2025-10-02', visitors: 52 },
      { date: '2025-10-03', visitors: 38 },
      { date: '2025-10-04', visitors: 61 },
      { date: '2025-10-05', visitors: 48 }
    ];
  }

  exportToPDF() {
    const data = this.reportData();
    const report = this.selectedReport();

    if (!data || !report) {
      alert('ไม่มีข้อมูลให้ Export');
      return;
    }

    // Use ExportService for PDF
    this.exportService.exportToPDF(data.data, report.name);
  }

  exportToExcel() {
    const data = this.reportData();
    const report = this.selectedReport();

    if (!data || !report) {
      alert('ไม่มีข้อมูลให้ Export');
      return;
    }

    // Check if it's attendance or employee report
    if (report.id === 'attendance-summary' || report.id === 'attendance-detail') {
      this.exportAttendanceReport();
    } else if (report.id === 'employee-summary') {
      this.exportEmployeesReport();
    } else {
      // Use ExportService for Excel/CSV export
      this.exportService.exportToExcel(data.data, report.name, 'Report');
      alert('รายงานถูก Export ไปยัง Downloads folder แล้ว');
    }
  }

  exportAttendanceReport(): void {
    const filters = this.filters();
    this.isLoading.set(true);

    this.reportService.exportAttendanceReport({
      startDate: filters.startDate,
      endDate: filters.endDate
    }, 'excel').subscribe({
      next: (blob: Blob) => {
        this.downloadBlob(blob, `attendance_report_${filters.startDate}_${filters.endDate}.xlsx`);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error exporting attendance report:', error);
        alert('เกิดข้อผิดพลาดในการ Export รายงาน');
        this.isLoading.set(false);
      }
    });
  }

  exportEmployeesReport(): void {
    this.isLoading.set(true);

    this.reportService.exportEmployeesReport('excel').subscribe({
      next: (blob: Blob) => {
        this.downloadBlob(blob, `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error exporting employees report:', error);
        alert('เกิดข้อผิดพลาดในการ Export รายงาน');
        this.isLoading.set(false);
      }
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    alert('รายงานถูก Export ไปยัง Downloads folder แล้ว');
  }

  exportToJSON() {
    const data = this.reportData();
    const report = this.selectedReport();

    if (!data || !report) {
      alert('ไม่มีข้อมูลให้ Export');
      return;
    }

    // Export as JSON
    this.exportService.exportToJSON(data.data, report.name);
    alert('รายงานถูก Export ไปยัง Downloads folder แล้ว');
  }

  printReport() {
    const data = this.reportData();
    if (!data) {
      alert('ไม่มีข้อมูลให้พิมพ์');
      return;
    }

    // Use ExportService print function
    this.exportService.printReport();
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      attendance: 'การเข้างาน',
      employee: 'พนักงาน',
      visitor: 'ผู้เยี่ยม',
      vehicle: 'ยานพาหนะ',
      custom: 'กำหนดเอง'
    };
    return labels[category] || category;
  }

  getCategoryClass(category: string): string {
    const classes: Record<string, string> = {
      attendance: 'from-blue-500 to-blue-600',
      employee: 'from-green-500 to-green-600',
      visitor: 'from-purple-500 to-purple-600',
      vehicle: 'from-orange-500 to-orange-600',
      custom: 'from-gray-500 to-gray-600'
    };
    return classes[category] || 'from-gray-500 to-gray-600';
  }
}
