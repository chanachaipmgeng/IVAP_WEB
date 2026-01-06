/**
 * Biometric Data Interface
 * ตรงกับ BiometricDataResponse ใน backend (biometric_schema.py)
 */
export interface BiometricData {
  id: string;  // id from backend (UUID, REQUIRED)
  memberId: string;  // member_id from backend (UUID, REQUIRED)
  biometricType: BiometricType;  // biometric_type from backend (BiometricType enum, REQUIRED)
  biometricValue: string;  // biometric_value from backend (REQUIRED, Base64 encoded)
  isPrimary: boolean;  // is_primary from backend (bool, default=False)
  metadata?: Record<string, any>;  // metadata from backend (optional, dict)
  
  // Timestamps
  createdAt: string;  // created_at from backend (datetime)
  updatedAt: string;  // updated_at from backend (datetime)
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
 */
export interface CreateBiometricDataDto {
  memberId: string;  // member_id from backend (UUID, REQUIRED)
  biometricType: BiometricType;  // biometric_type from backend (BiometricType enum, REQUIRED)
  biometricValue: string;  // biometric_value from backend (REQUIRED, Base64 encoded)
  isPrimary?: boolean;  // is_primary from backend (optional, default=False)
  metadata?: Record<string, any>;  // metadata from backend (optional, dict)
}

/**
 * Biometric Data Update Request
 * ตรงกับ BiometricDataUpdate ใน backend
 */
export interface UpdateBiometricDataDto {
  biometricValue?: string;  // biometric_value from backend (optional)
  isPrimary?: boolean;  // is_primary from backend (optional)
  metadata?: Record<string, any>;  // metadata from backend (optional)
}

/**
 * Biometric Data Verify Request
 * ตรงกับ BiometricDataVerifyRequest ใน backend
 */
export interface BiometricVerifyRequest {
  memberId?: string;  // member_id from backend (optional, UUID)
  biometricType: BiometricType;  // biometric_type from backend (BiometricType enum, REQUIRED)
  biometricValue: string;  // biometric_value from backend (REQUIRED, Base64 encoded)
  deviceId?: string;  // device_id from backend (optional, UUID)
}

/**
 * Biometric Data Verify Response
 * ตรงกับ BiometricDataVerifyResponse ใน backend
 */
export interface BiometricVerifyResponse {
  success: boolean;  // success from backend (REQUIRED)
  message: string;  // message from backend (REQUIRED)
  memberId?: string;  // member_id from backend (optional, UUID)
  isMatch?: boolean;  // is_match from backend (optional, bool)
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

