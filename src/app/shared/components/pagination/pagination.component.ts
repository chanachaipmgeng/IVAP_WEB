/**
 * Pagination Component
 *
 * A flexible pagination component for tables and lists.
 * Supports page navigation, page size selection, and custom styling.
 * Can use Material Design paginator or custom implementation.
 *
 * @example
 * ```html
 * <app-pagination
 *   [total]="totalItems"
 *   [pageIndex]="currentPage"
 *   [pageSize]="itemsPerPage"
 *   [pageSizeOptions]="[10, 25, 50, 100]"
 *   [showInfo]="true"
 *   (pageChange)="onPageChange($event)">
 * </app-pagination>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <nav [class]="getPaginationClasses()" [attr.aria-label]="ariaLabel || 'Pagination Navigation'">
      <mat-paginator
        *ngIf="useMaterial"
        [length]="total"
        [pageSize]="pageSize"
        [pageIndex]="pageIndex"
        [pageSizeOptions]="pageSizeOptions"
        [showFirstLastButtons]="showFirstLastButtons"
        [hidePageSize]="hidePageSize"
        (page)="onPageChange($event)"
        [class]="customClass"
        [attr.aria-label]="ariaLabel || 'Pagination Navigation'">
      </mat-paginator>

      <div *ngIf="!useMaterial" class="pagination-custom">
        <div class="pagination-info" *ngIf="showInfo" [attr.aria-live]="'polite'">
          <span>Showing {{ startItem }} to {{ endItem }} of {{ total }} entries</span>
        </div>

        <div class="pagination-controls" role="group" [attr.aria-label]="'Page navigation'">
          <button
            mat-icon-button
            [disabled]="pageIndex === 0"
            (click)="goToFirst()"
            [attr.aria-label]="'First page'"
            [attr.aria-disabled]="pageIndex === 0">
            <mat-icon aria-hidden="true">first_page</mat-icon>
          </button>

          <button
            mat-icon-button
            [disabled]="pageIndex === 0"
            (click)="goToPrevious()"
            [attr.aria-label]="'Previous page'"
            [attr.aria-disabled]="pageIndex === 0">
            <mat-icon aria-hidden="true">chevron_left</mat-icon>
          </button>

          <div class="pagination-pages" role="group" [attr.aria-label]="'Page numbers'">
            <button
              *ngFor="let page of visiblePages; trackBy: trackByPage"
              [class]="getPageButtonClasses(page)"
              (click)="goToPage(page)"
              [disabled]="page === '...'"
              [attr.aria-label]="page === '...' ? 'More pages' : 'Go to page ' + (typeof page === 'number' ? page + 1 : page)"
              [attr.aria-current]="page === pageIndex ? 'page' : null">
              {{ page }}
            </button>
          </div>

          <button
            mat-icon-button
            [disabled]="pageIndex >= totalPages - 1"
            (click)="goToNext()"
            [attr.aria-label]="'Next page'"
            [attr.aria-disabled]="pageIndex >= totalPages - 1">
            <mat-icon aria-hidden="true">chevron_right</mat-icon>
          </button>

          <button
            mat-icon-button
            [disabled]="pageIndex >= totalPages - 1"
            (click)="goToLast()"
            [attr.aria-label]="'Last page'"
            [attr.aria-disabled]="pageIndex >= totalPages - 1">
            <mat-icon aria-hidden="true">last_page</mat-icon>
          </button>
        </div>

        <div class="pagination-size" *ngIf="!hidePageSize">
          <label [for]="pageSizeSelectId">Items per page:</label>
          <select
            [id]="pageSizeSelectId"
            [(ngModel)]="pageSize"
            (change)="onPageSizeChange()"
            [attr.aria-label]="'Items per page'">
            <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
          </select>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }

    .pagination-custom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--spacing-md); /* 16px */
    }

    .pagination-info {
      color: var(--color-gray-500);
      font-size: var(--font-size-sm); /* 14px */
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs); /* 4px */
    }

    .pagination-pages {
      display: flex;
      gap: var(--spacing-xs); /* 4px */
    }

    .pagination-pages button {
      min-width: 2.5rem;
      height: 2.5rem;
      padding: var(--spacing-sm); /* 8px */
      border: 1px solid var(--color-gray-300);
      background: #ffffff;
      color: var(--color-gray-700);
      border-radius: var(--radius-md); /* 8px */
      cursor: pointer;
      transition: var(--transition-fast); /* 150ms */
    }

    .pagination-pages button:hover:not(:disabled) {
      background: var(--color-gray-100);
      border-color: var(--color-gray-400);
    }

    .pagination-pages button.active {
      background: var(--color-primary-500);
      color: #ffffff;
      border-color: var(--color-primary-500);
    }

    .pagination-pages button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-size {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm); /* 8px */
      font-size: var(--font-size-sm); /* 14px */
    }

    .pagination-size select {
      padding: calc(var(--spacing-xs) + var(--spacing-xs) / 2) calc(var(--spacing-sm) + var(--spacing-xs)); /* 6px 12px */
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md); /* 8px */
      background: #ffffff;
    }
  `]
})
export class PaginationComponent implements OnInit, OnChanges {
  /**
   * Total number of items
   * @default 0
   */
  @Input() total: number = 0;

  /**
   * Current page index (0-based)
   * @default 0
   */
  @Input() pageIndex: number = 0;

  /**
   * Number of items per page
   * @default 10
   */
  @Input() pageSize: number = 10;

  /**
   * Available page size options
   * @default [5, 10, 25, 50, 100]
   */
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];

  /**
   * Whether to show first/last page buttons
   * @default true
   */
  @Input() showFirstLastButtons: boolean = true;

  /**
   * Whether to hide page size selector
   * @default false
   */
  @Input() hidePageSize: boolean = false;

  /**
   * Whether to show pagination info (e.g., "Showing 1 to 10 of 100")
   * @default true
   */
  @Input() showInfo: boolean = true;

  /**
   * Whether to use Material Design paginator
   * @default true
   */
  @Input() useMaterial: boolean = true;

  /**
   * Maximum number of visible page buttons
   * @default 5
   */
  @Input() maxVisiblePages: number = 5;

  /**
   * Additional CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for accessibility
   */
  @Input() ariaLabel?: string;

  /**
   * Emitted when page changes
   */
  @Output() pageChange = new EventEmitter<PageEvent>();

  totalPages: number = 0;
  visiblePages: (number | string)[] = [];

  /**
   * Unique ID for page size select (auto-generated)
   */
  pageSizeSelectId: string = `pagination-size-${Math.random().toString(36).substr(2, 9)}`;

  ngOnInit(): void {
    this.calculatePages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['total'] || changes['pageSize'] || changes['pageIndex']) {
      this.calculatePages();
    }
  }

  /**
   * TrackBy function for page buttons
   */
  trackByPage(index: number, page: number | string): number | string {
    return typeof page === 'number' ? page : `ellipsis-${index}`;
  }

  calculatePages(): void {
    this.totalPages = Math.ceil(this.total / this.pageSize);
    this.updateVisiblePages();
  }

  updateVisiblePages(): void {
    const pages: (number | string)[] = [];
    const current = this.pageIndex;
    const total = this.totalPages;
    const maxVisible = this.maxVisiblePages;

    if (total <= maxVisible) {
      // Show all pages
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (current < maxVisible - 2) {
        // Near the start
        for (let i = 0; i < maxVisible - 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total - 1);
      } else if (current > total - maxVisible + 1) {
        // Near the end
        pages.push(0);
        pages.push('...');
        for (let i = total - maxVisible + 1; i < total; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(0);
        pages.push('...');
        const start = current - Math.floor((maxVisible - 3) / 2);
        const end = start + maxVisible - 3;
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total - 1);
      }
    }

    this.visiblePages = pages;
  }

  get startItem(): number {
    return this.pageIndex * this.pageSize + 1;
  }

  get endItem(): number {
    const end = (this.pageIndex + 1) * this.pageSize;
    return Math.min(end, this.total);
  }

  getPaginationClasses(): string {
    const classes = ['pagination'];
    if (this.customClass) {
      classes.push(this.customClass);
    }
    return classes.join(' ');
  }

  getPageButtonClasses(page: number | string): string {
    const classes = ['pagination-page'];
    if (page === this.pageIndex) {
      classes.push('active');
    }
    return classes.join(' ');
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.calculatePages();
    this.pageChange.emit(event);
  }

  onPageSizeChange(): void {
    this.pageIndex = 0;
    this.calculatePages();
    this.pageChange.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.total
    });
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.pageIndex = page;
      this.calculatePages();
      this.pageChange.emit({
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        length: this.total
      });
    }
  }

  goToFirst(): void {
    this.goToPage(0);
  }

  goToPrevious(): void {
    if (this.pageIndex > 0) {
      this.goToPage(this.pageIndex - 1);
    }
  }

  goToNext(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.goToPage(this.pageIndex + 1);
    }
  }

  goToLast(): void {
    this.goToPage(this.totalPages - 1);
  }
}
