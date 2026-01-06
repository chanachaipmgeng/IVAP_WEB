/**
 * Accessibility Dashboard Component
 *
 * Dashboard for managing accessibility settings and features.
 * Supports high contrast, large text, reduced motion, screen reader, keyboard navigation, and other accessibility options.
 *
 * @example
 * ```html
 * <app-accessibility-dashboard></app-accessibility-dashboard>
 * ```
 */

import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { AccessibilityService, AccessibilitySettings, AccessibilityFeatures } from '../../../core/services/accessibility.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-accessibility-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './accessibility-dashboard.component.html',
  styleUrl: './accessibility-dashboard.component.scss'
})
export class AccessibilityDashboardComponent extends BaseComponent implements OnInit {
  // Data
  settings = signal<AccessibilitySettings>({
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

  features = signal<AccessibilityFeatures>({
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

  // UI State
  activeTab = signal<'settings' | 'features' | 'testing' | 'guidelines'>('settings');
  isTesting = signal<boolean>(false);
  testResults = signal<any[]>([]);

  // Accessibility test scenarios
  testScenarios = [
    {
      name: 'Keyboard Navigation',
      description: 'Test keyboard navigation through all interactive elements',
      test: () => this.testKeyboardNavigation()
    },
    {
      name: 'Screen Reader Support',
      description: 'Test screen reader compatibility and ARIA labels',
      test: () => this.testScreenReaderSupport()
    },
    {
      name: 'Color Contrast',
      description: 'Test color contrast ratios for text and backgrounds',
      test: () => this.testColorContrast()
    },
    {
      name: 'Focus Management',
      description: 'Test focus indicators and focus trapping',
      test: () => this.testFocusManagement()
    },
    {
      name: 'Alt Text',
      description: 'Test presence of alt text for images',
      test: () => this.testAltText()
    },
    {
      name: 'Heading Structure',
      description: 'Test proper heading hierarchy',
      test: () => this.testHeadingStructure()
    }
  ];

  constructor(
    private accessibilityService: AccessibilityService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadFeatures();
  }

  private loadSettings(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const settings = this.accessibilityService.settings();
      this.settings.set(settings);
    });
  }

  private loadFeatures(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const features = this.accessibilityService.features();
      this.features.set(features);
    });
  }

  selectTab(tab: string): void {
    if (tab === 'settings' || tab === 'features' || tab === 'testing' || tab === 'guidelines') {
      this.activeTab.set(tab as any);
    }
  }

  // Settings Management
  updateSetting(key: keyof AccessibilitySettings, value: any): void {
    const current = this.settings();
    this.accessibilityService.updateSettings({ [key]: value });
  }

  updateFeature(key: keyof AccessibilityFeatures, value: boolean): void {
    const current = this.features();
    this.accessibilityService.updateFeatures({ [key]: value });
  }

  // Quick Actions
  toggleHighContrast(): void {
    this.accessibilityService.toggleHighContrast();
  }

  toggleLargeText(): void {
    this.accessibilityService.toggleLargeText();
  }

  toggleReducedMotion(): void {
    this.accessibilityService.toggleReducedMotion();
  }

  setFontSize(size: 'small' | 'medium' | 'large' | 'extra-large'): void {
    this.accessibilityService.setFontSize(size);
  }

  setColorScheme(scheme: 'light' | 'dark' | 'auto'): void {
    this.accessibilityService.setColorScheme(scheme);
  }

  resetToDefaults(): void {
    this.accessibilityService.resetToDefaults();
  }

  // Testing
  runAllTests(): void {
    this.isTesting.set(true);
    this.testResults.set([]);

    const results: any[] = [];
    let completed = 0;

    this.testScenarios.forEach((scenario, index) => {
      setTimeout(() => {
        try {
          const result = scenario.test();
          results.push({
            name: scenario.name,
            description: scenario.description,
            status: result.passed ? 'passed' : 'failed',
            issues: result.issues || [],
            score: result.score || 0
          });
        } catch (error) {
          results.push({
            name: scenario.name,
            description: scenario.description,
            status: 'error',
            issues: [error instanceof Error ? error.message : 'Unknown error'],
            score: 0
          });
        }

        completed++;
        this.testResults.set([...results]);

        if (completed === this.testScenarios.length) {
          this.isTesting.set(false);
        }
      }, index * 500);
    });
  }

  runSingleTest(scenario: any): void {
    this.isTesting.set(true);

    try {
      const result = scenario.test();
      this.testResults.set([{
        name: scenario.name,
        description: scenario.description,
        status: result.passed ? 'passed' : 'failed',
        issues: result.issues || [],
        score: result.score || 0
      }]);
    } catch (error) {
      this.testResults.set([{
        name: scenario.name,
        description: scenario.description,
        status: 'error',
        issues: [error instanceof Error ? error.message : 'Unknown error'],
        score: 0
      }]);
    } finally {
      this.isTesting.set(false);
    }
  }

