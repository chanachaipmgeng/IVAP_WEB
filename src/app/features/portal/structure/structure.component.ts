/**
 * Structure Component
 *
 * Organization structure management component with CRUD operations for departments and positions.
 * Supports department and position creation, editing, deletion through tabbed interface.
 *
 * @example
 * ```html
 * <app-structure></app-structure>
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
import { TabsComponent, Tab } from '../../../shared/components/tabs/tabs.component';
import { ModalFormComponent } from '../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../shared/components/form-field/form-field.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Department, Position } from '../../../core/models';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Department form data interface
 */
interface DepartmentFormData {
  name: string;
  code: string;
  description?: string;
}

/**
 * Position form data interface
 */
interface PositionFormData {
  name: string;
  code: string;
  description?: string;
}

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    PageLayoutComponent,
    TabsComponent,
    ModalFormComponent
  ],
  templateUrl: './structure.component.html',
  styleUrl: './structure.component.scss'
})
export class StructureComponent extends BaseComponent implements OnInit {
  activeTab = signal<'departments' | 'positions'>('departments');

  // Page actions
  pageActions = computed<PageAction[]>(() => {
    if (this.activeTab() === 'departments') {
      return [{
        label: '➕ Add Department',
        variant: 'primary',
        onClick: () => this.openAddDeptModal()
      }];
    } else {
      return [{
        label: '➕ Add Position',
        variant: 'primary',
        onClick: () => this.openAddPosModal()
      }];
    }
  });

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'departments', label: '🏢 Departments' },
    { id: 'positions', label: '👔 Positions' }
  ]);

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'departments' | 'positions');
  }

  // Departments
  departments = signal<Department[]>([]);
  showDeptModal = signal(false);
  savingDept = signal(false);
  editingDept = signal<Department | null>(null);

  deptFormData: DepartmentFormData = {
    name: '',
    code: '',
    description: ''
  };

  deptColumns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Department Name', sortable: true },
    { key: 'description', label: 'Description' }
  ];

  deptActions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editDepartment(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteDepartment(row)
    }
  ];

  // Positions
  positions = signal<Position[]>([]);
  showPosModal = signal(false);
  savingPos = signal(false);
  editingPos = signal<Position | null>(null);

  posFormData: PositionFormData = {
    name: '',
    code: '',
    description: ''
  };

  // Form fields configuration for ModalFormComponent
  deptFormFields = computed<FormFieldConfig[]>(() => {
    const dept = this.editingDept();
    return [
      {
        key: 'code',
        label: 'Department Code',
        type: 'text',
        placeholder: 'DEPT001',
        required: true,
        value: dept?.code || this.deptFormData.code || ''
      },
      {
        key: 'name',
        label: 'Department Name',
        type: 'text',
        placeholder: 'IT Department',
        required: true,
        value: dept?.name || this.deptFormData.name || ''
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Department description...',
        rows: 3,
        fullWidth: true,
        value: dept?.description || this.deptFormData.description || ''
      }
    ];
  });

  posFormFields = computed<FormFieldConfig[]>(() => {
    const pos = this.editingPos();
    return [
      {
        key: 'code',
        label: 'Position Code',
        type: 'text',
        placeholder: 'POS001',
        required: true,
        value: pos?.code || this.posFormData.code || ''
      },
      {
        key: 'name',
        label: 'Position Name',
        type: 'text',
        placeholder: 'Software Engineer',
        required: true,
        value: pos?.name || this.posFormData.name || ''
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Position description...',
        rows: 3,
        fullWidth: true,
        value: pos?.description || this.posFormData.description || ''
      }
    ];
  });

  posColumns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Position Name', sortable: true },
    { key: 'description', label: 'Description' }
  ];

  posActions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editPosition(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deletePosition(row)
    }
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadPositions();
  }

  /**
   * Load departments for current company
   */
  loadDepartments(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<{ data?: Department[] } | Department[]>(`/departments/company/${companyId}`),
      (response: { data?: Department[] } | Department[]) => {
        const departments = Array.isArray(response) ? response : (response.data || []);
        this.departments.set(departments);
      },
      (error) => {
        console.error('Error loading departments:', error);
        this.departments.set([]);
      }
    );
  }

  openAddDeptModal(): void {
    this.editingDept.set(null);
    this.deptFormData = { name: '', code: '', description: '' };
    this.showDeptModal.set(true);
  }

  editDepartment(dept: Department): void {
    this.editingDept.set(dept);
    this.deptFormData = { ...dept };
    this.showDeptModal.set(true);
  }

  closeDeptModal(): void {
    this.showDeptModal.set(false);
    this.editingDept.set(null);
  }

  onDeptFormSubmitted(formData: Record<string, any>): void {
    this.deptFormData = {
      code: formData['code'] || '',
      name: formData['name'] || '',
      description: formData['description'] || ''
    };
    this.saveDepartment();
  }

  /**
   * Save department (create or update)
   */
  saveDepartment(): void {
    this.savingDept.set(true);

    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.savingDept.set(false);
      return;
    }

    const data = { ...this.deptFormData, companyId };

    const request = this.editingDept()
      ? this.api.put(`/departments/${this.editingDept()!.id}`, data)
      : this.api.post('/departments', data);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.savingDept.set(false);
        this.closeDeptModal();
        this.loadDepartments();
      },
      (error) => {
        console.error('Error saving department:', error);
        this.savingDept.set(false);
      }
    );
  }

  /**
   * Delete department
   */
  deleteDepartment(dept: Department): void {
    if (!confirm(`Delete department ${dept.name}?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.delete(`/departments/${dept.id}`),
      () => {
        this.loadDepartments();
      },
      (error) => {
        console.error('Error deleting department:', error);
      }
    );
  }

  // Position methods
  loadPositions(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<Position[]>(`/positions/company/${companyId}`),
      (response: any) => {
        this.positions.set(response.data || response || []);
      },
      (error) => {
        console.error('Error loading positions:', error);
        this.positions.set([]);
      }
    );
  }

  openAddPosModal(): void {
    this.editingPos.set(null);
    this.posFormData = { name: '', code: '', description: '' };
    this.showPosModal.set(true);
  }

  editPosition(pos: Position): void {
    this.editingPos.set(pos);
    this.posFormData = { ...pos };
    this.showPosModal.set(true);
  }

  closePosModal(): void {
    this.showPosModal.set(false);
    this.editingPos.set(null);
  }

  onPosFormSubmitted(formData: Record<string, any>): void {
    this.posFormData = {
      code: formData['code'] || '',
      name: formData['name'] || '',
      description: formData['description'] || ''
    };
    this.savePosition();
  }

  /**
   * Save position (create or update)
   */
  savePosition(): void {
    this.savingPos.set(true);

    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) {
      this.savingPos.set(false);
      return;
    }

    const data = { ...this.posFormData, companyId };

    const request = this.editingPos()
      ? this.api.put(`/positions/${this.editingPos()!.id}`, data)
      : this.api.post('/positions', data);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.savingPos.set(false);
        this.closePosModal();
        this.loadPositions();
      },
      (error) => {
        console.error('Error saving position:', error);
        this.savingPos.set(false);
      }
    );
  }

  /**
   * Delete position
   */
  deletePosition(pos: Position): void {
    if (!confirm(`Delete position ${pos.name}?`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.delete(`/positions/${pos.id}`),
      () => {
        this.loadPositions();
      },
      (error) => {
        console.error('Error deleting position:', error);
      }
    );
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: 'departments' | 'positions'): void {
    this.activeTab.set(tab);
  }

  /**
   * TrackBy function for departments
   */
  trackByDepartment(index: number, dept: Department): string {
    return dept.id ? String(dept.id) : index.toString();
  }

  /**
   * TrackBy function for positions
   */
  trackByPosition(index: number, pos: Position): string {
    return pos.id ? String(pos.id) : index.toString();
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}

