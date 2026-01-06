import { Member } from './member.model';

/**
 * User Interface
 * 
 * Extends Member interface with additional compatibility fields
 * to support both snake_case (from backend) and camelCase (frontend convention)
 * 
 * This interface is used throughout the application for user/member data
 * and provides backward compatibility with existing code.
 */
export interface User extends Omit<Member, 'memberId'> {
  // Primary identifiers - support both formats
  id?: string;  // UUID as string (alias for member_id, for backward compatibility)
  member_id?: string;  // UUID as string (snake_case from backend)
  memberId: string;  // UUID as string (camelCase, required from Member)
  
  // Basic information (from Member, with snake_case compatibility)
  first_name?: string;  // snake_case version (from backend)
  last_name?: string;  // snake_case version (from backend)
  phone_number?: string;  // snake_case version (from backend)
  
  // Type and status (from Member, with snake_case compatibility)
  actor_type?: string;  // snake_case version (from backend)
  member_type?: string;  // snake_case version (from backend)
  
  // Account status (from Member, with snake_case compatibility)
  is_verified?: boolean;  // snake_case version (from backend)
  is_active?: boolean;  // snake_case version (from backend)
  
  // Company information (additional fields not in Member)
  companyId?: string | number;  // Can be string (UUID) or number
  company_id?: string;  // snake_case version (from backend)
  companyName?: string;  // Optional (not in backend schema)
  
  // Metadata (from Member, with snake_case compatibility)
  user_metadata?: Record<string, any>;  // snake_case version (from backend)
  
  // Timestamps (from Member via BaseTimestamps, with snake_case compatibility)
  created_at?: string;  // snake_case version (from backend)
  updated_at?: string;  // snake_case version (from backend)
  last_login_at?: string;  // snake_case version (from backend)
  
  // Form data (not from backend)
  password?: string;  // Optional for form data
  fullName?: string;  // Computed full name (for display)
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserFilters {
  search: string;
  role: string;
  status: string;
  companyId: string;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
}
