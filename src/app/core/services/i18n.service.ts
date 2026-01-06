import { Injectable, signal, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'th' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly STORAGE_KEY = 'ivap-language';

  public currentLanguage = signal<Language>(this.getInitialLanguage());

  constructor(private translateService: TranslateService) {
    // Initialize language
    const initialLang = this.getInitialLanguage();
    this.translateService.setDefaultLang(initialLang);
    this.translateService.use(initialLang);
    this.currentLanguage.set(initialLang);

    // Sync language changes
    effect(() => {
      const lang = this.currentLanguage();
      this.translateService.use(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
    });
  }

  private getInitialLanguage(): Language {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language;
    if (stored && (stored === 'th' || stored === 'en')) {
      return stored;
    }
    // Default to Thai
    return 'th';
  }

  public setLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
  }

  public toggleLanguage(): void {
    const current = this.currentLanguage();
    this.setLanguage(current === 'th' ? 'en' : 'th');
  }

  public translate(key: string): string {
    return this.translateService.instant(key);
  }

  public t(key: string): string {
    return this.translate(key);
  }
}
