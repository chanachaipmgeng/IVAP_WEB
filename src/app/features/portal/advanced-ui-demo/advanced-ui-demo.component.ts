/**
 * Advanced UI Demo Component
 *
 * Demo component showcasing advanced UI components including progress bars, tooltips, and modals.
 * Demonstrates various UI component configurations and usage patterns.
 *
 * @example
 * ```html
 * <app-advanced-ui-demo></app-advanced-ui-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressBarComponent, ProgressBarConfig } from '../../../shared/components/progress-bar/progress-bar.component';
import { TooltipComponent, TooltipConfig } from '../../../shared/components/tooltip/tooltip.component';
import { ModalComponent, ModalConfig } from '../../../shared/components/modal/modal.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-advanced-ui-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressBarComponent,
    TooltipComponent,
    ModalComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './advanced-ui-demo.component.html',
  styleUrls: ['./advanced-ui-demo.component.scss']
})
export class AdvancedUiDemoComponent implements OnInit {
  // Progress Bar Demo
  progressValue: number = 0;
  progressMax: number = 100;
  progressLabel: string = 'Progress Demo';
  progressConfig: Partial<ProgressBarConfig> = {
    showPercentage: true,
    showLabel: true,
    animated: false,
    striped: false,
    size: 'md',
    color: 'primary',
    height: '20px'
  };

  // Tooltip Demo
  tooltipContent: string = 'นี่คือ Tooltip Demo';
  tooltipConfig: Partial<TooltipConfig> = {
    position: 'top',
    theme: 'dark',
    size: 'md',
    showArrow: true,
    showDelay: 500,
    hideDelay: 200,
    maxWidth: '300px',
    animation: true,
    interactive: false
  };

  // Modal Demo
  isModalOpen: boolean = false;
  modalTitle: string = 'Modal Demo';
  modalConfig: Partial<ModalConfig> = {
    size: 'md',
    backdrop: true,
    keyboard: true,
    focus: true,
    animation: true,
    scrollable: false,
    centered: true,
    closeOnEscape: true,
    closeOnBackdrop: true
  };

  // Demo settings
  autoProgress: boolean = false;
  progressInterval: any;
  selectedDemo: 'progress' | 'tooltip' | 'modal' = 'progress';

  // Sample data
  progressExamples = [
    { value: 0, label: 'เริ่มต้น', color: 'primary' as const },
    { value: 25, label: '25%', color: 'info' as const },
    { value: 50, label: 'ครึ่งทาง', color: 'warning' as const },
    { value: 75, label: 'เกือบเสร็จ', color: 'warning' as const },
    { value: 100, label: 'เสร็จสมบูรณ์', color: 'success' as const }
  ];

  tooltipExamples = [
    { content: 'Tooltip ด้านบน', position: 'top' as const, theme: 'primary' as const },
    { content: 'Tooltip ด้านล่าง', position: 'bottom' as const, theme: 'success' as const },
    { content: 'Tooltip ด้านซ้าย', position: 'left' as const, theme: 'warning' as const },
    { content: 'Tooltip ด้านขวา', position: 'right' as const, theme: 'danger' as const },
    { content: 'Tooltip แบบโต้ตอบ', position: 'top' as const, theme: 'info' as const, interactive: true }
  ];

  modalExamples = [
    { size: 'sm' as const, title: 'Modal ขนาดเล็ก' },
    { size: 'md' as const, title: 'Modal ขนาดกลาง' },
    { size: 'lg' as const, title: 'Modal ขนาดใหญ่' },
    { size: 'xl' as const, title: 'Modal ขนาดใหญ่มาก' },
    { size: 'full' as const, title: 'Modal เต็มหน้าจอ' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.startAutoProgress();
  }

  /**
   * Start auto progress
   */
  startAutoProgress(): void {
    if (this.autoProgress) {
      this.progressInterval = setInterval(() => {
        this.progressValue += 1;
        if (this.progressValue >= this.progressMax) {
          this.progressValue = 0;
        }
      }, 100);
    }
  }

  /**
   * Stop auto progress
   */
  stopAutoProgress(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  /**
   * Toggle auto progress
   */
  toggleAutoProgress(): void {
    this.autoProgress = !this.autoProgress;
    if (this.autoProgress) {
      this.startAutoProgress();
    } else {
      this.stopAutoProgress();
    }
  }

  /**
   * Reset progress
   */
  resetProgress(): void {
    this.progressValue = 0;
  }

  /**
   * Set progress value
   */
  setProgressValue(value: number): void {
    this.progressValue = Math.min(Math.max(value, 0), this.progressMax);
  }

  /**
   * Update progress config
   */
  updateProgressConfig(config: Partial<ProgressBarConfig>): void {
    this.progressConfig = { ...this.progressConfig, ...config };
  }

  /**
   * Update tooltip config
   */
  updateTooltipConfig(config: Partial<TooltipConfig>): void {
    this.tooltipConfig = { ...this.tooltipConfig, ...config };
  }

  /**
   * Update modal config
   */
  updateModalConfig(config: Partial<ModalConfig>): void {
    this.modalConfig = { ...this.modalConfig, ...config };
  }

  /**
   * Open modal
   */
  openModal(): void {
    this.isModalOpen = true;
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.isModalOpen = false;
  }

  /**
   * Handle modal opened
   */
  onModalOpened(): void {
    console.log('Modal opened');
  }

  /**
   * Handle modal closed
   */
  onModalClosed(): void {
    console.log('Modal closed');
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    console.log('Backdrop clicked');
  }

  /**
   * Get progress status
   */
  getProgressStatus(): string {
    if (this.progressValue === 0) return 'เริ่มต้น';
    if (this.progressValue < 25) return 'เริ่มต้น';
    if (this.progressValue < 50) return 'กำลังดำเนินการ';
    if (this.progressValue < 75) return 'เกือบเสร็จ';
    if (this.progressValue < 100) return 'ใกล้เสร็จ';
    return 'เสร็จสมบูรณ์';
  }

  /**
   * Get progress color based on value
   */
  getProgressColor(): string {
    if (this.progressValue < 25) return 'primary';
    if (this.progressValue < 50) return 'info';
    if (this.progressValue < 75) return 'warning';
    if (this.progressValue < 100) return 'warning';
    return 'success';
  }

  /**
   * Get demo statistics
   */
  getDemoStats(): any {
    return {
      progressValue: this.progressValue,
      progressPercentage: Math.round((this.progressValue / this.progressMax) * 100),
      tooltipPosition: this.tooltipConfig.position,
      tooltipTheme: this.tooltipConfig.theme,
      modalSize: this.modalConfig.size,
      isModalOpen: this.isModalOpen,
      autoProgress: this.autoProgress
    };
  }
}

