/**
 * Leave Request Interface
 * ตรงกับ LeaveRequestResponse ใน backend (leave_schema.py)
 * 
 * Backend fields (snake_case):
 * - leave_request_id (primary key)
 * - employee_id
 * - leave_type
 * - start_date
 * - end_date
 * - days_requested
 * - reason
 * - contact_during_leave
 * - attachment_url
 * - status
 * - approved_by
 * - approved_by_name
 * - approved_at
 * - rejection_reason
 * - employee_name
 * - employee_department
 * - created_at
 * - updated_at
 */
export interface Leave {
  // Primary identifier - mapped from leave_request_id
  leaveRequestId: string;  // leave_request_id from backend (REQUIRED)
  id: string;  // REQUIRED: Alias for leaveRequestId for template compatibility (track by, etc.)
  
  // Employee information
  employeeId: string;  // employee_id from backend (REQUIRED)
  employeeName: string;  // employee_name from backend (REQUIRED)
  employeeDepartment?: string;  // employee_department from backend (optional)
  
  // Leave details (from LeaveRequestBase)
  leaveType: LeaveType;  // leave_type from backend (LeaveType enum, REQUIRED)
  startDate: string;  // start_date from backend (date, REQUIRED)
  endDate: string;  // end_date from backend (date, REQUIRED)
  reason: string;  // reason from backend (REQUIRED, min_length=10, max_length=500)
  contactDuringLeave?: string;  // contact_during_leave from backend (optional)
  attachmentUrl?: string;  // attachment_url from backend (optional)
  
  // Status and approval (from LeaveRequestResponse)
  status: LeaveStatus;  // status from backend (LeaveStatus enum, REQUIRED)
  daysRequested: number;  // days_requested from backend (float, REQUIRED)
  days: number;  // REQUIRED: Alias for daysRequested for template compatibility
  approvedBy?: string;  // approved_by from backend (optional, ID of approver)
  approverName?: string;  // approved_by_name from backend (optional)
  approvedAt?: string;  // approved_at from backend (optional, datetime)
  rejectionReason?: string;  // rejection_reason from backend (optional)
  
  // Timestamps
  createdAt: string;  // created_at from backend (datetime, REQUIRED)
  updatedAt?: string;  // updated_at from backend (optional, datetime)
}

/**
 * Leave Type Enum
 * ตรงกับ LeaveType ใน backend (leave_schema.py)
 */
export enum LeaveType {
  SICK = 'sick',
  VACATION = 'vacation',
  PERSONAL = 'personal',
  EMERGENCY = 'emergency',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  BEREAVEMENT = 'bereavement',
  UNPAID = 'unpaid'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

/**
 * Leave Balance Interface
 * ตรงกับ LeaveBalance ใน backend (leave_schema.py)
 */
export interface LeaveBalance {
  employeeId: string;  // employee_id from backend (REQUIRED)
  leaveType: LeaveType;  // leave_type from backend (LeaveType enum, REQUIRED)
  totalDays: number;  // total_days from backend (float, REQUIRED)
  usedDays: number;  // used_days from backend (float, REQUIRED)
  pendingDays: number;  // pending_days from backend (float, REQUIRED)
  remainingDays: number;  // remaining_days from backend (float, REQUIRED)
}

/**
 * Leave Balance Response Interface
 * ตรงกับ LeaveBalanceResponse ใน backend
 */
export interface LeaveBalanceResponse {
  employeeId: string;  // employee_id from backend
  employeeName: string;  // employee_name from backend
  balances: LeaveBalance[];  // balances from backend
  totalRemaining: number;  // total_remaining from backend (float)
}

export interface CreateLeaveDto {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface UpdateLeaveDto {
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface LeaveFilters {
  employeeId?: string;
  leaveType?: LeaveType;
  status?: LeaveStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.SICK]: 'ลาป่วย',
  [LeaveType.VACATION]: 'ลาพักร้อน',
  [LeaveType.PERSONAL]: 'ลากิจ',
  [LeaveType.EMERGENCY]: 'ลาฉุกเฉิน',
  [LeaveType.MATERNITY]: 'ลาคลอด',
  [LeaveType.PATERNITY]: 'ลาบวช',
  [LeaveType.BEREAVEMENT]: 'ลาไปงานศพ',
  [LeaveType.UNPAID]: 'ลาไม่รับค่าจ้าง'
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'รออนุมัติ',
  [LeaveStatus.APPROVED]: 'อนุมัติ',
  [LeaveStatus.REJECTED]: 'ปฏิเสธ',
  [LeaveStatus.CANCELLED]: 'ยกเลิก'
};

