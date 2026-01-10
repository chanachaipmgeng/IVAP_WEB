/**
 * Structure Component
 *
 * Organization structure management component with CRUD operations for:
 * 1. Company Info (Profile)
 * 2. Departments
 * 3. Positions
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
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../../shared/components/page-layout/page-layout.component';
import { TabsComponent, Tab } from '../../../../shared/components/tabs/tabs.component';
import { ModalFormComponent } from '../../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../../shared/components/form-field/form-field.component';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { Department, DepartmentCreate, DepartmentUpdate } from '../../../../core/models/department.model';
import { Position, PositionCreate, PositionUpdate } from '../../../../core/models/position.model';
import { Company, CompanyUpdate } from '../../../../core/models/company.model';
import { DepartmentService } from '../../../../core/services/department.service';
import { PositionService } from '../../../../core/services/position.service';
import { CompanyService } from '../../../../core/services/company.service';
import { BaseComponent } from '../../../../core/base/base.component';

/**
 * Department form data interface
 */
interface DepartmentFormData {
  th_name: string;
  eng_name: string;
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
  activeTab = signal<'company-info' | 'departments' | 'positions'>('company-info');

  // Page actions
  pageActions = computed<PageAction[]>(() => {
    if (this.activeTab() === 'departments') {
      return [{
        label: '➕ Add Department',
        variant: 'primary',
        onClick: () => this.openAddDeptModal()
      }];
    } else if (this.activeTab() === 'positions') {
      return [{
        label: '➕ Add Position',
        variant: 'primary',
        onClick: () => this.openAddPosModal()
      }];
    } else {
      // Company Info tab actions (Save button is inside form)
      return [];
    }
  });

  // Tabs configuration
  tabs = computed<Tab[]>(() => [
    { id: 'company-info', label: 'ℹ️ Company Info' },
    { id: 'departments', label: '🏢 Departments' },
    { id: 'positions', label: '👔 Positions' }
  ]);

  onTabChange(tabId: string): void {
    this.activeTab.set(tabId as 'company-info' | 'departments' | 'positions');

    // Refresh data when tab becomes active to ensure up-to-date info
    if (tabId === 'departments') {
        this.loadDepartments();
    } else if (tabId === 'positions') {
        this.loadPositions();
    } else if (tabId === 'company-info') {
        this.loadCompanyInfo();
    }
  }

  // --- Company Info State ---
  company = signal<Company | null>(null);
  loadingCompany = signal(false);
  savingCompany = signal(false);

  // Company Form Data
  companyFormData = {
    name: '',
    address: '',
    phone_number: '',
    email: '',
    website: '',
    tax_id: ''
  };

  // --- Departments State ---
  departments = signal<Department[]>([]);
  showDeptModal = signal(false);
  savingDept = signal(false);
  editingDept = signal<Department | null>(null);

  deptFormData: DepartmentFormData = {
    th_name: '',
    eng_name: ''
  };

