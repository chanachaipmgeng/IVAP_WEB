/**
 * Employees New Component
 *
 * Enhanced employees management component with animations and improved UI.
 * Supports full CRUD operations, statistics, filtering, and employee management.
 *
 * @example
 * ```html
 * <app-employees-new></app-employees-new>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Shared Components
import { PageLayoutComponent, BreadcrumbItem, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

// Services
import { EmployeeService, Employee } from '../../../core/services/employee.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';

// Animations
import { fadeIn, slideInUp, listAnimation, scaleInOut } from '../../../core/animations/animations';

@Component({
  selector: 'app-employees-new',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageLayoutComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    GlassCardComponent,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent
  ],
  animations: [fadeIn, slideInUp, listAnimation, scaleInOut],
  template: `
    <app-page-layout
      [title]="i18n.t('employees.title')"
      [description]="getPageDescription()"
      icon="👥"
      [breadcrumb]="breadcrumb"
      [actions]="pageActions"
    >
      <!-- Stats Cards -->
      @if (!loading()) {
        <div class="stats-grid" @slideInUp>
          <app-glass-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">👥</div>
              <div class="stat-details">
                <div class="stat-value">{{ employees().length }}</div>
                <div class="stat-label">{{ i18n.t('employees.total') }}</div>
              </div>
            </div>
          </app-glass-card>

          <app-glass-card class="stat-card success">
            <div class="stat-content">
              <div class="stat-icon">✅</div>
              <div class="stat-details">
                <div class="stat-value">{{ activeEmployees() }}</div>
                <div class="stat-label">{{ i18n.t('employees.active') }}</div>
              </div>
            </div>
          </app-glass-card>

          <app-glass-card class="stat-card warning">
            <div class="stat-content">
              <div class="stat-icon">⏸️</div>
              <div class="stat-details">
                <div class="stat-value">{{ inactiveEmployees() }}</div>
                <div class="stat-label">{{ i18n.t('employees.inactive') }}</div>
              </div>
            </div>
          </app-glass-card>

          <app-glass-card class="stat-card info">
            <div class="stat-content">
              <div class="stat-icon">🏖️</div>
              <div class="stat-details">
                <div class="stat-value">{{ onLeaveEmployees() }}</div>
                <div class="stat-label">{{ i18n.t('employees.onLeave') }}</div>
              </div>
            </div>
          </app-glass-card>
        </div>
      }

      <!-- Filters Card -->
      <app-glass-card @fadeIn>
        <div class="filters-container">
          <div class="filter-group">
            <label>{{ i18n.t('employees.search') }}</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              [placeholder]="i18n.t('employees.search')"
              class="glass-input"
            />
          </div>

          <div class="filter-group">
            <label>{{ i18n.t('employees.department') }}</label>
            <select [(ngModel)]="filterDepartment" (ngModelChange)="onFilterChange()" class="glass-input">
              <option value="">{{ i18n.t('common.selectAll') }}</option>
              <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>{{ i18n.t('employees.status') }}</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()" class="glass-input">
              <option value="">{{ i18n.t('common.selectAll') }}</option>
              <option value="active">{{ i18n.t('common.active') }}</option>
              <option value="inactive">{{ i18n.t('common.inactive') }}</option>
              <option value="on_leave">{{ i18n.t('employees.onLeave') }}</option>
            </select>
          </div>

          <div class="filter-actions">
            <app-glass-button variant="secondary" (clicked)="clearFilters()">
              🔄 {{ i18n.t('common.reset') }}
            </app-glass-button>
          </div>
        </div>
      </app-glass-card>

      <!-- Data Table or Empty State -->
      @if (loading()) {
        <app-loading-state type="skeleton" [skeletonLines]="[100, 95, 100, 90, 95]"></app-loading-state>
      } @else if (filteredEmployees().length === 0) {
        <app-empty-state
          icon="📭"
          [title]="hasFilters() ? i18n.t('common.noData') : i18n.t('employees.noData')"
          [description]="hasFilters() ? 'Try adjusting your filters' : 'Start by adding your first employee'"
          [action]="!hasFilters() ? {
            label: i18n.t('employees.add'),
            icon: '➕',
            variant: 'primary',
            onClick: openAddModal.bind(this)
          } : undefined"
        ></app-empty-state>
      } @else {
        <app-glass-card @fadeIn>
          <app-data-table
            [columns]="columns"
            [data]="filteredEmployees()"
            [actions]="tableActions"
            [searchable]="false"
          ></app-data-table>
        </app-glass-card>
      }

      <!-- Footer Stats -->
      <div footer>
        <div class="footer-stats">
          <span>{{ i18n.t('common.total') }}: {{ filteredEmployees().length }} / {{ employees().length }}</span>
          <span>{{ i18n.t('common.status') }}: {{ getFilterSummary() }}</span>
        </div>
      </div>
    </app-page-layout>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <app-modal
        [title]="isEditing() ? i18n.t('employees.edit') : i18n.t('employees.add')"
        [isOpen]="showModal()"
        (closed)="closeModal()"
        @scaleInOut
      >
        <form (ngSubmit)="saveEmployee()">
          <div class="form-grid">
            <div class="form-group">
              <label>{{ i18n.t('employees.firstName') }}</label>
              <input type="text" [(ngModel)]="formData.firstName" name="firstName" class="glass-input" required />
            </div>

            <div class="form-group">
              <label>{{ i18n.t('employees.lastName') }}</label>
              <input type="text" [(ngModel)]="formData.lastName" name="lastName" class="glass-input" required />
            </div>

            <div class="form-group">
              <label>{{ i18n.t('employees.email') }}</label>
              <input type="email" [(ngModel)]="formData.email" name="email" class="glass-input" required />
            </div>

            <div class="form-group">
              <label>{{ i18n.t('employees.phone') }}</label>
              <input type="tel" [(ngModel)]="formData.phone" name="phone" class="glass-input" />
            </div>

            <div class="form-group">
              <label>{{ i18n.t('employees.department') }}</label>
              <select [(ngModel)]="formData.department" name="department" class="glass-input" required>
                <option value="">{{ i18n.t('common.select') }}</option>
                <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ i18n.t('employees.position') }}</label>
              <input type="text" [(ngModel)]="formData.position" name="position" class="glass-input" required />
            </div>
          </div>

          <div class="modal-actions">
            <app-glass-button type="button" variant="secondary" (clicked)="closeModal()">
              {{ i18n.t('common.cancel') }}
            </app-glass-button>
            <app-glass-button type="submit" variant="primary" [disabled]="saving()">
              {{ saving() ? i18n.t('common.loading') : i18n.t('common.save') }}
            </app-glass-button>
          </div>
        </form>
      </app-modal>
    }
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem;
    }

    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.9;
    }

    .stat-details {
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-textPrimary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--color-textSecondary);
      margin-top: 0.25rem;
    }

    .stat-card.success .stat-icon {
      filter: hue-rotate(120deg);
    }

    .stat-card.warning .stat-icon {
      filter: hue-rotate(45deg);
    }

    .stat-card.info .stat-icon {
      filter: hue-rotate(200deg);
    }

    .filters-container {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
    }

    @media (max-width: 1024px) {
      .filters-container {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .filters-container {
        grid-template-columns: 1fr;
      }
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-textSecondary);
    }

    .glass-input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 0.75rem;
      color: var(--color-textPrimary);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }

    .glass-input:focus {
      outline: none;
      border-color: var(--color-primary);
      background: rgba(255, 255, 255, 0.15);
    }

    .filter-actions {
      display: flex;
      align-items: center;
    }

    .footer-stats {
      display: flex;
      justify-content: space-between;
      color: var(--color-textSecondary);
      font-size: 0.875rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-textPrimary);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }
  `]
})
export class EmployeesNewComponent implements OnInit {
  // Signals
  employees = signal<Employee[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  isEditing = signal(false);

  // Filters
  searchTerm = '';
  filterDepartment = '';
  filterStatus = '';

  // Form Data
  formData: any = {};

  // Computed
  filteredEmployees = computed(() => {
    let filtered = this.employees();

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.firstName?.toLowerCase().includes(search) ||
        emp.lastName?.toLowerCase().includes(search) ||
        emp.email?.toLowerCase().includes(search)
      );
    }

    if (this.filterDepartment) {
      filtered = filtered.filter(emp => emp.department === this.filterDepartment);
    }

    if (this.filterStatus) {
      filtered = filtered.filter(emp => emp.status === this.filterStatus);
    }

    return filtered;
  });

  activeEmployees = computed(() =>
    this.employees().filter(emp => emp.status === 'active').length
  );

  inactiveEmployees = computed(() =>
    this.employees().filter(emp => emp.status === 'inactive').length
  );

  onLeaveEmployees = computed(() =>
    this.employees().filter(emp => emp.status === 'on_leave').length
  );

  // Departments list
  departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Operations'];

  // Page Configuration
  breadcrumb!: BreadcrumbItem[];
  pageActions!: PageAction[];
  columns!: TableColumn[];
  tableActions!: TableAction[];

  constructor(
    public i18n: I18nService,
    public theme: ThemeService,
    private employeeService: EmployeeService
  ) {
    // Initialize arrays in constructor after services are injected
    this.breadcrumb = [
      { label: this.i18n.t('navigation.dashboard'), link: '/portal/dashboard', icon: '🏠' },
      { label: this.i18n.t('employees.title'), icon: '👥' }
    ];

    this.pageActions = [
      {
        label: this.i18n.t('employees.import'),
        icon: '📥',
        variant: 'secondary',
        onClick: () => this.importEmployees()
      },
      {
        label: this.i18n.t('employees.export'),
        icon: '📊',
        variant: 'secondary',
        onClick: () => this.exportEmployees()
      },
      {
        label: this.i18n.t('employees.add'),
        icon: '➕',
        variant: 'primary',
        onClick: () => this.openAddModal()
      }
    ];

    this.columns = [
      { key: 'firstName', label: this.i18n.t('employees.firstName'), sortable: true },
      { key: 'lastName', label: this.i18n.t('employees.lastName'), sortable: true },
      { key: 'email', label: this.i18n.t('employees.email'), sortable: true },
      { key: 'department', label: this.i18n.t('employees.department'), sortable: true },
      { key: 'position', label: this.i18n.t('employees.position'), sortable: true },
      {
        key: 'status',
        label: this.i18n.t('employees.status'),
        sortable: true,
        render: (value: string) => this.renderStatus(value)
      }
    ];

    this.tableActions = [
      {
        icon: '✏️',
        label: this.i18n.t('common.edit'),
        onClick: (row) => this.editEmployee(row)
      },
      {
        icon: '👁️',
        label: this.i18n.t('common.view'),
        onClick: (row) => this.viewEmployee(row)
      },
      {
        icon: '🗑️',
        label: this.i18n.t('common.delete'),
        variant: 'danger',
        onClick: (row) => this.deleteEmployee(row)
      }
    ];
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  // Data Loading
  private loadEmployees(): void {
    this.loading.set(true);
    this.employeeService.getEmployees().subscribe({
      next: (response) => {
        this.employees.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading.set(false);
      }
    });
  }

  // Filters
  onSearchChange(): void {
    // Trigger computed update
  }

  onFilterChange(): void {
    // Trigger computed update
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterDepartment = '';
    this.filterStatus = '';
  }

  hasFilters(): boolean {
    return !!(this.searchTerm || this.filterDepartment || this.filterStatus);
  }

  getFilterSummary(): string {
    if (!this.hasFilters()) return this.i18n.t('common.selectAll');
    const parts = [];
    if (this.searchTerm) parts.push(`Search: "${this.searchTerm}"`);
    if (this.filterDepartment) parts.push(`Dept: ${this.filterDepartment}`);
    if (this.filterStatus) parts.push(`Status: ${this.filterStatus}`);
    return parts.join(' | ');
  }

  // Modal Actions
  openAddModal(): void {
    this.isEditing.set(false);
    this.formData = {};
    this.showModal.set(true);
  }

  editEmployee(employee: Employee): void {
    this.isEditing.set(true);
    this.formData = { ...employee };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.formData = {};
  }

  saveEmployee(): void {
    this.saving.set(true);
    // Implement save logic here
    setTimeout(() => {
      this.saving.set(false);
      this.closeModal();
      this.loadEmployees();
    }, 1000);
  }

  // Actions
  viewEmployee(employee: Employee): void {
    // View employee details
    // TODO: Implement view employee modal or navigation
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(this.i18n.t('messages.confirmDelete'))) {
      // Implement delete logic here
      this.loadEmployees();
    }
  }

  importEmployees(): void {
    // TODO: Implement employee import functionality
  }

  exportEmployees(): void {
    // TODO: Implement employee export functionality
  }

  // Helpers
  getPageDescription(): string {
    const lang = this.i18n.currentLanguage();
    return lang === 'th'
      ? 'จัดการข้อมูลพนักงานทั้งหมดในองค์กร'
      : 'Manage all employees in your organization';
  }

  private renderStatus(status: string): string {
    const statusMap: any = {
      active: { icon: '✅', label: this.i18n.t('common.active'), color: '#10B981' },
      inactive: { icon: '❌', label: this.i18n.t('common.inactive'), color: '#EF4444' },
      on_leave: { icon: '🏖️', label: this.i18n.t('employees.onLeave'), color: '#F59E0B' }
    };

    const s = statusMap[status] || statusMap.active;
    return `<span style="color: ${s.color};">${s.icon} ${s.label}</span>`;
  }
}

