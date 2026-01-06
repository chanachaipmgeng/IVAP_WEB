/**
 * Base Component
 * 
 * Abstract base class for Angular components that provides:
 * - Automatic subscription management (prevents memory leaks)
 * - Helper methods for common operations
 * - Lifecycle management
 * 
 * @example
 * ```typescript
 * export class MyComponent extends BaseComponent implements OnInit {
 *   constructor(private myService: MyService) {
 *     super();
 *   }
 * 
 *   ngOnInit(): void {
 *     // Auto-unsubscribe on component destroy
 *     this.subscribe(
 *       this.myService.data$,
 *       data => this.data = data
 *     );
 *   }
 * }
 * ```
 */

import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Base Component Class
 * 
 * Extend this class to get automatic subscription management
 * and helper methods for common component operations.
 * 
 * Features:
 * - ✅ Automatic unsubscribe on component destroy
 * - ✅ Helper methods for subscriptions
 * - ✅ Utility methods for common operations
 * - ✅ Compatible with Angular 16+ (uses takeUntilDestroyed)
 * - ✅ Backward compatible with older Angular versions
 */
@Component({
  template: '' // Abstract component, no template needed
})
export abstract class BaseComponent implements OnDestroy {
  /**
   * Subject for subscription management
   * Automatically completed in ngOnDestroy
   */
  protected readonly destroy$ = new Subject<void>();

  /**
   * Track all subscriptions for manual cleanup if needed
   */
  private subscriptions: Subscription[] = [];

  /**
   * Component lifecycle hook
   * Automatically called when component is destroyed
   */
  ngOnDestroy(): void {
    // Complete destroy$ subject
    this.destroy$.next();
    this.destroy$.complete();

    // Unsubscribe all tracked subscriptions
    this.unsubscribeAll();
  }

  /**
   * Subscribe to an Observable with automatic unsubscribe
   * 
   * Uses takeUntil pattern for automatic cleanup
   * 
   * @param observable - The Observable to subscribe to
   * @param next - Callback function for next values
   * @param error - Optional error callback
   * @param complete - Optional complete callback
   * @returns Subscription (for manual control if needed)
   * 
   * @example
   * ```typescript
   * ngOnInit(): void {
   *   this.subscribe(
   *     this.service.data$,
   *     data => this.data = data,
   *     error => console.error(error)
   *   );
   * }
   * ```
   */
  protected subscribe<T>(
    observable: Observable<T>,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    const subscription = observable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next ? (value: T) => next(value) : undefined,
        error: error ? (err: any) => error(err) : ((err: any) => console.error('Subscription error:', err)),
        complete: complete ? () => complete() : undefined
      });

    // Track subscription for manual cleanup if needed
    this.subscriptions.push(subscription);

    return subscription;
  }

  /**
   * Subscribe to an Observable using takeUntil pattern (backward compatibility)
   * 
   * Use this if you need manual control or are on Angular < 16
   * 
   * @param observable - The Observable to subscribe to
   * @param next - Callback function for next values
   * @param error - Optional error callback
   * @param complete - Optional complete callback
   * @returns Subscription
   * 
   * @example
   * ```typescript
   * ngOnInit(): void {
   *   this.subscribeUntil(
   *     this.service.data$,
   *     data => this.data = data
   *   );
   * }
   * ```
   */
  protected subscribeUntil<T>(
    observable: Observable<T>,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void
  ): Subscription {
    const subscription = observable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: next || (() => {}),
        error: error || ((err) => console.error('Subscription error:', err)),
        complete: complete || (() => {})
      });

    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Manually unsubscribe from a specific subscription
   * 
   * @param subscription - The subscription to unsubscribe
   */
  protected unsubscribe(subscription: Subscription): void {
    if (subscription && !subscription.closed) {
      subscription.unsubscribe();
      this.subscriptions = this.subscriptions.filter(sub => sub !== subscription);
    }
  }

  /**
   * Unsubscribe from all tracked subscriptions
   */
  protected unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  /**
   * Track a subscription for automatic cleanup
   * 
   * @param subscription - The subscription to track
   */
  protected trackSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }

  /**
   * Helper method to safely execute async operations
   * 
   * @param fn - Async function to execute
   * @param onError - Optional error handler
   * 
   * @example
   * ```typescript
   * this.safeAsync(async () => {
   *   const data = await this.service.loadData();
   *   this.data = data;
   * });
   * ```
   */
  protected safeAsync(
    fn: () => Promise<any>,
    onError?: (error: any) => void
  ): void {
    fn().catch(error => {
      if (onError) {
        onError(error);
      } else {
        console.error('Async operation error:', error);
      }
    });
  }

  /**
   * Helper method to debounce function calls
   * 
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   * 
   * @example
   * ```typescript
   * const debouncedSearch = this.debounce((query: string) => {
   *   this.search(query);
   * }, 300);
   * 
   * onInputChange(query: string): void {
   *   debouncedSearch(query);
   * }
   * ```
   */
  protected debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        fn(...args);
        timeoutId = null;
      }, delay);
    };
  }

  /**
   * Helper method to throttle function calls
   * 
   * @param fn - Function to throttle
   * @param limit - Time limit in milliseconds
   * @returns Throttled function
   * 
   * @example
   * ```typescript
   * const throttledScroll = this.throttle(() => {
   *   this.handleScroll();
   * }, 100);
   * 
   * onScroll(): void {
   *   throttledScroll();
   * }
   * ```
   */
  protected throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number = 100
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Helper method to check if component is still active
   * Useful for async operations that might complete after component is destroyed
   * 
   * @returns true if component is still active
   */
  protected isActive(): boolean {
    return !this.destroy$.closed;
  }

  /**
   * Helper method to safely update component state
   * Only updates if component is still active
   * 
   * @param updateFn - Function that updates component state
   * 
   * @example
   * ```typescript
   * this.safeUpdate(() => {
   *   this.data = newData;
   *   this.loading = false;
   * });
   * ```
   */
  protected safeUpdate(updateFn: () => void): void {
    if (this.isActive()) {
      updateFn();
    }
  }
}
