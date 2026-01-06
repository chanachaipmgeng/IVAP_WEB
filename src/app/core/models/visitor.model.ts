/**
 * Visitor Management Models
 * 
 * Complete visitor models matching backend structure
 * Includes Visitor, VisitorVisit, VisitorInvitation, VisitorBadge
 */

import { UUID, BaseTimestamps } from './base.model';
import { VisitorType, VisitorStatus, VisitPurpose } from './enums.model';

/**
 * Visitor Interface
 * ตรงกับ VisitorResponse ใน backend (visitor_schema.py)
 */
export interface Visitor extends BaseTimestamps {
  // Primary identification (from VisitorResponse)
  id: UUID;  // visitor_id from backend (UUID, REQUIRED)
  companyId: UUID;  // company_id from backend (UUID, REQUIRED)
  
  // Personal information (from VisitorBase)
  firstName: string;  // first_name from backend (REQUIRED, min_length=1, max_length=100)
  lastName: string;  // last_name from backend (REQUIRED, min_length=1, max_length=100)
  email?: string;  // email from backend (optional, EmailStr)
  phone?: string;  // phone from backend (optional, max_length=20)
  idCardNumber?: string;  // id_card_number from backend (optional, max_length=20)
  
  // Company information (from VisitorBase)
  companyName?: string;  // company_name from backend (optional, max_length=200)
  position?: string;  // position from backend (optional, max_length=100)
  address?: string;  // address from backend (optional)
  
  // Visit classification (from VisitorBase)
  visitorType: VisitorType;  // visitor_type from backend (VisitorType enum, REQUIRED, default=GUEST)
  visitPurpose: VisitPurpose;  // visit_purpose from backend (VisitPurpose enum, REQUIRED, default=MEETING)
  
  // Host information (from VisitorBase)
  hostEmployeeId?: UUID;  // host_employee_id from backend (optional, UUID)
  hostName?: string;  // host_name from backend (optional, max_length=200)
  hostPhone?: string;  // host_phone from backend (optional, max_length=20)
  hostEmail?: string;  // host_email from backend (optional, EmailStr)
  
  // Schedule (from VisitorBase)
  appointmentDate?: string;  // appointment_date from backend (optional, datetime)
  expectedDurationHours?: number;  // expected_duration_hours from backend (optional, float, ge=0)
  meetingRoom?: string;  // meeting_room from backend (optional, max_length=100)
  notes?: string;  // notes from backend (optional)
  
  // Status and tracking (from VisitorResponse)
  status: VisitorStatus;  // status from backend (VisitorStatus enum, REQUIRED)
  qrCode?: string;  // qr_code from backend (optional)
  badgeNumber?: string;  // badge_number from backend (optional)
  
  // Check-in/out information (from VisitorResponse)
  checkInTime?: string;  // check_in_time from backend (optional, datetime)
  checkOutTime?: string;  // check_out_time from backend (optional, datetime)
  actualDurationMinutes?: number;  // actual_duration_minutes from backend (optional, int)
  
  // Photos (from VisitorResponse)
  photoPath?: string;  // photo_path from backend (optional)
  idCardPhotoPath?: string;  // id_card_photo_path from backend (optional)
  
  // Approval workflow (from VisitorResponse)
  approvedBy?: UUID;  // approved_by from backend (optional, UUID)
  approvedAt?: string;  // approved_at from backend (optional, datetime)
  approvalNotes?: string;  // approval_notes from backend (optional)
  
  // Security (from VisitorResponse)
  isBlacklisted: boolean;  // is_blacklisted from backend (default=False)
  blacklistReason?: string;  // blacklist_reason from backend (optional)
  securityNotes?: string;  // security_notes from backend (optional)
}

/**
 * Visitor Create Request
 */
export interface VisitorCreate {
  companyId: UUID;  // REQUIRED
  
  // Personal info
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idCardNumber?: string;
  
  // Company info
  companyName?: string;
  position?: string;
  address?: string;
  
  // Visit info
  visitorType: VisitorType;
  visitPurpose: VisitPurpose;
  hostEmployeeId?: UUID;
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  
  // Schedule
  appointmentDate?: string;
  expectedDurationHours?: number;
  meetingRoom?: string;
  notes?: string;
}

/**
 * Visitor Update Request
 */
export interface VisitorUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  idCardNumber?: string;
  companyName?: string;
  position?: string;
  address?: string;
  visitorType?: VisitorType;
  visitPurpose?: VisitPurpose;
  hostEmployeeId?: UUID;
  hostName?: string;
  hostPhone?: string;
  hostEmail?: string;
  appointmentDate?: string;
  expectedDurationHours?: number;
  meetingRoom?: string;
  notes?: string;
  status?: VisitorStatus;
  approvalNotes?: string;
  securityNotes?: string;
}

/**
 * Visitor Check-in Request
 */
export interface VisitorCheckIn {
  checkInTime?: string;
  location?: string;
  photoPath?: string;
  deviceId?: string;
  notes?: string;
}

