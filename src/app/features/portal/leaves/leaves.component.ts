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
import { LeaveService } from '../../../core/services/leave.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import {
  Leave,
  LeaveType,
  LeaveStatus,
  LeaveBalance,
  CreateLeaveDto,
  LeaveFilters,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS
} from '../../../core/models/leave.model';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { BaseComponent } from '../../../core/base/base.component';

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
  leaveForm = signal<CreateLeaveDto>({
    employeeId: '',
    leaveType: LeaveType.VACATION,
    startDate: '',
    endDate: '',
    reason: ''
  });

  rejectReason = signal('');

  // Filters
  filters = signal<LeaveFilters>({
    status: undefined,
    leaveType: undefined,
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
    if (form.startDate && form.endDate) {
      return this.leaveService.calculateDays(form.startDate, form.endDate);
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
        employeeId: String(user.id)
      }));
    }
  }

  loadLeaves() {
    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.getLeaves(this.filters()),
      (leaves) => {
        // Ensure all leaves have id and days properties
        const mappedLeaves = leaves.map(leave => ({
          ...leave,
          // Ensure id is always present (for track by)
          id: leave.id || leave.leaveRequestId,
          // Ensure days is always present
          days: leave.days ?? leave.daysRequested ?? leave.daysRequested ?? 0
        }));
        this.leaves.set(mappedLeaves as Leave[]);
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
        (balances) => {
          this.leaveBalances.set(balances);
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

    if (filters.leaveType) {
      filtered = filtered.filter(leave => leave.leaveType === filters.leaveType);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(leave =>
        leave.employeeName.toLowerCase().includes(search) ||
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
    this.filters.update(f => ({ ...f, leaveType: value }));
    this.applyFilters();
  }

  /**
   * Update form leave type
   */
  updateFormLeaveType(value: LeaveType): void {
    this.leaveForm.update(f => ({ ...f, leaveType: value }));
  }

  /**
   * Update form start date
   */
  updateFormStartDate(value: string): void {
    this.leaveForm.update(f => ({ ...f, startDate: value }));
  }

  /**
   * Update form end date
   */
  updateFormEndDate(value: string): void {
    this.leaveForm.update(f => ({ ...f, endDate: value }));
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
      employeeId: user?.id ? String(user.id) : '',
      leaveType: LeaveType.VACATION,
      startDate: '',
      endDate: '',
      reason: ''
    });
  }

  /**
   * Submit leave request
   */
  submitLeave(): void {
    const form = this.leaveForm();

    if (!form.startDate || !form.endDate || !form.reason) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.createLeave(form),
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
    if (!confirm(`ต้องการอนุมัติการลาของ ${leave.employeeName} หรือไม่?`)) {
      return;
    }

    this.isLoading.set(true);
    const leaveId = leave.id || leave.leaveRequestId;
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.approveLeave(leaveId),
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

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.rejectLeave(leave.leaveRequestId, reason),
      (updatedLeave) => {
        this.loadLeaves();
        this.closeRejectModal();
        alert('ปฏิเสธการลาสำเร็จ');
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

    const user = this.currentUser();
    if (!user || !user.id) {
      alert('ไม่พบข้อมูลผู้ใช้');
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.leaveService.deleteLeave(leave.leaveRequestId, String(user.id)),
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
    const user = this.currentUser();
    return user && user.id ? this.leaveService.canApproveLeave(leave, String(user.id)) : false;
  }

  /**
   * Check if user can edit leave
   */
  canEdit(leave: Leave): boolean {
    const user = this.currentUser();
    return user && user.id ? this.leaveService.canEditLeave(leave, String(user.id)) : false;
  }

  /**
   * Check if user can cancel leave
   */
  canCancel(leave: Leave): boolean {
    const user = this.currentUser();
    return user && user.id ? this.leaveService.canCancelLeave(leave, String(user.id)) : false;
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
    const balance = this.leaveBalances().find(b => b.leaveType === leaveType);
    return balance?.remainingDays || 0;
  }

  /**
   * TrackBy function for leaves
   */
  trackByLeave(index: number, leave: Leave): string {
    return leave.id || leave.leaveRequestId || index.toString();
  }

  /**
   * TrackBy function for leave balances
   */
  trackByLeaveBalance(index: number, balance: LeaveBalance): string {
    return balance.leaveType || index.toString();
  }
}

