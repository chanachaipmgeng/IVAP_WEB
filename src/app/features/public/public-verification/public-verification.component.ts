/**
 * Public Verification Component
 *
 * Public component for displaying verification templates.
 * Loads and displays verification templates based on template ID from route parameters.
 *
 * @example
 * ```html
 * <app-public-verification></app-public-verification>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { ApiService } from '../../../core/services/api.service';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-public-verification',
  standalone: true,
  imports: [
    CommonModule,
    GlassCardComponent
  ],
  templateUrl: './public-verification.component.html',
  styleUrl: './public-verification.component.scss'
})
export class PublicVerificationComponent extends BaseComponent implements OnInit {
  templateId = signal<string>('');
  loading = signal(false);
  template = signal<any>(null);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    public i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.route.params,
      params => {
        this.templateId.set(params['templateId']);
        this.loadTemplate();
      }
    );
  }

  async loadTemplate(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await this.api.get(`/verification-templates/public/${this.templateId()}`).toPromise();
      this.template.set(response);
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      this.loading.set(false);
    }
  }
}

