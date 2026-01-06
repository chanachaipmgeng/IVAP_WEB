/**
 * Event Email Confirmation Component
 *
 * Public component for confirming event registration via email link.
 * Displays confirmation status and handles event registration confirmation.
 *
 * @example
 * ```html
 * <app-event-email-confirmation></app-event-email-confirmation>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-event-email-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './event-email-confirmation.component.html',
  styleUrl: './event-email-confirmation.component.scss'
})
export class EventEmailConfirmationComponent extends BaseComponent implements OnInit {
  publicUrl = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    public i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.route.params,
      params => {
        this.publicUrl.set(params['publicUrl']);
      }
    );
  }
}

