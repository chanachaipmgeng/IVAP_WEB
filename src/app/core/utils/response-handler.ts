/**
 * Standardized API Response Handler
 * 
 * Handles different response structures from backend
 * and provides consistent transformation
 */

// Removed toCamelCase import as we want to preserve snake_case
// import { toCamelCase } from './field-transformer';

/**
 * Standard API Response Structure
 */
export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated API Response Structure
 */
export interface PaginatedApiResponse<T> {
  total: number;
  data: T[];
  page?: number;
  size?: number;
  items?: T[]; // Alternative field name
}

/**
 * Handle standard API response
 * Extracts data without transforming field names
 */
export function handleApiResponse<T>(response: any): T {
  // Return response as-is (snake_case)
  // Check common response structures
  
  if (response.data !== undefined) {
    return response.data as T;
  }
  
  if (response.items !== undefined) {
    return response.items as T;
  }
  
  // If response is already the data itself
  return response as T;
}

/**
 * Handle paginated API response
 * Normalizes structure without transforming field names
 */
export function handlePaginatedResponse<T>(response: any): PaginatedApiResponse<T> {
  // Use response as-is (snake_case)
  
  // Handle different pagination structures
  if (response.data && Array.isArray(response.data)) {
    return {
      total: response.total || response.data.length,
      data: response.data,
      page: response.page,
      size: response.size
    };
  }
  
  if (response.items && Array.isArray(response.items)) {
    return {
      total: response.total || response.items.length,
      data: response.items,
      page: response.page,
      size: response.size
    };
  }
  
  // If response is already an array
  if (Array.isArray(response)) {
    return {
      total: response.length,
      data: response
    };
  }
  
  // If response has a nested structure (e.g. Django/DRF style)
  if (response.results && Array.isArray(response.results)) {
    return {
      total: response.count || response.total || response.results.length,
      data: response.results,
      page: response.page,
      size: response.size
    };
  }
  
  throw new Error('Invalid paginated response structure');
}

/**
 * Check if response is a paginated response
 */
export function isPaginatedResponse(response: any): boolean {
  return (
    (response.total !== undefined && (response.data !== undefined || response.items !== undefined)) ||
    (response.count !== undefined && response.results !== undefined) ||
    Array.isArray(response)
  );
}

/**
 * Extract error message from response
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.error?.message) {
    return error.error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.detail) {
    return error.detail;
  }
  
  if (error?.error) {
    return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }
  
  return 'An unknown error occurred';
}
