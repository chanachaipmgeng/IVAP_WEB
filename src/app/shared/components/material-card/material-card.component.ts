/**
 * Material Card Component
 *
 * A Material Design card component wrapper using Angular Material.
 * Provides a card layout with header, content, actions, and footer sections.
 *
 * @example
 * ```html
 * <app-material-card
 *   [title]="'Card Title'"
 *   [subtitle]="'Card Subtitle'"
 *   [customClass]="'my-card'"
 *   [ariaLabel]="'Card description'">
 *   <p>Card content</p>
 * </app-material-card>
 * ```
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-material-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card 
      [class]="customClass"
      [class.gemini-card-hover]="hover"
      [class.gemini-shimmer]="shimmer"
      [attr.role]="role || 'article'"
      [attr.aria-label]="ariaLabel || title || 'Card'">
      <mat-card-header *ngIf="title || subtitle || avatar">
        <div mat-card-avatar *ngIf="avatar" [class]="avatarClass" [attr.aria-hidden]="'true'">
          <mat-icon *ngIf="avatarIcon" [attr.aria-hidden]="'true'">{{ avatarIcon }}</mat-icon>
          <img *ngIf="avatarImage" [src]="avatarImage" [alt]="title || 'Avatar'" [attr.aria-hidden]="'true'">
        </div>
        <mat-card-title *ngIf="title" [class]="titleClass">{{ title }}</mat-card-title>
        <mat-card-subtitle *ngIf="subtitle" [class]="subtitleClass">{{ subtitle }}</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content [class]="contentClass">
        <ng-content></ng-content>
      </mat-card-content>
      
      <mat-card-actions *ngIf="hasActions" [align]="actionsAlign" [class]="actionsClass" role="toolbar" [attr.aria-label]="'Card actions'">
        <ng-content select="[slot=actions]"></ng-content>
      </mat-card-actions>
      
      <mat-card-footer *ngIf="hasFooter" [class]="footerClass">
        <ng-content select="[slot=footer]"></ng-content>
      </mat-card-footer>
    </mat-card>
  `,
  styles: [`
    mat-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 16px !important;
    }
    
    .gemini-card-hover:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px #3b82f6, 0 0 30px rgba(59, 130, 246, 0.3);
    }
    
    .gemini-shimmer {
      position: relative;
      overflow: hidden;
    }
    
    .gemini-shimmer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      animation: ai-signal-flow 3s ease-in-out infinite;
    }
  `]
})
export class MaterialCardComponent {
  /**
   * Card title
   */
  @Input() title: string = '';

  /**
   * Card subtitle
   */
  @Input() subtitle: string = '';

  /**
   * Show avatar
   */
  @Input() avatar: string = '';

  /**
   * Avatar icon name
   */
  @Input() avatarIcon: string = '';

  /**
   * Avatar image URL
   */
  @Input() avatarImage: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * Title CSS classes
   */
  @Input() titleClass: string = '';

  /**
   * Subtitle CSS classes
   */
  @Input() subtitleClass: string = '';

  /**
   * Content CSS classes
   */
  @Input() contentClass: string = '';

  /**
   * Actions CSS classes
   */
  @Input() actionsClass: string = '';

  /**
   * Footer CSS classes
   */
  @Input() footerClass: string = '';

  /**
   * Avatar CSS classes
   */
  @Input() avatarClass: string = '';

  /**
   * Actions alignment
   */
  @Input() actionsAlign: 'start' | 'end' = 'start';

  /**
   * Enable hover effect
   */
  @Input() hover: boolean = true;

  /**
   * Enable shimmer effect
   */
  @Input() shimmer: boolean = false;

  /**
   * ARIA role
   */
  @Input() role?: string;

  /**
   * ARIA label for the card
   */
  @Input() ariaLabel?: string;

  /**
   * Check if actions section should be shown
   */
  get hasActions(): boolean {
    return this.actionsAlign !== null;
  }

  /**
   * Check if footer section should be shown
   */
  get hasFooter(): boolean {
    return this.footerClass !== '';
  }
}







