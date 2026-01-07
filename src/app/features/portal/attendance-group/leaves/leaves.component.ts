/**
 * Leaves Component
 *
 * Leave management component with CRUD operations, approval workflow, and balance tracking.
 * Supports leave request creation, approval/rejection, cancellation, filtering, and leave balance display.
 *
 * @example
 * ```html
 * <app-leaves></app-leaves>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../../core/services/leave.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import {
  Leave,
  LeaveType,
  LeaveStatus,
  LeaveBalance,
  LeaveCreate,
  LeaveFilters,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS
} from '../../../../core/models/leave.model';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { BaseComponent } from '../../../../core/base/base.component';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent, LoadingComponent],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.scss']
})
export class LeavesComponent extends BaseComponent implements OnInit {
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);

  // Signals
  leaves = signal<Leave[]>([]);
  filteredLeaves = signal<Leave[]>([]);
  leaveBalances = signal<LeaveBalance[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  showRejectModal = signal(false);
  selectedLeave = signal<Leave | null>(null);
  currentUser = signal<User | null>(null);

  // Form data
  leaveForm = signal<LeaveCreate>({
    employee_id: '',
    leave_type: LeaveType.VACATION,
    start_date: '',
    end_date: '',
    reason: ''
  });

  rejectReason = signal('');

  // Filters
  filters = signal<LeaveFilters>({
    status: undefined,
    leave_type: undefined,
    search: ''
  });

  // Enums for template
  LeaveType = LeaveType;
  LeaveStatus = LeaveStatus;
  LEAVE_TYPE_LABELS = LEAVE_TYPE_LABELS;
  LEAVE_STATUS_LABELS = LEAVE_STATUS_LABELS;

  // Computed
  leaveTypes = computed(() => Object.values(LeaveType));
  leaveStatuses = computed(() => Object.values(LeaveStatus));

  // Statistics
  statistics = computed(() => {
    const allLeaves = this.leaves();
    return {
      total: allLeaves.length,
      pending: allLeaves.filter(l => l.status === LeaveStatus.PENDING).length,
      approved: allLeaves.filter(l => l.status === LeaveStatus.APPROVED).length,
      rejected: allLeaves.filter(l => l.status === LeaveStatus.REJECTED).length
    };
  });

  // Calculated days
  calculatedDays = computed(() => {
    const form = this.leaveForm();
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  });

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadLeaves();
    this.loadLeaveBalances();
  }

  /**
   * Load current user information
   */
  loadCurrentUser(): void {
    const user = this.authService.currentUser();
    this.currentUser.set(user);
    if (user && user.id) {
      this.leaveForm.update(form => ({
        ...form,
        employee_id: String(user.id)
      }));
    }
  }

  loadLeaves() {
    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.getLeaveRequests(this.filters()),
      (response) => {
        const items = response.items || response.data || [];
        this.leaves.set(items);
        this.applyFilters();
        this.isLoading.set(false);
      },
      (error) => {
        console.error('Error loading leaves:', error);
        this.isLoading.set(false);
      }
    );
  }

  /**
   * Load leave balances for current user
   */
  loadLeaveBalances(): void {
    const user = this.currentUser();
    if (user && user.id) {
      // ✅ Auto-unsubscribe on component destroy
      this.subscribe(
        this.leaveService.getLeaveBalance(String(user.id)),
        (balanceResponse) => {
          this.leaveBalances.set(balanceResponse.balances || []);
        },
        (error) => {
          console.error('Error loading leave balances:', error);
        }
      );
    }
  }

  /**
   * Apply filters to leaves list
   */
  applyFilters(): void {
    const filters = this.filters();
    let filtered = [...this.leaves()];

    if (filters.status) {
      filtered = filtered.filter(leave => leave.status === filters.status);
    }

    if (filters.leave_type) {
      filtered = filtered.filter(leave => leave.leave_type === filters.leave_type);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(leave =>
        leave.employee_name.toLowerCase().includes(search) ||
        leave.reason.toLowerCase().includes(search)
      );
    }

    this.filteredLeaves.set(filtered);
  }

  /**
   * Handle filter change
   */
  onFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Update search filter
   */
  updateFilterSearch(value: string): void {
    this.filters.update(f => ({ ...f, search: value }));
    this.applyFilters();
  }

  /**
   * Update status filter
   */
  updateFilterStatus(value: LeaveStatus | undefined): void {
    this.filters.update(f => ({ ...f, status: value }));
    this.applyFilters();
  }

  /**
   * Update leave type filter
   */
  updateFilterLeaveType(value: LeaveType | undefined): void {
    this.filters.update(f => ({ ...f, leave_type: value }));
    this.applyFilters();
  }

  /**
   * Update form leave type
   */
  updateFormLeaveType(value: LeaveType): void {
    this.leaveForm.update(f => ({ ...f, leave_type: value }));
  }

  /**
   * Update form start date
   */
  updateFormStartDate(value: string): void {
    this.leaveForm.update(f => ({ ...f, start_date: value }));
  }

  /**
   * Update form end date
   */
  updateFormEndDate(value: string): void {
    this.leaveForm.update(f => ({ ...f, end_date: value }));
  }

  /**
   * Update form reason
   */
  updateFormReason(value: string): void {
    this.leaveForm.update(f => ({ ...f, reason: value }));
  }

  /**
   * Update reject reason
   */
  updateRejectReason(value: string): void {
    this.rejectReason.set(value);
  }

  /**
   * Open create leave modal
   */
  openCreateModal(): void {
    this.resetForm();
    this.showModal.set(true);
  }

  /**
   * Close leave modal
   */
  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
  }

  /**
   * Close reject modal
   */
  closeRejectModal(): void {
    this.showRejectModal.set(false);
    this.rejectReason.set('');
    this.selectedLeave.set(null);
  }

  /**
   * Reset leave form
   */
  resetForm(): void {
    const user = this.currentUser();
    this.leaveForm.set({
      employee_id: user?.id ? String(user.id) : '',
      leave_type: LeaveType.VACATION,
      start_date: '',
      end_date: '',
      reason: ''
    });
  }

  /**
   * Submit leave request
   */
  submitLeave(): void {
    const form = this.leaveForm();

    if (!form.start_date || !form.end_date || !form.reason) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.createLeaveRequest(form),
      (leave) => {
        this.loadLeaves();
        this.loadLeaveBalances();
        this.closeModal();
        alert('ขอลาสำเร็จ');
      },
      (error) => {
        console.error('Error creating leave:', error);
        alert('เกิดข้อผิดพลาดในการขอลา');
        this.isLoading.set(false);
      }
    );
  }

  /**
   * Approve leave request
   */
  approveLeave(leave: Leave): void {
    if (!confirm(`ต้องการอนุมัติการลาของ ${leave.employee_name} หรือไม่?`)) {
      return;
    }

    this.isLoading.set(true);
    const user = this.currentUser();
    if (!user || !user.id) {
      alert('ไม่พบข้อมูลผู้ใช้');
      this.isLoading.set(false);
      return;
    }

    const approvalData = {
      approved_by: String(user.id),
      notes: undefined
    };

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.approveLeaveRequest(leave.leave_request_id, approvalData),
      (updatedLeave) => {
        this.loadLeaves();
        alert('อนุมัติการลาสำเร็จ');
      },
      (error) => {
        console.error('Error approving leave:', error);
        alert('เกิดข้อผิดพลาดในการอนุมัติการลา');
        this.isLoading.set(false);
      }
    );
  }

  /**
   * Open reject modal
   */
  openRejectModal(leave: Leave): void {
    this.selectedLeave.set(leave);
    this.showRejectModal.set(true);
  }

  /**
   * Submit reject leave request
   */
  submitReject(): void {
    const leave = this.selectedLeave();
    const reason = this.rejectReason();

    if (!leave || !reason) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }

    const user = this.currentUser();
    if (!user || !user.id) {
      alert('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    this.isLoading.set(true);
    const rejectionData = {
      rejected_by: String(user.id),
      rejection_reason: reason
    };

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.rejectLeaveRequest(leave.leave_request_id, rejectionData),
      (updatedLeave) => {
        this.loadLeaves();
        this.closeRejectModal();
        alert('ปฏิเสธการลาสำเร็จ');
        this.isLoading.set(false);
      },
      (error) => {
        console.error('Error rejecting leave:', error);
        alert('เกิดข้อผิดพลาดในการปฏิเสธการลา');
        this.isLoading.set(false);
      }
    );
  }

  /**
   * Delete/cancel leave request
   */
  deleteLeave(leave: Leave): void {
    if (!confirm(`ต้องการยกเลิกการลานี้หรือไม่?`)) {
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.deleteLeaveRequest(leave.leave_request_id),
      () => {
        this.loadLeaves();
        this.loadLeaveBalances();
        alert('ยกเลิกการลาสำเร็จ');
        this.isLoading.set(false);
      },
      (error) => {
        console.error('Error deleting leave:', error);
        alert('เกิดข้อผิดพลาดในการยกเลิกการลา');
        this.isLoading.set(false);
      }
    );
  }

  /**
   * Check if user can approve leave
   */
  canApprove(leave: Leave): boolean {
    // Only pending leaves can be approved
    return leave.status === LeaveStatus.PENDING;
  }

  /**
   * Check if user can edit leave
   */
  canEdit(leave: Leave): boolean {
    const user = this.currentUser();
    // User can edit their own pending leave
    if (leave.status !== LeaveStatus.PENDING) return false;
    if (!user || (!user.member_id && !user.id)) return false;
    return String(leave.employee_id) === String(user.member_id || user.id);
  }

  /**
   * Check if user can cancel leave
   */
  canCancel(leave: Leave): boolean {
    const user = this.currentUser();
    // User can cancel their own leave if it's pending or approved
    if (leave.status !== LeaveStatus.PENDING && leave.status !== LeaveStatus.APPROVED) return false;
    if (!user || (!user.member_id && !user.id)) return false;
    return String(leave.employee_id) === String(user.member_id || user.id);
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case LeaveStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  }

  /**
   * Format date string for display
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get remaining days for leave type
   */
  getRemainingDays(leaveType: LeaveType): number {
    const balance = this.leaveBalances().find(b => b.leave_type === leaveType);  // snake_case
    return balance?.remaining_days || 0;  // snake_case
  }

  /**
   * TrackBy function for leaves
   */
  trackByLeave(index: number, leave: Leave): string {
    return leave.leave_request_id || index.toString();  // snake_case
  }

  /**
   * TrackBy function for leave balances
   */
  trackByLeaveBalance(index: number, balance: LeaveBalance): string {
    return balance.leave_type || index.toString();  // snake_case
  }
}

