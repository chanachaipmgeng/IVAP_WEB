import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

interface AccessLog {
  id: string;
  timestamp: Date;
  personName: string;
  personId: string;
  doorName: string;
  type: 'entry' | 'exit' | 'denied';
  method: 'face' | 'card' | 'qr';
  status: 'granted' | 'denied';
}

@Component({
  selector: 'app-access-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './access-logs.component.html',
  styleUrls: ['./access-logs.component.scss']
})
export class AccessLogsComponent implements OnInit {
  logs = signal<AccessLog[]>([]);
  searchQuery = signal('');
  filterStatus = signal('all');

  constructor() {}

  ngOnInit() {
    this.logs.set([
      { id: '1', timestamp: new Date(), personName: 'John Doe', personId: 'EMP001', doorName: 'Main Entrance', type: 'entry', method: 'face', status: 'granted' },
      { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 15), personName: 'Jane Smith', personId: 'EMP002', doorName: 'Server Room', type: 'entry', method: 'card', status: 'denied' },
      { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 45), personName: 'Visitor 101', personId: 'VIS001', doorName: 'Lobby', type: 'exit', method: 'qr', status: 'granted' }
    ]);
  }

  get filteredLogs() {
    return this.logs().filter(log => {
      const matchSearch = log.personName.toLowerCase().includes(this.searchQuery().toLowerCase()) || 
                          log.doorName.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchStatus = this.filterStatus() === 'all' || log.status === this.filterStatus();
      return matchSearch && matchStatus;
    });
  }

  getStatusColor(status: string): string {
    return status === 'granted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  }

  getMethodIcon(method: string): string {
    switch(method) {
      case 'face': return 'fa-user';
      case 'card': return 'fa-id-card';
      case 'qr': return 'fa-qrcode';
      default: return 'fa-question';
    }
  }
}

