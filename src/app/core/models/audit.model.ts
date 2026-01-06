export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
}

export interface AuditFilters {
  search: string;
  userName: string;
  action: string;
  severity: string;
  status: string;
  fromDate: string;
  toDate: string;
}

export interface AuditStatistics {
  totalLogs: number;
  successLogs: number;
  failureLogs: number;
  criticalLogs: number;
}
