/**
 * Guests Component
 *
 * Guest management component with CRUD operations, check-in/check-out functionality,
 * statistics tracking, and export functionality. Supports guest registration, editing,
 * status management, and CSV export.
 *
 * @example
 * ```html
 * <app-guests></app-guests>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { ModalFormComponent } from '../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../shared/components/form-field/form-field.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { GuestService } from '../../../core/services/guest.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Guest, GuestCreate } from '../../../core/models/guest.model';
import { GuestStatus } from '../../../core/models/enums.model';
import { UUID, PaginatedResponse } from '../../../core/models/base.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DataTableComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    ModalFormComponent,
    EmptyStateComponent
  ],
  templateUrl: './guests.component.html',
  styleUrl: './guests.component.scss'
})
export class GuestsComponent extends BaseComponent implements OnInit {
  // Expose enums for template
  GuestStatus = GuestStatus;

  showModal = signal(false);
  saving = signal(false);
  loading = signal(false);
  editingGuest = signal<Guest | null>(null);
  guests = signal<Guest[]>([]);
  totalRecords = signal(0);

  // Computed statistics
  pendingCount = computed(() => this.guests().filter(g => g.status === GuestStatus.PENDING).length);
  checkedInCount = computed(() => this.guests().filter(g => g.status === GuestStatus.CHECKED_IN).length);
  checkedOutCount = computed(() => this.guests().filter(g => g.status === GuestStatus.CHECKED_OUT).length);

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => [
    {
      icon: '⏳',
      label: 'Pending',
      value: this.pendingCount(),
      iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      icon: '✅',
      label: 'Checked In',
      value: this.checkedInCount(),
      iconBgClass: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: '🚪',
      label: 'Checked Out',
      value: this.checkedOutCount(),
      iconBgClass: 'bg-blue-100 dark:bg-blue-900'
    }
  ]);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.add') + ' Guest',
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
      placeholder: 'Search guests...',
      value: this.filters.search
    },
    {
      key: 'status',
      label: this.i18n.t('common.status'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: GuestStatus.PENDING, label: 'Pending' },
        { value: GuestStatus.CHECKED_IN, label: 'Checked In' },
        { value: GuestStatus.CHECKED_OUT, label: 'Checked Out' }
      ],
      value: this.filters.status
    }
  ]);

  formData: any = {
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: ''
  };

  // Form fields configuration for ModalFormComponent
  guestFormFields = computed<FormFieldConfig[]>(() => {
    const guest = this.editingGuest();
    return [
      {
        key: 'name',
        label: 'Guest Name',
        type: 'text',
        placeholder: 'Enter guest name',
        required: true,
        value: guest?.name || this.formData.name
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter email address',
        value: guest?.email || this.formData.email
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'text',
        placeholder: 'Enter phone number',
        value: guest?.phone || this.formData.phone
      },
      {
        key: 'company',
        label: 'Company',
        type: 'text',
        placeholder: 'Enter company name',
        value: guest?.company || this.formData.company
      },
      {
        key: 'purpose',
        label: 'Purpose of Visit',
        type: 'textarea',
        placeholder: 'Enter purpose of visit',
        rows: 3,
        fullWidth: true,
        value: guest?.purpose || this.formData.purpose
      }
    ];
  });

  filters = {
    status: '',
    search: ''
  };

  /**
   * Handle filter changes
   */
  onFilterChange(event: { key: string; value: any }): void {
    (this.filters as any)[event.key] = event.value;
    this.loadGuests();
  }

  /**
   * Open add guest modal
   */
  openAddModal(): void {
    this.editingGuest.set(null);
    this.formData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      purpose: ''
    };
    this.showModal.set(true);
  }

  /**
   * Close guest modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingGuest.set(null);
    this.formData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      purpose: ''
    };
  }

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    { key: 'company', label: 'Company' },
    { key: 'purpose', label: 'Purpose' },
    { key: 'hostEmployeeName', label: 'Host' },
    {
      key: 'checkInTime',
      label: 'Check-in',
      render: (value) => value ? new Date(value).toLocaleString() : '-'
    },
    {
      key: 'checkOutTime',
      label: 'Check-out',
      render: (value) => value ? new Date(value).toLocaleString() : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value || GuestStatus.PENDING
    }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      variant: 'secondary',
      onClick: (guest) => this.editGuest(guest)
    },
    {
      icon: '✅',
      label: 'Check In',
      variant: 'primary',
      onClick: (guest) => this.checkInGuest(guest)
    },
    {
      icon: '🚪',
      label: 'Check Out',
      variant: 'secondary',
      onClick: (guest) => this.checkOutGuest(guest)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (guest) => this.deleteGuest(guest)
    }
  ];

  constructor(
    private guestService: GuestService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadGuests();
  }

  loadGuests(): void {
    this.loading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.guestService.getGuests(),
      (response: PaginatedResponse<Guest>) => {
        this.guests.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      (error) => {
        console.error('Error loading guests:', error);
        this.loading.set(false);
      }
    );
  }

  /**
   * Add new guest (alias for openAddModal)
   */
  addGuest(): void {
    this.editingGuest.set(null);
    this.formData = {
      name: '',
      email: '',
      phone: '',
      company: '',
      purpose: ''
    };
    this.showModal.set(true);
  }

  editGuest(guest: Guest): void {
    this.editingGuest.set(guest);
    this.formData = {
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      company: guest.company,
      purpose: guest.purpose,
      hostEmployeeName: guest.hostEmployeeName,
      notes: guest.notes
    };
    this.showModal.set(true);
  }

  /**
   * Handle form submission from ModalFormComponent
   */
  onFormSubmitted(formData: Record<string, any>): void {
    // Update formData from ModalFormComponent
    this.formData = {
      name: formData['name'] || '',
      email: formData['email'] || '',
      phone: formData['phone'] || '',
      company: formData['company'] || '',
      purpose: formData['purpose'] || ''
    };
    this.saveGuest();
  }

  saveGuest(): void {
    this.saving.set(true);

    const request = this.editingGuest()
      ? this.guestService.updateGuest(this.editingGuest()!.id, this.formData as any)
      : this.guestService.createGuest(this.formData as GuestCreate);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.saving.set(false);
        this.closeModal();
        this.loadGuests();
      },
      (error) => {
        console.error('Error saving guest:', error);
        this.saving.set(false);
      }
    );
  }

  /**
   * Check in guest
   */
  checkInGuest(guest: Guest): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.guestService.checkInGuest(guest.id, {
        checkInTime: new Date().toISOString()
      }),
      () => {
        alert('Guest checked in successfully!');
        this.loadGuests();
      },
      (error) => {
        console.error('Error checking in guest:', error);
        alert('Error checking in guest. Please try again.');
      }
    );
  }

  checkOutGuest(guest: Guest): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.guestService.checkOutGuest(guest.id, {
        checkOutTime: new Date().toISOString()
      }),
      () => {
        alert('Guest checked out successfully!');
        this.loadGuests();
      },
      (error) => {
        console.error('Error checking out guest:', error);
        alert('Error checking out guest. Please try again.');
      }
    );
  }

  /**
   * Delete guest
   */
  deleteGuest(guest: Guest): void {
    if (!confirm('Are you sure you want to delete this guest?')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.guestService.deleteGuest(guest.id),
      () => {
        this.loadGuests();
      },
      (error) => {
        console.error('Error deleting guest:', error);
      }
    );
  }

  applyFilters(): void {
    this.loadGuests();
  }

  clearFilters(): void {
    this.filters = { status: '', search: '' };
    this.loadGuests();
  }

  exportToCSV(): void {
    this.loading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.guestService.exportGuests(),
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `guests_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loading.set(false);
      },
      (error) => {
        console.error('Error exporting guests:', error);
        alert('Error exporting guests. Please try again.');
        this.loading.set(false);
      }
    );
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}
