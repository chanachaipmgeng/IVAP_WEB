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
import { Company, CompanyCreate, CompanyUpdate, CompanySettings, CompanySettingsUpdate, CompanyFilters } from '../../../core/models/company.model';
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
  loading = signal(false);  // Loading state for table

  // Computed statistics
  activeCompaniesCount = computed(() => {
    return this.companies().filter(c => {
      if (typeof c.status === 'string') {
        return c.status === 'PUBLIC' || c.status.toUpperCase() === 'PUBLIC';  // snake_case - support uppercase
      }
      return c.status === 1;
    }).length;
  });

  pendingCompaniesCount = computed(() => {
    return this.companies().filter(c => {
      if (typeof c.status === 'string') {
        return c.status === 'PENDING' || c.status.toUpperCase() === 'PENDING';  // snake_case - support uppercase
      }
      return c.status === 2;
    }).length;
  });

  settingsModalTitle = computed(() => {
    const companyName = this.selectedCompany()?.company_name || '';  // snake_case
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
  sortBy = signal('created_at');  // snake_case
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

  formData: Partial<CompanyCreate> = {
    company_name: '',  // snake_case
    company_code: '',  // snake_case
    company_info: '',  // snake_case
    address: '',
    latitude: 0,
    longitude: 0,
    owner_name: '',  // snake_case
    contact: '',
    status: 'PENDING'  // snake_case - use uppercase to match backend
  };

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
        key: 'company_name',  // snake_case
        label: this.i18n.t('pages.companies.companyName'),
        sortable: true,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'company_code',  // snake_case
        label: this.i18n.t('pages.companies.companyCode'),
        sortable: true,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'owner_name',  // snake_case
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
        render: (value) => {
          const statusStr = typeof value === 'string' ? value.toUpperCase() : (value === 1 ? 'PUBLIC' : 'PENDING');
          const statusClass = statusStr === 'PUBLIC' ? 'text-green-600' : statusStr === 'PENDING' ? 'text-yellow-600' : 'text-gray-600';
          return `<span class="${statusClass}">${statusStr}</span>`;
        }
      },
      {
        key: 'created_at',  // snake_case
        label: this.i18n.t('pages.companies.createdAt'),
        sortable: true,
        filterable: false,
        render: (value) => value ? this.formatDateTime(value) : ''
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
    this.loading.set(true);  // Set loading state
    const filters: CompanyFilters = {
      ...this.filters.value,
      search: this.filters.value.search || undefined,
      status: this.filters.value.status ? (this.filters.value.status.toUpperCase() as 'PUBLIC' | 'PENDING') : undefined  // snake_case - convert to uppercase
    };
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.getCompanies(filters);
    this.subscribe(
      obs,
      (response) => {
        this.companies.set(response.data || []);
        this.totalRecords.set(response.total || 0);
        this.loading.set(false);  // Clear loading state
      },
      (err) => {
        this.toastr.error(this.i18n.t('pages.companies.failedToLoad'), err.message);
        this.loading.set(false);  // Clear loading state on error
      }
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
          total_companies: 0,  // snake_case
          public_companies: 0,  // snake_case
          pending_companies: 0,  // snake_case
          suspended_companies: 0  // snake_case
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
      company_name: '',  // snake_case
      company_code: '',  // snake_case
      company_info: '',  // snake_case
      address: '',
      latitude: 0,
      longitude: 0,
      owner_name: '',  // snake_case
      contact: '',
      status: 'PENDING'  // snake_case - use uppercase
    };
    this.showModal.set(true);
  }

  openEditModal(company: Company): void {
    this.editingCompany.set(company);
    this.formData = {
      company_name: company.company_name || '',  // snake_case
      company_code: company.company_code || '',  // snake_case
      company_info: company.company_info || '',  // snake_case
      address: company.address || '',
      latitude: company.latitude || 0,
      longitude: company.longitude || 0,
      owner_name: company.owner_name || '',  // snake_case
      contact: company.contact || '',
      status: typeof company.status === 'string' ? company.status : (company.status === 1 ? 'PUBLIC' : 'PENDING')  // snake_case - use uppercase
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveCompany(): void {
    // Validate required fields
    if (!this.formData.company_name || !this.formData.company_code || !this.formData.address ||
      !this.formData.owner_name || !this.formData.contact) {  // snake_case
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
    if (!codePattern.test(this.formData.company_code || '')) {  // snake_case
      this.toastr.error(this.i18n.t('pages.companies.invalidCodeFormat'));
      return;
    }

    // Check if code already exists (only for new companies)
    if (!this.editingCompany()) {
      const existingCompany = this.companies().find(c => c.company_code.toLowerCase() === this.formData.company_code?.toLowerCase());  // snake_case
      if (existingCompany) {
        this.toastr.error(this.i18n.t('pages.companies.codeAlreadyExists'));
        return;
      }
    } else {
      // For editing, check if code exists for another company
      const existingCompany = this.companies().find(c =>
        c.company_code.toLowerCase() === this.formData.company_code?.toLowerCase() &&  // snake_case
        c.company_id !== this.editingCompany()!.company_id  // snake_case
      );
      if (existingCompany) {
        this.toastr.error(this.i18n.t('pages.companies.codeAlreadyExists'));
        return;
      }
    }

    this.saving.set(true);

    // Use formData directly (already in snake_case format)
    const backendData: CompanyCreate | CompanyUpdate = {
      company_name: this.formData.company_name!,  // snake_case
      company_code: this.formData.company_code!,  // snake_case
      company_info: this.formData.company_info || '',  // snake_case
      address: this.formData.address!,
      latitude: this.formData.latitude!,
      longitude: this.formData.longitude!,
      owner_name: this.formData.owner_name!,  // snake_case
      contact: this.formData.contact!,
      status: this.formData.status || 'PENDING',  // snake_case - use uppercase
      picture: this.formData.picture || undefined
    };

    const request = this.editingCompany()
      ? this.companyService.updateCompany(this.editingCompany()!.company_id, backendData as CompanyUpdate)  // snake_case
      : this.companyService.createCompany(backendData as CompanyCreate);

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
      const obs = this.fileUploadService.uploadImage(file);  // Use FileUploadService instead
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
    if (!confirm(`${this.i18n.t('pages.companies.deleteConfirm')} "${company.company_name}"?`)) return;  // snake_case

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.deleteCompany(company.company_id);  // snake_case
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companyDeleted')} "${company.company_name}"`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToDelete'), err.message)
    );
  }

  // Status management methods
  activateCompany(company: Company): void {
    if (!confirm(`${this.i18n.t('pages.companies.activateConfirm')} "${company.company_name}"?`)) return;  // snake_case

    // Update company status to PUBLIC
    const updateData: CompanyUpdate = {
      status: 'PUBLIC'  // snake_case - use uppercase
    };
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.updateCompany(company.company_id, updateData);  // snake_case
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companyActivated')} "${company.company_name}"`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToActivate'), err.message)
    );
  }

  deactivateCompany(company: Company): void {
    if (!confirm(`${this.i18n.t('pages.companies.deactivateConfirm')} "${company.company_name}"?`)) return;  // snake_case

    // Update company status to PENDING
    const updateData: CompanyUpdate = {
      status: 'PENDING'  // snake_case - use uppercase
    };
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.updateCompany(company.company_id, updateData);  // snake_case
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companyDeactivated')} "${company.company_name}"`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToDeactivate'), err.message)
    );
  }

  suspendCompany(company: Company): void {
    const reason = prompt(this.i18n.t('pages.companies.suspendReasonPrompt'));
    if (!reason) return;

    if (!confirm(`${this.i18n.t('pages.companies.suspendConfirm')} "${company.company_name}"?`)) return;  // snake_case

    // Update company status - Note: Backend may need a SUSPENDED status or use additional_settings
    const updateData: CompanyUpdate = {
      status: 'PENDING',  // snake_case - or use a SUSPENDED status if backend supports it
      // Store suspend reason in company_info or additional_settings if needed
    };
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.updateCompany(company.company_id, updateData);  // snake_case
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`${this.i18n.t('pages.companies.companySuspended')} "${company.company_name}"`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error(this.i18n.t('pages.companies.failedToSuspend'), err.message)
    );
  }

  // Helper methods for status checking
  isCompanyPublic(company: Company): boolean {
    if (typeof company.status === 'string') {
      return company.status.toUpperCase() === 'PUBLIC';  // snake_case - use uppercase
    }
    return company.status === 1;
  }

  isCompanyPending(company: Company): boolean {
    if (typeof company.status === 'string') {
      return company.status.toUpperCase() === 'PENDING';  // snake_case - use uppercase
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
    return row.company_id;  // snake_case
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
      this.companyService.updateCompany(company.company_id, { status: 'PUBLIC' } as CompanyUpdate).toPromise().then(() => {  // snake_case
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
      this.companyService.updateCompany(company.company_id, { status: 'PENDING' } as CompanyUpdate).toPromise().then(() => {  // snake_case
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
      this.companyService.deleteCompany(company.company_id).toPromise().then(() => {  // snake_case
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
  getStatusClassForDisplay(status: 'PUBLIC' | 'PENDING' | number): string {
    const statusStr = this.getStatusString(status);
    if (statusStr === 'PUBLIC') return 'text-green-600 font-semibold';
    if (statusStr === 'PENDING') return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  }

  getStatusString(status: 'PUBLIC' | 'PENDING' | number): string {
    if (typeof status === 'string') {
      return status.toUpperCase();  // snake_case - return uppercase
    }
    return status === 1 ? 'PUBLIC' : 'PENDING';  // snake_case - return uppercase
  }

  getStatusDisplayText(status: 'PUBLIC' | 'PENDING' | number): string {
    const statusStr = this.getStatusString(status);
    return statusStr;
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getImageUrl(path: string | null): string {
    if (!path) return '';
    return this.fileUploadService.getImageUrl(path);
  }

  // Settings Modal
  openSettingsModal(company: Company): void {
    this.selectedCompany.set(company);
    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.getSettings(company.company_id);  // snake_case - use getSettings method
    this.subscribe(
      obs,
      (settings) => {
        // Map backend settings to frontend CompanySettings (snake_case)
        const additionalSettings = settings.additional_settings || {};
        this.settings = {
          company_id: settings.company_id,  // snake_case
          max_users: settings.max_users || 10,  // snake_case
          max_devices: settings.max_devices || 5,  // snake_case
          max_storage_gb: settings.max_storage_gb || 10,  // snake_case
          subscription_type: settings.subscription_type || 'trial',  // snake_case
          features: settings.features || [],
          additional_settings: {
            timezone: additionalSettings['timezone'] || 'UTC',
            language: additionalSettings['language'] || 'en',
            dateFormat: additionalSettings['dateFormat'] || 'YYYY-MM-DD',
            timeFormat: additionalSettings['timeFormat'] || '24h',
            currency: additionalSettings['currency'] || 'USD',
            notifications: additionalSettings['notifications'] || {
              email: true,
              sms: false,
              push: true,
              webhook: false,
              webhookUrl: ''
            },
            security: additionalSettings['security'] || {
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
            integrations: additionalSettings['integrations'] || {
              ldap: { enabled: false, server: '', port: 389, baseDn: '', bindDn: '', bindPassword: '' },
              sso: { enabled: false, provider: '', clientId: '', clientSecret: '', redirectUri: '' },
              api: { enabled: false, rateLimit: 100, allowedOrigins: [], apiKey: '' }
            },
            ...additionalSettings  // Preserve any other additional settings
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

  // Helper methods for additional_settings access (for two-way binding)
  getTimezone(): string {
    return this.settings.additional_settings['timezone'] || 'UTC';
  }

  setTimezone(value: string): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    this.settings.additional_settings['timezone'] = value;
  }

  getLanguage(): string {
    return this.settings.additional_settings['language'] || 'en';
  }

  setLanguage(value: string): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    this.settings.additional_settings['language'] = value;
  }

  getDateFormat(): string {
    return this.settings.additional_settings['dateFormat'] || 'YYYY-MM-DD';
  }

  setDateFormat(value: string): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    this.settings.additional_settings['dateFormat'] = value;
  }

  getTimeFormat(): string {
    return this.settings.additional_settings['timeFormat'] || '24h';
  }

  setTimeFormat(value: string): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    this.settings.additional_settings['timeFormat'] = value;
  }

  getNotifications(): any {
    if (!this.settings.additional_settings['notifications']) {
      this.settings.additional_settings['notifications'] = {
        email: true,
        sms: false,
        push: true,
        webhook: false,
        webhookUrl: ''
      };
    }
    return this.settings.additional_settings['notifications'];
  }

  setNotificationField(field: string, value: boolean | string): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    if (!this.settings.additional_settings['notifications']) {
      this.settings.additional_settings['notifications'] = {};
    }
    this.settings.additional_settings['notifications'][field] = value;
  }

  getSecurity(): any {
    if (!this.settings.additional_settings['security']) {
      this.settings.additional_settings['security'] = {
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
      };
    }
    return this.settings.additional_settings['security'];
  }

  setSecurityField(field: string, value: any): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    if (!this.settings.additional_settings['security']) {
      this.settings.additional_settings['security'] = {};
    }
    this.settings.additional_settings['security'][field] = value;
  }

  setPasswordPolicyField(field: string, value: any): void {
    if (!this.settings.additional_settings) {
      this.settings.additional_settings = {};
    }
    if (!this.settings.additional_settings['security']) {
      this.settings.additional_settings['security'] = {};
    }
    if (!this.settings.additional_settings['security']['passwordPolicy']) {
      this.settings.additional_settings['security']['passwordPolicy'] = {};
    }
    this.settings.additional_settings['security']['passwordPolicy'][field] = value;
  }

  private getDefaultSettings(): CompanySettings {
    return {
      company_id: '',  // snake_case
      max_users: 10,  // snake_case
      max_devices: 5,  // snake_case
      max_storage_gb: 10,  // snake_case
      subscription_type: 'trial',  // snake_case
      features: [],
      additional_settings: {
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
          ldap: { enabled: false, server: '', port: 389, baseDn: '', bindDn: '', bindPassword: '' },
          sso: { enabled: false, provider: '', clientId: '', clientSecret: '', redirectUri: '' },
          api: { enabled: false, rateLimit: 100, allowedOrigins: [], apiKey: '' }
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

    // Transform to backend format (snake_case)
    const backendSettings: CompanySettingsUpdate = {
      max_users: this.settings.max_users || 10,  // snake_case
      max_devices: this.settings.max_devices || 5,  // snake_case
      max_storage_gb: this.settings.max_storage_gb || 10,  // snake_case
      subscription_type: this.settings.subscription_type || 'trial',  // snake_case
      features: this.settings.features || [],
      additional_settings: this.settings.additional_settings || {}  // snake_case - store all additional settings here
    };

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.updateSettings(this.selectedCompany()!.company_id, backendSettings);  // snake_case
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
    // Export companies to CSV
    const companies = this.companies();
    if (companies.length === 0) {
      this.toastr.warning(this.i18n.t('pages.companies.noCompaniesToExport'));
      return;
    }

    // Create CSV content
    const headers = ['Company Name', 'Company Code', 'Owner Name', 'Contact', 'Address', 'Status', 'Created At'];
    const rows = companies.map(c => [
      c.company_name || '',  // snake_case
      c.company_code || '',  // snake_case
      c.owner_name || '',  // snake_case
      c.contact || '',
      c.address || '',
      typeof c.status === 'string' ? c.status : (c.status === 1 ? 'PUBLIC' : 'PENDING'),
      c.created_at || ''  // snake_case
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `companies-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toastr.success(this.i18n.t('pages.companies.companiesExported'));
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
