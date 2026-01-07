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
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../../shared/components/page-layout/page-layout.component';
import { VisitorService } from '../../../../core/services/visitor.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Visitor, VisitorCreate, VisitorVisit, getVisitorFullName } from '../../../../core/models/visitor.model';
import { VisitorType, VisitorStatus, VisitPurpose } from '../../../../core/models/enums.model';
import { UUID } from '../../../../core/models/base.model';
import { PaginatedApiResponse } from '../../../../core/utils/response-handler';
import { BaseComponent } from '../../../../core/base/base.component';

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
    { key: 'first_name', label: 'First Name', sortable: true },  // snake_case
    { key: 'last_name', label: 'Last Name', sortable: true },  // snake_case
    { key: 'company_name', label: 'Company', sortable: true },  // snake_case
    { key: 'visit_purpose', label: 'Purpose' },  // snake_case
    { key: 'host_name', label: 'Host' },  // snake_case
    { key: 'check_in_time', label: 'Check-in', render: (value) => value ? new Date(value).toLocaleString() : '-' },  // snake_case
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
      first_name: ['', [Validators.required]],  // snake_case
      last_name: ['', [Validators.required]],  // snake_case
      email: ['', [this.validationService.emailValidator()]],
      phone: ['', [this.validationService.phoneValidator()]],
      company_name: [''],  // snake_case
      visitor_type: [VisitorType.GUEST, [Validators.required]],  // snake_case
      visit_purpose: [VisitPurpose.MEETING, [Validators.required]]  // snake_case
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
      first_name: '',  // snake_case
      last_name: '',  // snake_case
      email: '',
      phone: '',
      company_name: '',  // snake_case
      visitor_type: VisitorType.GUEST,  // snake_case
      visit_purpose: VisitPurpose.MEETING  // snake_case
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
      first_name: visitor.first_name,  // snake_case
      last_name: visitor.last_name,  // snake_case
      email: visitor.email,
      phone: visitor.phone,
      company_name: visitor.company_name,  // snake_case
      visitor_type: visitor.visitor_type,  // snake_case
      visit_purpose: visitor.visit_purpose  // snake_case
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
      ? this.visitorService.updateVisitor(this.editingVisitor()!.visitor_id, formValue as VisitorCreate)  // snake_case: visitor_id
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
        info: this.visitorService.getVisitorById(visitor.visitor_id),  // snake_case: visitor_id
        visits: this.visitorService.getVisits({ visitor_id: visitor.visitor_id })  // snake_case: visitor_id, ใช้ getVisits แทน getVisitorVisits
      }).pipe(finalize(() => this.detailLoading.set(false))),
      ({ info, visits }) => {
        this.detailVisitor.set(info);
        this.detailVisits.set(visits.data || []);  // Extract data from PaginatedApiResponse
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
      'first_name': 'ชื่อ',  // snake_case
      'last_name': 'นามสกุล',  // snake_case
      'email': 'Email',
      'phone': 'เบอร์โทรศัพท์',
      'company_name': 'Company Name',  // snake_case
      'visitor_type': 'Visitor Type',  // snake_case
      'visit_purpose': 'Visit Purpose'  // snake_case
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

