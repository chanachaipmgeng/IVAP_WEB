import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'app-recognition-history',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, GlassCardComponent],
  templateUrl: './recognition-history.component.html',
  styleUrls: ['./recognition-history.component.scss']
})
export class RecognitionHistoryComponent implements OnInit {
  logs = signal<RecognitionLog[]>([]);
  filterType = signal<string>('All');
  searchQuery = signal<string>('');
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);

  constructor() {}

  ngOnInit() {
    // Mock data
    this.logs.set([
      {
        id: '1',
        timestamp: new Date(),
        personName: 'John Doe',
        personId: 'EMP001',
        type: 'Employee',
        confidence: 0.98,
        cameraName: 'Main Entrance Cam 1',
        location: 'Lobby',
        snapshotUrl: 'assets/images/placeholder-face.jpg',
        status: 'Verified'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        personName: 'Unknown Person',
        type: 'Unknown',
        confidence: 0.45,
        cameraName: 'Parking Cam 2',
        location: 'Basement Parking',
        snapshotUrl: 'assets/images/placeholder-face.jpg',
        status: 'Uncertain'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
        personName: 'Jane Smith',
        personId: 'VIP005',
        type: 'VIP',
        confidence: 0.99,
        cameraName: 'Executive Elevator',
        location: 'Lobby',
        snapshotUrl: 'assets/images/placeholder-face.jpg',
        status: 'Flagged'
      }
    ]);
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

