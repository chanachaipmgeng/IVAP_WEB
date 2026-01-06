/**
 * Performance Dashboard Component
 *
 * Performance monitoring and optimization dashboard.
 * Displays performance metrics, optimization configurations, recommendations, and budget violations.
 *
 * @example
 * ```html
 * <app-performance-dashboard></app-performance-dashboard>
 * ```
 */

import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { PerformanceService, PerformanceMetrics, OptimizationConfig } from '../../../core/services/performance.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './performance-dashboard.component.html',
  styleUrl: './performance-dashboard.component.scss'
})
export class PerformanceDashboardComponent extends BaseComponent implements OnInit {
  // Data
  metrics = signal<PerformanceMetrics>({
    bundleSize: 0,
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    cacheHitRate: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0
  });

  config = signal<OptimizationConfig>({
    enableLazyLoading: true,
    enablePreloading: true,
    enableCompression: true,
    enableCaching: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableCodeSplitting: true,
    enableImageOptimization: true,
    enableServiceWorker: false,
    enableCDN: false
  });

  performanceScore = signal<number>(0);
  recommendations = signal<string[]>([]);
  budgetViolations = signal<string[]>([]);
  budgetPassed = signal<boolean>(true);

  // UI State
  activeTab = signal<'overview' | 'metrics' | 'optimization' | 'recommendations'>('overview');
  isOptimizing = signal<boolean>(false);

  // Interval tracking
  private performanceUpdateInterval?: ReturnType<typeof setInterval>;

  constructor(
    private performanceService: PerformanceService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadMetrics();
    this.loadConfig();
    this.updatePerformanceData();
  }

  override ngOnDestroy(): void {
    // Clear interval if exists
    if (this.performanceUpdateInterval) {
      clearInterval(this.performanceUpdateInterval);
    }
    super.ngOnDestroy();
  }

  private loadMetrics(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const metrics = this.performanceService.metrics();
      this.metrics.set(metrics);
      this.updatePerformanceScore();
      this.updateRecommendations();
      this.checkBudget();
    });
  }

  private loadConfig(): void {
    this.config.set(this.performanceService.getConfig());
  }

  private updatePerformanceData(): void {
    // Simulate real-time updates
    // ✅ Track interval for cleanup
    this.performanceUpdateInterval = setInterval(() => {
      if (this.isActive()) {
        const currentMetrics = this.performanceService.getCurrentMetrics();
        this.metrics.set(currentMetrics);
        this.updatePerformanceScore();
        this.updateRecommendations();
        this.checkBudget();
      }
    }, 5000);
  }

  private updatePerformanceScore(): void {
    const score = this.performanceService.getPerformanceScore();
    this.performanceScore.set(score);
  }

  private updateRecommendations(): void {
    const recommendations = this.performanceService.getPerformanceRecommendations();
    this.recommendations.set(recommendations);
  }

  private checkBudget(): void {
    const budget = this.performanceService.checkPerformanceBudget();
    this.budgetPassed.set(budget.passed);
    this.budgetViolations.set(budget.violations);
  }

  selectTab(tab: string): void {
    if (tab === 'overview' || tab === 'metrics' || tab === 'optimization' || tab === 'recommendations') {
      this.activeTab.set(tab as any);
    }
  }

  // Optimization Actions
  optimizeBundleSize(): void {
    this.isOptimizing.set(true);
    this.performanceService.optimizeBundleSize();

    setTimeout(() => {
      this.loadConfig();
      this.isOptimizing.set(false);
    }, 2000);
  }

  optimizeLazyLoading(): void {
    this.isOptimizing.set(true);
    this.performanceService.optimizeLazyLoading();

    setTimeout(() => {
      this.loadConfig();
      this.isOptimizing.set(false);
    }, 1500);
  }

  optimizeCaching(): void {
    this.isOptimizing.set(true);
    this.performanceService.optimizeCaching();

    setTimeout(() => {
      this.loadConfig();
      this.isOptimizing.set(false);
    }, 2000);
  }

  optimizeImages(): void {
    this.isOptimizing.set(true);
    this.performanceService.optimizeImages();

    setTimeout(() => {
      this.loadConfig();
      this.isOptimizing.set(false);
    }, 1000);
  }

  enableCDN(): void {
    this.isOptimizing.set(true);
    this.performanceService.enableCDN();

    setTimeout(() => {
      this.loadConfig();
      this.isOptimizing.set(false);
    }, 1500);
  }

  runFullOptimization(): void {
    this.isOptimizing.set(true);

    // Run all optimizations
    this.performanceService.optimizeBundleSize();
    this.performanceService.optimizeLazyLoading();
    this.performanceService.optimizeCaching();
    this.performanceService.optimizeImages();
    this.performanceService.enableCDN();

    setTimeout(() => {
      this.loadConfig();
      this.isOptimizing.set(false);
    }, 5000);
  }

  resetMetrics(): void {
    this.performanceService.resetMetrics();
  }

  // Utility Methods
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatTime(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  }

  getMetricStatus(value: number, threshold: number, isLowerBetter: boolean = true): { status: string; color: string } {
    const isGood = isLowerBetter ? value <= threshold : value >= threshold;

    if (isGood) {
      return { status: 'Good', color: 'text-green-400' };
    } else {
      return { status: 'Needs Improvement', color: 'text-red-400' };
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
