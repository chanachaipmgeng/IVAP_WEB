/**
 * Video Analytics Component
 *
 * Component for managing video analytics tasks including face recognition, intrusion detection, and crowd counting.
 * Supports task creation, management, and monitoring of analytics processes.
 *
 * @example
 * ```html
 * <app-video-analytics></app-video-analytics>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';

/**
 * Analytics task interface
 */
interface AnalyticsTask {
  id: number;
  name: string;
  type: string;
  cameraId: number;
  cameraName: string;
  status: 'active' | 'paused' | 'stopped';
  createdAt: string;
}

@Component({
  selector: 'app-video-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './video-analytics.component.html',
  styleUrl: './video-analytics.component.scss'
})
export class VideoAnalyticsComponent implements OnInit {
  tasks = signal<AnalyticsTask[]>([]);
  showModal = signal(false);
  saving = signal(false);

  formData: any = {
    name: '',
    type: 'face_recognition',
    cameraId: null
  };

  analyticsTypes = [
    { value: 'face_recognition', label: 'Face Recognition' },
    { value: 'intrusion_detection', label: 'Intrusion Detection' },
    { value: 'crowd_counting', label: 'Crowd Counting' },
    { value: 'violence_detection', label: 'Violence Detection' },
    { value: 'fire_detection', label: 'Fire & Smoke Detection' }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Task Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'cameraName', label: 'Camera' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors = {
          'active': '<span class="text-green-600">●</span> Active',
          'paused': '<span class="text-yellow-600">●</span> Paused',
          'stopped': '<span class="text-red-600">●</span> Stopped'
        };
        return colors[value as keyof typeof colors] || value;
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  actions: TableAction[] = [
    {
      icon: '⏸️',
      label: 'Pause/Resume',
      onClick: (row) => this.toggleTask(row)
    },
    {
      icon: '⚙️',
      label: 'Configure',
      onClick: (row) => this.configureTask(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteTask(row)
    }
  ];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // Use correct backend endpoint: /video-analytics/analytics-tasks
    this.api.get<AnalyticsTask[]>(`/video-analytics/analytics-tasks`, { company_id: companyId }).subscribe({
      next: (response: any) => {
        this.tasks.set(response.data || response || []);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.tasks.set([]);
      }
    });
  }

  openAddModal(): void {
    this.formData = {
      name: '',
      type: 'face_recognition',
      cameraId: null
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveTask(): void {
    this.saving.set(true);

    const companyId = this.auth.currentUser()?.companyId;
    const data = {
      ...this.formData,
      company_id: companyId
    };

    // Use correct backend endpoint: /video-analytics/analytics-tasks
    this.api.post('/video-analytics/analytics-tasks', data).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error saving task:', error);
        this.saving.set(false);
      }
    });
  }

  toggleTask(task: AnalyticsTask): void {
    const newStatus = task.status === 'active' ? 'paused' : 'active';
    // Use correct backend endpoint: /video-analytics/analytics-tasks/{task_id}
    this.api.put(`/video-analytics/analytics-tasks/${task.id}`, { status: newStatus }).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error toggling task:', error);
      }
    });
  }

  configureTask(task: AnalyticsTask): void {
    // Task configuration functionality
    alert('Task configuration coming soon!');
  }

  deleteTask(task: AnalyticsTask): void {
    if (!confirm(`Delete task ${task.name}?`)) return;

    // Use correct backend endpoint: /video-analytics/analytics-tasks/{task_id}
    this.api.delete(`/video-analytics/analytics-tasks/${task.id}`).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      }
    });
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

