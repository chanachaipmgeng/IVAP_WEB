/**
 * Offcanvas Demo Component
 *
 * Demo component showcasing offcanvas component with different positions and configurations.
 * Demonstrates offcanvas from start, end, top, bottom positions with various settings.
 *
 * @example
 * ```html
 * <app-offcanvas-demo></app-offcanvas-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OffcanvasComponent, OffcanvasConfig } from '../../../shared/components/offcanvas/offcanvas.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-offcanvas-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OffcanvasComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './offcanvas-demo.component.html',
  styleUrls: ['./offcanvas-demo.component.scss']
})
export class OffcanvasDemoComponent implements OnInit {
  // Offcanvas states
  isStartOpen: boolean = false;
  isEndOpen: boolean = false;
  isTopOpen: boolean = false;
  isBottomOpen: boolean = false;
  isCustomOpen: boolean = false;

  // Configuration
  config: Partial<OffcanvasConfig> = {
    position: 'end',
    backdrop: true,
    backdropClose: true,
    keyboard: true,
    scroll: true,
    animation: true,
    animationDuration: 300,
    size: 'md',
    zIndex: 1050,
    bodyScroll: false,
    focusTrap: true,
    autoFocus: true,
    restoreFocus: true
  };

  // Demo settings
  selectedPosition: 'start' | 'end' | 'top' | 'bottom' = 'end';
  selectedSize: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  backdrop: boolean = true;
  backdropClose: boolean = true;
  keyboard: boolean = true;
  scroll: boolean = true;
  animation: boolean = true;
  animationDuration: number = 300;
  bodyScroll: boolean = false;
  focusTrap: boolean = true;
  autoFocus: boolean = true;
  restoreFocus: boolean = true;

  // Demo content
  demoContent: string = `
    <h4>เนื้อหาตัวอย่าง</h4>
    <p>นี่คือเนื้อหาตัวอย่างใน Offcanvas Component</p>

    <div class="demo-section">
      <h5>ฟีเจอร์หลัก</h5>
      <ul>
        <li>รองรับหลายตำแหน่ง (Start, End, Top, Bottom)</li>
        <li>รองรับหลายขนาด (Small, Medium, Large, XL, Full)</li>
        <li>รองรับ Backdrop และการปิดด้วย Backdrop</li>
        <li>รองรับการใช้งานด้วยคีย์บอร์ด</li>
        <li>รองรับ Focus Trap</li>
        <li>รองรับ Animation</li>
      </ul>
    </div>

    <div class="demo-section">
      <h5>การใช้งาน</h5>
      <p>สามารถใช้ Offcanvas สำหรับ:</p>
      <ul>
        <li>Mobile Menu</li>
        <li>Sidebar</li>
        <li>Settings Panel</li>
        <li>Notification Panel</li>
        <li>Filter Panel</li>
      </ul>
    </div>

    <div class="demo-section">
      <h5>การตั้งค่า</h5>
      <p>สามารถปรับแต่งได้ตามต้องการ:</p>
      <ul>
        <li>ตำแหน่งการแสดงผล</li>
        <li>ขนาดของ Offcanvas</li>
        <li>การแสดง Backdrop</li>
        <li>การปิดด้วย Backdrop</li>
        <li>การใช้งานด้วยคีย์บอร์ด</li>
        <li>การแสดง Animation</li>
      </ul>
    </div>
  `;

  constructor() {}

  ngOnInit(): void {
    this.updateConfig();
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = {
      position: this.selectedPosition,
      backdrop: this.backdrop,
      backdropClose: this.backdropClose,
      keyboard: this.keyboard,
      scroll: this.scroll,
      animation: this.animation,
      animationDuration: this.animationDuration,
      size: this.selectedSize,
      zIndex: 1050,
      bodyScroll: this.bodyScroll,
      focusTrap: this.focusTrap,
      autoFocus: this.autoFocus,
      restoreFocus: this.restoreFocus
    };
  }

  /**
   * Open offcanvas by position
   */
  openOffcanvas(position: 'start' | 'end' | 'top' | 'bottom'): void {
    this.selectedPosition = position;
    this.updateConfig();

    switch (position) {
      case 'start':
        this.isStartOpen = true;
        break;
      case 'end':
        this.isEndOpen = true;
        break;
      case 'top':
        this.isTopOpen = true;
        break;
      case 'bottom':
        this.isBottomOpen = true;
        break;
    }
  }

  /**
   * Close offcanvas by position
   */
  closeOffcanvas(position: 'start' | 'end' | 'top' | 'bottom'): void {
    switch (position) {
      case 'start':
        this.isStartOpen = false;
        break;
      case 'end':
        this.isEndOpen = false;
        break;
      case 'top':
        this.isTopOpen = false;
        break;
      case 'bottom':
        this.isBottomOpen = false;
        break;
    }
  }

  /**
   * Open custom offcanvas
   */
  openCustomOffcanvas(): void {
    this.isCustomOpen = true;
  }

  /**
   * Close custom offcanvas
   */
  closeCustomOffcanvas(): void {
    this.isCustomOpen = false;
  }

  /**
   * Handle offcanvas opened
   */
  onOffcanvasOpened(): void {
    console.log('Offcanvas opened');
  }

  /**
   * Handle offcanvas closed
   */
  onOffcanvasClosed(): void {
    console.log('Offcanvas closed');
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    console.log('Backdrop clicked');
  }

  /**
   * Get position options
   */
  getPositionOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'start', label: 'Start (ซ้าย)' },
      { value: 'end', label: 'End (ขวา)' },
      { value: 'top', label: 'Top (บน)' },
      { value: 'bottom', label: 'Bottom (ล่าง)' }
    ];
  }

  /**
   * Get size options
   */
  getSizeOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
      { value: 'xl', label: 'Extra Large' },
      { value: 'full', label: 'Full' }
    ];
  }

  /**
   * Get offcanvas statistics
   */
  getOffcanvasStats(): any {
    return {
      totalOpen: [this.isStartOpen, this.isEndOpen, this.isTopOpen, this.isBottomOpen, this.isCustomOpen].filter(Boolean).length,
      startOpen: this.isStartOpen,
      endOpen: this.isEndOpen,
      topOpen: this.isTopOpen,
      bottomOpen: this.isBottomOpen,
      customOpen: this.isCustomOpen,
      position: this.selectedPosition,
      size: this.selectedSize,
      backdrop: this.backdrop,
      keyboard: this.keyboard,
      animation: this.animation
    };
  }
}
