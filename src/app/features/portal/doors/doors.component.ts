/**
 * Doors Component
 *
 * Door management component with CRUD operations and permission management.
 * Supports door creation, editing, deletion, and employee access permission management.
 *
 * @example
 * ```html
 * <app-doors></app-doors>
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
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ApiService } from '../../../core/services/api.service';
import { DoorService } from '../../../core/services/door.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Door, DoorCreate } from '../../../core/models/door.model';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Employee interface for door permissions
 */
interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  department?: string;
  position?: string;
}

/**
 * Door permission interface
 */
interface DoorPermission {
  id: string;
  employeeId?: string;
  companyEmployeeId?: string;
  doorId: string;
  accessType?: string;
}

@Component({
  selector: 'app-doors',
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
    EmptyStateComponent
  ],
  templateUrl: './doors.component.html',
  styleUrl: './doors.component.scss'
})
export class DoorsComponent extends BaseComponent implements OnInit {
  showModal = signal(false);
  showPermissionModal = signal(false);
  saving = signal(false);
  editingDoor = signal<Door | null>(null);
  selectedDoorForPermission = signal<Door | null>(null);

  // Permission management
  employees = signal<Employee[]>([]);
  doorPermissions = signal<DoorPermission[]>([]);
  selectedEmployees = signal<string[]>([]);
  loadingPermissions = signal(false);

  // Getters from service
  getDoors = () => this.doorService.getDoors();
  getLoading = () => this.doorService.getLoading();

  // Computed signals
  doors = computed(() => this.getDoors()());

  // Available employees (not already assigned)
  availableEmployees = computed(() => {
    const currentPermissions = this.doorPermissions();
    const assignedEmployeeIds = currentPermissions.map(p => p.employeeId);
    return this.employees().filter(emp => !assignedEmployeeIds.includes(emp.id));
  });

  formData: Partial<DoorCreate> = {
    doorName: '',
    location: ''
  };

