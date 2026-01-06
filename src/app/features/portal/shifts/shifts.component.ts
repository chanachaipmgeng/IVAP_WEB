/**
 * Shifts Component
 *
 * Shift management component with CRUD operations and employee assignment.
 * Supports shift creation, editing, deletion, and employee assignment management.
 *
 * @example
 * ```html
 * <app-shifts></app-shifts>
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
import { ApiService } from '../../../core/services/api.service';
import { ShiftService } from '../../../core/services/shift.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Shift, ShiftCreate, UserShift } from '../../../core/models/shift.model';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Employee interface for shift assignments
 */
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  department?: string;
  position?: string;
}


@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent,
    ModalFormComponent
  ],
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.scss'
})
export class ShiftsComponent extends BaseComponent implements OnInit {
  showModal = signal(false);
  showAssignmentModal = signal(false);
  saving = signal(false);
  editingShift = signal<Shift | null>(null);
  selectedShiftForAssignment = signal<Shift | null>(null);

  // Assignment management
  employees = signal<Employee[]>([]);
  shiftAssignments = signal<UserShift[]>([]);
  selectedEmployees = signal<string[]>([]);
  loadingAssignments = signal(false);

  // Getters from service
  getShifts = () => this.shiftService.getShifts();
  getLoading = () => this.shiftService.getLoading();

  // Computed signals
  shifts = computed(() => this.getShifts()());

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add Shift',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  // Available employees (not already assigned to this shift)
  availableEmployees = computed(() => {
    const currentAssignments = this.shiftAssignments();
    const assignedEmployeeIds = currentAssignments.map(a => a.companyEmployeeId);
    return this.employees().filter(emp => !assignedEmployeeIds.includes(emp.id));
  });

  formData: Partial<ShiftCreate> = {
    shiftName: '',
    startTime: '',
    endTime: ''
  };

  // Form fields configuration for ModalFormComponent
  shiftFormFields = computed<FormFieldConfig[]>(() => {
    const shift = this.editingShift();
    return [
      {
        key: 'shiftName',
        label: 'Shift Name',
        type: 'text',
        placeholder: 'Morning Shift',
        required: true,
        value: shift?.shiftName || this.formData.shiftName || ''
      },
      {
        key: 'startTime',
        label: 'Start Time',
        type: 'text',
        placeholder: '09:00:00',
        required: true,
        value: shift?.startTime || this.formData.startTime || '',
        hint: 'Format: HH:MM:SS (24-hour format)'
      },
      {
        key: 'endTime',
        label: 'End Time',
        type: 'text',
        placeholder: '17:00:00',
        required: true,
        value: shift?.endTime || this.formData.endTime || '',
        hint: 'Format: HH:MM:SS (24-hour format)'
      }
    ];
  });

  columns: TableColumn[] = [
    { key: 'shiftName', label: 'Shift Name', sortable: true },
    {
      key: 'startTime',
      label: 'Start Time',
      sortable: true,
      render: (value) => this.formatTime(value)
    },
    {
      key: 'endTime',
      label: 'End Time',
      sortable: true,
      render: (value) => this.formatTime(value)
    }
  ];

  actions: TableAction[] = [
    {
      icon: '👥',
      label: 'Assign Employees',
      onClick: (row) => this.assignEmployees(row)
    },
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editShift(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteShift(row)
    }
  ];

  constructor(
    private api: ApiService,
    private shiftService: ShiftService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadShifts();
    this.loadEmployees();
  }

  /**
   * Load shifts for current company
   */
  loadShifts(): void {
    this.shiftService.loadShifts().subscribe({
      next: () => {
        // Shifts data automatically updated via signals
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
      }
    });
  }

  openAddModal(): void {
    this.editingShift.set(null);
    this.formData = {
      shiftName: '',
      startTime: '',
      endTime: ''
    };
    this.showModal.set(true);
  }

