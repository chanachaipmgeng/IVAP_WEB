/**
 * Data Table Component
 *
 * A comprehensive data table component with sorting, filtering, pagination, selection, and export functionality.
 * Supports virtual scrolling for large datasets and custom cell templates.
 *
 * @example
 * ```html
 * <app-data-table
 *   [columns]="tableColumns"
 *   [data]="tableData"
 *   [loading]="isLoading"
 *   [selectable]="true"
 *   [showExport]="true"
 *   (rowClicked)="onRowClick($event)"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-data-table>
 * ```
 */

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked, HostListener, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GlassButtonComponent } from '../glass-button/glass-button.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'custom';
  render?: (value: any, row: any) => string;
  template?: TemplateRef<any>; // Custom template for cell rendering
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: Array<{value: any, label: string}>;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  icon: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: (row: any) => void;
  visible?: (row: any) => boolean;
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule],
  template: `
    <div class="glass-card overflow-hidden" [ngClass]="customClass" [attr.aria-label]="ariaLabel || 'Data table'">
      <!-- Loading State -->
      <div *ngIf="loading" class="p-12 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading">
        <!-- Search and Actions -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <input
            *ngIf="searchable"
            type="text"
            placeholder="Search..."
            class="glass-input w-64"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
          />
          <div class="flex space-x-2">
            <!-- Export Button -->
            <div *ngIf="showExport" class="relative export-menu-container">
              <button
                type="button"
                class="glass-button px-3 py-1.5 text-sm flex items-center space-x-1"
                (click)="showExportMenu = !showExportMenu"
                [attr.aria-label]="'Export data'"
                [attr.aria-expanded]="showExportMenu"
                [attr.aria-haspopup]="true"
              >
                <span aria-hidden="true">📥</span>
                <span>Export</span>
                <span *ngIf="showExportMenu" aria-hidden="true">▼</span>
                <span *ngIf="!showExportMenu" aria-hidden="true">▶</span>
              </button>
              <!-- Export Menu -->
              <div
                *ngIf="showExportMenu"
                class="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10"
              >
                <button
                  *ngIf="exportFormats.includes('csv')"
                  (click)="exportToCSV()"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                  role="menuitem"
                  [attr.aria-label]="'Export as CSV'"
                >
                  <span aria-hidden="true">📄</span> Export as CSV
                </button>
                <button
                  *ngIf="exportFormats.includes('excel')"
                  (click)="exportToExcel()"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="menuitem"
                  [attr.aria-label]="'Export as Excel'"
                >
                  <span aria-hidden="true">📊</span> Export as Excel
                </button>
                <button
                  *ngIf="exportFormats.includes('json')"
                  (click)="exportToJSON()"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                  role="menuitem"
                  [attr.aria-label]="'Export as JSON'"
                >
                  <span aria-hidden="true">📋</span> Export as JSON
                </button>
              </div>
            </div>
            <ng-content select="[actions]"></ng-content>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr role="row">
                <th *ngIf="selectable" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12" role="columnheader" scope="col">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    [attr.indeterminate]="isIndeterminate() ? true : null"
                    (change)="onSelectAllChange($event)"
                    class="cursor-pointer"
                    [attr.aria-label]="'Select all rows'"
                    [attr.aria-checked]="isAllSelected() ? 'true' : (isIndeterminate() ? 'mixed' : 'false')"
                    #selectAllCheckbox
                  />
                </th>
                <th
                  *ngFor="let column of columns; trackBy: trackByColumn"
                  [style.width]="column.width"
                  [class.text-left]="column.align === 'left' || !column.align"
                  [class.text-center]="column.align === 'center'"
                  [class.text-right]="column.align === 'right'"
                  class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  [class.cursor-pointer]="column.sortable"
                  [class.hover:bg-gray-100/50]="column.sortable"
                  [class.dark:hover:bg-gray-700/50]="column.sortable"
                  (click)="onHeaderClick($event, column)"
                  role="columnheader"
                  scope="col"
                  [attr.aria-label]="column.label + (column.sortable ? ' - Click to sort' : '')"
                  [attr.aria-sort]="getAriaSort(column.key)"
                  [attr.tabindex]="column.sortable ? 0 : null"
                  (keydown.enter)="column.sortable && onSort(column.key)"
                  (keydown.space)="column.sortable && onSort(column.key); $event.preventDefault()"
                >
                  <div class="flex flex-col space-y-1">
                    <div class="flex items-center space-x-1">
                      <span>{{ column.label }}</span>
                      <span *ngIf="column.sortable">
                        <span *ngIf="getSortDirection(column.key) === 'asc'">↑</span>
                        <span *ngIf="getSortDirection(column.key) === 'desc'">↓</span>
                        <span *ngIf="!getSortDirection(column.key) && enableMultiSort">⇅</span>
                      </span>
                    </div>
                    <!-- Column Filter -->
                    <div *ngIf="enableColumnFilters && column.filterable" class="mt-1">
                      <input
                        *ngIf="column.filterType === 'text' || !column.filterType"
                        type="text"
                        [value]="columnFilters[column.key] || ''"
                        (keyup.enter)="onColumnFilter(column.key, $any($event.target).value)"
                        (blur)="onColumnFilter(column.key, $any($event.target).value)"
                        [placeholder]="'Filter ' + column.label"
                        class="glass-input text-xs w-full py-1 px-2"
                      />
                      <select
                        *ngIf="column.filterType === 'select' && column.filterOptions"
                        [value]="columnFilters[column.key] || ''"
                        (change)="onColumnFilter(column.key, $any($event.target).value)"
                        class="glass-input text-xs w-full py-1 px-2"
                      >
                        <option value="">All</option>
                        <option *ngFor="let option of column.filterOptions" [value]="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </th>
                <th *ngIf="actions.length > 0" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <!-- Virtual Scrolling Table Body -->
            <tbody *ngIf="enableVirtualScrolling" class="divide-y divide-gray-200 dark:divide-gray-700">
              <cdk-virtual-scroll-viewport
                [itemSize]="virtualScrollItemSize"
                [minBufferPx]="virtualScrollBufferSize * virtualScrollItemSize"
                [maxBufferPx]="virtualScrollBufferSize * virtualScrollItemSize * 2"
                class="virtual-scroll-viewport"
              >
                <tr
                  *cdkVirtualFor="let row of paginatedData; trackBy: trackByRowId"
                  [class.bg-blue-50/50]="isRowSelected(row)"
                  class="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                  role="row"
                  [attr.aria-selected]="selectable ? isRowSelected(row) : null"
                  [attr.aria-label]="'Row ' + (trackByRowId(0, row) || '')"
                  [attr.tabindex]="selectable ? 0 : null"
                  (click)="rowClicked.emit(row)"
                  (keydown.enter)="rowClicked.emit(row)"
                >
                  <td *ngIf="selectable" class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      [checked]="isRowSelected(row)"
                      (change)="onRowSelectChange(row, $event)"
                      class="cursor-pointer"
                    />
                  </td>
                  <td
                    *ngFor="let column of columns; trackBy: trackByColumn"
                    [class.text-left]="column.align === 'left' || !column.align"
                    [class.text-center]="column.align === 'center'"
                    [class.text-right]="column.align === 'right'"
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    role="gridcell"
                    [attr.aria-label]="column.label + ': ' + getCellValue(row, column)"
                  >
                    <!-- Custom Template -->
                    <ng-container *ngIf="column.template; else defaultCell">
                      <ng-container *ngTemplateOutlet="column.template; context: { $implicit: row, column: column, value: getNestedValue(row, column.key) }"></ng-container>
                    </ng-container>
                    <!-- Default Cell -->
                    <ng-template #defaultCell>
                      <span [innerHTML]="getCellValue(row, column)"></span>
                    </ng-template>
                  </td>
                  <td *ngIf="actions.length > 0" class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2" role="gridcell">
                    <ng-container *ngFor="let action of actions; trackBy: trackByAction">
                      <button
                        *ngIf="!action.visible || action.visible(row)"
                        [title]="action.label"
                        (click)="action.onClick(row)"
                        class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        [attr.aria-label]="action.label"
                      >
                        <span aria-hidden="true">{{ action.icon }}</span>
                      </button>
                    </ng-container>
                  </td>
                </tr>
                <!-- Empty State for Virtual Scrolling -->
                <tr *ngIf="paginatedData.length === 0 && !loading" role="row">
                  <td [attr.colspan]="(selectable ? 1 : 0) + columns.length + (actions.length > 0 ? 1 : 0)" class="px-6 py-12 text-center" role="gridcell">
                    <div class="flex flex-col items-center justify-center" role="status" [attr.aria-live]="'polite'">
                      <span class="text-4xl mb-2" aria-hidden="true">{{ emptyIcon }}</span>
                      <p class="text-gray-500 dark:text-gray-400">{{ emptyText }}</p>
                    </div>
                  </td>
                </tr>
              </cdk-virtual-scroll-viewport>
            </tbody>
            <!-- Regular Table Body (Non-Virtual Scrolling) -->
            <tbody *ngIf="!enableVirtualScrolling" class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                *ngFor="let row of paginatedData; trackBy: trackByRowId"
                [class.bg-blue-50/50]="isRowSelected(row)"
                class="hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                role="row"
                [attr.aria-selected]="selectable ? isRowSelected(row) : null"
                [attr.aria-label]="'Row ' + (trackByRowId(0, row) || '')"
                [attr.tabindex]="selectable ? 0 : null"
                (click)="rowClicked.emit(row)"
                (keydown.enter)="rowClicked.emit(row)"
              >
                <td *ngIf="selectable" class="px-6 py-4 whitespace-nowrap" role="gridcell">
                  <input
                    type="checkbox"
                    [checked]="isRowSelected(row)"
                    (change)="onRowSelectChange(row, $event)"
                    class="cursor-pointer"
                    [attr.aria-label]="'Select row ' + (trackByRowId(0, row) || '')"
                    [attr.aria-checked]="isRowSelected(row)"
                  />
                </td>
                <td
                  *ngFor="let column of columns; trackBy: trackByColumn"
                  [class.text-left]="column.align === 'left' || !column.align"
                  [class.text-center]="column.align === 'center'"
                  [class.text-right]="column.align === 'right'"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  role="gridcell"
                  [attr.aria-label]="column.label + ': ' + getCellValue(row, column)"
                >
                  <!-- Custom Template -->
                  <ng-container *ngIf="column.template; else defaultCell">
                    <ng-container *ngTemplateOutlet="column.template; context: { $implicit: row, column: column, value: getNestedValue(row, column.key) }"></ng-container>
                  </ng-container>
                  <!-- Default Cell -->
                  <ng-template #defaultCell>
                    <span [innerHTML]="getCellValue(row, column)"></span>
                  </ng-template>
                </td>
                <td *ngIf="actions.length > 0" class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2" role="gridcell">
                  <ng-container *ngFor="let action of actions; trackBy: trackByAction">
                    <button
                      *ngIf="!action.visible || action.visible(row)"
                      [title]="action.label"
                      (click)="action.onClick(row)"
                      class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      [attr.aria-label]="action.label"
                    >
                      <span aria-hidden="true">{{ action.icon }}</span>
                    </button>
                  </ng-container>
                </td>
              </tr>
              <!-- Empty State -->
              <tr *ngIf="paginatedData.length === 0 && !loading" role="row">
                <td [attr.colspan]="(selectable ? 1 : 0) + columns.length + (actions.length > 0 ? 1 : 0)" class="px-6 py-12 text-center" role="gridcell">
                  <div class="flex flex-col items-center justify-center" role="status" [attr.aria-live]="'polite'">
                    <span class="text-4xl mb-2" aria-hidden="true">{{ emptyIcon }}</span>
                    <p class="text-gray-500 dark:text-gray-400">{{ emptyText }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <nav *ngIf="(pagination && pagination.total > 0) || (!pagination && data.length > pageSize)" class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center" role="navigation" [attr.aria-label]="'Table pagination'">
        <div class="text-sm text-gray-500 dark:text-gray-400" role="status" [attr.aria-live]="'polite'">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ pagination ? pagination.total : data.length }} entries
        </div>
        <div class="flex space-x-2" role="group" [attr.aria-label]="'Pagination controls'">
          <button
            [disabled]="currentPageValue === 1"
            (click)="changePage(currentPageValue - 1)"
            class="glass-button px-3 py-1 text-sm disabled:opacity-50"
            [attr.aria-label]="'Go to previous page'"
            [attr.aria-disabled]="currentPageValue === 1"
          >
            Previous
          </button>
          <button
            *ngFor="let page of pages; trackBy: trackByPage"
            [class.bg-primary-500]="page === currentPageValue"
            [class.text-white]="page === currentPageValue"
            (click)="changePage(page)"
            class="glass-button px-3 py-1 text-sm"
            [attr.aria-label]="'Go to page ' + page"
            [attr.aria-current]="page === currentPageValue ? 'page' : null"
          >
            {{ page }}
          </button>
          <button
            [disabled]="currentPageValue === totalPages"
            (click)="changePage(currentPageValue + 1)"
            class="glass-button px-3 py-1 text-sm disabled:opacity-50"
            [attr.aria-label]="'Go to next page'"
            [attr.aria-disabled]="currentPageValue === totalPages"
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  `,
  styles: [`
    .virtual-scroll-viewport {
      height: 400px;
      display: block;
      overflow: auto;
    }
    .virtual-scroll-viewport .cdk-virtual-scroll-content-wrapper {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    .virtual-scroll-viewport .cdk-virtual-scroll-spacer {
      display: table-row;
    }
  `]
})
export class DataTableComponent implements AfterViewChecked {
  /**
   * Table columns configuration
   * @default []
   */
  @Input() columns: TableColumn[] = [];

