/**
 * Avatar Component
 *
 * A flexible avatar component for displaying user profile pictures, initials, or icons.
 * Supports multiple sizes, shapes, and status indicators.
 *
 * @example
 * ```html
 * <app-avatar
 *   [imageUrl]="user.avatar"
 *   [name]="user.name"
 *   size="lg"
 *   status="online">
 * </app-avatar>
 * ```
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Avatar size type
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Avatar shape type
 */
export type AvatarShape = 'circle' | 'square' | 'rounded';

/**
 * Avatar status type
 */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | '';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      [class]="getAvatarClasses()"
      [style.width.px]="customSize"
      [style.height.px]="customSize"
      [style.background-color]="backgroundColor"
      [style.background-image]="imageUrl ? 'url(' + imageUrl + ')' : null"
      role="img"
      [attr.aria-label]="ariaLabel || alt || name || 'Avatar'"
      [attr.aria-hidden]="ariaHidden">
      <img
        *ngIf="imageUrl && !showInitials"
        [src]="imageUrl"
        [alt]="alt || name || 'Avatar'"
        [class]="imageClass"
        [attr.aria-hidden]="true"
        (error)="onImageError()">
      <span *ngIf="showInitials && !imageUrl" [class]="initialsClass" [attr.aria-hidden]="true">{{ initials }}</span>
      <mat-icon *ngIf="icon && !imageUrl && !showInitials" [class]="iconClass" [attr.aria-hidden]="true">{{ icon }}</mat-icon>
      <span
        *ngIf="status"
        [class]="getStatusClasses()"
        [attr.aria-label]="status + ' status'"
        [attr.aria-hidden]="false">
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
    }

    div {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      flex-shrink: 0;
    }

    /* Sizes - Using Design Tokens */
    .avatar-xs {
      width: 1.5rem;
      height: 1.5rem;
      font-size: var(--font-size-xs); /* 12px */
    }

    .avatar-sm {
      width: 2rem;
      height: 2rem;
      font-size: var(--font-size-xs); /* 12px */
    }

    .avatar-md {
      width: 2.5rem;
      height: 2.5rem;
      font-size: var(--font-size-sm); /* 14px */
    }

    .avatar-lg {
      width: 3rem;
      height: 3rem;
      font-size: var(--font-size-base); /* 16px */
    }

    .avatar-xl {
      width: 4rem;
      height: 4rem;
      font-size: var(--font-size-lg); /* 18px */
    }

    .avatar-2xl {
      width: 6rem;
      height: 6rem;
      font-size: 1.5rem;
    }

    /* Shapes - Using Design Tokens */
    .avatar-circle {
      border-radius: 50%;
    }

    .avatar-square {
      border-radius: 0;
    }

    .avatar-rounded {
      border-radius: var(--radius-lg); /* 12px */
    }

    /* Image */
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Initials - Using Design Tokens */
    span {
      font-weight: var(--font-weight-semibold); /* 600 */
      color: inherit;
      text-transform: uppercase;
      user-select: none;
    }

    /* Icon */
    mat-icon {
      font-size: inherit;
      width: 1em;
      height: 1em;
    }

    /* Status indicator */
    .avatar-status {
      position: absolute;
      bottom: 0;
      right: 0;
      border: 2px solid #ffffff;
      border-radius: 50%;
    }

    .avatar-status-xs {
      width: 0.5rem;
      height: 0.5rem;
    }

    .avatar-status-sm {
      width: 0.625rem;
      height: 0.625rem;
    }

    .avatar-status-md {
      width: 0.75rem;
      height: 0.75rem;
    }

    .avatar-status-lg {
      width: 0.875rem;
      height: 0.875rem;
    }

    .avatar-status-online {
      background-color: var(--color-success-500);
    }

    .avatar-status-offline {
      background-color: var(--color-gray-500);
    }

    .avatar-status-away {
      background-color: var(--color-warning-500);
    }

    .avatar-status-busy {
      background-color: var(--color-error-500);
    }

    /* Group avatars */
    .avatar-group {
      display: inline-flex;
      flex-direction: row-reverse;
    }

    .avatar-group-item {
      margin-left: calc(-1 * var(--spacing-sm)); /* -8px */
      border: 2px solid #ffffff;
    }

    .avatar-group-item:first-child {
      margin-left: 0;
    }
  `]
})
export class AvatarComponent implements OnInit {
  /**
   * Image URL for avatar
   */
  @Input() imageUrl: string = '';

  /**
   * User name for generating initials
   */
  @Input() name: string = '';

  /**
   * Alt text for image
   */
  @Input() alt: string = '';

  /**
   * Avatar size
   */
  @Input() size: AvatarSize = 'md';

  /**
   * Avatar shape
   */
  @Input() shape: AvatarShape = 'circle';

  /**
   * Status indicator
   */
  @Input() status: AvatarStatus = '';

  /**
   * Status indicator size
   */
  @Input() statusSize: 'xs' | 'sm' | 'md' | 'lg' = 'sm';

  /**
   * Icon name (Material icon)
   */
  @Input() icon: string = '';

  /**
   * Background color
   */
  @Input() backgroundColor: string = '#6b7280';

  /**
   * Text color
   */
  @Input() textColor: string = '#ffffff';

  /**
   * Custom size in pixels
   */
  @Input() customSize: number = 0;

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Image CSS classes
   */
  @Input() imageClass: string = '';

  /**
   * Initials CSS classes
   */
  @Input() initialsClass: string = '';

  /**
   * Icon CSS classes
   */
  @Input() iconClass: string = '';

  /**
   * ARIA label for the avatar
   */
  @Input() ariaLabel: string = '';

  /**
   * ARIA hidden state
   */
  @Input() ariaHidden: boolean = false;

  /**
   * Show initials flag
   */
  showInitials: boolean = false;

  /**
   * Initials string
   */
  initials: string = '';

  /**
   * Initialize component
   */
  ngOnInit(): void {
    if (this.name && !this.imageUrl) {
      this.showInitials = true;
      this.initials = this.getInitials(this.name);
    }
  }

  /**
   * Get initials from name
   */
  getInitials(name: string): string {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Get avatar CSS classes
   */
  getAvatarClasses(): string {
    const classes = ['avatar'];

    if (this.customSize) {
      classes.push('avatar-custom');
    } else {
      classes.push(`avatar-${this.size}`);
    }

    classes.push(`avatar-${this.shape}`);

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.join(' ');
  }

  /**
   * Get status indicator CSS classes
   */
  getStatusClasses(): string {
    const classes = ['avatar-status'];

    if (this.status) {
      classes.push(`avatar-status-${this.status}`);
    }

    classes.push(`avatar-status-${this.statusSize}`);

    return classes.join(' ');
  }

  /**
   * Handle image load error
   */
  onImageError(): void {
    // Fallback to initials if image fails to load
    if (this.name) {
      this.showInitials = true;
      this.imageUrl = '';
    }
  }
}
