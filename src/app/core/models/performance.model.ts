/**
 * Performance Models
 * Models สำหรับ Performance Service
 */

/**
 * Performance Metrics Model
 */
export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

/**
 * Optimization Config Model
 */
export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enablePreloading: boolean;
  enableCompression: boolean;
  enableCaching: boolean;
  enableTreeShaking: boolean;
  enableMinification: boolean;
  enableCodeSplitting: boolean;
  enableImageOptimization: boolean;
  enableServiceWorker: boolean;
  enableCDN: boolean;
}

/**
 * Backend Performance Metrics (from API)
 */
export interface BackendPerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
  responseTime: number;
  uptime: number;
  timestamp: Date | string;
}

