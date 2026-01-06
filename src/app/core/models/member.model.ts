/**
 * Member Models
 * 
 * Represents a member in the system (user account level)
 * Matches backend Member model
 */

import { UUID, BaseTimestamps } from './base.model';
import { ActorType, MemberType, StatusType } from './enums.model';

/**
 * Member Interface
 * Core user account information
 */
export interface Member extends BaseTimestamps {
  memberId: UUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  
  // Actor classification
  actorType: ActorType;
  memberType?: MemberType;
  
  // Status flags
  isActive: boolean;
  isVerified: boolean;
  status: StatusType;
  
  // Profile
  picture?: string;
  
  // Permissions and roles
  roles: string[];
  permissions: string[];
  userMetadata?: Record<string, any>;
  
  // Timestamps
  lastLoginAt?: string;
}

/**
 * Member Create Request
 */
export interface MemberCreate {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  actorType: ActorType;
  memberType?: MemberType;
}

/**
 * Member Update Request
 */
export interface MemberUpdate {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  picture?: string;
  isActive?: boolean;
}

/**
 * Member Response (from API)
 */
export interface MemberResponse extends Member {
  // All fields from Member interface
}

/**
 * Member Filters
 */
export interface MemberFilters {
  search?: string;
  actorType?: ActorType;
  memberType?: MemberType;
  isActive?: boolean;
  isVerified?: boolean;
  status?: StatusType;
}

/**
 * Member Statistics
 */
export interface MemberStatistics {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  verifiedMembers: number;
  unverifiedMembers: number;
  membersByActorType: Record<ActorType, number>;
  membersByMemberType: Record<MemberType, number>;
}

/**
 * Member Summary (lightweight)
 */
export interface MemberSummary {
  memberId: UUID;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  actorType: ActorType;
  memberType?: MemberType;
  isActive: boolean;
}

/**
 * Helper function to get full name
 */
export function getMemberFullName(member: Member | MemberSummary): string {
  return `${member.firstName} ${member.lastName}`.trim();
}

/**
 * Helper function to get display name with username
 */
export function getMemberDisplayName(member: Member | MemberSummary): string {
  const fullName = getMemberFullName(member);
  return fullName || member.username;
}

/**
 * Helper function to check if member is admin
 */
export function isMemberAdmin(member: Member): boolean {
  return member.actorType === ActorType.ADMIN_SYSTEM || 
         (member.actorType === ActorType.MEMBER && member.memberType === MemberType.ADMIN);
}

/**
 * Helper function to check if member is employee
 */
export function isMemberEmployee(member: Member): boolean {
  return member.actorType === ActorType.MEMBER && member.memberType === MemberType.EMPLOYEE;
}

/**
 * Helper function to check if member is guest
 */
export function isMemberGuest(member: Member): boolean {
  return member.actorType === ActorType.GUEST;
}

