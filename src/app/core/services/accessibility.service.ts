import { Injectable, Inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  colorBlindSupport: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'auto';
  animationSpeed: 'slow' | 'normal' | 'fast';
  focusIndicator: 'default' | 'high' | 'extra-high';
  readingMode: boolean;
  voiceOver: boolean;
  magnifier: boolean;
  keyboardShortcuts: boolean;
}

export interface AccessibilityFeatures {
  skipLinks: boolean;
  landmarks: boolean;
  headings: boolean;
  altText: boolean;
  ariaLabels: boolean;
  focusManagement: boolean;
  colorContrast: boolean;
  textScaling: boolean;
  screenReaderSupport: boolean;
  keyboardSupport: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  // ✅ Signals for reactive state
  private _settings = signal<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true,
    colorBlindSupport: false,
    fontSize: 'medium',
    colorScheme: 'auto',
    animationSpeed: 'normal',
    focusIndicator: 'default',
    readingMode: false,
    voiceOver: false,
    magnifier: false,
    keyboardShortcuts: true
  });

  private _features = signal<AccessibilityFeatures>({
    skipLinks: true,
    landmarks: true,
    headings: true,
    altText: true,
    ariaLabels: true,
    focusManagement: true,
    colorContrast: true,
    textScaling: true,
    screenReaderSupport: true,
    keyboardSupport: true
  });

  private _currentFocus = signal<HTMLElement | null>(null);

  // ✅ Readonly signals for public access
  public readonly settings = this._settings.asReadonly();
  public readonly features = this._features.asReadonly();
  public readonly currentFocus = this._currentFocus.asReadonly();

  // ✅ Computed signals for derived state
  public readonly isHighContrast = computed(() => this._settings().highContrast);
  public readonly isLargeText = computed(() => this._settings().largeText);
  public readonly isReducedMotion = computed(() => this._settings().reducedMotion);
  public readonly isScreenReader = computed(() => this._settings().screenReader);
  public readonly isKeyboardNavigation = computed(() => this._settings().keyboardNavigation);
  public readonly fontSize = computed(() => this._settings().fontSize);
  public readonly colorScheme = computed(() => this._settings().colorScheme);
  public readonly hasFocus = computed(() => this._currentFocus() !== null);
  private focusHistory: HTMLElement[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAccessibility();
      this.detectScreenReader();
      this.setupKeyboardNavigation();
      this.setupFocusManagement();
    }
  }

  // Settings Management
  getSettings(): Observable<AccessibilitySettings> {
    return new Observable<AccessibilitySettings>(observer => {
      observer.next(this._settings());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getCurrentSettings(): AccessibilitySettings {
    return this._settings();
  }

  updateSettings(updates: Partial<AccessibilitySettings>): void {
    const current = this._settings();
    const updated = { ...current, ...updates };
    this._settings.set(updated);
    this.applySettings(updated);
    this.saveSettings(updated);
  }

  // Features Management
  getFeatures(): Observable<AccessibilityFeatures> {
    return new Observable<AccessibilityFeatures>(observer => {
      observer.next(this._features());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getCurrentFeatures(): AccessibilityFeatures {
    return this._features();
  }

  updateFeatures(updates: Partial<AccessibilityFeatures>): void {
    const current = this._features();
    const updated = { ...current, ...updates };
    this._features.set(updated);
    this.applyFeatures(updated);
  }

  // Focus Management
  getCurrentFocus(): Observable<HTMLElement | null> {
    return new Observable<HTMLElement | null>(observer => {
      observer.next(this._currentFocus());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  setFocus(element: HTMLElement | null): void {
    if (element) {
      this.focusHistory.push(element);
      element.focus();
      this._currentFocus.set(element);
    }
  }

  getPreviousFocus(): HTMLElement | null {
    return this.focusHistory[this.focusHistory.length - 2] || null;
  }

  clearFocusHistory(): void {
    this.focusHistory = [];
  }

  // Keyboard Navigation
  setupKeyboardNavigation(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const settings = this._settings();
    if (!settings.keyboardNavigation) return;

    // Skip links
    if (event.key === 'Tab' && event.shiftKey) {
      this.handleSkipLinks(event);
    }

    // Focus management
    if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }

    // Escape key
    if (event.key === 'Escape') {
      this.handleEscapeKey(event);
    }

    // Arrow keys for navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      this.handleArrowNavigation(event);
    }

    // Enter and Space for activation
    if (['Enter', ' '].includes(event.key)) {
      this.handleActivation(event);
    }
  }

  private handleSkipLinks(event: KeyboardEvent): void {
    const skipLink = document.querySelector('[data-skip-link]') as HTMLElement;
    if (skipLink) {
      event.preventDefault();
      this.setFocus(skipLink);
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (currentIndex > 0) {
        this.setFocus(focusableElements[currentIndex - 1]);
      } else {
        this.setFocus(focusableElements[focusableElements.length - 1]);
      }
    } else {
      // Tab (forward)
      if (currentIndex < focusableElements.length - 1) {
        this.setFocus(focusableElements[currentIndex + 1]);
      } else {
        this.setFocus(focusableElements[0]);
      }
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const modals = document.querySelectorAll('[data-modal]');
    modals.forEach(modal => {
      if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        this.setFocus(document.querySelector('[data-trigger]') as HTMLElement);
      }
    });
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const currentElement = document.activeElement as HTMLElement;
    const parent = currentElement.closest('[role="menu"], [role="listbox"], [role="grid"]');

    if (parent) {
      const items = Array.from(parent.querySelectorAll('[role="menuitem"], [role="option"], [role="gridcell"]'));
      const currentIndex = items.indexOf(currentElement);

      let nextIndex = currentIndex;
      switch (event.key) {
        case 'ArrowUp':
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowDown':
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowLeft':
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'ArrowRight':
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
      }

      if (nextIndex !== currentIndex) {
        this.setFocus(items[nextIndex] as HTMLElement);
      }
    }
  }

  private handleActivation(event: KeyboardEvent): void {
    const currentElement = document.activeElement as HTMLElement;

    if (currentElement.tagName === 'BUTTON' || currentElement.getAttribute('role') === 'button') {
      event.preventDefault();
      currentElement.click();
    }
  }

  // Focus Management
  private setupFocusManagement(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('focusin', this.handleFocusIn.bind(this));
      document.addEventListener('focusout', this.handleFocusOut.bind(this));
    }
  }

  private handleFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this._currentFocus.set(target);
    this.updateFocusIndicator(target);
  }

  private handleFocusOut(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('focus-visible');
  }

  private updateFocusIndicator(element: HTMLElement): void {
    const settings = this._settings();
    element.classList.add('focus-visible');

    // Apply focus indicator style based on settings
    const indicatorClass = `focus-indicator-${settings.focusIndicator}`;
    element.classList.add(indicatorClass);
  }

  // Screen Reader Detection
  private detectScreenReader(): void {
    if (typeof window !== 'undefined') {
      // Check for screen reader specific properties
      const hasScreenReader =
        'speechSynthesis' in window ||
        'webkitSpeechSynthesis' in window ||
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver');

      this.updateSettings({ screenReader: hasScreenReader });
    }
  }

  // Settings Application
  private applySettings(settings: AccessibilitySettings): void {
    if (typeof document !== 'undefined') {
      const body = document.body;

      // High contrast
      body.classList.toggle('high-contrast', settings.highContrast);

      // Large text
      body.classList.toggle('large-text', settings.largeText);

      // Reduced motion
      body.classList.toggle('reduced-motion', settings.reducedMotion);

      // Color blind support
      body.classList.toggle('color-blind-support', settings.colorBlindSupport);

      // Font size
      body.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
      body.classList.add(`font-${settings.fontSize}`);

      // Color scheme
      body.classList.remove('color-scheme-light', 'color-scheme-dark', 'color-scheme-auto');
      body.classList.add(`color-scheme-${settings.colorScheme}`);

      // Animation speed
      body.classList.remove('animation-slow', 'animation-normal', 'animation-fast');
      body.classList.add(`animation-${settings.animationSpeed}`);

      // Focus indicator
      body.classList.remove('focus-default', 'focus-high', 'focus-extra-high');
      body.classList.add(`focus-${settings.focusIndicator}`);

      // Reading mode
      body.classList.toggle('reading-mode', settings.readingMode);

      // Voice over
      body.classList.toggle('voice-over', settings.voiceOver);

      // Magnifier
      body.classList.toggle('magnifier', settings.magnifier);
    }
  }

  private applyFeatures(features: AccessibilityFeatures): void {
    if (typeof document !== 'undefined') {
      // Skip links
      this.toggleSkipLinks(features.skipLinks);

      // Landmarks
      this.toggleLandmarks(features.landmarks);

      // Headings
      this.toggleHeadings(features.headings);

      // Alt text
      this.toggleAltText(features.altText);

      // ARIA labels
      this.toggleAriaLabels(features.ariaLabels);

      // Focus management
      this.toggleFocusManagement(features.focusManagement);

      // Color contrast
      this.toggleColorContrast(features.colorContrast);

      // Text scaling
      this.toggleTextScaling(features.textScaling);

      // Screen reader support
      this.toggleScreenReaderSupport(features.screenReaderSupport);

      // Keyboard support
      this.toggleKeyboardSupport(features.keyboardSupport);
    }
  }

  // Feature Toggles
  private toggleSkipLinks(enabled: boolean): void {
    const skipLinks = document.querySelectorAll('[data-skip-link]');
    skipLinks.forEach(link => {
      (link as HTMLElement).style.display = enabled ? 'block' : 'none';
    });
  }

  private toggleLandmarks(enabled: boolean): void {
    const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
    landmarks.forEach(landmark => {
      (landmark as HTMLElement).setAttribute('aria-hidden', (!enabled).toString());
    });
  }

  private toggleHeadings(enabled: boolean): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      (heading as HTMLElement).setAttribute('aria-hidden', (!enabled).toString());
    });
  }

  private toggleAltText(enabled: boolean): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (enabled && !img.getAttribute('alt')) {
        img.setAttribute('alt', 'Image');
      } else if (!enabled) {
        img.removeAttribute('alt');
      }
    });
  }

  private toggleAriaLabels(enabled: boolean): void {
    const elements = document.querySelectorAll('button, input, select, textarea, a');
    elements.forEach(element => {
      if (enabled && !element.getAttribute('aria-label')) {
        const text = element.textContent || element.getAttribute('placeholder') || 'Interactive element';
        element.setAttribute('aria-label', text);
      } else if (!enabled) {
        element.removeAttribute('aria-label');
      }
    });
  }

  private toggleFocusManagement(enabled: boolean): void {
    const focusableElements = this.getFocusableElements();
    focusableElements.forEach(element => {
      element.setAttribute('tabindex', enabled ? '0' : '-1');
    });
  }

  private toggleColorContrast(enabled: boolean): void {
    const body = document.body;
    body.classList.toggle('high-contrast', enabled);
  }

  private toggleTextScaling(enabled: boolean): void {
    const body = document.body;
    body.classList.toggle('text-scaling', enabled);
  }

  private toggleScreenReaderSupport(enabled: boolean): void {
    const body = document.body;
    body.classList.toggle('screen-reader-support', enabled);
  }

  private toggleKeyboardSupport(enabled: boolean): void {
    const body = document.body;
    body.classList.toggle('keyboard-support', enabled);
  }

  // Utility Methods
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="gridcell"]'
    ];

    return Array.from(document.querySelectorAll(focusableSelectors.join(', '))) as HTMLElement[];
  }

  // Initialization
  private initializeAccessibility(): void {
    this.loadSettings();
    this.detectSystemPreferences();
    this.setupAccessibilityFeatures();
  }

  private loadSettings(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          this._settings.set(settings);
          this.applySettings(settings);
        } catch (e) {
          console.warn('Failed to load accessibility settings:', e);
        }
      }
    }
  }

  private saveSettings(settings: AccessibilitySettings): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    }
  }

  private detectSystemPreferences(): void {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      // Detect reduced motion preference
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.updateSettings({ reducedMotion });

      // Detect color scheme preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

      if (prefersDark) {
        this.updateSettings({ colorScheme: 'dark' });
      } else if (prefersLight) {
        this.updateSettings({ colorScheme: 'light' });
      }

      // Detect high contrast preference
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
      this.updateSettings({ highContrast });
    }
  }

  private setupAccessibilityFeatures(): void {
    // Add skip links
    this.addSkipLinks();

    // Add landmarks
    this.addLandmarks();

    // Add ARIA attributes
    this.addAriaAttributes();

    // Add focus management
    this.addFocusManagement();
  }

  private addSkipLinks(): void {
    if (typeof document !== 'undefined') {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'skip-link';
      skipLink.setAttribute('data-skip-link', 'true');
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  private addLandmarks(): void {
    if (typeof document !== 'undefined') {
      // Add main landmark
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('role', 'main');
        main.id = 'main-content';
      }

      // Add navigation landmarks
      const navs = document.querySelectorAll('nav');
      navs.forEach(nav => nav.setAttribute('role', 'navigation'));

      // Add banner landmark
      const header = document.querySelector('header');
      if (header) {
        header.setAttribute('role', 'banner');
      }

      // Add contentinfo landmark
      const footer = document.querySelector('footer');
      if (footer) {
        footer.setAttribute('role', 'contentinfo');
      }
    }
  }

  private addAriaAttributes(): void {
    if (typeof document !== 'undefined') {
      // Add ARIA labels to buttons without text
      const buttons = document.querySelectorAll('button:not([aria-label])');
      buttons.forEach(button => {
        if (!button.textContent?.trim()) {
          button.setAttribute('aria-label', 'Button');
        }
      });

      // Add ARIA labels to images
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach(img => {
        img.setAttribute('alt', 'Image');
      });

      // Add ARIA labels to form inputs
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) {
          input.setAttribute('aria-labelledby', label.id || 'label-' + input.id);
        }
      });
    }
  }

  private addFocusManagement(): void {
    if (typeof document !== 'undefined') {
      // Add focus trap to modals
      const modals = document.querySelectorAll('[data-modal]');
      modals.forEach(modal => {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
      });

      // Add focus management to dropdowns
      const dropdowns = document.querySelectorAll('[data-dropdown]');
      dropdowns.forEach(dropdown => {
        dropdown.setAttribute('role', 'listbox');
      });
    }
  }

  // Public API Methods
  announceToScreenReader(message: string): void {
    if (typeof document !== 'undefined') {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;

      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }

  toggleHighContrast(): void {
    const current = this._settings();
    this.updateSettings({ highContrast: !current.highContrast });
  }

  toggleLargeText(): void {
    const current = this._settings();
    this.updateSettings({ largeText: !current.largeText });
  }

  toggleReducedMotion(): void {
    const current = this._settings();
    this.updateSettings({ reducedMotion: !current.reducedMotion });
  }

  setFontSize(size: 'small' | 'medium' | 'large' | 'extra-large'): void {
    this.updateSettings({ fontSize: size });
  }

  setColorScheme(scheme: 'light' | 'dark' | 'auto'): void {
    this.updateSettings({ colorScheme: scheme });
  }

  // Reset to defaults
  resetToDefaults(): void {
    const defaults: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusVisible: true,
      colorBlindSupport: false,
      fontSize: 'medium',
      colorScheme: 'auto',
      animationSpeed: 'normal',
      focusIndicator: 'default',
      readingMode: false,
      voiceOver: false,
      magnifier: false,
      keyboardShortcuts: true
    };

    this.updateSettings(defaults);
  }
}