  /**
   * Table data rows
   * @default []
   */
  @Input() data: any[] = [];

  /**
   * Row action buttons
   * @default []
   */
  @Input() actions: TableAction[] = [];

  /**
   * Whether search is enabled
   * @default true
   */
  @Input() searchable: boolean = true;

  /**
   * Number of rows per page
   * @default 10
   */
  @Input() pageSize: number = 10;

  /**
   * External pagination configuration
   */
  @Input() pagination?: PaginationConfig;

  /**
   * Whether row selection is enabled
   * @default false
   */
  @Input() selectable: boolean = false;

  /**
   * Function to get unique row identifier
   */
  @Input() getRowId?: (row: any) => string | number;

  /**
   * Whether table is in loading state
   * @default false
   */
  @Input() loading: boolean = false;

  /**
   * Empty state text
   * @default 'No data available'
   */
  @Input() emptyText: string = 'No data available';

  /**
   * Empty state icon
   * @default '📭'
   */
  @Input() emptyIcon: string = '📭';

  /**
   * Whether column filters are enabled
   * @default false
   */
  @Input() enableColumnFilters: boolean = false;

  /**
   * Whether multi-column sorting is enabled
   * @default false
   */
  @Input() enableMultiSort: boolean = false;

  /**
   * Whether export functionality is shown
   * @default false
   */
  @Input() showExport: boolean = false;

