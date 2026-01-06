/**
 * Base Models and Types
 *
 * Contains fundamental types and utilities used across all models
 */

/**
 * UUID Type
 * Represents a Universally Unique Identifier (RFC 4122)
 * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export type UUID = string;

/**
 * Validates if a string is a valid UUID (v4 format)
 * @param str - String to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Validates UUID and throws error if invalid
 * @param str - String to validate
 * @param fieldName - Name of the field for error message
 * @throws Error if invalid UUID
 */
export function validateUUID(str: string, fieldName: string = 'UUID'): void {
  if (!isValidUUID(str)) {
    throw new Error(`Invalid UUID format for ${fieldName}: ${str}`);
  }
}

/**
 * Validates array of UUIDs
 * @param arr - Array of strings to validate
 * @returns true if all are valid UUIDs, false otherwise
 */
export function areValidUUIDs(arr: string[]): boolean {
  if (!Array.isArray(arr)) {
    return false;
  }
  return arr.every(isValidUUID);
}

/**
 * Generates a random UUID v4
 * Note: This is a simple implementation. For production, consider using a library like 'uuid'
 */
export function generateUUID(): UUID {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Base Timestamps Interface
 * Common timestamp fields for all models
 */
export interface BaseTimestamps {
  createdAt: string;
  updatedAt: string;
}

/**
 * Base Model Interface
 * Common fields for all models
 */
export interface BaseModel extends BaseTimestamps {
  id: UUID;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Search/Filter Parameters
 */
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}
