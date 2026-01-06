/**
 * License Management Component
 *
 * License management component for super admin.
 * Supports license activation, upgrade, usage tracking, and statistics display.
 *
 * @example
 * ```html
 * <app-license-management></app-license-management>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { LicenseService } from '../../../core/services/license.service';
import { I18nService } from '../../../core/services/i18n.service';
import { License, LicenseUsage, LicenseActivationForm, LicenseUpgradeForm, LicenseStatistics } from '../../../core/models/license.model';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-license-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    GlassButtonComponent,
    ModalComponent,
    PageLayoutComponent
  ],
  templateUrl: './license-management.component.html',
  styleUrls: ['./license-management.component.scss']
})
export class LicenseManagementComponent extends BaseComponent implements OnInit {
  showActivationModal = signal(false);
  showUpgradeModal = signal(false);

  activationForm: LicenseActivationForm = {
    licenseKey: '',
    companyName: ''
  };

  upgradeForm: LicenseUpgradeForm = {
    currentLicense: '',
    selectedUpgrade: 'professional'
  };

  // Computed signals for statistics
  licenseStats = computed(() => this.licenseService.getLicenseStatistics());

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: 'Refresh',
      variant: 'secondary',
      onClick: () => this.loadLicense()
    },
    {
      label: 'Activate License',
      variant: 'primary',
      onClick: () => this.openActivationModal()
    }
  ]);

  constructor(
    public licenseService: LicenseService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadLicense();
    this.loadUsage();
  }

  // Getters from service
  getLicense = () => this.licenseService.getLicense();
  getUsage = () => this.licenseService.getUsage();

  // Load data methods
  loadLicense(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.licenseService.loadLicense(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading license:', error);
      }
    );
  }

  loadUsage(): void {
    this.subscribe(
      this.licenseService.loadUsage(),
      () => {
        // Data is automatically updated via service
      },
      (error) => {
        console.error('Error loading usage:', error);
      }
    );
  }

  // Helper methods
  getUsagePercentage(type: 'users' | 'companies'): number {
    return this.licenseService.getUsagePercentage(type);
  }

  formatDate(dateStr: string): string {
    return this.licenseService.formatDate(dateStr);
  }

  formatDateTime(dateStr: string): string {
    return this.licenseService.formatDateTime(dateStr);
  }

  // Modal methods
  openActivationModal(): void {
    this.activationForm = {
      licenseKey: '',
      companyName: ''
    };
    this.showActivationModal.set(true);
  }

  closeActivationModal(): void {
    this.showActivationModal.set(false);
  }

  openUpgradeModal(): void {
    this.upgradeForm = {
      currentLicense: this.getLicense()().type,
      selectedUpgrade: 'professional'
    };
    this.showUpgradeModal.set(true);
  }

  closeUpgradeModal(): void {
    this.showUpgradeModal.set(false);
  }

  // Action methods
  checkLicense(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.licenseService.checkLicense(),
      () => {
        this.loadLicense();
        alert('License check completed!');
      },
      (error) => {
        console.error('Error checking license:', error);
        alert('Error checking license!');
      }
    );
  }

  activateLicense(): void {
    if (!this.activationForm.licenseKey || !this.activationForm.companyName) {
      alert('Please fill in all required fields');
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.licenseService.activateLicense(this.activationForm),
      () => {
        this.closeActivationModal();
        this.loadLicense();
        alert('License activated successfully!');
      },
      (error) => {
        console.error('Error activating license:', error);
        alert('Error activating license!');
      }
    );
  }

  renewLicense(): void {
    if (!confirm('Renew license? This will extend the current license period.')) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.licenseService.renewLicense(),
      () => {
        this.loadLicense();
        alert('License renewed successfully!');
      },
      (error) => {
        console.error('Error renewing license:', error);
        alert('Error renewing license!');
      }
    );
  }

  upgradeLicense(): void {
    if (!confirm(`Upgrade to ${this.upgradeForm.selectedUpgrade} license? This will change your current license.`)) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.licenseService.upgradeLicense(this.upgradeForm),
      () => {
        this.closeUpgradeModal();
        this.loadLicense();
        alert('License upgraded successfully!');
      },
      (error) => {
        console.error('Error upgrading license:', error);
        alert('Error upgrading license!');
      }
    );
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
