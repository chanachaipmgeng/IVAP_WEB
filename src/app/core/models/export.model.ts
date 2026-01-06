/**
 * Export Models
 * Models สำหรับ Export Service
 */

export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Export Request Model
 */
export interface ExportRequest {
  format: ExportFormat;
  filename?: string;
  data: any[];
  columns?: string[];
  sheetName?: string; // For Excel
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
}

/**
 * Export Response Model
 */
export interface ExportResponse {
  success: boolean;
  filename: string;
  downloadUrl?: string;
  blob?: Blob;
  size?: number;
  mimeType?: string;
  error?: string;
}

/**
 * Export Job Model (for async exports)
 */
export interface ExportJob {
  id: string;
  status: ExportStatus;
  format: ExportFormat;
  filename: string;
  progress?: number;
  createdAt: Date | string;
  completedAt?: Date | string;
  downloadUrl?: string;
  error?: string;
}

