import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VerificationService } from '../../../../core/services/verification.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { MatIconModule } from '@angular/material/icon';

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
  status: 'Allowed' | 'Denied' | 'Unknown';
}

import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'app-recognition-history',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, GlassCardComponent, MatIconModule],
  templateUrl: './recognition-history.component.html',
  styleUrls: ['./recognition-history.component.scss']
})
export class RecognitionHistoryComponent implements OnInit, OnDestroy {
  logs = signal<RecognitionLog[]>([]);
  filterType = signal<string>('All');
  searchQuery = signal<string>('');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  isLoading = signal<boolean>(false);

  // Pagination State
  currentPage = signal<number>(1);
  pageSize = signal<number>(20);
  totalItems = signal<number>(0);
  totalPages = signal<number>(1);

  constructor(private verificationService: VerificationService) {
    // Debounce search input
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.onFilterChange();
    });
  }

  ngOnInit() {
    this.loadHistory();
  }

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  loadHistory() {
    this.isLoading.set(true);
    this.verificationService.getHistory(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.filterType(),
        this.selectedDate()
    ).subscribe({
      next: (response) => {
        const mappedLogs = response.items.map(req => this.mapToLog(req));
        this.logs.set(mappedLogs);
        this.totalItems.set(response.total);
        this.totalPages.set(response.total_pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadHistory();
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
        this.currentPage.set(newPage);
        this.loadHistory();
    }
  }

  manualRefresh() {
    this.loadHistory();
  }

  private mapToLog(req: any): RecognitionLog {
    // Backend now returns enriched flat structure
    const isSuccess = req.status === 'success' || req.status === 'Allowed'; // Adjust based on API
    const confidence = req.confidence || 0;

    // Determine type and status
    let type: 'Employee' | 'Visitor' | 'VIP' | 'Unknown' = 'Unknown';
    let status: 'Allowed' | 'Denied' | 'Unknown' = 'Unknown';

    if (req.user_id) {
        type = 'Employee';
        status = 'Allowed';
    } else {
        type = 'Unknown';
        status = 'Unknown'; // or Denied depending on logic
    }
    
    // Override if explicit status from API
    if (req.status === 'success' || req.status === 'allowed') status = 'Allowed';
    if (req.status === 'failed' || req.status === 'denied') status = 'Denied';


    // Extract metadata safely
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
        const path = req.snapshot_path;
        if (path.startsWith('http')) {
            snapshotUrl = path;
        } else if (path.startsWith('/')) {
            snapshotUrl = `${environment.baseUrl}${path}`;
        } else {
            snapshotUrl = `${environment.baseUrl}/${path}`;
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

  // Helper for template
  protected Math = Math;

  get filteredLogs() {
    return this.logs();
  }

  getConfidenceColor(score: number): string {
    if (score >= 0.9) return 'text-emerald-600';
    if (score >= 0.7) return 'text-amber-600';
    return 'text-rose-600';
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Allowed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Denied': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Unknown': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}

