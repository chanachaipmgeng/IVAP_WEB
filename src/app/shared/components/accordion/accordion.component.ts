/**
 * Accordion Component
 *
 * A collapsible content component that displays items in an accordion format.
 * Supports multiple open items, animations, and various visual variants.
 *
 * @example
 * ```html
 * <app-accordion
 *   [items]="accordionItems"
 *   [config]="{ allowMultiple: true, animation: true }"
 *   [loading]="isLoading"
 *   (itemToggle)="onItemToggle($event)"
 *   (itemClick)="onItemClick($event)">
 * </app-accordion>
 * ```
 */
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  isOpen: boolean;
  disabled?: boolean;
  icon?: string;
  badge?: string;
  badgeColor?: string;
}

export interface AccordionConfig {
  allowMultiple: boolean;
  animation: boolean;
  animationDuration: number;
  iconPosition: 'left' | 'right';
  showIcons: boolean;
  variant: 'default' | 'bordered' | 'flush' | 'minimal';
  size: 'sm' | 'md' | 'lg';
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})
export class AccordionComponent implements OnInit, OnChanges {
  /**
   * Accordion items to display
   * @default []
   */
  @Input() items: AccordionItem[] = [];

  /**
   * Configuration object for accordion behavior
   * @default {}
   */
  @Input() config: Partial<AccordionConfig> = {};

  /**
   * Whether the component is in loading state
   * @default false
   */
  @Input() loading: boolean = false;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the accordion
   */
  @Input() ariaLabel?: string;

  /**
   * Emitted when an item is toggled (opened/closed)
   */
  @Output() itemToggle = new EventEmitter<AccordionItem>();

  /**
   * Emitted when an item is clicked
   */
  @Output() itemClick = new EventEmitter<AccordionItem>();

  // Default configuration
  defaultConfig: AccordionConfig = {
    allowMultiple: false,
    animation: true,
    animationDuration: 300,
    iconPosition: 'right',
    showIcons: true,
    variant: 'default',
    size: 'md'
  };

  // Component state
  openItems: Set<string> = new Set();

  ngOnInit(): void {
    this.initializeOpenItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.initializeOpenItems();
    }
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): AccordionConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Initialize open items based on items configuration
   */
  private initializeOpenItems(): void {
    this.openItems.clear();
    this.items.forEach(item => {
      if (item.isOpen) {
        this.openItems.add(item.id);
      }
    });
  }

  /**
   * Toggle accordion item
   */
  toggleItem(item: AccordionItem): void {
    if (item.disabled) {
      return;
    }

    const isCurrentlyOpen = this.isItemOpen(item.id);

    if (isCurrentlyOpen) {
      this.closeItem(item.id);
    } else {
      this.openItem(item.id);
    }

    // Update item state
    item.isOpen = !isCurrentlyOpen;
    this.itemToggle.emit(item);
  }

  /**
   * Open specific item
   */
  openItem(itemId: string): void {
    if (!this.mergedConfig.allowMultiple) {
      this.openItems.clear();
    }
    this.openItems.add(itemId);
  }

  /**
   * Close specific item
   */
  closeItem(itemId: string): void {
    this.openItems.delete(itemId);
  }

  /**
   * Check if item is open
   */
  isItemOpen(itemId: string): boolean {
    return this.openItems.has(itemId);
  }

  /**
   * Handle item click
   */
  onItemClick(item: AccordionItem): void {
    this.itemClick.emit(item);
  }

  /**
   * Get accordion classes
   */
  getAccordionClasses(): string[] {
    const classes = ['accordion'];
    const config = this.mergedConfig;

    // Variant classes
    classes.push(`accordion-${config.variant}`);

    // Size classes
    classes.push(`accordion-${config.size}`);

    return classes;
  }

  /**
   * Get item classes
   */
  getItemClasses(item: AccordionItem): string[] {
    const classes = ['accordion-item'];
    const config = this.mergedConfig;

    // State classes
    if (this.isItemOpen(item.id)) {
      classes.push('accordion-item-open');
    }

    if (item.disabled) {
      classes.push('accordion-item-disabled');
    }

    // Variant classes
    classes.push(`accordion-item-${config.variant}`);

    return classes;
  }

  /**
   * Get header classes
   */
  getHeaderClasses(item: AccordionItem): string[] {
    const classes = ['accordion-header'];
    const config = this.mergedConfig;

    // State classes
    if (this.isItemOpen(item.id)) {
      classes.push('accordion-header-open');
    }

    if (item.disabled) {
      classes.push('accordion-header-disabled');
    }

    // Icon position classes
    classes.push(`accordion-header-${config.iconPosition}`);

    return classes;
  }

  /**
   * Get content classes
   */
  getContentClasses(item: AccordionItem): string[] {
    const classes = ['accordion-content'];
    const config = this.mergedConfig;

    // State classes
    if (this.isItemOpen(item.id)) {
      classes.push('accordion-content-open');
    }

    // Animation classes
    if (config.animation) {
      classes.push('accordion-content-animated');
    }

    return classes;
  }

  /**
   * Get icon classes
   */
  getIconClasses(item: AccordionItem): string[] {
    const classes = ['accordion-icon'];
    const config = this.mergedConfig;

    // State classes
    if (this.isItemOpen(item.id)) {
      classes.push('accordion-icon-open');
    }

    if (item.disabled) {
      classes.push('accordion-icon-disabled');
    }

    return classes;
  }

  /**
   * Get badge classes
   */
  getBadgeClasses(item: AccordionItem): string[] {
    const classes = ['accordion-badge'];

    if (item.badgeColor) {
      classes.push(`accordion-badge-${item.badgeColor}`);
    }

    return classes;
  }

  /**
   * Get content styles
   */
  getContentStyles(item: AccordionItem): { [key: string]: string } {
    const config = this.mergedConfig;
    const styles: { [key: string]: string } = {};

    if (config.animation) {
      styles['transitionDuration'] = `${config.animationDuration}ms`;
    }

    return styles;
  }

  /**
   * Get all open items
   */
  getOpenItems(): AccordionItem[] {
    return this.items.filter(item => this.isItemOpen(item.id));
  }

  /**
   * Get all closed items
   */
  getClosedItems(): AccordionItem[] {
    return this.items.filter(item => !this.isItemOpen(item.id));
  }

  /**
   * Open all items
   */
  openAll(): void {
    this.items.forEach(item => {
      if (!item.disabled) {
        this.openItems.add(item.id);
        item.isOpen = true;
      }
    });
  }

  /**
   * Close all items
   */
  closeAll(): void {
    this.openItems.clear();
    this.items.forEach(item => {
      item.isOpen = false;
    });
  }

  /**
   * Toggle all items
   */
  toggleAll(): void {
    const hasOpenItems = this.openItems.size > 0;
    if (hasOpenItems) {
      this.closeAll();
    } else {
      this.openAll();
    }
  }

  /**
   * Track by function for ngFor
   */
  trackByItemId(index: number, item: AccordionItem): string {
    return item.id;
  }
}
