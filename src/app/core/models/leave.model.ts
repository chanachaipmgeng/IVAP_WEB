/**
 * Leave Models
 * 
 * Uses snake_case to match backend LeaveRequestResponse schema (leave_schema.py)
 */

import { UUID } from './base.model';

/**
 * Leave Type Enum
 * Matches LeaveType enum from backend
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

/**
 * Leave Status Enum
 * Matches LeaveStatus enum from backend
 */
export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

/**
 * Leave Request Interface
 * Matches LeaveRequestResponse schema from backend
 */
export interface Leave {
  leave_request_id: string;
  employee_id: string;
  employee_name: string;
  employee_department?: string;
  leave_type: LeaveType;
  start_date: string; // date format: "YYYY-MM-DD"
  end_date: string; // date format: "YYYY-MM-DD"
  days_requested: number;
  reason: string;
  contact_during_leave?: string;
  attachment_url?: string;
  status: LeaveStatus;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string; // datetime ISO string
  rejection_reason?: string;
  created_at: string; // datetime ISO string
  updated_at?: string; // datetime ISO string
}

/**
 * Leave Create Request
 * Matches LeaveRequestCreate schema from backend
 */
export interface LeaveCreate {
  employee_id: string;
  leave_type: LeaveType;
  start_date: string; // date format: "YYYY-MM-DD"
  end_date: string; // date format: "YYYY-MM-DD"
  reason: string;
  contact_during_leave?: string;
  attachment_url?: string;
}

/**
 * Leave Update Request
 * Matches LeaveRequestUpdate schema from backend
 */
export interface LeaveUpdate {
  leave_type?: LeaveType;
  start_date?: string; // date format: "YYYY-MM-DD"
  end_date?: string; // date format: "YYYY-MM-DD"
  reason?: string;
  contact_during_leave?: string;
  attachment_url?: string;
}

/**
 * Leave Approval Request
 * Matches LeaveRequestApproval schema from backend
 */
export interface LeaveApproval {
  approved_by: string;
  notes?: string;
}

/**
 * Leave Rejection Request
 * Matches LeaveRequestRejection schema from backend
 */
export interface LeaveRejection {
  rejected_by: string;
  rejection_reason: string;
}

/**
 * Leave Balance
 * Matches LeaveBalance schema from backend
 */
export interface LeaveBalance {
  employee_id: string;
  leave_type: LeaveType;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

/**
 * Leave Balance Response
 * Matches LeaveBalanceResponse schema from backend
 */
export interface LeaveBalanceResponse {
  employee_id: string;
  employee_name: string;
  balances: LeaveBalance[];
  total_remaining: number;
}

/**
 * Leave Statistics
 * Matches LeaveStatistics schema from backend
 */
export interface LeaveStatistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  total_days_requested: number;
  total_days_approved: number;
  by_type: Record<string, number>;
  by_month: Record<string, number>;
}

/**
 * Leave Filters
 */
export interface LeaveFilters {
  employee_id?: string;
  leave_type?: LeaveType;
  status?: LeaveStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  size?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Thai labels for Leave Types
 */
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

/**
 * Thai labels for Leave Status
 */
export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'รออนุมัติ',
  [LeaveStatus.APPROVED]: 'อนุมัติ',
  [LeaveStatus.REJECTED]: 'ปฏิเสธ',
  [LeaveStatus.CANCELLED]: 'ยกเลิก'
};
