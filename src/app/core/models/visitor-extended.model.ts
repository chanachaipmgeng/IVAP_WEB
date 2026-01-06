/**
 * Visitor Extended Models
 * 
 * Additional visitor models for advanced features:
 * - VisitorVisit (individual visit records)
 * - VisitorInvitation (invitation system)
 * - VisitorBadge (badge management)
 */

import { UUID, BaseTimestamps } from './base.model';
import { VisitorType, VisitorStatus, VisitPurpose } from './enums.model';

// ==================== Visitor Visit ====================

export interface VisitorVisit extends BaseTimestamps {
  visitId: UUID;
  visitorId: UUID;
  companyId: UUID;
  
  // Schedule
  visitDate: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  
  // Host
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
  checkInDeviceId?: UUID;
  checkOutDeviceId?: UUID;
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

export interface VisitorVisitCreate {
  visitorId: UUID;
  visitDate: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
  
  hostEmployeeId?: UUID;
  hostName?: string;
  hostPhone?: string;
  
  visitorType: VisitorType;
  visitPurpose: VisitPurpose;
  meetingRoom?: string;
  notes?: string;
}

// ==================== Visitor Invitation ====================

export interface VisitorInvitation extends BaseTimestamps {
  invitationId: UUID;
  companyId: UUID;
  
  invitationCode: string;
  invitationType: string;
  invitationStatus: string;
  
  // Inviter
  invitedBy: UUID;
  invitedByName: string;
  invitedByEmail?: string;
  
  // Guest
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

export interface VisitorInvitationCreate {
  invitationType?: string;
  
  guestEmail?: string;
  guestPhone?: string;
  guestName?: string;
  
  visitDate: string;
  expectedStartTime?: string;
  expectedEndTime?: string;
  meetingRoom?: string;
  visitPurpose: VisitPurpose;
  notes?: string;
  
  expiresAt?: string;
}

export interface VisitorInvitationVerify {
  invitationCode: string;
  companyId: UUID;
}

// ==================== Visitor Badge ====================

export interface VisitorBadge extends BaseTimestamps {
  badgeId: UUID;
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

export interface VisitorBadgeIssue {
  badgeNumber: string;
  badgeType?: string;
  visitorId?: UUID;
  visitId?: UUID;
  expiresAt?: string;
}

export interface VisitorBadgeReturn {
  returnNotes?: string;
}

// ==================== Exports ====================

export type {
  VisitorVisit as VisitorVisitModel,
  VisitorInvitation as VisitorInvitationModel,
  VisitorBadge as VisitorBadgeModel
};

