/**
 * Visitors Component
 *
 * Visitor management component with CRUD operations, visit history tracking, and export functionality.
 * Supports visitor registration, editing, viewing visit details, and CSV export.
 *
 * @example
 * ```html
 * <app-visitors></app-visitors>
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
import { VisitorService } from '../../../core/services/visitor.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Visitor, VisitorCreate, VisitorVisit, getVisitorFullName } from '../../../core/models/visitor.model';
import { VisitorType, VisitorStatus, VisitPurpose } from '../../../core/models/enums.model';
import { UUID } from '../../../core/models/base.model';
import { PaginatedApiResponse } from '../../../core/utils/response-handler';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-visitors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent
  ],
  templateUrl: './visitors.component.html',
  styleUrl: './visitors.component.scss'
})
export class VisitorsComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private fb = inject(FormBuilder);

  // Expose enums for template
  VisitorType = VisitorType;
  VisitorStatus = VisitorStatus;
  VisitPurpose = VisitPurpose;

  showModal = signal(false);
  saving = signal(false);
  loading = signal(false);
  editingVisitor = signal<Visitor | null>(null);
  visitors = signal<Visitor[]>([]);
  totalRecords = signal(0);
  detailDrawerOpen = signal(false);
  detailLoading = signal(false);
  detailVisitor = signal<Visitor | null>(null);
  detailVisits = signal<VisitorVisit[]>([]);
  errorMessage = signal<string>('');

  // Form
  visitorForm: FormGroup;

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'Register Visitor',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  columns: TableColumn[] = [
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'companyName', label: 'Company', sortable: true },
    { key: 'visitPurpose', label: 'Purpose' },
    { key: 'hostName', label: 'Host' },
    { key: 'checkInTime', label: 'Check-in', render: (value) => value ? new Date(value).toLocaleString() : '-' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => value || VisitorStatus.PENDING
    }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editVisitor(row)
    },
    {
      icon: '📋',
      label: 'View Details',
      onClick: (row) => this.viewDetails(row)
    }
  ];

  constructor(
    private visitorService: VisitorService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
    this.visitorForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [this.validationService.emailValidator()]],
      phone: ['', [this.validationService.phoneValidator()]],
      companyName: [''],
      visitorType: [VisitorType.GUEST, [Validators.required]],
      visitPurpose: [VisitPurpose.MEETING, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadVisitors();
  }

  /**
   * Load visitors with pagination
   */
  loadVisitors(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.visitorService.getVisitors(),
      (response: PaginatedApiResponse<Visitor>) => {
        this.visitors.set(response.data);
        this.totalRecords.set(response.total);
        this.loading.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Visitors ได้');
        this.loading.set(false);
      }
    );
  }

  openAddModal(): void {
    this.editingVisitor.set(null);
    this.visitorForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      visitorType: VisitorType.GUEST,
      visitPurpose: VisitPurpose.MEETING
    });
    this.visitorForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  /**
   * Edit visitor
   */
  editVisitor(visitor: Visitor): void {
    this.editingVisitor.set(visitor);
    this.visitorForm.patchValue({
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      email: visitor.email,
      phone: visitor.phone,
      companyName: visitor.companyName,
      visitorType: visitor.visitorType,
      visitPurpose: visitor.visitPurpose
    });
    this.visitorForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingVisitor.set(null);
    this.errorMessage.set('');
  }

  /**
   * Save visitor (create or update)
   */
  saveVisitor(): void {
    if (this.visitorForm.invalid) {
      this.visitorForm.markAllAsTouched();
      this.errorHandler.showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    const formValue = this.visitorForm.value;
    const request = this.editingVisitor()
      ? this.visitorService.updateVisitor(this.editingVisitor()!.id, formValue as any)
      : this.visitorService.createVisitor(formValue as VisitorCreate);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.errorHandler.showSuccess(this.editingVisitor() ? 'อัปเดต Visitor สำเร็จ' : 'สร้าง Visitor สำเร็จ');
        this.saving.set(false);
        this.closeModal();
        this.loadVisitors();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถบันทึกข้อมูล Visitor ได้');
        this.saving.set(false);
      }
    );
  }

  /**
   * View visitor details and visit history
   */
  viewDetails(visitor: Visitor): void {
    this.detailDrawerOpen.set(true);
    this.detailLoading.set(true);
    this.detailVisitor.set(visitor);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      forkJoin({
        info: this.visitorService.getVisitorById(visitor.id),
        visits: this.visitorService.getVisitorVisits(visitor.id)
      }).pipe(finalize(() => this.detailLoading.set(false))),
      ({ info, visits }) => {
        this.detailVisitor.set(info);
        this.detailVisits.set(visits);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.detailVisits.set([]);
      }
    );
  }

  /**
   * Close detail drawer
   */
  closeDetail(): void {
    this.detailDrawerOpen.set(false);
    this.detailVisitor.set(null);
    this.detailVisits.set([]);
  }

  /**
   * Export visitors to CSV
   */
  exportToCSV(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.visitorService.exportVisitors(),
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `visitors_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.errorHandler.showSuccess('Export สำเร็จ');
        this.loading.set(false);
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถ Export Visitors ได้');
        this.loading.set(false);
      }
    );
  }

  /**
   * Get field validation error message
   */
  getFieldError(fieldName: string): string {
    const control = this.visitorForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return this.validationService.getValidationErrorMessage(control, this.getFieldLabel(fieldName));
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'firstName': 'ชื่อ',
      'lastName': 'นามสกุล',
      'email': 'Email',
      'phone': 'เบอร์โทรศัพท์',
      'companyName': 'Company Name',
      'visitorType': 'Visitor Type',
      'visitPurpose': 'Visit Purpose'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }

  /**
   * Get visitor full name
   */
  visitorName(visitor: Visitor | null): string {
    return visitor ? getVisitorFullName(visitor) : '';
  }

  /**
   * Format date string for display
   */
  formatDate(value?: string | null): string {
    return value ? new Date(value).toLocaleString() : '-';
  }

  /**
   * Format boolean value for display
   */
  formatBoolean(value?: boolean): string {
    return value ? 'Yes' : 'No';
  }
}

