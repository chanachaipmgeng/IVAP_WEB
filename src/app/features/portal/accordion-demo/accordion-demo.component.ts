/**
 * Accordion Demo Component
 *
 * Demo component showcasing accordion component features including variants, sizes, and configurations.
 * Demonstrates FAQ-style accordion usage and customization options.
 *
 * @example
 * ```html
 * <app-accordion-demo></app-accordion-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionComponent, AccordionItem, AccordionConfig } from '../../../shared/components/accordion/accordion.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-accordion-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './accordion-demo.component.html',
  styleUrls: ['./accordion-demo.component.scss']
})
export class AccordionDemoComponent implements OnInit {
  // Accordion items
  accordionItems: AccordionItem[] = [];

  // Accordion configuration
  accordionConfig: Partial<AccordionConfig> = {
    allowMultiple: false,
    animation: true,
    animationDuration: 300,
    iconPosition: 'right',
    showIcons: true,
    variant: 'default',
    size: 'md'
  };

  // Demo settings
  selectedVariant: 'default' | 'bordered' | 'flush' | 'minimal' = 'default';
  selectedSize: 'sm' | 'md' | 'lg' = 'md';
  allowMultiple: boolean = false;
  showIcons: boolean = true;
  iconPosition: 'left' | 'right' = 'right';
  animation: boolean = true;

  // Sample data
  faqItems: AccordionItem[] = [
    {
      id: 'faq-1',
      title: 'ระบบจดจำใบหน้าทำงานอย่างไร?',
      content: 'ระบบใช้เทคโนโลยี AI และ Computer Vision ในการวิเคราะห์ใบหน้า โดยใช้ face-api.js และ TensorFlow.js เพื่อจดจำใบหน้าและประเมินคุณภาพภาพ',
      isOpen: false,
      icon: 'fas fa-question-circle',
      badge: 'สำคัญ',
      badgeColor: 'info'
    },
    {
      id: 'faq-2',
      title: 'ข้อมูลใบหน้าปลอดภัยหรือไม่?',
      content: 'ข้อมูลใบหน้าถูกเข้ารหัสและเก็บไว้ในระบบอย่างปลอดภัย เราใช้มาตรฐานความปลอดภัยระดับสูงและไม่มีการแชร์ข้อมูลกับบุคคลที่สาม',
      isOpen: false,
      icon: 'fas fa-shield-alt',
      badge: 'ความปลอดภัย',
      badgeColor: 'success'
    },
    {
      id: 'faq-3',
      title: 'สามารถใช้ระบบบนมือถือได้หรือไม่?',
      content: 'ได้ ระบบรองรับการใช้งานบนมือถือผ่านแอปพลิเคชันและเว็บเบราว์เซอร์ เราได้ออกแบบให้ใช้งานง่ายและมีประสิทธิภาพบนอุปกรณ์ทุกขนาด',
      isOpen: false,
      icon: 'fas fa-mobile-alt',
      badge: 'มือถือ',
      badgeColor: 'warning'
    },
    {
      id: 'faq-4',
      title: 'ระบบจะแจ้งเตือนเมื่อไหร่?',
      content: 'ระบบจะแจ้งเตือนเมื่อมีเหตุการณ์สำคัญ เช่น การลงเวลา การเข้าถึงระบบ การแจ้งเตือนความปลอดภัย และการอัปเดตระบบ',
      isOpen: false,
      icon: 'fas fa-bell',
      badge: 'การแจ้งเตือน',
      badgeColor: 'danger'
    }
  ];

  helpItems: AccordionItem[] = [
    {
      id: 'help-1',
      title: 'วิธีการลงทะเบียนใบหน้า',
      content: `
        <ol>
          <li>ไปที่เมนู "จดจำใบหน้า"</li>
          <li>คลิก "ลงทะเบียนใบหน้า"</li>
          <li>ยืนหน้าในกรอบกล้อง</li>
          <li>รอให้ระบบประมวลผล</li>
          <li>คลิก "บันทึก"</li>
        </ol>
        <p><strong>หมายเหตุ:</strong> ควรใช้ในที่ที่มีแสงสว่างเพียงพอ</p>
      `,
      isOpen: false,
      icon: 'fas fa-user-plus',
      badge: 'ขั้นตอน',
      badgeColor: 'info'
    },
    {
      id: 'help-2',
      title: 'วิธีการแก้ไขข้อมูลพนักงาน',
      content: `
        <ol>
          <li>ไปที่เมนู "พนักงาน"</li>
          <li>คลิกที่ชื่อพนักงานที่ต้องการแก้ไข</li>
          <li>แก้ไขข้อมูลตามต้องการ</li>
          <li>คลิก "บันทึก"</li>
        </ol>
        <p><strong>หมายเหตุ:</strong> ข้อมูลจะถูกอัปเดตทันที</p>
      `,
      isOpen: false,
      icon: 'fas fa-edit',
      badge: 'แก้ไข',
      badgeColor: 'warning'
    },
    {
      id: 'help-3',
      title: 'วิธีการดูรายงาน',
      content: `
        <ol>
          <li>ไปที่เมนู "รายงาน"</li>
          <li>เลือกประเภทรายงาน</li>
          <li>เลือกช่วงวันที่</li>
          <li>คลิก "สร้างรายงาน"</li>
          <li>ดาวน์โหลดหรือพิมพ์รายงาน</li>
        </ol>
        <p><strong>หมายเหตุ:</strong> รายงานจะแสดงข้อมูลตามช่วงเวลาที่เลือก</p>
      `,
      isOpen: false,
      icon: 'fas fa-chart-bar',
      badge: 'รายงาน',
      badgeColor: 'success'
    }
  ];

  featureItems: AccordionItem[] = [
    {
      id: 'feature-1',
      title: 'Face Recognition System',
      content: 'ระบบจดจำใบหน้าขั้นสูงที่ใช้ AI และ Computer Vision เพื่อการจดจำใบหน้าที่แม่นยำและรวดเร็ว',
      isOpen: false,
      icon: 'fas fa-user-check',
      badge: 'AI',
      badgeColor: 'info'
    },
    {
      id: 'feature-2',
      title: 'Real-time Analytics',
      content: 'การวิเคราะห์ข้อมูลแบบเรียลไทม์เพื่อติดตามและประเมินผลการทำงานของระบบ',
      isOpen: false,
      icon: 'fas fa-chart-line',
      badge: 'Real-time',
      badgeColor: 'success'
    },
    {
      id: 'feature-3',
      title: 'Mobile Support',
      content: 'รองรับการใช้งานบนอุปกรณ์มือถือผ่านแอปพลิเคชันและเว็บเบราว์เซอร์',
      isOpen: false,
      icon: 'fas fa-mobile-alt',
      badge: 'Mobile',
      badgeColor: 'warning'
    },
    {
      id: 'feature-4',
      title: 'Security Features',
      content: 'ระบบรักษาความปลอดภัยหลายชั้นเพื่อปกป้องข้อมูลและระบบ',
      isOpen: false,
      icon: 'fas fa-shield-alt',
      badge: 'Security',
      badgeColor: 'danger'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    this.accordionItems = [...this.faqItems];
    this.updateConfig();
  }

  /**
   * Update accordion configuration
   */
  updateConfig(): void {
    this.accordionConfig = {
      allowMultiple: this.allowMultiple,
      animation: this.animation,
      animationDuration: 300,
      iconPosition: this.iconPosition,
      showIcons: this.showIcons,
      variant: this.selectedVariant,
      size: this.selectedSize
    };
  }

  /**
   * Handle accordion item toggle
   */
  onItemToggle(item: AccordionItem): void {
    console.log('Item toggled:', item);
  }

  /**
   * Handle accordion item click
   */
  onItemClick(item: AccordionItem): void {
    console.log('Item clicked:', item);
  }

  /**
   * Load FAQ items
   */
  loadFAQItems(): void {
    this.accordionItems = [...this.faqItems];
  }

  /**
   * Load Help items
   */
  loadHelpItems(): void {
    this.accordionItems = [...this.helpItems];
  }

  /**
   * Load Feature items
   */
  loadFeatureItems(): void {
    this.accordionItems = [...this.featureItems];
  }

  /**
   * Get accordion statistics
   */
  getAccordionStats(): any {
    return {
      totalItems: this.accordionItems.length,
      openItems: this.accordionItems.filter(item => item.isOpen).length,
      closedItems: this.accordionItems.filter(item => !item.isOpen).length,
      disabledItems: this.accordionItems.filter(item => item.disabled).length,
      itemsWithBadges: this.accordionItems.filter(item => item.badge).length,
      itemsWithIcons: this.accordionItems.filter(item => item.icon).length
    };
  }

  /**
   * Toggle all items
   */
  toggleAllItems(): void {
    const hasOpenItems = this.accordionItems.some(item => item.isOpen);
    this.accordionItems.forEach(item => {
      item.isOpen = !hasOpenItems;
    });
  }

  /**
   * Reset all items
   */
  resetAllItems(): void {
    this.accordionItems.forEach(item => {
      item.isOpen = false;
    });
  }

  /**
   * Add new item
   */
  addNewItem(): void {
    const newItem: AccordionItem = {
      id: `item-${Date.now()}`,
      title: 'รายการใหม่',
      content: 'เนื้อหาของรายการใหม่',
      isOpen: false,
      icon: 'fas fa-plus-circle',
      badge: 'ใหม่',
      badgeColor: 'info'
    };
    this.accordionItems.push(newItem);
  }

  /**
   * Remove last item
   */
  removeLastItem(): void {
    if (this.accordionItems.length > 0) {
      this.accordionItems.pop();
    }
  }
}

