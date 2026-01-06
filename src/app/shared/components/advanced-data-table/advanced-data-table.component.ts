/**
 * @deprecated This component is deprecated. Please use `DataTableComponent` instead.
 *
 * Migration Guide:
 * - Replace `AdvancedDataTableComponent` with `DataTableComponent`
 * - Change `TableColumn.title` to `TableColumn.label`
 * - Change `TableColumn.formatter` to `TableColumn.render`
 * - Replace `TableConfig` object with individual `@Input()` properties
 * - Update action icons from FontAwesome to emoji
 * - See MIGRATION_GUIDE.md for detailed migration steps
 *
 * This component will be removed in a future version.
 *
 * @see DataTableComponent
 * @see MIGRATION_GUIDE.md
 */
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../core/base/base.component';

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  template?: TemplateRef<any>;
  formatter?: (value: any, row: any) => string;
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean';
  filterOptions?: Array<{value: any, label: string}>;
  hidden?: boolean;
  sticky?: boolean;
  resizable?: boolean;
}

export interface TableConfig {
  // Pagination
  pagination: boolean;
  pageSize: number;
  pageSizeOptions: number[];
  showPageSizeSelector: boolean;
  showPageInfo: boolean;

  // Sorting
  sortable: boolean;
  multiSort: boolean;
  defaultSort: {key: string, direction: 'asc' | 'desc'};

  // Filtering
  filterable: boolean;
  globalFilter: boolean;
  columnFilters: boolean;
  filterDebounceTime: number;

  // Selection
  selectable: boolean;
  multiSelect: boolean;
  selectMode: 'single' | 'multiple' | 'none';

  // Actions
  actions: boolean;
  actionColumnWidth: string;

  // Loading
  loading: boolean;
  loadingText: string;

  // Empty state
  emptyText: string;
  emptyIcon: string;

  // Responsive
  responsive: boolean;
  mobileBreakpoint: number;

  // Styling
  striped: boolean;
  hover: boolean;
  bordered: boolean;
  compact: boolean;
  size: 'sm' | 'md' | 'lg';

  // Export
  exportable: boolean;
  exportFormats: string[];

  // Virtual scrolling
  virtualScrolling: boolean;
  itemSize: number;
  bufferSize: number;
}

export interface TableAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  visible?: (row: any) => boolean;
  onClick: (row: any) => void;
}