  /**
   * Available export formats
   * @default ['csv', 'json']
   */
  @Input() exportFormats: string[] = ['csv', 'json'];

  /**
   * Export file name
   * @default 'data-export'
   */
  @Input() exportFileName: string = 'data-export';

  /**
   * Enable virtual scrolling for large datasets
   * @default false
   */
  @Input() enableVirtualScrolling: boolean = false;

  /**
   * Height of each row in pixels (for virtual scrolling)
   * @default 50
   */
  @Input() virtualScrollItemSize: number = 50;

  /**
   * Number of items to render outside viewport (for virtual scrolling)
   * @default 5
   */
  @Input() virtualScrollBufferSize: number = 5;

  /**
   * Additional CSS classes
   * @default ''
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for table
   * @default ''
   */
  @Input() ariaLabel: string = '';

  /**
   * Emitted when a row is clicked
   */
  @Output() rowClicked = new EventEmitter<any>();

  /**
   * Emitted when sorting changes
   */
  @Output() sorted = new EventEmitter<SortEvent>();

  /**
   * Emitted when page changes
   */
  @Output() pageChange = new EventEmitter<number>();

  /**
   * Emitted when page size changes
   */
  @Output() pageSizeChange = new EventEmitter<number>();

  /**
   * Emitted when selection changes
   */
  @Output() selectionChange = new EventEmitter<any[]>();

