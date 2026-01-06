/**
 * API Endpoint Constants
 * 
 * Centralized definition of all API endpoints
 * to avoid hardcoded strings and ensure consistency
 */

/**
 * Build endpoint with path parameters
 */
type EndpointBuilder = (...args: string[]) => string;

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // ==================== Authentication ====================
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',  // Changed from '/users/me' - endpoint was duplicate and removed
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // ==================== Admin ====================
  ADMIN: {
    MEMBERS: '/admin/members',
    MEMBER_BY_ID: (id: string) => `/admin/members/${id}`,
    MEMBER_STATUS: (id: string) => `/admin/members/${id}/status`,

    COMPANIES: '/companies',
    COMPANY_BY_ID: (id: string) => `/companies/${id}`,
    COMPANY_STATS: '/admin/company-stats',

    ROLES: '/roles/roles',
    ROLE_BY_ID: (id: string) => `/roles/roles/${id}`,
    PERMISSIONS: '/roles/permissions',
    PERMISSION_BY_ID: (id: string) => `/roles/permissions/${id}`,

    SYSTEM_STATS: '/admin/system-stats',
    SYSTEM_HEALTH: '/admin/system-health',
    PERFORMANCE_METRICS: '/admin/performance-metrics',
    ACTIVITIES: '/admin/activities'
  },

  // ==================== Visitors ====================
  VISITORS: {
    LIST: (companyId: string) => `/visitors/company/${companyId}`,
    BY_ID: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}`,
    CREATE: (companyId: string) => `/visitors/company/${companyId}`,
    UPDATE: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}`,
    DELETE: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}`,
    CHECK_IN: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}/check-in`,
    CHECK_OUT: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}/check-out`,
    APPROVE: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}/approve`,
    BLACKLIST: (companyId: string, visitorId: string) => `/visitors/company/${companyId}/${visitorId}/blacklist`,
    STATS: (companyId: string) => `/visitors/company/${companyId}/statistics`,
    EXPORT: (companyId: string) => `/visitors/company/${companyId}/export`,

    // Extended visitor features
    VISITS: (visitorId: string) => `/visitors/${visitorId}/visits`,
    INVITATIONS: '/visitor-invitations',
    INVITATION_BY_ID: (id: string) => `/visitor-invitations/${id}`,
    INVITATION_SEND: (id: string) => `/visitor-invitations/${id}/send`,
    BADGES: '/visitor-badges',
    BADGE_BY_ID: (id: string) => `/visitor-badges/${id}`,
    BADGE_RETURN: (id: string) => `/visitor-badges/${id}/return`
  },

  // ==================== Employees ====================
  EMPLOYEES: {
    LIST: '/employees',
    BY_ID: (id: string) => `/employees/${id}`,
    CREATE: '/employees',
    UPDATE: (id: string) => `/employees/${id}`,
    DELETE: (id: string) => `/employees/${id}`,
    SUBORDINATES: (id: string) => `/employees/${id}/subordinates`
  },

  // ==================== Vehicles ====================
  VEHICLES: {
    LIST: (companyId: string) => `/vehicles/company/${companyId}`,
    BY_ID: (companyId: string, vehicleId: string) => `/vehicles/company/${companyId}/${vehicleId}`,
    CREATE: (companyId: string) => `/vehicles/company/${companyId}`,
    UPDATE: (companyId: string, vehicleId: string) => `/vehicles/company/${companyId}/${vehicleId}`,
    CHECK_IN: (companyId: string, vehicleId: string) => `/vehicles/company/${companyId}/${vehicleId}/check-in`,
    CHECK_OUT: (companyId: string, vehicleId: string) => `/vehicles/company/${companyId}/${vehicleId}/check-out`,
    PARKING_SPOTS: (companyId: string) => `/vehicles/company/${companyId}/parking-spots`
  },

  // ==================== Parking ====================
  PARKING: {
    VEHICLES: '/parking/vehicles',
    VEHICLE_BY_ID: (id: string) => `/parking/vehicles/${id}`,
    SPACES: '/parking/spaces',
    SPACE_BY_ID: (id: string) => `/parking/spaces/${id}`,
    ENTRY: '/parking/entry',
    EXIT: '/parking/exit',
    EVENTS: '/parking/events',
    RESERVATIONS: '/parking/reservations',
    STATISTICS: '/parking/statistics'
  },

  // ==================== RFID Cards ====================
  RFID: {
    LIST: '/rfid-cards',
    BY_ID: (id: string) => `/rfid-cards/${id}`,
    BY_NUMBER: (number: string) => `/rfid-cards/number/${number}`,
    CREATE: '/rfid-cards',
    UPDATE: (id: string) => `/rfid-cards/${id}`,
    VERIFY: '/rfid-cards/verify',
    STATISTICS: '/rfid-cards/statistics',
    TYPES: '/rfid-cards/types',
    STATUS: (id: string) => `/rfid-cards/${id}/status`,
    AUTHORIZATION: (id: string) => `/rfid-cards/${id}/authorization`,
    IMPORT: '/rfid-cards/import'
  },

  // ==================== QR Codes ====================
  QR_CODES: {
    LIST: '/qr-codes',
    BY_ID: (id: string) => `/qr-codes/${id}`,
    BY_DATA: (data: string) => `/qr-codes/data/${data}`,
    CREATE: '/qr-codes',
    UPDATE: (id: string) => `/qr-codes/${id}`,
    VERIFY: '/qr-codes/verify',
    STATISTICS: '/qr-codes/statistics',
    TYPES: '/qr-codes/types',
    STATUS: (id: string) => `/qr-codes/${id}/status`,
    AUTHORIZATION: (id: string) => `/qr-codes/${id}/authorization`,
    IMPORT: '/qr-codes/import'
  },

  // ==================== Timestamps ====================
  TIMESTAMPS: {
    LIST: (companyId: string) => `/employee-timestamps/company/${companyId}`,
    BY_ID: (companyId: string, timestampId: string) => `/employee-timestamps/company/${companyId}/${timestampId}`,
    CREATE: (companyId: string) => `/employee-timestamps/company/${companyId}`,
    UPDATE: (companyId: string, timestampId: string) => `/employee-timestamps/company/${companyId}/${timestampId}`,
    APPROVE: (companyId: string, timestampId: string) => `/employee-timestamps/company/${companyId}/${timestampId}/approve`,
    REJECT: (companyId: string, timestampId: string) => `/employee-timestamps/company/${companyId}/${timestampId}/reject`
  },

  // ==================== Reports ====================
  REPORTS: {
    ATTENDANCE: '/reports/attendance',
    VISITORS: '/reports/visitors',
    VEHICLES: '/reports/vehicles',
    EXPORT: (type: string) => `/reports/${type}/export`
  },

  // ==================== System ====================
  SYSTEM: {
    HEALTH: '/health',
    METRICS: '/metrics',
    PERFORMANCE: '/metrics/performance',
    DATABASE: '/metrics/database',
    API: '/metrics/api',
    LOGS: '/admin/system/logs',
    SETTINGS: '/admin/settings',
    INFO: '/admin/system/info',
    CLEAR_CACHE: '/admin/system/clear-cache',
    RESTART: '/admin/system/restart',
    MAINTENANCE: '/admin/system/maintenance'
  }
} as const;
