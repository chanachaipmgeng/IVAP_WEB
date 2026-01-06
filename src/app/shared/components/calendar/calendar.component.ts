/**
 * Calendar Component
 *
 * A calendar component using angular-calendar for displaying and managing calendar events.
 * Supports month, week, and day views with event management, drag-and-drop, and navigation.
 *
 * @example
 * ```html
 * <app-calendar
 *   [view]="CalendarView.Month"
 *   [viewDate]="selectedDate"
 *   [events]="calendarEvents"
 *   (eventClicked)="onEventClick($event)"
 *   (dayClicked)="onDayClick($event)">
 * </app-calendar>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  CalendarModule,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarDateFormatter,
  CalendarEventTitleFormatter,
  CalendarUtils,
  DateAdapter,
  CalendarEventTimesChangedEventType
} from 'angular-calendar';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  format
} from 'date-fns';
import { GlassButtonComponent } from '../glass-button/glass-button.component';
import { CalendarService, CalendarEventMeta } from '../../../core/services/calendar.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    GlassButtonComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent extends BaseComponent implements OnInit {
  /**
   * Calendar view type
   */
  @Input() view: CalendarView = CalendarView.Month;

  /**
   * Current view date
   */
  @Input() viewDate: Date = new Date();

  /**
   * Calendar events
   */
  @Input() events: CalendarEvent<CalendarEventMeta>[] = [];

  /**
   * Active day is open
   */
  @Input() activeDayIsOpen: boolean = true;

  /**
   * Show toolbar
   */
  @Input() showToolbar: boolean = true;

  /**
   * Show weekends
   */
  @Input() showWeekends: boolean = true;

  /**
   * Day start hour
   */
  @Input() dayStartHour: number = 0;

  /**
   * Day end hour
   */
  @Input() dayEndHour: number = 23;

  /**
   * Hour segments
   */
  @Input() hourSegments: number = 2;

  /**
   * Week starts on
   */
  @Input() weekStartsOn: number = 1;

  /**
   * Exclude days
   */
  @Input() excludeDays: number[] = [];

  /**
   * Weekend days
   */
  @Input() weekendDays: number[] = [0, 6];

  /**
   * Event actions
   */
  @Input() eventActions: CalendarEventAction[] = [];

  /**
   * Refresh subject
   */
  @Input() refresh: Subject<any> = new Subject();

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  @Output() viewChange = new EventEmitter<CalendarView>();
  @Output() viewDateChange = new EventEmitter<Date>();
  @Output() eventClicked = new EventEmitter<CalendarEvent<CalendarEventMeta>>();
  @Output() dayClicked = new EventEmitter<{ date: Date; events: CalendarEvent<CalendarEventMeta>[] }>();
  @Output() eventTimesChanged = new EventEmitter<CalendarEventTimesChangedEvent>();
  @Output() eventDropped = new EventEmitter<CalendarEvent<CalendarEventMeta>>();
  @Output() refreshClicked = new EventEmitter<void>();

  CalendarView = CalendarView; // Expose CalendarView enum to template
  CalendarEventTimesChangedEventType = CalendarEventTimesChangedEventType;

  constructor(private calendarService: CalendarService) {
    super();
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Subscribe to refresh events
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.refresh,
      () => {
        // Handle refresh if needed
      }
    );
  }

  /**
   * Handle view change
   */
  onViewChange(view: CalendarView): void {
    this.view = view;
    this.viewChange.emit(view);
  }

  /**
   * Handle view date change
   */
  onViewDateChange(date: Date): void {
    this.viewDate = date;
    this.viewDateChange.emit(date);
  }

  /**
   * Handle event clicked
   */
  onEventClicked(event: any): void {
    if (event && typeof event === 'object' && 'event' in event) {
      this.eventClicked.emit(event.event);
    } else {
      this.eventClicked.emit(event);
    }
  }

  /**
   * Handle day clicked
   */
  onDayClicked(event: any): void {
    if (event && typeof event === 'object' && 'day' in event) {
      this.dayClicked.emit({ date: event.day.date, events: event.day.events });
    } else {
      // Fallback if event is CalendarEvent or other object
      const date = event.start || event.date || new Date();
      const events = event.events || (event.start ? [event] : []);
      this.dayClicked.emit({ date, events });
    }
  }

  /**
   * Handle event times changed
   */
  onEventTimesChanged(event: any): void {
    this.eventTimesChanged.emit(event);
  }

  /**
   * Handle event dropped
   */
  onEventDropped(event: any): void {
    if (event && typeof event === 'object' && 'event' in event) {
      this.eventDropped.emit(event.event);
    } else {
      this.eventDropped.emit(event);
    }
  }

  /**
   * Handle refresh clicked
   */
  onRefreshClicked(): void {
    this.refreshClicked.emit();
  }

  /**
   * Navigate to previous view
   */
  previousView(): void {
    const newDate = this.getPreviousViewDate();
    this.onViewDateChange(newDate);
  }

  /**
   * Navigate to next view
   */
  nextView(): void {
    const newDate = this.getNextViewDate();
    this.onViewDateChange(newDate);
  }

  /**
   * Navigate to today
   */
  today(): void {
    this.onViewDateChange(new Date());
  }

  /**
   * Set view mode
   */
  setView(view: CalendarView): void {
    this.onViewChange(view);
  }

  /**
   * Close open month view day
   */
  closeOpenMonthViewDay(): void {
    this.activeDayIsOpen = false;
  }

  /**
   * TrackBy function for calendar events
   */
  trackByEventId(index: number, event: CalendarEvent<CalendarEventMeta>): string | number {
    return event.id || index;
  }

  /**
   * Get previous view date
   */
  private getPreviousViewDate(): Date {
    switch (this.view) {
      case CalendarView.Month:
        return subDays(this.viewDate, 1);
      case CalendarView.Week:
        return subDays(this.viewDate, 7);
      case CalendarView.Day:
        return subDays(this.viewDate, 1);
      default:
        return this.viewDate;
    }
  }

  /**
   * Get next view date
   */
  private getNextViewDate(): Date {
    switch (this.view) {
      case CalendarView.Month:
        return addDays(this.viewDate, 1);
      case CalendarView.Week:
        return addDays(this.viewDate, 7);
      case CalendarView.Day:
        return addDays(this.viewDate, 1);
      default:
        return this.viewDate;
    }
  }

  // Utility methods for template
  isSameDay = isSameDay;
  isSameMonth = isSameMonth;
  format = format;
}
