import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceUtils {

  // Debounce function for performance optimization
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: any;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle function for performance optimization
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Lazy load images
  static lazyLoadImages(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset['src']) {
              img.src = img.dataset['src']!;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Preload critical resources
  static preloadCriticalResources(resources: string[]): void {
    if (typeof document !== 'undefined') {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = this.getResourceType(resource);
        if (resource.endsWith('.woff2') || resource.endsWith('.woff')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      });
    }
  }

  // Get resource type for preloading
  private static getResourceType(resource: string): string {
    const extension = resource.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'js': 'script',
      'css': 'style',
      'woff2': 'font',
      'woff': 'font',
      'ttf': 'font',
      'eot': 'font',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'webp': 'image',
      'svg': 'image',
      'mp4': 'video',
      'webm': 'video',
      'mp3': 'audio',
      'wav': 'audio'
    };
    return typeMap[extension || ''] || 'fetch';
  }

  // Optimize images
  static optimizeImages(): void {
    if (typeof document !== 'undefined') {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Add loading="lazy" for non-critical images
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }

        // Add decoding="async" for better performance
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      });
    }
  }

  // Minify CSS
  static minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
      .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
      .replace(/;\s*/g, ';') // Remove spaces after semicolon
      .replace(/\s*,\s*/g, ',') // Remove spaces around commas
      .trim();
  }

  // Minify JavaScript
  static minifyJS(js: string): string {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*([{}();,=])\s*/g, '$1') // Remove spaces around operators
      .trim();
  }

  // Bundle size analyzer
  static analyzeBundleSize(bundle: any): {
    totalSize: number;
    gzippedSize: number;
    largestChunks: Array<{ name: string; size: number; percentage: number }>;
    recommendations: string[];
  } {
    const totalSize = bundle.totalSize || 0;
    const gzippedSize = bundle.gzippedSize || 0;

    const chunks = bundle.chunks || [];
    const largestChunks = chunks
      .sort((a: any, b: any) => b.size - a.size)
      .slice(0, 5)
      .map((chunk: any) => ({
        name: chunk.name,
        size: chunk.size,
        percentage: (chunk.size / totalSize) * 100
      }));

    const recommendations: string[] = [];

    if (totalSize > 500000) { // 500KB
      recommendations.push('Bundle size is large. Consider code splitting.');
    }

    if (gzippedSize / totalSize > 0.7) {
      recommendations.push('Compression ratio is low. Consider better minification.');
    }

    const largestChunk = largestChunks[0];
    if (largestChunk && largestChunk.percentage > 50) {
      recommendations.push('Largest chunk is too big. Consider splitting it.');
    }

    return {
      totalSize,
      gzippedSize,
      largestChunks,
      recommendations
    };
  }

  // Memory usage monitor
  static monitorMemoryUsage(): {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
      }
    }
    return null;
  }

  // Performance budget checker
  static checkPerformanceBudget(metrics: {
    bundleSize: number;
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  }): {
    passed: boolean;
    violations: Array<{ metric: string; value: number; threshold: number; severity: 'warning' | 'error' }>;
  } {
    const violations: Array<{ metric: string; value: number; threshold: number; severity: 'warning' | 'error' }> = [];

    const budgets = {
      bundleSize: { warning: 500000, error: 1000000 }, // 500KB, 1MB
      loadTime: { warning: 3000, error: 5000 }, // 3s, 5s
      firstContentfulPaint: { warning: 1800, error: 3000 }, // 1.8s, 3s
      largestContentfulPaint: { warning: 2500, error: 4000 }, // 2.5s, 4s
      cumulativeLayoutShift: { warning: 0.1, error: 0.25 }, // 0.1, 0.25
      firstInputDelay: { warning: 100, error: 300 } // 100ms, 300ms
    };

    Object.entries(budgets).forEach(([metric, thresholds]) => {
      const value = metrics[metric as keyof typeof metrics];
      if (value > thresholds.error) {
        violations.push({
          metric,
          value,
          threshold: thresholds.error,
          severity: 'error'
        });
      } else if (value > thresholds.warning) {
        violations.push({
          metric,
          value,
          threshold: thresholds.warning,
          severity: 'warning'
        });
      }
    });

    return {
      passed: violations.length === 0,
      violations
    };
  }

  // Resource hints generator
  static generateResourceHints(resources: Array<{ url: string; type: 'preload' | 'prefetch' | 'dns-prefetch' | 'preconnect' }>): string {
    return resources.map(resource => {
      const link = document.createElement('link');
      link.rel = resource.type;
      link.href = resource.url;

      if (resource.type === 'preload') {
        link.as = this.getResourceType(resource.url);
        if (resource.url.endsWith('.woff2') || resource.url.endsWith('.woff')) {
          link.crossOrigin = 'anonymous';
        }
      }

      return link.outerHTML;
    }).join('\n');
  }

  // Critical CSS extractor
  static extractCriticalCSS(selectors: string[]): string {
    if (typeof document !== 'undefined') {
      const styles = Array.from(document.styleSheets);
      let criticalCSS = '';

      styles.forEach(styleSheet => {
        try {
          const rules = Array.from(styleSheet.cssRules || []);
          rules.forEach(rule => {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              if (selectors.some(s => selector.includes(s))) {
                criticalCSS += rule.cssText + '\n';
              }
            }
          });
        } catch (e) {
          // Cross-origin stylesheets cannot be accessed
          console.warn('Cannot access stylesheet:', e);
        }
      });

      return this.minifyCSS(criticalCSS);
    }
    return '';
  }

  // Performance observer for monitoring
  static createPerformanceObserver(entryTypes: string[], callback: (entries: PerformanceEntry[]) => void): PerformanceObserver | null {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          callback(list.getEntries());
        });
        observer.observe({ entryTypes });
        return observer;
      } catch (e) {
        console.warn('PerformanceObserver not supported:', e);
      }
    }
    return null;
  }

  // Cleanup function
  static cleanup(): void {
    // Clean up any observers or timers
    if (typeof window !== 'undefined') {
      // Remove any global event listeners
      window.removeEventListener('load', this.measurePageLoadPerformance);
      window.removeEventListener('beforeunload', this.cleanup);
    }
  }

  private static measurePageLoadPerformance(): void {
    // This would be implemented in the performance service
  }
}
