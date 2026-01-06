/**
 * Material Dialog Component
 *
 * A Material Design dialog component wrapper using Angular Material.
 * Provides a dialog with header, content, and action buttons.
 *
 * @example
 * ```typescript
 * const dialogRef = this.dialog.open(MaterialDialogComponent, {
 *   data: {
 *     title: 'Confirm Action',
 *     message: 'Are you sure?',
 *     type: 'confirm',
 *     confirmText: 'Yes',
 *     cancelText: 'No'
 *   }
 * });
 * ```
 */

import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
  title?: string;
  message?: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  ariaLabel?: string;
}

@Component({
  selector: 'app-material-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container" role="dialog" [attr.aria-label]="data.ariaLabel || data.title || 'Dialog'" [attr.aria-modal]="'true'">
      <div class="dialog-header" *ngIf="data.title || data.icon">
        <div class="dialog-icon" [class]="getIconClass()" [attr.aria-hidden]="'true'">
          <mat-icon *ngIf="data.icon" [attr.aria-hidden]="'true'">{{ data.icon }}</mat-icon>
          <mat-icon *ngIf="!data.icon" [attr.aria-hidden]="'true'">{{ getDefaultIcon() }}</mat-icon>
        </div>
        <h2 class="dialog-title" *ngIf="data.title" [id]="titleId">{{ data.title }}</h2>
      </div>
      
      <div class="dialog-content" [attr.aria-describedby]="data.title ? titleId : null">
        <p *ngIf="data.message" [innerHTML]="data.message"></p>
        <ng-content></ng-content>
      </div>
      
      <div class="dialog-actions" role="toolbar" [attr.aria-label]="'Dialog actions'">
        <button 
          mat-button 
          *ngIf="data.showCancel !== false"
          (click)="onCancel()"
          class="cancel-button"
          [attr.aria-label]="data.cancelText || 'Cancel'">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="getButtonColor()"
          (click)="onConfirm()"
          class="confirm-button"
          [attr.aria-label]="data.confirmText || 'OK'">
          {{ data.confirmText || 'OK' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-width: 500px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    }

    .dialog-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .dialog-icon.info {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .dialog-icon.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .dialog-icon.error {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .dialog-icon.success {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .dialog-icon.confirm {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .dialog-title {
      color: #ffffff;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .dialog-content {
      padding: 1.5rem;
      color: #a0a0a0;
      line-height: 1.6;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid rgba(59, 130, 246, 0.1);
    }

    .cancel-button {
      color: #a0a0a0;
    }

    .confirm-button {
      min-width: 100px;
    }
  `]
})
export class MaterialDialogComponent {
  /**
   * Unique title ID for accessibility
   */
  titleId: string = `dialog-title-${Math.random().toString(36).substr(2, 9)}`;

  constructor(
    public dialogRef: MatDialogRef<MaterialDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  /**
   * Get icon class based on dialog type
   */
  getIconClass(): string {
    return this.data.type || 'info';
  }

  /**
   * Get default icon based on dialog type
   */
  getDefaultIcon(): string {
    const icons: Record<string, string> = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      success: 'check_circle',
      confirm: 'help'
    };
    return icons[this.data.type || 'info'] || 'info';
  }

  /**
   * Get button color based on dialog type
   */
  getButtonColor(): 'primary' | 'accent' | 'warn' {
    const colors: Record<string, 'primary' | 'accent' | 'warn'> = {
      info: 'primary',
      warning: 'warn',
      error: 'warn',
      success: 'primary',
      confirm: 'primary'
    };
    return colors[this.data.type || 'info'] || 'primary';
  }

  /**
   * Handle confirm button click
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}







