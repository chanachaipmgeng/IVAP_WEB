import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

/**
 * Translate Pipe for translating text in templates
 * 
 * Usage:
 * {{ 'common.welcome' | translate }}
 * {{ 'pages.dashboard.title' | translate }}
 * {{ 'common.name' | translate: {name: 'John'} }}
 */
@Pipe({
  name: 'translate',
  pure: false, // Make it impure to detect language changes
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;
  private lastKey?: string;
  private lastValue?: string;

  constructor() {
    // Subscribe to language changes
    this.subscription = this.translateService.onLangChange.subscribe(() => {
      this.lastValue = undefined; // Reset cached value
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: any): string {
    if (!key) {
      return '';
    }

    // If key and params haven't changed, return cached value
    if (this.lastKey === key && JSON.stringify(params) === JSON.stringify(this.lastParams)) {
      return this.lastValue || '';
    }

    this.lastKey = key;
    this.lastParams = params;

    // Get translation
    if (params) {
      this.lastValue = this.translateService.instant(key, params);
    } else {
      this.lastValue = this.translateService.instant(key);
    }

    return this.lastValue || key; // Return key if translation not found
  }

  private lastParams?: any;

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
