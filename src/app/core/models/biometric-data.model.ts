/**
 * Biometric Data Interface
 * ตรงกับ BiometricDataResponse ใน backend (biometric_schema.py)
 * ใช้ snake_case ตรงกับ backend
 */
export interface BiometricData {
  id: string;  // id from backend (UUID, REQUIRED)
  member_id: string;  // member_id from backend (UUID, REQUIRED)
  biometric_type: BiometricType;  // biometric_type from backend (BiometricType enum, REQUIRED)
  biometric_value: string;  // biometric_value from backend (REQUIRED, Base64 encoded)
  is_primary: boolean;  // is_primary from backend (bool, default=False)
  metadata?: Record<string, any>;  // metadata from backend (optional, dict)
  
  // Timestamps
  created_at: string;  // created_at from backend (datetime)
  updated_at: string;  // updated_at from backend (datetime)

  // Frontend display properties (optional)
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  department?: string;
}

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  VOICE = 'voice',
  PALM = 'palm'
}

/**
 * Biometric Data Create Request
 * ตรงกับ BiometricDataCreate ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface CreateBiometricDataDto {
  member_id: string;  // member_id from backend (UUID, REQUIRED)
  biometric_type: BiometricType;  // biometric_type from backend (BiometricType enum, REQUIRED)
  biometric_value: string;  // biometric_value from backend (REQUIRED, Base64 encoded)
  is_primary?: boolean;  // is_primary from backend (optional, default=False)
  metadata?: Record<string, any>;  // metadata from backend (optional, dict)
}

/**
 * Biometric Data Update Request
 * ตรงกับ BiometricDataUpdate ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface UpdateBiometricDataDto {
  biometric_value?: string;  // biometric_value from backend (optional)
  is_primary?: boolean;  // is_primary from backend (optional)
  metadata?: Record<string, any>;  // metadata from backend (optional)
}

/**
 * Biometric Data Verify Request
 * ตรงกับ BiometricDataVerifyRequest ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface BiometricVerifyRequest {
  member_id?: string;  // member_id from backend (optional, UUID)
  biometric_type: BiometricType;  // biometric_type from backend (BiometricType enum, REQUIRED)
  biometric_value: string;  // biometric_value from backend (REQUIRED, Base64 encoded)
  device_id?: string;  // device_id from backend (optional, UUID)
}

/**
 * Biometric Data Verify Response
 * ตรงกับ BiometricDataVerifyResponse ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface BiometricVerifyResponse {
  success: boolean;  // success from backend (REQUIRED)
  message: string;  // message from backend (REQUIRED)
  member_id?: string;  // member_id from backend (optional, UUID)
  is_match?: boolean;  // is_match from backend (optional, bool)
  confidence?: number;  // confidence from backend (optional, float)
}

export interface BiometricStatistics {
  total_records: number;
  by_type: Record<BiometricType, number>;
  primary_count: number;
  last_30_days: number;
}

export interface BiometricTypesResponse {
  types: BiometricType[];
  descriptions: Record<BiometricType, string>;
}

export const BIOMETRIC_TYPE_LABELS: Record<BiometricType, string> = {
  [BiometricType.FINGERPRINT]: 'ลายนิ้วมือ',
  [BiometricType.FACE]: 'ใบหน้า',
  [BiometricType.IRIS]: 'ม่านตา',
  [BiometricType.VOICE]: 'เสียง',
  [BiometricType.PALM]: 'ลายฝ่ามือ'
};

