/**
 * Standardized API Response Handler
 * 
 * Handles different response structures from backend
 * and provides consistent transformation
 */

import { toCamelCase } from './field-transformer';

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
 * Transforms response to camelCase and extracts data
 */
export function handleApiResponse<T>(response: any): T {
  // Transform to camelCase first
  const transformed = toCamelCase(response);
  
  // Handle different response structures
  if (transformed.data !== undefined) {
    return transformed.data as T;
  }
  
  if (transformed.items !== undefined) {
    return transformed.items as T;
  }
  
  // If response is already the data itself
  return transformed as T;
}

/**
 * Handle paginated API response
 * Transforms response to camelCase and normalizes structure
 */
export function handlePaginatedResponse<T>(response: any): PaginatedApiResponse<T> {
  // Transform to camelCase first
  const transformed = toCamelCase(response);
  
  // Handle different pagination structures
  if (transformed.data && Array.isArray(transformed.data)) {
    return {
      total: transformed.total || transformed.data.length,
      data: transformed.data,
      page: transformed.page,
      size: transformed.size
    };
  }
  
  if (transformed.items && Array.isArray(transformed.items)) {
    return {
      total: transformed.total || transformed.items.length,
      data: transformed.items,
      page: transformed.page,
      size: transformed.size
    };
  }
  
  // If response is already an array
  if (Array.isArray(transformed)) {
    return {
      total: transformed.length,
      data: transformed
    };
  }
  
  // If response has a nested structure
  if (transformed.results && Array.isArray(transformed.results)) {
    return {
      total: transformed.count || transformed.total || transformed.results.length,
      data: transformed.results,
      page: transformed.page,
      size: transformed.size
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
