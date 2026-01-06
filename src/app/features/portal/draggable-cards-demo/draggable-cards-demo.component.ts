/**
 * Draggable Cards Demo Component
 *
 * Demo component showcasing draggable cards component with drag-and-drop functionality.
 * Demonstrates card positioning, grid snapping, overlap control, and auto-save features.
 *
 * @example
 * ```html
 * <app-draggable-cards-demo></app-draggable-cards-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DraggableCardsComponent, DraggableCard, DraggableCardsConfig } from '../../../shared/components/draggable-cards/draggable-cards.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-draggable-cards-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DraggableCardsComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './draggable-cards-demo.component.html',
  styleUrls: ['./draggable-cards-demo.component.scss']
})
export class DraggableCardsDemoComponent implements OnInit {
  // Draggable cards
  cards: DraggableCard[] = [];

  // Configuration
  config: Partial<DraggableCardsConfig> = {
    gridSize: 20,
    snapToGrid: true,
    allowOverlap: false,
    maxZIndex: 1000,
    minWidth: 200,
    minHeight: 150,
    maxWidth: 600,
    maxHeight: 400,
    animation: true,
    animationDuration: 300,
    autoSave: true,
    autoSaveDelay: 1000
  };

  // Demo settings
  gridSize: number = 20;
  snapToGrid: boolean = true;
  allowOverlap: boolean = false;
  animation: boolean = true;
  autoSave: boolean = true;

  // Statistics
  selectedCard: DraggableCard | null = null;

  constructor() {}

  ngOnInit(): void {
    this.initializeSampleCards();
    this.updateConfig();
  }

  /**
   * Initialize sample cards
   */
  private initializeSampleCards(): void {
    this.cards = [
      {
        id: 'card-1',
        title: 'Dashboard Overview',
        content: `
          <h4>ระบบจัดการข้อมูล</h4>
          <p>แสดงข้อมูลสถิติการใช้งานระบบ</p>
          <ul>
            <li>จำนวนผู้ใช้งาน</li>
            <li>สถิติการเข้าถึง</li>
            <li>รายงานประจำวัน</li>
          </ul>
        `,
        x: 20,
        y: 20,
        width: 300,
        height: 250,
        zIndex: 1,
        locked: false,
        resizable: true,
        draggable: true,
        color: '#3B82F6',
        icon: 'fas fa-chart-pie',
        badge: 'สำคัญ',
        badgeColor: 'primary'
      },
      {
        id: 'card-2',
        title: 'Face Recognition',
        content: `
          <h4>ระบบจดจำใบหน้า</h4>
          <p>ระบบ AI สำหรับการจดจำใบหน้า</p>
          <ul>
            <li>การลงทะเบียนใบหน้า</li>
            <li>การจดจำแบบเรียลไทม์</li>
            <li>การประเมินคุณภาพภาพ</li>
          </ul>
        `,
        x: 350,
        y: 20,
        width: 280,
        height: 220,
        zIndex: 2,
        locked: false,
        resizable: true,
        draggable: true,
        color: '#10B981',
        icon: 'fas fa-user-check',
        badge: 'AI',
        badgeColor: 'success'
      },
      {
        id: 'card-3',
        title: 'Analytics Report',
        content: `
          <h4>รายงานการวิเคราะห์</h4>
          <p>ข้อมูลสถิติและรายงานต่างๆ</p>
          <ul>
            <li>กราฟแสดงผล</li>
            <li>ข้อมูลสถิติ</li>
            <li>การส่งออกรายงาน</li>
          </ul>
        `,
        x: 20,
        y: 300,
        width: 250,
        height: 200,
        zIndex: 3,
        locked: false,
        resizable: true,
        draggable: true,
        color: '#F59E0B',
        icon: 'fas fa-chart-bar',
        badge: 'รายงาน',
        badgeColor: 'warning'
      },
      {
        id: 'card-4',
        title: 'System Settings',
        content: `
          <h4>การตั้งค่าระบบ</h4>
          <p>การกำหนดค่าต่างๆ ของระบบ</p>
          <ul>
            <li>การตั้งค่าผู้ใช้</li>
            <li>การกำหนดสิทธิ์</li>
            <li>การตั้งค่าการแจ้งเตือน</li>
          </ul>
        `,
        x: 300,
        y: 300,
        width: 280,
        height: 180,
        zIndex: 4,
        locked: false,
        resizable: true,
        draggable: true,
        color: '#8B5CF6',
        icon: 'fas fa-cog',
        badge: 'ตั้งค่า',
        badgeColor: 'info'
      }
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = {
      gridSize: this.gridSize,
      snapToGrid: this.snapToGrid,
      allowOverlap: this.allowOverlap,
      maxZIndex: 1000,
      minWidth: 200,
      minHeight: 150,
      maxWidth: 600,
      maxHeight: 400,
      animation: this.animation,
      animationDuration: 300,
      autoSave: this.autoSave,
      autoSaveDelay: 1000
    };
  }

  /**
   * Handle card move
   */
  onCardMove(card: DraggableCard): void {
    console.log('Card moved:', card);
  }

  /**
   * Handle card resize
   */
  onCardResize(card: DraggableCard): void {
    console.log('Card resized:', card);
  }

  /**
   * Handle card select
   */
  onCardSelect(card: DraggableCard): void {
    this.selectedCard = card;
    console.log('Card selected:', card);
  }

  /**
   * Handle card deselect
   */
  onCardDeselect(card: DraggableCard): void {
    this.selectedCard = null;
    console.log('Card deselected:', card);
  }

  /**
   * Handle cards change
   */
  onCardsChange(cards: DraggableCard[]): void {
    this.cards = [...cards];
    console.log('Cards changed:', cards);
  }

  /**
   * Add sample card
   */
  addSampleCard(): void {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    const icons = ['fas fa-star', 'fas fa-heart', 'fas fa-bookmark', 'fas fa-flag', 'fas fa-tag'];
    const badges = ['ใหม่', 'อัปเดต', 'สำคัญ', 'ทดสอบ', 'ตัวอย่าง'];
    const badgeColors = ['primary', 'success', 'warning', 'danger', 'info'];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomBadge = badges[Math.floor(Math.random() * badges.length)];
    const randomBadgeColor = badgeColors[Math.floor(Math.random() * badgeColors.length)];

    const newCard: DraggableCard = {
      id: `card-${Date.now()}`,
      title: `Card ${this.cards.length + 1}`,
      content: `
        <h4>เนื้อหา Card ใหม่</h4>
        <p>นี่คือเนื้อหาของ Card ที่เพิ่มเข้ามาใหม่</p>
        <ul>
          <li>รายการที่ 1</li>
          <li>รายการที่ 2</li>
          <li>รายการที่ 3</li>
        </ul>
      `,
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50,
      width: 250 + Math.random() * 100,
      height: 200 + Math.random() * 100,
      zIndex: this.cards.length + 1,
      locked: false,
      resizable: true,
      draggable: true,
      color: randomColor,
      icon: randomIcon,
      badge: randomBadge,
      badgeColor: randomBadgeColor
    };

    this.cards.push(newCard);
  }

  /**
   * Clear all cards
   */
  clearAllCards(): void {
    this.cards = [];
    this.selectedCard = null;
  }

  /**
   * Reset to sample cards
   */
  resetToSampleCards(): void {
    this.initializeSampleCards();
    this.selectedCard = null;
  }

  /**
   * Lock all cards
   */
  lockAllCards(): void {
    this.cards.forEach(card => {
      card.locked = true;
    });
  }

  /**
   * Unlock all cards
   */
  unlockAllCards(): void {
    this.cards.forEach(card => {
      card.locked = false;
    });
  }

  /**
   * Get cards statistics
   */
  getCardsStats(): any {
    return {
      totalCards: this.cards.length,
      lockedCards: this.cards.filter(card => card.locked).length,
      unlockedCards: this.cards.filter(card => !card.locked).length,
      resizableCards: this.cards.filter(card => card.resizable).length,
      draggableCards: this.cards.filter(card => card.draggable).length,
      cardsWithIcons: this.cards.filter(card => card.icon).length,
      cardsWithBadges: this.cards.filter(card => card.badge).length,
      selectedCard: this.selectedCard ? this.selectedCard.title : 'ไม่มี'
    };
  }

  /**
   * Export cards data
   */
  exportCardsData(): void {
    const data = {
      cards: this.cards,
      config: this.config,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `draggable-cards-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import cards data
   */
  importCardsData(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.cards) {
          this.cards = data.cards;
          this.selectedCard = null;
        }
        if (data.config) {
          this.config = { ...this.config, ...data.config };
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
      }
    };
    reader.readAsText(file);
  }
}

