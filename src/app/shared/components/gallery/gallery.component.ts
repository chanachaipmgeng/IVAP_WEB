/**
 * Gallery Component
 *
 * A flexible gallery component for displaying images and media with various layouts,
 * filtering, sorting, and lightbox support.
 *
 * @example
 * ```html
 * <app-gallery
 *   [items]="galleryItems"
 *   [config]="galleryConfig"
 *   [loading]="false"
 *   (itemClick)="onItemClick($event)">
 * </app-gallery>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

/**
 * Gallery item interface
 */
export interface GalleryItem {
  id: string;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  metadata?: {
    width?: number;
    height?: number;
    size?: number;
    type?: string;
    uploadedAt?: Date;
    uploadedBy?: string;
  };
  thumbnail?: string;
  fullSize?: string;
  downloadUrl?: string;
  isSelected?: boolean;
  isFavorite?: boolean;
  isPrivate?: boolean;
}

/**
 * Gallery configuration interface
 */
export interface GalleryConfig {
  // Layout
  layout: 'grid' | 'masonry' | 'list' | 'carousel';
  columns: number;
  gap: number;
  itemSize: {
    width: number;
    height: number;
  };

  // Display
  showThumbnails: boolean;
  showTitles: boolean;
  showDescriptions: boolean;
  showMetadata: boolean;
  showActions: boolean;
  showSearch: boolean;
  showFilters: boolean;
  showSorting: boolean;

  // Interaction
  selectable: boolean;
  multiSelect: boolean;
  clickable: boolean;
  draggable: boolean;
  resizable: boolean;

  // Lightbox
  lightbox: boolean;
  lightboxKeyboard: boolean;
  lightboxTouch: boolean;
  lightboxAnimation: boolean;
  lightboxAnimationDuration: number;

  // Lazy loading
  lazyLoading: boolean;
  lazyOffset: number;

  // Responsive
  responsive: boolean;
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  // Styling
  theme: 'light' | 'dark' | 'auto';
  borderRadius: number;
  shadow: boolean;
  hoverEffect: boolean;

  // Performance
  virtualScrolling: boolean;
  bufferSize: number;
  preloadImages: number;
}

export interface GalleryFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range' | 'boolean';
  options?: Array<{value: any, label: string}>;
  value?: any;
}

/**
 * Gallery sort interface
 */