  // Form fields configuration for ModalFormComponent
  doorFormFields = computed<FormFieldConfig[]>(() => {
    const door = this.editingDoor();
    return [
      {
        key: 'doorName',
        label: 'Door Name',
        type: 'text',
        placeholder: 'Enter door name',
        required: true,
        value: door?.doorName || this.formData.doorName || ''
      },
      {
        key: 'location',
        label: 'Location',
        type: 'text',
        placeholder: 'Enter door location',
        value: door?.location || this.formData.location || ''
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadDoors()
    },
    {
      label: this.i18n.t('common.add') + ' Door',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  columns: TableColumn[] = [
    { key: 'id', label: 'Door ID', sortable: true },
    { key: 'doorName', label: 'Door Name', sortable: true },
    { key: 'location', label: 'Location' }
  ];

  actions: TableAction[] = [
    {
      icon: '🔑',
      label: 'Manage Permissions',
      onClick: (row) => this.managePermissions(row)
    },
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editDoor(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteDoor(row)
    }
  ];

  constructor(
    private api: ApiService,
    private doorService: DoorService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadDoors();
    this.loadEmployees();
  }

  /**
   * Load doors for current company
   */
  loadDoors(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.doorService.loadDoors(),
      () => {
        // Doors data automatically updated via signals
      },
      (error) => {
        console.error('Error loading doors:', error);
      }
    );
  }

  openAddModal(): void {
    this.editingDoor.set(null);
    this.formData = {
      doorName: '',
      location: ''
    };
    this.showModal.set(true);
  }

  /**
   * Edit door
   */
  editDoor(door: Door): void {
    this.editingDoor.set(door);
    this.formData = {
      doorName: door.doorName,
      location: door.location || ''
    };
    this.showModal.set(true);
  }

  /**
   * Close door modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.editingDoor.set(null);
  }

  /**
   * Save door (create or update)
   */
  saveDoor(): void {
    this.saving.set(true);

    const request = this.editingDoor()
      ? this.doorService.updateDoor(this.editingDoor()!.id, this.formData)
      : this.doorService.createDoor(this.formData);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.saving.set(false);
        this.closeModal();
        this.loadDoors();
      },
      (error: any) => {
        console.error('Error saving door:', error);
        this.saving.set(false);
      }
    );
  }

  /**
   * Handle form submission from ModalFormComponent
   */
  onFormSubmitted(formData: Record<string, unknown>): void {
    // Update formData from ModalFormComponent
    this.formData = {
      doorName: String(formData['doorName'] || ''),
      location: formData['location'] ? String(formData['location']) : undefined
    };
    this.saveDoor();
  }

  /**
   * Delete door
   */
  deleteDoor(door: Door): void {
    if (!confirm(`Delete door ${door.doorName}?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.doorService.deleteDoor(door.id),
      () => {
        this.loadDoors();
      },
      (error: unknown) => {
        console.error('Error deleting door:', error);
      }
    );
  }

  loadEmployees(): void {
    const companyId = this.auth.getCurrentUser()?.companyId;
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<{ data?: Employee[]; items?: Employee[] } | Employee[]>(`/api/v1/employees?company_id=${companyId}`),
      (response: { data?: Employee[]; items?: Employee[] } | Employee[]) => {
        const employees = Array.isArray(response) ? response : (response.data || response.items || []);
        this.employees.set(employees);
      },
      (error) => {
        console.error('Error loading employees:', error);
      }
    );
  }

  /**
   * Manage door permissions
   */
  managePermissions(door: Door): void {
    this.selectedDoorForPermission.set(door);
    this.loadDoorPermissions(door.id);
    this.showPermissionModal.set(true);
  }

  /**
   * Load door permissions
   */
  loadDoorPermissions(doorId: string): void {
    this.loadingPermissions.set(true);
    const companyId = this.auth.getCurrentUser()?.companyId;
    if (!companyId) {
      this.loadingPermissions.set(false);
      return;
    }
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.doorService.getDoorPermissions(companyId.toString(), doorId),
      (response: { data?: DoorPermission[] } | DoorPermission[]) => {
        const permissions = Array.isArray(response) ? response : (response.data || []);
        this.doorPermissions.set(permissions);
        this.loadingPermissions.set(false);
      },
      (error) => {
        console.error('Error loading permissions:', error);
        this.loadingPermissions.set(false);
        this.doorPermissions.set([]);
      }
    );
  }

  closePermissionModal(): void {
    this.showPermissionModal.set(false);
    this.selectedDoorForPermission.set(null);
    this.selectedEmployees.set([]);
  }

  /**
   * Toggle employee selection for permissions
   */
  toggleEmployeeSelection(employeeId: string): void {
    const current = this.selectedEmployees();
    if (current.includes(employeeId)) {
      this.selectedEmployees.set(current.filter(id => id !== employeeId));
    } else {
      this.selectedEmployees.set([...current, employeeId]);
    }
  }

  /**
   * Grant door permissions to selected employees
   */
  grantPermissions(): void {
    const door = this.selectedDoorForPermission();
    if (!door || this.selectedEmployees().length === 0) return;

    this.saving.set(true);
    const companyId = this.auth.getCurrentUser()?.companyId;
    if (!companyId) {
      this.saving.set(false);
      return;
    }

    const requests = this.selectedEmployees().map(employeeId =>
      this.doorService.grantPermission(companyId.toString(), {
        doorId: door.id,
        companyEmployeeId: employeeId
      })
    );

    // Execute all requests
    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.saving.set(false);
        this.selectedEmployees.set([]);
        this.loadDoorPermissions(door.id);
        alert('Permissions granted successfully!');
      })
      .catch(error => {
        console.error('Error granting permissions:', error);
        this.saving.set(false);
        alert('Error granting permissions. Please try again.');
      });
  }

  /**
   * Revoke door permission from employee
   */
  revokePermission(permission: DoorPermission): void {
    if (!confirm('Revoke access for this employee?')) return;

    const companyId = this.auth.getCurrentUser()?.companyId;
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.doorService.revokePermission(companyId.toString(), permission.id),
      () => {
        const door = this.selectedDoorForPermission();
        if (door) {
          this.loadDoorPermissions(door.id);
        }
        alert('Permission revoked successfully!');
      },
      (error) => {
        console.error('Error revoking permission:', error);
        alert('Error revoking permission. Please try again.');
      }
    );
  }

  /**
   * Get employee full name by ID
   */
  getEmployeeName(employeeId: string | undefined): string {
    if (!employeeId) return 'Unknown';
    const employee = this.employees().find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}

