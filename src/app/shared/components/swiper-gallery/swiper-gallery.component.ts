/**
 * Swiper Gallery Component
 *
 * A gallery component using Swiper.js for displaying images, videos, and custom content in a carousel.
 * Supports multiple effects, navigation, pagination, autoplay, thumbs, and zoom.
 *
 * @example
 * ```html
 * <app-swiper-gallery
 *   [slides]="gallerySlides"
 *   [config]="swiperConfig"
 *   [height]="'500px'"
 *   (slideChange)="onSlideChange($event)">
 * </app-swiper-gallery>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Swiper } from 'swiper';
import type { SwiperOptions } from 'swiper/types';
import { Navigation, Pagination, Autoplay, Thumbs, Zoom, EffectFade, EffectCube, EffectFlip, EffectCoverflow, EffectCards } from 'swiper/modules';

import { ImageOptimizationDirective } from '../../directives/image-optimization.directive';

/**
 * Swiper slide interface
 */
export interface SwiperSlide {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  video?: string;
  type: 'image' | 'video' | 'content';
  data?: any;
}

/**
 * Swiper gallery configuration interface
 */
export interface SwiperGalleryConfig {
  // Basic settings
  slidesPerView: number | 'auto';
  spaceBetween: number;
  direction: 'horizontal' | 'vertical';
  loop: boolean;
  centeredSlides: boolean;
  grabCursor: boolean;

  // Navigation
  navigation: boolean;
  navigationPrevEl?: string;
  navigationNextEl?: string;

  // Pagination
  pagination: boolean;
  paginationType: 'bullets' | 'fraction' | 'progressbar' | 'custom';
  paginationClickable: boolean;

  // Autoplay
  autoplay: boolean;
  autoplayDelay: number;
  autoplayPauseOnMouseEnter: boolean;

  // Effects
  effect: 'slide' | 'fade' | 'cube' | 'flip' | 'coverflow' | 'cards';
  fadeEffect?: {
    crossFade: boolean;
  };
  cubeEffect?: {
    shadow: boolean;
    slideShadows: boolean;
    shadowOffset: number;
    shadowScale: number;
  };
  flipEffect?: {
    slideShadows: boolean;
    limitRotation: boolean;
  };
  coverflowEffect?: {
    rotate: number;
    stretch: number;
    depth: number;
    modifier: number;
    slideShadows: boolean;
  };
  cardsEffect?: {
    perSlideOffset: number;
    perSlideRotate: number;
    rotateOnSwipe: boolean;
    transformEl: string;
  };

  // Thumbs
  thumbs: boolean;
  thumbsSwiper?: Swiper;

  // Zoom
  zoom: boolean;
  zoomMaxRatio: number;
  zoomMinRatio: number;

  // Responsive
  breakpoints: { [key: number]: SwiperOptions };

  // Other
  speed: number;
  freeMode: boolean;
  freeModeSticky: boolean;
  watchSlidesProgress: boolean;
  watchSlidesVisibility: boolean;
  preloadImages: boolean;
  lazy: boolean;
  keyboard: boolean;
  mousewheel: boolean;
  hashNavigation: boolean;
  history: boolean;
  a11y: boolean;
}

