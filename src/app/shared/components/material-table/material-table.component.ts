/**
 * Material Table Component
 *
 * A Material Design table component wrapper using Angular Material.
 * Provides a data table with sorting, pagination, search, and row actions.
 *
 * @example
 * ```html
 * <app-material-table
 *   [data]="tableData"
 *   [columns]="columns"
 *   [rowActions]="actions"
 *   [title]="'Users'"
 *   [searchable]="true"
 *   [selectable]="true"
 *   [paginated]="true"
 *   [customClass]="'my-table'"
 *   [ariaLabel]="'Users table'"
 *   (rowClick)="onRowClick($event)"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-material-table>
 * ```
 */

import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'icon' | 'action';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  key: string;
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (row: any) => boolean;
}

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="material-table-container" [class]="customClass || ''" role="region" [attr.aria-label]="ariaLabel || title || 'Data table'">
      <!-- Table Header -->
      <div class="table-header" *ngIf="title || searchable || hasActions" role="toolbar" [attr.aria-label]="'Table controls'">
        <h2 *ngIf="title" class="table-title" [id]="titleId">{{ title }}</h2>
        <div class="table-controls">
        <div *ngIf="searchable" class="search-field">
          <input
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Search..."
            class="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            [attr.aria-label]="'Search table'"
            [attr.aria-describedby]="title ? titleId : null">
        </div>
          <button mat-icon-button [matMenuTriggerFor]="actionsMenu" *ngIf="hasActions" [attr.aria-label]="'Table actions menu'">
            <mat-icon [attr.aria-hidden]="'true'">more_vert</mat-icon>
          </button>
          <mat-menu #actionsMenu="matMenu">
            <button mat-menu-item (click)="onActionClick('refresh')" [attr.aria-label]="'Refresh table'">
              <mat-icon [attr.aria-hidden]="'true'">refresh</mat-icon>
              <span>Refresh</span>
            </button>
            <button mat-menu-item (click)="onActionClick('export')" [attr.aria-label]="'Export table'">
              <mat-icon [attr.aria-hidden]="'true'">download</mat-icon>
              <span>Export</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table mat-table [dataSource]="paginatedData" class="material-table" role="table" [attr.aria-label]="ariaLabel || title || 'Data table'" [attr.aria-describedby]="title ? titleId : null">
          <!-- Selection Column -->
          <ng-container matColumnDef="select" *ngIf="selectable">
            <th mat-header-cell *matHeaderCellDef [attr.aria-label]="'Select all'">
              <mat-checkbox
                (change)="onMasterToggle()"
                [checked]="masterCheckboxChecked"
                [indeterminate]="masterCheckboxIndeterminate"
                [attr.aria-label]="'Select all rows'">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row" [attr.aria-label]="'Select row'">
              <mat-checkbox
                (change)="onRowToggle(row)"
                [checked]="isSelected(row)"
                [attr.aria-label]="'Select row'">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Data Columns -->
          <ng-container *ngFor="let column of columns; trackBy: trackByColumn" [matColumnDef]="column.key">
            <th mat-header-cell
                *matHeaderCellDef
                [class.text-left]="column.align === 'left' || !column.align"
                [class.text-center]="column.align === 'center'"
                [class.text-right]="column.align === 'right'"
                [style.width]="column.width"
                [attr.aria-sort]="getSortDirection(column.key)">
              {{ column.label }}
            </th>
            <td mat-cell
                *matCellDef="let row; let i = index"
                [class.text-left]="column.align === 'left' || !column.align"
                [class.text-center]="column.align === 'center'"
                [class.text-right]="column.align === 'right'"
                [attr.aria-selected]="selectable && isSelected(row) ? 'true' : null">
              <ng-container [ngSwitch]="column.type">
                <span *ngSwitchCase="'text'">{{ getCellValue(row, column.key) }}</span>
                <span *ngSwitchCase="'number'">{{ getCellValue(row, column.key) | number }}</span>
                <span *ngSwitchCase="'date'">{{ getCellValue(row, column.key) | date:'short' }}</span>
                <mat-icon *ngSwitchCase="'boolean'" [attr.aria-label]="getCellValue(row, column.key) ? 'Yes' : 'No'" [attr.aria-hidden]="'true'">
                  {{ getCellValue(row, column.key) ? 'check_circle' : 'cancel' }}
                </mat-icon>
                <mat-icon *ngSwitchCase="'icon'" [attr.aria-hidden]="'true'">{{ getCellValue(row, column.key) }}</mat-icon>
                <span *ngSwitchDefault>{{ getCellValue(row, column.key) }}</span>
              </ng-container>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions" *ngIf="rowActions.length > 0">
            <th mat-header-cell *matHeaderCellDef [attr.aria-label]="'Actions'">Actions</th>
            <td mat-cell *matCellDef="let row" [attr.aria-label]="'Row actions'">
              <button mat-icon-button [matMenuTriggerFor]="rowMenu" [attr.aria-label]="'Open actions menu for row'">
                <mat-icon [attr.aria-hidden]="'true'">more_vert</mat-icon>
              </button>
              <mat-menu #rowMenu="matMenu">
                <button mat-menu-item
                        *ngFor="let action of rowActions; trackBy: trackByAction"
                        [disabled]="action.disabled?.(row)"
                        (click)="onRowActionClick(action, row)"
                        [attr.aria-label]="action.label">
                  <mat-icon [attr.aria-hidden]="'true'">{{ action.icon }}</mat-icon>
                  <span>{{ action.label }}</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row
              *matRowDef="let row; columns: displayedColumns;"
              [class.selected]="isSelected(row)"
              (click)="onRowClick(row)">
          </tr>
        </table>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="paginated"
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
        [showFirstLastButtons]="true"
        (page)="onPageChange($event)"
        class="table-paginator">
      </mat-paginator>

      <!-- No Data -->
      <div *ngIf="filteredData.length === 0" class="no-data" role="status" [attr.aria-live]="'polite'">
        <mat-icon [attr.aria-hidden]="'true'">inbox</mat-icon>
        <p>No data available</p>
      </div>
    </div>
  `,
  styles: [`
    .material-table-container {
      background: rgba(26, 26, 46, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 16px;
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    }

    .table-title {
      color: #ffffff;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .table-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-field {
      width: 250px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .material-table {
      width: 100%;
      background: transparent;
    }

    .material-table th {
      color: #ffffff;
      font-weight: 600;
      background: rgba(59, 130, 246, 0.1);
    }

    .material-table td {
      color: #a0a0a0;
      border-bottom: 1px solid rgba(59, 130, 246, 0.1);
    }

    .material-table tr:hover {
      background: rgba(59, 130, 246, 0.05);
    }

    .material-table tr.selected {
      background: rgba(59, 130, 246, 0.1);
    }

    .table-paginator {
      background: rgba(26, 26, 46, 0.8);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(59, 130, 246, 0.2);
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #a0a0a0;
    }

    .no-data mat-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      margin-bottom: 1rem;
    }
  `]
})
export class MaterialTableComponent {
  /**
   * Table data
   */
  @Input() data: any[] = [];

  /**
   * Table columns
   */
  @Input() columns: TableColumn[] = [];

  /**
   * Row actions
   */
  @Input() rowActions: TableAction[] = [];

  /**
   * Table title
   */
  @Input() title: string = '';

  /**
   * Enable search
   */
  @Input() searchable: boolean = true;

  /**
   * Enable row selection
   */
  @Input() selectable: boolean = false;

  /**
   * Enable pagination
   */
  @Input() paginated: boolean = true;

  /**
   * Page size
   */
  @Input() pageSize: number = 10;

  /**
   * Page size options
   */
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];

  /**
   * Custom CSS classes
   */
  @Input() customClass: string = '';

  /**
   * ARIA label for the table
   */
  @Input() ariaLabel?: string;

  /**
   * Row click event
   */
  @Output() rowClick = new EventEmitter<any>();

  /**
   * Row action event
   */
  @Output() rowAction = new EventEmitter<{action: TableAction, row: any}>();

  /**
   * Selection change event
   */
  @Output() selectionChange = new EventEmitter<any[]>();

  /**
   * Page change event
   */
  @Output() pageChange = new EventEmitter<PageEvent>();

  /**
   * Search change event
   */
  @Output() searchChange = new EventEmitter<string>();

  /**
   * Search term
   */
  searchTerm: string = '';

  /**
   * Selected rows
   */
  selectedRows: Set<any> = new Set();

  /**
   * Current page index
   */
  currentPage: number = 0;

  /**
   * Current sort
   */
  sort: any = null;

  /**
   * Unique title ID
   */
  titleId: string = `table-title-${Math.random().toString(36).substr(2, 9)}`;

  get displayedColumns(): string[] {
    const cols = [];
    if (this.selectable) cols.push('select');
    cols.push(...this.columns.map(c => c.key));
    if (this.rowActions.length > 0) cols.push('actions');
    return cols;
  }

  get filteredData(): any[] {
    if (!this.searchTerm) return this.data;
    return this.data.filter(row =>
      this.columns.some(col =>
        String(this.getCellValue(row, col.key)).toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      )
    );
  }

  get paginatedData(): any[] {
    if (!this.paginated) return this.filteredData;
    const start = this.currentPage * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalItems(): number {
    return this.filteredData.length;
  }

  get masterCheckboxChecked(): boolean {
    return this.selectedRows.size > 0 && this.selectedRows.size === this.paginatedData.length;
  }

  get masterCheckboxIndeterminate(): boolean {
    return this.selectedRows.size > 0 && this.selectedRows.size < this.paginatedData.length;
  }

  get hasActions(): boolean {
    return this.rowActions.length > 0;
  }

  /**
   * Track by function for columns
   */
  trackByColumn(index: number, column: TableColumn): string {
    return column.key;
  }

  /**
   * Track by function for actions
   */
  trackByAction(index: number, action: TableAction): string {
    return action.key;
  }

  /**
   * Get cell value from row
   */
  getCellValue(row: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], row);
  }

  /**
   * Get sort direction for column
   */
  getSortDirection(key: string): string | null {
    if (!this.sort || this.sort.active !== key) {
      return null;
    }
    return this.sort.direction === 'asc' ? 'ascending' : 'descending';
  }

  /**
   * Handle search change
   */
  onSearchChange(): void {
    this.currentPage = 0;
    this.searchChange.emit(this.searchTerm);
  }

  /**
   * Handle row click
   */
  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  /**
   * Handle row action click
   */
  onRowActionClick(action: TableAction, row: any): void {
    this.rowAction.emit({ action, row });
  }

  /**
   * Handle master checkbox toggle
   */
  onMasterToggle(): void {
    if (this.masterCheckboxChecked) {
      this.selectedRows.clear();
    } else {
      this.paginatedData.forEach(row => this.selectedRows.add(row));
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  /**
   * Handle row checkbox toggle
   */
  onRowToggle(row: any): void {
    if (this.isSelected(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  /**
   * Check if row is selected
   */
  isSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  /**
   * Handle table-level action click
   */
  onActionClick(action: string): void {
    // Handle table-level actions
  }
}

