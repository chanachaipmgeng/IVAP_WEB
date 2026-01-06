/**
 * Visitor Management Models
 * 
 * Uses snake_case to match backend VisitorResponse schema (visitor_schema.py)
 */

import { UUID, BaseTimestamps } from './base.model';
import { VisitorType, VisitorStatus, VisitPurpose } from './enums.model';

/**
 * Visitor Interface
 * Matches VisitorResponse schema from backend
 */
export interface Visitor extends BaseTimestamps {
  // Primary identification
  visitor_id: UUID;
  company_id: UUID;
  
  // Personal information (from VisitorBase)
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_card_number?: string;
  
  // Company information (from VisitorBase)
  company_name?: string;
  position?: string;
  address?: string;
  
  // Visit classification (from VisitorBase)
  visitor_type: VisitorType;
  visit_purpose: VisitPurpose;
  
  // Host information (from VisitorBase)
  host_employee_id?: UUID;
  host_name?: string;
  host_phone?: string;
  host_email?: string;
  
  // Schedule (from VisitorBase)
  appointment_date?: string;
  expected_duration_hours?: number;
  meeting_room?: string;
  notes?: string;
  
  // Status and tracking (from VisitorResponse)
  status: VisitorStatus;
  qr_code?: string;
  badge_number?: string;
  
  // Check-in/out information (from VisitorResponse)
  check_in_time?: string;
  check_out_time?: string;
  actual_duration_minutes?: number;
  
  // Photos (from VisitorResponse)
  photo_path?: string;
  id_card_photo_path?: string;
  
  // Approval workflow (from VisitorResponse)
  approved_by?: UUID;
  approved_at?: string;
  approval_notes?: string;
  
  // Security (from VisitorResponse)
  is_blacklisted: boolean;
  blacklist_reason?: string;
  security_notes?: string;
}

/**
 * Visitor Create Request
 * Matches VisitorCreate schema from backend
 */
export interface VisitorCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  id_card_number?: string;
  company_name?: string;
  position?: string;
  address?: string;
  visitor_type: VisitorType;
  visit_purpose: VisitPurpose;
  host_employee_id?: UUID;
  host_name?: string;
  host_phone?: string;
  host_email?: string;
  appointment_date?: string;
  expected_duration_hours?: number;
  meeting_room?: string;
  notes?: string;
}

/**
 * Visitor Update Request
 * Matches VisitorUpdate schema from backend
 */
export interface VisitorUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  id_card_number?: string;
  company_name?: string;
  position?: string;
  address?: string;
  visitor_type?: VisitorType;
  visit_purpose?: VisitPurpose;
  host_employee_id?: UUID;
  host_name?: string;
  host_phone?: string;
  host_email?: string;
  appointment_date?: string;
  expected_duration_hours?: number;
  meeting_room?: string;
  notes?: string;
}

/**
 * Visitor Check-in Request
 * Matches VisitorCheckIn schema from backend
 */
export interface VisitorCheckIn {
  check_in_time?: string;
  location?: string;
  notes?: string;
}

/**
 * Visitor Check-out Request
 * Matches VisitorCheckOut schema from backend
 */
export interface VisitorCheckOut {
  check_out_time?: string;
  notes?: string;
}

/**
 * Visitor Approval Request
 * Matches VisitorApprove schema from backend
 */
export interface VisitorApproval {
  approval_notes?: string;
}

/**
 * Visitor Blacklist Request
 * Matches VisitorBlacklist schema from backend
 */
export interface VisitorBlacklist {
  blacklist_reason: string;
  security_notes?: string;
}

/**
 * Visitor Visit
 * Matches VisitorVisitResponse schema from backend
 */
export interface VisitorVisit extends BaseTimestamps {
  visit_id: UUID;
  visitor_id: UUID;
  company_id: UUID;
  
  // Schedule
  visit_date: string;
  expected_start_time?: string;
  expected_end_time?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  
  // Host info
  host_employee_id?: UUID;
  host_name?: string;
  host_phone?: string;
  
  // Visit details
  visitor_type: VisitorType;
  visit_purpose: VisitPurpose;
  meeting_room?: string;
  notes?: string;
  
  // Status and tracking
  status: VisitorStatus;
  qr_code?: string;
  badge_number?: string;
  
  // Check-in/out
  check_in_time?: string;
  check_out_time?: string;
  check_in_location?: string;
  check_out_location?: string;
  
  // Approval
  approved_by?: UUID;
  approved_at?: string;
  approval_notes?: string;
}

/**
 * Visitor Visit Create Request
 * Matches VisitorVisitCreate schema from backend
 */
export interface VisitorVisitCreate {
  visitor_id: UUID;
  visit_date: string;
  expected_start_time?: string;
  expected_end_time?: string;
  host_employee_id?: UUID;
  host_name?: string;
  host_phone?: string;
  visitor_type: VisitorType;
  visit_purpose: VisitPurpose;
  meeting_room?: string;
  notes?: string;
}

