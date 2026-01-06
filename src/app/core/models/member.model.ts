/**
 * Member Models
 * 
 * Represents a member in the system (user account level)
 * Uses snake_case to match backend MemberResponse schema (member_schema.py)
 */

import { UUID, BaseTimestamps } from './base.model';
import { ActorType, MemberType, StatusType } from './enums.model';

/**
 * Member Interface
 * Core user account information
 * Matches MemberResponse schema from backend
 */
export interface Member extends BaseTimestamps {
  member_id: UUID;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  
  // Actor classification
  actor_type: ActorType;
  member_type?: MemberType;
  
  // Status flags
  is_active: boolean;
  is_verified: boolean;
  status: StatusType;
  
  // Profile
  picture?: string;
  
  // Permissions and roles
  roles: string[];
  permissions?: string[];
  user_metadata?: Record<string, any>;
  
  // Timestamps
  last_login_at?: string;
}

/**
 * Member Create Request
 * Matches MemberCreate schema from backend
 */
export interface MemberCreate {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  actor_type: ActorType;
  member_type?: MemberType;
}

/**
 * Member Update Request
 * Matches MemberUpdate schema from backend
 */
export interface MemberUpdate {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  picture?: string;
  is_active?: boolean;
  is_verified?: boolean;
  status?: StatusType;
  actor_type?: ActorType;
  member_type?: MemberType;
}

/**
 * Member Response (from API)
 * Alias for Member (already matches backend)
 */
export interface MemberResponse extends Member {
  // All fields from Member interface
}

/**
 * Member Filters
 */
export interface MemberFilters {
  search?: string;
  actor_type?: ActorType;
  member_type?: MemberType;
  is_active?: boolean;
  is_verified?: boolean;
  status?: StatusType;
}

/**
 * Member Statistics
 */
export interface MemberStatistics {
  total_members: number;
  active_members: number;
  inactive_members: number;
  verified_members: number;
  unverified_members: number;
  members_by_actor_type: Record<ActorType, number>;
  members_by_member_type: Record<MemberType, number>;
}

/**
 * Member Summary (lightweight)
 */
export interface MemberSummary {
  member_id: UUID;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  picture?: string;
  actor_type: ActorType;
  member_type?: MemberType;
  is_active: boolean;
}

/**
 * Helper function to get full name
 */
export function getMemberFullName(member: Member | MemberSummary): string {
  return `${member.first_name} ${member.last_name}`.trim();
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
  return member.actor_type === ActorType.ADMIN_SYSTEM || 
         (member.actor_type === ActorType.MEMBER && member.member_type === MemberType.ADMIN);
}

/**
 * Helper function to check if member is employee
 */
export function isMemberEmployee(member: Member): boolean {
  return member.actor_type === ActorType.MEMBER && member.member_type === MemberType.EMPLOYEE;
}

/**
 * Helper function to check if member is guest
 */
export function isMemberGuest(member: Member): boolean {
  return member.actor_type === ActorType.GUEST;
}