export interface TableFilter {
  key: string;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'notIn';
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TablePage {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/**
 * @deprecated Use DataTableComponent instead. This component is deprecated and will be removed in a future version.
 *
 * Advanced Data Table Component (Deprecated)
 *
 * A deprecated data table component with advanced features including sorting, filtering, pagination, and selection.
 * This component is being replaced by DataTableComponent which provides better performance and a more consistent API.
 *
 * @example
 * ```html
 * <app-advanced-data-table
 *   [data]="tableData"
 *   [columns]="columns"
 *   [config]="tableConfig"
 *   [loading]="isLoading"
 *   [customClass]="'my-table'"
 *   [ariaLabel]="'Data table'"
 *   (dataChange)="onDataChange($event)"
 *   (selectionChange)="onSelectionChange($event)">
 * </app-advanced-data-table>
 * ```
 *
 * @see DataTableComponent
 * @see DEPRECATION_NOTICE.md
 */
@Component({
  selector: 'app-advanced-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-data-table.component.html',
  styleUrls: ['./advanced-data-table.component.scss']
})
export class AdvancedDataTableComponent extends BaseComponent implements OnInit, AfterViewInit {
  /**
   * Table container element reference
   */
  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  /**
   * Table data array
   */
  @Input() data: any[] = [];

  /**
   * Table columns configuration
   */
  @Input() columns: TableColumn[] = [];

  /**
   * Table configuration options
   */
  @Input() config: Partial<TableConfig> = {};

  /**
   * Row actions configuration
   */
  @Input() actions: TableAction[] = [];

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Empty state text
   */
  @Input() emptyText: string = 'ไม่มีข้อมูล';

  /**
   * Empty state icon
   */
  @Input() emptyIcon: string = 'fas fa-inbox';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the table
   */
  @Input() ariaLabel?: string;

  /**
   * Data change event
   */
  @Output() dataChange = new EventEmitter<any[]>();

  /**
   * Selection change event
   */
  @Output() selectionChange = new EventEmitter<any[]>();

  /**
   * Sort change event
   */
  @Output() sortChange = new EventEmitter<TableSort[]>();

  /**
   * Filter change event
   */
  @Output() filterChange = new EventEmitter<TableFilter[]>();

  /**
   * Page change event
   */
  @Output() pageChange = new EventEmitter<TablePage>();

  /**
   * Action click event
   */
  @Output() actionClick = new EventEmitter<{action: TableAction, row: any}>();

  // Default configuration
  defaultConfig: TableConfig = {
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    showPageSizeSelector: true,
    showPageInfo: true,
    sortable: true,
    multiSort: false,
    defaultSort: {key: '', direction: 'asc'},
    filterable: true,
    globalFilter: true,
    columnFilters: true,
    filterDebounceTime: 300,
    selectable: true,
    multiSelect: true,
    selectMode: 'multiple',
    actions: true,
    actionColumnWidth: '120px',
    loading: false,
    loadingText: 'กำลังโหลด...',
    emptyText: 'ไม่มีข้อมูล',
    emptyIcon: 'fas fa-inbox',
    responsive: true,
    mobileBreakpoint: 768,
    striped: true,
    hover: true,
    bordered: false,
    compact: false,
    size: 'md',
    exportable: true,
    exportFormats: ['csv', 'excel', 'pdf'],
    virtualScrolling: false,
    itemSize: 40,
    bufferSize: 5
  };

  // Component state
  filteredData: any[] = [];
  sortedData: any[] = [];
  paginatedData: any[] = [];
  selectedRows: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  globalFilter: string = '';
  columnFilters: {[key: string]: any} = {};
  sortState: TableSort[] = [];
  isMobile: boolean = false;

  // Table classes
  tableClasses: string[] = [];
  containerClasses: string[] = [];

  constructor() {
    super();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeConfig();
    this.setupResponsive();
    this.processData();
  }

  /**
   * Initialize after view init
   */
  ngAfterViewInit(): void {
    this.setupEventListeners();
  }

  /**
   * Initialize configuration
   */
  private initializeConfig(): void {
    const config = { ...this.defaultConfig, ...this.config };
    this.pageSize = config.pageSize;
    this.updateTableClasses();
  }

  /**
   * Setup responsive behavior
   */
  private setupResponsive(): void {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  /**
   * Check if mobile view
   */
  private checkMobile(): void {
    this.isMobile = window.innerWidth < this.mergedConfig.mobileBreakpoint;
    this.updateTableClasses();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Global filter debounce
    if (this.mergedConfig.globalFilter) {
      // This would be implemented with a search input
    }
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): TableConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Process data through filters, sorting, and pagination
   */
  private processData(): void {
    let processedData = [...this.data];

    // Apply global filter
    if (this.globalFilter && this.mergedConfig.globalFilter) {
      processedData = this.applyGlobalFilter(processedData);
    }

    // Apply column filters
    if (this.mergedConfig.columnFilters) {
      processedData = this.applyColumnFilters(processedData);
    }

    // Apply sorting
    if (this.mergedConfig.sortable) {
      processedData = this.applySorting(processedData);
    }

    this.filteredData = processedData;
    this.totalItems = processedData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Apply pagination
    if (this.mergedConfig.pagination) {
      this.paginatedData = this.applyPagination(processedData);
    } else {
      this.paginatedData = processedData;
    }
  }

  /**
   * Apply global filter
   */
  private applyGlobalFilter(data: any[]): any[] {
    if (!this.globalFilter) return data;

    return data.filter(row => {
      return this.columns.some(column => {
        if (!column.searchable) return false;
        const value = this.getCellValue(row, column);
        return String(value).toLowerCase().includes(this.globalFilter.toLowerCase());
      });
    });
  }

  /**
   * Apply column filters
   */
  private applyColumnFilters(data: any[]): any[] {
    return data.filter(row => {
      return Object.keys(this.columnFilters).every(key => {
        const filterValue = this.columnFilters[key];
        if (!filterValue) return true;

        const column = this.columns.find(col => col.key === key);
        if (!column) return true;

        const cellValue = this.getCellValue(row, column);
        return this.matchesFilter(cellValue, filterValue, column);
      });
    });
  }

  /**
   * Check if value matches filter
   */
  private matchesFilter(value: any, filterValue: any, column: TableColumn): boolean {
    if (column.filterType === 'text') {
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    } else if (column.filterType === 'number') {
      return Number(value) === Number(filterValue);
    } else if (column.filterType === 'boolean') {
      return Boolean(value) === Boolean(filterValue);
    } else if (column.filterType === 'select') {
      return value === filterValue;
    }
    return true;
  }

  /**
   * Apply sorting
   */
  private applySorting(data: any[]): any[] {
    if (this.sortState.length === 0) return data;

    return data.sort((a, b) => {
      for (const sort of this.sortState) {
        const column = this.columns.find(col => col.key === sort.key);
        if (!column) continue;

        const aValue = this.getCellValue(a, column);
        const bValue = this.getCellValue(b, column);

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Apply pagination
   */
  private applyPagination(data: any[]): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return data.slice(startIndex, endIndex);
  }

  /**
   * Get cell value
   */
  getCellValue(row: any, column: TableColumn): any {
    const value = row[column.key];
    if (column.formatter) {
      return column.formatter(value, row);
    }
    return value;
  }

  /**
   * Handle sort
   */
  onSort(column: TableColumn): void {
    if (!column.sortable || !this.mergedConfig.sortable) return;

    const existingSort = this.sortState.find(sort => sort.key === column.key);

    if (existingSort) {
      // Toggle direction
      existingSort.direction = existingSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Add new sort
      if (!this.mergedConfig.multiSort) {
        this.sortState = [];
      }
      this.sortState.push({ key: column.key, direction: 'asc' });
    }

    this.processData();
    this.sortChange.emit([...this.sortState]);
  }

  /**
   * Handle column filter
   */
  onColumnFilter(column: TableColumn, value: any): void {
    if (!column.filterable || !this.mergedConfig.columnFilters) return;

    this.columnFilters[column.key] = value;
    this.currentPage = 1;
    this.processData();
    this.filterChange.emit(this.getActiveFilters());
  }

  /**
   * Handle global filter
   */
  onGlobalFilter(value: string): void {
    this.globalFilter = value;
    this.currentPage = 1;
    this.processData();
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.processData();
    this.pageChange.emit(this.getCurrentPage());
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.processData();
    this.pageChange.emit(this.getCurrentPage());
  }

  /**
   * Handle row selection
   */
  onRowSelect(row: any, checked: boolean): void {
    if (checked) {
      if (this.mergedConfig.multiSelect) {
        this.selectedRows.push(row);
      } else {
        this.selectedRows = [row];
      }
    } else {
      this.selectedRows = this.selectedRows.filter(r => r !== row);
    }

    this.selectionChange.emit([...this.selectedRows]);
  }

  /**
   * Handle select all
   */
  onSelectAll(checked: boolean): void {
    if (checked) {
      this.selectedRows = [...this.paginatedData];
    } else {
      this.selectedRows = [];
    }

    this.selectionChange.emit([...this.selectedRows]);
  }

  /**
   * Handle action click
   */
  onActionClick(action: TableAction, row: any): void {
    if (action.disabled) return;
    action.onClick(row);
    this.actionClick.emit({ action, row });
  }

  /**
   * Get active filters
   */
  getActiveFilters(): TableFilter[] {
    return Object.keys(this.columnFilters).map(key => ({
      key,
      value: this.columnFilters[key],
      operator: 'equals' as const
    }));
  }

  /**
   * Get current page info
   */
  getCurrentPage(): TablePage {
    return {
      page: this.currentPage,
      size: this.pageSize,
      total: this.totalItems,
      totalPages: this.totalPages
    };
  }

  /**
   * Get visible columns
   */
  getVisibleColumns(): TableColumn[] {
    return this.columns.filter(column => !column.hidden);
  }

  /**
   * Get sort direction for column
   */
  getSortDirection(column: TableColumn): 'asc' | 'desc' | null {
    const sort = this.sortState.find(s => s.key === column.key);
    return sort ? sort.direction : null;
  }

  /**
   * Check if row is selected
   */
  isRowSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  /**
   * Check if all rows are selected
   */
  isAllSelected(): boolean {
    return this.paginatedData.length > 0 && this.selectedRows.length === this.paginatedData.length;
  }

  /**
   * Check if some rows are selected
   */
  isSomeSelected(): boolean {
    return this.selectedRows.length > 0 && this.selectedRows.length < this.paginatedData.length;
  }

  /**
   * Update table classes
   */
  private updateTableClasses(): void {
    const config = this.mergedConfig;
    this.tableClasses = [
      'table',
      `table-${config.size}`,
      config.striped ? 'table-striped' : '',
      config.hover ? 'table-hover' : '',
      config.bordered ? 'table-bordered' : '',
      config.compact ? 'table-compact' : '',
      this.isMobile ? 'table-mobile' : ''
    ].filter(Boolean);

    this.containerClasses = [
      'table-container',
      this.isMobile ? 'table-container-mobile' : '',
      config.responsive ? 'table-responsive' : ''
    ].filter(Boolean);
  }

  /**
   * Get table classes
   */
  getTableClasses(): string[] {
    return this.tableClasses;
  }

  /**
   * Get container classes
   */
  getContainerClasses(): string[] {
    return this.containerClasses;
  }

  /**
   * Get pagination info
   */
  getPaginationInfo(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `แสดง ${start}-${end} จาก ${this.totalItems} รายการ`;
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Track by function for ngFor
   */
  /**
   * TrackBy function for rows
   */
  trackByRow(index: number, row: any): any {
    return row.id || index;
  }

  /**
   * Track by function for columns
   */
  /**
   * TrackBy function for columns
   */
  trackByColumn(index: number, column: TableColumn): string {
    return column.key;
  }


  /**
   * Export data
   */
  exportData(): void {
    // This would implement data export functionality
    // Data export initiated
  }
}
