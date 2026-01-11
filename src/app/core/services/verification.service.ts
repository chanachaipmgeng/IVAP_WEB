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
  items: any[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationService {

  constructor(private api: ApiService) { }

  /**
   * Get verification history with pagination and filters
   * Backend: GET /api/v1/verifications/logs
   */
  public getHistory(
    page: number = 1, 
    pageSize: number = 20, 
    search: string = '', 
    status: string = 'All',
    date: string = ''
  ): Observable<VerificationHistoryResponse> {
    const params: any = {
        page,
        page_size: pageSize
    };

    if (search) params.search = search;
    if (status && status !== 'All') params.status = status;
    if (date) params.start_date = date; // Can be improved to range if needed

    return this.api.get<VerificationHistoryResponse>('/verifications/logs', params);
  }
}



