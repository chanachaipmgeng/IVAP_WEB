/**
 * Face Recognition Demo Component
 *
 * Demo component showcasing face recognition capabilities including detection, recognition, and enrollment.
 * Displays demo statistics, recent activity, and supports single and group face recognition.
 *
 * @example
 * ```html
 * <app-face-recognition-demo></app-face-recognition-demo>
 * ```
 */

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FaceRecognitionComponent } from '../../../shared/components/face-recognition/face-recognition.component';
import { GroupFaceRecognitionComponent, GroupRecognitionResult } from '../../../shared/components/group-face-recognition/group-face-recognition.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { FaceDetectionResult, FaceRecognitionResult, FaceEnrollmentData } from '../../../core/services/face-detection.service';
import { ImageQualityAssessment } from '../../../core/utils/image-quality.utils';
import { I18nService } from '../../../core/services/i18n.service';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

@Component({
  selector: 'app-face-recognition-demo',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    TranslateModule,
    FaceRecognitionComponent,
    GroupFaceRecognitionComponent,
    GlassCardComponent,
    GlassButtonComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './face-recognition-demo.component.html',
  styleUrls: ['./face-recognition-demo.component.scss']
})
export class FaceRecognitionDemoComponent implements OnInit {
  // Demo statistics
  demoStats = {
    totalDetections: 0,
    successfulRecognitions: 0,
    totalEnrollments: 0,
    averageConfidence: 0,
    detectionTime: 0
  };

  // Recent activity
  recentActivity: Array<{
    type: 'detection' | 'recognition' | 'enrollment';
    message: string;
    timestamp: Date;
    confidence?: number;
    details?: string;
    snapshot?: string; // Add snapshot field
  }> = [];

  // Demo mode
  demoMode: 'single' | 'group' = 'single';

  // Demo settings
  demoSettings = {
    showAdvancedFeatures: true,
    enableSound: true,
    enableVibration: false,
    detectionThreshold: 0.6,
    recognitionThreshold: 0.6
  };

