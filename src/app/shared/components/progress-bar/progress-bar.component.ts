/**
 * Progress Bar Component
 *
 * A customizable progress bar component for displaying progress or loading states.
 * Supports percentage display, labels, animations, and multiple color variants.
 *
 * @example
 * ```html
 * <app-progress-bar
 *   [value]="progressValue"
 *   [max]="100"
 *   label="Upload Progress"
 *   [config]="{ showPercentage: true, animated: true, color: 'primary' }">
 * </app-progress-bar>
 * ```
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProgressBarConfig {
  showPercentage: boolean;
  showLabel: boolean;
  animated: boolean;
  striped: boolean;
  size: 'sm' | 'md' | 'lg';
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  height: string;
  borderRadius: string;
}

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit, OnChanges {
  /**
   * Current progress value
   * @default 0
   */
  @Input() value: number = 0;

  /**
   * Maximum progress value
   * @default 100
   */
  @Input() max: number = 100;

  /**
   * Progress bar label
   * @default ''
   */
  @Input() label: string = '';

  /**
   * Progress bar configuration
   * @default {}
   */
  @Input() config: Partial<ProgressBarConfig> = {};

  /**
   * Additional CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for accessibility (overrides label if provided)
   */
  @Input() ariaLabel?: string;

  // Default configuration
  defaultConfig: ProgressBarConfig = {
    showPercentage: true,
    showLabel: true,
    animated: false,
    striped: false,
    size: 'md',
    color: 'primary',
    height: '20px',
    borderRadius: '4px'
  };

  // Computed properties
  percentage: number = 0;
  displayValue: number = 0;
  isIndeterminate: boolean = false;

  ngOnInit(): void {
    this.updateProgress();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['max']) {
      this.updateProgress();
    }
  }

  /**
   * Update progress calculations
   */
  private updateProgress(): void {
    if (this.value < 0) {
      this.isIndeterminate = true;
      this.percentage = 0;
      this.displayValue = 0;
    } else {
      this.isIndeterminate = false;
      this.percentage = Math.min(Math.max((this.value / this.max) * 100, 0), 100);
      this.displayValue = Math.min(Math.max(this.value, 0), this.max);
    }
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): ProgressBarConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Get progress bar classes
   */
  getProgressBarClasses(): string[] {
    const classes = ['progress-bar'];
    const config = this.mergedConfig;

    // Size classes
    classes.push(`progress-bar-${config.size}`);

    // Color classes
    classes.push(`progress-bar-${config.color}`);

    // Animation classes
    if (config.animated) {
      classes.push('progress-bar-animated');
    }

    if (config.striped) {
      classes.push('progress-bar-striped');
    }

    // Indeterminate class
    if (this.isIndeterminate) {
      classes.push('progress-bar-indeterminate');
    }

    return classes;
  }

  /**
   * Get progress bar styles
   */
  getProgressBarStyles(): { [key: string]: string } {
    const config = this.mergedConfig;
    const styles: { [key: string]: string } = {
      width: `${this.percentage}%`,
      height: config.height,
      borderRadius: config.borderRadius
    };

    return styles;
  }

  /**
   * Get container styles
   */
  getContainerStyles(): { [key: string]: string } {
    const config = this.mergedConfig;
    return {
      height: config.height,
      borderRadius: config.borderRadius
    };
  }

  /**
   * Get percentage text
   */
  getPercentageText(): string {
    if (this.isIndeterminate) {
      return '...';
    }
    return `${Math.round(this.percentage)}%`;
  }

  /**
   * Get display label
   */
  getDisplayLabel(): string {
    if (this.label) {
      return this.label;
    }
    return `${this.displayValue} / ${this.max}`;
  }

  /**
   * Check if progress is complete
   */
  isComplete(): boolean {
    return this.percentage >= 100;
  }

  /**
   * Check if progress is in warning range
   */
  isWarning(): boolean {
    return this.percentage >= 80 && this.percentage < 100;
  }

  /**
   * Check if progress is in danger range
   */
  isDanger(): boolean {
    return this.percentage >= 90;
  }

  /**
   * Get status color based on progress
   */
  getStatusColor(): string {
    if (this.isDanger()) return 'danger';
    if (this.isWarning()) return 'warning';
    if (this.isComplete()) return 'success';
    return this.mergedConfig.color;
  }
}

