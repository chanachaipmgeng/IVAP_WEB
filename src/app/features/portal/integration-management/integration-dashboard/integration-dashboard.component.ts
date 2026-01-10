import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { IntegrationService, IntegrationDashboardData } from '../../../../core/services/integration.service';

@Component({
  selector: 'app-integration-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './integration-dashboard.component.html',
  styleUrl: './integration-dashboard.component.scss'
})
export class IntegrationDashboardComponent implements OnInit {
  dashboardData = signal<IntegrationDashboardData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private integrationService: IntegrationService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.integrationService.getDashboardData().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardData.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load integration dashboard:', err);
        this.error.set('Failed to load dashboard data');
        this.loading.set(false);
      }
    });
  }
}



