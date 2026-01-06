/**
 * Field Name Transformation Utilities
 * 
 * Converts between snake_case (backend) and camelCase (frontend)
 * to maintain consistency between Python/FastAPI and TypeScript/Angular
 */

/**
 * Transform snake_case to camelCase
 * Example: first_name -> firstName, company_id -> companyId
 */
export function toCamelCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const camelObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        camelObj[camelKey] = toCamelCase(obj[key]);
      }
    }
    return camelObj;
  }
  
  return obj;
}

/**
 * Transform camelCase to snake_case
 * Example: firstName -> first_name, companyId -> company_id
 */
export function toSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }
  
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const snakeObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        snakeObj[snakeKey] = toSnakeCase(obj[key]);
      }
    }
    return snakeObj;
  }
  
  return obj;
}

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Transform specific field names that have special mappings
 * This can be extended for custom field mappings
 */
export function transformFieldName(fieldName: string, direction: 'toCamel' | 'toSnake'): string {
  // Custom field mappings
  const customMappings: Record<string, { camel: string; snake: string }> = {
    // ID fields
    'id': { camel: 'id', snake: 'id' },
    'visitor_id': { camel: 'id', snake: 'visitor_id' },
    'company_id': { camel: 'companyId', snake: 'company_id' },
    'employee_id': { camel: 'employeeId', snake: 'employee_id' },
    'user_id': { camel: 'userId', snake: 'user_id' },
    
    // Timestamp fields
    'created_at': { camel: 'createdAt', snake: 'created_at' },
    'updated_at': { camel: 'updatedAt', snake: 'updated_at' },
    'check_in_time': { camel: 'checkInTime', snake: 'check_in_time' },
    'check_out_time': { camel: 'checkOutTime', snake: 'check_out_time' },
    
    // Name fields
    'first_name': { camel: 'firstName', snake: 'first_name' },
    'last_name': { camel: 'lastName', snake: 'last_name' },
    'company_name': { camel: 'companyName', snake: 'company_name' },
    'host_name': { camel: 'hostName', snake: 'host_name' },
    
    // Status fields
    'is_active': { camel: 'isActive', snake: 'is_active' },
    'is_blacklisted': { camel: 'isBlacklisted', snake: 'is_blacklisted' },
    'is_verified': { camel: 'isVerified', snake: 'is_verified' },
  };
  
  // Check for custom mapping first
  for (const [key, mapping] of Object.entries(customMappings)) {
    if (direction === 'toCamel' && key === fieldName) {
      return mapping.camel;
    }
    if (direction === 'toSnake' && mapping.camel === fieldName) {
      return mapping.snake;
    }
  }
  
  // Fall back to standard transformation
  return direction === 'toCamel' ? snakeToCamel(fieldName) : camelToSnake(fieldName);
}