/**
 * Visitor Invitation
 * Matches VisitorInvitationResponse schema from backend
 */
export interface VisitorInvitation extends BaseTimestamps {
  invitation_id: UUID;
  company_id: UUID;
  invitation_code: string;
  invitation_type: string;
  invitation_status: string;
  
  // Inviter info
  invited_by: UUID;
  invited_by_name: string;
  invited_by_email?: string;
  
  // Guest info
  guest_email?: string;
  guest_phone?: string;
  guest_name?: string;
  
  // Visit details
  visit_date: string;
  expected_start_time?: string;
  expected_end_time?: string;
  meeting_room?: string;
  visit_purpose: VisitPurpose;
  notes?: string;
  
  // Tracking
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  used_at?: string;
  expires_at?: string;
}

/**
 * Visitor Invitation Create Request
 * Matches VisitorInvitationCreate schema from backend
 */
export interface VisitorInvitationCreate {
  invitation_type?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_name?: string;
  visit_date: string;
  expected_start_time?: string;
  expected_end_time?: string;
  meeting_room?: string;
  visit_purpose: VisitPurpose;
  notes?: string;
  expires_at?: string;
}

/**
 * Visitor Badge
 * Matches VisitorBadgeResponse schema from backend
 */
export interface VisitorBadge extends BaseTimestamps {
  badge_id: UUID;
  company_id: UUID;
  badge_number: string;
  badge_type: string;
  badge_status: string;
  
  // Assignment
  issued_to_visitor_id?: UUID;
  issued_to_visit_id?: UUID;
  issued_by: UUID;
  issued_at: string;
  
  // Return
  returned_at?: string;
  returned_by?: UUID;
  return_notes?: string;
  
  expires_at?: string;
}

/**
 * Visitor Badge Issue Request
 * Matches VisitorBadgeIssue schema from backend
 */
export interface VisitorBadgeIssue {
  badge_number: string;
  badge_type?: string;
  visitor_id?: UUID;
  visit_id?: UUID;
  expires_at?: string;
}

/**
 * Visitor Badge Return Request
 * Matches VisitorBadgeReturn schema from backend
 */
export interface VisitorBadgeReturn {
  return_notes?: string;
}

/**
 * Visitor Filters
 */
export interface VisitorFilters {
  search?: string;
  company_id?: UUID;
  status?: VisitorStatus;
  visitor_type?: VisitorType;
  visit_purpose?: VisitPurpose;
  host_employee_id?: UUID;
  is_blacklisted?: boolean;
  appointment_from?: string;
  appointment_to?: string;
  check_in_from?: string;
  check_in_to?: string;
}

/**
 * Visitor Statistics
 */
export interface VisitorStatistics {
  total_visitors: number;
  pending_visitors: number;
  approved_visitors: number;
  checked_in_visitors: number;
  checked_out_visitors: number;
  cancelled_visitors: number;
  expired_visitors: number;
  blacklisted_visitors: number;
  today_visitors: number;
  this_week_visitors: number;
  this_month_visitors: number;
  
  // By type
  visitors_by_type: Record<VisitorType, number>;
  visitors_by_purpose: Record<VisitPurpose, number>;
  
  // Average metrics
  average_visit_duration?: number;
  average_wait_time?: number;
}

/**
 * Visitor Summary (lightweight)
 */
export interface VisitorSummary {
  visitor_id: UUID;
  full_name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  visitor_type: VisitorType;
  visit_purpose: VisitPurpose;
  status: VisitorStatus;
  appointment_date?: string;
  check_in_time?: string;
}

// ==================== Helper Functions ====================

/**
 * Get visitor full name
 */
export function getVisitorFullName(visitor: Visitor | VisitorSummary): string {
  if ('full_name' in visitor) {
    return visitor.full_name;
  }
  return `${visitor.first_name} ${visitor.last_name}`.trim();
}

/**
 * Check if visitor is currently on premises
 */
export function isVisitorOnPremises(visitor: Visitor): boolean {
  return visitor.status === VisitorStatus.CHECKED_IN;
}

/**
 * Check if visitor needs approval
 */
export function needsApproval(visitor: Visitor): boolean {
  return visitor.status === VisitorStatus.PENDING;
}

/**
 * Get visit duration in minutes
 */
export function getVisitDuration(visitor: Visitor): number | null {
  if (!visitor.check_in_time || !visitor.check_out_time) {
    return null;
  }
  const checkIn = new Date(visitor.check_in_time);
  const checkOut = new Date(visitor.check_out_time);
  return Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
}

/**
 * Check if visitor is late
 */
export function isVisitorLate(visitor: Visitor): boolean {
  if (!visitor.appointment_date || !visitor.check_in_time) {
    return false;
  }
  const appointment = new Date(visitor.appointment_date);
  const checkIn = new Date(visitor.check_in_time);
  return checkIn > appointment;
}