@Component({
  selector: 'app-swiper-gallery',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ImageOptimizationDirective
  ],
  templateUrl: './swiper-gallery.component.html',
  styleUrls: ['./swiper-gallery.component.scss']
})
export class SwiperGalleryComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Swiper container element reference
   */
  @ViewChild('swiperContainer', { static: false }) swiperContainer!: ElementRef;

  /**
   * Gallery slides
   */
  @Input() slides: SwiperSlide[] = [];

  /**
   * Gallery configuration
   */
  @Input() config: Partial<SwiperGalleryConfig> = {};

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Gallery height
   */
  @Input() height: string = '400px';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Slide change event
   */
  @Output() slideChange = new EventEmitter<{ activeIndex: number; slide: SwiperSlide }>();

  /**
   * Slide click event
   */
  @Output() slideClick = new EventEmitter<{ index: number; slide: SwiperSlide }>();

  /**
   * Gallery ready event
   */
  @Output() galleryReady = new EventEmitter<Swiper>();

  // Default configuration
  defaultConfig: SwiperGalleryConfig = {
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
    breakpoints: {
      640: { slidesPerView: 2, spaceBetween: 20 },
      768: { slidesPerView: 3, spaceBetween: 30 },
      1024: { slidesPerView: 4, spaceBetween: 40 }
    },
    speed: 300,
    freeMode: false,
    freeModeSticky: false,
    watchSlidesProgress: false,
    watchSlidesVisibility: false,
    preloadImages: true,
    lazy: false,
    keyboard: true,
    mousewheel: false,
    hashNavigation: false,
    history: false,
    a11y: true
  };

  // Component state
  swiper: Swiper | null = null;
  currentSlide: SwiperSlide | null = null;
  isInitialized: boolean = false;

  constructor() {}

  ngOnInit(): void {
    // Initialize Swiper modules
    Swiper.use([
      Navigation,
      Pagination,
      Autoplay,
      Thumbs,
      Zoom,
      EffectFade,
      EffectCube,
      EffectFlip,
      EffectCoverflow,
      EffectCards
    ]);
  }

  ngAfterViewInit(): void {
    if (this.slides.length > 0) {
      this.initializeSwiper();
    }
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): SwiperGalleryConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Initialize Swiper
   */
  private initializeSwiper(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }

    const config = this.mergedConfig;
    const swiperConfig: SwiperOptions = {
      modules: [Navigation, Pagination, Autoplay, Thumbs, Zoom, EffectFade, EffectCube, EffectFlip, EffectCoverflow, EffectCards],

      // Basic settings
      slidesPerView: config.slidesPerView,
      spaceBetween: config.spaceBetween,
      direction: config.direction,
      loop: config.loop,
      centeredSlides: config.centeredSlides,
      grabCursor: config.grabCursor,

      // Navigation
      navigation: config.navigation ? {
        prevEl: config.navigationPrevEl || '.swiper-button-prev',
        nextEl: config.navigationNextEl || '.swiper-button-next'
      } : false,

      // Pagination
      pagination: config.pagination ? {
        el: '.swiper-pagination',
        type: config.paginationType,
        clickable: config.paginationClickable
      } : false,

      // Autoplay
      autoplay: config.autoplay ? {
        delay: config.autoplayDelay,
        pauseOnMouseEnter: config.autoplayPauseOnMouseEnter,
        disableOnInteraction: false
      } : false,

      // Effects
      effect: config.effect,
      fadeEffect: config.fadeEffect,
      cubeEffect: config.cubeEffect,
      flipEffect: config.flipEffect,
      coverflowEffect: config.coverflowEffect,
      cardsEffect: config.cardsEffect,

      // Thumbs
      thumbs: config.thumbs ? {
        swiper: config.thumbsSwiper
      } : undefined,

      // Zoom
      zoom: config.zoom ? {
        maxRatio: config.zoomMaxRatio,
        minRatio: config.zoomMinRatio
      } : false,

      // Responsive
      breakpoints: config.breakpoints,

      // Other
      speed: config.speed,
      freeMode: config.freeMode ? {
        enabled: true,
        sticky: config.freeModeSticky
      } : false,
      watchSlidesProgress: config.watchSlidesProgress,
      keyboard: config.keyboard,
      mousewheel: config.mousewheel,
      hashNavigation: config.hashNavigation,
      history: config.history,
      a11y: config.a11y ? {
        enabled: true,
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        firstSlideMessage: 'This is the first slide',
        lastSlideMessage: 'This is the last slide'
      } : undefined,

      // Events
      on: {
        init: () => {
          this.isInitialized = true;
          this.galleryReady.emit(this.swiper!);
        },
        slideChange: () => {
          if (this.swiper) {
            const activeIndex = this.swiper.activeIndex;
            const slide = this.slides[activeIndex];
            this.currentSlide = slide;
            this.slideChange.emit({ activeIndex, slide });
          }
        }
      }
    };

    this.swiper = new Swiper(this.swiperContainer.nativeElement, swiperConfig);
  }

  /**
   * Handle slide click
   */
  onSlideClick(index: number, slide: SwiperSlide): void {
    this.slideClick.emit({ index, slide });
  }

  /**
   * Go to slide
   */
  goToSlide(index: number): void {
    if (this.swiper) {
      this.swiper.slideTo(index);
    }
  }

  /**
   * Go to next slide
   */
  nextSlide(): void {
    if (this.swiper) {
      this.swiper.slideNext();
    }
  }

  /**
   * Go to previous slide
   */
  prevSlide(): void {
    if (this.swiper) {
      this.swiper.slidePrev();
    }
  }

  /**
   * Start autoplay
   */
  startAutoplay(): void {
    if (this.swiper) {
      this.swiper.autoplay?.start();
    }
  }

  /**
   * Stop autoplay
   */
  stopAutoplay(): void {
    if (this.swiper) {
      this.swiper.autoplay?.stop();
    }
  }

  /**
   * Toggle autoplay
   */
  toggleAutoplay(): void {
    if (this.swiper) {
      if (this.swiper.autoplay?.running) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
    }
  }

  /**
   * Update slides
   */
  updateSlides(slides: SwiperSlide[]): void {
    this.slides = slides;
    if (this.isInitialized && this.swiper) {
      this.swiper.update();
    } else if (slides.length > 0) {
      this.initializeSwiper();
    }
  }

  /**
   * Get current slide index
   */
  getCurrentSlideIndex(): number {
    return this.swiper ? this.swiper.activeIndex : 0;
  }

  /**
   * Get total slides count
   */
  getTotalSlides(): number {
    return this.slides.length;
  }

  /**
   * Check if swiper is ready
   */
  isSwiperReady(): boolean {
    return this.isInitialized && this.swiper !== null;
  }

  /**
   * Get slide classes
   */
  getSlideClasses(slide: SwiperSlide): string[] {
    const classes = ['swiper-slide'];

    if (slide.type === 'video') {
      classes.push('slide-video');
    } else if (slide.type === 'content') {
      classes.push('slide-content');
    } else {
      classes.push('slide-image');
    }

    return classes;
  }

  /**
   * Get slide styles
   */
  /**
   * Get slide styles
   */
  getSlideStyles(slide: SwiperSlide): Record<string, string> {
    const styles: Record<string, string> = {};

    if (slide.type === 'image' && slide.src) {
      styles['background-image'] = `url(${slide.src})`;
      styles['background-size'] = 'cover';
      styles['background-position'] = 'center';
    }

    return styles;
  }

  /**
   * Track by function for ngFor
   */
  trackBySlideId(index: number, slide: SwiperSlide): string {
    return slide.id;
  }
}
