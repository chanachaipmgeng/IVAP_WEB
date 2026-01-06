/**
 * Biometric Data Component
 *
 * Component for managing biometric data (fingerprint, face, iris, etc.).
 * Supports full CRUD operations, filtering, statistics, and biometric data management.
 *
 * @example
 * ```html
 * <app-biometric-data></app-biometric-data>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BiometricDataService } from '../../../core/services/biometric-data.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import {
  BiometricData,
  BiometricType,
  CreateBiometricDataDto,
  UpdateBiometricDataDto,
  BIOMETRIC_TYPE_LABELS
} from '../../../core/models/biometric-data.model';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-biometric-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './biometric-data.component.html',
  styleUrls: ['./biometric-data.component.scss']
})
export class BiometricDataComponent implements OnInit {
  private biometricService = inject(BiometricDataService);
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private fb = inject(FormBuilder);
  private i18n = inject(I18nService);

  // Signals
  biometricData = signal<BiometricData[]>([]);
  filteredData = signal<BiometricData[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  selectedData = signal<BiometricData | null>(null);
  showVerifyModal = signal(false);
  errorMessage = signal<string>('');

  // Form
  biometricForm: FormGroup;

  // Filters
  filterType = signal<BiometricType | ''>('');
  searchTerm = signal('');
  memberIdFilter = signal('');

  // Enums
  BiometricType = BiometricType;
  BIOMETRIC_TYPE_LABELS = BIOMETRIC_TYPE_LABELS;
  biometricTypes = computed(() => Object.values(BiometricType));

  // Statistics
  statistics = computed(() => {
    const data = this.biometricData();
    return {
      total: data.length,
      by_type: Object.values(BiometricType).reduce((acc, type) => {
        acc[type] = data.filter(d => d.biometricType === type).length;
        return acc;
      }, {} as Record<BiometricType, number>),
      primary: data.filter(d => d.isPrimary).length
    };
  });

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.statistics();
    return [
      {
        icon: '👤',
        label: 'Total',
        value: stats.total,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '👆',
        label: 'Fingerprint',
        value: stats.by_type[BiometricType.FINGERPRINT],
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '😊',
        label: 'Face',
        value: stats.by_type[BiometricType.FACE],
        iconBgClass: 'bg-purple-100 dark:bg-purple-900'
      },
      {
        icon: '⭐',
        label: 'Primary',
        value: stats.primary,
        iconBgClass: 'bg-orange-100 dark:bg-orange-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add Biometric Data',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search...',
      value: this.searchTerm()
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...this.biometricTypes().map(type => ({
          value: type,
          label: BIOMETRIC_TYPE_LABELS[type]
        }))
      ],
      value: this.filterType()
    },
    {
      key: 'memberId',
      label: 'Member ID',
      type: 'text',
      placeholder: 'Filter by member ID...',
      value: this.memberIdFilter()
    }
  ]);

  constructor() {
    this.biometricForm = this.fb.group({
      member_id: ['', [Validators.required, this.validationService.uuidValidator()]],
      biometric_type: [BiometricType.FACE, [Validators.required]],
      biometric_value: ['', [Validators.required, this.validationService.base64Validator()]],
      is_primary: [false]
    });
  }

  ngOnInit() {
    this.loadBiometricData();
  }

  loadBiometricData() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.biometricService.getBiometricData(
      this.memberIdFilter() || undefined,
      this.filterType() || undefined
    ).subscribe({
      next: (data) => {
        this.biometricData.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Biometric ได้');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.biometricData()];
    const search = this.searchTerm().toLowerCase();
    const type = this.filterType();

    if (search) {
      filtered = filtered.filter(d =>
        d.memberId.toLowerCase().includes(search) ||
        d.biometricType.toLowerCase().includes(search)
      );
    }

    if (type) {
      filtered = filtered.filter(d => d.biometricType === type);
    }

    this.filteredData.set(filtered);
  }

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchTerm.set(event.value);
    } else if (event.key === 'type') {
      this.filterType.set(event.value);
    } else if (event.key === 'memberId') {
      this.memberIdFilter.set(event.value);
    }
    this.applyFilters();
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  updateFilterType(value: BiometricType | ''): void {
    this.filterType.set(value);
    this.applyFilters();
  }

  openAddModal(): void {
    this.selectedData.set(null);
    this.biometricForm.reset({
      member_id: '',
      biometric_type: BiometricType.FACE,
      biometric_value: '',
      is_primary: false
    });
    this.showModal.set(true);
  }

  openCreateModal() {
    this.openAddModal();
  }

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.biometricForm.reset({
      member_id: '',
      biometric_type: BiometricType.FACE,
      biometric_value: '',
      is_primary: false
    });
    this.biometricForm.markAsUntouched();
    this.errorMessage.set('');
  }

  columns: TableColumn[] = [
    { key: 'member_id', label: 'Member ID', sortable: true },
    { key: 'biometric_type', label: 'Type', sortable: true },
    {
      key: 'is_primary',
      label: 'Primary',
      render: (value) => value ? '⭐' : '-'
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (value) => value ? new Date(value).toLocaleString() : '-'
    }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editBiometricData(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteBiometricData(row)
    }
  ];

  saveBiometricData(): void {
    this.submitBiometricData();
  }

  editBiometricData(data: BiometricData): void {
    this.selectedData.set(data);
    this.biometricForm.patchValue({
      member_id: data.memberId,
      biometric_type: data.biometricType,
      biometric_value: data.biometricValue,
      is_primary: data.isPrimary
    });
    this.showModal.set(true);
  }

  submitBiometricData() {
    if (this.biometricForm.invalid) {
      this.biometricForm.markAllAsTouched();
      this.errorHandler.showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    const formValue = this.biometricForm.value as CreateBiometricDataDto;
    const request = this.selectedData()
      ? this.biometricService.updateBiometricData(this.selectedData()!.id, formValue as UpdateBiometricDataDto)
      : this.biometricService.createBiometricData(formValue);
    
    request.subscribe({
      next: () => {
        this.errorHandler.showSuccess(this.selectedData() ? 'อัปเดตข้อมูล Biometric สำเร็จ' : 'สร้างข้อมูล Biometric สำเร็จ');
        this.loadBiometricData();
        this.closeModal();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถบันทึกข้อมูล Biometric ได้');
        this.isLoading.set(false);
      }
    });
  }

  deleteBiometricData(data: BiometricData) {
    if (!confirm(`ต้องการลบข้อมูล Biometric นี้หรือไม่?`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.biometricService.deleteBiometricData(data.id).subscribe({
      next: () => {
        this.errorHandler.showSuccess('ลบข้อมูลสำเร็จ');
        this.loadBiometricData();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลบข้อมูล Biometric ได้');
        this.isLoading.set(false);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.biometricForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return this.validationService.getValidationErrorMessage(control, this.getFieldLabel(fieldName));
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'member_id': 'Member ID',
      'biometric_type': 'ประเภท',
      'biometric_value': 'Biometric Value'
    };
    return labels[fieldName] || fieldName;
  }

  viewBiometricData(data: BiometricData) {
    this.selectedData.set(data);
  }

  closeViewModal() {
    this.selectedData.set(null);
  }

  openVerifyModal() {
    this.showVerifyModal.set(true);
  }

  closeVerifyModal() {
    this.showVerifyModal.set(false);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

