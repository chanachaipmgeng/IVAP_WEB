/**
 * HR Dashboard Component
 *
 * Comprehensive HR dashboard displaying employee statistics, approval requests, team management, and HR metrics.
 * Supports employee management, department/position tracking, and subordinate task management.
 *
 * @example
 * ```html
 * <app-hr-dashboard></app-hr-dashboard>
 * ```
 */

import { Component, OnInit, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../../shared/components/glass-input/glass-input.component';
import { EmployeeService, Employee, EmployeeStats } from '../../../core/services/employee.service';
import { CompanyService, Company } from '../../../core/services/company.service';
import { ApprovalService, ApprovalRequest, ApprovalStats } from '../../../core/services/approval.service';
import { SubordinateManagementService, SubordinateTask, TeamMember, TeamStats } from '../../../core/services/subordinate-management.service';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    GlassInputComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './hr-dashboard.component.html',
  styleUrls: ['./hr-dashboard.component.scss']
})
export class HrDashboardComponent extends BaseComponent implements OnInit {
  // Data
  employees: Employee[] = [];
  company: Company | null = null;
  departments: any[] = [];
  positions: any[] = [];
  approvalRequests: ApprovalRequest[] = [];
  tasks: SubordinateTask[] = [];
  teamMembers: TeamMember[] = [];

  // Statistics
  employeeStats: EmployeeStats = {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    terminatedEmployees: 0,
    onLeaveEmployees: 0,
    newHiresThisMonth: 0,
    newHiresThisYear: 0,
    leftThisMonth: 0,
    leftThisYear: 0,
    averageTenure: 0,
    employeesByDepartment: {},
    employeesByPosition: {},
    employeesByEmpType: {} as any,
    employeesByRole: {} as any,
    departmentDistribution: {},
    positionDistribution: {},
    averageSalary: 0,
    turnoverRate: 0
  };