  // Group recognition data
  groupRecognitionData: GroupRecognitionResult[] = [];
  imageQualityData: ImageQualityAssessment | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadDemoSettings();
  }

  t(key: string, params?: Record<string, any>): string {
    let translation = this.i18n.translate(key);
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    return translation;
  }

  /**
   * Handle face detection events
   */
  onFaceDetected(detections: FaceDetectionResult[]): void {
    if (detections.length === 0) return;

    // Filter detections based on threshold
    const qualifiedDetections = detections.filter(d => d.confidence >= this.demoSettings.detectionThreshold);

    if (qualifiedDetections.length === 0) return;

    this.demoStats.totalDetections += qualifiedDetections.length;
    this.updateAverageConfidence();

    // Create details string if available
    const d = qualifiedDetections[0]; // Use the first qualified detection
    let details = '';
    const parts = [];
    if (d.gender) parts.push(d.gender === 'male' ? 'ชาย' : 'หญิง');
    if (d.age) parts.push(`${Math.round(d.age)} ปี`);

    // Add expression
    if (d.expressions) {
      const sorted = Object.entries(d.expressions).sort((a: any, b: any) => b[1] - a[1]);
      if (sorted.length > 0 && (sorted[0][1] as number) > 0.5) {
          const exprMap: {[key: string]: string} = {
            neutral: 'ปกติ',
            happy: 'มีความสุข',
            sad: 'เศร้า',
            angry: 'โกรธ',
            fearful: 'กลัว',
            disgusted: 'รังเกียจ',
            surprised: 'ประหลาดใจ'
          };
          parts.push(exprMap[sorted[0][0]] || sorted[0][0]);
      }
    }

    if (parts.length > 0) details = parts.join(', ');

    // Only add activity for significant detections (throttle slightly to avoid spam)
    // For demo purposes, we'll just log it. In production, you might debounce this.
    this.addActivity({
      type: 'detection',
      message: `ตรวจจับใบหน้าได้ ${qualifiedDetections.length} ใบหน้า`,
      timestamp: new Date(),
      confidence: d.confidence,
      details: details,
      snapshot: d.snapshot
    });
  }

  /**
   * Handle face recognition events
   */
  onFaceRecognized(recognitions: FaceRecognitionResult[]): void {
    const successful = recognitions.filter(r => r.isRecognized);
    this.demoStats.successfulRecognitions += successful.length;

    successful.forEach(recognition => {
      this.addActivity({
        type: 'recognition',
        message: `จดจำใบหน้า: ${recognition.name} (${Math.round(recognition.confidence * 100)}%)`,
        timestamp: new Date(),
        confidence: recognition.confidence
      });
    });
  }

  /**
   * Handle face enrollment events
   */
  onFaceEnrolled(enrollment: FaceEnrollmentData): void {
    this.demoStats.totalEnrollments++;

    this.addActivity({
      type: 'enrollment',
      message: `ลงทะเบียนใบหน้าใหม่: ${enrollment.name}`,
      timestamp: new Date()
    });
  }

  /**
   * Add activity to recent activity list
   */
  private addActivity(activity: {
    type: 'detection' | 'recognition' | 'enrollment';
    message: string;
    timestamp: Date;
    confidence?: number;
    details?: string;
    snapshot?: string;
  }): void {
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.recentActivity.unshift(activity);

      // Keep only last 20 activities
      if (this.recentActivity.length > 20) {
        this.recentActivity = this.recentActivity.slice(0, 20);
      }
      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Update average confidence
   */
  private updateAverageConfidence(): void {
    // This would be calculated from actual detection data
    // For demo purposes, we'll simulate it
    // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.demoStats.averageConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
      this.cdr.detectChanges();
    }, 0);
  }

  /**
   * Reset demo statistics
   */
  resetStats(): void {
    this.demoStats = {
      totalDetections: 0,
      successfulRecognitions: 0,
      totalEnrollments: 0,
      averageConfidence: 0,
      detectionTime: 0
    };
    this.recentActivity = [];
  }

  /**
   * Export demo data
   */
  exportDemoData(): void {
    const data = {
      stats: this.demoStats,
      activity: this.recentActivity,
      settings: this.demoSettings,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `face-recognition-demo-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Load demo settings from localStorage
   */
  private loadDemoSettings(): void {
    const saved = localStorage.getItem('face-recognition-demo-settings');
    if (saved) {
      try {
        this.demoSettings = { ...this.demoSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load demo settings:', error);
      }
    }
  }

  /**
   * Save demo settings to localStorage
   */
  saveDemoSettings(): void {
    localStorage.setItem('face-recognition-demo-settings', JSON.stringify(this.demoSettings));
  }

  /**
   * Toggle advanced features
   */
  toggleAdvancedFeatures(): void {
    this.demoSettings.showAdvancedFeatures = !this.demoSettings.showAdvancedFeatures;
    this.saveDemoSettings();
  }

  /**
   * Get activity icon class
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case 'detection':
        return 'fas fa-eye';
      case 'recognition':
        return 'fas fa-user-check';
      case 'enrollment':
        return 'fas fa-user-plus';
      default:
        return 'fas fa-info-circle';
    }
  }

  /**
   * Get activity color class
   */
  getActivityColor(type: string): string {
    switch (type) {
      case 'detection':
        return 'text-blue-400';
      case 'recognition':
        return 'text-green-400';
      case 'enrollment':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  }

  /**
   * Handle group face recognition events
   */
  onGroupFacesRecognized(faces: GroupRecognitionResult[]): void {
    this.groupRecognitionData = faces;
    this.demoStats.successfulRecognitions += faces.length;

    faces.forEach(face => {
      this.addActivity({
        type: 'recognition',
        message: `จดจำใบหน้า: ${face.firstName} ${face.lastName} (${Math.round(face.confidence * 100)}%)`,
        timestamp: new Date(),
        confidence: face.confidence
      });
    });
  }

  /**
   * Handle image quality change events
   */
  onQualityChanged(quality: ImageQualityAssessment): void {
    this.imageQualityData = quality;

    // Translate quality level
    const qualityKey = quality.quality.charAt(0).toUpperCase() + quality.quality.slice(1);
    const qualityMap: {[key: string]: string} = {
      Excellent: 'ยอดเยี่ยม',
      Good: 'ดี',
      Fair: 'ปานกลาง',
      Poor: 'ต่ำ'
    };
    const qualityTranslation = qualityMap[qualityKey] || qualityKey;

    this.addActivity({
      type: 'detection',
      message: `คุณภาพภาพ: ${qualityTranslation} (ความสว่าง: ${Math.round(quality.brightness)}, ความชัด: ${Math.round(quality.blurriness)})`,
      timestamp: new Date()
    });
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    const locale = this.i18n.currentLanguage() === 'th' ? 'th-TH' : 'en-US';
    return new Date(timestamp).toLocaleTimeString(locale);
  }
}
