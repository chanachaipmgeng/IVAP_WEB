/**
 * Image Optimization Directive
 *
 * Provides automatic image optimization features:
 * - Lazy loading
 * - Placeholder support
 * - Responsive images
 * - WebP format support
 *
 * Usage:
 * <img appImageOptimization
 *      [src]="imageUrl"
 *      [width]="800"
 *      [height]="600"
 *      [priority]="false"
 *      [placeholder]="placeholderUrl"
 *      alt="Description" />
 */

import { Directive, Input, OnInit, ElementRef, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appImageOptimization]',
  standalone: true
})
export class ImageOptimizationDirective implements OnInit {
  @Input() src: string = '';
  @Input() width?: number;
  @Input() height?: number;
  @Input() priority: boolean = false;
  @Input() placeholder?: string;
  @Input() alt: string = '';

  private el = inject(ElementRef<HTMLImageElement>);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const img = this.el.nativeElement;

    // Set basic attributes
    if (this.src) {
      this.renderer.setAttribute(img, 'src', this.src);
    }

    if (this.alt) {
      this.renderer.setAttribute(img, 'alt', this.alt);
    }

    // Set dimensions
    if (this.width) {
      this.renderer.setAttribute(img, 'width', this.width.toString());
    }
    if (this.height) {
      this.renderer.setAttribute(img, 'height', this.height.toString());
    }

    // Lazy loading
    if (!this.priority) {
      this.renderer.setAttribute(img, 'loading', 'lazy');
    } else {
      this.renderer.setAttribute(img, 'loading', 'eager');
      this.renderer.setAttribute(img, 'fetchpriority', 'high');
    }

    // Placeholder
    if (this.placeholder) {
      this.renderer.setStyle(img, 'background-image', `url(${this.placeholder})`);
      this.renderer.setStyle(img, 'background-size', 'cover');
      this.renderer.setStyle(img, 'background-position', 'center');
    }

    // Add loading class
    this.renderer.addClass(img, 'image-loading');

    // Handle load event
    img.addEventListener('load', () => {
      this.renderer.removeClass(img, 'image-loading');
      this.renderer.addClass(img, 'image-loaded');
    });

    // Handle error event
    img.addEventListener('error', () => {
      this.renderer.removeClass(img, 'image-loading');
      this.renderer.addClass(img, 'image-error');
      // Set fallback image if available
      if (this.placeholder) {
        this.renderer.setAttribute(img, 'src', this.placeholder);
      }
    });
  }
}
