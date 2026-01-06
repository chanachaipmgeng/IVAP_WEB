/**
 * Vehicles Component
 *
 * Vehicle management component with CRUD operations, check-in/check-out functionality,
 * statistics tracking, and export functionality. Supports vehicle registration, editing,
 * status management, and CSV export.
 *
 * @example
 * ```html
 * <app-vehicles></app-vehicles>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs.component';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Vehicle, VehicleCreate } from '../../../core/models/vehicle.model';
import { PaginatedResponse } from '../../../core/models/base.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    TabsComponent
  ],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss'
})
export class VehiclesComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  saving = signal(false);
  loading = signal(false);
  activeTab = signal<'vehicles' | 'parking'>('vehicles');

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'vehicles' | 'parking');
  }

  onFilterChange(event: { key: string; value: any }): void {
    (this.filters as any)[event.key] = event.value;
    this.loadVehicles();
  }
  editingVehicle = signal<Vehicle | null>(null);
  vehicles = signal<Vehicle[]>([]);
  totalRecords = signal(0);
  errorMessage = signal<string>('');

  // Form
  vehicleForm: FormGroup;

  // Computed statistics
  parkedCount = computed(() => this.vehicles().filter(v => v.status === 'parked').length);
  leftCount = computed(() => this.vehicles().filter(v => v.status === 'left').length);
  reservedCount = computed(() => this.vehicles().filter(v => v.status === 'reserved').length);

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => [
    {
      icon: '🅿️',
      label: 'Parked',
      value: this.parkedCount(),
      iconBgClass: 'bg-green-100 dark:bg-green-900'
    },
    {
      icon: '🚗',
      label: 'Left',
      value: this.leftCount(),
      iconBgClass: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      icon: '📋',
      label: 'Reserved',
      value: this.reservedCount(),
      iconBgClass: 'bg-yellow-100 dark:bg-yellow-900'
    }
  ]);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadVehicles()
    },
    {
      label: this.i18n.t('common.add') + ' Vehicle',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'parking', label: 'Parking' }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: this.i18n.t('common.search'),
      type: 'text',
      placeholder: 'Search vehicles...',
      value: this.filters.search
    },
    {
      key: 'status',
      label: this.i18n.t('common.status'),
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'parked', label: 'Parked' },
        { value: 'left', label: 'Left' },
        { value: 'reserved', label: 'Reserved' }
      ],
      value: this.filters.status
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Type',
      type: 'select',
      options: [
        { value: '', label: this.i18n.t('common.all') },
        { value: 'car', label: 'Car' },
        { value: 'motorcycle', label: 'Motorcycle' },
        { value: 'truck', label: 'Truck' }
      ],
      value: this.filters.vehicleType
    }
  ]);

  filters = {
    status: '',
    vehicleType: '',
    search: ''
  };

  columns: TableColumn[] = [
    { key: 'plateNumber', label: 'License Plate', sortable: true },
    { key: 'vehicleType', label: 'Type', sortable: true },
    { key: 'brand', label: 'Brand', sortable: true },
    { key: 'model', label: 'Model' },
    { key: 'color', label: 'Color' },
    { key: 'ownerName', label: 'Owner Name' },
    { key: 'parkingSpotNumber', label: 'Spot Number' },
    {
      key: 'checkInTime',
      label: 'Check In',
      render: (value) => value ? new Date(value).toLocaleString() : '-'
    },
    {
      key: 'checkOutTime',
      label: 'Check Out',
      render: (value) => value ? new Date(value).toLocaleString() : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value || '-'
    }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      variant: 'secondary',
      onClick: (vehicle) => this.editVehicle(vehicle)
    },
    {
      icon: '🚗',
      label: 'Check In',
      variant: 'primary',
      onClick: (vehicle) => this.checkInVehicle(vehicle)
    },
    {
      icon: '🚪',
      label: 'Check Out',
      variant: 'secondary',
      onClick: (vehicle) => this.checkOutVehicle(vehicle)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (vehicle) => this.deleteVehicle(vehicle)
    }
  ];

  constructor(
    private vehicleService: VehicleService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
    this.vehicleForm = this.fb.group({
      plateNumber: ['', [Validators.required, this.validationService.licensePlateValidator()]],
      brand: ['', [Validators.required]],
      model: [''],
      color: [''],
      vehicleType: ['car', [Validators.required]],
      ownerType: ['employee', [Validators.required]],
      ownerName: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadVehicles();
  }

  /**
   * Load vehicles with filters and pagination
   */
  loadVehicles(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.vehicleService.getVehicles().subscribe({
      next: (response: PaginatedResponse<Vehicle>) => {
        this.vehicles.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Vehicles ได้');
        this.loading.set(false);
      }
    });
  }

  openAddModal(): void {
    this.editingVehicle.set(null);
    this.vehicleForm.reset({
      plateNumber: '',
      brand: '',
      model: '',
      color: '',
      vehicleType: 'car',
      ownerType: 'employee',
      ownerName: ''
    });
    this.vehicleForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  /**
   * Edit vehicle
   */
  editVehicle(vehicle: Vehicle): void {
    this.editingVehicle.set(vehicle);
    this.vehicleForm.patchValue({
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType,
      ownerType: vehicle.ownerType,
      ownerName: vehicle.ownerName
    });
    this.vehicleForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  saveVehicle(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      this.errorHandler.showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    const formValue = this.vehicleForm.value;
    const request = this.editingVehicle()
      ? this.vehicleService.updateVehicle(this.editingVehicle()!.id, formValue)
      : this.vehicleService.createVehicle(formValue as VehicleCreate);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.errorHandler.showSuccess(this.editingVehicle() ? 'อัปเดต Vehicle สำเร็จ' : 'สร้าง Vehicle สำเร็จ');
        this.saving.set(false);
        this.showModal.set(false);
        this.editingVehicle.set(null);
        this.loadVehicles();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถบันทึกข้อมูล Vehicle ได้');
        this.saving.set(false);
      }
    );
  }

  /**
   * Check in vehicle
   */
  checkInVehicle(vehicle: Vehicle): void {
    this.loading.set(true);
    this.vehicleService.checkInVehicle(vehicle.id, {
      checkInTime: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.errorHandler.showSuccess('Vehicle checked in successfully!');
        this.loadVehicles();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.loading.set(false);
      }
    });
  }

  checkOutVehicle(vehicle: Vehicle): void {
    this.loading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.vehicleService.checkOutVehicle(vehicle.id, {
        checkOutTime: new Date().toISOString()
      }),
      () => {
        this.errorHandler.showSuccess('Vehicle checked out successfully!');
        this.loadVehicles();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.loading.set(false);
      }
    );
  }

  /**
   * Delete vehicle
   */
  deleteVehicle(vehicle: Vehicle): void {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    this.loading.set(true);
    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.vehicleService.deleteVehicle(vehicle.id),
      () => {
        this.errorHandler.showSuccess('ลบ Vehicle สำเร็จ');
        this.loadVehicles();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลบ Vehicle ได้');
        this.loading.set(false);
      }
    );
  }

  getFieldError(fieldName: string): string {
    const control = this.vehicleForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return this.validationService.getValidationErrorMessage(control, this.getFieldLabel(fieldName));
    }
    return '';
  }

  /**
   * Get field label for validation
   */
  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'plateNumber': 'License Plate',
      'brand': 'Brand',
      'model': 'Model',
      'color': 'Color',
      'vehicleType': 'Vehicle Type',
      'ownerType': 'Owner Type',
      'ownerName': 'Owner Name'
    };
    return labels[fieldName] || fieldName;
  }

  applyFilters(): void {
    this.loadVehicles();
  }

  clearFilters(): void {
    this.filters = { status: '', vehicleType: '', search: '' };
    this.loadVehicles();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingVehicle.set(null);
    this.vehicleForm.reset();
  }

  /**
   * Export vehicles to CSV
   */
  exportToCSV(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.vehicleService.exportVehicles(),
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vehicles_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.errorHandler.showSuccess('Export สำเร็จ');
        this.loading.set(false);
      },
      (error: any) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถ Export Vehicles ได้');
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
