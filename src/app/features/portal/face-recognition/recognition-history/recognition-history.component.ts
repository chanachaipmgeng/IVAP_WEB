import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationService } from '../../../../core/services/verification.service';
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
    this.loadHistory();
  }
  
  ngOnDestroy() {
    // No subscription to unsubscribe for now as we removed interval
  }
  
  loadHistory() {
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
  
  manualRefresh() {
    this.loadHistory();
  }

  private mapToLog(req: any): RecognitionLog {
    // Backend now returns enriched flat structure
    const isSuccess = req.status === 'success';
    const confidence = req.confidence || 0;
    
    // Determine type and status
    let type: 'Employee' | 'Visitor' | 'VIP' | 'Unknown' = 'Unknown';
    let status: 'Verified' | 'Flagged' | 'Uncertain' = 'Uncertain';
    
    if (isSuccess && req.user_id) {
        type = 'Employee'; 
        status = 'Verified';
    } else if (req.status === 'failed') {
        type = 'Unknown';
        status = 'Uncertain';
    }
    
    // Extract metadata safely
    // Note: Backend returns 'metadata' key in to_dict() for VerificationLog, but might return 'metadata_info' if raw model used.
    // The JSON provided shows "metadata".
    const metadata = req.metadata || req.metadata_info || {};
    const deviceId = req.device_id || 'Unknown Device';
    
    // Construct name
    let displayName = 'Unknown Person';
    if (req.user_name && req.user_name !== 'Unknown') {
        displayName = req.user_name;
    } else if (req.user_id) {
        displayName = `ID: ${req.user_id.substring(0, 8)}...`;
    }

    // Location display
    let locationDisplay = deviceId;
    if (req.department && req.department !== '-') {
        locationDisplay += ` (${req.department})`;
    }
    
    // Validate timestamp
    let timestamp = new Date();
    if (req.created_at) {
        const parsedDate = new Date(req.created_at);
        if (!isNaN(parsedDate.getTime())) {
            timestamp = parsedDate;
        }
    }
    
    let snapshotUrl = 'assets/images/placeholder-face.jpg';
    if (req.snapshot_path) {
        // Handle backend relative paths
        const path = req.snapshot_path;
        if (path.startsWith('http')) {
            snapshotUrl = path;
        } else if (path.startsWith('/')) {
            snapshotUrl = `http://localhost:8000${path}`;
        } else {
            snapshotUrl = `http://localhost:8000/${path}`;
        }
    }

    return {
      id: req.request_id,
      timestamp: timestamp,
      personName: displayName,
      personId: req.employee_id || req.user_id,
      type: type,
      confidence: confidence,
      cameraName: deviceId, // Use device_id as camera name
      location: locationDisplay,
      snapshotUrl: snapshotUrl,
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