  deptColumns: TableColumn[] = [
    { key: 'th_name', label: 'ชื่อแผนก (ไทย)', sortable: true },
    { key: 'eng_name', label: 'Department Name (English)', sortable: true }
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

  // --- Positions State ---
  positions = signal<Position[]>([]);
  showPosModal = signal(false);
  savingPos = signal(false);
  editingPos = signal<Position | null>(null);

  posFormData: { th_name: string; eng_name: string } = {
    th_name: '',
    eng_name: ''
  };

  // Form fields configuration for ModalFormComponent
  deptFormFields = computed<FormFieldConfig[]>(() => {
    const dept = this.editingDept();
    return [
      {
        key: 'th_name',
        label: 'ชื่อแผนก (ภาษาไทย)',
        type: 'text',
        placeholder: 'แผนกเทคโนโลยี',
        required: true,
        value: dept?.th_name || this.deptFormData.th_name || ''
      },
      {
        key: 'eng_name',
        label: 'Department Name (English)',
        type: 'text',
        placeholder: 'IT Department',
        required: true,
        value: dept?.eng_name || this.deptFormData.eng_name || ''
      }
    ];
  });

  posFormFields = computed<FormFieldConfig[]>(() => {
    const pos = this.editingPos();
    return [
      {
        key: 'th_name',
        label: 'ชื่อตำแหน่ง (ภาษาไทย)',
        type: 'text',
        placeholder: 'นักพัฒนาซอฟต์แวร์',
        required: true,
        value: pos?.th_name || this.posFormData.th_name || ''
      },
      {
        key: 'eng_name',
        label: 'Position Name (English)',
        type: 'text',
        placeholder: 'Software Developer',
        required: true,
        value: pos?.eng_name || this.posFormData.eng_name || ''
      }
    ];
  });

  posColumns: TableColumn[] = [
    { key: 'th_name', label: 'ชื่อตำแหน่ง (ไทย)', sortable: true },
    { key: 'eng_name', label: 'Position Name (English)', sortable: true }
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
    private i18n: I18nService,
    private departmentService: DepartmentService,
    private positionService: PositionService,
    private companyService: CompanyService
  ) {
    super();
  }

  ngOnInit(): void {
    // Watch for user changes to reload data when companyId becomes available
    this.subscribe(
      this.auth.currentUser$,
      (user) => {
        if (user && (user.companyId || user.company_id)) {
          // If we haven't loaded data yet, or if user changed, load/reload
          // This handles both initial load (if auth is async) and updates
          // Use a flag or check if data is empty to avoid double loading on init if both ngOnInit calls and subscription fires

          // But actually, ngOnInit calls below might fail if user is not ready.
          // This subscription ensures we retry when user IS ready.

          // Only reload if we are on that tab and haven't loaded successfully?
          // Or just call the load methods, they handle "if companyId exists" check.

          // Let's just trigger load for active tab + company info
          this.loadCompanyInfo();

          if (this.activeTab() === 'departments') {
             this.loadDepartments();
          } else if (this.activeTab() === 'positions') {
             this.loadPositions();
          }
          // Note: The previous direct calls in ngOnInit might have failed if user wasn't ready.
          // This ensures they run when user becomes available.
        }
      }
    );

    // Initial attempt (in case user is already synchronously available)
    this.loadCompanyInfo();
    this.loadDepartments();
    this.loadPositions();
  }

  private getCompanyId(): string | undefined {
    const user = this.auth.currentUser();
    return (
      user?.companyId?.toString() ||
      user?.company_id ||
      user?.user_metadata?.['company_id'] ||
      user?.userMetadata?.['company_id']
    );
  }

  // --- Company Methods ---

  loadCompanyInfo(): void {
    this.loadingCompany.set(true);
    const companyId = this.getCompanyId();

    if (!companyId) {
        console.warn('No company ID found for current user');
        this.loadingCompany.set(false);
        return;
    }

    this.subscribe(
        this.companyService.getById(String(companyId)),
        (response: any) => {
            // Handle both wrapped response and direct object
            const companyData = (response.data || response) as Company;
            this.company.set(companyData);

            // Try to parse company_info if it's JSON
            let additionalInfo: any = {};
            try {
                if (companyData.company_info && companyData.company_info.startsWith('{')) {
                    additionalInfo = JSON.parse(companyData.company_info);
                }
            } catch (e) {
                console.warn('Could not parse company_info', e);
            }

            // Populate form
            this.companyFormData = {
                name: companyData.company_name || '',
                address: companyData.address || '',
                phone_number: companyData.contact || '', // Map contact to phone
                email: additionalInfo.email || '', // From JSON info or empty
                website: additionalInfo.website || '',
                tax_id: additionalInfo.tax_id || ''
            };
            this.loadingCompany.set(false);
        },
        (error) => {
            console.error('Error loading company info:', error);
            this.loadingCompany.set(false);
        }
    );
  }

  saveCompanyInfo(): void {
    const companyId = this.getCompanyId();
    if (!companyId) return;

    this.savingCompany.set(true);

    // Create JSON for extra fields not in core model
    const additionalInfo = {
        email: this.companyFormData.email,
        website: this.companyFormData.website,
        tax_id: this.companyFormData.tax_id
    };

    const updateData: CompanyUpdate = {
        company_name: this.companyFormData.name,
        address: this.companyFormData.address,
        contact: this.companyFormData.phone_number,
        company_info: JSON.stringify(additionalInfo)
    };

    this.subscribe(
        this.companyService.update(String(companyId), updateData),
        (response: any) => {
            const updatedCompany = (response.data || response) as Company;
            this.company.set(updatedCompany);
            this.savingCompany.set(false);
            alert('Company information updated successfully!');
        },
        (error) => {
            console.error('Error updating company info:', error);
            this.savingCompany.set(false);
            alert('Failed to update company information.');
        }
    );
  }


  // --- Department Methods ---

  /**
   * Load departments for current company
   */
  loadDepartments(): void {
    const companyId = this.getCompanyId();
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.departmentService.getByCompanyId(String(companyId)),
      (response) => {
        const items = response.items || response.data || [];
        this.departments.set(items);
      },
      (error) => {
        console.error('Error loading departments:', error);
        this.departments.set([]);
      }
    );
  }

