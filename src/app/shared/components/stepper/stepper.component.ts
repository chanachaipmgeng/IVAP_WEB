/**
 * Stepper Component
 *
 * A multi-step form stepper component with support for horizontal and vertical layouts.
 * Provides step navigation, completion tracking, and optional step validation.
 *
 * @example
 * ```html
 * <app-stepper
 *   [steps]="stepperSteps"
 *   [selectedIndex]="currentStep"
 *   [linear]="true"
 *   (selectionChange)="onStepChange($event)">
 *   <div step="0">Step 1 Content</div>
 * </app-stepper>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

/**
 * Stepper step interface
 */
export interface StepperStep {
  label: string;
  icon?: string;
  optional?: boolean;
  completed?: boolean;
  editable?: boolean;
  disabled?: boolean;
}

/**
 * Stepper selection event interface
 */
export interface StepperSelectionEvent {
  selectedIndex: number;
  previouslySelectedIndex: number;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule, MatStepperModule, MatIconModule],
  template: `
    <mat-stepper
      [linear]="linear"
      [orientation]="orientation"
      [selectedIndex]="selectedIndex"
      (selectionChange)="onSelectionChange($event)"
      [class]="customClass"
      [attr.aria-label]="ariaLabel || 'Stepper'">
      <mat-step
        *ngFor="let step of steps; let i = index; trackBy: trackByStep"
        [label]="step.label"
        [optional]="step.optional"
        [completed]="step.completed"
        [editable]="step.editable"
        [state]="getStepState(step, i)"
        [attr.aria-label]="step.label">
        <ng-template matStepLabel>
          <div class="step-label">
            <mat-icon *ngIf="step.icon" class="step-icon" [attr.aria-hidden]="true">{{ step.icon }}</mat-icon>
            <span>{{ step.label }}</span>
          </div>
        </ng-template>
        <ng-content [select]="'[step=' + i + ']'"></ng-content>
      </mat-step>
    </mat-stepper>
  `,
  styles: [`
    :host {
      display: block;
    }

    .step-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm); /* 8px */
    }

    .step-icon {
      font-size: var(--font-size-lg); /* 18px */
      width: var(--font-size-lg); /* 18px */
      height: var(--font-size-lg); /* 18px */
    }
  `]
})
export class StepperComponent {
  /**
   * Stepper steps configuration
   */
  @Input() steps: StepperStep[] = [];

  /**
   * Currently selected step index
   */
  @Input() selectedIndex: number = 0;

  /**
   * Linear mode (steps must be completed in order)
   */
  @Input() linear: boolean = false;

  /**
   * Stepper orientation
   */
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for the stepper
   */
  @Input() ariaLabel?: string;

  /**
   * Selection change event
   */
  @Output() selectionChange = new EventEmitter<number>();

  /**
   * Step change event
   */
  @Output() stepChange = new EventEmitter<{ index: number; step: StepperStep }>();

  /**
   * Handle selection change
   */
  onSelectionChange(event: StepperSelectionEvent): void {
    this.selectedIndex = event.selectedIndex;
    this.selectionChange.emit(this.selectedIndex);
    if (this.steps[this.selectedIndex]) {
      this.stepChange.emit({
        index: this.selectedIndex,
        step: this.steps[this.selectedIndex]
      });
    }
  }

  /**
   * Get step state
   */
  getStepState(step: StepperStep, index: number): string {
    if (step.completed) {
      return 'done';
    }
    if (index === this.selectedIndex) {
      return 'edit';
    }
    return 'number';
  }

  /**
   * Navigate to next step
   */
  next(): void {
    if (this.selectedIndex < this.steps.length - 1) {
      this.selectedIndex++;
      this.selectionChange.emit(this.selectedIndex);
    }
  }

  /**
   * Navigate to previous step
   */
  previous(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
      this.selectionChange.emit(this.selectedIndex);
    }
  }

  /**
   * Navigate to specific step
   */
  goToStep(index: number): void {
    if (index >= 0 && index < this.steps.length) {
      this.selectedIndex = index;
      this.selectionChange.emit(this.selectedIndex);
    }
  }

  /**
   * TrackBy function for steps
   */
  trackByStep(index: number, step: StepperStep): string {
    return step.label || index.toString();
  }
}
