import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import {
  PerformanceMetrics,
  OptimizationConfig,
  BackendPerformanceMetrics
} from '../models/performance.model';

// Re-export for backward compatibility
export type {
  PerformanceMetrics,
  OptimizationConfig,
  BackendPerformanceMetrics
} from '../models/performance.model';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  // ✅ Signals for reactive state
  private _metrics = signal<PerformanceMetrics>({
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

  // ✅ Readonly signal for public access
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly isPerformanceGood = computed(() => {
    const m = this._metrics();
    return m.loadTime < 3000 && m.firstContentfulPaint < 1800 && m.largestContentfulPaint < 2500;
  });

  public readonly performanceScore = computed(() => {
    const m = this._metrics();
    let score = 100;
    if (m.loadTime > 3000) score -= 20;
    if (m.firstContentfulPaint > 1800) score -= 15;
    if (m.largestContentfulPaint > 2500) score -= 15;
    if (m.cumulativeLayoutShift > 0.1) score -= 10;
    if (m.firstInputDelay > 100) score -= 10;
    return Math.max(0, score);
  });

  private config: OptimizationConfig = {
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
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePerformanceMonitoring();
    }
  }

  // Performance Monitoring
  private initializePerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        this.measurePageLoadPerformance();
      });

      // Monitor Core Web Vitals
      this.measureCoreWebVitals();

      // Monitor memory usage
      this.monitorMemoryUsage();

      // Monitor network requests
      this.monitorNetworkRequests();
    }
  }

  private measurePageLoadPerformance(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

        this.updateMetrics({
          loadTime,
          renderTime
        });
      }
    }
  }

  private measureCoreWebVitals(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetrics({
              firstContentfulPaint: entry.startTime
            });
          }
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.updateMetrics({
          largestContentfulPaint: lastEntry.startTime
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.updateMetrics({
          cumulativeLayoutShift: clsValue
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.updateMetrics({
            firstInputDelay: (entry as any).processingStart - entry.startTime
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  private monitorMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        this.updateMetrics({ memoryUsage });
      }
    }
  }

  private monitorNetworkRequests(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const networkObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.updateMetrics({
          networkRequests: entries.length
        });
      });
      networkObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private updateMetrics(updates: Partial<PerformanceMetrics>): void {
    this._metrics.update(current => ({ ...current, ...updates }));
  }

  // Public API
  getMetrics(): Observable<PerformanceMetrics> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._metrics());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getCurrentMetrics(): PerformanceMetrics {
    return this._metrics();
  }

  // Bundle Size Optimization
  optimizeBundleSize(): void {
    // Enable tree shaking
    this.config.enableTreeShaking = true;

    // Enable minification
    this.config.enableMinification = true;

    // Enable code splitting
    this.config.enableCodeSplitting = true;

    // Enable compression
    this.config.enableCompression = true;
  }

  // Lazy Loading Optimization
  optimizeLazyLoading(): void {
    this.config.enableLazyLoading = true;
    this.config.enablePreloading = true;
  }

  // Caching Optimization
  optimizeCaching(): void {
    this.config.enableCaching = true;
    this.config.enableServiceWorker = true;
  }

  // Image Optimization
  optimizeImages(): void {
    this.config.enableImageOptimization = true;
  }

  // CDN Optimization
  enableCDN(): void {
    this.config.enableCDN = true;
  }

  // Performance Recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const metrics = this._metrics();

    if (metrics.bundleSize > 500000) { // 500KB
      recommendations.push('Bundle size is large. Consider code splitting and lazy loading.');
    }

    if (metrics.loadTime > 3000) { // 3 seconds
      recommendations.push('Load time is slow. Consider optimizing assets and enabling compression.');
    }

    if (metrics.firstContentfulPaint > 1800) { // 1.8 seconds
      recommendations.push('First Contentful Paint is slow. Consider optimizing critical rendering path.');
    }

    if (metrics.largestContentfulPaint > 2500) { // 2.5 seconds
      recommendations.push('Largest Contentful Paint is slow. Consider optimizing images and fonts.');
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Cumulative Layout Shift is high. Consider fixing layout shifts.');
    }

    if (metrics.firstInputDelay > 100) { // 100ms
      recommendations.push('First Input Delay is high. Consider optimizing JavaScript execution.');
    }

    if (metrics.memoryUsage > 50) { // 50MB
      recommendations.push('Memory usage is high. Consider optimizing memory leaks.');
    }

    return recommendations;
  }

  // Performance Score Calculation
  getPerformanceScore(): number {
    const metrics = this._metrics();
    let score = 100;

    // Bundle size penalty
    if (metrics.bundleSize > 500000) {
      score -= Math.min(20, (metrics.bundleSize - 500000) / 10000);
    }

    // Load time penalty
    if (metrics.loadTime > 3000) {
      score -= Math.min(20, (metrics.loadTime - 3000) / 100);
    }

    // FCP penalty
    if (metrics.firstContentfulPaint > 1800) {
      score -= Math.min(15, (metrics.firstContentfulPaint - 1800) / 100);
    }

    // LCP penalty
    if (metrics.largestContentfulPaint > 2500) {
      score -= Math.min(15, (metrics.largestContentfulPaint - 2500) / 100);
    }

    // CLS penalty
    if (metrics.cumulativeLayoutShift > 0.1) {
      score -= Math.min(10, metrics.cumulativeLayoutShift * 100);
    }

    // FID penalty
    if (metrics.firstInputDelay > 100) {
      score -= Math.min(10, (metrics.firstInputDelay - 100) / 10);
    }

    return Math.max(0, Math.round(score));
  }

  // Performance Budget Check
  checkPerformanceBudget(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    const metrics = this._metrics();

    if (metrics.bundleSize > 500000) {
      violations.push(`Bundle size ${Math.round(metrics.bundleSize / 1024)}KB exceeds 500KB budget`);
    }

    if (metrics.loadTime > 3000) {
      violations.push(`Load time ${Math.round(metrics.loadTime)}ms exceeds 3000ms budget`);
    }

    if (metrics.firstContentfulPaint > 1800) {
      violations.push(`FCP ${Math.round(metrics.firstContentfulPaint)}ms exceeds 1800ms budget`);
    }

    if (metrics.largestContentfulPaint > 2500) {
      violations.push(`LCP ${Math.round(metrics.largestContentfulPaint)}ms exceeds 2500ms budget`);
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      violations.push(`CLS ${metrics.cumulativeLayoutShift.toFixed(3)} exceeds 0.1 budget`);
    }

    if (metrics.firstInputDelay > 100) {
      violations.push(`FID ${Math.round(metrics.firstInputDelay)}ms exceeds 100ms budget`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  // Resource Optimization
  optimizeResources(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Preload critical resources
      this.preloadCriticalResources();

      // Optimize images
      this.optimizeImages();

      // Enable compression
      this.enableCompression();
    }
  }

  private preloadCriticalResources(): void {
    const criticalResources = [
      '/assets/fonts/main.woff2',
      '/assets/css/critical.css'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.woff2') ? 'font' : 'style';
      if (resource.endsWith('.woff2')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  private enableCompression(): void {
    // This would typically be handled by the server
    // But we can set up client-side optimizations
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          // Service Worker registered successfully
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  // Get optimization configuration
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  // Update optimization configuration
  updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Reset performance metrics
  resetMetrics(): void {
    this._metrics.set({
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
  }
}


