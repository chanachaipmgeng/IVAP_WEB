import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

interface OTRequest {
  id: string;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-overtime-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './overtime-requests.component.html',
  styleUrls: ['./overtime-requests.component.scss']
})
export class OvertimeRequestsComponent implements OnInit {
  requests = signal<OTRequest[]>([]);
  showModal = signal(false);
  
  constructor() {}

  ngOnInit() {
    this.requests.set([
      { id: '1', employeeName: 'John Doe', date: new Date(), startTime: '18:00', endTime: '20:00', reason: 'Urgent Project', status: 'pending' },
      { id: '2', employeeName: 'Jane Smith', date: new Date(), startTime: '17:30', endTime: '19:30', reason: 'Client Meeting', status: 'approved' }
    ]);
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    this.requests.update(list => list.map(r => r.id === id ? { ...r, status } : r));
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  }
}

