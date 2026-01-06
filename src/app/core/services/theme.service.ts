import { Injectable, signal, computed, effect } from '@angular/core';
import { COLOR_SCHEMES, ColorScheme, DARK_MODE_OVERRIDES } from '../config/design-system.config';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signals
  private _mode = signal<ThemeMode>('light');
  private _colorSchemeId = signal<string>('default');
  private _systemDarkMode = signal<boolean>(false);

  // Computed values
  public mode = this._mode.asReadonly();
  public colorSchemeId = this._colorSchemeId.asReadonly();

  public isDark = computed(() => {
    const mode = this._mode();
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return this._systemDarkMode();
  });

  public currentColorScheme = computed(() => {
    const id = this._colorSchemeId();
    return COLOR_SCHEMES.find(scheme => scheme.id === id) || COLOR_SCHEMES[0];
  });

  public availableColorSchemes = computed(() => COLOR_SCHEMES);

  constructor() {
    // Load saved preferences
    this.loadPreferences();

    // Listen to system dark mode changes
    this.watchSystemDarkMode();

    // Apply theme when changes occur
    effect(() => {
      // Read signals to establish dependency tracking
      const isDark = this.isDark();
      const mode = this._mode();
      const schemeId = this._colorSchemeId();
      
      this.applyTheme();
    });
  }

  /**
   * Set theme mode (light, dark, auto)
   */
  public setMode(mode: ThemeMode): void {
    this._mode.set(mode);
    localStorage.setItem('theme-mode', mode);
  }

  /**
   * Set color scheme
   */
  public setColorScheme(schemeId: string): void {
    const scheme = COLOR_SCHEMES.find(s => s.id === schemeId);
    if (scheme) {
      this._colorSchemeId.set(schemeId);
      localStorage.setItem('theme-color-scheme', schemeId);
    }
  }

  /**
   * Toggle between light and dark mode
   */
  public toggleMode(): void {
    const current = this._mode();
    if (current === 'auto') {
      this.setMode(this.isDark() ? 'light' : 'dark');
    } else {
      this.setMode(current === 'light' ? 'dark' : 'light');
    }
  }

  /**
   * Get CSS variable value for a color
   */
  public getColor(colorKey: keyof ColorScheme): string {
    return `var(--color-${colorKey})`;
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(): void {
    if (typeof document === 'undefined') {
      return;
    }
    
    const isDark = this.isDark();
    const scheme = this.currentColorScheme();
    const root = document.documentElement;
    const body = document.body;

    // Apply dark/light mode class to both html and body
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
    }
    
    // Force reflow to ensure styles are applied
    void root.offsetHeight;
    void body.offsetHeight;

    // Apply color scheme CSS variables
    const colors = isDark ? { ...scheme, ...DARK_MODE_OVERRIDES } : scheme;

    Object.entries(colors).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'name' && key !== 'nameTh') {
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Set meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary);
    }
  }

  /**
   * Load saved preferences from localStorage
   */
  private loadPreferences(): void {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const savedScheme = localStorage.getItem('theme-color-scheme');

    if (savedMode) {
      this._mode.set(savedMode);
    }

    if (savedScheme) {
      this._colorSchemeId.set(savedScheme);
    }
  }

  /**
   * Watch system dark mode preference
   */
  private watchSystemDarkMode(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._systemDarkMode.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (e) => {
      this._systemDarkMode.set(e.matches);
    });
  }

  /**
   * Export current theme settings
   */
  public exportThemeSettings(): string {
    return JSON.stringify({
      mode: this._mode(),
      colorScheme: this._colorSchemeId(),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import theme settings
   */
  public importThemeSettings(json: string): boolean {
    try {
      const settings = JSON.parse(json);
      if (settings.mode) this.setMode(settings.mode);
      if (settings.colorScheme) this.setColorScheme(settings.colorScheme);
      return true;
    } catch (error) {
      console.error('Failed to import theme settings:', error);
      return false;
    }
  }

  /**
   * Reset to default theme
   */
  public resetToDefault(): void {
    this.setMode('light');
    this.setColorScheme('default');
    localStorage.removeItem('theme-mode');
    localStorage.removeItem('theme-color-scheme');
  }
}