/**
 * Visitor Check-out Request
 */
export interface VisitorCheckOut {
  checkOutTime?: string;
  location?: string;
  deviceId?: string;
  notes?: string;
}

/**
 * Visitor Approval Request
 */
export interface VisitorApproval {
  approved: boolean;
  approvalNotes?: string;
}

/**
 * Visitor Blacklist Request
 */
export interface VisitorBlacklist {
  blacklisted: boolean;
  reason?: string;
}

/**
 * Visitor Visit
 * Individual visit record (can have multiple visits per visitor)
 */
export interface VisitorVisit extends BaseTimestamps {
  id: UUID;  // visit_id
  visitorId: UUID;
  companyId: UUID;
  
  // Schedule
  visitDate: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  
  // Host info
  hostEmployeeId?: UUID;
  hostName?: string;
  hostPhone?: string;
  
  // Visit details
  visitorType: VisitorType;
  visitPurpose: VisitPurpose;
  meetingRoom?: string;
  notes?: string;
  
  // Status and tracking
  status: VisitorStatus;
  qrCode?: string;
  badgeNumber?: string;
  
  // Check-in/out
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: string;
  checkOutLocation?: string;
  checkInDeviceId?: string;
  checkOutDeviceId?: string;
  checkInPhotoPath?: string;
  checkOutPhotoPath?: string;
  
  // Approval
  approvedBy?: UUID;
  approvedAt?: string;
  approvalNotes?: string;
  
  // Security
  securityNotes?: string;
  violationNotes?: string;
}

/**
 * Visitor Invitation
 */
export interface VisitorInvitation extends BaseTimestamps {
  id: UUID;  // invitation_id
  companyId: UUID;
  
  invitationCode: string;
  invitationType: string;
  invitationStatus: string;
  
  // Inviter info
  invitedBy: UUID;
  invitedByName: string;
  invitedByEmail?: string;
  
  // Guest info
  guestEmail?: string;
  guestPhone?: string;
  guestName?: string;
  
  // Visit details
  visitDate: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
  meetingRoom?: string;
  visitPurpose: VisitPurpose;
  notes?: string;
  
  // Tracking
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  usedAt?: string;
  expiresAt?: string;
}

/**
 * Visitor Badge
 */
export interface VisitorBadge extends BaseTimestamps {
  id: UUID;  // badge_id
  companyId: UUID;
  
  badgeNumber: string;
  badgeType: string;
  badgeStatus: string;
  
  // Assignment
  issuedToVisitorId?: UUID;
  issuedToVisitId?: UUID;
  issuedBy: UUID;
  issuedAt: string;
  
  // Return
  returnedAt?: string;
  returnedBy?: UUID;
  returnNotes?: string;
  
  expiresAt?: string;
}

/**
 * Visitor Filters
 */
export interface VisitorFilters {
  search?: string;
  companyId?: UUID;
  status?: VisitorStatus;
  visitorType?: VisitorType;
  visitPurpose?: VisitPurpose;
  hostEmployeeId?: UUID;
  isBlacklisted?: boolean;
  appointmentFrom?: string;
  appointmentTo?: string;
  checkInFrom?: string;
  checkInTo?: string;
}

/**
 * Visitor Statistics
 */
export interface VisitorStats {
  totalVisitors: number;
  pendingVisitors: number;
  approvedVisitors: number;
  checkedInVisitors: number;
  checkedOutVisitors: number;
  cancelledVisitors: number;
  expiredVisitors: number;
  blacklistedVisitors: number;
  todayVisitors: number;
  thisWeekVisitors: number;
  thisMonthVisitors: number;
  
  // By type
  visitorsByType: Record<VisitorType, number>;
  visitorsByPurpose: Record<VisitPurpose, number>;
  
  // Average metrics
  averageVisitDuration?: number;
  averageWaitTime?: number;
}

/**
 * Visitor Summary (lightweight)
 */
export interface VisitorSummary {
  id: UUID;
  fullName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  visitorType: VisitorType;
  visitPurpose: VisitPurpose;
  status: VisitorStatus;
  appointmentDate?: string;
  checkInTime?: string;
}

// ==================== Helper Functions ====================

/**
 * Get visitor full name
 */
export function getVisitorFullName(visitor: Visitor | VisitorSummary): string {
  if ('fullName' in visitor) {
    return visitor.fullName;
  }
  return `${visitor.firstName} ${visitor.lastName}`.trim();
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
  if (!visitor.checkInTime || !visitor.checkOutTime) {
    return null;
  }
  const checkIn = new Date(visitor.checkInTime);
  const checkOut = new Date(visitor.checkOutTime);
  return Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
}

/**
 * Check if visitor is late
 */
export function isVisitorLate(visitor: Visitor): boolean {
  if (!visitor.appointmentDate || !visitor.checkInTime) {
    return false;
  }
  const appointment = new Date(visitor.appointmentDate);
  const checkIn = new Date(visitor.checkInTime);
  return checkIn > appointment;
}
