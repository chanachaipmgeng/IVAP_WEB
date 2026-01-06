export interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  createdAt: string;
  description: string;
  filePath: string;
  checksum: string;
}

export interface RestoreJob {
  id: string;
  backupId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string;
  progress: number;
}

export interface BackupForm {
  name: string;
  type: 'full' | 'incremental' | 'differential';
  description: string;
  includeFiles: boolean;
  compress: boolean;
}

export interface RestoreForm {
  backupId: string;
  type: 'full' | 'partial' | 'schema_only' | 'data_only';
  targetDb: string;
}

export interface ScheduleForm {
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
}

export interface BackupStatistics {
  totalBackups: number;
  completedBackups: number;
  inProgressBackups: number;
  totalSize: string;
}
