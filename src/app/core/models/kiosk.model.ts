// Kiosk Models
export type KioskState = 'idle' | 'scanning' | 'success' | 'error';

export interface KioskDevice {
  id: string;
  device_name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  active_event_id?: string;
  api_key?: string;
  settings: DeviceSettings;
}

export interface DeviceSettings {
  auto_verify_interval: number;  // milliseconds
  quality_threshold: number;     // 0-100
  enable_sound: boolean;
  display_language: string;      // 'en', 'th'
  welcome_message: string;
  success_message: string;
  error_message: string;
  scanning_message: string;
}

export interface DeviceHealthStatus {
  device_id: string;
  status: 'online' | 'offline' | 'error';
  last_heartbeat: string;
  cpu_usage?: number;
  memory_usage?: number;
  camera_status?: 'working' | 'error';
}

export interface VerificationResult {
  success: boolean;
  message: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    department: string;
    photo?: string;
  };
  timestamp: string;
  quality_score: number;
  details?: string;
  checkInTime?: string;  // ISO format: yyyy-mm-dd hh:mm:ss
  checkOutTime?: string;  // ISO format: yyyy-mm-dd hh:mm:ss
  durationMinutes?: string;  // Format: "HH:MM"
  gender?: string;  // 'male' or 'female'
  ageRange?: string;  // '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80+'
}

export interface OfflineCheckIn {
  id: string;
  deviceId: string;
  employeeId?: string;
  timestamp: string;
  success: boolean;
  error?: string;
  data: any;
}
