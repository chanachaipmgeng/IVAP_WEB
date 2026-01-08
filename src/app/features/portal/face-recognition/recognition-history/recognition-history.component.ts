import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationService, VerificationStatusResponse } from '../../../../core/services/verification.service';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

interface RecognitionLog {
  id: string;
  timestamp: Date;
  personName: string;
  personId?: string;
  type: 'Employee' | 'Visitor' | 'VIP' | 'Unknown';
  confidence: number;
  cameraName: string;
  location: string;
  snapshotUrl: string;
  status: 'Verified' | 'Flagged' | 'Uncertain';
}

import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'app-recognition-history',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, GlassCardComponent],
  templateUrl: './recognition-history.component.html',
  styleUrls: ['./recognition-history.component.scss']
})
export class RecognitionHistoryComponent implements OnInit, OnDestroy {
  logs = signal<RecognitionLog[]>([]);
  filterType = signal<string>('All');
  searchQuery = signal<string>('');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  
  private refreshSubscription?: Subscription;
  isLoading = signal<boolean>(false);

  constructor(private verificationService: VerificationService) {}

  ngOnInit() {
    this.startAutoRefresh();
  }
  
  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  startAutoRefresh() {
    // Refresh every 5 seconds
    this.refreshSubscription = interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        this.isLoading.set(true);
        return this.verificationService.getHistory(50);
      })
    ).subscribe({
      next: (response) => {
        const mappedLogs = response.requests.map(req => this.mapToLog(req));
        this.logs.set(mappedLogs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.isLoading.set(false);
      }
    });
  }
  
  manualRefresh() {
    this.isLoading.set(true);
    this.verificationService.getHistory(50).subscribe({
      next: (response) => {
        const mappedLogs = response.requests.map(req => this.mapToLog(req));
        this.logs.set(mappedLogs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.isLoading.set(false);
      }
    });
  }

  private mapToLog(req: VerificationStatusResponse): RecognitionLog {
    const result = req.result;
    const isSuccess = req.status === 'success';
    const confidence = result?.confidence || 0;
    
    // Determine type and status based on confidence and success
    let type: 'Employee' | 'Visitor' | 'VIP' | 'Unknown' = 'Unknown';
    let status: 'Verified' | 'Flagged' | 'Uncertain' = 'Uncertain';
    
    if (isSuccess && result?.user_id) {
        type = 'Employee'; // Default to Employee for now, ideally backend tells us
        status = 'Verified';
    } else if (req.status === 'failed') {
        type = 'Unknown';
        status = 'Uncertain';
    }
    
    // Extract metadata safely
    const metadata = result?.metadata || {};
    const location = metadata.location ? 'Detected Zone' : 'Unknown Location';
    
    return {
      id: req.request_id,
      timestamp: new Date(req.created_at),
      personName: result?.user_data?.name || result?.user_id || (isSuccess ? 'Identified Person' : 'Unknown Person'),
      personId: result?.user_id,
      type: type,
      confidence: confidence,
      cameraName: req.result?.metadata?.device_id || 'Unknown Camera',
      location: location,
      snapshotUrl: 'assets/images/placeholder-face.jpg', // TODO: Use real snapshot URL if available
      status: status
    };
  }

  get filteredLogs() {
    return this.logs().filter(log => {
      const matchesType = this.filterType() === 'All' || log.type === this.filterType();
      const matchesSearch = log.personName.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                            log.location.toLowerCase().includes(this.searchQuery().toLowerCase());
      return matchesType && matchesSearch;
    });
  }

  getConfidenceColor(score: number): string {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Flagged': return 'bg-red-100 text-red-800';
      case 'Uncertain': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}

