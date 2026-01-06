/**
 * QR Code Model
 * ตรงกับ QRCodeResponse ใน backend (verification_enhanced_schema.py)
 * ใช้ snake_case ตรงกับ backend
 */

export interface QRCode {
  id: string;  // id from backend (UUID)
  code: string;  // code from backend (unique QR code string)
  qr_type: QRCodeType;  // qr_type from backend (QRCodeType enum)
  owner_id: string;  // owner_id from backend (UUID)
  owner_name?: string;  // owner_name from backend (optional)
  owner_type: 'employee' | 'visitor' | 'guest' | 'event' | 'device';  // owner_type from backend
  data?: any;  // data from backend (optional, JSON)
  status: QRCodeStatus;  // status from backend (QRCodeStatus enum)
  valid_from?: string;  // valid_from from backend (optional, datetime)
  valid_until?: string;  // valid_until from backend (optional, datetime)
  scan_count: number;  // scan_count from backend (int, default=0)
  last_scanned_at?: string;  // last_scanned_at from backend (optional, datetime)
  created_at: string;  // created_at from backend (datetime)
  updated_at: string;  // updated_at from backend (datetime)
}

export enum QRCodeType {
  ACCESS = 'access',
  ATTENDANCE = 'attendance',
  EVENT = 'event',
  VISITOR = 'visitor',
  PARKING = 'parking',
  TEMPORARY = 'temporary'
}

export enum QRCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

/**
 * QR Code Create Request
 * ตรงกับ QRCodeGenerateRequest ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface CreateQRCodeDto {
  qr_type: QRCodeType;  // qr_type from backend (QRCodeType enum, REQUIRED)
  owner_id: string;  // owner_id from backend (UUID, REQUIRED)
  owner_type: string;  // owner_type from backend (REQUIRED)
  data?: any;  // data from backend (optional, JSON)
  valid_from?: string;  // valid_from from backend (optional, datetime)
  valid_until?: string;  // valid_until from backend (optional, datetime)
}

/**
 * QR Code Update Request
 * ตรงกับ QRCodeUpdate ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface UpdateQRCodeDto {
  status?: QRCodeStatus;  // status from backend (optional)
  valid_from?: string;  // valid_from from backend (optional, datetime)
  valid_until?: string;  // valid_until from backend (optional, datetime)
  data?: any;  // data from backend (optional, JSON)
}

/**
 * QR Code Scan Result
 * ตรงกับ QRCodeVerificationRequest response ใน backend
 * ใช้ snake_case ตรงกับ backend
 */
export interface QRCodeScanResult {
  success: boolean;  // success from backend
  qr_code?: QRCode;  // qr_code from backend (optional)
  message: string;  // message from backend
  timestamp: string;  // timestamp from backend
}

export const QR_CODE_TYPE_LABELS: Record<QRCodeType, string> = {
  [QRCodeType.ACCESS]: 'เข้าถึงระบบ',
  [QRCodeType.ATTENDANCE]: 'ลงเวลา',
  [QRCodeType.EVENT]: 'กิจกรรม',
  [QRCodeType.VISITOR]: 'ผู้เยี่ยม',
  [QRCodeType.PARKING]: 'ที่จอดรถ',
  [QRCodeType.TEMPORARY]: 'ชั่วคราว'
};

export const QR_CODE_STATUS_LABELS: Record<QRCodeStatus, string> = {
  [QRCodeStatus.ACTIVE]: 'ใช้งานได้',
  [QRCodeStatus.INACTIVE]: 'ไม่ใช้งาน',
  [QRCodeStatus.EXPIRED]: 'หมดอายุ',
  [QRCodeStatus.REVOKED]: 'ยกเลิก'
};
