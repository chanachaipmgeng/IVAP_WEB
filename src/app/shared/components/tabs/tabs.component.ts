/**
 * Tabs Component
 *
 * Tab navigation component with support for icons, badges, and disabled states.
 * Provides tab selection events and keyboard navigation.
 *
 * @example
 * ```html
 * <app-tabs
 *   [tabs]="tabs"
 *   [activeTab]="activeTab"
 *   (activeTabChange)="onTabChange($event)">
 *   <div *ngIf="activeTab === 'tab1'">Tab 1 Content</div>
 * </app-tabs>
 * ```
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tab interface
 */
export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-gray-200 dark:border-gray-700" role="tablist" [attr.aria-label]="ariaLabel || 'Tabs'">
      <nav class="-mb-px flex space-x-8">
        <button
          *ngFor="let tab of tabs; trackBy: trackByTab"
          (click)="selectTab(tab.id)"
          [disabled]="tab.disabled"
          [class]="getTabClasses(tab.id)"
          [attr.aria-selected]="activeTab === tab.id"
          [attr.aria-controls]="getTabPanelId(tab.id)"
          [attr.aria-disabled]="tab.disabled"
          [attr.id]="getTabId(tab.id)"
          role="tab"
          [attr.tabindex]="tab.disabled ? -1 : (activeTab === tab.id ? 0 : -1)"
          class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <span *ngIf="tab.icon" class="mr-2" [attr.aria-hidden]="true">{{ tab.icon }}</span>
          {{ tab.label }}
          <span
            *ngIf="tab.badge"
            class="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
            [attr.aria-label]="'Badge: ' + tab.badge">
            {{ tab.badge }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6" role="tabpanel" [attr.id]="getActiveTabPanelId()" [attr.aria-labelledby]="getActiveTabId()">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class TabsComponent {
  /**
   * Tabs configuration
   */
  @Input() tabs!: Tab[];

  /**
   * Active tab ID
   */
  @Input() activeTab: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the tablist
   */
  @Input() ariaLabel?: string;

  /**
   * Active tab change event
   */
  @Output() activeTabChange = new EventEmitter<string>();

  /**
   * Select a tab
   */
  selectTab(tabId: string): void {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab && !tab.disabled && this.activeTab !== tabId) {
      this.activeTab = tabId;
      this.activeTabChange.emit(tabId);
    }
  }

  /**
   * Get tab CSS classes
   */
  getTabClasses(tabId: string): string {
    const base = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300';
    const active = 'border-primary-500 text-primary-600 dark:text-primary-400';
    return this.activeTab === tabId ? active : base;
  }

  /**
   * Get tab ID for accessibility
   */
  getTabId(tabId: string): string {
    return `tab-${tabId}`;
  }

  /**
   * Get tab panel ID for accessibility
   */
  getTabPanelId(tabId: string): string {
    return `tabpanel-${tabId}`;
  }

  /**
   * Get active tab ID
   */
  getActiveTabId(): string {
    return this.activeTab ? this.getTabId(this.activeTab) : '';
  }

  /**
   * Get active tab panel ID
   */
  getActiveTabPanelId(): string {
    return this.activeTab ? this.getTabPanelId(this.activeTab) : '';
  }

  /**
   * TrackBy function for tabs
   */
  trackByTab(index: number, tab: Tab): string {
    return tab.id || index.toString();
  }
}

