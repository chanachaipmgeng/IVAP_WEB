/**
 * Positions Management Component
 *
 * Component for managing company positions/job titles with full CRUD operations.
 * Supports filtering, searching, pagination, and position hierarchy management.
 *
 * @example
 * ```html
 * <app-positions></app-positions>
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
import { PositionService } from '../../../core/services/position.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Position, PositionCreate, PositionUpdate } from '../../../core/models/position.model';
import { PaginatedApiResponse } from '../../../core/utils/response-handler';
import { UUID } from '../../../core/models/base.model';

@Component({
  selector: 'app-positions',
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
  templateUrl: './positions.component.html',
  styleUrl: './positions.component.scss'
})
export class PositionsComponent implements OnInit {
  // Data & State Signals
  positions = signal<Position[]>([]);
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
  editingPosition = signal<Position | null>(null);
  deletingPosition = signal<Position | null>(null);

  // Form Data
  formData: PositionCreate = {
    thName: '',
    engName: '',
    companyId: ''
  };

  // Table Configuration
  columns: TableColumn[] = [
    { key: 'thName', label: 'ชื่อตำแหน่ง (ไทย)', sortable: true },
    { key: 'engName', label: 'Position Name (EN)', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true, type: 'date' }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editPosition(row)
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
      placeholder: 'Search positions...'
    }
  ];

  // Page Actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add Position',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Empty State Actions
  emptyStateActions = computed(() => [
    {
      label: this.i18n.translate('pages.positions.addPosition'),
      onClick: () => this.openAddModal()
    }
  ]);

  // Form Fields Configuration
  formFields = computed<FormFieldConfig[]>(() => {
    const pos = this.editingPosition();
    return [
      {
        key: 'thName',
        label: 'ชื่อตำแหน่ง (ไทย)',
        type: 'text',
        placeholder: 'วิศวกรซอฟต์แวร์',
        required: true,
        value: pos?.thName || this.formData.thName || ''
      },
      {
        key: 'engName',
        label: 'Position Name (English)',
        type: 'text',
        placeholder: 'Software Engineer',
        required: true,
        value: pos?.engName || this.formData.engName || ''
      }
    ];
  });

  constructor(
    private positionService: PositionService,
    private auth: AuthService,
    private i18n: I18nService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadPositions();
  }

  /**
   * Load positions with pagination and filters
   */
  loadPositions(): void {
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

    this.positionService.getByCompanyId(String(companyId), filters).subscribe({
      next: (response: PaginatedApiResponse<Position>) => {
        this.positions.set(response.data || []);
        this.totalRecords.set(response.total || 0);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading positions:', error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.loading.set(false);
        this.positions.set([]);
      }
    });
  }

  /**
   * Open add position modal
   */
  openAddModal(): void {
    this.editingPosition.set(null);
    this.formData = {
      thName: '',
      engName: '',
      companyId: String(this.auth.currentUser()?.companyId || '')
    };
    this.showModal.set(true);
  }

  /**
   * Edit position
   */
  editPosition(pos: Position): void {
    this.editingPosition.set(pos);
    this.formData = {
      thName: pos.thName,
      engName: pos.engName,
      companyId: pos.companyId
    };
    this.showModal.set(true);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingPosition.set(null);
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
    this.savePosition();
  }

  /**
   * Save position (create or update)
   */
  savePosition(): void {
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

    const pos = this.editingPosition();
    const request = pos
      ? this.positionService.update(pos.id, this.formData as PositionUpdate)
      : this.positionService.create({ ...this.formData, companyId: String(companyId) });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadPositions();
      },
      error: (error) => {
        console.error('Error saving position:', error);
        this.errorMessage.set(this.errorHandler.getErrorMessage(error));
        this.saving.set(false);
      }
    });
  }

  /**
   * Confirm delete
   */
  confirmDelete(pos: Position): void {
    this.deletingPosition.set(pos);
    this.showDeleteModal.set(true);
  }

  /**
   * Delete position
   */
  deletePosition(): void {
    const pos = this.deletingPosition();
    if (!pos) return;

    this.deleting.set(true);
    this.errorMessage.set('');

    this.positionService.delete(pos.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.deletingPosition.set(null);
        this.loadPositions();
      },
      error: (error) => {
        console.error('Error deleting position:', error);
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
    this.deletingPosition.set(null);
  }

  /**
   * Handle search
   */
  onSearch(search: string): void {
    this.searchQuery.set(search);
    this.currentPage.set(1);
    this.loadPositions();
  }

  /**
   * Handle filter change
   */
  onFilterChange(filters: any): void {
    this.filters.set(filters);
    this.currentPage.set(1);
    this.loadPositions();
  }

  /**
   * Handle pagination
   */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadPositions();
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadPositions();
  }

  /**
   * Translate helper
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}