  /**
   * Emitted when filters change
   */
  @Output() filterChange = new EventEmitter<{[key: string]: any}>();

  @ViewChild('selectAllCheckbox', { static: false }) selectAllCheckbox?: ElementRef<HTMLInputElement>;

  searchTerm: string = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortState: Array<{key: string, direction: 'asc' | 'desc'}> = [];
  currentPage: number = 1;
  selectedRows = new Set<any>();
  columnFilters: {[key: string]: any} = {};
  showExportMenu: boolean = false;

  ngAfterViewChecked(): void {
    // Set indeterminate state for select all checkbox
    if (this.selectable && this.selectAllCheckbox?.nativeElement) {
      this.selectAllCheckbox.nativeElement.indeterminate = this.isIndeterminate();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close export menu when clicking outside
    if (this.showExportMenu) {
      const target = event.target as HTMLElement;
      if (!target.closest('.export-menu-container')) {
        this.showExportMenu = false;
      }
    }
  }

  get filteredData(): any[] {
    let filtered = [...this.data];

    // Apply global search
    if (this.searchTerm) {
      filtered = filtered.filter(row => {
        return this.columns.some(column => {
          const value = this.getNestedValue(row, column.key);
          return String(value).toLowerCase().includes(this.searchTerm.toLowerCase());
        });
      });
    }

    // Apply column filters
    if (this.enableColumnFilters) {
      filtered = filtered.filter(row => {
        return Object.keys(this.columnFilters).every(key => {
          const filterValue = this.columnFilters[key];
          if (!filterValue && filterValue !== 0 && filterValue !== false) return true;

          const column = this.columns.find(col => col.key === key);
          if (!column || !column.filterable) return true;

          const cellValue = this.getNestedValue(row, column.key);
          return this.matchesFilter(cellValue, filterValue, column);
        });
      });
    }

    return filtered;
  }

  get sortedData(): any[] {
    // Multi-sort mode
    if (this.enableMultiSort && this.sortState.length > 0) {
      return [...this.filteredData].sort((a, b) => {
        for (const sort of this.sortState) {
          const aVal = this.getNestedValue(a, sort.key);
          const bVal = this.getNestedValue(b, sort.key);

          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          if (aVal > bVal) comparison = 1;

          if (comparison !== 0) {
            return sort.direction === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });
    }

    // Single-sort mode (default)
    if (!this.sortBy) return this.filteredData;

    return [...this.filteredData].sort((a, b) => {
      const aVal = this.getNestedValue(a, this.sortBy);
      const bVal = this.getNestedValue(b, this.sortBy);

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  get paginatedData(): any[] {
    // Use pagination config if provided, otherwise use internal pagination
    if (this.pagination) {
      return this.sortedData;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.sortedData.slice(start, end);
  }

  get totalPages(): number {
    if (this.pagination) {
      return this.pagination.totalPages;
    }
    return Math.ceil(this.sortedData.length / this.pageSize);
  }

  get pages(): number[] {
    const pages = [];
    const maxPages = Math.min(this.totalPages, 10); // Show max 10 page numbers
    const startPage = Math.max(1, this.currentPageValue - 4);
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startIndex(): number {
    if (this.pagination) {
      return (this.pagination.currentPage - 1) * this.pagination.pageSize;
    }
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    if (this.pagination) {
      return Math.min(this.startIndex + this.pagination.pageSize, this.pagination.total);
    }
    return Math.min(this.startIndex + this.pageSize, this.sortedData.length);
  }

  get currentPageValue(): number {
    return this.pagination ? this.pagination.currentPage : this.currentPage;
  }

  get pageSizeValue(): number {
    return this.pagination ? this.pagination.pageSize : this.pageSize;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  onHeaderClick(event: MouseEvent, column: TableColumn): void {
    // Don't sort if clicking on input or select elements
    const target = event.target as HTMLElement;
    if (target.closest('input, select')) {
      return;
    }

    if (column.sortable) {
      this.onSort(column.key);
    }
  }

  onSort(key: string): void {
    if (this.enableMultiSort) {
      const existingSort = this.sortState.find(s => s.key === key);
      if (existingSort) {
        // Toggle direction
        existingSort.direction = existingSort.direction === 'asc' ? 'desc' : 'asc';
        // Remove if toggled to none (optional - or keep for 3-state)
      } else {
        // Add new sort
        this.sortState.push({ key, direction: 'asc' });
      }
      // Keep only last 3 sorts for simplicity
      if (this.sortState.length > 3) {
        this.sortState.shift();
      }
    } else {
      if (this.sortBy === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = key;
        this.sortDirection = 'asc';
      }
    }

    // Emit sort event to parent component
    this.sorted.emit({
      column: key,
      direction: this.enableMultiSort ? (this.sortState.find(s => s.key === key)?.direction || 'asc') : this.sortDirection
    });
  }

  getSortDirection(columnKey: string): 'asc' | 'desc' | null {
    if (this.enableMultiSort) {
      const sort = this.sortState.find(s => s.key === columnKey);
      return sort ? sort.direction : null;
    }
    return this.sortBy === columnKey ? this.sortDirection : null;
  }

  onColumnFilter(columnKey: string, value: any): void {
    if (value === '' || value === null || value === undefined) {
      delete this.columnFilters[columnKey];
    } else {
      this.columnFilters[columnKey] = value;
    }
    this.currentPage = 1;
    this.filterChange.emit({...this.columnFilters});
  }

  matchesFilter(value: any, filterValue: any, column: TableColumn): boolean {
    if (column.filterType === 'text') {
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    } else if (column.filterType === 'number') {
      return Number(value) === Number(filterValue);
    } else if (column.filterType === 'select') {
      return value === filterValue;
    } else if (column.filterType === 'date') {
      // Simple date comparison
      return String(value).includes(String(filterValue));
    }
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  // Selection methods
  getRowIdentifier(row: any): string | number {
    if (this.getRowId) {
      return this.getRowId(row);
    }
    // Default: use object reference or id property
    return row.id || row.company_id || JSON.stringify(row);
  }

  isRowSelected(row: any): boolean {
    const rowId = this.getRowIdentifier(row);
    return Array.from(this.selectedRows).some(r => this.getRowIdentifier(r) === rowId);
  }

  onRowSelect(row: any, checked: boolean): void {
    const rowId = this.getRowIdentifier(row);

    if (checked) {
      // Remove any existing row with same ID and add new one
      this.selectedRows = new Set(Array.from(this.selectedRows).filter(r => this.getRowIdentifier(r) !== rowId));
      this.selectedRows.add(row);
    } else {
      this.selectedRows = new Set(Array.from(this.selectedRows).filter(r => this.getRowIdentifier(r) !== rowId));
    }

    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  onRowSelectChange(row: any, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.onRowSelect(row, checked);
  }

  isAllSelected(): boolean {
    if (this.paginatedData.length === 0) return false;
    return this.paginatedData.every(row => this.isRowSelected(row));
  }

  isIndeterminate(): boolean {
    const selectedCount = this.paginatedData.filter(row => this.isRowSelected(row)).length;
    return selectedCount > 0 && selectedCount < this.paginatedData.length;
  }

  onSelectAll(checked: boolean): void {
    if (checked) {
      this.paginatedData.forEach(row => {
        if (!this.isRowSelected(row)) {
          this.selectedRows.add(row);
        }
      });
    } else {
      const currentPageIds = new Set(this.paginatedData.map(row => this.getRowIdentifier(row)));
      this.selectedRows = new Set(Array.from(this.selectedRows).filter(r => !currentPageIds.has(this.getRowIdentifier(r))));
    }

    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  onSelectAllChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.onSelectAll(checked);
  }

  clearSelection(): void {
    this.selectedRows.clear();
    this.selectionChange.emit([]);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.pageSizeChange.emit(size);
  }

  getCellValue(row: any, column: TableColumn): string {
    const value = this.getNestedValue(row, column.key);
    return column.render ? column.render(value, row) : value;
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * TrackBy function for virtual scrolling and performance
   */
  trackByRowId(index: number, row: any): any {
    if (this.getRowId) {
      return this.getRowId(row);
    }
    return row.id || row.company_id || index;
  }

  /**
   * TrackBy function for columns
   */
  trackByColumn(index: number, column: TableColumn): string {
    return column.key;
  }

  /**
   * TrackBy function for actions
   */
  trackByAction(index: number, action: TableAction): string {
    return action.label + index;
  }

  /**
   * TrackBy function for pagination pages
   */
  trackByPage(index: number, page: number): number {
    return page;
  }

  /**
   * Get ARIA sort value for column
   */
  getAriaSort(columnKey: string): 'ascending' | 'descending' | 'none' | null {
    const direction = this.getSortDirection(columnKey);
    if (direction === 'asc') return 'ascending';
    if (direction === 'desc') return 'descending';
    return 'none';
  }

  /**
   * Export functionality
   */
  exportToCSV(): void {
    const data = this.sortedData;
    const headers = this.columns.map(col => col.label);
    const rows = data.map(row =>
      this.columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        // Escape commas and quotes in CSV
        const stringValue = String(value ?? '').replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(',')
    );

    const csvContent = [
      headers.join(','),
      ...rows
    ].join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `${this.exportFileName}.csv`, 'text/csv');
    this.showExportMenu = false;
  }

  exportToExcel(): void {
    // For Excel, we'll export as tab-separated values with .xls extension
    // Note: For true Excel format (.xlsx), you'd need a library like xlsx
    // This is a simplified version that works with Excel
    const data = this.sortedData;
    const headers = this.columns.map(col => col.label);
    const rows = data.map(row =>
      this.columns.map(col => {
        const value = this.getNestedValue(row, col.key);
        const stringValue = String(value ?? '').replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join('\t') // Use tab separator for Excel
    );

    const excelContent = [
      headers.join('\t'),
      ...rows
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + excelContent], { type: 'application/vnd.ms-excel' });
    this.downloadFile(blob, `${this.exportFileName}.xls`, 'application/vnd.ms-excel');
    this.showExportMenu = false;
  }

  exportToJSON(): void {
    const data = this.sortedData.map(row => {
      const obj: any = {};
      this.columns.forEach(col => {
        obj[col.key] = this.getNestedValue(row, col.key);
      });
      return obj;
    });

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadFile(blob, `${this.exportFileName}.json`, 'application/json');
    this.showExportMenu = false;
  }

  private downloadFile(blob: Blob, filename: string, mimeType: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

