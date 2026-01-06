/**
 * Alerts Component
 *
 * Component for managing and viewing system alerts.
 * Supports alert filtering, statistics, status management, and alert type/severity tracking.
 *
 * @example
 * ```html
 * <app-alerts></app-alerts>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { AlertService } from '../../../core/services/alert.service';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
  Alert,
  AlertType,
  AlertSeverity,
  AlertStatus,
  ALERT_TYPE_LABELS,
  ALERT_SEVERITY_LABELS,
  ALERT_STATUS_LABELS
} from '../../../core/models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    GlassButtonComponent,
    LoadingComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    EmptyStateComponent
  ],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  private alertService = inject(AlertService);
  private authService = inject(AuthService);
  private errorHandler = inject(ErrorHandlerService);

  alerts = signal<Alert[]>([]);
  filteredAlerts = signal<Alert[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  pageSize = signal(10);
  errorMessage = signal<string>('');

  filterType = signal<AlertType | ''>('');
  filterSeverity = signal<AlertSeverity | ''>('');
  filterStatus = signal<AlertStatus | ''>('');
  searchTerm = signal('');

  AlertType = AlertType;
  AlertSeverity = AlertSeverity;
  AlertStatus = AlertStatus;
  ALERT_TYPE_LABELS = ALERT_TYPE_LABELS;
  ALERT_SEVERITY_LABELS = ALERT_SEVERITY_LABELS;
  ALERT_STATUS_LABELS = ALERT_STATUS_LABELS;

  alertTypes = computed(() => Object.values(AlertType));
  alertSeverities = computed(() => Object.values(AlertSeverity));
  alertStatuses = computed(() => Object.values(AlertStatus));

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const alerts = this.alerts();
    return [
      {
        icon: '📊',
        label: 'Total Alerts',
        value: alerts.length,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '⚠️',
        label: 'Pending',
        value: alerts.filter(a => a.status === AlertStatus.PENDING).length,
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
      },
      {
        icon: '✅',
        label: 'Resolved',
        value: alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '🔴',
        label: 'Critical',
        value: alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '🔄 Refresh',
      variant: 'secondary',
      onClick: () => this.loadAlerts()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search...',
      value: this.searchTerm()
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...this.alertTypes().map(type => ({
          value: type,
          label: ALERT_TYPE_LABELS[type]
        }))
      ],
      value: this.filterType()
    },
    {
      key: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { value: '', label: 'All Severities' },
        ...this.alertSeverities().map(severity => ({
          value: severity,
          label: ALERT_SEVERITY_LABELS[severity]
        }))
      ],
      value: this.filterSeverity()
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        ...this.alertStatuses().map(status => ({
          value: status,
          label: ALERT_STATUS_LABELS[status]
        }))
      ],
      value: this.filterStatus()
    }
  ]);

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchTerm.set(event.value);
    } else if (event.key === 'type') {
      this.filterType.set(event.value);
    } else if (event.key === 'severity') {
      this.filterSeverity.set(event.value);
    } else if (event.key === 'status') {
      this.filterStatus.set(event.value);
    }
    this.loadAlerts();
  }

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const user = this.authService.currentUser();
    const companyId = user?.companyId?.toString() || '';
    if (!companyId) {
      this.errorHandler.showError('ไม่พบ Company ID กรุณาเข้าสู่ระบบใหม่');
      this.errorMessage.set('ไม่พบ Company ID');
      this.isLoading.set(false);
      return;
    }
    this.alertService.getAlerts(
      companyId,
      this.currentPage(),
      this.pageSize(),
      this.filterType() || undefined,
      this.filterSeverity() || undefined,
      this.filterStatus() || undefined
    ).subscribe({
      next: (response) => {
        this.alerts.set(response.items);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Alerts ได้');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.alerts()];
    const search = this.searchTerm().toLowerCase();

    if (search) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search)
      );
    }

    this.filteredAlerts.set(filtered);
  }

  acknowledgeAlert(alert: Alert) {
    const user = this.authService.currentUser();
    const userId = user?.id || '';
    if (!userId) {
      this.errorHandler.showError('ไม่พบ User ID กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    this.isLoading.set(true);
    this.alertService.acknowledgeAlert(alert.id, { user_id: userId }).subscribe({
      next: () => {
        this.errorHandler.showSuccess('รับทราบ Alert แล้ว');
        this.loadAlerts();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.isLoading.set(false);
      }
    });
  }

  resolveAlert(alert: Alert) {
    const user = this.authService.currentUser();
    const userId = user?.id || '';
    if (!userId) {
      this.errorHandler.showError('ไม่พบ User ID กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    this.isLoading.set(true);
    this.alertService.resolveAlert(alert.id, { user_id: userId }).subscribe({
      next: () => {
        this.errorHandler.showSuccess('แก้ไข Alert แล้ว');
        this.loadAlerts();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.isLoading.set(false);
      }
    });
  }

  getSeverityClass(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
      case AlertSeverity.HIGH:
        return 'bg-orange-100 text-orange-800';
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case AlertSeverity.LOW:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