export interface GallerySort {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

/**
 * Gallery action interface
 */
export interface GalleryAction {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'success';
  disabled?: boolean;
  visible?: (item: GalleryItem) => boolean;
  onClick: (item: GalleryItem) => void;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    ImageOptimizationDirective
  ],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent extends BaseComponent implements OnInit, AfterViewInit {
  /**
   * Gallery container element reference
   */
  @ViewChild('galleryContainer', { static: false }) galleryContainer!: ElementRef;

  /**
   * Gallery items
   */
  @Input() items: GalleryItem[] = [];

  /**
   * Gallery configuration
   */
  @Input() config: Partial<GalleryConfig> = {};

  /**
   * Gallery filters
   */
  @Input() filters: GalleryFilter[] = [];

  /**
   * Gallery sorts
   */
  @Input() sorts: GallerySort[] = [];

  /**
   * Gallery actions
   */
  @Input() actions: GalleryAction[] = [];

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Empty state text
   */
  @Input() emptyText: string = 'ไม่มีรูปภาพ';

  /**
   * Empty state icon
   */
  @Input() emptyIcon: string = 'fas fa-images';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Item click event
   */
  @Output() itemClick = new EventEmitter<GalleryItem>();

  /**
   * Item select event
   */
  @Output() itemSelect = new EventEmitter<GalleryItem[]>();

  /**
   * Item action event
   */
  @Output() itemAction = new EventEmitter<{action: GalleryAction, item: GalleryItem}>();

  /**
   * Filter change event
   */
  @Output() filterChange = new EventEmitter<Record<string, unknown>>();

  /**
   * Sort change event
   */
  @Output() sortChange = new EventEmitter<GallerySort>();

  /**
   * Lightbox open event
   */
  @Output() lightboxOpen = new EventEmitter<GalleryItem>();

  /**
   * Lightbox close event
   */
  @Output() lightboxClose = new EventEmitter<void>();

  // Default configuration
  defaultConfig: GalleryConfig = {
    layout: 'grid',
    columns: 4,
    gap: 16,
    itemSize: { width: 200, height: 200 },
    showThumbnails: true,
    showTitles: true,
    showDescriptions: false,
    showMetadata: false,
    showActions: true,
    showSearch: true,
    showFilters: true,
    showSorting: true,
    selectable: true,
    multiSelect: true,
    clickable: true,
    draggable: false,
    resizable: false,
    lightbox: true,
    lightboxKeyboard: true,
    lightboxTouch: true,
    lightboxAnimation: true,
    lightboxAnimationDuration: 300,
    lazyLoading: true,
    lazyOffset: 100,
    responsive: true,
    breakpoints: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
    theme: 'auto',
    borderRadius: 8,
    shadow: true,
    hoverEffect: true,
    virtualScrolling: false,
    bufferSize: 10,
    preloadImages: 5
  };

  /**
   * Filtered items
   */
  filteredItems: GalleryItem[] = [];

  /**
   * Selected items
   */
  selectedItems: GalleryItem[] = [];

  /**
   * Search term
   */
  searchTerm: string = '';

  /**
   * Active filters
   */
  activeFilters: Record<string, unknown> = {};

  /**
   * Active sort
   */
  activeSort: GallerySort | null = null;

  /**
   * Current layout
   */
  currentLayout: 'grid' | 'masonry' | 'list' | 'carousel' = 'grid';

  /**
   * Lightbox open state
   */
  isLightboxOpen: boolean = false;

  /**
   * Current lightbox item
   */
  lightboxItem: GalleryItem | null = null;

  /**
   * Current lightbox index
   */
  lightboxIndex: number = 0;

  /**
   * Mobile view state
   */
  isMobile: boolean = false;

  /**
   * Current columns
   */
  currentColumns: number = 4;

  /**
   * Gallery classes
   */
  galleryClasses: string[] = [];

  /**
   * Container classes
   */
  containerClasses: string[] = [];

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeConfig();
    this.setupResponsive();
    this.processItems();
  }

  /**
   * Setup after view init
   */
  ngAfterViewInit(): void {
    this.setupEventListeners();
    this.setupIntersectionObserver();
  }

  /**
   * Initialize configuration
   */
  private initializeConfig(): void {
    const config = { ...this.defaultConfig, ...this.config };
    this.currentLayout = config.layout;
    this.currentColumns = config.columns;
    this.updateGalleryClasses();
  }

  /**
   * Setup responsive behavior
   */
  private setupResponsive(): void {
    this.checkMobile();
    this.updateColumns();
    window.addEventListener('resize', () => {
      this.checkMobile();
      this.updateColumns();
    });
  }

