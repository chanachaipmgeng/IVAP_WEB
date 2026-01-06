import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';
import { startOfDay, addHours, addDays } from 'date-fns';

export interface CalendarEventMeta {
  id: string;
  title: string;
  description?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  allDay?: boolean;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  // ✅ Signals for reactive state
  private _events = signal<CalendarEvent<CalendarEventMeta>[]>([]);

  // ✅ Readonly signals for public access
  public readonly events = this._events.asReadonly();

  // ✅ Computed signals for derived state
  public readonly eventsCount = computed(() => this._events().length);
  public readonly upcomingEventsCount = computed(() => {
    const now = new Date();
    return this._events().filter(e => e.start && e.start > now).length;
  });

  constructor() {
    this.loadSampleEvents();
  }

  // Events Management
  getEvents(): Observable<CalendarEvent<CalendarEventMeta>[]> {
    // Return observable for backward compatibility
    return new Observable(observer => {
      observer.next(this._events());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  getCurrentEvents(): CalendarEvent<CalendarEventMeta>[] {
    return this._events();
  }

  addEvent(event: CalendarEvent<CalendarEventMeta>): void {
    const newEvent: CalendarEvent<CalendarEventMeta> = {
      ...event,
      meta: {
        id: this.generateId(),
        title: event.title,
        description: event.meta?.description || '',
        location: event.meta?.location || '',
        priority: event.meta?.priority || 'medium',
        category: event.meta?.category || 'General',
        allDay: event.meta?.allDay || false,
        status: event.meta?.status || 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    this._events.update(events => [...events, newEvent]);
  }

  updateEvent(event: CalendarEvent<CalendarEventMeta>): void {
    this._events.update(events => {
      const updatedEvents: CalendarEvent<CalendarEventMeta>[] = [];
      for (const e of events) {
        if (e.meta?.id === event.meta?.id) {
          updatedEvents.push({
            ...event,
            meta: {
              id: event.meta?.id || this.generateId(),
              title: event.meta?.title || event.title || 'Untitled Event',
              description: event.meta?.description || '',
              location: event.meta?.location || '',
              priority: event.meta?.priority || 'medium',
              category: event.meta?.category || 'General',
              allDay: event.meta?.allDay || false,
              status: event.meta?.status || 'scheduled',
              createdAt: event.meta?.createdAt || new Date(),
              updatedAt: new Date()
            }
          });
        } else {
          updatedEvents.push(e);
        }
      }
      return updatedEvents;
    });
  }

  deleteEvent(event: CalendarEvent<CalendarEventMeta>): void {
    this._events.update(events => events.filter(e => e.meta?.id !== event.meta?.id));
  }

  // Event Times Changed (for drag and drop)
  eventTimesChanged(event: any): void {
    // Event times changed - implement custom behavior if needed
  }

  // Event Dropped
  eventDropped(event: CalendarEvent<CalendarEventMeta>): void {
    // Event dropped - implement custom behavior if needed
  }

  // Export Events
  exportEvents(format: 'json' | 'csv' | 'ical'): string {
    const events = this._events();

    switch (format) {
      case 'json':
        return JSON.stringify(events, null, 2);
      case 'csv':
        return this.exportToCSV(events);
      case 'ical':
        return this.exportToICal(events);
      default:
        return '';
    }
  }

  // Import Events
  importEvents(data: string, format: 'json' | 'csv' | 'ical'): void {
    try {
      let importedEvents: CalendarEvent<CalendarEventMeta>[] = [];

      switch (format) {
        case 'json':
          importedEvents = JSON.parse(data);
          break;
        case 'csv':
          importedEvents = this.importFromCSV(data);
          break;
        case 'ical':
          importedEvents = this.importFromICal(data);
          break;
      }

      this._events.update(events => [...events, ...importedEvents]);
    } catch (error) {
      console.error('Error importing events:', error);
    }
  }

  // Private Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private loadSampleEvents(): void {
    const sampleEvents: CalendarEvent<CalendarEventMeta>[] = [
      {
        start: startOfDay(new Date()),
        title: 'Team Meeting',
        color: { primary: '#ad2121', secondary: '#fae3e3' },
        meta: {
          id: this.generateId(),
          title: 'Team Meeting',
          description: 'Weekly team standup meeting',
          location: 'Conference Room A',
          priority: 'high',
          category: 'Meeting',
          allDay: false,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        start: addHours(startOfDay(new Date()), 2),
        end: addHours(startOfDay(new Date()), 3),
        title: 'Client Presentation',
        color: { primary: '#1e90ff', secondary: '#d1e8ff' },
        meta: {
          id: this.generateId(),
          title: 'Client Presentation',
          description: 'Present quarterly results to client',
          location: 'Client Office',
          priority: 'high',
          category: 'Presentation',
          allDay: false,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      {
        start: addDays(startOfDay(new Date()), 1),
        title: 'Project Deadline',
        color: { primary: '#e3bc08', secondary: '#fdf1ba' },
        meta: {
          id: this.generateId(),
          title: 'Project Deadline',
          description: 'Final submission deadline for Q4 project',
          location: 'Office',
          priority: 'high',
          category: 'Deadline',
          allDay: true,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    ];

    this._events.set(sampleEvents);
  }

  private exportToCSV(events: CalendarEvent<CalendarEventMeta>[]): string {
    const headers = ['Title', 'Start', 'End', 'Description', 'Location', 'Priority', 'Category', 'Status'];
    const rows = events.map(event => [
      event.title,
      event.start.toISOString(),
      event.end?.toISOString() || '',
      event.meta?.description || '',
      event.meta?.location || '',
      event.meta?.priority || '',
      event.meta?.category || '',
      event.meta?.status || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToICal(events: CalendarEvent<CalendarEventMeta>[]): string {
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Calendar Service//EN\n';

    events.forEach(event => {
      ical += 'BEGIN:VEVENT\n';
      ical += `UID:${event.meta?.id}\n`;
      ical += `DTSTART:${this.formatDateForICal(event.start)}\n`;
      if (event.end) {
        ical += `DTEND:${this.formatDateForICal(event.end)}\n`;
      }
      ical += `SUMMARY:${event.title}\n`;
      if (event.meta?.description) {
        ical += `DESCRIPTION:${event.meta.description}\n`;
      }
      if (event.meta?.location) {
        ical += `LOCATION:${event.meta.location}\n`;
      }
      ical += 'END:VEVENT\n';
    });

    ical += 'END:VCALENDAR\n';
    return ical;
  }

  private formatDateForICal(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private importFromCSV(data: string): CalendarEvent<CalendarEventMeta>[] {
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    const events: CalendarEvent<CalendarEventMeta>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 2) {
        const event: CalendarEvent<CalendarEventMeta> = {
          start: new Date(values[1]),
          title: values[0],
          meta: {
            id: this.generateId(),
            title: values[0],
            description: values[3] || '',
            location: values[4] || '',
            priority: values[5] as any || 'medium',
            category: values[6] || '',
            status: values[7] as any || 'scheduled',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };

        if (values[2]) {
          event.end = new Date(values[2]);
        }

        events.push(event);
      }
    }

    return events;
  }

  private importFromICal(data: string): CalendarEvent<CalendarEventMeta>[] {
    const events: CalendarEvent<CalendarEventMeta>[] = [];
    const lines = data.split('\n');
    let currentEvent: any = {};

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent.start && currentEvent.title) {
          events.push({
            start: new Date(currentEvent.start),
            end: currentEvent.end ? new Date(currentEvent.end) : undefined,
            title: currentEvent.title,
            meta: {
              id: this.generateId(),
              title: currentEvent.title,
              description: currentEvent.description || '',
              location: currentEvent.location || '',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }
      } else if (line.startsWith('DTSTART:')) {
        currentEvent.start = line.substring(8);
      } else if (line.startsWith('DTEND:')) {
        currentEvent.end = line.substring(6);
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.location = line.substring(9);
      }
    }

    return events;
  }
}
