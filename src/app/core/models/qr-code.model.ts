export interface QRCode {
  id: string;
  code: string;
  type: QRCodeType;
  ownerId: string;
  ownerName: string;
  ownerType: 'employee' | 'visitor' | 'guest' | 'event' | 'device';
  data: any;
  status: QRCodeStatus;
  validFrom?: string;
  validUntil?: string;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface CreateQRCodeDto {
  type: QRCodeType;
  ownerId: string;
  ownerType: string;
  data?: any;
  validFrom?: string;
  validUntil?: string;
}

export interface QRCodeScanResult {
  success: boolean;
  qrCode: QRCode;
  message: string;
  timestamp: string;
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

