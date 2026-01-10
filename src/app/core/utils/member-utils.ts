/**
 * Member Utility Functions
 *
 * Helper functions for converting between Member (snake_case) and User (camelCase)
 * and other member-related utilities
 */

import { Member, MemberSummary } from '../models/member.model';
import { User } from '../models/user.model';

/**
 * Convert Member (snake_case) to User (camelCase) for backward compatibility
 */
export function memberToUser(member: Member): User {
  return {
    memberId: member.member_id,
    id: member.member_id,
    member_id: member.member_id,
    username: member.username,
    email: member.email,
    firstName: member.first_name,
    lastName: member.last_name,
    first_name: member.first_name,
    last_name: member.last_name,
    phoneNumber: member.phone_number,
    phone_number: member.phone_number,
    actorType: member.actor_type,
    actor_type: member.actor_type,
    memberType: member.member_type,
    member_type: member.member_type,
    isActive: member.is_active,
    is_active: member.is_active,
    isVerified: member.is_verified,
    is_verified: member.is_verified,
    status: member.status,
    picture: member.picture,
    roles: member.roles,
    permissions: member.permissions,
    userMetadata: member.user_metadata,
    user_metadata: member.user_metadata,
    createdAt: member.created_at,
    created_at: member.created_at,
    updatedAt: member.updated_at,
    updated_at: member.updated_at,
    lastLoginAt: member.last_login_at,
    last_login_at: member.last_login_at,
    fullName: `${member.first_name} ${member.last_name}`.trim(),

    // Additional compatibility fields
    companyId: member.user_metadata?.['company_id'] || member.user_metadata?.['companyId'],
    company_id: member.user_metadata?.['company_id'],
    companyName: member.user_metadata?.['company_name'] || member.user_metadata?.['companyName'],
    company_name: member.user_metadata?.['company_name'], // Add snake_case support
  } as User;
}

/**
 * Convert User (camelCase) to Member (snake_case)
 */
export function userToMember(user: User): Member {
  return {
    member_id: user.memberId || user.member_id || user.id || '',
    username: user.username,
    email: user.email,
    first_name: (user as any).firstName || user.first_name || '',
    last_name: (user as any).lastName || user.last_name || '',
    phone_number: (user as any).phoneNumber || user.phone_number,
    actor_type: ((user as any).actorType || user.actor_type) as any,
    member_type: ((user as any).memberType || user.member_type) as any,
    is_active: (user as any).isActive !== undefined ? (user as any).isActive : (user.is_active !== undefined ? user.is_active : true),
    is_verified: (user as any).isVerified !== undefined ? (user as any).isVerified : (user.is_verified !== undefined ? user.is_verified : false),
    status: user.status as any,
    picture: user.picture,
    roles: user.roles || [],
    permissions: user.permissions || [],
    user_metadata: (user as any).userMetadata || user.user_metadata,
    created_at: (user as any).createdAt || user.created_at || new Date().toISOString(),
    updated_at: (user as any).updatedAt || user.updated_at || new Date().toISOString(),
    last_login_at: (user as any).lastLoginAt || user.last_login_at
  } as Member;
}

/**
 * Convert array of Members to Users
 */
export function membersToUsers(members: Member[]): User[] {
  return members.map(memberToUser);
}

/**
 * Convert array of Users to Members
 */
export function usersToMembers(users: User[]): Member[] {
  return users.map(userToMember);
}

/**
 * Get member full name
 */
export function getMemberFullName(member: Member | MemberSummary): string {
  return `${member.first_name} ${member.last_name}`.trim();
}

/**
 * Get member display name (with username fallback)
 */
export function getMemberDisplayName(member: Member | MemberSummary): string {
  const fullName = getMemberFullName(member);
  return fullName || member.username;
}

