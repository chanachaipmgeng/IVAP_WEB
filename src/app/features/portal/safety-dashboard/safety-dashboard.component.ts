/**
 * Safety Dashboard Component
 *
 * Comprehensive safety monitoring dashboard with tabs for worker safety, environment monitoring, equipment monitoring, and AI models.
 * Displays safety violations, metrics, alerts, and real-time monitoring data.
 *
 * @example
 * ```html
 * <app-safety-dashboard></app-safety-dashboard>
 * ```
 */

import { Component, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerSafetyService } from '../../../core/services/worker-safety.service';
import { SafetyViolation, SafetyMetrics, SafetyZone } from '../../../core/models/safety.model';
import { EnvironmentMonitoringService, EnvironmentAlert, EnvironmentSensor, EnvironmentMetrics } from '../../../core/services/environment-monitoring.service';
import { EquipmentMonitoringService, EquipmentAlert, Equipment, EquipmentMetrics } from '../../../core/services/equipment-monitoring.service';
import { AIModelManagementService, AIModel, ModelMetrics } from '../../../core/services/ai-model-management.service';
import { AuthService } from '../../../core/services/auth.service';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-safety-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './safety-dashboard.component.html',
  styleUrls: ['./safety-dashboard.component.scss']
})
export class SafetyDashboardComponent extends BaseComponent implements OnInit {
  // Tab management
  selectedTab: 'overview' | 'worker-safety' | 'environment' | 'equipment' | 'ai-models' | 'reports' = 'overview';

  // Worker Safety
  workerSafetyViolations: SafetyViolation[] = [];
  workerSafetyMetrics: SafetyMetrics | null = null;
  workerSafetyZones: SafetyZone[] = [];

  // Environment Monitoring
  environmentAlerts: EnvironmentAlert[] = [];
  environmentSensors: EnvironmentSensor[] = [];
  environmentMetrics: EnvironmentMetrics | null = null;

  // Equipment Monitoring
  equipmentAlerts: EquipmentAlert[] = [];
  equipment: Equipment[] = [];
  equipmentMetrics: EquipmentMetrics | null = null;

  // AI Models
  aiModels: AIModel[] = [];
  aiModelMetrics: ModelMetrics | null = null;

  // Filter options
  dateRange = {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date()
  };

  severityFilter = 'all';
  statusFilter = 'all';
  zoneFilter = 'all';

  // Chart data
  chartData: any = {};

  constructor(
    private workerSafetyService: WorkerSafetyService,
    private environmentService: EnvironmentMonitoringService,
    private equipmentService: EquipmentMonitoringService,
    private aiModelService: AIModelManagementService,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializeData();
    this.setupSubscriptions();
    this.startMonitoring();
  }

  override ngOnDestroy(): void {
    this.stopMonitoring();
    super.ngOnDestroy();
  }

  /**
   * Initialize data
   */
  private initializeData(): void {
    this.workerSafetyViolations = this.workerSafetyService.getViolations();
    this.workerSafetyMetrics = this.workerSafetyService.getMetrics();
    this.workerSafetyZones = this.workerSafetyService.getZones();

    this.environmentAlerts = this.environmentService.getAlerts();
    this.environmentSensors = this.environmentService.getSensors();
    this.environmentMetrics = this.environmentService.getMetrics();

    this.equipmentAlerts = this.equipmentService.getAlerts();
    this.equipment = this.equipmentService.getEquipment();
    this.equipmentMetrics = this.equipmentService.getMetrics();

    this.aiModels = this.aiModelService.getModels();
    this.aiModelMetrics = this.aiModelService.getMetrics();

    this.updateChartData();
  }

