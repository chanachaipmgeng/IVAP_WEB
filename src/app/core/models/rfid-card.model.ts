export interface RFIDCard {
  id: string;
  card_number: string;
  holder_id: string;
  holder_name: string;
  holder_type: 'employee' | 'visitor' | 'guest';
  card_type: RFIDCardType;
  status: RFIDCardStatus;
  is_authorized: boolean;
  issued_at: string;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  company_id: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export enum RFIDCardType {
  EMPLOYEE = 'employee',
  VISITOR = 'visitor',
  TEMPORARY = 'temporary',
  PERMANENT = 'permanent'
}

export enum RFIDCardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  BLOCKED = 'blocked',
  LOST = 'lost',
  STOLEN = 'stolen'
}

export interface CreateRFIDCardDto {
  card_number: string;
  holder_id: string;
  holder_name: string;
  holder_type: 'employee' | 'visitor' | 'guest';
  card_type: RFIDCardType;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface UpdateRFIDCardDto {
  holder_name?: string;
  card_type?: RFIDCardType;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface RFIDVerifyRequest {
  card_number: string;
  location?: string;
}

export interface RFIDVerifyResponse {
  verified: boolean;
  card: RFIDCard;
  message: string;
  access_granted: boolean;
}

export interface RFIDStatistics {
  total_cards: number;
  active_cards: number;
  by_type: Record<RFIDCardType, number>;
  by_status: Record<RFIDCardStatus, number>;
  expired_count: number;
  last_30_days: number;
}

export const RFID_CARD_TYPE_LABELS: Record<RFIDCardType, string> = {
  [RFIDCardType.EMPLOYEE]: 'พนักงาน',
  [RFIDCardType.VISITOR]: 'ผู้เยี่ยม',
  [RFIDCardType.TEMPORARY]: 'ชั่วคราว',
  [RFIDCardType.PERMANENT]: 'ถาวร'
};

export const RFID_CARD_STATUS_LABELS: Record<RFIDCardStatus, string> = {
  [RFIDCardStatus.ACTIVE]: 'ใช้งาน',
  [RFIDCardStatus.INACTIVE]: 'ไม่ใช้งาน',
  [RFIDCardStatus.EXPIRED]: 'หมดอายุ',
  [RFIDCardStatus.BLOCKED]: 'ถูกบล็อก',
  [RFIDCardStatus.LOST]: 'หาย',
  [RFIDCardStatus.STOLEN]: 'ถูกขโมย'
};

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

