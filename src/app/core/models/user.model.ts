import { Member } from './member.model';

/**
 * User Interface
 * 
 * Frontend-specific interface that extends Member with additional fields
 * needed for UI and backward compatibility.
 * 
 * **Usage Guidelines:**
 * - Use `Member` for API calls (directly matches backend schema)
 * - Use `User` for frontend state, UI components, and backward compatibility
 * - All fields from `Member` are inherited automatically
 * 
 * **Additional Fields:**
 * - `id`, `memberId`: Backward compatibility aliases for `member_id`
 * - `companyId`, `company_id`, `companyName`: Company info from JWT token or join data
 * - `fullName`: Computed display name (convenience field)
 * - `password`: Form data only (not sent to backend)
 */
export interface User extends Member {
  // Backward compatibility - aliases for member_id
  id?: string;  // UUID as string (alias for member_id, for backward compatibility)
  memberId?: string;  // UUID as string (camelCase alias, for backward compatibility)
  
  // Company information (from JWT token or join data, not in Member schema)
  companyId?: string | number;  // Can be string (UUID) or number
  company_id?: string;  // snake_case version (from backend/JWT)
  companyName?: string;  // Optional company name (for display)
  
  // UI convenience fields
  fullName?: string;  // Computed full name (for display) - `${first_name} ${last_name}`
  
  // Form data (not from backend, not sent to backend)
  password?: string;  // Optional for form data (password input fields)
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  company_id?: string;  // snake_case to match backend
  companyId?: string;  // camelCase for backward compatibility
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
}
