/**
 * Gallery Demo Component
 *
 * Demo component showcasing gallery component with image display, filtering, sorting, and lightbox features.
 * Demonstrates gallery item management, categories, tags, and metadata handling.
 *
 * @example
 * ```html
 * <app-gallery-demo></app-gallery-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryComponent, GalleryItem, GalleryConfig, GalleryFilter, GallerySort, GalleryAction } from '../../../shared/components/gallery/gallery.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-gallery-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GalleryComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './gallery-demo.component.html',
  styleUrls: ['./gallery-demo.component.scss']
})
export class GalleryDemoComponent implements OnInit {
  // Sample gallery items
  sampleItems: GalleryItem[] = [
    {
      id: '1',
      src: 'https://picsum.photos/400/300?random=1',
      thumbnail: 'https://picsum.photos/200/150?random=1',
      alt: 'Beautiful Landscape',
      title: 'ภูเขาและทะเล',
      description: 'ทิวทัศน์ภูเขาและทะเลที่สวยงาม',
      category: 'landscape',
      tags: ['ภูเขา', 'ทะเล', 'ธรรมชาติ'],
      metadata: {
        width: 400,
        height: 300,
        size: 245760,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-20'),
        uploadedBy: 'admin'
      },
      isFavorite: true,
      isPrivate: false
    },
    {
      id: '2',
      src: 'https://picsum.photos/400/300?random=2',
      thumbnail: 'https://picsum.photos/200/150?random=2',
      alt: 'City Skyline',
      title: 'ตึกระฟ้าในเมือง',
      description: 'ภาพตึกระฟ้าในยามเย็น',
      category: 'urban',
      tags: ['เมือง', 'ตึก', 'ยามเย็น'],
      metadata: {
        width: 400,
        height: 300,
        size: 198432,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-19'),
        uploadedBy: 'user1'
      },
      isFavorite: false,
      isPrivate: false
    },
    {
      id: '3',
      src: 'https://picsum.photos/400/300?random=3',
      thumbnail: 'https://picsum.photos/200/150?random=3',
      alt: 'Forest Path',
      title: 'เส้นทางในป่า',
      description: 'เส้นทางเดินในป่าที่ร่มรื่น',
      category: 'nature',
      tags: ['ป่า', 'เส้นทาง', 'ต้นไม้'],
      metadata: {
        width: 400,
        height: 300,
        size: 312456,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-18'),
        uploadedBy: 'user2'
      },
      isFavorite: true,
      isPrivate: true
    },
    {
      id: '4',
      src: 'https://picsum.photos/400/300?random=4',
      thumbnail: 'https://picsum.photos/200/150?random=4',
      alt: 'Ocean Waves',
      title: 'คลื่นทะเล',
      description: 'คลื่นทะเลที่สวยงามในยามเช้า',
      category: 'ocean',
      tags: ['ทะเล', 'คลื่น', 'ยามเช้า'],
      metadata: {
        width: 400,
        height: 300,
        size: 267890,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-17'),
        uploadedBy: 'admin'
      },
      isFavorite: false,
      isPrivate: false
    },
    {
      id: '5',
      src: 'https://picsum.photos/400/300?random=5',
      thumbnail: 'https://picsum.photos/200/150?random=5',
      alt: 'Mountain Peak',
      title: 'ยอดเขา',
      description: 'ยอดเขาที่ปกคลุมด้วยหิมะ',
      category: 'mountain',
      tags: ['ภูเขา', 'หิมะ', 'ยอดเขา'],
      metadata: {
        width: 400,
        height: 300,
        size: 289123,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-16'),
        uploadedBy: 'user3'
      },
      isFavorite: true,
      isPrivate: false
    },
    {
      id: '6',
      src: 'https://picsum.photos/400/300?random=6',
      thumbnail: 'https://picsum.photos/200/150?random=6',
      alt: 'Desert Sunset',
      title: 'พระอาทิตย์ตกในทะเลทราย',
      description: 'พระอาทิตย์ตกที่สวยงามในทะเลทราย',
      category: 'desert',
      tags: ['ทะเลทราย', 'พระอาทิตย์ตก', 'ธรรมชาติ'],
      metadata: {
        width: 400,
        height: 300,
        size: 234567,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-15'),
        uploadedBy: 'user1'
      },
      isFavorite: false,
      isPrivate: false
    },
    {
      id: '7',
      src: 'https://picsum.photos/400/300?random=7',
      thumbnail: 'https://picsum.photos/200/150?random=7',
      alt: 'Flower Garden',
      title: 'สวนดอกไม้',
      description: 'สวนดอกไม้ที่สวยงามหลากสี',
      category: 'garden',
      tags: ['ดอกไม้', 'สวน', 'สีสัน'],
      metadata: {
        width: 400,
        height: 300,
        size: 198765,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-14'),
        uploadedBy: 'user2'
      },
      isFavorite: true,
      isPrivate: false
    },
    {
      id: '8',
      src: 'https://picsum.photos/400/300?random=8',
      thumbnail: 'https://picsum.photos/200/150?random=8',
      alt: 'Lakeside View',
      title: 'ริมทะเลสาบ',
      description: 'ทิวทัศน์ริมทะเลสาบที่เงียบสงบ',
      category: 'lake',
      tags: ['ทะเลสาบ', 'เงียบสงบ', 'ธรรมชาติ'],
      metadata: {
        width: 400,
        height: 300,
        size: 256789,
        type: 'image/jpeg',
        uploadedAt: new Date('2025-10-13'),
        uploadedBy: 'admin'
      },
      isFavorite: false,
      isPrivate: true
    }
  ];

  // Gallery configuration
  config: Partial<GalleryConfig> = {
    layout: 'grid',
    columns: 4,
    gap: 16,
    itemSize: { width: 200, height: 200 },
    showThumbnails: true,
    showTitles: true,
    showDescriptions: false,
    showMetadata: false,
    showActions: true,
    showSearch: true,
    showFilters: true,
    showSorting: true,
    selectable: true,
    multiSelect: true,
    clickable: true,
    draggable: false,
    resizable: false,
    lightbox: true,
    lightboxKeyboard: true,
    lightboxTouch: true,
    lightboxAnimation: true,
    lightboxAnimationDuration: 300,
    lazyLoading: true,
    lazyOffset: 100,
    responsive: true,
    breakpoints: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
    theme: 'auto',
    borderRadius: 8,
    shadow: true,
    hoverEffect: true,
    virtualScrolling: false,
    bufferSize: 10,
    preloadImages: 5
  };

  // Filters
  filters: GalleryFilter[] = [
    {
      key: 'category',
      label: 'หมวดหมู่',
      type: 'select',
      options: [
        { value: '', label: 'ทั้งหมด' },
        { value: 'landscape', label: 'ทิวทัศน์' },
        { value: 'urban', label: 'เมือง' },
        { value: 'nature', label: 'ธรรมชาติ' },
        { value: 'ocean', label: 'มหาสมุทร' },
        { value: 'mountain', label: 'ภูเขา' },
        { value: 'desert', label: 'ทะเลทราย' },
        { value: 'garden', label: 'สวน' },
        { value: 'lake', label: 'ทะเลสาบ' }
      ]
    },
    {
      key: 'isFavorite',
      label: 'รายการโปรด',
      type: 'select',
      options: [
        { value: '', label: 'ทั้งหมด' },
        { value: true, label: 'รายการโปรด' },
        { value: false, label: 'ไม่ใช่รายการโปรด' }
      ]
    },
    {
      key: 'isPrivate',
      label: 'ความเป็นส่วนตัว',
      type: 'select',
      options: [
        { value: '', label: 'ทั้งหมด' },
        { value: true, label: 'ส่วนตัว' },
        { value: false, label: 'สาธารณะ' }
      ]
    }
  ];

  // Sort options
  sorts: GallerySort[] = [
    { key: 'title', label: 'ชื่อ', direction: 'asc' },
    { key: 'metadata.uploadedAt', label: 'วันที่อัปโหลด', direction: 'desc' },
    { key: 'metadata.size', label: 'ขนาดไฟล์', direction: 'asc' }
  ];

  // Actions
  actions: GalleryAction[] = [
    {
      id: 'view',
      label: 'ดู',
      icon: 'fas fa-eye',
      variant: 'info',
      onClick: (item) => this.viewItem(item)
    },
    {
      id: 'download',
      label: 'ดาวน์โหลด',
      icon: 'fas fa-download',
      variant: 'primary',
      onClick: (item) => this.downloadItem(item)
    },
    {
      id: 'favorite',
      label: 'รายการโปรด',
      icon: 'fas fa-heart',
      variant: 'warning',
      onClick: (item) => this.toggleFavorite(item)
    },
    {
      id: 'delete',
      label: 'ลบ',
      icon: 'fas fa-trash',
      variant: 'danger',
      onClick: (item) => this.deleteItem(item)
    }
  ];

  // Demo settings
  selectedLayout: 'grid' | 'masonry' | 'list' | 'carousel' = 'grid';
  selectedColumns: number = 4;
  selectedTheme: 'light' | 'dark' | 'auto' = 'auto';
  showThumbnails: boolean = true;
  showTitles: boolean = true;
  showDescriptions: boolean = false;
  showMetadata: boolean = false;
  showActions: boolean = true;
  showSearch: boolean = true;
  showFilters: boolean = true;
  showSorting: boolean = true;
  selectable: boolean = true;
  multiSelect: boolean = true;
  clickable: boolean = true;
  lightbox: boolean = true;
  lazyLoading: boolean = true;
  responsive: boolean = true;
  shadow: boolean = true;
  hoverEffect: boolean = true;

  // Statistics
  selectedItems: GalleryItem[] = [];
  totalItems: number = 0;
  filteredItems: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.updateConfig();
    this.totalItems = this.sampleItems.length;
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = {
      ...this.config,
      layout: this.selectedLayout,
      columns: this.selectedColumns,
      theme: this.selectedTheme,
      showThumbnails: this.showThumbnails,
      showTitles: this.showTitles,
      showDescriptions: this.showDescriptions,
      showMetadata: this.showMetadata,
      showActions: this.showActions,
      showSearch: this.showSearch,
      showFilters: this.showFilters,
      showSorting: this.showSorting,
      selectable: this.selectable,
      multiSelect: this.multiSelect,
      clickable: this.clickable,
      lightbox: this.lightbox,
      lazyLoading: this.lazyLoading,
      responsive: this.responsive,
      shadow: this.shadow,
      hoverEffect: this.hoverEffect
    };
  }

  /**
   * View item
   */
  viewItem(item: GalleryItem): void {
    console.log('View item:', item);
    alert(`ดูรูปภาพ: ${item.title}`);
  }

  /**
   * Download item
   */
  downloadItem(item: GalleryItem): void {
    console.log('Download item:', item);
    // In a real app, this would trigger a download
    alert(`ดาวน์โหลด: ${item.title}`);
  }

  /**
   * Toggle favorite
   */
  toggleFavorite(item: GalleryItem): void {
    item.isFavorite = !item.isFavorite;
    console.log('Toggle favorite:', item);
  }

  /**
   * Delete item
   */
  deleteItem(item: GalleryItem): void {
    if (confirm(`ต้องการลบรูปภาพ "${item.title}" หรือไม่?`)) {
      const index = this.sampleItems.findIndex(i => i.id === item.id);
      if (index > -1) {
        this.sampleItems.splice(index, 1);
        this.totalItems = this.sampleItems.length;
        console.log('Item deleted:', item);
      }
    }
  }

  /**
   * Handle item click
   */
  onItemClick(item: GalleryItem): void {
    console.log('Item clicked:', item);
  }

  /**
   * Handle item selection
   */
  onItemSelect(items: GalleryItem[]): void {
    this.selectedItems = items;
    console.log('Items selected:', items);
  }

  /**
   * Handle item action
   */
  onItemAction(event: {action: GalleryAction, item: GalleryItem}): void {
    console.log('Item action:', event);
  }

  /**
   * Handle filter change
   */
  onFilterChange(filters: {[key: string]: any}): void {
    console.log('Filters changed:', filters);
  }

  /**
   * Handle sort change
   */
  onSortChange(sort: GallerySort): void {
    console.log('Sort changed:', sort);
  }

  /**
   * Handle lightbox open
   */
  onLightboxOpen(item: GalleryItem): void {
    console.log('Lightbox opened:', item);
  }

  /**
   * Handle lightbox close
   */
  onLightboxClose(): void {
    console.log('Lightbox closed');
  }

  /**
   * Add new item
   */
  addItem(): void {
    const newItem: GalleryItem = {
      id: (this.sampleItems.length + 1).toString(),
      src: `https://picsum.photos/400/300?random=${this.sampleItems.length + 1}`,
      thumbnail: `https://picsum.photos/200/150?random=${this.sampleItems.length + 1}`,
      alt: 'New Image',
      title: `รูปภาพใหม่ ${this.sampleItems.length + 1}`,
      description: 'รูปภาพที่เพิ่มเข้ามาใหม่',
      category: 'nature',
      tags: ['ใหม่', 'ธรรมชาติ'],
      metadata: {
        width: 400,
        height: 300,
        size: 200000,
        type: 'image/jpeg',
        uploadedAt: new Date(),
        uploadedBy: 'current-user'
      },
      isFavorite: false,
      isPrivate: false
    };

    this.sampleItems.push(newItem);
    this.totalItems = this.sampleItems.length;
    console.log('Item added:', newItem);
  }

  /**
   * Clear all items
   */
  clearItems(): void {
    if (confirm('ต้องการลบรูปภาพทั้งหมดหรือไม่?')) {
      this.sampleItems = [];
      this.totalItems = 0;
      this.selectedItems = [];
      console.log('All items cleared');
    }
  }

  /**
   * Load sample items
   */
  loadSampleItems(): void {
    this.sampleItems = [
      {
        id: '1',
        src: 'https://picsum.photos/400/300?random=1',
        thumbnail: 'https://picsum.photos/200/150?random=1',
        alt: 'Beautiful Landscape',
        title: 'ภูเขาและทะเล',
        description: 'ทิวทัศน์ภูเขาและทะเลที่สวยงาม',
        category: 'landscape',
        tags: ['ภูเขา', 'ทะเล', 'ธรรมชาติ'],
        metadata: {
          width: 400,
          height: 300,
          size: 245760,
          type: 'image/jpeg',
          uploadedAt: new Date('2025-10-20'),
          uploadedBy: 'admin'
        },
        isFavorite: true,
        isPrivate: false
      },
      {
        id: '2',
        src: 'https://picsum.photos/400/300?random=2',
        thumbnail: 'https://picsum.photos/200/150?random=2',
        alt: 'City Skyline',
        title: 'ตึกระฟ้าในเมือง',
        description: 'ภาพตึกระฟ้าในยามเย็น',
        category: 'urban',
        tags: ['เมือง', 'ตึก', 'ยามเย็น'],
        metadata: {
          width: 400,
          height: 300,
          size: 198432,
          type: 'image/jpeg',
          uploadedAt: new Date('2025-10-19'),
          uploadedBy: 'user1'
        },
        isFavorite: false,
        isPrivate: false
      }
    ];
    this.totalItems = this.sampleItems.length;
    this.selectedItems = [];
  }

  /**
   * Get layout options
   */
  getLayoutOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'grid', label: 'Grid' },
      { value: 'masonry', label: 'Masonry' },
      { value: 'list', label: 'List' },
      { value: 'carousel', label: 'Carousel' }
    ];
  }

  /**
   * Get theme options
   */
  getThemeOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'auto', label: 'Auto' },
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' }
    ];
  }

  /**
   * Get column options
   */
  getColumnOptions(): Array<{value: number, label: string}> {
    return [
      { value: 1, label: '1 คอลัมน์' },
      { value: 2, label: '2 คอลัมน์' },
      { value: 3, label: '3 คอลัมน์' },
      { value: 4, label: '4 คอลัมน์' },
      { value: 5, label: '5 คอลัมน์' },
      { value: 6, label: '6 คอลัมน์' }
    ];
  }

  /**
   * Get gallery statistics
   */
  getGalleryStats(): any {
    return {
      totalItems: this.totalItems,
      selectedItems: this.selectedItems.length,
      filteredItems: this.filteredItems,
      layout: this.selectedLayout,
      columns: this.selectedColumns,
      theme: this.selectedTheme,
      showThumbnails: this.showThumbnails,
      showTitles: this.showTitles,
      showDescriptions: this.showDescriptions,
      showMetadata: this.showMetadata,
      showActions: this.showActions,
      showSearch: this.showSearch,
      showFilters: this.showFilters,
      showSorting: this.showSorting,
      selectable: this.selectable,
      multiSelect: this.multiSelect,
      clickable: this.clickable,
      lightbox: this.lightbox,
      lazyLoading: this.lazyLoading,
      responsive: this.responsive,
      shadow: this.shadow,
      hoverEffect: this.hoverEffect
    };
  }
}





