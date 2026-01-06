/**
 * Calendar Demo Component
 *
 * Demo component showcasing calendar component features including event management, views, and date navigation.
 * Demonstrates calendar event creation, editing, and display in different views (month, week, day).
 *
 * @example
 * ```html
 * <app-calendar-demo></app-calendar-demo>
 * ```
 */

import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { CalendarView, CalendarEvent, CalendarEventTimesChangedEvent, CalendarEventTimesChangedEventType } from 'angular-calendar';
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
  format
} from 'date-fns';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { CalendarService, CalendarEventMeta } from '../../../core/services/calendar.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-calendar-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    CalendarComponent,
  ],
  templateUrl: './calendar-demo.component.html',
  styleUrl: './calendar-demo.component.scss'
})
export class CalendarDemoComponent extends BaseComponent implements OnInit {
  // Calendar State
  view = signal<CalendarView>(CalendarView.Month);
  viewDate = signal<Date>(new Date());
  activeDayIsOpen = signal<boolean>(true);
  refresh = new Subject<void>();

  // Event Data
  events = signal<CalendarEvent<CalendarEventMeta>[]>([]);
  selectedEvent = signal<CalendarEvent<CalendarEventMeta> | null>(null);
  showEventForm = signal<boolean>(false);

  // UI State
  activeTab = signal<'calendar' | 'events' | 'stats' | 'settings'>('calendar');
  tabs: ('calendar' | 'events' | 'stats' | 'settings')[] = ['calendar', 'events', 'stats', 'settings'];

  // Expose CalendarView to template
  CalendarView = CalendarView;

  // Calendar Settings
  showWeekends = signal<boolean>(true);
  dayStartHour = signal<number>(6);
  dayEndHour = signal<number>(22);
  hourSegments = signal<number>(2);
  weekStartsOn = signal<number>(1);
  excludeDays = signal<number[]>([]);
  weekendDays = signal<number[]>([0, 6]);

  // Statistics
  totalEvents = computed(() => this.events().length);
  upcomingEvents = computed(() => this.events().filter(e => e.start > new Date()).length);
  completedEvents = computed(() => this.events().filter(e => e.meta?.status === 'completed').length);
  cancelledEvents = computed(() => this.events().filter(e => e.meta?.status === 'cancelled').length);

  // Event Actions
  eventActions = [
    {
      label: '<i class="fas fa-edit"></i>',
      onClick: ({ event }: { event: CalendarEvent<CalendarEventMeta> }): void => {
        this.editEvent(event);
      }
    },
    {
      label: '<i class="fas fa-trash"></i>',
      onClick: ({ event }: { event: CalendarEvent<CalendarEventMeta> }): void => {
        this.deleteEvent(event);
      }
    }
  ];

  constructor(
    private calendarService: CalendarService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const events = this.calendarService.events();
      this.events.set(events);
    });
  }

  selectTab(tab: 'calendar' | 'events' | 'stats' | 'settings'): void {
    this.activeTab.set(tab);
  }

  // Calendar Event Handlers
  onViewChange(view: CalendarView): void {
    this.view.set(view);
  }

  onViewDateChange(date: Date): void {
    this.viewDate.set(date);
  }

  onEventClicked(event: CalendarEvent<CalendarEventMeta>): void {
    this.selectedEvent.set({ ...event });
    this.showEventForm.set(true);
  }

  onDayClicked({ date, events }: { date: Date; events: CalendarEvent<CalendarEventMeta>[] }): void {
    if (isSameMonth(date, this.viewDate())) {
      if (
        (isSameDay(this.viewDate(), date) && this.activeDayIsOpen()) ||
        events.length === 0
      ) {
        this.activeDayIsOpen.set(false);
      } else {
        this.activeDayIsOpen.set(true);
      }
      this.viewDate.set(date);
    }
  }

  onEventTimesChanged(event: CalendarEventTimesChangedEvent): void {
    this.calendarService.eventTimesChanged(event);
    this.refresh.next();
  }

  onEventDropped(event: CalendarEvent<CalendarEventMeta>): void {
    this.calendarService.eventDropped(event);
    this.refresh.next();
  }

  onRefreshClicked(): void {
    this.refresh.next();
  }

  // Event Management
  addEvent(): void {
    this.selectedEvent.set({
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      title: 'New Event',
      color: { primary: '#ad2121', secondary: '#FAE3E3' },
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      meta: {
        id: '',
        title: 'New Event',
        description: '',
        location: '',
        priority: 'medium',
        category: 'General',
        allDay: false,
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    this.showEventForm.set(true);
  }

  saveEvent(): void {
    const event = this.selectedEvent();
    if (event) {
      if (event.meta?.id) {
        this.calendarService.updateEvent(event);
      } else {
        this.calendarService.addEvent(event);
      }
      this.showEventForm.set(false);
      this.selectedEvent.set(null);
      this.refresh.next();
    }
  }

  deleteEvent(event: CalendarEvent<CalendarEventMeta>): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.calendarService.deleteEvent(event);
      this.refresh.next();
    }
  }

  editEvent(event: CalendarEvent<CalendarEventMeta>): void {
    this.selectedEvent.set({ ...event });
    this.showEventForm.set(true);
  }

  cancelEdit(): void {
    this.showEventForm.set(false);
    this.selectedEvent.set(null);
  }

  // Export/Import
  exportEvents(format: 'json' | 'csv' | 'ical'): void {
    const data = this.calendarService.exportEvents(format);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events.${format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  importEvents(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const format = file.name.split('.').pop() as 'json' | 'csv' | 'ical';
        this.calendarService.importEvents(e.target.result, format);
        this.refresh.next();
      };
      reader.readAsText(file);
    }
  }

  // Utility Functions
  formatEventDate(event: CalendarEvent<CalendarEventMeta>): string {
    if (event.allDay) {
      return format(event.start, 'MMM d, yyyy');
    } else {
      return `${format(event.start, 'MMM d, yyyy h:mm a')} - ${format(event.end || event.start, 'h:mm a')}`;
    }
  }

  getEventColor(event: CalendarEvent<CalendarEventMeta>): string {
    switch (event.meta?.priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-orange-500/20 text-orange-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  getEventIcon(event: CalendarEvent<CalendarEventMeta>): string {
    switch (event.meta?.category) {
      case 'Meeting': return 'fas fa-handshake';
      case 'Task': return 'fas fa-tasks';
      case 'Personal': return 'fas fa-user';
      case 'Holiday': return 'fas fa-umbrella-beach';
      default: return 'fas fa-calendar-alt';
    }
  }

  getEventsByStatus(status: string): number {
    return this.events().filter(e => e.meta?.status === status).length;
  }

  // Event Form Helpers
  updateEventTime(type: 'start' | 'end', time: string): void {
    const event = this.selectedEvent();
    if (!event) return;

    const [hours, minutes] = time.split(':').map(Number);
    const date = type === 'start' ? event.start : event.end;

    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);

      if (type === 'start') {
        event.start = newDate;
      } else {
        event.end = newDate;
      }
    }
  }

  updateEventDate(type: 'start' | 'end', date: string): void {
    const event = this.selectedEvent();
    if (!event) return;

    const newDate = new Date(date);

    if (type === 'start') {
      event.start = newDate;
    } else {
      event.end = newDate;
    }
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
