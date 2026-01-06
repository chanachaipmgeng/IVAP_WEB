/**
 * Swiper Gallery Demo Component
 *
 * Demo component showcasing Swiper gallery component with carousel and slider features.
 * Demonstrates image galleries, navigation controls, and swiper configurations.
 *
 * @example
 * ```html
 * <app-swiper-gallery-demo></app-swiper-gallery-demo>
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SwiperGalleryComponent, SwiperSlide, SwiperGalleryConfig } from '../../../shared/components/swiper-gallery/swiper-gallery.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-swiper-gallery-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SwiperGalleryComponent,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './swiper-gallery-demo.component.html',
  styleUrls: ['./swiper-gallery-demo.component.scss']
})
export class SwiperGalleryDemoComponent implements OnInit {
  // Gallery slides
  slides: SwiperSlide[] = [];

  // Configuration
  config: Partial<SwiperGalleryConfig> = {
    slidesPerView: 1,
    spaceBetween: 30,
    direction: 'horizontal',
    loop: false,
    centeredSlides: false,
    grabCursor: true,
    navigation: true,
    pagination: true,
    paginationType: 'bullets',
    paginationClickable: true,
    autoplay: false,
    autoplayDelay: 3000,
    autoplayPauseOnMouseEnter: true,
    effect: 'slide',
    thumbs: false,
    zoom: false,
    zoomMaxRatio: 3,
    zoomMinRatio: 1,
    speed: 300,
    freeMode: false,
    keyboard: true,
    mousewheel: false,
    a11y: true
  };

  // Demo settings
  selectedEffect: 'slide' | 'fade' | 'cube' | 'flip' | 'coverflow' | 'cards' = 'slide';
  slidesPerView: number = 1;
  spaceBetween: number = 30;
  loop: boolean = false;
  navigation: boolean = true;
  pagination: boolean = true;
  paginationType: 'bullets' | 'fraction' | 'progressbar' = 'bullets';
  autoplay: boolean = false;
  autoplayDelay: number = 3000;
  thumbs: boolean = false;
  zoom: boolean = false;
  height: string = '400px';

  // Statistics
  currentSlideIndex: number = 0;
  totalSlides: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.initializeSampleSlides();
    this.updateConfig();
  }

  /**
   * Initialize sample slides
   */
  private initializeSampleSlides(): void {
    this.slides = [
      {
        id: 'slide-1',
        src: 'https://picsum.photos/800/600?random=1',
        alt: 'ภาพตัวอย่าง 1',
        title: 'ภาพธรรมชาติ',
        description: 'ภาพทิวทัศน์ธรรมชาติที่สวยงาม',
        type: 'image'
      },
      {
        id: 'slide-2',
        src: 'https://picsum.photos/800/600?random=2',
        alt: 'ภาพตัวอย่าง 2',
        title: 'เมืองใหญ่',
        description: 'ภาพเมืองใหญ่ในยามค่ำคืน',
        type: 'image'
      },
      {
        id: 'slide-3',
        src: 'https://picsum.photos/800/600?random=3',
        alt: 'ภาพตัวอย่าง 3',
        title: 'ทะเลสาบ',
        description: 'ภาพทะเลสาบที่เงียบสงบ',
        type: 'image'
      },
      {
        id: 'slide-4',
        src: 'https://picsum.photos/800/600?random=4',
        alt: 'ภาพตัวอย่าง 4',
        title: 'ภูเขา',
        description: 'ภาพภูเขาที่สูงตระหง่าน',
        type: 'image'
      },
      {
        id: 'slide-5',
        src: 'https://picsum.photos/800/600?random=5',
        alt: 'ภาพตัวอย่าง 5',
        title: 'ป่าไม้',
        description: 'ภาพป่าไม้ที่เขียวชอุ่ม',
        type: 'image'
      },
      {
        id: 'slide-6',
        src: 'https://picsum.photos/800/600?random=6',
        alt: 'ภาพตัวอย่าง 6',
        title: 'ทะเล',
        description: 'ภาพทะเลที่กว้างใหญ่',
        type: 'image'
      },
      {
        id: 'slide-7',
        src: 'https://picsum.photos/800/600?random=7',
        alt: 'ภาพตัวอย่าง 7',
        title: 'ท้องฟ้า',
        description: 'ภาพท้องฟ้าที่สวยงาม',
        type: 'image'
      },
      {
        id: 'slide-8',
        src: 'https://picsum.photos/800/600?random=8',
        alt: 'ภาพตัวอย่าง 8',
        title: 'ดอกไม้',
        description: 'ภาพดอกไม้ที่บานสะพรั่ง',
        type: 'image'
      }
    ];

    this.totalSlides = this.slides.length;
  }

  /**
   * Update configuration
   */
  updateConfig(): void {
    this.config = {
      slidesPerView: this.slidesPerView,
      spaceBetween: this.spaceBetween,
      direction: 'horizontal',
      loop: this.loop,
      centeredSlides: false,
      grabCursor: true,
      navigation: this.navigation,
      pagination: this.pagination,
      paginationType: this.paginationType,
      paginationClickable: true,
      autoplay: this.autoplay,
      autoplayDelay: this.autoplayDelay,
      autoplayPauseOnMouseEnter: true,
      effect: this.selectedEffect,
      thumbs: this.thumbs,
      zoom: this.zoom,
      zoomMaxRatio: 3,
      zoomMinRatio: 1,
      breakpoints: {
        640: { slidesPerView: Math.min(2, this.slidesPerView), spaceBetween: 20 },
        768: { slidesPerView: Math.min(3, this.slidesPerView), spaceBetween: 30 },
        1024: { slidesPerView: Math.min(4, this.slidesPerView), spaceBetween: 40 }
      },
      speed: 300,
      freeMode: false,
      keyboard: true,
      mousewheel: false,
      a11y: true
    };
  }

  /**
   * Handle slide change
   */
  onSlideChange(event: { activeIndex: number; slide: SwiperSlide }): void {
    this.currentSlideIndex = event.activeIndex;
    console.log('Slide changed:', event);
  }

  /**
   * Handle slide click
   */
  onSlideClick(event: { index: number; slide: SwiperSlide }): void {
    console.log('Slide clicked:', event);
  }

  /**
   * Handle gallery ready
   */
  onGalleryReady(swiper: any): void {
    console.log('Gallery ready:', swiper);
  }

  /**
   * Load different slide sets
   */
  loadNatureSlides(): void {
    this.slides = [
      {
        id: 'nature-1',
        src: 'https://picsum.photos/800/600?random=10',
        alt: 'ธรรมชาติ 1',
        title: 'ป่าไม้เขียวชอุ่ม',
        description: 'ภาพป่าไม้ที่เขียวชอุ่มในฤดูร้อน',
        type: 'image'
      },
      {
        id: 'nature-2',
        src: 'https://picsum.photos/800/600?random=11',
        alt: 'ธรรมชาติ 2',
        title: 'น้ำตกสวยงาม',
        description: 'ภาพน้ำตกที่ไหลลงมาจากภูเขา',
        type: 'image'
      },
      {
        id: 'nature-3',
        src: 'https://picsum.photos/800/600?random=12',
        alt: 'ธรรมชาติ 3',
        title: 'ทะเลสาบใส',
        description: 'ภาพทะเลสาบที่ใสสะอาด',
        type: 'image'
      }
    ];
    this.totalSlides = this.slides.length;
  }

  loadCitySlides(): void {
    this.slides = [
      {
        id: 'city-1',
        src: 'https://picsum.photos/800/600?random=20',
        alt: 'เมือง 1',
        title: 'ตึกระฟ้า',
        description: 'ภาพตึกระฟ้าในเมืองใหญ่',
        type: 'image'
      },
      {
        id: 'city-2',
        src: 'https://picsum.photos/800/600?random=21',
        alt: 'เมือง 2',
        title: 'ถนนสายหลัก',
        description: 'ภาพถนนสายหลักที่คึกคัก',
        type: 'image'
      },
      {
        id: 'city-3',
        src: 'https://picsum.photos/800/600?random=22',
        alt: 'เมือง 3',
        title: 'สะพานข้ามแม่น้ำ',
        description: 'ภาพสะพานข้ามแม่น้ำที่สวยงาม',
        type: 'image'
      }
    ];
    this.totalSlides = this.slides.length;
  }

  loadMixedSlides(): void {
    this.slides = [
      {
        id: 'mixed-1',
        src: 'https://picsum.photos/800/600?random=30',
        alt: 'ผสม 1',
        title: 'ภาพธรรมชาติ',
        description: 'ภาพธรรมชาติที่สวยงาม',
        type: 'image'
      },
      {
        id: 'mixed-2',
        src: 'https://picsum.photos/800/600?random=31',
        alt: 'ผสม 2',
        title: 'ภาพเมือง',
        description: 'ภาพเมืองที่ทันสมัย',
        type: 'image'
      },
      {
        id: 'mixed-3',
        src: 'https://picsum.photos/800/600?random=32',
        alt: 'ผสม 3',
        title: 'ภาพศิลปะ',
        description: 'ภาพศิลปะที่สร้างสรรค์',
        type: 'image'
      },
      {
        id: 'mixed-4',
        src: 'https://picsum.photos/800/600?random=33',
        alt: 'ผสม 4',
        title: 'ภาพเทคโนโลยี',
        description: 'ภาพเทคโนโลยีที่ล้ำสมัย',
        type: 'image'
      }
    ];
    this.totalSlides = this.slides.length;
  }

  /**
   * Add new slide
   */
  addNewSlide(): void {
    const newSlide: SwiperSlide = {
      id: `slide-${Date.now()}`,
      src: `https://picsum.photos/800/600?random=${Date.now()}`,
      alt: `ภาพใหม่ ${this.slides.length + 1}`,
      title: `ภาพใหม่ ${this.slides.length + 1}`,
      description: 'ภาพที่เพิ่มเข้ามาใหม่',
      type: 'image'
    };

    this.slides.push(newSlide);
    this.totalSlides = this.slides.length;
  }

  /**
   * Remove last slide
   */
  removeLastSlide(): void {
    if (this.slides.length > 0) {
      this.slides.pop();
      this.totalSlides = this.slides.length;
    }
  }

  /**
   * Clear all slides
   */
  clearAllSlides(): void {
    this.slides = [];
    this.totalSlides = 0;
    this.currentSlideIndex = 0;
  }

  /**
   * Get gallery statistics
   */
  getGalleryStats(): any {
    return {
      totalSlides: this.totalSlides,
      currentSlide: this.currentSlideIndex + 1,
      imageSlides: this.slides.filter(slide => slide.type === 'image').length,
      videoSlides: this.slides.filter(slide => slide.type === 'video').length,
      contentSlides: this.slides.filter(slide => slide.type === 'content').length,
      slidesWithTitles: this.slides.filter(slide => slide.title).length,
      slidesWithDescriptions: this.slides.filter(slide => slide.description).length,
      effect: this.selectedEffect,
      autoplay: this.autoplay,
      navigation: this.navigation,
      pagination: this.pagination
    };
  }

  /**
   * Get effect options
   */
  getEffectOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'slide', label: 'Slide' },
      { value: 'fade', label: 'Fade' },
      { value: 'cube', label: 'Cube' },
      { value: 'flip', label: 'Flip' },
      { value: 'coverflow', label: 'Coverflow' },
      { value: 'cards', label: 'Cards' }
    ];
  }

  /**
   * Get pagination type options
   */
  getPaginationTypeOptions(): Array<{value: string, label: string}> {
    return [
      { value: 'bullets', label: 'Bullets' },
      { value: 'fraction', label: 'Fraction' },
      { value: 'progressbar', label: 'Progress Bar' }
    ];
  }
}
