/**
 * Advanced Data Table Demo Component
 *
 * Demo component showcasing advanced data table features including sorting, filtering, pagination, and actions.
 * Demonstrates various data table configurations and usage patterns.
 *
 * @example
 * ```html
 * <app-advanced-data-table-demo></app-advanced-data-table-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-advanced-data-table-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataTableComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './advanced-data-table-demo.component.html',
  styleUrls: ['./advanced-data-table-demo.component.scss']
})
export class AdvancedDataTableDemoComponent implements OnInit {
  // Sample data
  sampleData: any[] = [
    {
      id: 1,
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      phone: '081-234-5678',
      department: 'IT',
      position: 'Senior Developer',
      salary: 50000,
      status: 'active',
      joinDate: '2023-01-15',
      lastLogin: '2025-10-25 09:30:00'
    },
    {
      id: 2,
      name: 'สมหญิง รักงาน',
      email: 'somying@example.com',
      phone: '082-345-6789',
      department: 'HR',
      position: 'HR Manager',
      salary: 45000,
      status: 'active',
      joinDate: '2023-03-20',
      lastLogin: '2025-10-25 08:45:00'
    },
    {
      id: 3,
      name: 'วิชัย เก่งมาก',
      email: 'wichai@example.com',
      phone: '083-456-7890',
      department: 'Finance',
      position: 'Accountant',
      salary: 35000,
      status: 'inactive',
      joinDate: '2023-06-10',
      lastLogin: '2025-10-20 17:20:00'
    },
    {
      id: 4,
      name: 'มาลี สวยงาม',
      email: 'malee@example.com',
      phone: '084-567-8901',
      department: 'Marketing',
      position: 'Marketing Specialist',
      salary: 40000,
      status: 'active',
      joinDate: '2023-08-05',
      lastLogin: '2025-10-25 10:15:00'
    },
    {
      id: 5,
      name: 'ประเสริฐ ดีมาก',
      email: 'prasert@example.com',
      phone: '085-678-9012',
      department: 'IT',
      position: 'System Admin',
      salary: 55000,
      status: 'active',
      joinDate: '2022-12-01',
      lastLogin: '2025-10-25 11:00:00'
    },
    {
      id: 6,
      name: 'นิดา น่ารัก',
      email: 'nida@example.com',
      phone: '086-789-0123',
      department: 'Sales',
      position: 'Sales Executive',
      salary: 38000,
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2025-10-24 16:30:00'
    },
    {
      id: 7,
      name: 'กิตติ เก่งจริง',
      email: 'kitti@example.com',
      phone: '087-890-1234',
      department: 'IT',
      position: 'Frontend Developer',
      salary: 42000,
      status: 'inactive',
      joinDate: '2023-11-15',
      lastLogin: '2025-10-18 14:45:00'
    },
    {
      id: 8,
      name: 'สุภาพ ใจดี',
      email: 'supap@example.com',
      phone: '088-901-2345',
      department: 'Customer Service',
      position: 'Customer Support',
      salary: 32000,
      status: 'active',
      joinDate: '2024-02-20',
      lastLogin: '2025-10-25 12:30:00'
    }
  ];

  // Table columns
  columns: TableColumn[] = [
    {
      key: 'name',
      label: 'ชื่อ-นามสกุล',
      sortable: true,
      filterable: true,
      width: '200px',
      type: 'text'
    },
    {
      key: 'email',
      label: 'อีเมล',
      sortable: true,
      filterable: true,
      width: '250px',
      type: 'text'
    },
    {
      key: 'phone',
      label: 'โทรศัพท์',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'text'
    },
    {
      key: 'department',
      label: 'แผนก',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'IT', label: 'IT' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'Customer Service', label: 'Customer Service' }
      ],
      width: '120px',
      type: 'text'
    },
    {
      key: 'position',
      label: 'ตำแหน่ง',
      sortable: true,
      filterable: true,
      width: '180px',
      type: 'text'
    },
    {
      key: 'salary',
      label: 'เงินเดือน',
      sortable: true,
      filterable: true,
      width: '120px',
      align: 'right',
      type: 'number',
      render: (value: number) => value.toLocaleString('th-TH')
    },
    {
      key: 'status',
      label: 'สถานะ',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'active', label: 'ใช้งาน' },
        { value: 'inactive', label: 'ไม่ใช้งาน' }
      ],
      width: '100px',
      align: 'center',
      type: 'text',
      render: (value: string) => value === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'
    },
    {
      key: 'joinDate',
      label: 'วันที่เข้าร่วม',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'date',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH')
    },
    {
      key: 'lastLogin',
      label: 'เข้าสู่ระบบล่าสุด',
      sortable: true,
      width: '180px',
      type: 'date'
    }
  ];

  // Table configuration (migrated to data-table inputs)
  pageSize: number = 5;
  enableColumnFilters: boolean = true;
  enableMultiSort: boolean = false;
  selectable: boolean = true;
  showExport: boolean = true;
  exportFormats: string[] = ['csv', 'excel', 'json'];
  emptyText: string = 'ไม่มีข้อมูลพนักงาน';
  emptyIcon: string = '👥';

  // Table actions
  actions: TableAction[] = [
    {
      label: 'ดู',
      icon: '👁️',
      variant: 'primary',
      onClick: (row) => this.viewEmployee(row)
    },
    {
      label: 'แก้ไข',
      icon: '✏️',
      variant: 'primary',
      onClick: (row) => this.editEmployee(row)
    },
    {
      label: 'ลบ',
      icon: '🗑️',
      variant: 'danger',
      onClick: (row) => this.deleteEmployee(row)
    }
  ];

  // Demo settings
  selectedSize: 'sm' | 'md' | 'lg' = 'md';
  striped: boolean = true;
  hover: boolean = true;
  bordered: boolean = false;
  compact: boolean = false;
  pagination: boolean = true;
  sortable: boolean = true;
  filterable: boolean = true;
  actionsEnabled: boolean = true;

  // Statistics
  selectedRows: any[] = [];
  totalRows: number = 0;
  filteredRows: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.updateConfig();
    this.totalRows = this.sampleData.length;
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    // Configuration is now handled via component inputs
    // No need to update config object anymore
  }

  /**
   * View employee
   */
  viewEmployee(employee: any): void {
    console.log('View employee:', employee);
    alert(`ดูข้อมูล: ${employee.name}`);
  }

  /**
   * Edit employee
   */
  editEmployee(employee: any): void {
    console.log('Edit employee:', employee);
    alert(`แก้ไขข้อมูล: ${employee.name}`);
  }

  /**
   * Delete employee
   */
  deleteEmployee(employee: any): void {
    if (confirm(`ต้องการลบข้อมูลของ ${employee.name} หรือไม่?`)) {
      const index = this.sampleData.findIndex(emp => emp.id === employee.id);
      if (index > -1) {
        this.sampleData.splice(index, 1);
        this.totalRows = this.sampleData.length;
        console.log('Employee deleted:', employee);
      }
    }
  }

  /**
   * Handle selection change
   */
  onSelectionChange(selectedRows: any[]): void {
    this.selectedRows = selectedRows;
    console.log('Selected rows:', selectedRows);
  }

  /**
   * Handle sort change
   */
  onSortChange(sortEvent: any): void {
    console.log('Sort changed:', sortEvent);
  }

  /**
   * Handle filter change
   */
  onFilterChange(filters: any): void {
    console.log('Filters changed:', filters);
  }

  /**
   * Handle page change
   */
  onPageChange(page: number): void {
    console.log('Page changed:', page);
  }

  /**
   * Add new employee
   */
  addEmployee(): void {
    const newEmployee = {
      id: this.sampleData.length + 1,
      name: 'พนักงานใหม่',
      email: 'new@example.com',
      phone: '089-000-0000',
      department: 'IT',
      position: 'Developer',
      salary: 30000,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toLocaleString('th-TH')
    };

    this.sampleData.push(newEmployee);
    this.totalRows = this.sampleData.length;
    console.log('Employee added:', newEmployee);
  }

  /**
   * Clear all data
   */
  clearData(): void {
    if (confirm('ต้องการลบข้อมูลทั้งหมดหรือไม่?')) {
      this.sampleData = [];
      this.totalRows = 0;
      this.selectedRows = [];
      console.log('All data cleared');
    }
  }

  /**
   * Load sample data
   */
  loadSampleData(): void {
    this.sampleData = [
      {
        id: 1,
        name: 'สมชาย ใจดี',
        email: 'somchai@example.com',
        phone: '081-234-5678',
        department: 'IT',
        position: 'Senior Developer',
        salary: 50000,
        status: 'active',
        joinDate: '2023-01-15',
        lastLogin: '2025-10-25 09:30:00'
      },
      {
        id: 2,
        name: 'สมหญิง รักงาน',
        email: 'somying@example.com',
        phone: '082-345-6789',
        department: 'HR',
        position: 'HR Manager',
        salary: 45000,
        status: 'active',
        joinDate: '2023-03-20',
        lastLogin: '2025-10-25 08:45:00'
      },
      {
        id: 3,
        name: 'วิชัย เก่งมาก',
        email: 'wichai@example.com',
        phone: '083-456-7890',
        department: 'Finance',
        position: 'Accountant',
        salary: 35000,
        status: 'inactive',
        joinDate: '2023-06-10',
        lastLogin: '2025-10-20 17:20:00'
      }
    ];
    this.totalRows = this.sampleData.length;
    this.selectedRows = [];
  }

  /**
   * Get size options
   */
  getSizeOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' }
    ];
  }

  /**
   * Get table statistics
   */
  getTableStats(): any {
    return {
      totalRows: this.totalRows,
      selectedRows: this.selectedRows.length,
      filteredRows: this.filteredRows,
      size: this.selectedSize,
      striped: this.striped,
      hover: this.hover,
      bordered: this.bordered,
      compact: this.compact,
      pagination: this.pagination,
      pageSize: this.pageSize,
      sortable: this.sortable,
      filterable: this.filterable,
      selectable: this.selectable,
      actionsEnabled: this.actionsEnabled
    };
  }
}





