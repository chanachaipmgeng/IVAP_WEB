/**
 * AI Models Component
 *
 * Component for managing and viewing AI models.
 * Displays available AI models and their processing status.
 *
 * @example
 * ```html
 * <app-ai-models></app-ai-models>
 * ```
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIModelService } from '../../../core/services/ai-model.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AIModel, ProcessingStatus } from '../../../core/models/ai-model.model';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-ai-models',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, LoadingComponent],
  templateUrl: './ai-models.component.html',
  styleUrls: ['./ai-models.component.scss']
})
export class AIModelsComponent implements OnInit {
  private aiModelService = inject(AIModelService);
  private errorHandler = inject(ErrorHandlerService);

  models = signal<AIModel[]>([]);
  processingStatus = signal<ProcessingStatus | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.loadModels();
    this.loadProcessingStatus();
  }

  loadModels() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.aiModelService.getModels().subscribe({
      next: (models) => {
        this.models.set(models);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล AI Models ได้');
        this.isLoading.set(false);
      }
    });
  }

  loadProcessingStatus() {
    this.aiModelService.getProcessingStatus().subscribe({
      next: (status) => {
        this.processingStatus.set(status);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        // Don't show error message for processing status as it's not critical
      }
    });
  }
}