  /**
   * Setup subscriptions
   */
  private setupSubscriptions(): void {
    // Worker Safety
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const violations = this.workerSafetyService.violations();
      this.workerSafetyViolations = violations;
      this.updateChartData();
    });

    effect(() => {
      const metrics = this.workerSafetyService.metrics();
      this.workerSafetyMetrics = metrics;
    });

    // Environment Monitoring - ✅ Using signals (no subscription needed)
    effect(() => {
      const alerts = this.environmentService.alerts();
      this.environmentAlerts = alerts;
      this.updateChartData();
    });

    effect(() => {
      const metrics = this.environmentService.metrics();
      this.environmentMetrics = metrics;
    });

    // Equipment Monitoring - ✅ Using signals (no subscription needed)
    // Equipment alerts and metrics are reactive signals
    effect(() => {
      const alerts = this.equipmentService.alerts();
      this.equipmentAlerts = alerts;
      this.updateChartData();
    });

    effect(() => {
      const metrics = this.equipmentService.metrics();
      this.equipmentMetrics = metrics;
    });

    // AI Models
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const models = this.aiModelService.models();
      this.aiModels = models;
    });

    effect(() => {
      const metrics = this.aiModelService.metrics();
      this.aiModelMetrics = metrics;
    });
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.workerSafetyService.startMonitoring();
    this.environmentService.startMonitoring();
    this.equipmentService.startMonitoring();
  }

  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    this.workerSafetyService.stopMonitoring();
    this.environmentService.stopMonitoring();
    this.equipmentService.stopMonitoring();
  }

  /**
   * Select tab
   */
  selectTab(tab: string): void {
    this.selectedTab = tab as 'overview' | 'worker-safety' | 'environment' | 'equipment' | 'ai-models' | 'reports';
  }

  /**
   * Get filtered violations
   */
  getFilteredViolations(): SafetyViolation[] {
    let violations = this.workerSafetyViolations;

    if (this.severityFilter !== 'all') {
      violations = violations.filter(v => v.severity === this.severityFilter);
    }
    if (this.statusFilter !== 'all') {
      violations = violations.filter(v => v.status === this.statusFilter);
    }
    if (this.zoneFilter !== 'all') {
      violations = violations.filter(v => v.zoneId === this.zoneFilter);
    }

    return violations;
  }

  /**
   * Get filtered environment alerts
   */
  getFilteredEnvironmentAlerts(): EnvironmentAlert[] {
    let alerts = this.environmentAlerts;

    if (this.severityFilter !== 'all') {
      alerts = alerts.filter(a => a.severity === this.severityFilter);
    }
    if (this.statusFilter !== 'all') {
      alerts = alerts.filter(a => a.status === this.statusFilter);
    }

    return alerts;
  }

  /**
   * Get filtered equipment alerts
   */
  getFilteredEquipmentAlerts(): EquipmentAlert[] {
    let alerts = this.equipmentAlerts;

    if (this.severityFilter !== 'all') {
      alerts = alerts.filter(a => a.severity === this.severityFilter);
    }
    if (this.statusFilter !== 'all') {
      alerts = alerts.filter(a => a.status === this.statusFilter);
    }

    return alerts;
  }

  /**
   * Load worker safety data
   */
  private loadWorkerSafetyData(): void {
    const currentUser = this.authService.currentUser();
    const companyId = currentUser?.companyId ? String(currentUser.companyId) : '';

    if (!companyId) {
      console.error('Company ID not found');
      return;
    }

    this.workerSafetyService.loadViolations(companyId).subscribe();
    this.workerSafetyService.loadMetrics(companyId).subscribe();
    this.workerSafetyService.loadZones(companyId).subscribe();
  }

  /**
   * Acknowledge violation
   */
  acknowledgeViolation(violationId: string): void {
    const currentUser = this.authService.currentUser();
    const companyId = currentUser?.companyId ? String(currentUser.companyId) : '';
    const acknowledgedBy = currentUser?.id || currentUser?.memberId || 'current-user';

    if (!companyId) {
      console.error('Company ID not found');
      alert('Company ID not found. Please login again.');
      return;
    }

    this.workerSafetyService.acknowledgeViolation(violationId, companyId, String(acknowledgedBy)).subscribe({
      next: () => {
        this.loadWorkerSafetyData();
      },
      error: (error) => {
        console.error('Error acknowledging violation:', error);
        alert('Failed to acknowledge violation');
      }
    });
  }

  /**
   * Resolve violation
   */
  resolveViolation(violationId: string): void {
    const currentUser = this.authService.currentUser();
    const companyId = currentUser?.companyId ? String(currentUser.companyId) : '';
    const resolvedBy = currentUser?.id || currentUser?.memberId || 'current-user';

    if (!companyId) {
      console.error('Company ID not found');
      alert('Company ID not found. Please login again.');
      return;
    }

    this.workerSafetyService.resolveViolation(violationId, companyId, String(resolvedBy)).subscribe({
      next: () => {
        this.loadWorkerSafetyData();
      },
      error: (error) => {
        console.error('Error resolving violation:', error);
        alert('Failed to resolve violation');
      }
    });
  }

  /**
   * Acknowledge environment alert
   */
  acknowledgeEnvironmentAlert(alertId: string): void {
    this.environmentService.acknowledgeAlert(alertId, 'current-user');
  }

  /**
   * Resolve environment alert
   */
  resolveEnvironmentAlert(alertId: string): void {
    this.environmentService.resolveAlert(alertId, 'current-user');
  }

  /**
   * Acknowledge equipment alert
   */
  acknowledgeEquipmentAlert(alertId: string): void {
    this.equipmentService.acknowledgeAlert(alertId, 'current-user');
  }

  /**
   * Resolve equipment alert
   */
  resolveEquipmentAlert(alertId: string): void {
    this.equipmentService.resolveAlert(alertId, 'current-user');
  }

  /**
   * Get severity color
   */
  getSeverityColor(severity: string): string {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors = {
      active: 'text-red-600 bg-red-100',
      acknowledged: 'text-yellow-600 bg-yellow-100',
      resolved: 'text-green-600 bg-green-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Get safety score color
   */
  getSafetyScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get trend icon
   */
  getTrendIcon(trend: string): string {
    const icons = {
      improving: '↗️',
      stable: '→',
      declining: '↘️'
    };
    return icons[trend as keyof typeof icons] || '→';
  }

  /**
   * Get trend color
   */
  getTrendColor(trend: string): string {
    const colors = {
      improving: 'text-green-600',
      stable: 'text-blue-600',
      declining: 'text-red-600'
    };
    return colors[trend as keyof typeof colors] || 'text-gray-600';
  }

  /**
   * Update chart data
   */
  private updateChartData(): void {
    this.chartData = {
      violationsByType: this.workerSafetyMetrics?.violationsByType || {},
      violationsBySeverity: this.workerSafetyMetrics?.violationsBySeverity || {},
      environmentAlertsByType: this.environmentMetrics?.alertsByType || {},
      equipmentAlertsByType: this.equipmentMetrics?.equipmentByType || {},
      aiModelsByType: this.aiModelMetrics?.modelsByType || {}
    };
  }

  /**
   * Generate safety report
   */
  generateSafetyReport(): void {
    const report = {
      workerSafety: this.workerSafetyService.generateSafetyReport({
        dateFrom: this.dateRange.from,
        dateTo: this.dateRange.to,
        includeImages: true
      }),
      environment: this.environmentService.generateEnvironmentReport({
        dateFrom: this.dateRange.from,
        dateTo: this.dateRange.to
      }),
      equipment: this.equipmentService.generateEquipmentReport({
        dateFrom: this.dateRange.from,
        dateTo: this.dateRange.to,
        includeMaintenance: true
      }),
      aiModels: this.aiModelService.generateModelReport({
        dateFrom: this.dateRange.from,
        dateTo: this.dateRange.to,
        includeTraining: true,
        includeDeployments: true
      })
    };

    // In a real application, this would trigger a download or open a report viewer
    // Report generated successfully
  }

  /**
   * Get tab icon
   */
  getTabIcon(tab: string): string {
    const icons = {
      overview: '📊',
      'worker-safety': '👷',
      environment: '🌡️',
      equipment: '⚙️',
      'ai-models': '🤖',
      reports: '📋'
    };
    return icons[tab as keyof typeof icons] || '📊';
  }

  /**
   * Get tab label
   */
  getTabLabel(tab: string): string {
    const labels = {
      overview: 'Overview',
      'worker-safety': 'Worker Safety',
      environment: 'Environment',
      equipment: 'Equipment',
      'ai-models': 'AI Models',
      reports: 'Reports'
    };
    return labels[tab as keyof typeof labels] || tab;
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format number
   */
  formatNumber(value: number, decimals: number = 0): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Get relative time
   */
  getRelativeTime(date: Date | string): string {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  /**
   * Get active violations count
   */
  getActiveViolationsCount(): number {
    return this.getFilteredViolations().filter(v => v.status === 'active').length;
  }

  /**
   * Get active sensors count
   */
  getActiveSensorsCount(): number {
    return this.environmentSensors.filter(s => s.status === 'online').length;
  }
}
