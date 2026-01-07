/**
 * Component Showcase (UI Kit)
 *
 * A centralized page to display and test all reusable UI components in the design system.
 * This serves as a reference for developers and designers.
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../../../shared/components/glass-input/glass-input.component';
import { BadgeComponent, BadgeVariant } from '../../../../shared/components/badge/badge.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { SwitchComponent } from '../../../../shared/components/switch/switch.component';
import { CheckboxComponent } from '../../../../shared/components/checkbox/checkbox.component';
import { RadioComponent } from '../../../../shared/components/radio/radio.component';
import { ThemeSwitcherComponent } from '../../../../shared/components/theme-switcher/theme-switcher.component';
import { ProgressBarComponent, ProgressBarConfig } from '../../../../shared/components/progress-bar/progress-bar.component';
import { RatingComponent, RatingConfig } from '../../../../shared/components/rating/rating.component';

@Component({
  selector: 'app-component-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    GlassInputComponent,
    BadgeComponent,
    AlertComponent,
    AvatarComponent,
    SwitchComponent,
    CheckboxComponent,
    RadioComponent,
    ThemeSwitcherComponent,
    ProgressBarComponent,
    RatingComponent
  ],
  templateUrl: './component-showcase.component.html',
  styleUrls: ['./component-showcase.component.scss']
})
export class ComponentShowcaseComponent {
  // Inputs
  inputText = signal('');
  inputPassword = signal('');
  inputSearch = signal('');
  inputNumber = signal(0);

  // Toggles
  switchValue = signal(false);
  checkboxValue = signal(false);
  radioValue = signal('option1');

  // Rating
  ratingValue = signal(3.5);

  // Button Variants - Aligned with GlassButtonComponent definition
  buttonVariants: ('primary' | 'secondary' | 'danger')[] = ['primary', 'secondary', 'danger'];
  
  // Button Sizes - Aligned with GlassButtonComponent definition
  buttonSizes: ('sm' | 'md' | 'lg')[] = ['sm', 'md', 'lg'];

  // Colors for Badges - Aligned with BadgeComponent definition
  badgeVariants: BadgeVariant[] = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'secondary'];

  // Progress Bar Config
  progressConfig1: Partial<ProgressBarConfig> = {
    showPercentage: true,
    color: 'primary'
  };

  progressConfig2: Partial<ProgressBarConfig> = {
    striped: true,
    animated: true,
    color: 'success'
  };

  // Rating Config
  ratingConfig: RatingConfig = {
    max: 5,
    readOnly: false,
    showText: true,
    showCancel: false, // Changed from true to false for cleaner demo
    cancelText: 'Clear',
    clearable: true,
    theme: 'stars',
    size: 'medium',
    color: '#fbbf24',
    emptyColor: '#d1d5db',
    textPosition: 'right',
    animation: true,
    animationDuration: 300
  };

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    // Could add toast notification here
  }
}
