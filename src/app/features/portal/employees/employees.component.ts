/**
 * Employees Component
 *
 * Employee management component with CRUD operations, search, filtering, and pagination.
 * Supports employee creation, editing, deletion, and export functionality.
 *
 * @example
 * ```html
 * <app-employees></app-employees>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction, SortEvent } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { ModalFormComponent } from '../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../shared/components/form-field/form-field.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { DepartmentService } from '../../../core/services/department.service';
import { PositionService } from '../../../core/services/position.service';
import { ReportService } from '../../../core/services/report.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import { I18nService } from '../../../core/services/i18n.service';
import { UUID, PaginatedResponse } from '../../../core/models/base.model';
import { BaseComponent } from '../../../core/base/base.component';
import { EmpType, CompanyRoleType } from '../../../core/models/enums.model';
import { Department } from '../../../core/models/department.model';
import { Position } from '../../../core/models/position.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    FilterSectionComponent,
    ModalFormComponent,
    EmptyStateComponent
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private fb = inject(FormBuilder);

  // Data & State Signals
  employees = signal<Employee[]>([]);
  totalRecords = signal(0);
  loading = signal(false);
  errorMessage = signal<string>('');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Search & Sort State
  searchControl = new FormControl('');
  sortBy = signal('employeeId');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Modal State
  showModal = signal(false);
  showDeleteModal = signal(false);
  showFaceEnrollModal = signal(false);
  saving = signal(false);
  deleting = signal(false);
  enrollingFace = signal(false);
  editingEmployee = signal<Employee | null>(null);
  deletingEmployee = signal<Employee | null>(null);
  enrollingEmployee = signal<Employee | null>(null);

  // Dropdown Data
  departments = signal<Department[]>([]);
  positions = signal<Position[]>([]);
  allEmployees = signal<Employee[]>([]); // For boss selection
  loadingDepartments = signal(false);
  loadingPositions = signal(false);

  // Face Enrollment
  faceImageFile: File | null = null;

  // Form
  employeeForm: FormGroup;

  // Form fields configuration for ModalFormComponent
  employeeFormFields = computed<FormFieldConfig[]>(() => {
    const employee = this.editingEmployee();
    const formValue = this.employeeForm.value;
    const depts = this.departments();
    const pos = this.positions();
    const emps = this.employees();

    // Access form controls to check touched state for errors
    const firstNameControl = this.employeeForm.get('firstName');
    const lastNameControl = this.employeeForm.get('lastName');
    const emailControl = this.employeeForm.get('email');
    const phoneControl = this.employeeForm.get('phone');
    const employeeIdControl = this.employeeForm.get('employeeId');
    const salaryControl = this.employeeForm.get('salary');
    const startDateControl = this.employeeForm.get('startDate');
    const statusControl = this.employeeForm.get('status');

    return [
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'John',
        required: true,
        value: employee?.firstName || formValue.firstName || '',
        error: firstNameControl?.invalid && firstNameControl?.touched
          ? this.validationService.getValidationErrorMessage(firstNameControl, 'First Name')
          : undefined
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Doe',
        required: true,
        value: employee?.lastName || formValue.lastName || '',
        error: lastNameControl?.invalid && lastNameControl?.touched
          ? this.validationService.getValidationErrorMessage(lastNameControl, 'Last Name')
          : undefined
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'john@example.com',
        required: true,
        value: employee?.email || formValue.email || '',
        error: emailControl?.invalid && emailControl?.touched
          ? this.validationService.getValidationErrorMessage(emailControl, 'Email')
          : undefined
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'text',
        placeholder: '0812345678',
        value: employee?.phoneNumber || formValue.phone || '',
        error: phoneControl?.invalid && phoneControl?.touched
          ? this.validationService.getValidationErrorMessage(phoneControl, 'Phone')
          : undefined
      },
      {
        key: 'employeeId',
        label: 'Employee ID',
        type: 'text',
        placeholder: 'EMP001',
        value: employee?.employeeId || formValue.employeeId || '',
        error: employeeIdControl?.invalid && employeeIdControl?.touched
          ? this.validationService.getValidationErrorMessage(employeeIdControl, 'Employee ID')
          : undefined
      },
      {
        key: 'departmentId',
        label: 'Department',
        type: 'select',
        options: [
          { value: '', label: 'Select Department' },
          ...depts.map(dept => ({
            value: dept.id,
            label: dept.thName || dept.engName || ''
          }))
        ],
        value: employee?.departmentId || formValue.departmentId || ''
      },
      {
        key: 'positionId',
        label: 'Position',
        type: 'select',
        options: [
          { value: '', label: 'Select Position' },
          ...pos.map(pos => ({
            value: pos.id,
            label: pos.thName || pos.engName || ''
          }))
        ],
        value: employee?.positionId || formValue.positionId || ''
      },
      {
        key: 'salary',
        label: 'Salary',
        type: 'number',
        placeholder: '0',
        value: employee?.salary || formValue.salary || 0,
        error: salaryControl?.invalid && salaryControl?.touched
          ? this.validationService.getValidationErrorMessage(salaryControl, 'Salary')
          : undefined
      },
      {
        key: 'bossId',
        label: 'Boss/Manager',
        type: 'select',
        options: [
          { value: '', label: 'No Manager' },
          ...this.allEmployees().filter(emp => emp.id !== employee?.id).map(emp => ({
            value: emp.employeeId || emp.id,
            label: `${emp.firstName} ${emp.lastName} (${emp.employeeId || ''})`
          }))
        ],
        value: employee?.bossId || formValue.bossId || ''
      },
      {
        key: 'companyRoleType',
        label: 'Role Type',
        type: 'select',
        required: true,
        options: [
          { value: CompanyRoleType.EMPLOYEE, label: 'Employee' },
          { value: CompanyRoleType.ADMIN_COMPANY, label: 'Company Admin' }
        ],
        value: employee?.companyRoleType || formValue.companyRoleType || CompanyRoleType.EMPLOYEE
      },
      {
        key: 'empType',
        label: 'Employment Type',
        type: 'select',
        required: true,
        options: [
          { value: EmpType.FULL_TIME, label: 'Full Time' },
          { value: EmpType.PART_TIME, label: 'Part Time' },
          { value: EmpType.PERMONTH, label: 'Per Month' },
          { value: EmpType.PERDAY, label: 'Per Day' }
        ],
        value: employee?.empType || formValue.empType || EmpType.FULL_TIME
      },
      {
        key: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
        value: employee?.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : formValue.startDate || new Date().toISOString().split('T')[0],
        error: startDateControl?.invalid && startDateControl?.touched
          ? this.validationService.getValidationErrorMessage(startDateControl, 'Start Date')
          : undefined
      },
      {
        key: 'status',
        label: this.i18n.t('common.status'),
        type: 'select',
        required: true,
        options: [
          { value: 'active', label: this.i18n.t('common.active') },
          { value: 'inactive', label: this.i18n.t('common.inactive') }
        ],
        value: employee?.status || formValue.status || 'active',
        error: statusControl?.invalid && statusControl?.touched
          ? this.validationService.getValidationErrorMessage(statusControl, this.i18n.t('common.status'))
          : undefined
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '📊 Export Excel',
      variant: 'primary',
      onClick: () => this.exportEmployeesReport()
    },
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadEmployees()
    },
    {
      label: this.i18n.t('common.add') + ' Employee',
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
      placeholder: 'Search employees...',
      value: this.searchControl.value || ''
    }
  ]);

  columns: TableColumn[] = [
    { key: 'employeeId', label: 'Code', sortable: true },
    { key: 'firstName', label: 'First Name', sortable: true },
    { key: 'lastName', label: 'Last Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value) => value || 'inactive' }
  ];

  actions: TableAction[] = [
    { icon: '✏️', label: 'Edit', onClick: (row) => this.editEmployee(row) },
    { icon: '📷', label: 'Enroll Face', onClick: (row) => this.openFaceEnrollModal(row) },
    { icon: '🗑️', label: 'Delete', variant: 'danger', onClick: (row) => this.openDeleteModal(row) }
  ];

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private reportService: ReportService,
    private i18n: I18nService
  ) {
    super();
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, this.validationService.emailValidator()]],
      phone: ['', [this.validationService.phoneValidator()]],
      employeeId: [''],
      departmentId: [''],
      positionId: [''],
      salary: [0, [Validators.min(0)]],
      bossId: [''],
      companyRoleType: [CompanyRoleType.EMPLOYEE, [Validators.required]],
      empType: [EmpType.FULL_TIME, [Validators.required]],
      startDate: [new Date().toISOString().split('T')[0], [Validators.required]],
      status: ['active', [Validators.required]]
    });

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.searchControl.valueChanges.pipe(
        debounceTime(300), // Wait for 300ms after user stops typing
        distinctUntilChanged() // Only emit if value has changed
      ),
      () => {
        this.currentPage.set(1); // Reset to first page on new search
        this.loadEmployees();
      }
    );
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
    this.loadPositions();
  }

  /**
   * Load employees with filters and pagination
   */
  loadEmployees(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    const filters = {
      search: this.searchControl.value || undefined,
      page: this.currentPage(),
      size: this.pageSize(),
      sort_by: this.sortBy(),
      sort_order: this.sortOrder()
    };

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.employeeService.getEmployees(filters),
      (response: PaginatedResponse<Employee>) => {
        this.employees.set(response.data || []);
        this.totalRecords.set(response.total || 0);
        this.loading.set(false);

        // Also load all employees for boss selection
        if (this.allEmployees().length === 0) {
          this.loadAllEmployeesForBossSelection();
        }
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล Employees ได้');
        this.loading.set(false);
      }
    );
  }

  /**
   * Load all employees for boss selection dropdown
   */
  loadAllEmployeesForBossSelection(): void {
    this.subscribe(
      this.employeeService.getEmployees({ page: 1, size: 100 } as any),
      (response: PaginatedResponse<Employee>) => {
        this.allEmployees.set(response.data || []);
      },
      (error) => {
        console.error('Error loading all employees:', error);
        this.allEmployees.set([]);
      }
    );
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadEmployees();
    }
  }

  onSort(event: SortEvent): void {
    this.sortBy.set(event.column);
    this.sortOrder.set(event.direction);
    this.currentPage.set(1); // Reset to first page on sort
    this.loadEmployees();
  }

  /**
   * Load departments for dropdown
   */
  loadDepartments(): void {
    this.loadingDepartments.set(true);
    const companyId = this.getCompanyId();
    this.subscribe(
      this.departmentService.getByCompanyId(companyId, { page: 1, size: 100 } as any),
      (response) => {
        this.departments.set(response.data || []);
        this.loadingDepartments.set(false);
      },
      (error) => {
        console.error('Error loading departments:', error);
        this.departments.set([]);
        this.loadingDepartments.set(false);
      }
    );
  }

  /**
   * Load positions for dropdown
   */
  loadPositions(): void {
    this.loadingPositions.set(true);
    const companyId = this.getCompanyId();
    this.subscribe(
      this.positionService.getByCompanyId(companyId, { page: 1, size: 100 } as any),
      (response) => {
        this.positions.set(response.data || []);
        this.loadingPositions.set(false);
      },
      (error) => {
        console.error('Error loading positions:', error);
        this.positions.set([]);
        this.loadingPositions.set(false);
      }
    );
  }

  /**
   * Get company ID from current user
   */
  private getCompanyId(): string {
    const user = this.employeeService['auth'].getCurrentUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    const companyId = user.companyId || (user as any).company_id;
    if (!companyId) {
      // Try to decode from JWT token
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const companyIdFromToken = payload.company_id || payload.companyId;
            if (companyIdFromToken) {
              return companyIdFromToken.toString();
            }
          }
        } catch (e) {
          console.warn('Failed to decode JWT token:', e);
        }
      }
      throw new Error('User is not associated with a company');
    }
    return companyId.toString();
  }

  openAddModal(): void {
    this.editingEmployee.set(null);
    this.employeeForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      departmentId: '',
      positionId: '',
      salary: 0,
      bossId: '',
      companyRoleType: CompanyRoleType.EMPLOYEE,
      empType: EmpType.FULL_TIME,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    this.employeeForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  /**
   * Edit employee
   */
  editEmployee(employee: Employee): void {
    // Validate employee has id
    if (!employee.id) {
      this.errorHandler.showError('ไม่พบ ID ของพนักงาน');
      console.error('Employee missing id:', employee);
      return;
    }

    this.editingEmployee.set(employee);
    const status = employee.status;
    this.employeeForm.patchValue({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phoneNumber || '',
      employeeId: employee.employeeId || '',
      departmentId: employee.departmentId || '',
      positionId: employee.positionId || '',
      salary: employee.salary || 0,
      bossId: employee.bossId || '',
      companyRoleType: employee.companyRoleType || CompanyRoleType.EMPLOYEE,
      empType: employee.empType || EmpType.FULL_TIME,
      startDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: (status === 'active' || status === 'inactive') ? status : 'inactive'
    });
    this.employeeForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingEmployee.set(null);
    this.errorMessage.set('');
    this.employeeForm.markAsUntouched();
  }

  /**
   * Handle form submission from ModalFormComponent
   */
  onFormSubmitted(formData: Record<string, any>): void {
    // Helper to convert empty string to undefined for optional fields
    const toUndefinedIfEmpty = (value: any): any => {
      if (value === '' || value === 'undefined' || value === 'null') return undefined;
      return value;
    };

    // Update FormGroup from ModalFormComponent
    this.employeeForm.patchValue({
      firstName: formData['firstName'] || '',
      lastName: formData['lastName'] || '',
      email: formData['email'] || '',
      phone: toUndefinedIfEmpty(formData['phone']),
      employeeId: toUndefinedIfEmpty(formData['employeeId']),
      departmentId: toUndefinedIfEmpty(formData['departmentId']),
      positionId: toUndefinedIfEmpty(formData['positionId']),
      salary: formData['salary'] || 0,
      bossId: toUndefinedIfEmpty(formData['bossId']),
      companyRoleType: formData['companyRoleType'] || CompanyRoleType.EMPLOYEE,
      empType: formData['empType'] || EmpType.FULL_TIME,
      startDate: formData['startDate'] || new Date().toISOString().split('T')[0],
      status: formData['status'] || 'active'
    });
    // Mark all fields as touched to show validation errors
    this.employeeForm.markAllAsTouched();
    // Trigger change detection for computed signal
    this.employeeForm.updateValueAndValidity();
    this.saveEmployee();
  }

  onFormFieldChange(event: { key: string; value: any }): void {
    // Update FormGroup when field changes for real-time validation
    const control = this.employeeForm.get(event.key);
    if (control) {
      control.setValue(event.value);
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  /**
   * Save employee (create or update)
   */
  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.errorHandler.showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const employee = this.editingEmployee();
    if (employee && !employee.id) {
      this.errorHandler.showError('ไม่พบ ID ของพนักงาน');
      console.error('Employee missing id:', employee);
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    const formValue = this.employeeForm.value;
    const request = employee && employee.id
      ? this.employeeService.updateEmployee(employee.id, formValue)
      : this.employeeService.createEmployee(formValue as any);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.errorHandler.showSuccess(this.editingEmployee() ? 'อัปเดต Employee สำเร็จ' : 'สร้าง Employee สำเร็จ');
        this.saving.set(false);
        this.closeModal();
        this.loadEmployees(); // Reload current page
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถบันทึกข้อมูล Employee ได้');
        this.saving.set(false);
      }
    );
  }

  openDeleteModal(employee: Employee): void {
    this.deletingEmployee.set(employee);
    this.showDeleteModal.set(true);
  }

  /**
   * Close delete modal
   */
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingEmployee.set(null);
  }

  /**
   * Confirm and delete employee
   */
  confirmDelete(): void {
    const employee = this.deletingEmployee();
    if (!employee) return;

    if (!employee.id) {
      this.errorHandler.showError('ไม่พบ ID ของพนักงาน');
      console.error('Employee missing id:', employee);
      this.closeDeleteModal();
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');
    this.employeeService.deleteEmployee(employee.id).subscribe({
      next: () => {
        this.errorHandler.showSuccess('ลบ Employee สำเร็จ');
        this.deleting.set(false);
        this.closeDeleteModal();
        this.loadEmployees(); // Reload current page
      },
      error: (error: any) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลบ Employee ได้');
        this.deleting.set(false);
      }
    });
  }

  /**
   * Open face enrollment modal
   */
  openFaceEnrollModal(employee: Employee): void {
    this.enrollingEmployee.set(employee);
    this.faceImageFile = null;
    this.errorMessage.set('');
    this.showFaceEnrollModal.set(true);
  }

  /**
   * Close face enrollment modal
   */
  closeFaceEnrollModal(): void {
    this.showFaceEnrollModal.set(false);
    this.enrollingEmployee.set(null);
    this.faceImageFile = null;
    this.errorMessage.set('');
  }

  /**
   * Handle face image file selection
   */
  onFaceImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.faceImageFile = input.files[0];
    }
  }

  /**
   * Enroll face for employee
   */
  enrollFace(): void {
    const employee = this.enrollingEmployee();
    if (!employee || !this.faceImageFile) {
      this.errorHandler.showError('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    this.enrollingFace.set(true);
    this.errorMessage.set('');

    this.subscribe(
      this.employeeService.enrollFace(employee.memberId, this.faceImageFile!),
      () => {
        this.errorHandler.showSuccess('Enroll Face สำเร็จ');
        this.enrollingFace.set(false);
        this.closeFaceEnrollModal();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถ Enroll Face ได้');
        this.enrollingFace.set(false);
      }
    );
  }

  getFieldError(fieldName: string): string {
    const control = this.employeeForm.get(fieldName);
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
      'firstName': 'ชื่อ',
      'lastName': 'นามสกุล',
      'email': 'Email',
      'phone': 'เบอร์โทรศัพท์',
      'department': 'แผนก',
      'status': 'สถานะ'
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
   * Handle filter changes
   */
  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchControl.setValue(event.value);
    }
  }

  /**
   * Export employees report to Excel
   */
  exportEmployeesReport(): void {
    this.loading.set(true);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.reportService.exportEmployeesReport('excel'),
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.loading.set(false);
        alert('รายงานถูก Export ไปยัง Downloads folder แล้ว');
      },
      (error: any) => {
        console.error('Error exporting employees report:', error);
        this.loading.set(false);
        alert('เกิดข้อผิดพลาดในการ Export รายงาน');
      }
    );
  }
}
