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
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction, SortEvent } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { CompanyService } from '../../../core/services/company.service';
import { Company, CompanyCreate, CompanyUpdate, CompanySettings, CompanySettingsUpdate, CompanyFilters } from '../../../core/models/company.model';
import { FileUploadService } from '../../../core/services/file-upload.service';
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
      return c.status === 0;
    }).length;
  });

  settingsModalTitle = computed(() => {
    const companyName = this.selectedCompany()?.company_name || '';  // snake_case
    return `ตั้งค่า${companyName ? ' - ' + companyName : ''}`;
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'รีเฟรช',
      variant: 'secondary',
      onClick: () => this.loadCompanies()
    },
    {
      label: 'เพิ่มบริษัท',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: 'ค้นหา',
      type: 'text',
      placeholder: 'ค้นหา...',
      value: this.filters.controls.search.value
    },
    {
      key: 'status',
      label: 'สถานะ',
      type: 'select',
      options: [
        { value: '', label: 'สถานะทั้งหมด' },
        { value: 'public', label: 'ใช้งานปกติ' },
        { value: 'pending', label: 'รออนุมัติ' }
      ],
      value: this.filters.controls.status.value
    },
    {
      key: 'subscriptionType',
      label: 'ประเภทสมาชิก',
      type: 'select',
      options: [
        { value: '', label: 'สมาชิกทั้งหมด' },
        { value: 'trial', label: 'ทดลองใช้' },
        { value: 'basic', label: 'พื้นฐาน' },
        { value: 'premium', label: 'พรีเมียม' },
        { value: 'enterprise', label: 'องค์กร' }
      ],
      value: this.filters.controls.subscriptionType?.value || ''
    },
    {
      key: 'createdFrom',
      label: 'สร้างตั้งแต่วันที่',
      type: 'date',
      value: this.filters.controls.createdFrom?.value || ''
    },
    {
      key: 'createdTo',
      label: 'ถึงวันที่',
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
        label: 'ชื่อบริษัท',
        sortable: true,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'company_code',  // snake_case
        label: 'รหัสบริษัท',
        sortable: true,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'owner_name',  // snake_case
        label: 'ชื่อผู้ดูแล',
        sortable: false,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'contact',
        label: 'เบอร์โทรศัพท์',
        sortable: false,
        filterable: false
      },
      {
        key: 'address',
        label: 'ที่อยู่',
        sortable: false,
        filterable: true,
        filterType: 'text'
      },
      {
        key: 'status',
        label: 'สถานะ',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: [
          { value: '', label: 'สถานะทั้งหมด' },
          { value: 'public', label: 'ใช้งานปกติ' },
          { value: 'pending', label: 'รออนุมัติ' }
        ],
        render: (value) => {
          const statusStr = typeof value === 'string' ? value.toUpperCase() : (value === 1 ? 'PUBLIC' : 'PENDING');
          const statusClass = statusStr === 'PUBLIC' ? 'text-green-600' : statusStr === 'PENDING' ? 'text-yellow-600' : 'text-gray-600';
          const statusLabel = statusStr === 'PUBLIC' ? 'ใช้งานปกติ' : statusStr === 'PENDING' ? 'รออนุมัติ' : statusStr;
          return `<span class="${statusClass}">${statusLabel}</span>`;
        }
      },
      {
        key: 'created_at',  // snake_case
        label: 'วันที่สร้าง',
        sortable: true,
        filterable: false,
        render: (value) => value ? this.formatDateTime(value) : ''
      }
    ];
  }

  get actions(): TableAction[] {
    return [
      {
        icon: '🚀',
        label: 'จำลองการเข้าใช้',
        onClick: (row) => this.simulateAccess(row),
        visible: (row) => this.isCompanyPublic(row)
      },
      { icon: '👁️', label: 'ดูรายละเอียด', onClick: (row) => this.openDetailsModal(row) },
      { icon: '✏️', label: 'แก้ไข', onClick: (row) => this.openEditModal(row) },
      { icon: '⚙️', label: 'ตั้งค่า', onClick: (row) => this.openSettingsModal(row) },
      {
        icon: '✅',
        label: 'เปิดใช้งาน',
        onClick: (row) => this.activateCompany(row),
        visible: (row) => this.isCompanyPending(row)
      },
      {
        icon: '⏸️',
        label: 'ปิดใช้งาน',
        onClick: (row) => this.deactivateCompany(row),
        visible: (row) => this.isCompanyPublic(row)
      },
      {
        icon: '⛔',
        label: 'ระงับการใช้งาน',
        variant: 'danger',
        onClick: (row) => this.suspendCompany(row),
        visible: (row) => this.isCompanyPublic(row)
      },
      { icon: '🗑️', label: 'ลบ', variant: 'danger', onClick: (row) => this.deleteCompany(row) }
    ];
  }

  constructor(
    public companyService: CompanyService,
    public fileUploadService: FileUploadService,
    private toastr: ToastrService,
    private router: Router
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
        console.log('response', response);
        this.companies.set(response.data || []);
        this.totalRecords.set(response.total || 0);
        this.loading.set(false);  // Clear loading state
      },
      (err) => {
        this.toastr.error('โหลดข้อมูลไม่สำเร็จ', err.message);
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
          this.toastr.error('โหลดข้อมูลไม่สำเร็จ', err.message);
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

    // Normalize status to uppercase for the select input
    let statusValue: 'PUBLIC' | 'PENDING' = 'PENDING';
    if (typeof company.status === 'string') {
      statusValue = company.status.toUpperCase() as 'PUBLIC' | 'PENDING';
    } else {
      statusValue = company.status === 1 ? 'PUBLIC' : 'PENDING';
    }

    this.formData = {
      company_name: company.company_name || '',  // snake_case
      company_code: company.company_code || '',  // snake_case
      company_info: company.company_info || '',  // snake_case
      address: company.address || '',
      latitude: company.latitude || 0,
      longitude: company.longitude || 0,
      owner_name: company.owner_name || '',  // snake_case
      contact: company.contact || '',
      status: statusValue,
      picture: company.picture
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
      this.toastr.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    // Validate latitude and longitude
    if (this.formData.latitude === undefined || this.formData.longitude === undefined ||
      this.formData.latitude === null || this.formData.longitude === null) {
      this.toastr.error('กรุณาระบุพิกัดตำแหน่ง');
      return;
    }

    // Validate latitude range (-90 to 90)
    if (this.formData.latitude < -90 || this.formData.latitude > 90) {
      this.toastr.error('ละติจูดไม่ถูกต้อง (-90 ถึง 90)');
      return;
    }

    // Validate longitude range (-180 to 180)
    if (this.formData.longitude < -180 || this.formData.longitude > 180) {
      this.toastr.error('ลองจิจูดไม่ถูกต้อง (-180 ถึง 180)');
      return;
    }

    // Validate company code format (alphanumeric, dashes, underscores)
    const codePattern = /^[A-Za-z0-9_-]+$/;
    if (!codePattern.test(this.formData.company_code || '')) {  // snake_case
      this.toastr.error('รูปแบบรหัสบริษัทไม่ถูกต้อง');
      return;
    }

    // Check if code already exists (only for new companies)
    if (!this.editingCompany()) {
      const existingCompany = this.companies().find(c => c.company_code && c.company_code.toLowerCase() === this.formData.company_code?.toLowerCase());  // snake_case
      if (existingCompany) {
        this.toastr.error('รหัสบริษัทนี้มีอยู่ในระบบแล้ว');
        return;
      }
    } else {
      // For editing, check if code exists for another company
      const existingCompany = this.companies().find(c =>
        c.company_code &&
        c.company_code.toLowerCase() === this.formData.company_code?.toLowerCase() &&  // snake_case
        c.company_id !== this.editingCompany()!.company_id  // snake_case
      );
      if (existingCompany) {
        this.toastr.error('รหัสบริษัทนี้มีอยู่ในระบบแล้ว');
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
        this.toastr.success(this.editingCompany() ? 'อัปเดตข้อมูลบริษัทเรียบร้อยแล้ว' : 'สร้างบริษัทเรียบร้อยแล้ว');
        this.saving.set(false);
        this.closeModal();
        this.loadCompanies();
      },
      (err) => {
        this.toastr.error('บันทึกข้อมูลไม่สำเร็จ', err.message || err.error?.detail || 'Unknown error');
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
            this.toastr.success('อัปโหลดรูปภาพเรียบร้อยแล้ว');
          }, 300);
        },
        (err) => {
          clearInterval(progressInterval);
          this.uploadProgress.set(0);
          this.toastr.error('อัปโหลดรูปภาพไม่สำเร็จ', err.message);
          this.uploadingImage.set(false);
        }
      );
    }
  }

  simulateAccess(company: Company): void {
    if (!confirm(`คุณต้องการจำลองการเข้าใช้งานในนามบริษัท "${company.company_name}" หรือไม่?`)) return;

    // Store simulated company details in localStorage
    localStorage.setItem('simulated_company_id', company.company_id);
    localStorage.setItem('simulated_company_name', company.company_name);

    this.toastr.info(`กำลังเข้าสู่โหมดจำลองบริษัท "${company.company_name}"`, 'กรุณารอสักครู่');

    // Navigate to portal dashboard
    setTimeout(() => {
        this.router.navigate(['/portal/dashboard']);
    }, 500);
  }

  deleteCompany(company: Company): void {
    if (!confirm(`คุณต้องการลบ "${company.company_name}"?`)) return;  // snake_case

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.deleteCompany(company.company_id);  // snake_case
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`ลบบริษัท "${company.company_name}" เรียบร้อยแล้ว`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error('ลบบริษัทไม่สำเร็จ', err.message)
    );
  }

  // Status management methods
  activateCompany(company: Company): void {
    if (!confirm(`คุณต้องการเปิดใช้งาน "${company.company_name}"?`)) return;  // snake_case

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.activateCompany(company.company_id);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`เปิดใช้งานบริษัท "${company.company_name}" เรียบร้อยแล้ว`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error('เปิดใช้งานบริษัทไม่สำเร็จ', err.message)
    );
  }

  deactivateCompany(company: Company): void {
    if (!confirm(`คุณต้องการปิดใช้งาน "${company.company_name}"?`)) return;  // snake_case

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.deactivateCompany(company.company_id);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`ปิดใช้งานบริษัท "${company.company_name}" เรียบร้อยแล้ว`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error('ปิดใช้งานบริษัทไม่สำเร็จ', err.message)
    );
  }

  suspendCompany(company: Company): void {
    const reason = prompt('กรุณาระบุเหตุผลในการระงับการใช้งาน');
    if (!reason) return;

    if (!confirm(`คุณต้องการระงับการใช้งาน "${company.company_name}"?`)) return;  // snake_case

    // ✅ Auto-unsubscribe on component destroy
    const obs = this.companyService.suspendCompany(company.company_id, reason);
    this.subscribe(
      obs,
      () => {
        this.toastr.success(`ระงับการใช้งานบริษัท "${company.company_name}" เรียบร้อยแล้ว`);  // snake_case
        this.loadCompanies();
      },
      (err) => this.toastr.error('ระงับการใช้งานบริษัทไม่สำเร็จ', err.message)
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
    return company.status === 0;
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

    if (!confirm(`คุณต้องการเปิดใช้งานบริษัทที่เลือกจำนวน ${selected.length} รายการ?`)) return;

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
      this.toastr.success(`เปิดใช้งานแล้ว ${selected.length} รายการ`);
      this.clearSelection();
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
      this.loadCompanies();
    }).catch(err => {
      this.toastr.error('เปิดใช้งานแบบกลุ่มไม่สำเร็จ', err.message);
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
    });
  }

  bulkDeactivate(): void {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;

    if (!confirm(`คุณต้องการปิดใช้งานบริษัทที่เลือกจำนวน ${selected.length} รายการ?`)) return;

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
      this.toastr.success(`ปิดใช้งานแล้ว ${selected.length} รายการ`);
      this.clearSelection();
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
      this.loadCompanies();
    }).catch(err => {
      this.toastr.error('ปิดใช้งานแบบกลุ่มไม่สำเร็จ', err.message);
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
    });
  }

  bulkDelete(): void {
    const selected = this.selectedCompanies();
    if (selected.length === 0) return;

    if (!confirm(`คุณต้องการลบบริษัทที่เลือกจำนวน ${selected.length} รายการ?`)) return;

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
      this.toastr.success(`ลบแล้ว ${selected.length} รายการ`);
      this.clearSelection();
      this.bulkOperationInProgress.set(false);
      this.bulkOperationProgress.set(0);
      this.loadCompanies();
    }).catch(err => {
      this.toastr.error('ลบแบบกลุ่มไม่สำเร็จ', err.message);
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
    return statusStr === 'PUBLIC' ? 'ใช้งานปกติ' : statusStr === 'PENDING' ? 'รออนุมัติ' : statusStr;
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
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
        this.toastr.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
        this.saving.set(false);
        this.closeSettingsModal();
      },
      (err) => {
        this.toastr.error('บันทึกการตั้งค่าไม่สำเร็จ', err.message || err.error?.detail || 'Unknown error');
        this.saving.set(false);
      }
    );
  }

  exportCompanies(): void {
    // Export companies to CSV
    const companies = this.companies();
    if (companies.length === 0) {
      this.toastr.warning('ไม่มีข้อมูลบริษัทสำหรับส่งออก');
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

    this.toastr.success('ส่งออกข้อมูลเรียบร้อยแล้ว');
  }
}