  /**
   * Check if mobile view
   */
  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
    this.updateGalleryClasses();
  }

  /**
   * Update columns based on screen size
   */
  private updateColumns(): void {
    if (!this.mergedConfig.responsive) return;

    const width = window.innerWidth;
    const breakpoints = this.mergedConfig.breakpoints;

    if (width < 576) {
      this.currentColumns = breakpoints.xs;
    } else if (width < 768) {
      this.currentColumns = breakpoints.sm;
    } else if (width < 992) {
      this.currentColumns = breakpoints.md;
    } else if (width < 1200) {
      this.currentColumns = breakpoints.lg;
    } else {
      this.currentColumns = breakpoints.xl;
    }

    this.updateGalleryClasses();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Search debounce
    if (this.mergedConfig.showSearch) {
      // This would be implemented with a search input
    }
  }

  /**
   * Setup intersection observer for lazy loading
   */
  private setupIntersectionObserver(): void {
    if (!this.mergedConfig.lazyLoading) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset['src']) {
            img.src = img.dataset['src'];
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: `${this.mergedConfig.lazyOffset}px`
    });

    // Observe images after view init
    setTimeout(() => {
      const images = this.galleryContainer?.nativeElement.querySelectorAll('img[data-src]');
      images?.forEach((img: HTMLImageElement) => observer.observe(img));
    }, 100);
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): GalleryConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Process items through filters and sorting
   */
  private processItems(): void {
    let processedItems = [...this.items];

    // Apply search filter
    if (this.searchTerm) {
      processedItems = this.applySearchFilter(processedItems);
    }

    // Apply filters
    processedItems = this.applyFilters(processedItems);

    // Apply sorting
    if (this.activeSort) {
      processedItems = this.applySorting(processedItems);
    }

    this.filteredItems = processedItems;
  }

  /**
   * Apply search filter
   */
  private applySearchFilter(items: GalleryItem[]): GalleryItem[] {
    if (!this.searchTerm) return items;

    const term = this.searchTerm.toLowerCase();
    return items.filter(item =>
      item.title?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.tags?.some(tag => tag.toLowerCase().includes(term)) ||
      item.category?.toLowerCase().includes(term)
    );
  }

  /**
   * Apply filters
   */
  private applyFilters(items: GalleryItem[]): GalleryItem[] {
    return items.filter(item => {
      return Object.keys(this.activeFilters).every(key => {
        const filterValue = this.activeFilters[key];
        if (!filterValue) return true;

        const filter = this.filters.find(f => f.key === key);
        if (!filter) return true;

        return this.matchesFilter(item, filter, filterValue);
      });
    });
  }

  /**
   * Check if item matches filter
   */
  private matchesFilter(item: GalleryItem, filter: GalleryFilter, value: unknown): boolean {
    const itemValue = this.getItemValue(item, filter.key);

    switch (filter.type) {
      case 'text':
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      case 'select':
        return itemValue === value;
      case 'boolean':
        return Boolean(itemValue) === Boolean(value);
      case 'date':
        // Date filtering logic
        return true;
      case 'range':
        // Range filtering logic
        return true;
      default:
        return true;
    }
  }

  /**
   * Get item value by key
   */
  private getItemValue(item: GalleryItem, key: string): unknown {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  }

  /**
   * Apply sorting
   */
  private applySorting(items: GalleryItem[]): GalleryItem[] {
    if (!this.activeSort) return items;

    return items.sort((a, b) => {
      const aValue = this.getItemValue(a, this.activeSort!.key);
      const bValue = this.getItemValue(b, this.activeSort!.key);

      // Convert to comparable types
      const aComparable = aValue != null ? String(aValue) : '';
      const bComparable = bValue != null ? String(bValue) : '';

      let comparison = 0;
      if (aComparable < bComparable) comparison = -1;
      if (aComparable > bComparable) comparison = 1;

      return this.activeSort!.direction === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Handle item click
   */
  onItemClick(item: GalleryItem): void {
    if (!this.mergedConfig.clickable) return;

    if (this.mergedConfig.lightbox) {
      this.openLightbox(item);
    } else {
      this.itemClick.emit(item);
    }
  }

  /**
   * Handle item select
   */
  onItemSelect(item: GalleryItem, selected: boolean): void {
    if (!this.mergedConfig.selectable) return;

    if (selected) {
      if (this.mergedConfig.multiSelect) {
        this.selectedItems.push(item);
      } else {
        this.selectedItems = [item];
      }
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    }

    this.itemSelect.emit([...this.selectedItems]);
  }

  /**
   * Handle action click
   */
  onActionClick(action: GalleryAction, item: GalleryItem): void {
    if (action.disabled) return;
    action.onClick(item);
    this.itemAction.emit({ action, item });
  }

  /**
   * Handle search change
   */
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.processItems();
  }

  /**
   * Handle filter change
   */
  onFilterChange(key: string, value: unknown): void {
    this.activeFilters[key] = value;
    this.processItems();
    this.filterChange.emit({ ...this.activeFilters });
  }

  /**
   * Handle sort change
   */
  onSortChange(sort: GallerySort): void {
    this.activeSort = sort;
    this.processItems();
    this.sortChange.emit(sort);
  }

  /**
   * Open lightbox
   */
  openLightbox(item: GalleryItem): void {
    this.lightboxItem = item;
    this.lightboxIndex = this.filteredItems.findIndex(i => i.id === item.id);
    this.isLightboxOpen = true;
    this.lightboxOpen.emit(item);
  }

  /**
   * Close lightbox
   */
  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.lightboxItem = null;
    this.lightboxIndex = 0;
    this.lightboxClose.emit();
  }

  /**
   * Navigate lightbox
   */
  navigateLightbox(direction: 'prev' | 'next'): void {
    if (!this.lightboxItem) return;

    const currentIndex = this.lightboxIndex;
    let newIndex = currentIndex;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : this.filteredItems.length - 1;
    } else {
      newIndex = currentIndex < this.filteredItems.length - 1 ? currentIndex + 1 : 0;
    }

    this.lightboxIndex = newIndex;
    this.lightboxItem = this.filteredItems[newIndex];
  }

  /**
   * Handle keyboard events
   */
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isLightboxOpen || !this.mergedConfig.lightboxKeyboard) return;

    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowLeft':
        this.navigateLightbox('prev');
        break;
      case 'ArrowRight':
        this.navigateLightbox('next');
        break;
    }
  }

  /**
   * Update gallery classes
   */
  private updateGalleryClasses(): void {
    const config = this.mergedConfig;
    this.galleryClasses = [
      'gallery',
      `gallery-${config.layout}`,
      `gallery-cols-${this.currentColumns}`,
      config.theme !== 'auto' ? `gallery-theme-${config.theme}` : '',
      this.isMobile ? 'gallery-mobile' : '',
      config.hoverEffect ? 'gallery-hover' : '',
      config.shadow ? 'gallery-shadow' : ''
    ].filter(Boolean);

    this.containerClasses = [
      'gallery-container',
      config.responsive ? 'gallery-responsive' : ''
    ].filter(Boolean);
  }

  /**
   * Get gallery classes
   */
  getGalleryClasses(): string[] {
    return this.galleryClasses;
  }

  /**
   * Get container classes
   */
  getContainerClasses(): string[] {
    return this.containerClasses;
  }

  /**
   * Get item classes
   */
  getItemClasses(item: GalleryItem): string[] {
    const classes = ['gallery-item'];

    if (item.isSelected) classes.push('selected');
    if (item.isFavorite) classes.push('favorite');
    if (item.isPrivate) classes.push('private');

    return classes;
  }

  /**
   * Get item styles
   */
  getItemStyles(): {[key: string]: string} {
    const config = this.mergedConfig;
    return {
      'border-radius': `${config.borderRadius}px`,
      'gap': `${config.gap}px`
    };
  }

  /**
   * Get grid styles
   */
  getGridStyles(): {[key: string]: string} {
    return {
      'grid-template-columns': `repeat(${this.currentColumns}, 1fr)`,
      'gap': `${this.mergedConfig.gap}px`
    };
  }

  /**
   * Check if item is selected
   */
  isItemSelected(item: GalleryItem): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  /**
   * Get visible items count
   */
  getVisibleItemsCount(): number {
    return this.filteredItems.length;
  }

  /**
   * Get selected items count
   */
  getSelectedItemsCount(): number {
    return this.selectedItems.length;
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedItems = [];
    this.itemSelect.emit([]);
  }

  /**
   * Select all items
   */
  selectAllItems(): void {
    this.selectedItems = [...this.filteredItems];
    this.itemSelect.emit([...this.selectedItems]);
  }

  /**
   * Track by function for ngFor
   */
  trackByItemId(index: number, item: GalleryItem): string {
    return item.id;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date
   */
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
