/**
 * Timeline Demo Component
 *
 * Demo component showcasing timeline component with event display and configurations.
 * Demonstrates timeline items, variants, and timeline customization options.
 *
 * @example
 * ```html
 * <app-timeline-demo></app-timeline-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineComponent, TimelineEvent, TimelineConfig } from '../../../shared/components/timeline/timeline.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-timeline-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimelineComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './timeline-demo.component.html',
  styleUrls: ['./timeline-demo.component.scss']
})
export class TimelineDemoComponent implements OnInit {
  // Timeline events
  timelineEvents: TimelineEvent[] = [];

  // Timeline configuration
  timelineConfig: TimelineConfig = {
    orientation: 'vertical',
    showIcons: true,
    showTimestamps: true,
    showDescriptions: true,
    allowCollapse: true,
    maxHeight: '500px',
    itemHeight: '80px',
    lineColor: '#3B82F6',
    dotSize: '14px'
  };

  // Demo settings
  demoMode: 'system' | 'user' | 'custom' = 'system';
  loading = false;
  autoRefresh = false;
  refreshInterval: any;

  // Sample data
  systemEvents: TimelineEvent[] = [];
  userEvents: TimelineEvent[] = [];
  customEvents: TimelineEvent[] = [];

  constructor() {}

  ngOnInit(): void {
    this.generateSampleData();
    this.updateTimelineEvents();
  }

  /**
   * Generate sample timeline events
   */
  private generateSampleData(): void {
    // System Events
    this.systemEvents = [
      {
        id: 'sys-1',
        title: 'ระบบเริ่มทำงาน',
        description: 'ระบบ Intelligent Video Analytics Platform เริ่มทำงานเรียบร้อย',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'success',
        icon: 'fas fa-play-circle',
        isCompleted: true
      },
      {
        id: 'sys-2',
        title: 'ตรวจพบใบหน้าใหม่',
        description: 'ระบบตรวจพบใบหน้าใหม่ 3 ใบหน้า และเริ่มกระบวนการจดจำ',
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
        type: 'info',
        icon: 'fas fa-user-plus',
        data: { faces: 3, confidence: 0.95 }
      },
      {
        id: 'sys-3',
        title: 'การลงเวลาทำงาน',
        description: 'พนักงาน 5 คน ลงเวลาทำงานเรียบร้อย',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        type: 'success',
        icon: 'fas fa-clock',
        data: { employees: 5, timestamp: new Date() }
      },
      {
        id: 'sys-4',
        title: 'คำเตือนระบบ',
        description: 'การใช้ CPU สูงเกิน 80% ควรตรวจสอบประสิทธิภาพ',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        type: 'warning',
        icon: 'fas fa-exclamation-triangle',
        data: { cpu: 85, memory: 70 }
      },
      {
        id: 'sys-5',
        title: 'อัปเดตระบบ',
        description: 'ระบบได้รับการอัปเดตเวอร์ชัน 2.1.0 เรียบร้อย',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        type: 'info',
        icon: 'fas fa-sync-alt',
        isCompleted: true
      },
      {
        id: 'sys-6',
        title: 'ข้อผิดพลาดในการเชื่อมต่อ',
        description: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ชั่วคราว',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        type: 'error',
        icon: 'fas fa-database',
        data: { error: 'Connection timeout', retry: 3 }
      }
    ];

    // User Events
    this.userEvents = [
      {
        id: 'user-1',
        title: 'เข้าสู่ระบบ',
        description: 'ผู้ใช้ admin เข้าสู่ระบบเรียบร้อย',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        type: 'success',
        icon: 'fas fa-sign-in-alt'
      },
      {
        id: 'user-2',
        title: 'ดูรายงาน',
        description: 'ผู้ใช้ admin ดูรายงานการทำงานประจำวัน',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
        type: 'info',
        icon: 'fas fa-chart-bar'
      },
      {
        id: 'user-3',
        title: 'แก้ไขการตั้งค่า',
        description: 'ผู้ใช้ admin แก้ไขการตั้งค่าระบบ',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'primary',
        icon: 'fas fa-cog'
      },
      {
        id: 'user-4',
        title: 'ส่งออกข้อมูล',
        description: 'ผู้ใช้ admin ส่งออกข้อมูลพนักงาน',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
        type: 'info',
        icon: 'fas fa-download'
      },
      {
        id: 'user-5',
        title: 'เพิ่มพนักงานใหม่',
        description: 'ผู้ใช้ admin เพิ่มพนักงานใหม่ 2 คน',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        type: 'success',
        icon: 'fas fa-user-plus'
      },
      {
        id: 'user-6',
        title: 'ล็อกเอาท์',
        description: 'ผู้ใช้ admin ออกจากระบบ',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        type: 'secondary',
        icon: 'fas fa-sign-out-alt'
      }
    ];

    // Custom Events
    this.customEvents = [
      {
        id: 'custom-1',
        title: 'การประชุมทีม',
        description: 'ประชุมทีมพัฒนาเพื่อวางแผนการพัฒนาระบบ',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        type: 'primary',
        icon: 'fas fa-users',
        data: { participants: 5, duration: '2 hours' }
      },
      {
        id: 'custom-2',
        title: 'ทดสอบระบบ',
        description: 'ทดสอบระบบ Face Recognition กับข้อมูลจริง',
        timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
        type: 'info',
        icon: 'fas fa-flask',
        data: { testCases: 100, success: 95, failure: 5 }
      },
      {
        id: 'custom-3',
        title: 'การสำรองข้อมูล',
        description: 'ทำการสำรองข้อมูลระบบทุกวัน',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        type: 'success',
        icon: 'fas fa-save',
        isCompleted: true
      },
      {
        id: 'custom-4',
        title: 'การบำรุงรักษา',
        description: 'ทำการบำรุงรักษาระบบตามกำหนด',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
        type: 'warning',
        icon: 'fas fa-tools',
        data: { maintenance: 'scheduled', duration: '1 hour' }
      },
      {
        id: 'custom-5',
        title: 'การอัปเดตความปลอดภัย',
        description: 'อัปเดตแพตช์ความปลอดภัยล่าสุด',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        type: 'primary',
        icon: 'fas fa-shield-alt',
        isCompleted: true
      }
    ];
  }

  /**
   * Update timeline events based on current mode
   */
  private updateTimelineEvents(): void {
    switch (this.demoMode) {
      case 'system':
        this.timelineEvents = [...this.systemEvents];
        break;
      case 'user':
        this.timelineEvents = [...this.userEvents];
        break;
      case 'custom':
        this.timelineEvents = [...this.customEvents];
        break;
    }
  }

  /**
   * Handle demo mode change
   */
  onModeChange(): void {
    this.updateTimelineEvents();
  }

  /**
   * Handle timeline event click
   */
  onEventClick(event: TimelineEvent): void {
    console.log('Event clicked:', event);
    // You can add custom logic here
  }

  /**
   * Handle timeline event toggle
   */
  onEventToggle(event: TimelineEvent): void {
    console.log('Event toggled:', event);
    // You can add custom logic here
  }

  /**
   * Handle load more events
   */
  onLoadMore(): void {
    this.loading = true;

    // Simulate loading more events
    setTimeout(() => {
      const newEvents: TimelineEvent[] = [
        {
          id: `new-${Date.now()}`,
          title: 'เหตุการณ์ใหม่',
          description: 'เหตุการณ์ที่โหลดเพิ่มเติม',
          timestamp: new Date(),
          type: 'info',
          icon: 'fas fa-plus-circle'
        }
      ];

      this.timelineEvents = [...this.timelineEvents, ...newEvents];
      this.loading = false;
    }, 1000);
  }

  /**
   * Toggle auto refresh
   */
  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;

    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.addRandomEvent();
      }, 5000); // Add event every 5 seconds
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }

  /**
   * Add random event
   */
  private addRandomEvent(): void {
    const eventTypes: Array<TimelineEvent['type']> = ['success', 'warning', 'error', 'info', 'primary', 'secondary'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const newEvent: TimelineEvent = {
      id: `auto-${Date.now()}`,
      title: `เหตุการณ์อัตโนมัติ ${randomType}`,
      description: `เหตุการณ์ที่สร้างอัตโนมัติเมื่อ ${new Date().toLocaleTimeString('th-TH')}`,
      timestamp: new Date(),
      type: randomType,
      icon: 'fas fa-robot'
    };

    this.timelineEvents.unshift(newEvent);
  }

  /**
   * Clear all events
   */
  clearAllEvents(): void {
    this.timelineEvents = [];
  }

  /**
   * Reset to sample data
   */
  resetToSampleData(): void {
    this.updateTimelineEvents();
  }

  /**
   * Toggle timeline orientation
   */
  toggleOrientation(): void {
    this.timelineConfig.orientation = this.timelineConfig.orientation === 'vertical' ? 'horizontal' : 'vertical';
  }

  /**
   * Toggle timeline features
   */
  toggleFeature(feature: keyof TimelineConfig): void {
    if (typeof this.timelineConfig[feature] === 'boolean') {
      (this.timelineConfig[feature] as boolean) = !(this.timelineConfig[feature] as boolean);
    }
  }

  /**
   * Get event type statistics
   */
  getEventTypeStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};

    this.timelineEvents.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get total events count
   */
  getTotalEventsCount(): number {
    return this.timelineEvents.length;
  }

  /**
   * Get recent events count (last 24 hours)
   */
  getRecentEventsCount(): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.timelineEvents.filter(event => new Date(event.timestamp) > oneDayAgo).length;
  }
}

