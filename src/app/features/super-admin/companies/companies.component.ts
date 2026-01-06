/**
 * Companies Management Component
 *
 * Comprehensive company management component for super admin.
 * Supports full CRUD operations, company settings, statistics, filtering, and export functionality.
 *
 * @example
 * ```html
 * <app-companies></app-companies>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';

import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction, SortEvent } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { CompanyService } from '../../../core/services/company.service';
import { Company, CompanyForm, CompanySettings, CompanyFilters } from '../../../core/models/company.model';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    FilterSectionComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent extends BaseComponent implements OnInit {
  // Data & State
  companies = signal<Company[]>([]);
  totalRecords = signal(0);
  companyStats = signal<any>({}); // Simplified for now

  // Computed statistics
  activeCompaniesCount = computed(() => {
    return this.companies().filter(c => {
      if (typeof c.status === 'string') {
        return c.status === 'public';
      }
      return c.status === 1;
    }).length;
  });

  pendingCompaniesCount = computed(() => {
    return this.companies().filter(c => {
      if (typeof c.status === 'string') {
        return c.status === 'pending';
      }
      return c.status === 2;
    }).length;
  });

  settingsModalTitle = computed(() => {
    const companyName = this.selectedCompany()?.name || '';
    return `${this.i18n.t('pages.companies.settings')}${companyName ? ' - ' + companyName : ''}`;
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('pages.companies.refresh'),
      variant: 'secondary',
      onClick: () => this.loadCompanies()
    },
    {
      label: this.i18n.t('pages.companies.addCompany'),
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('pages.companies.search'),
      type: 'text',
      placeholder: this.i18n.t('pages.companies.searchPlaceholder'),
      value: this.filters.controls.search.value
    },
    {
      key: 'status',
      label: this.i18n.t('pages.companies.status'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('pages.companies.allStatus') },
        { value: 'public', label: this.i18n.t('pages.companies.public') },
        { value: 'pending', label: this.i18n.t('pages.companies.pending') }
      ],
      value: this.filters.controls.status.value
    },
    {
      key: 'subscriptionType',
      label: this.i18n.t('pages.companies.subscriptionType'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('pages.companies.allSubscriptions') },
        { value: 'trial', label: this.i18n.t('pages.companies.trial') },
        { value: 'basic', label: this.i18n.t('pages.companies.basic') },
        { value: 'premium', label: this.i18n.t('pages.companies.premium') },
        { value: 'enterprise', label: this.i18n.t('pages.companies.enterprise') }
      ],
      value: this.filters.controls.subscriptionType?.value || ''
    },
    {
      key: 'createdFrom',
      label: this.i18n.t('pages.companies.createdFrom'),
      type: 'date',
      value: this.filters.controls.createdFrom?.value || ''
    },
    {
      key: 'createdTo',
      label: this.i18n.t('pages.companies.createdTo'),
      type: 'date',
      value: this.filters.controls.createdTo?.value || ''
    }
  ]);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Sorting & Filtering
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  filters: FormGroup<{
    search: FormControl<string>;
    status: FormControl<string>;
    subscriptionType: FormControl<string>;
    createdFrom: FormControl<string>;
    createdTo: FormControl<string>;
  }>;

  // Modals
  showModal = signal(false);
  showSettingsModal = signal(false);
  showDetailsModal = signal(false);
  saving = signal(false);
  editingCompany = signal<Company | null>(null);
  selectedCompany = signal<Company | null>(null);
  viewingCompany = signal<Company | null>(null);
  uploadingImage = signal(false);
  uploadProgress = signal(0);
  bulkOperationProgress = signal(0);
  bulkOperationInProgress = signal(false);

  // Bulk selection
  selectedCompanies = signal<Company[]>([]);

  formData: CompanyForm = {
    name: '',
    code: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    ownerName: '',
    contact: '',
    status: 'pending'
  } as CompanyForm;

  settings: CompanySettings = this.getDefaultSettings();

  // Available features for company settings
  availableFeatures = [
    'video_analytics',
    'access_control',
    'attendance_tracking',
    'visitor_management',
    'parking_management',
    'biometric_auth',
    'reporting',
    'api_access'
  ];

  get columns(): TableColumn[] {
    return [
      {
        key: 'name',
        label: this.i18n.t('pages.companies.companyName'),
        sortable: true,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'code',
        label: this.i18n.t('pages.companies.companyCode'),
        sortable: true,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'ownerName',
        label: this.i18n.t('pages.companies.ownerName'),
        sortable: false,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'contact',
        label: this.i18n.t('pages.companies.contact'),
        sortable: false,
        filterable: false
      },
      {
        key: 'address',
        label: this.i18n.t('pages.companies.address'),
        sortable: false,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'status',
        label: this.i18n.t('pages.companies.status'),
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { value: '', label: this.i18n.t('pages.companies.allStatus') },
          { value: 'public', label: this.i18n.t('pages.companies.public') },
          { value: 'pending', label: this.i18n.t('pages.companies.pending') }
        ],
        render: (value) => `<span class="${this.companyService.getStatusClass(value)}">${value ? (typeof value === 'string' ? value.toUpperCase() : value) : ''}</span>`
      },
      {
        key: 'createdAt',
        label: this.i18n.t('pages.companies.createdAt'),
        sortable: true,
        filterable: false,
        render: (value) => value ? this.companyService.formatDate(value) : ''
      }
    ];
  }

  get actions(): TableAction[] {
    return [
      { icon: '👁️', label: this.i18n.t('pages.companies.viewDetails'), onClick: (row) => this.openDetailsModal(row) },
      { icon: '✏️', label: this.i18n.t('pages.companies.edit'), onClick: (row) => this.openEditModal(row) },
      { icon: '⚙️', label: this.i18n.t('pages.companies.settings'), onClick: (row) => this.openSettingsModal(row) },
      {
        icon: '✅',
        label: this.i18n.t('pages.companies.activate'),
        onClick: (row) => this.activateCompany(row),
        visible: (row) => this.isCompanyPending(row)
      },
      {
        icon: '⏸️',
        label: this.i18n.t('pages.companies.deactivate'),
        onClick: (row) => this.deactivateCompany(row),
        visible: (row) => this.isCompanyPublic(row)
      },
      {
        icon: '⛔',
        label: this.i18n.t('pages.companies.suspend'),
        variant: 'danger',
        onClick: (row) => this.suspendCompany(row),
        visible: (row) => this.isCompanyPublic(row)
      },
      { icon: '🗑️', label: this.i18n.t('pages.companies.delete'), variant: 'danger', onClick: (row) => this.deleteCompany(row) }
    ];
  }

  constructor(
    public companyService: CompanyService,
    public fileUploadService: FileUploadService,
    public i18n: I18nService,
    private toastr: ToastrService
  ) {
    super();
    this.filters = new FormGroup({
      search: new FormControl<string>('', { nonNullable: true }),
      status: new FormControl<string>('', { nonNullable: true }),
      subscriptionType: new FormControl<string>('', { nonNullable: true }),
      createdFrom: new FormControl<string>('', { nonNullable: true }),
      createdTo: new FormControl<string>('', { nonNullable: true })
    });

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.filters.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ),
      () => {
        this.currentPage.set(1);
        this.loadCompanies();
      }
    );
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadStatistics();
  }


  loadCompanies(): void {
    const params = {
      page: this.currentPage(),
      limit: this.pageSize(),
      filters: this.filters.value as CompanyFilters,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.loadCompanies(params);
    this.subscribe(
      obs,
      (response) => {
        this.companies.set(response.data);
        this.totalRecords.set(response.total);
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToLoad'), err.message)
    );
  }

  loadStatistics(): void {
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.getStatistics();
    this.subscribe(
      obs,
      (stats) => this.companyStats.set(stats),
      (err) => {
        console.error('Error loading company statistics:', err);
        // Set default empty stats on error
        this.companyStats.set({
          totalCompanies: 0,
          publicCompanies: 0,
          pendingCompanies: 0,
          suspendedCompanies: 0
        });
        // Only show error if it's not a 403 (permission denied)
        if (err.status !== 403) {
          this.toastr.error(this.i18n.t('pages.companies.failedToLoad'), err.message);
        }
      }
    );
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCompanies();
    }
  }

  onSort(event: SortEvent): void {
    this.sortBy.set(event.column);
    this.sortOrder.set(event.direction);
    this.currentPage.set(1);
    this.loadCompanies();
  }

  onFilterChange(event: { key: string; value: any }): void {
    const control = this.filters.get(event.key);
    if (control) {
      control.setValue(event.value);
    }
  }

  onColumnFilterChange(filters: { [key: string]: any }): void {
    // Handle column filter changes if needed
    // This can be used to sync with server-side filtering
    // Column filters changed
  }

  // Modal Handling
  openAddModal(): void {
    this.editingCompany.set(null);
    this.formData = {
      name: '',
      code: '',
      description: '',
      address: '',
      latitude: 0,
      longitude: 0,
      ownerName: '',
      contact: '',
      status: 'pending'
    } as CompanyForm;
    this.showModal.set(true);
  }

  openEditModal(company: Company): void {
    this.editingCompany.set(company);
    this.formData = {
      name: company.name || '',
      code: company.code || '',
      description: company.description || '',
      address: company.address || '',
      latitude: company.latitude || 0,
      longitude: company.longitude || 0,
      ownerName: company.ownerName || '',
      contact: company.contact || '',
      status: typeof company.status === 'string' ? company.status : (company.status === 1 ? 'public' : 'pending')
    } as CompanyForm;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveCompany(): void {
    // Validate required fields
    if (!this.formData.name || !this.formData.code || !this.formData.address ||
      !this.formData.ownerName || !this.formData.contact) {
      this.toastr.error(this.i18n.t('pages.companies.requiredFieldsMissing'));
      return;
    }

    // Validate latitude and longitude
    if (this.formData.latitude === undefined || this.formData.longitude === undefined ||
      this.formData.latitude === null || this.formData.longitude === null) {
      this.toastr.error(this.i18n.t('pages.companies.locationRequired'));
      return;
    }

    // Validate latitude range (-90 to 90)
    if (this.formData.latitude < -90 || this.formData.latitude > 90) {
      this.toastr.error(this.i18n.t('pages.companies.invalidLatitudeRange'));
      return;
    }

    // Validate longitude range (-180 to 180)
    if (this.formData.longitude < -180 || this.formData.longitude > 180) {
      this.toastr.error(this.i18n.t('pages.companies.invalidLongitudeRange'));
      return;
    }

    // Validate company code format (alphanumeric, dashes, underscores)
    const codePattern = /^[A-Za-z0-9_-]+$/;
    if (!codePattern.test(this.formData.code)) {
      this.toastr.error(this.i18n.t('pages.companies.invalidCodeFormat'));
      return;
    }

    // Check if code already exists (only for new companies)
    if (!this.editingCompany()) {
      const existingCompany = this.companies().find(c => c.code.toLowerCase() === this.formData.code.toLowerCase());
      if (existingCompany) {
        this.toastr.error(this.i18n.t('pages.companies.codeAlreadyExists'));
        return;
      }
    } else {
      // For editing, check if code exists for another company
      const existingCompany = this.companies().find(c =>
        c.code.toLowerCase() === this.formData.code.toLowerCase() &&
        c.id !== this.editingCompany()!.id
      );
      if (existingCompany) {
        this.toastr.error(this.i18n.t('pages.companies.codeAlreadyExists'));
        return;
      }
    }

    this.saving.set(true);

    // Transform form data to backend format
    const backendData = {
      company_name: this.formData.name,
      company_code: this.formData.code,
      company_info: this.formData.description || '',
      address: this.formData.address,
      latitude: this.formData.latitude,
      longitude: this.formData.longitude,
      owner_name: this.formData.ownerName,
      contact: this.formData.contact,
      status: this.formData.status || 'pending',
      picture: this.formData.picture || null
    };

    const request = this.editingCompany()
      ? this.companyService.updateCompany(this.editingCompany()!.id, backendData as any)
      : this.companyService.createCompany(backendData as any);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.toastr.success(this.editingCompany() ? this.i18n.t('pages.companies.companyUpdated') : this.i18n.t('pages.companies.companyCreated'));
        this.saving.set(false);
        this.closeModal();
        this.loadCompanies();
      },
      (err) => {
        this.toastr.error(this.i18n.t('pages.companies.failedToSave'), err.message || err.error?.detail || 'Unknown error');
        this.saving.set(false);
      }
    );
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadingImage.set(true);
      this.uploadProgress.set(0);

      // Simulate progress for better UX (since backend doesn't support progress events)
      const progressInterval = setInterval(() => {
        if (this.uploadProgress() < 90) {
          this.uploadProgress.set(this.uploadProgress() + 10);
        }
      }, 100);

      // ✅ Auto-unsubscribe on component destroy
      const obs = this.companyService.uploadImage(file);
      this.subscribe(
        obs,
        (response) => {
          clearInterval(progressInterval);
          this.uploadProgress.set(100);
          setTimeout(() => {
            this.formData.picture = response.path;
            this.uploadingImage.set(false);
            this.uploadProgress.set(0);
            this.toastr.success(this.i18n.t('pages.companies.imageUploaded'));
          }, 300);
        },
        (err) => {
          clearInterval(progressInterval);
          this.uploadProgress.set(0);
          this.toastr.error(this.i18n.t('pages.companies.failedToUploadImage'), err.message);
          this.uploadingImage.set(false);
        }
      );
    }
  }

  deleteCompany(company: Company): void {
    if (!confirm(`${this.i18n.t('pages.companies.deleteConfirm')} "${company.name}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.deleteCompany(company.id);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companyDeleted')} "${company.name}"`);
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToDelete'), err.message)
    );
  }

  // Status management methods
  activateCompany(company: Company): void {
    if (!confirm(`${this.i18n.t('pages.companies.activateConfirm')} "${company.name}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.activateCompany(company.id);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companyActivated')} "${company.name}"`);
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToActivate'), err.message)
    );
  }

  deactivateCompany(company: Company): void {
    if (!confirm(`${this.i18n.t('pages.companies.deactivateConfirm')} "${company.name}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.deactivateCompany(company.id);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companyDeactivated')} "${company.name}"`);
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToDeactivate'), err.message)
    );
  }

  suspendCompany(company: Company): void {
    const reason = prompt(this.i18n.t('pages.companies.suspendReasonPrompt'));
    if (!reason) return;

    if (!confirm(`${this.i18n.t('pages.companies.suspendConfirm')} "${company.name}"?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.suspendCompany(company.id, reason);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companySuspended')} "${company.name}"`);
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToSuspend'), err.message)
    );
  }

  // Helper methods for status checking
  isCompanyPublic(company: Company): boolean {
    if (typeof company.status === 'string') {
      return company.status === 'public';
    }
    return company.status === 1;
  }

  isCompanyPending(company: Company): boolean {
    if (typeof company.status === 'string') {
      return company.status === 'pending';
    }
    return company.status === 2;
  }

  // Details Modal
  openDetailsModal(company: Company): void {
    this.viewingCompany.set(company);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.viewingCompany.set(null);
  }

  // Bulk operations
  getRowId = (row: Company): string => {
    return row.id;
  }

  onSelectionChange(selected: Company[]): void {
    this.selectedCompanies.set(selected);
  }

  clearSelection(): void {
    this.selectedCompanies.set([]);
  }

  bulkActivate(): void {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;

    if (!confirm(`${this.i18n.t('pages.companies.bulkActivateConfirm')} ${selected.length} ${this.i18n.t('pages.companies.companies')}?`)) return;

    this.bulkOperationInProgress.set(true);
    this.bulkOperationProgress.set(0);

    const total = selected.length;
    let completed = 0;

    const activatePromises = selected.map((company, index) =>
      this.companyService.activateCompany(company.id).toPromise().then(() => {
        completed++;
        this.bulkOperationProgress.set(Math.round((completed / total) * 100));
        return company;
      })
    );

    Promise.all(activatePromises).then(() => {
      this.toastr.success(`${this.i18n.t('pages.companies.bulkActivated')} ${selected.length} ${this.i18n.t('pages.companies.companies')}`);
      this.clearSelection();
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
      this.loadCompanies();
    }).catch(err => {
      this.toastr.error(this.i18n.t('pages.companies.failedToBulkActivate'), err.message);
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
    });
  }

  bulkDeactivate(): void {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;

    if (!confirm(`${this.i18n.t('pages.companies.bulkDeactivateConfirm')} ${selected.length} ${this.i18n.t('pages.companies.companies')}?`)) return;

    this.bulkOperationInProgress.set(true);
    this.bulkOperationProgress.set(0);

    const total = selected.length;
    let completed = 0;

    const deactivatePromises = selected.map((company, index) =>
      this.companyService.deactivateCompany(company.id).toPromise().then(() => {
        completed++;
        this.bulkOperationProgress.set(Math.round((completed / total) * 100));
        return company;
      })
    );

    Promise.all(deactivatePromises).then(() => {
      this.toastr.success(`${this.i18n.t('pages.companies.bulkDeactivated')} ${selected.length} ${this.i18n.t('pages.companies.companies')}`);
      this.clearSelection();
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
      this.loadCompanies();
    }).catch(err => {
      this.toastr.error(this.i18n.t('pages.companies.failedToBulkDeactivate'), err.message);
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
    });
  }

  bulkDelete(): void {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;

    if (!confirm(`${this.i18n.t('pages.companies.bulkDeleteConfirm')} ${selected.length} ${this.i18n.t('pages.companies.companies')}?`)) return;

    this.bulkOperationInProgress.set(true);
    this.bulkOperationProgress.set(0);

    const total = selected.length;
    let completed = 0;

    const deletePromises = selected.map((company, index) =>
      this.companyService.deleteCompany(company.id).toPromise().then(() => {
        completed++;
        this.bulkOperationProgress.set(Math.round((completed / total) * 100));
        return company;
      })
    );

    Promise.all(deletePromises).then(() => {
      this.toastr.success(`${this.i18n.t('pages.companies.bulkDeleted')} ${selected.length} ${this.i18n.t('pages.companies.companies')}`);
      this.clearSelection();
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
      this.loadCompanies();
    }).catch(err => {
      this.toastr.error(this.i18n.t('pages.companies.failedToBulkDelete'), err.message);
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
    });
  }

  // Helper methods for status display
  getStatusClassForDisplay(status: 'public' | 'pending' | number): string {
    const statusStr = this.getStatusString(status);
    return this.companyService.getStatusClass(statusStr);
  }

  getStatusString(status: 'public' | 'pending' | number): string {
    if (typeof status === 'string') {
      return status;
    }
    return status === 1 ? 'public' : 'pending';
  }

  getStatusDisplayText(status: 'public' | 'pending' | number): string {
    const statusStr = this.getStatusString(status);
    return statusStr.toUpperCase();
  }

  formatDateTime(dateStr: string): string {
    return this.companyService.formatDateTime(dateStr);
  }

  getImageUrl(path: string | null): string {
    if (!path) return '';
    return this.fileUploadService.getImageUrl(path);
  }

  // Settings Modal
  openSettingsModal(company: Company): void {
    this.selectedCompany.set(company);
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.getCompanySettings(company.id);
    this.subscribe(
      obs,
      (settings) => {
        // Map backend settings to frontend CompanySettings
        this.settings = {
          timezone: settings.timezone || 'UTC',
          language: settings.language || 'en',
          dateFormat: settings.dateFormat || 'YYYY-MM-DD',
          timeFormat: settings.timeFormat || '24h',
          currency: settings.currency || 'USD',
          notifications: settings.notifications || {
            email: true,
            sms: false,
            push: true,
            webhook: false,
            webhookUrl: ''
          },
          security: settings.security || {
            twoFactorRequired: false,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: false,
              maxAge: 90
            },
            sessionTimeout: 30,
            ipWhitelist: [],
            allowedDomains: []
          },
          integrations: settings.integrations || {
            ldap: {
              enabled: false,
              server: '',
              port: 389,
              baseDn: '',
              bindDn: '',
              bindPassword: ''
            },
            sso: {
              enabled: false,
              provider: '',
              clientId: '',
              clientSecret: '',
              redirectUri: ''
            },
            api: {
              enabled: false,
              rateLimit: 100,
              allowedOrigins: [],
              apiKey: ''
            }
          }
        };
        this.showSettingsModal.set(true);
      },
      (err) => {
        // If settings don't exist, use defaults
        this.settings = this.getDefaultSettings();
        this.showSettingsModal.set(true);
      }
    );
  }

  // Feature management
  isFeatureEnabled(feature: string): boolean {
    return this.settings.features?.includes(feature) || false;
  }

  toggleFeature(feature: string, event: any): void {
    if (!event || !event.target) return;
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.settings.features) {
      this.settings.features = [];
    }
    if (checked) {
      if (!this.settings.features.includes(feature)) {
        this.settings.features.push(feature);
      }
    } else {
      this.settings.features = this.settings.features.filter(f => f !== feature);
    }
  }

  private getDefaultSettings(): CompanySettings {
    return {
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'USD',
      notifications: {
        email: true,
        sms: false,
        push: true,
        webhook: false,
        webhookUrl: ''
      },
      security: {
        twoFactorRequired: false,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          maxAge: 90
        },
        sessionTimeout: 30,
        ipWhitelist: [],
        allowedDomains: []
      },
      integrations: {
        ldap: {
          enabled: false,
          server: '',
          port: 389,
          baseDn: '',
          bindDn: '',
          bindPassword: ''
        },
        sso: {
          enabled: false,
          provider: '',
          clientId: '',
          clientSecret: '',
          redirectUri: ''
        },
        api: {
          enabled: false,
          rateLimit: 100,
          allowedOrigins: [],
          apiKey: ''
        }
      }
    };
  }

  closeSettingsModal(): void {
    this.showSettingsModal.set(false);
  }

  saveSettings(): void {
    if (!this.selectedCompany()) return;
    this.saving.set(true);

    // Transform to backend format
    const backendSettings = {
      maxUsers: this.settings.maxUsers || 10,
      maxDevices: this.settings.maxDevices || 5,
      maxStorageGb: this.settings.maxStorageGb || 10,
      subscriptionType: this.settings.subscriptionType || 'trial',
      features: this.settings.features || [],
      additionalSettings: {
        timezone: this.settings.timezone,
        language: this.settings.language,
        dateFormat: this.settings.dateFormat,
        timeFormat: this.settings.timeFormat,
        currency: this.settings.currency,
        notifications: this.settings.notifications,
        security: this.settings.security,
        integrations: this.settings.integrations
      }
    };

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.updateCompanySettings(this.selectedCompany()!.id, backendSettings as any);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(this.i18n.t('pages.companies.settingsSaved'));
        this.saving.set(false);
        this.closeSettingsModal();
      },
      (err) => {
        this.toastr.error(this.i18n.t('pages.companies.failedToSaveSettings'), err.message || err.error?.detail || 'Unknown error');
        this.saving.set(false);
      }
    );
  }

  exportCompanies(): void {
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.exportCompanies();
    this.subscribe(
      obs,
      (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'companies.csv';
        link.click();
        window.URL.revokeObjectURL(link.href);
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToExport'), err.message)
    );
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
