/**
 * Departments Management Component
 *
 * Component for managing company departments with full CRUD operations.
 * Supports filtering, searching, pagination, and department hierarchy management.
 *
 * @example
 * ```html
 * <app-departments></app-departments>
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
import { ModalFormComponent } from '../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../shared/components/form-field/form-field.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { DepartmentService } from '../../../core/services/department.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Department, DepartmentCreate, DepartmentUpdate } from '../../../core/models/department.model';
import { PaginatedApiResponse } from '../../../core/utils/response-handler';
import { UUID } from '../../../core/models/base.model';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    ModalFormComponent,
    FilterSectionComponent,
    EmptyStateComponent
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})
export class DepartmentsComponent implements OnInit {
  // Data & State Signals
  departments = signal<Department[]>([]);
  totalRecords = signal(0);
  loading = signal(false);
  errorMessage = signal<string>('');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Search & Filter State
  searchQuery = signal('');
  filters = signal<any>({});

  // Modal State
  showModal = signal(false);
  showDeleteModal = signal(false);
  saving = signal(false);
  deleting = signal(false);
  editingDepartment = signal<Department | null>(null);
  deletingDepartment = signal<Department | null>(null);

  // Form Data
  formData: DepartmentCreate = {
    thName: '',
    engName: '',
    companyId: ''
  };

  // Table Configuration
  columns: TableColumn[] = [
    { key: 'thName', label: 'ชื่อแผนก (ไทย)', sortable: true },
    { key: 'engName', label: 'Department Name (EN)', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true, type: 'date' }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editDepartment(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.confirmDelete(row)
    }
  ];

  // Filter Fields
  filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search departments...'
    }
  ];

  // Page Actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add Department',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Empty State Actions
  emptyStateActions = computed(() => [
    {
      label: this.i18n.translate('pages.departments.addDepartment'),
      onClick: () => this.openAddModal()
    }
  ]);

  // Form Fields Configuration
  formFields = computed<FormFieldConfig[]>(() => {
    const dept = this.editingDepartment();
    return [
      {
        key: 'thName',
        label: 'ชื่อแผนก (ไทย)',
        type: 'text',
        placeholder: 'แผนกเทคโนโลยีสารสนเทศ',
        required: true,
        value: dept?.thName || this.formData.thName || ''
      },
      {
        key: 'engName',
        label: 'Department Name (English)',
        type: 'text',
        placeholder: 'Information Technology Department',
        required: true,
        value: dept?.engName || this.formData.engName || ''
      }
    ];
  });

  constructor(
    private departmentService: DepartmentService,
    private auth: AuthService,
    private i18n: I18nService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  /**
   * Load departments with pagination and filters
   */
  loadDepartments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.errorMessage.set('Company ID not found');
      this.loading.set(false);
      return;
    }

    const filters: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      ...this.filters()
    };

    if (this.searchQuery()) {
      filters.search = this.searchQuery();
    }

    this.departmentService.getByCompanyId(String(companyId), filters).subscribe({
      next: (response: PaginatedApiResponse<Department>) => {
        this.departments.set(response.data || []);
        this.totalRecords.set(response.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.loading.set(false);
        this.departments.set([]);
      }
    });
  }

  /**
   * Open add department modal
   */
  openAddModal(): void {
    this.editingDepartment.set(null);
    this.formData = {
      thName: '',
      engName: '',
      companyId: String(this.auth.currentUser()?.companyId || '')
    };
    this.showModal.set(true);
  }

  /**
   * Edit department
   */
  editDepartment(dept: Department): void {
    this.editingDepartment.set(dept);
    this.formData = {
      thName: dept.thName,
      engName: dept.engName,
      companyId: dept.companyId
    };
    this.showModal.set(true);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingDepartment.set(null);
    this.formData = {
      thName: '',
      engName: '',
      companyId: ''
    };
  }

  /**
   * Handle form submission
   */
  onFormSubmitted(formData: Record<string, any>): void {
    this.formData = {
      thName: formData['thName'] || '',
      engName: formData['engName'] || '',
      companyId: String(this.auth.currentUser()?.companyId || '')
    };
    this.saveDepartment();
  }

  /**
   * Save department (create or update)
   */
  saveDepartment(): void {
    if (!this.formData.thName || !this.formData.engName) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.errorMessage.set('Company ID not found');
      this.saving.set(false);
      return;
    }

    const dept = this.editingDepartment();
    const request = dept
      ? this.departmentService.update(dept.id, this.formData as DepartmentUpdate)
      : this.departmentService.create({ ...this.formData, companyId: String(companyId) });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadDepartments();
      },
      error: (error) => {
        console.error('Error saving department:', error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.saving.set(false);
      }
    });
  }

  /**
   * Confirm delete
   */
  confirmDelete(dept: Department): void {
    this.deletingDepartment.set(dept);
    this.showDeleteModal.set(true);
  }

  /**
   * Delete department
   */
  deleteDepartment(): void {
    const dept = this.deletingDepartment();
    if (!dept) return;

    this.deleting.set(true);
    this.errorMessage.set('');

    this.departmentService.delete(dept.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingDepartment.set(null);
        this.loadDepartments();
      },
      error: (error) => {
        console.error('Error deleting department:', error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.deleting.set(false);
      }
    });
  }

  /**
   * Cancel delete
   */
  cancelDelete(): void {
    this.showDeleteModal.set(false);
    this.deletingDepartment.set(null);
  }

  /**
   * Handle search
   */
  onSearch(search: string): void {
    this.searchQuery.set(search);
    this.currentPage.set(1);
    this.loadDepartments();
  }

  /**
   * Handle filter change
   */
  onFilterChange(filters: any): void {
    this.filters.set(filters);
    this.currentPage.set(1);
    this.loadDepartments();
  }

  /**
   * Handle pagination
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadDepartments();
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadDepartments();
  }

  /**
   * Translate helper
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}