  // Test Implementations
  private testKeyboardNavigation(): { passed: boolean; issues: string[]; score: number } {
    const issues: string[] = [];
    let score = 100;

    // Check for focusable elements
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');

    if (focusableElements.length === 0) {
      issues.push('No focusable elements found');
      score -= 50;
    }

    // Check for skip links
    const skipLinks = document.querySelectorAll('[data-skip-link]');
    if (skipLinks.length === 0) {
      issues.push('No skip links found');
      score -= 20;
    }

    // Check for proper tab order
    const tabOrder = Array.from(focusableElements).map(el => el.getAttribute('tabindex') || '0');
    const hasNegativeTabIndex = tabOrder.some(index => parseInt(index) < 0);
    if (hasNegativeTabIndex) {
      issues.push('Some elements have negative tabindex values');
      score -= 10;
    }

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  private testScreenReaderSupport(): { passed: boolean; issues: string[]; score: number } {
    const issues: string[] = [];
    let score = 100;

    // Check for ARIA labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    if (buttons.length > 0) {
      issues.push(`${buttons.length} buttons without ARIA labels`);
      score -= buttons.length * 5;
    }

    // Check for alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images without alt text`);
      score -= images.length * 10;
    }

    // Check for landmarks
    const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
    if (landmarks.length === 0) {
      issues.push('No landmark roles found');
      score -= 20;
    }

    // Check for headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push('No heading elements found');
      score -= 30;
    }

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  private testColorContrast(): { passed: boolean; issues: string[]; score: number } {
    const issues: string[] = [];
    let score = 100;

    // This is a simplified test - in a real implementation, you'd use a library like color-contrast
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    let lowContrastCount = 0;

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // Simplified contrast check (in reality, you'd calculate the actual contrast ratio)
      if (color === backgroundColor) {
        lowContrastCount++;
      }
    });

    if (lowContrastCount > 0) {
      issues.push(`${lowContrastCount} elements may have low color contrast`);
      score -= lowContrastCount * 5;
    }

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  private testFocusManagement(): { passed: boolean; issues: string[]; score: number } {
    const issues: string[] = [];
    let score = 100;

    // Check for focus indicators
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
    let noFocusIndicator = 0;

    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element, ':focus');
      if (styles.outline === 'none' && styles.boxShadow === 'none') {
        noFocusIndicator++;
      }
    });

    if (noFocusIndicator > 0) {
      issues.push(`${noFocusIndicator} elements without focus indicators`);
      score -= noFocusIndicator * 5;
    }

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  private testAltText(): { passed: boolean; issues: string[]; score: number } {
    const issues: string[] = [];
    let score = 100;

    const images = document.querySelectorAll('img');
    let noAltText = 0;

    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        noAltText++;
      }
    });

    if (noAltText > 0) {
      issues.push(`${noAltText} images without alt text`);
      score -= noAltText * 10;
    }

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  private testHeadingStructure(): { passed: boolean; issues: string[]; score: number } {
    const issues: string[] = [];
    let score = 100;

    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headingLevels = headings.map(h => parseInt(h.tagName.substring(1)));

    // Check for h1
    if (!headingLevels.includes(1)) {
      issues.push('No h1 heading found');
      score -= 20;
    }

    // Check for proper hierarchy
    let previousLevel = 0;
    for (let i = 0; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i];
      if (currentLevel > previousLevel + 1) {
        issues.push(`Heading level skipped from h${previousLevel} to h${currentLevel}`);
        score -= 10;
      }
      previousLevel = currentLevel;
    }

    return {
      passed: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };
  }

  // Utility Methods
  getTestStatusClass(status: string): string {
    switch (status) {
      case 'passed': return 'text-green-400 bg-green-500/10';
      case 'failed': return 'text-red-400 bg-red-500/10';
      case 'error': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  }

  getTestStatusIcon(status: string): string {
    switch (status) {
      case 'passed': return 'fas fa-check-circle';
      case 'failed': return 'fas fa-times-circle';
      case 'error': return 'fas fa-exclamation-triangle';
      default: return 'fas fa-question-circle';
    }
  }

  // Event Handlers
  onFontSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setFontSize(target.value as 'small' | 'medium' | 'large' | 'extra-large');
  }

  onColorSchemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.setColorScheme(target.value as 'light' | 'dark' | 'auto');
  }

  onAnimationSpeedChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateSetting('animationSpeed', target.value);
  }

  onFocusIndicatorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateSetting('focusIndicator', target.value);
  }

  onFeatureChange(featureKey: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.updateFeature(featureKey as keyof AccessibilityFeatures, target.checked);
  }

  getFeatureValue(featureKey: string): boolean {
    return this.features()[featureKey as keyof AccessibilityFeatures];
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
