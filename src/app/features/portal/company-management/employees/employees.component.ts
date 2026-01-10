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

import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction, SortEvent } from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../../shared/components/page-layout/page-layout.component';
import { FilterSectionComponent, FilterField } from '../../../../shared/components/filter-section/filter-section.component';
import { ModalFormComponent } from '../../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../../shared/components/form-field/form-field.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CompanyEmployeeService } from '../../../../core/services/company-employee.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { PositionService } from '../../../../core/services/position.service';
import { ReportService } from '../../../../core/services/report.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { ApiService } from '../../../../core/services/api.service';
import { FaceService } from '../../../../core/services/face.service'; // Added FaceService
import { UUID, PaginatedResponse } from '../../../../core/models/base.model';
import { BaseComponent } from '../../../../core/base/base.component';
import { EmpType, CompanyRoleType } from '../../../../core/models/enums.model';
import { Department } from '../../../../core/models/department.model';
import { Position } from '../../../../core/models/position.model';
import { EmployeeDisplay } from '../../../../core/models/employee-display.model';
import { CompanyEmployeeCreate, CompanyEmployeeUpdate } from '../../../../core/models/company-employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  private faceService = inject(FaceService); // Inject FaceService

  // Data & State Signals
  employees = signal<EmployeeDisplay[]>([]);
  totalRecords = signal(0);
  loading = signal(false);
  errorMessage = signal<string>('');

  // Pagination State
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = computed(() => Math.ceil(this.totalRecords() / this.pageSize()));

  // Search & Sort State
  searchControl = new FormControl('');
  sortBy = signal('employee_id');
  sortOrder = signal<'asc' | 'desc'>('asc');

  // Modal State
  showModal = signal(false);
  showDeleteModal = signal(false);
  showFaceEnrollModal = signal(false);
  saving = signal(false);
  deleting = signal(false);
  enrollingFace = signal(false);
  editingEmployee = signal<EmployeeDisplay | null>(null);
  deletingEmployee = signal<EmployeeDisplay | null>(null);
  enrollingEmployee = signal<EmployeeDisplay | null>(null);

  // Dropdown Data
  departments = signal<Department[]>([]);
  positions = signal<Position[]>([]);
  allEmployees = signal<EmployeeDisplay[]>([]); // For boss selection
  loadingDepartments = signal(false);
  loadingPositions = signal(false);

  // Face Enrollment
  faceImageFile: File | null = null;
  profileImageFile: File | null = null;

  // Advanced Face Enrollment
  enrollmentMode = signal<'upload' | 'camera'>('upload');
  videoDevices = signal<MediaDeviceInfo[]>([]);
  selectedVideoDevice = signal<string>('');
  videoStream: MediaStream | null = null;
  capturedImages = signal<string[]>([]); // Base64 strings for preview
  selectedFiles: File[] = []; // Actual files to upload

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Form
  employeeForm: FormGroup;
  // Signals to track form state for computed fields
  formValue = signal<any>({});
  formStatus = signal<string>('VALID');

  // Form fields configuration for ModalFormComponent
  employeeFormFields = computed<FormFieldConfig[]>(() => {
    const employee = this.editingEmployee();
    // Use formValue signal to trigger updates when form changes (including reset)
    const formValue = this.formValue();
    const status = this.formStatus(); // Track status changes

    const depts = this.departments();
    const pos = this.positions();
    const emps = this.employees();

    // Access form controls to check touched state for errors
    // We rely on status signal to re-evaluate this when validation changes
    const firstNameControl = this.employeeForm.get('first_name');
    const lastNameControl = this.employeeForm.get('last_name');
    const emailControl = this.employeeForm.get('email');
    const phoneControl = this.employeeForm.get('phone_number');
    const employeeIdControl = this.employeeForm.get('employee_id');
    const salaryControl = this.employeeForm.get('salary');
    const startDateControl = this.employeeForm.get('start_date');

    return [
      {
        key: 'picture',
        label: 'รูปโปรไฟล์',
        type: 'file',
        accept: 'image/*',
        fullWidth: true,
        value: employee?.picture || formValue.picture // Preserve picture value
      },
      {
        key: 'first_name',
        label: 'ชื่อ',
        type: 'text',
        placeholder: 'ระบุชื่อ',
        required: true,
        value: employee?.first_name || formValue.first_name || '',
        error: firstNameControl?.invalid && (firstNameControl?.touched || firstNameControl?.dirty)
          ? this.validationService.getValidationErrorMessage(firstNameControl, 'ชื่อ')
          : undefined
      },
      {
        key: 'last_name',
        label: 'นามสกุล',
        type: 'text',
        placeholder: 'ระบุนามสกุล',
        required: true,
        value: employee?.last_name || formValue.last_name || '',
        error: lastNameControl?.invalid && (lastNameControl?.touched || lastNameControl?.dirty)
          ? this.validationService.getValidationErrorMessage(lastNameControl, 'นามสกุล')
          : undefined
      },
      {
        key: 'email',
        label: 'อีเมล',
        type: 'email',
        placeholder: 'ระบุอีเมล',
        required: true,
        value: employee?.email || formValue.email || '',
        error: emailControl?.invalid && (emailControl?.touched || emailControl?.dirty)
          ? this.validationService.getValidationErrorMessage(emailControl, 'อีเมล')
          : undefined
      },
      {
        key: 'phone_number',
        label: 'เบอร์โทรศัพท์',
        type: 'text',
        placeholder: 'ระบุเบอร์โทรศัพท์',
        value: employee?.phone_number || formValue.phone_number || '',
        error: phoneControl?.invalid && (phoneControl?.touched || phoneControl?.dirty)
          ? this.validationService.getValidationErrorMessage(phoneControl, 'เบอร์โทรศัพท์')
          : undefined
      },
      {
        key: 'employee_id',
        label: 'รหัสพนักงาน',
        type: 'text',
        placeholder: 'ระบุรหัสพนักงาน',
        value: employee?.employee_id || formValue.employee_id || '',
        error: employeeIdControl?.invalid && (employeeIdControl?.touched || employeeIdControl?.dirty)
          ? this.validationService.getValidationErrorMessage(employeeIdControl, 'รหัสพนักงาน')
          : undefined
      },
      {
        key: 'department_id',
        label: 'แผนก',
        type: 'select',
        options: [
          { value: '', label: 'เลือกแผนก' },
          ...depts.map(dept => ({
            value: dept.department_id,
            label: dept.th_name || dept.eng_name || ''
          }))
        ],
        value: employee?.department_id || formValue.department_id || ''
      },
      {
        key: 'position_id',
        label: 'ตำแหน่ง',
        type: 'select',
        options: [
          { value: '', label: 'เลือกตำแหน่ง' },
          ...pos.map(pos => ({
            value: pos.position_id,
            label: pos.th_name || pos.eng_name || ''
          }))
        ],
        value: employee?.position_id || formValue.position_id || ''
      },
      {
        key: 'salary',
        label: 'เงินเดือน',
        type: 'number',
        placeholder: '0',
        value: employee?.salary || formValue.salary || 0,
        error: salaryControl?.invalid && (salaryControl?.touched || salaryControl?.dirty)
          ? this.validationService.getValidationErrorMessage(salaryControl, 'เงินเดือน')
          : undefined
      },
      {
        key: 'boss_id',
        label: 'หัวหน้างาน',
        type: 'select',
        options: [
          { value: '', label: 'ไม่มีหัวหน้างาน' },
          ...this.allEmployees().filter(emp => emp.company_employee_id !== employee?.company_employee_id).map(emp => ({
            value: emp.employee_id || emp.company_employee_id,
            label: `${emp.first_name} ${emp.last_name} (${emp.employee_id || ''})`
          }))
        ],
        value: employee?.boss_id || formValue.boss_id || ''
      },
      {
        key: 'company_role_type',
        label: 'ประเภทบทบาท',
        type: 'select',
        required: true,
        options: [
          { value: CompanyRoleType.EMPLOYEE, label: 'พนักงานทั่วไป' },
          { value: CompanyRoleType.ADMIN_COMPANY, label: 'ผู้ดูแลบริษัท' }
        ],
        value: employee?.company_role_type || formValue.company_role_type || CompanyRoleType.EMPLOYEE
      },
      {
        key: 'emp_type',
        label: 'ประเภทการจ้างงาน',
        type: 'select',
        required: true,
        options: [
          { value: EmpType.FULL_TIME, label: 'เต็มเวลา' },
          { value: EmpType.PART_TIME, label: 'พาร์ทไทม์' },
          { value: EmpType.PERMONTH, label: 'รายเดือน' },
          { value: EmpType.PERDAY, label: 'รายวัน' }
        ],
        value: employee?.emp_type || formValue.emp_type || EmpType.FULL_TIME
      },
      {
        key: 'start_date',
        label: 'วันที่เริ่มงาน',
        type: 'date',
        required: true,
        value: employee?.start_date ? new Date(employee.start_date).toISOString().split('T')[0] : formValue.start_date || new Date().toISOString().split('T')[0],
        error: startDateControl?.invalid && (startDateControl?.touched || startDateControl?.dirty)
          ? this.validationService.getValidationErrorMessage(startDateControl, 'วันที่เริ่มงาน')
          : undefined
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '📊 ส่งออก Excel',
      variant: 'primary',
      onClick: () => this.exportEmployeesReport()
    },
    {
      label: 'รีเฟรช',
      variant: 'secondary',
      onClick: () => this.loadEmployees()
    },
    {
      label: 'เพิ่มพนักงาน',
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
      placeholder: 'ค้นหาพนักงาน...',
      value: this.searchControl.value || ''
    }
  ]);

  columns: TableColumn[] = [
    { key: 'employee_id', label: 'รหัส', sortable: true },
    { key: 'first_name', label: 'ชื่อ', sortable: true },
    { key: 'last_name', label: 'นามสกุล', sortable: true },
    { key: 'email', label: 'อีเมล', sortable: true },
    { key: 'department_name', label: 'แผนก', sortable: true },
    { key: 'status', label: 'สถานะ', sortable: true, render: (value) => value || 'inactive' }
  ];

  actions: TableAction[] = [
    { icon: '✏️', label: 'แก้ไข', onClick: (row) => this.editEmployee(row) },
    { icon: '📷', label: 'ลงทะเบียนใบหน้า', onClick: (row) => this.openFaceEnrollModal(row) },
    { icon: '🗑️', label: 'ลบ', variant: 'danger', onClick: (row) => this.openDeleteModal(row) }
  ];

  constructor(
    private employeeService: CompanyEmployeeService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private reportService: ReportService,
    private apiService: ApiService
  ) {
    super();
    this.employeeForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, this.validationService.emailValidator()]],
      phone_number: ['', [this.validationService.phoneValidator()]],
      employee_id: [''],
      department_id: [''],
      position_id: [''],
      salary: [0, [Validators.min(0)]],
      boss_id: [''],
      company_role_type: [CompanyRoleType.EMPLOYEE, [Validators.required]],
      emp_type: [EmpType.FULL_TIME, [Validators.required]],
      start_date: [new Date().toISOString().split('T')[0], [Validators.required]]
    });

    // Initialize signals with current form state
    this.formValue.set(this.employeeForm.value);
    this.formStatus.set(this.employeeForm.status);

    // Track form value and status changes to update computed signals
    this.subscribe(this.employeeForm.valueChanges, (val) => this.formValue.set(val));
    this.subscribe(this.employeeForm.statusChanges, (status) => this.formStatus.set(status));

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
      (response) => {
        // Use items (snake_case) or data (backward compatibility)
        const items = response.items || response.data || [];
        this.employees.set(items);
        this.totalRecords.set(response.total || 0);
        this.loading.set(false);

        // Also load all employees for boss selection
        if (this.allEmployees().length === 0) {
          this.loadAllEmployeesForBossSelection();
        }
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูลพนักงานได้');
        this.loading.set(false);
      }
    );
  }

  /**
   * Load all employees for boss selection dropdown
   */
  loadAllEmployeesForBossSelection(): void {
    this.subscribe(
      this.employeeService.getEmployees({ page: 1, size: 100 }),
      (response) => {
        const items = response.items || response.data || [];
        this.allEmployees.set(items);
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
        const items = response.items || response.data || [];
        this.departments.set(items);
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
        const items = response.items || response.data || [];
        this.positions.set(items);
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
    // Try to get from JWT token
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
    throw new Error('Member is not associated with a company');
  }

  openAddModal(): void {
    this.editingEmployee.set(null);
    this.profileImageFile = null;
    this.employeeForm.reset({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      employee_id: '',
      department_id: '',
      position_id: '',
      salary: 0,
      boss_id: '',
      company_role_type: CompanyRoleType.EMPLOYEE,
      emp_type: EmpType.FULL_TIME,
      start_date: new Date().toISOString().split('T')[0]
    });
    this.employeeForm.markAsUntouched();
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  /**
   * Edit employee
   */
  editEmployee(employee: EmployeeDisplay): void {
    // Validate employee has company_employee_id
    if (!employee.company_employee_id) {
      this.errorHandler.showError('ไม่พบ ID ของพนักงาน');
      console.error('Employee missing company_employee_id:', employee);
      return;
    }

    this.editingEmployee.set(employee);
    this.profileImageFile = null;
    this.employeeForm.patchValue({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      phone_number: employee.phone_number || '',
      employee_id: employee.employee_id || '',
      department_id: employee.department_id || '',
      position_id: employee.position_id || '',
      salary: employee.salary || 0,
      boss_id: employee.boss_id || '',
      company_role_type: employee.company_role_type || CompanyRoleType.EMPLOYEE,
      emp_type: employee.emp_type || EmpType.FULL_TIME,
      start_date: employee.start_date ? new Date(employee.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
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
    // Handle file upload if present
    if (formData['picture'] instanceof File) {
      this.profileImageFile = formData['picture'];
    }

    // Helper to convert empty string to undefined for optional fields
    const toUndefinedIfEmpty = (value: any): any => {
      if (value === '' || value === 'undefined' || value === 'null') return undefined;
      return value;
    };

    console.log('📝 [Employees] Form Submitted Data:', formData);

    // Update FormGroup from ModalFormComponent (convert camelCase to snake_case if needed)
    this.employeeForm.patchValue({
      first_name: formData['first_name'] || formData['firstName'] || '',
      last_name: formData['last_name'] || formData['lastName'] || '',
      email: formData['email'] || '',
      phone_number: toUndefinedIfEmpty(formData['phone_number'] || formData['phone']),
      employee_id: toUndefinedIfEmpty(formData['employee_id'] || formData['employeeId']),
      department_id: toUndefinedIfEmpty(formData['department_id'] || formData['departmentId']),
      position_id: toUndefinedIfEmpty(formData['position_id'] || formData['positionId']),
      salary: formData['salary'] || 0,
      boss_id: toUndefinedIfEmpty(formData['boss_id'] || formData['bossId']),
      company_role_type: formData['company_role_type'] || formData['companyRoleType'] || CompanyRoleType.EMPLOYEE,
      emp_type: formData['emp_type'] || formData['empType'] || EmpType.FULL_TIME,
      start_date: formData['start_date'] || formData['startDate'] || new Date().toISOString().split('T')[0]
    });

    // Check for missing required fields
    const missingFields = [];
    if (!this.employeeForm.get('first_name')?.value) missingFields.push('first_name');
    if (!this.employeeForm.get('last_name')?.value) missingFields.push('last_name');
    if (!this.employeeForm.get('email')?.value) missingFields.push('email');
    if (!this.employeeForm.get('company_role_type')?.value) missingFields.push('company_role_type');
    if (!this.employeeForm.get('emp_type')?.value) missingFields.push('emp_type');
    if (!this.employeeForm.get('start_date')?.value) missingFields.push('start_date');

    if (missingFields.length > 0) {
        console.warn('⚠️ [Employees] Missing required fields:', missingFields);
    }

    // Check form validity log
    console.log('✅ [Employees] Form Status after patch:', this.employeeForm.status);
    if (this.employeeForm.invalid) {
        Object.keys(this.employeeForm.controls).forEach(key => {
            const control = this.employeeForm.get(key);
            if (control?.invalid) {
                console.error(`❌ [Employees] Invalid Field: ${key}`, control.errors);
            }
        });
    }
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
    if (employee && !employee.company_employee_id) {
      this.errorHandler.showError('ไม่พบ ID ของพนักงาน');
      console.error('Employee missing company_employee_id:', employee);
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    // If profile image is selected, upload it first
    if (this.profileImageFile) {
      this.subscribe(
        this.apiService.upload<{ path: string }>('/files/upload-image', this.profileImageFile),
        (response: any) => { // Type assertion for response
          const imagePath = response.path || response.data?.path || response.url;
          this.performSave(imagePath);
        },
        (error) => {
          this.errorHandler.handleApiError(error);
          this.errorMessage.set('ไม่สามารถอัปโหลดรูปภาพได้');
          this.saving.set(false);
        }
      );
    } else {
      this.performSave();
    }
  }

  private performSave(picturePath?: string): void {
    const employee = this.editingEmployee();
    const formValue = this.employeeForm.value;

    // Convert form data to backend format
    if (employee && employee.company_employee_id) {
      // Update existing employee
      const updateData: CompanyEmployeeUpdate = {
        company_employee_id: employee.company_employee_id,
        member: {
          email: formValue.email,
          first_name: formValue.first_name,
          last_name: formValue.last_name,
          picture: picturePath // Update picture if uploaded
        },
        position: formValue.position_id ? {
          position_id: formValue.position_id,
          th_name: '', // Will be filled by backend
          eng_name: ''
        } : undefined,
        department: formValue.department_id ? {
          department_id: formValue.department_id,
          th_name: '', // Will be filled by backend
          eng_name: ''
        } : undefined,
        employee_id: formValue.employee_id,
        salary: formValue.salary,
        boss_id: formValue.boss_id,
        company_role_type: formValue.company_role_type,
        emp_type: formValue.emp_type,
        start_date: new Date(formValue.start_date).toISOString()
      };

      this.subscribe(
        this.employeeService.updateEmployee(employee.company_employee_id, updateData),
        () => {
          this.errorHandler.showSuccess('อัปเดตข้อมูลพนักงานสำเร็จ');
          this.saving.set(false);
          this.closeModal();
          this.loadEmployees();
        },
        (error) => {
          this.errorHandler.handleApiError(error);
          this.errorMessage.set('ไม่สามารถบันทึกข้อมูลพนักงานได้');
          this.saving.set(false);
        }
      );
    } else {
      // Create new employee
      const createData: CompanyEmployeeCreate = {
        member: {
          email: formValue.email,
          first_name: formValue.first_name,
          last_name: formValue.last_name,
          picture: picturePath
        },
        position: formValue.position_id ? {
          position_id: formValue.position_id,
          th_name: '',
          eng_name: ''
        } : undefined,
        department: formValue.department_id ? {
          department_id: formValue.department_id,
          th_name: '',
          eng_name: ''
        } : undefined,
        employee_id: formValue.employee_id,
        salary: formValue.salary,
        boss_id: formValue.boss_id,
        company_role_type: formValue.company_role_type,
        emp_type: formValue.emp_type,
        start_date: new Date(formValue.start_date).toISOString()
      };

      this.subscribe(
        this.employeeService.createEmployee(createData),
        () => {
          this.errorHandler.showSuccess('สร้างพนักงานสำเร็จ');
          this.saving.set(false);
          this.closeModal();
          this.loadEmployees();
        },
        (error) => {
          this.errorHandler.handleApiError(error);
          this.errorMessage.set('ไม่สามารถบันทึกข้อมูลพนักงานได้');
          this.saving.set(false);
        }
      );
    }
  }

  openDeleteModal(employee: EmployeeDisplay): void {
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

    if (!employee.company_employee_id) {
      this.errorHandler.showError('ไม่พบ ID ของพนักงาน');
      console.error('Employee missing company_employee_id:', employee);
      this.closeDeleteModal();
      return;
    }

    this.deleting.set(true);
    this.errorMessage.set('');
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.employeeService.deleteEmployee(employee.company_employee_id),
      () => {
        this.errorHandler.showSuccess('ลบพนักงานสำเร็จ');
        this.deleting.set(false);
        this.closeDeleteModal();
        this.loadEmployees();
      },
      (error: any) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลบพนักงานได้');
        this.deleting.set(false);
      }
    );
  }

  /**
   * Open face enrollment modal
   */
  openFaceEnrollModal(employee: EmployeeDisplay): void {
    this.enrollingEmployee.set(employee);
    this.faceImageFile = null;
    this.selectedFiles = [];
    this.capturedImages.set([]);
    this.enrollmentMode.set('upload');
    this.errorMessage.set('');
    this.showFaceEnrollModal.set(true);
    this.getVideoDevices(); // Initialize devices
  }

  /**
   * Close face enrollment modal
   */
  closeFaceEnrollModal(): void {
    this.showFaceEnrollModal.set(false);
    this.enrollingEmployee.set(null);
    this.faceImageFile = null;
    this.selectedFiles = [];
    this.capturedImages.set([]);
    this.errorMessage.set('');
    this.stopCamera();
  }

  // --- Camera & Enrollment Methods ---

  async getVideoDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.videoDevices.set(videoDevices);
      if (videoDevices.length > 0) {
        this.selectedVideoDevice.set(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error listing devices:', error);
    }
  }

  async setEnrollmentMode(mode: 'upload' | 'camera') {
    this.enrollmentMode.set(mode);
    if (mode === 'camera') {
      await this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  async startCamera() {
    try {
      this.stopCamera();
      const constraints = {
        video: { deviceId: this.selectedVideoDevice() ? { exact: this.selectedVideoDevice() } : undefined }
      };
      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      // Wait for view update
      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.videoStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.errorHandler.handleApiError(error);
    }
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  captureImage() {
    if (this.videoElement?.nativeElement && this.canvasElement?.nativeElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to Base64 for preview
        const dataUrl = canvas.toDataURL('image/jpeg');
        this.capturedImages.update(images => [...images, dataUrl]);

        // Convert to File object for upload
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                this.selectedFiles.push(file);
            }
        }, 'image/jpeg');
      }
    }
  }

  onFaceFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      // Add files to selection
      this.selectedFiles.push(...files);

      // Read for preview
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
                this.capturedImages.update(images => [...images, result]);
            }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.capturedImages.update(images => images.filter((_, i) => i !== index));
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  /**
   * Enroll face for employee
   */
  enrollFace(): void {
    const employee = this.enrollingEmployee();
    if (!employee) return;

    if (this.selectedFiles.length === 0) {
      this.errorHandler.showError('กรุณาเลือกหรือถ่ายรูปภาพอย่างน้อย 1 รูป');
      return;
    }

    this.enrollingFace.set(true);
    this.errorMessage.set('');

    const memberId = employee.member_id;
    if (!memberId) {
      this.errorHandler.showError('ไม่พบ Member ID');
      this.enrollingFace.set(false);
      return;
    }

    // Use FaceService to support multiple files
    this.subscribe(
      this.faceService.addFace(memberId, this.selectedFiles),
      (response) => {
        this.errorHandler.showSuccess('ลงทะเบียนใบหน้าสำเร็จ');
        if (response.message) {
            // Optional: show server message
        }
        this.enrollingFace.set(false);
        this.closeFaceEnrollModal();
      },
      (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลงทะเบียนใบหน้าได้');
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
      'first_name': 'ชื่อ',
      'last_name': 'นามสกุล',
      'email': 'อีเมล',
      'phone_number': 'เบอร์โทรศัพท์',
      'department_id': 'แผนก',
      'position_id': 'ตำแหน่ง',
      'employee_id': 'รหัสพนักงาน',
      'salary': 'เงินเดือน',
      'boss_id': 'หัวหน้างาน',
      'company_role_type': 'ประเภทบทบาท',
      'emp_type': 'ประเภทการจ้างงาน',
      'start_date': 'วันที่เริ่มงาน'
    }
    return labels[fieldName] || fieldName;
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
        this.errorHandler.showSuccess('ดาวน์โหลดรายงานสำเร็จ');
      },
      (error: any) => {
        console.error('Error exporting employees report:', error);
        this.loading.set(false);
        this.errorHandler.showError('เกิดข้อผิดพลาดในการส่งออกรายงาน');
      }
    );
  }
}
