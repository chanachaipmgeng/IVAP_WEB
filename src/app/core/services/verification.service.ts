import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface VerificationResult {
  request_id: string;
  status: string;
  confidence?: number;
  user_id?: string;
  user_data?: any;
  metadata?: any;
  error_message?: string;
  timestamp: string;
}

export interface VerificationStatusResponse {
  request_id: string;
  status: string;
  created_at: string;
  processed_at?: string;
  result?: VerificationResult;
}

export interface VerificationHistoryResponse {
  requests: VerificationStatusResponse[];
  total: number;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  constructor(private api: ApiService) { }

  /**
   * Get verification history
   * Backend: GET /api/v1/verification/history
   */
  public getHistory(limit: number = 100): Observable<VerificationHistoryResponse> {
    return this.api.get<VerificationHistoryResponse>(`/verifications/history?limit=${limit}`);
  }
}