  /**
   * Edit shift
   */
  editShift(shift: Shift): void {
    this.editingShift.set(shift);
    this.formData = {
      shiftName: shift.shiftName,
      startTime: shift.startTime,
      endTime: shift.endTime
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingShift.set(null);
  }

  /**
   * Handle form submission from ModalFormComponent
   */
  onShiftFormSubmitted(formData: Record<string, unknown>): void {
    this.formData = {
      shiftName: String(formData['shiftName'] || ''),
      startTime: String(formData['startTime'] || ''),
      endTime: String(formData['endTime'] || '')
    };
    this.saveShift();
  }

  saveShift(): void {
    this.saving.set(true);

    const request = this.editingShift()
      ? this.shiftService.updateShift(this.editingShift()!.id, this.formData)
      : this.shiftService.createShift(this.formData);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.saving.set(false);
        this.closeModal();
        this.loadShifts();
      },
      (error: unknown) => {
        console.error('Error saving shift:', error);
        this.saving.set(false);
      }
    );
  }

  deleteShift(shift: Shift): void {
    if (!confirm(`Delete shift ${shift.shiftName}?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.shiftService.deleteShift(shift.id),
      () => {
        this.loadShifts();
      },
      (error: unknown) => {
        console.error('Error deleting shift:', error);
      }
    );
  }

  /**
   * Load employees for assignment management
   */
  loadEmployees(): void {
    const companyId = this.auth.getCurrentUser()?.companyId;
    if (!companyId) return;

    this.api.get(`/api/v1/employees?company_id=${companyId}`).subscribe({
      next: (response: any) => {
        this.employees.set(response.data || response.items || []);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });
  }

  /**
   * Assign employees to shift
   */
  assignEmployees(shift: Shift): void {
    this.selectedShiftForAssignment.set(shift);
    this.loadShiftAssignments(shift.id);
    this.showAssignmentModal.set(true);
  }

  loadShiftAssignments(shiftId: string): void {
    this.loadingAssignments.set(true);
    const companyId = this.auth.getCurrentUser()?.companyId;
    if (!companyId) {
      this.loadingAssignments.set(false);
      return;
    }

    // Get all user-shifts for this shift
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.shiftService.getShiftAssignments(companyId.toString(), { shiftId }),
      (assignments) => {
        this.shiftAssignments.set(assignments);
        this.loadingAssignments.set(false);
      },
      (error) => {
        console.error('Error loading shift assignments:', error);
        this.loadingAssignments.set(false);
        this.shiftAssignments.set([]);
      }
    );
  }

  /**
   * Close assignment modal
   */
  closeAssignmentModal(): void {
    this.showAssignmentModal.set(false);
    this.selectedShiftForAssignment.set(null);
    this.selectedEmployees.set([]);
  }

  toggleEmployeeSelection(employeeId: string): void {
    const current = this.selectedEmployees();
    if (current.includes(employeeId)) {
      this.selectedEmployees.set(current.filter(id => id !== employeeId));
    } else {
      this.selectedEmployees.set([...current, employeeId]);
    }
  }

  /**
   * Assign shift to selected employees
   */
  assignShift(): void {
    const shift = this.selectedShiftForAssignment();
    if (!shift || this.selectedEmployees().length === 0) return;

    this.saving.set(true);

    const requests = this.selectedEmployees().map(employeeId =>
      this.shiftService.assignShiftToEmployee({
        shiftId: shift.id,
        companyEmployeeId: employeeId
      })
    );

    // Execute all requests
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.saving.set(false);
        this.selectedEmployees.set([]);
        this.loadShiftAssignments(shift.id);
        alert('Shift assigned successfully!');
      })
      .catch(error => {
        console.error('Error assigning shift:', error);
        this.saving.set(false);
        alert('Error assigning shift. Please try again.');
      });
  }

  /**
   * Unassign employee from shift
   */
  unassignShift(assignment: UserShift): void {
    if (!confirm('Remove this employee from the shift?')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.delete(`/api/v1/shifts/user-shifts/${assignment.id}`),
      () => {
        const shift = this.selectedShiftForAssignment();
        if (shift) {
          this.loadShiftAssignments(shift.id);
        }
        alert('Employee removed from shift successfully!');
      },
      (error) => {
        console.error('Error removing assignment:', error);
        alert('Error removing assignment. Please try again.');
      }
    );
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.employees().find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  }

  /**
   * Get employee details (department and position)
   */
  getEmployeeDetails(employeeId: string): string {
    const employee = this.employees().find(e => e.id === employeeId);
    return employee ? `${employee.department} - ${employee.position}` : '';
  }

  /**
   * Format time string for display
   */
  formatTime(time: string): string {
    if (!time) return 'N/A';
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}