  openAddDeptModal(): void {
    this.editingDept.set(null);
    this.deptFormData = { th_name: '', eng_name: '' };
    this.showDeptModal.set(true);
  }

  editDepartment(dept: Department): void {
    this.editingDept.set(dept);
    this.deptFormData = {
      th_name: dept.th_name || '',
      eng_name: dept.eng_name || ''
    };
    this.showDeptModal.set(true);
  }

  closeDeptModal(): void {
    this.showDeptModal.set(false);
    this.editingDept.set(null);
  }

  onDeptFormSubmitted(formData: Record<string, any>): void {
    this.deptFormData = {
      th_name: formData['th_name'] || '',
      eng_name: formData['eng_name'] || ''
    };
    this.saveDepartment();
  }

  /**
   * Save department (create or update)
   */
  saveDepartment(): void {
    this.savingDept.set(true);

    const companyId = this.getCompanyId();
    if (!companyId) {
      this.savingDept.set(false);
      return;
    }

    const deptData: DepartmentCreate = {
      ...this.deptFormData,
      company_id: String(companyId)
    };

    const request = this.editingDept()
      ? this.departmentService.update(this.editingDept()!.department_id, deptData)
      : this.departmentService.create(deptData);

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
    if (!confirm(`Delete department ${dept.th_name || dept.eng_name}?`)) return;

    const companyId = this.getCompanyId();
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.departmentService.deleteWithCompanyId(dept.department_id, String(companyId)),
      () => {
        this.loadDepartments();
      },
      (error) => {
        console.error('Error deleting department:', error);
      }
    );
  }

  // --- Position Methods ---

  loadPositions(): void {
    const companyId = this.getCompanyId();
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.positionService.getByCompanyId(String(companyId)),
      (response) => {
        const items = response.items || response.data || [];
        this.positions.set(items);
      },
      (error) => {
        console.error('Error loading positions:', error);
        this.positions.set([]);
      }
    );
  }

  openAddPosModal(): void {
    this.editingPos.set(null);
    this.posFormData = { th_name: '', eng_name: '' };
    this.showPosModal.set(true);
  }

  editPosition(pos: Position): void {
    this.editingPos.set(pos);
    this.posFormData = {
      th_name: pos.th_name || '',
      eng_name: pos.eng_name || ''
    };
    this.showPosModal.set(true);
  }

  closePosModal(): void {
    this.showPosModal.set(false);
    this.editingPos.set(null);
  }

  onPosFormSubmitted(formData: Record<string, any>): void {
    this.posFormData = {
      th_name: formData['th_name'] || '',
      eng_name: formData['eng_name'] || ''
    };
    this.savePosition();
  }

  /**
   * Save position (create or update)
   */
  savePosition(): void {
    this.savingPos.set(true);

    const companyId = this.getCompanyId();
    if (!companyId) {
      this.savingPos.set(false);
      return;
    }

    const posData: PositionCreate = {
      ...this.posFormData,
      company_id: String(companyId)
    };

    const request = this.editingPos()
      ? this.positionService.update(this.editingPos()!.position_id, posData)
      : this.positionService.create(posData);

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
    if (!confirm(`Delete position ${pos.th_name || pos.eng_name}?`)) return;

    const companyId = this.getCompanyId();
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.positionService.deleteWithCompanyId(pos.position_id, String(companyId)),
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
  setActiveTab(tab: 'company-info' | 'departments' | 'positions'): void {
    this.onTabChange(tab);
  }

  /**
   * TrackBy function for departments
   */
  trackByDepartment(index: number, dept: Department): string {
    return dept.department_id ? String(dept.department_id) : index.toString();
  }

  /**
   * TrackBy function for positions
   */
  trackByPosition(index: number, pos: Position): string {
    return pos.position_id ? String(pos.position_id) : index.toString();
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}
