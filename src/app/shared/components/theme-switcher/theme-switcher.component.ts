/**
 * Theme Switcher Component
 *
 * A theme switcher component for toggling between light/dark/auto modes and color schemes.
 * Supports language switching and provides a dropdown interface for theme selection.
 *
 * @example
 * ```html
 * <app-theme-switcher
 *   [customClass]="'my-theme-switcher'"
 *   [ariaLabel]="'Theme switcher'">
 * </app-theme-switcher>
 * ```
 */

import { Component, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { COLOR_SCHEMES } from '../../../core/config/design-system.config';
import { dropdownAnimation } from '../../../core/animations/animations';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  animations: [dropdownAnimation],
  template: `
    <div class="theme-switcher" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || 'Theme switcher'">
      <!-- Mode Toggle -->
      <button
        (click)="toggleDropdown()"
        class="theme-button"
        [title]="getThemeTooltip()"
        [attr.aria-label]="ariaLabel || 'Theme switcher'"
        [attr.aria-expanded]="showDropdown() ? 'true' : 'false'"
        [attr.aria-haspopup]="'true'"
        [attr.aria-controls]="showDropdown() ? dropdownId : null"
        [attr.tabindex]="0"
        (keydown.enter)="toggleDropdown()"
        (keydown.space)="toggleDropdown(); $event.preventDefault()"
        (keydown.escape)="closeDropdown()">
        <span class="theme-icon" [attr.aria-hidden]="true">{{ getModeIcon() }}</span>
        <span class="theme-label">{{ getModeLabel() }}</span>
        <span class="dropdown-arrow" [class.open]="showDropdown()" [attr.aria-hidden]="true">▼</span>
      </button>

      <!-- Dropdown Menu -->
      @if (showDropdown()) {
        <div [id]="dropdownId" class="theme-dropdown" @dropdownAnimation role="menu" [attr.aria-label]="'Theme options'">
          <!-- Mode Selection -->
          <div class="dropdown-section" role="group" [attr.aria-label]="'Theme mode'">
            <div class="section-label">{{ i18n.t('theme.title') }}</div>
            <div class="mode-buttons" role="radiogroup" [attr.aria-label]="'Select theme mode'">
              <button
                *ngFor="let mode of modes; trackBy: trackByMode"
                (click)="selectMode(mode)"
                [class.active]="theme.mode() === mode"
                class="mode-button"
                role="radio"
                [attr.aria-checked]="theme.mode() === mode ? 'true' : 'false'"
                [attr.aria-label]="'Select ' + getModeLabelFor(mode) + ' mode'"
                [attr.tabindex]="theme.mode() === mode ? 0 : -1"
                (keydown.enter)="selectMode(mode)"
                (keydown.space)="selectMode(mode); $event.preventDefault()">
                <span class="mode-icon" [attr.aria-hidden]="true">{{ getModeIconFor(mode) }}</span>
                <span class="mode-label">{{ getModeLabelFor(mode) }}</span>
              </button>
            </div>
          </div>

          <!-- Divider -->
          <div class="dropdown-divider"></div>

          <!-- Color Scheme Selection -->
          <div class="dropdown-section" role="group" [attr.aria-label]="'Color scheme'">
            <div class="section-label">{{ i18n.t('theme.colorScheme') }}</div>
            <div class="color-schemes" role="radiogroup" [attr.aria-label]="'Select color scheme'">
              <button
                *ngFor="let scheme of availableSchemes(); trackBy: trackByScheme"
                (click)="selectColorScheme(scheme.id)"
                [class.active]="theme.colorSchemeId() === scheme.id"
                class="color-scheme-button"
                [title]="getColorSchemeLabel(scheme)"
                role="radio"
                [attr.aria-checked]="theme.colorSchemeId() === scheme.id ? 'true' : 'false'"
                [attr.aria-label]="'Select ' + getColorSchemeLabel(scheme) + ' color scheme'"
                [attr.tabindex]="theme.colorSchemeId() === scheme.id ? 0 : -1"
                (keydown.enter)="selectColorScheme(scheme.id)"
                (keydown.space)="selectColorScheme(scheme.id); $event.preventDefault()">
                <div class="color-preview" [attr.aria-hidden]="true">
                  <span class="color-dot" [style.background-color]="scheme.primary"></span>
                  <span class="color-dot" [style.background-color]="scheme.secondary"></span>
                  <span class="color-dot" [style.background-color]="scheme.accent"></span>
                </div>
                <span class="scheme-name">{{ getColorSchemeLabel(scheme) }}</span>
              </button>
            </div>
          </div>

          <!-- Language Toggle (bonus) -->
          <div class="dropdown-divider" [attr.aria-hidden]="true"></div>
          <div class="dropdown-section">
            <button
              (click)="toggleLanguage()"
              class="language-button"
              role="button"
              [attr.aria-label]="'Toggle language to ' + (i18n.currentLanguage() === 'th' ? 'English' : 'Thai')"
              [attr.tabindex]="0"
              (keydown.enter)="toggleLanguage()"
              (keydown.space)="toggleLanguage(); $event.preventDefault()">
              <span class="language-icon" [attr.aria-hidden]="true">🌐</span>
              <span>{{ i18n.currentLanguage() === 'th' ? 'ไทย' : 'English' }}</span>
              <span class="text-xs text-gray-500" [attr.aria-hidden]="true">→ {{ i18n.currentLanguage() === 'th' ? 'EN' : 'TH' }}</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .theme-switcher {
      position: relative;
      display: inline-block;
    }

    .theme-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--color-textPrimary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .theme-button:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--color-primary);
      transform: translateY(-1px);
    }

    .theme-icon {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
    }

    .theme-label {
      display: none;
    }

    @media (min-width: 768px) {
      .theme-label {
        display: inline;
      }
    }

    .dropdown-arrow {
      font-size: 0.75rem;
      transition: transform 0.3s ease;
    }

    .dropdown-arrow.open {
      transform: rotate(180deg);
    }

    .theme-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      min-width: 320px;
      max-width: 400px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      padding: 1rem;
      z-index: 1070;
      backdrop-filter: blur(10px);
    }

    .dropdown-section {
      padding: 0.5rem 0;
    }

    .section-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--color-textSecondary);
      margin-bottom: 0.75rem;
      letter-spacing: 0.05em;
    }

    .mode-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .mode-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 0.5rem;
      background: rgba(0, 0, 0, 0.02);
      border: 2px solid transparent;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--color-textPrimary);
    }

    .mode-button:hover {
      background: rgba(var(--color-primary-rgb), 0.05);
      border-color: var(--color-primary);
    }

    .mode-button.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .mode-icon {
      font-size: 1.5rem;
    }

    .mode-label {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--color-border);
      margin: 0.75rem 0;
    }

    .color-schemes {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .color-scheme-button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.02);
      border: 2px solid transparent;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .color-scheme-button:hover {
      background: rgba(var(--color-primary-rgb), 0.05);
      border-color: var(--color-primary);
    }

    .color-scheme-button.active {
      background: rgba(var(--color-primary-rgb), 0.1);
      border-color: var(--color-primary);
    }

    .color-preview {
      display: flex;
      gap: 0.25rem;
    }

    .color-dot {
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .scheme-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-textPrimary);
    }

    .language-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.02);
      border: 2px solid transparent;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--color-textPrimary);
      font-weight: 500;
    }

    .language-button:hover {
      background: rgba(var(--color-primary-rgb), 0.05);
      border-color: var(--color-primary);
    }

    .language-icon {
      font-size: 1.25rem;
    }

    :host-context(.dark) .theme-button {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.1);
    }

    :host-context(.dark) .mode-button,
    :host-context(.dark) .color-scheme-button,
    :host-context(.dark) .language-button {
      background: rgba(255, 255, 255, 0.05);
    }

    :host-context(.dark) .mode-button:hover,
    :host-context(.dark) .color-scheme-button:hover,
    :host-context(.dark) .language-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class ThemeSwitcherComponent {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Show dropdown state (private)
   */
  private _showDropdown = false;

  /**
   * Show dropdown computed signal
   */
  public showDropdown = computed(() => this._showDropdown);

  /**
   * Available theme modes
   */
  public modes: ThemeMode[] = ['light', 'dark', 'auto'];

  /**
   * Available color schemes computed signal
   */
  public availableSchemes = computed(() => this.theme.availableColorSchemes());

  /**
   * Unique dropdown ID
   */
  dropdownId: string = `theme-dropdown-${Math.random().toString(36).substr(2, 9)}`;

  constructor(
    public theme: ThemeService,
    public i18n: I18nService
  ) {
    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.theme-switcher')) {
          this._showDropdown = false;
        }
      });
    }
  }

  /**
   * Toggle dropdown
   */
  public toggleDropdown(): void {
    this._showDropdown = !this._showDropdown;
  }

  /**
   * Close dropdown
   */
  public closeDropdown(): void {
    this._showDropdown = false;
  }

  /**
   * Select theme mode
   */
  public selectMode(mode: ThemeMode): void {
    this.theme.setMode(mode);
    this.closeDropdown();
  }

  /**
   * Select color scheme
   */
  public selectColorScheme(schemeId: string): void {
    this.theme.setColorScheme(schemeId);
    this.closeDropdown();
  }

  /**
   * Toggle language
   */
  public toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  /**
   * TrackBy function for theme modes
   */
  trackByMode(index: number, mode: ThemeMode): string {
    return mode;
  }

  /**
   * TrackBy function for color schemes
   */
  trackByScheme(index: number, scheme: { id: string }): string {
    return scheme.id;
  }

  public getModeIcon(): string {
    const mode = this.theme.mode();
    const isDark = this.theme.isDark();

    if (mode === 'auto') {
      return isDark ? '🌙' : '☀️';
    }
    return mode === 'dark' ? '🌙' : '☀️';
  }

  public getModeIconFor(mode: ThemeMode): string {
    switch (mode) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🔄';
      default: return '☀️';
    }
  }

  public getModeLabel(): string {
    const mode = this.theme.mode();
    return this.i18n.t(`theme.${mode}`);
  }

  public getModeLabelFor(mode: ThemeMode): string {
    return this.i18n.t(`theme.${mode}`);
  }

  public getColorSchemeLabel(scheme: any): string {
    const lang = this.i18n.currentLanguage();
    return lang === 'th' ? scheme.nameTh : scheme.name;
  }

  public getThemeTooltip(): string {
    return `${this.i18n.t('common.theme')}: ${this.getModeLabel()}`;
  }
}

