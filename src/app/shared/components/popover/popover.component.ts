/**
 * Popover Component
 *
 * A popover component for displaying additional information.
 * Supports positioning, triggers, and custom content with accessibility features.
 *
 * @example
 * ```html
 * <app-popover
 *   [title]="'Information'"
 *   [content]="'Additional details'"
 *   [position]="'bottom'"
 *   [trigger]="'click'"
 *   (opened)="onPopoverOpen()"
 *   (closed)="onPopoverClose()">
 *   <button popover-trigger>Click me</button>
 * </app-popover>
 * ```
 */

import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener, AfterContentInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Popover position type
 */
export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * Popover trigger type
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="popover-wrapper" #popoverWrapper>
      <div
        class="popover-trigger"
        (click)="onTriggerClick()"
        (mouseenter)="onTriggerHover()"
        (mouseleave)="onTriggerLeave()"
        (focus)="onTriggerFocus()"
        (blur)="onTriggerBlur()"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="'true'"
        [attr.aria-controls]="popoverId"
        [attr.aria-label]="ariaLabel || title || 'Popover trigger'">
        <ng-content select="[popover-trigger]"></ng-content>
      </div>

      <div
        *ngIf="isOpen"
        [id]="popoverId"
        [class]="getPopoverClasses()"
        [style.--popover-top.px]="positionTop"
        [style.--popover-left.px]="positionLeft"
        [attr.role]="role"
        [attr.aria-hidden]="!isOpen"
        [attr.aria-labelledby]="title ? popoverTitleId : null"
        [attr.aria-describedby]="content ? popoverContentId : null">
        <div class="popover-header" *ngIf="title || showCloseButton">
          <h4 *ngIf="title" [id]="popoverTitleId" class="popover-title">{{ title }}</h4>
          <button
            *ngIf="showCloseButton"
            type="button"
            class="popover-close"
            (click)="close()"
            [attr.aria-label]="closeAriaLabel || 'Close popover'">
            <mat-icon [attr.aria-hidden]="true">close</mat-icon>
          </button>
        </div>
        <div [id]="popoverContentId" class="popover-content">
          <ng-content></ng-content>
          <p *ngIf="content && !hasContent">{{ content }}</p>
        </div>
        <div class="popover-arrow" [class]="getArrowClasses()" [attr.aria-hidden]="true"></div>
      </div>
    </div>
  `,
  styles: [`
    .popover-wrapper {
      position: relative;
      display: inline-block;
    }

    .popover-trigger {
      display: inline-block;
      cursor: pointer;
    }

    .popover {
      position: absolute;
      top: var(--popover-top, 0);
      left: var(--popover-left, 0);
      z-index: 1000;
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg); /* 12px */
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      min-width: 200px;
      max-width: 400px;
      animation: popoverFadeIn 0.2s ease-out;
    }

    @keyframes popoverFadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .popover-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: calc(var(--spacing-sm) + var(--spacing-xs)) var(--spacing-md); /* 12px 16px */
      border-bottom: 1px solid var(--color-gray-200);
    }

    .popover-title {
      margin: 0;
      font-size: var(--font-size-base); /* 16px */
      font-weight: var(--font-weight-semibold); /* 600 */
      color: var(--color-gray-900);
    }

    .popover-close {
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      color: var(--color-gray-500);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popover-close:hover {
      color: #111827;
    }

    .popover-close mat-icon {
      font-size: var(--font-size-lg); /* 18px */
      width: 1.125rem;
      height: 1.125rem;
    }

    .popover-content {
      padding: var(--spacing-md); /* 16px */
      color: var(--color-gray-700);
      font-size: var(--font-size-sm); /* 14px */
      line-height: 1.5;
    }

    .popover-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    }

    /* Arrow positions */
    .popover-top .popover-arrow {
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 8px 8px 0 8px;
      border-color: #ffffff transparent transparent transparent;
    }

    .popover-bottom .popover-arrow {
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 8px 8px 8px;
      border-color: transparent transparent #ffffff transparent;
    }

    .popover-left .popover-arrow {
      right: -8px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 8px 0 8px 8px;
      border-color: transparent transparent transparent #ffffff;
    }

    .popover-right .popover-arrow {
      left: -8px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 8px 8px 8px 0;
      border-color: transparent #ffffff transparent transparent;
    }
  `]
})
export class PopoverComponent implements AfterContentInit, AfterViewInit {
  /**
   * Popover title
   */
  @Input() title: string = '';

  /**
   * Popover content text
   */
  @Input() content: string = '';

  /**
   * Popover position
   */
  @Input() position: PopoverPosition = 'bottom';

  /**
   * Popover trigger type
   */
  @Input() trigger: PopoverTrigger = 'click';

  /**
   * Popover open state
   */
  @Input() isOpen: boolean = false;

  /**
   * Show close button
   */
  @Input() showCloseButton: boolean = true;

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * ARIA role
   */
  @Input() role: string = 'tooltip';

  /**
   * ARIA label for the trigger
   */
  @Input() ariaLabel?: string;

  /**
   * ARIA label for close button
   */
  @Input() closeAriaLabel?: string;

  /**
   * Popover opened event
   */
  @Output() opened = new EventEmitter<void>();

  /**
   * Popover closed event
   */
  @Output() closed = new EventEmitter<void>();

  /**
   * Popover wrapper element reference
   */
  @ViewChild('popoverWrapper') popoverWrapper!: ElementRef;

  /**
   * Position top value
   */
  positionTop: number = 0;

  /**
   * Position left value
   */
  positionLeft: number = 0;

  /**
   * Has content flag
   */
  hasContent: boolean = false;

  /**
   * Unique popover ID
   */
  popoverId: string = `popover-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique popover title ID
   */
  popoverTitleId: string = `${this.popoverId}-title`;

  /**
   * Unique popover content ID
   */
  popoverContentId: string = `${this.popoverId}-content`;

  /**
   * Initialize after content init
   */
  ngAfterContentInit(): void {
    this.hasContent = true;
  }

  /**
   * Initialize after view init
   */
  ngAfterViewInit(): void {
    if (this.isOpen) {
      this.updatePosition();
    }
  }

  /**
   * Get popover CSS classes
   */
  getPopoverClasses(): string {
    const classes: string[] = ['popover'];
    classes.push(`popover-${this.position}`);
    if (this.customClass) {
      classes.push(this.customClass);
    }
    return classes.join(' ');
  }

  /**
   * Get arrow CSS classes
   */
  getArrowClasses(): string {
    return `popover-arrow popover-arrow-${this.position}`;
  }

  /**
   * Update popover position
   */
  updatePosition(): void {
    if (!this.popoverWrapper) return;

    const trigger = this.popoverWrapper.nativeElement.querySelector('.popover-trigger');
    const popover = this.popoverWrapper.nativeElement.querySelector('.popover');

    if (!trigger || !popover) return;

    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();

    switch (this.position) {
      case 'top':
        this.positionTop = -popoverRect.height - 8;
        this.positionLeft = (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'bottom':
        this.positionTop = triggerRect.height + 8;
        this.positionLeft = (triggerRect.width - popoverRect.width) / 2;
        break;
      case 'left':
        this.positionTop = (triggerRect.height - popoverRect.height) / 2;
        this.positionLeft = -popoverRect.width - 8;
        break;
      case 'right':
        this.positionTop = (triggerRect.height - popoverRect.height) / 2;
        this.positionLeft = triggerRect.width + 8;
        break;
    }
  }

  /**
   * Handle trigger click
   */
  onTriggerClick(): void {
    if (this.trigger === 'click' || this.trigger === 'manual') {
      this.toggle();
    }
  }

  /**
   * Handle trigger hover
   */
  onTriggerHover(): void {
    if (this.trigger === 'hover') {
      this.open();
    }
  }

  /**
   * Handle trigger leave
   */
  onTriggerLeave(): void {
    if (this.trigger === 'hover') {
      this.close();
    }
  }

  /**
   * Handle trigger focus
   */
  onTriggerFocus(): void {
    if (this.trigger === 'focus') {
      this.open();
    }
  }

  /**
   * Handle trigger blur
   */
  onTriggerBlur(): void {
    if (this.trigger === 'focus') {
      this.close();
    }
  }

  /**
   * Open popover
   */
  open(): void {
    if (!this.isOpen) {
      this.isOpen = true;
      setTimeout(() => this.updatePosition(), 0);
      this.opened.emit();
    }
  }

  /**
   * Close popover
   */
  close(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.closed.emit();
    }
  }

  /**
   * Toggle popover
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handle document click
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.trigger === 'click' && this.isOpen) {
      const target = event.target as HTMLElement;
      if (!this.popoverWrapper.nativeElement.contains(target)) {
        this.close();
      }
    }
  }
}