  companyStats: any = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalPositions: 0,
    averageSalary: 0,
    departmentDistribution: {},
    positionDistribution: {},
    employeeGrowthRate: 0,
    turnoverRate: 0
  };

  approvalStats: ApprovalStats = {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    averageProcessingTime: 0,
    approvalRate: 0,
    requestsByType: {},
    requestsByPriority: {},
    overdueRequests: 0
  };

  teamStats: TeamStats = {
    totalMembers: 0,
    activeMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    averagePerformance: 0,
    teamProductivity: 0
  };

  // UI State
  selectedTab: 'overview' | 'employees' | 'approvals' | 'tasks' | 'reports' = 'overview';
  searchQuery = '';
  selectedDepartment = '';
  selectedStatus = '';
  showAdvancedFilters = false;

  // Filters
  employeeFilters = {
    search: '',
    department: '',
    status: '' as Employee['status'] | '',
    position: '',
    workType: '' as 'full_time' | 'part_time' | 'contract' | 'intern' | ''
  };

  approvalFilters = {
    type: '' as ApprovalRequest['type'] | '',
    status: '' as ApprovalRequest['status'] | '',
    priority: '' as ApprovalRequest['priority'] | '',
    search: ''
  };

  taskFilters = {
    status: '',
    priority: '',
    assignee: '',
    search: ''
  };

  constructor(
    private employeeService: EmployeeService,
    private companyService: CompanyService,
    private approvalService: ApprovalService,
    private subordinateService: SubordinateManagementService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToServices();
    this.loadData();
  }

  /**
   * Subscribe to service observables
   */
  private subscribeToServices(): void {
    // Load employees
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.employeeService.getEmployees(),
      (response) => {
        this.employees = response.data;
        this.calculateStats();
      },
      (error) => {
        console.error('Error loading employees:', error);
      }
    );

    // Load company data
    this.subscribe(
      this.companyService.loadCompanies({
        page: 1,
        limit: 1,
        filters: {
          search: '',
          status: '',
          subscriptionType: '',
          country: '',
          createdFrom: '',
          createdTo: ''
        },
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }),
      (response) => {
        if (response.data && response.data.length > 0) {
          this.company = response.data[0];
        }
      },
      (error) => {
        console.error('Error loading company:', error);
      }
    );

    // ✅ Using signals (no subscription needed)
    effect(() => {
      const requests = this.approvalService.requests();
      this.approvalRequests = requests;
    });

    effect(() => {
      const stats = this.approvalService.stats();
      this.approvalStats = stats;
    });

    // ✅ Using signals (no subscription needed)
    effect(() => {
      const tasks = this.subordinateService.tasks();
      this.tasks = tasks;
    });

    effect(() => {
      const members = this.subordinateService.teamMembers();
      this.teamMembers = members;
    });

    effect(() => {
      const stats = this.subordinateService.teamStats();
      this.teamStats = stats;
    });
  }

  /**
   * Load initial data
   */
  private loadData(): void {
    // Data is loaded through observables
  }

  /**
   * Select tab
   */
  selectTab(tab: string): void {
    this.selectedTab = tab as 'overview' | 'employees' | 'approvals' | 'tasks' | 'reports';
  }

  /**
   * Get filtered employees
   */
  getFilteredEmployees(): Employee[] {
    const filter = {
      search: this.employeeFilters.search || undefined,
      department: this.employeeFilters.department || undefined,
      status: this.employeeFilters.status || undefined,
      position: this.employeeFilters.position || undefined,
      workType: this.employeeFilters.workType || undefined
    };

    // Filter employees locally
    let filtered = this.employees;

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.firstName?.toLowerCase().includes(searchLower) ||
        emp.lastName?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.department) {
      filtered = filtered.filter(emp => emp.department === filter.department);
    }

    if (filter.status) {
      filtered = filtered.filter(emp => emp.status === filter.status);
    }

    return filtered;
  }

  /**
   * Calculate employee statistics
   */
  private calculateStats(): void {
    const totalEmployees = this.employees.length;
    const activeEmployees = this.employees.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = this.employees.filter(emp => emp.status === 'inactive').length;
    const terminatedEmployees = this.employees.filter(emp => emp.status === 'terminated').length;
    const onLeaveEmployees = this.employees.filter(emp => emp.status === 'on_leave').length;

    this.employeeStats = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      onLeaveEmployees,
      newHiresThisMonth: 0,
      newHiresThisYear: 0,
      leftThisMonth: 0,
      leftThisYear: 0,
      averageTenure: 0,
      employeesByDepartment: {},
      employeesByPosition: {},
      employeesByEmpType: {} as any,
      employeesByRole: {} as any,
      departmentDistribution: {},
      positionDistribution: {},
      averageSalary: 0,
      turnoverRate: 0
    };
  }

  /**
   * Get filtered approval requests
   */
  getFilteredApprovalRequests(): ApprovalRequest[] {
    const filter = {
      type: this.approvalFilters.type || undefined,
      status: this.approvalFilters.status || undefined,
      priority: this.approvalFilters.priority || undefined,
      search: this.approvalFilters.search || undefined
    };
    return this.approvalService.filterRequests(filter);
  }

  /**
   * Get filtered tasks
   */
  getFilteredTasks(): SubordinateTask[] {
    let filtered = this.tasks;

    if (this.taskFilters.status) {
      filtered = filtered.filter(task => task.status === this.taskFilters.status);
    }

    if (this.taskFilters.priority) {
      filtered = filtered.filter(task => task.priority === this.taskFilters.priority);
    }

    if (this.taskFilters.assignee) {
      filtered = filtered.filter(task => task.assigneeId === this.taskFilters.assignee);
    }

    if (this.taskFilters.search) {
      const searchTerm = this.taskFilters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.assigneeName.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  /**
   * Get department name by ID
   */
  getDepartmentName(id: string): string {
    const department = this.departments.find(dept => dept.id === id);
    return department ? department.name : 'ไม่ระบุ';
  }

  /**
   * Get position name by ID
   */
  getPositionName(id: string): string {
    const position = this.positions.find(pos => pos.id === id);
    return position ? position.title : 'ไม่ระบุ';
  }

  /**
   * Get employee name by ID
   */
  getEmployeeName(id: string): string {
    const employee = this.employees.find(emp => emp.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'ไม่ระบุ';
  }

  /**
   * Get status label
   */
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'ใช้งาน',
      inactive: 'ไม่ใช้งาน',
      terminated: 'สิ้นสุดการทำงาน',
      on_leave: 'ลาพัก',
      pending: 'รออนุมัติ',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ',
      cancelled: 'ยกเลิก',
      completed: 'เสร็จสิ้น',
      in_progress: 'กำลังดำเนินการ'
    };
    return labels[status] || status;
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: '#10B981',
      inactive: '#6B7280',
      terminated: '#EF4444',
      on_leave: '#F59E0B',
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444',
      cancelled: '#6B7280',
      completed: '#10B981',
      in_progress: '#3B82F6'
    };
    return colors[status] || '#6B7280';
  }

  /**
   * Get priority label
   */
  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      low: 'ต่ำ',
      medium: 'ปานกลาง',
      high: 'สูง',
      urgent: 'เร่งด่วน'
    };
    return labels[priority] || priority;
  }

  /**
   * Get priority color
   */
  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority] || '#6B7280';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('th-TH');
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Get task progress color
   */
  getTaskProgressColor(progress: number): string {
    if (progress < 30) return '#EF4444';
    if (progress < 70) return '#F59E0B';
    return '#10B981';
  }

  /**
   * Get performance score color
   */
  getPerformanceScoreColor(score: number): string {
    if (score < 2) return '#EF4444';
    if (score < 3) return '#F59E0B';
    if (score < 4) return '#3B82F6';
    return '#10B981';
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.employeeFilters = {
      search: '',
      department: '',
      status: '',
      position: '',
      workType: ''
    };
    this.approvalFilters = {
      type: '',
      status: '',
      priority: '',
      search: ''
    };
    this.taskFilters = {
      status: '',
      priority: '',
      assignee: '',
      search: ''
    };
  }

  /**
   * Export data
   */
  exportData(): void {
    const data = {
      employees: this.employeeService.exportEmployees(),
      company: this.company,
      approvals: this.approvalService.exportApprovalData(),
      subordinates: this.subordinateService.exportSubordinateData(),
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Get tab icon
   */
  getTabIcon(tab: string): string {
    const icons: { [key: string]: string } = {
      overview: 'fa-chart-pie',
      employees: 'fa-users',
      approvals: 'fa-check-circle',
      tasks: 'fa-tasks',
      reports: 'fa-chart-bar'
    };
    return icons[tab] || 'fa-circle';
  }

  /**
   * Get tab label
   */
  getTabLabel(tab: string): string {
    const labels: { [key: string]: string } = {
      overview: 'ภาพรวม',
      employees: 'พนักงาน',
      approvals: 'การอนุมัติ',
      tasks: 'งาน',
      reports: 'รายงาน'
    };
    return labels[tab] || tab;
  }

  /**
   * Toggle advanced filters
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Get recent activities
   */
  getRecentActivities(): any[] {
    const activities: any[] = [];

    // Add recent employees
    this.employees
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach(emp => {
        activities.push({
          type: 'employee',
          title: `พนักงานใหม่: ${emp.firstName} ${emp.lastName}`,
          description: `${emp.positionName || 'N/A'} - ${emp.departmentName || 'N/A'}`,
          date: emp.createdAt,
          icon: 'fa-user-plus'
        });
      });

    // Add recent approvals
    this.approvalRequests
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .forEach(req => {
        activities.push({
          type: 'approval',
          title: `คำขออนุมัติ: ${req.title}`,
          description: `${req.requesterName} → ${req.approverName}`,
          date: req.createdAt,
          icon: 'fa-check-circle'
        });
      });

    // Add recent tasks
    this.tasks
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3)
      .forEach(task => {
        activities.push({
          type: 'task',
          title: `งานใหม่: ${task.title}`,
          description: `มอบหมายให้ ${task.assigneeName}`,
          date: task.createdAt,
          icon: 'fa-tasks'
        });
      });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }
}
