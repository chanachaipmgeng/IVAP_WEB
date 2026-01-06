/**
 * Timeline Component
 *
 * A timeline component for displaying chronological events.
 * Supports filtering, sorting, real-time updates, and CRUD operations.
 *
 * @example
 * ```html
 * <app-timeline
 *   [events]="timelineEvents"
 *   [config]="timelineConfig"
 *   [loading]="isLoading"
 *   (eventClick)="onEventClick($event)"
 *   (eventCreate)="onEventCreate($event)">
 * </app-timeline>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { ModalComponent } from '../modal/modal.component';

/**
 * Timeline event interface
 */
export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  icon?: string;
  color?: string;
  data?: Record<string, unknown>;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface TimelineConfig {
  orientation: 'vertical' | 'horizontal';
  showIcons: boolean;
  showTimestamps: boolean;
  showDescriptions: boolean;
  allowCollapse: boolean;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  enableRealTime?: boolean;
  realTimeInterval?: number; // milliseconds
  maxHeight?: string;
  itemHeight?: string;
  lineColor?: string;
  dotSize?: string;
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassButtonComponent,
    ModalComponent
  ],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Timeline events
   */
  @Input() events: TimelineEvent[] = [];

  /**
   * Timeline configuration
   */
  @Input() config: TimelineConfig = {
    orientation: 'vertical',
    showIcons: true,
    showTimestamps: true,
    showDescriptions: true,
    allowCollapse: false,
    allowCreate: false,
    allowEdit: false,
    allowDelete: false,
    enableRealTime: false,
    realTimeInterval: 5000,
    maxHeight: '400px',
    itemHeight: '60px',
    lineColor: 'var(--color-primary-500)',
    dotSize: '12px'
  };

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Empty message
   */
  @Input() emptyMessage: string = 'ไม่มีข้อมูล Timeline';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the timeline
   */
  @Input() ariaLabel?: string;

  /**
   * Event click event
   */
  @Output() eventClick = new EventEmitter<TimelineEvent>();

  /**
   * Event toggle event
   */
  @Output() eventToggle = new EventEmitter<TimelineEvent>();

  /**
   * Load more event
   */
  @Output() loadMore = new EventEmitter<void>();

  /**
   * Event create event
   */
  @Output() eventCreate = new EventEmitter<Partial<TimelineEvent>>();

  /**
   * Event update event
   */
  @Output() eventUpdate = new EventEmitter<TimelineEvent>();

  /**
   * Event delete event
   */
  @Output() eventDelete = new EventEmitter<string>();

  /**
   * Refresh event
   */
  @Output() refresh = new EventEmitter<void>();

  /**
   * Component state
   */
  isCollapsed = false;
  visibleEvents: TimelineEvent[] = [];
  filteredEvents: TimelineEvent[] = [];
  searchTerm = '';
  selectedType: string = 'all';
  sortOrder: 'asc' | 'desc' = 'desc';

  /**
   * Modal state
   */
  showEventModal = false;
  editingEvent: TimelineEvent | null = null;
  eventForm: Partial<TimelineEvent> = {
    title: '',
    description: '',
    type: 'info',
    timestamp: new Date()
  };

  /**
   * Real-time update interval ID
   */
  private realTimeIntervalId: ReturnType<typeof setInterval> | null = null;

  // Available event types
  eventTypes = [
    { value: 'all', label: 'ทั้งหมด', color: 'var(--color-gray-500)' },
    { value: 'success', label: 'สำเร็จ', color: 'var(--color-success-500)' },
    { value: 'warning', label: 'คำเตือน', color: 'var(--color-warning-500)' },
    { value: 'error', label: 'ข้อผิดพลาด', color: 'var(--color-error-500)' },
    { value: 'info', label: 'ข้อมูล', color: 'var(--color-primary-500)' },
    { value: 'primary', label: 'หลัก', color: 'var(--color-secondary-500)' },
    { value: 'secondary', label: 'รอง', color: 'var(--color-gray-500)' }
  ];

  ngOnInit(): void {
    this.processEvents();
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.stopRealTimeUpdates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] || changes['config']) {
      this.processEvents();
    }
    if (changes['config']) {
      // Restart real-time updates if config changed
      this.stopRealTimeUpdates();
      this.startRealTimeUpdates();
    }
  }

  /**
   * Process events for display
   */
  private processEvents(): void {
    this.filteredEvents = [...this.events];
    this.applyFilters();
    this.sortEvents();
    this.updateVisibleEvents();
  }

  /**
   * Apply filters to events
   */
  private applyFilters(): void {
    let filtered = [...this.events];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term)
      );
    }

    // Filter by type
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === this.selectedType);
    }

    this.filteredEvents = filtered;
  }

  /**
   * Sort events by timestamp
   */
  private sortEvents(): void {
    this.filteredEvents.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return this.sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }

  /**
   * Update visible events based on collapse state
   */
  private updateVisibleEvents(): void {
    if (this.isCollapsed && this.config.allowCollapse) {
      this.visibleEvents = this.filteredEvents.slice(0, 5);
    } else {
      this.visibleEvents = this.filteredEvents;
    }
  }

  /**
   * Handle event click
   */
  onEventClick(event: TimelineEvent): void {
    this.eventClick.emit(event);
  }

  /**
   * Handle event toggle (for expandable events)
   */
  onEventToggle(event: TimelineEvent): void {
    event.isActive = !event.isActive;
    this.eventToggle.emit(event);
  }

  /**
   * Toggle collapse state
   */
  toggleCollapse(): void {
    if (this.config.allowCollapse) {
      this.isCollapsed = !this.isCollapsed;
      this.updateVisibleEvents();
    }
  }

  /**
   * Handle search input
   */
  onSearchChange(): void {
    this.applyFilters();
    this.updateVisibleEvents();
  }

  /**
   * Handle type filter change
   */
  onTypeChange(): void {
    this.applyFilters();
    this.updateVisibleEvents();
  }

  /**
   * Toggle sort order
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortEvents();
    this.updateVisibleEvents();
  }

  /**
   * Load more events
   */
  onLoadMore(): void {
    this.loadMore.emit();
  }

  /**
   * Get event type color
   */
  getEventTypeColor(type: string): string {
    const eventType = this.eventTypes.find(t => t.value === type);
    return eventType?.color || '#6B7280';
  }

  /**
   * Get event icon
   */
  getEventIcon(event: TimelineEvent): string {
    if (event.icon) {
      return event.icon;
    }

    switch (event.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times-circle';
      case 'info':
        return 'fas fa-info-circle';
      case 'primary':
        return 'fas fa-star';
      case 'secondary':
        return 'fas fa-circle';
      default:
        return 'fas fa-circle';
    }
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'เมื่อสักครู่';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} นาทีที่แล้ว`;
    } else if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    } else if (diffDays < 7) {
      return `${diffDays} วันที่แล้ว`;
    } else {
      return eventTime.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Check if there are more events to show
   */
  hasMoreEvents(): boolean {
    return this.isCollapsed && this.filteredEvents.length > 5;
  }

  /**
   * Get remaining events count
   */
  getRemainingEventsCount(): number {
    return Math.max(0, this.filteredEvents.length - 5);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchChange();
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = 'all';
    this.sortOrder = 'desc';
    this.isCollapsed = false;
    this.processEvents();
  }

  /**
   * Track by function for ngFor
   */
  trackByEventId(index: number, event: TimelineEvent): string {
    return event.id;
  }

  /**
   * Get event type label
   */
  getEventTypeLabel(type: string): string {
    const eventType = this.eventTypes.find(t => t.value === type);
    return eventType?.label || type;
  }

  /**
   * Get timeline item CSS classes
   */
  getTimelineItemClasses(event: TimelineEvent): { [key: string]: boolean } {
    return {
      'timeline-item-active': event.isActive || false,
      'timeline-item-completed': event.isCompleted || false,
      [`timeline-item-${event.type}`]: true
    };
  }

  // ==================== Create/Edit Events ====================

  /**
   * Open create event modal
   */
  openCreateModal(): void {
    this.editingEvent = null;
    this.eventForm = {
      title: '',
      description: '',
      type: 'info',
      timestamp: new Date(),
      icon: '',
      color: ''
    };
    this.showEventModal = true;
  }

  /**
   * Open edit event modal
   */
  openEditModal(event: TimelineEvent): void {
    this.editingEvent = event;
    this.eventForm = {
      title: event.title,
      description: event.description || '',
      type: event.type,
      timestamp: event.timestamp,
      icon: event.icon,
      color: event.color,
      data: event.data
    };
    this.showEventModal = true;
  }

  /**
   * Close event modal
   */
  closeEventModal(): void {
    this.showEventModal = false;
    this.editingEvent = null;
    this.eventForm = {
      title: '',
      description: '',
      type: 'info',
      timestamp: new Date()
    };
  }

  /**
   * Save event (create or update)
   */
  saveEvent(): void {
    if (!this.eventForm.title?.trim()) {
      alert('กรุณากรอกชื่อเหตุการณ์');
      return;
    }

    const eventData: Partial<TimelineEvent> = {
      title: this.eventForm.title.trim(),
      description: this.eventForm.description?.trim(),
      type: this.eventForm.type || 'info',
      timestamp: this.eventForm.timestamp || new Date(),
      icon: this.eventForm.icon,
      color: this.eventForm.color
    };

    if (this.editingEvent) {
      // Update existing event
      const updatedEvent: TimelineEvent = {
        ...this.editingEvent,
        ...eventData
      };
      this.eventUpdate.emit(updatedEvent);
    } else {
      // Create new event
      this.eventCreate.emit(eventData);
    }

    this.closeEventModal();
  }

  /**
   * Delete event
   */
  deleteEvent(eventId: string): void {
    if (confirm('คุณต้องการลบเหตุการณ์นี้หรือไม่?')) {
      this.eventDelete.emit(eventId);
    }
  }

  /**
   * Handle timestamp change from datetime-local input
   */
  onTimestampChange(value: string): void {
    if (value) {
      this.eventForm.timestamp = new Date(value);
    }
  }

  /**
   * Start real-time updates
   */
  private startRealTimeUpdates(): void {
    if (this.config.enableRealTime && this.config.realTimeInterval && this.config.realTimeInterval > 0) {
      this.realTimeIntervalId = setInterval(() => {
        this.refresh.emit();
      }, this.config.realTimeInterval);
    }
  }

  /**
   * Stop real-time updates
   */
  private stopRealTimeUpdates(): void {
    if (this.realTimeIntervalId) {
      clearInterval(this.realTimeIntervalId);
      this.realTimeIntervalId = null;
    }
  }
}
