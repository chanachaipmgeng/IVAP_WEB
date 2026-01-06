/**
 * Events Component
 * 
 * Event management component with CRUD operations, attendee management, device linking,
 * and statistics. Supports event creation, editing, cancellation, and bulk attendee operations.
 * 
 * @example
 * ```html
 * <app-events></app-events>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { RichTextComponent } from '../../../shared/components/rich-text/rich-text.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { ApiService } from '../../../core/services/api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { PortalService } from '../../../core/services/portal.service';
import { Event, EventCreate, EventUpdate } from '../../../core/models/event.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    FilterSectionComponent
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  showDetailModal = signal(false);
  showAttendeesModal = signal(false);
  showLinkDeviceModal = signal(false);
  showBulkAddModal = signal(false);
  saving = signal(false);
  editingEvent = signal<Event | null>(null);
  selectedEvent = signal<Event | null>(null);
  linkingEvent = signal<Event | null>(null);
  attendees = signal<any[]>([]);
  attendeesLoading = signal(false);
  attendeesPage = signal(1);
  attendeesTotal = signal(0);
  pageSize = 20;

  // Bulk Add Attendees
  bulkAddMode = signal<'select' | 'csv'>('select');
  availableMembers = signal<any[]>([]);
  selectedMemberIds = signal<string[]>([]);
  membersLoading = signal(false);
  bulkAdding = signal(false);
  csvFile = signal<File | null>(null);
  csvPreview = signal<any[]>([]);

  // Link Device
  availableDevices = signal<any[]>([]);
  selectedDeviceId = signal<string>('');
  linkingDevice = signal(false);

  // Statistics and Linked Devices
  showStatistics = signal(false);
  statisticsLoading = signal(false);
  eventStatistics = signal<any>(null);
  linkedDevices = signal<any[]>([]);
  linkedDevicesLoading = signal(false);

  // Pagination and Filters
  eventsList = signal<Event[]>([]);
  currentPage = signal(1);
  pageSizeEvents = signal(20);
  totalEvents = signal(0);
  totalPages = signal(1);
  searchTerm = signal('');
  filterStatus = signal<string>('');
  filterEventType = signal<string>('');
  filterLocation = signal<string>('');
  errorMessage = signal<string>('');

  // Note: EventService doesn't use signals, so we manage state locally

  // Computed signals
  events = computed(() => this.eventsList());

  // Form
  eventForm: FormGroup;

  // Rich text editor content (needs separate handling)
  descriptionContent = signal<string>('');

  // Date validation
  dateError = signal<string>('');

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadEvents()
    },
    {
      label: this.i18n.t('common.add') + ' Event',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('common.search'),
      type: 'text',
      placeholder: 'Search events...',
      value: this.searchTerm()
    },
    {
      key: 'status',
      label: this.i18n.t('common.status'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' }
      ],
      value: this.filterStatus()
    },
    {
      key: 'eventType',
      label: 'Event Type',
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'meeting', label: 'Meeting' },
        { value: 'training', label: 'Training' },
        { value: 'event', label: 'Event' },
        { value: 'other', label: 'Other' }
      ],
      value: this.filterEventType()
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Search by location...',
      value: this.filterLocation()
    }
  ]);

  columns: TableColumn[] = [
    { key: 'eventName', label: 'Event Name', sortable: true },
    {
      key: 'startDate',
      label: 'Start Date',
      sortable: true,
      render: (value) => this.formatDateTime(value)
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value) => this.formatDateTime(value)
    },
    { key: 'eventType', label: 'Type', render: (value) => value || 'other' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        // Use backend status if available, otherwise calculate from dates
        const status = row.status && ['draft', 'published', 'cancelled', 'completed'].includes(row.status)
          ? row.status
          : this.calculateEventStatus(row);
        const statusIcons: Record<string, string> = {
          'draft': '📝',
          'published': '✅',
          'cancelled': '❌',
          'completed': '✔️'
        };
        return (statusIcons[status] || '❓') + ' ' + status;
      }
    }
  ];

  actions: TableAction[] = [
    {
      icon: '📋',
      label: 'Check-in History',
      onClick: (row) => this.viewCheckInHistory(row)
    },
    {
      icon: '👁️',
      label: 'View Details',
      onClick: (row) => this.viewEventDetails(row)
    },
    {
      icon: '👥',
      label: 'Attendees',
      onClick: (row) => this.viewAttendees(row)
    },
    {
      icon: '🎯',
      label: 'Link Device',
      onClick: (row) => this.linkDeviceToEvent(row)
    },
    {
      icon: '🔗',
      label: 'Copy Link',
      onClick: (row) => this.copyPublicLink(row)
    },
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editEvent(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteEvent(row)
    }
  ];

  // Expose window for template
  window = window;

  constructor(
    private api: ApiService,
    private eventService: EventService,
    private auth: AuthService,
    private i18n: I18nService,
    private router: Router,
    public portalService: PortalService
  ) {
    super();
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required]],
      description: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      location: [''],
      eventType: ['other', [Validators.required]],
      status: ['draft', [Validators.required]],
      maxAttendees: [undefined]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  /**
   * Load events with filters and pagination
   */
  loadEvents(): void {
    this.errorMessage.set('');
    const params: any = {
      page: this.currentPage(),
      size: this.pageSizeEvents()
    };
    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.filterStatus()) params.status = this.filterStatus();
    if (this.filterEventType()) params.eventType = this.filterEventType();
    if (this.filterLocation()) params.location = this.filterLocation();

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.eventService.getAll(params),
      (response) => {
        this.eventsList.set(response.data || []);
        this.totalEvents.set(response.total || 0);
        this.totalPages.set(Math.ceil((response.total || 0) / (response.size || this.pageSizeEvents())) || 1);
        this.currentPage.set(response.page || 1);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Events ได้');
      }
    );
  }

  onSearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.currentPage.set(1);
    this.loadEvents();
  }

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchTerm.set(event.value);
    } else if (event.key === 'status') {
      this.filterStatus.set(event.value);
    } else if (event.key === 'eventType') {
      this.filterEventType.set(event.value);
    } else if (event.key === 'location') {
      this.filterLocation.set(event.value);
    }
    this.currentPage.set(1);
    this.loadEvents();
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadEvents();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm.set('');
    this.filterStatus.set('');
    this.filterEventType.set('');
    this.filterLocation.set('');
    this.currentPage.set(1);
    this.loadEvents();
  }

  openAddModal(): void {
    this.editingEvent.set(null);
    this.eventForm.reset({
      eventName: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      eventType: 'other',
      status: 'draft',
      maxAttendees: undefined
    });
    this.eventForm.markAsUntouched();
    this.descriptionContent.set('');
    this.errorMessage.set('');
    this.dateError.set('');
    this.showModal.set(true);
  }

  /**
   * Edit event
   */
  editEvent(event: any): void {
    this.editingEvent.set(event);
    // Handle both camelCase (from API) and regular field names
    const eventName = event.eventName || '';
    const description = event.description || '';
    const location = event.location || '';
    const eventType = event.eventType || event.type || 'other';
    const status = event.status || 'draft';
    const maxAttendees = event.maxAttendees !== undefined ? event.maxAttendees : undefined;
    const startDate = event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '';
    const endDate = event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '';

    this.eventForm.patchValue({
      eventName: eventName,
      description: description,
      startDate: startDate,
      endDate: endDate,
      location: location,
      eventType: eventType,
      status: status,
      maxAttendees: maxAttendees
    });
    this.descriptionContent.set(description);
    this.eventForm.markAsUntouched();
    this.errorMessage.set('');
    this.dateError.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingEvent.set(null);
    this.errorMessage.set('');
    this.dateError.set('');
  }

  /**
   * Validate event dates
   */
  validateDates(): boolean {
    this.dateError.set('');

    const startDateControl = this.eventForm.get('startDate');
    const endDateControl = this.eventForm.get('endDate');

    if (!startDateControl?.value || !endDateControl?.value) {
      return true; // Let required validation handle this
    }

    const startDate = new Date(startDateControl.value);
    const endDate = new Date(endDateControl.value);
    const now = new Date();

    // Check if start date is in the past (for new events)
    if (!this.editingEvent() && startDate < now) {
      this.dateError.set('Start date cannot be in the past');
      startDateControl.setErrors({ pastDate: true });
      return false;
    }

    // Check if end date is before start date
    if (endDate <= startDate) {
      this.dateError.set('End date must be after start date');
      endDateControl.setErrors({ dateRange: true });
      return false;
    }

    return true;
  }

  saveEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      this.errorHandler.showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    // Validate dates
    if (!this.validateDates()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const formValue = this.eventForm.value;
    const eventData: any = {
      eventName: formValue.eventName,
      description: this.descriptionContent() || formValue.description || '',
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      location: formValue.location || '',
      status: formValue.status || 'draft',
      eventType: formValue.eventType || 'other'
    };

    // Add maxAttendees if provided
    if (formValue.maxAttendees !== undefined && formValue.maxAttendees !== null && typeof formValue.maxAttendees === 'number') {
      eventData.maxAttendees = formValue.maxAttendees;
    }

    const eventId = this.editingEvent() ? this.editingEvent()!.id : null;
    const request = eventId
      ? this.eventService.update(eventId, eventData as EventUpdate)
      : this.eventService.create(eventData as EventCreate);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.errorHandler.showSuccess(this.editingEvent() ? 'อัปเดต Event สำเร็จ' : 'สร้าง Event สำเร็จ');
        this.saving.set(false);
        this.closeModal();
        this.loadEvents();
        this.dateError.set('');
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถบันทึกข้อมูล Event ได้');
        this.saving.set(false);
        this.dateError.set(error.error?.detail || error.message || 'Error saving event');
      }
    );
  }

  /**
   * Delete event
   */
  deleteEvent(event: any): void {
    const eventName = event.eventName || 'this event';
    if (!confirm(`Delete event ${eventName}?`)) return;

    const eventId = event.id;
    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.eventService.delete(eventId),
      () => {
        this.errorHandler.showSuccess('ลบ Event สำเร็จ');
        this.loadEvents();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลบ Event ได้');
      }
    );
  }

  viewEventDetails(event: any): void {
    this.selectedEvent.set(event);
    this.showDetailModal.set(true);
    const eventId = event.id;
    this.loadLinkedDevices(eventId);
    this.loadEventStatistics(eventId);
  }

  /**
   * Load event statistics
   */
  loadEventStatistics(eventId: string): void {
    this.statisticsLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.eventService.getEventStatistics(eventId),
      (stats) => {
        this.eventStatistics.set(stats);
        this.statisticsLoading.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.eventStatistics.set(null);
        this.statisticsLoading.set(false);
      }
    );
  }

  loadLinkedDevices(eventId: string): void {
    this.linkedDevicesLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.eventService.getEventLinkedDevices(eventId),
      (devices) => {
        this.linkedDevices.set(devices);
        this.linkedDevicesLoading.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.linkedDevices.set([]);
        this.linkedDevicesLoading.set(false);
      }
    );
  }

  unlinkDevice(deviceId: string): void {
    if (!confirm('Are you sure you want to unlink this device from the event?')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.post(`/devices/${deviceId}/link-event`, {
        eventId: null
      }),
      () => {
        this.errorHandler.showSuccess('Device unlinked successfully!');
        if (this.selectedEvent()) {
          const eventId = this.selectedEvent()!.id;
          this.loadLinkedDevices(eventId);
        }
      },
      (error: any) => {
        this.errorHandler.handleApiError(error);
      }
    );
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedEvent.set(null);
    this.showStatistics.set(false);
    this.eventStatistics.set(null);
    this.linkedDevices.set([]);
  }

  sendEventReminders(): void {
    const event = this.selectedEvent();
    if (!event) return;

    const eventId = event.id;
    if (!confirm(`Send reminder emails to all registered attendees of "${event.eventName}"?`)) {
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.eventService.sendReminders(eventId, {
        reminderType: 'email',
        message: `Reminder: ${event.eventName} is coming up!`
      }),
      (response: any) => {
        const result = response.data || response;
        const emailsSent = result.emailsSent || result.emails_sent || 0;
        const messagesSent = result.messagesSent || result.messages_sent || 0;
        this.errorHandler.showSuccess(`Reminders sent successfully! ${emailsSent} emails and ${messagesSent} SMS messages sent.`);
      },
      (error: any) => {
        this.errorHandler.handleApiError(error);
      }
    );
  }

  viewCheckInHistory(event: any): void {
    const eventId = event.id;
    if (eventId) {
      this.router.navigate(['/portal/events', eventId, 'checkin-history']);
    }
  }

  viewAttendees(event: any): void {
    this.selectedEvent.set(event);
    this.showAttendeesModal.set(true);
    const eventId = event.id;
    this.loadAttendees(eventId, 1);
  }

  closeAttendeesModal(): void {
    this.showAttendeesModal.set(false);
    this.selectedEvent.set(null);
    this.attendees.set([]);
  }

  loadAttendees(eventId: string, page: number): void {
    this.attendeesLoading.set(true);
    this.attendeesPage.set(page);
    // Note: EventService.getAttendees() doesn't support pagination yet
    // For now, we'll get all attendees and paginate client-side
    this.eventService.getAttendees(eventId).subscribe({
      next: (data: any[]) => {
        const allAttendees = Array.isArray(data) ? data : [];
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.attendees.set(allAttendees.slice(startIndex, endIndex));
        this.attendeesTotal.set(allAttendees.length);
        this.attendeesLoading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.attendeesLoading.set(false);
      }
    });
  }

  getTotalPages(): number {
    return Math.ceil(this.attendeesTotal() / this.pageSize);
  }

  formatDateTimeLocal(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().slice(0, 16);
  }

  getCurrentDateTimeLocal(): string {
    return this.formatDateTimeLocal(new Date().toISOString());
  }

  /**
   * Calculate event status based on dates
   */
  calculateEventStatus(event: any): 'upcoming' | 'active' | 'past' {
    const now = new Date();
    const startDate = event.startDate ? new Date(event.startDate) : null;
    const endDate = event.endDate ? new Date(event.endDate) : null;

    if (!startDate || !endDate) {
      return 'upcoming';
    }

    if (endDate < now) {
      return 'past';
    } else if (startDate <= now && now <= endDate) {
      return 'active';
    } else {
      return 'upcoming';
    }
  }

  exportAttendeesToCSV(eventId: string): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.eventService.getAttendees(eventId),
      (attendees: any[]) => {
        const event = this.selectedEvent();
        const eventName = event ? (event.eventName || 'event') : 'event';

        // Helper function to format date
        const formatDateTime = (dateString: string): string => {
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };

        // Create CSV content
        const headers = ['First Name', 'Last Name', 'Email', 'Status', 'Check-in Time', 'Registration Date'];
        const rows = attendees.map((attendee: any) => [
          attendee.memberFirstName || attendee.firstName || attendee.member?.firstName || 'N/A',
          attendee.memberLastName || attendee.lastName || attendee.member?.lastName || '',
          attendee.memberEmail || attendee.email || attendee.member?.email || 'N/A',
          attendee.status || 'REGISTERED',
          attendee.checkInTime ? formatDateTime(attendee.checkInTime) : 'Not checked in',
          attendee.createdAt ? formatDateTime(attendee.createdAt) : 'N/A'
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map((row: any[]) => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `event-attendees-${eventName.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
      }
    );
  }

  linkDeviceToEvent(event: any): void {
    this.linkingEvent.set(event);
    this.showLinkDeviceModal.set(true);
    this.loadAvailableDevices();
  }

  closeLinkDeviceModal(): void {
    this.showLinkDeviceModal.set(false);
    this.linkingEvent.set(null);
    this.selectedDeviceId.set('');
  }

  loadAvailableDevices(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.errorHandler.showError('ไม่พบ Company ID');
      return;
    }

    // Get devices from API
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<any[]>(`/devices/company/${companyId}/devices`),
      (response: any) => {
        const devices = response.data || response.items || response || [];
        this.availableDevices.set(devices);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.availableDevices.set([]);
      }
    );
  }

  confirmLinkDevice(): void {
    const deviceId = this.selectedDeviceId();
    if (!deviceId || !this.linkingEvent()) return;

    const event = this.linkingEvent()!;
    const eventId = event.id;

    this.linkingDevice.set(true);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.post(`/devices/${deviceId}/link-event`, {
        eventId: eventId
      }),
      () => {
        this.errorHandler.showSuccess('Device linked to event successfully!');
        this.loadEvents();
        if (this.selectedEvent() && this.selectedEvent()!.id === eventId) {
          this.loadLinkedDevices(eventId);
        }
        this.closeLinkDeviceModal();
        this.linkingDevice.set(false);
      },
      (error: any) => {
        this.errorHandler.handleApiError(error);
        this.linkingDevice.set(false);
      }
    );
  }

  copyPublicLink(event: any): void {
    if (event.publicUrl) {
      const link = `${window.location.origin}/events/register/${event.publicUrl}`;
      navigator.clipboard.writeText(link).then(() => {
        this.errorHandler.showSuccess('Public registration link copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.errorHandler.showSuccess('Public registration link copied to clipboard!');
      });
    } else {
      this.errorHandler.showWarning('This event does not have a public URL. Please add a public URL first.');
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.eventForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return this.validationService.getValidationErrorMessage(control, this.getFieldLabel(fieldName));
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'eventName': 'Event Name',
      'description': 'Description',
      'startDate': 'Start Date',
      'endDate': 'End Date',
      'location': 'Location',
      'eventType': 'Event Type',
      'status': 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  generatePublicUrl(): string {
    return 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }

  // Bulk Add Attendees Methods
  openBulkAddModal(): void {
    this.showBulkAddModal.set(true);
    this.bulkAddMode.set('select');
    this.selectedMemberIds.set([]);
    this.csvFile.set(null);
    this.csvPreview.set([]);
    this.loadAvailableMembers();
  }

  closeBulkAddModal(): void {
    this.showBulkAddModal.set(false);
    this.bulkAddMode.set('select');
    this.selectedMemberIds.set([]);
    this.csvFile.set(null);
    this.csvPreview.set([]);
    this.availableMembers.set([]);
  }

  loadAvailableMembers(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.errorHandler.showError('ไม่พบ Company ID');
      return;
    }

    this.membersLoading.set(true);
    // Load employees from company
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<any[]>(`/employees?companyId=${companyId}&size=1000`),
      (response: any) => {
        const employees = response.data?.items || response.items || response.data || response || [];
        // Map employees to members format
        const members = employees.map((emp: any) => ({
          memberId: emp.memberId || emp.member?.memberId || emp.id,
          firstName: emp.member?.firstName || emp.firstName || emp.memberFirstName || '',
          lastName: emp.member?.lastName || emp.lastName || emp.memberLastName || '',
          email: emp.member?.email || emp.email || emp.memberEmail || '',
          employeeId: emp.employeeId || ''
        })).filter((m: any) => m.memberId); // Filter out invalid entries

        this.availableMembers.set(members);
        this.membersLoading.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.membersLoading.set(false);
        this.availableMembers.set([]);
      }
    );
  }

  toggleMemberSelection(memberId: string): void {
    const selected = this.selectedMemberIds();
    if (selected.includes(memberId)) {
      this.selectedMemberIds.set(selected.filter(id => id !== memberId));
    } else {
      this.selectedMemberIds.set([...selected, memberId]);
    }
  }

  isMemberSelected(memberId: string): boolean {
    return this.selectedMemberIds().includes(memberId);
  }

  selectAllMembers(): void {
    const allIds = this.availableMembers().map(m => m.memberId);
    this.selectedMemberIds.set(allIds);
  }

  deselectAllMembers(): void {
    this.selectedMemberIds.set([]);
  }

  onCsvFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      this.errorHandler.showError('Please select a CSV file');
      return;
    }

    this.csvFile.set(file);
    this.parseCsvFile(file);
  }

  parseCsvFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines = text.split('\n').filter((line: string) => line.trim());

      if (lines.length < 2) {
        this.errorHandler.showError('CSV file must have at least a header and one data row');
        return;
      }

      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      const emailIndex = headers.findIndex((h: string) => h.includes('email'));
      const firstNameIndex = headers.findIndex((h: string) => h.includes('first') || h.includes('name'));
      const lastNameIndex = headers.findIndex((h: string) => h.includes('last'));

      if (emailIndex === -1) {
        this.errorHandler.showError('CSV file must have an email column');
        return;
      }

      const preview: any[] = [];
      for (let i = 1; i < Math.min(lines.length, 11); i++) { // Preview first 10 rows
        const values = lines[i].split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
        preview.push({
          email: values[emailIndex] || '',
          firstName: firstNameIndex !== -1 ? values[firstNameIndex] || '' : '',
          lastName: lastNameIndex !== -1 ? values[lastNameIndex] || '' : ''
        });
      }

      this.csvPreview.set(preview);
    };
    reader.readAsText(file);
  }

  bulkAddAttendees(): void {
    const event = this.selectedEvent();
    if (!event) return;

    const eventId = event.id;
    const mode = this.bulkAddMode();

    this.bulkAdding.set(true);
    this.errorMessage.set('');

    if (mode === 'select') {
      // Add selected members
      const memberIds = this.selectedMemberIds();
      if (memberIds.length === 0) {
        this.errorHandler.showError('Please select at least one member');
        this.bulkAdding.set(false);
        return;
      }

      // Add attendees one by one
      const requests = memberIds.map(memberId => {
        return this.api.post(`/events/attendees`, {
          eventId: eventId,
          memberId: memberId
        });
      });

      // Execute all requests
      Promise.all(requests.map(req => req.toPromise())).then(() => {
        this.errorHandler.showSuccess(`Successfully added ${memberIds.length} attendees`);
        this.closeBulkAddModal();
        this.loadAttendees(eventId, this.attendeesPage());
        this.bulkAdding.set(false);
      }).catch((error) => {
        this.errorHandler.handleApiError(error);
        this.bulkAdding.set(false);
      });
    } else {
      // Add from CSV
      const file = this.csvFile();
      if (!file) {
        this.errorHandler.showError('Please select a CSV file');
        this.bulkAdding.set(false);
        return;
      }

      // Parse CSV and add attendees
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        const lines = text.split('\n').filter((line: string) => line.trim());
        const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
        const emailIndex = headers.findIndex((h: string) => h.includes('email'));
        const firstNameIndex = headers.findIndex((h: string) => h.includes('first') || h.includes('name'));
        const lastNameIndex = headers.findIndex((h: string) => h.includes('last'));

        const attendees: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
          const email = values[emailIndex] || '';
          if (email && email.includes('@')) {
            attendees.push({
              email: email,
              firstName: firstNameIndex !== -1 ? values[firstNameIndex] || '' : '',
              lastName: lastNameIndex !== -1 ? values[lastNameIndex] || '' : ''
            });
          }
        }

        if (attendees.length === 0) {
          this.errorHandler.showError('No valid attendees found in CSV file');
          this.bulkAdding.set(false);
          return;
        }

        // Find or create members and add as attendees
        // Note: This is a simplified version. In production, you might want to batch create members first
        const requests = attendees.map(attendee => {
          // First, try to find member by email, then add as attendee
          return this.api.get(`/members?email=${encodeURIComponent(attendee.email)}`).pipe(
            map((memberResponse: any) => {
              const members = memberResponse.data?.items || memberResponse.items || memberResponse.data || [];
              if (members.length > 0) {
                return this.api.post(`/events/attendees`, {
                  eventId: eventId,
                  memberId: members[0].id || members[0].memberId
                });
              } else {
                // Member doesn't exist, skip for now (or create member first)
                return of(null);
              }
            })
          );
        });

        // Execute requests
        Promise.all(requests.map(req => req.toPromise())).then((results) => {
          const successCount = results.filter(r => r !== null).length;
          this.errorHandler.showSuccess(`Successfully added ${successCount} attendees from CSV`);
          this.closeBulkAddModal();
          this.loadAttendees(eventId, this.attendeesPage());
          this.bulkAdding.set(false);
        }).catch((error) => {
          this.errorHandler.handleApiError(error);
          this.bulkAdding.set(false);
        });
      };
      reader.readAsText(file);
    }
  }

  /**
   * Format date time string for display
   */
  formatDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * TrackBy function for attendees
   */
  trackByAttendee(index: number, attendee: any): string {
    return attendee.attendeeId || attendee.id || index.toString();
  }

  /**
   * TrackBy function for devices
   */
  trackByDevice(index: number, device: any): string {
    return device.device_id || device.id || index.toString();
  }

  /**
   * TrackBy function for members
   */
  trackByMember(index: number, member: any): string {
    return member.memberId || index.toString();
  }

  /**
   * TrackBy function for CSV preview rows
   */
  trackByCsvRow(index: number, row: any): number {
    return index;
  }
}
