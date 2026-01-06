/**
 * Rating Demo Component
 *
 * Demo component showcasing rating component with different configurations and display modes.
 * Demonstrates star ratings, custom icons, sizes, and interactive rating features.
 *
 * @example
 * ```html
 * <app-rating-demo></app-rating-demo>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { RatingComponent, RatingConfig } from '../../../shared/components/rating/rating.component';
import { I18nService } from '../../../core/services/i18n.service';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

/**
 * Product interface
 */
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
}

interface Review {
  id: number;
  productId: number;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  date: Date;
  helpful: number;
  verified: boolean;
}

@Component({
  selector: 'app-rating-demo',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    RatingComponent,
    ImageOptimizationDirective
  ],
  templateUrl: './rating-demo.component.html',
  styleUrl: './rating-demo.component.scss'
})
export class RatingDemoComponent implements OnInit {
  // Demo data
  products = signal<Product[]>([
    {
      id: 1,
      name: 'Smart Security Camera',
      description: 'AI-powered security camera with night vision',
      price: 299.99,
      rating: 4.5,
      reviewCount: 128,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop',
      category: 'Security'
    },
    {
      id: 2,
      name: 'Video Analytics Software',
      description: 'Advanced video analytics with face recognition',
      price: 599.99,
      rating: 4.8,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop',
      category: 'Software'
    },
    {
      id: 3,
      name: 'Access Control System',
      description: 'Biometric access control with mobile app',
      price: 1299.99,
      rating: 4.2,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f2f0?w=300&h=200&fit=crop',
      category: 'Access Control'
    }
  ]);

  reviews = signal<Review[]>([
    {
      id: 1,
      productId: 1,
      userName: 'John Smith',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rating: 5,
      title: 'Excellent quality and features',
      comment: 'The camera quality is amazing and the AI features work perfectly. Highly recommended!',
      date: new Date('2024-01-15'),
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      productId: 1,
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      rating: 4,
      title: 'Good value for money',
      comment: 'Works well for home security. Setup was easy and the app is user-friendly.',
      date: new Date('2024-01-10'),
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      productId: 2,
      userName: 'Mike Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      rating: 5,
      title: 'Powerful analytics',
      comment: 'The face recognition is incredibly accurate and the reporting features are comprehensive.',
      date: new Date('2024-01-08'),
      helpful: 15,
      verified: true
    }
  ]);

  // Rating configurations
  basicRatingConfig: RatingConfig = {
    max: 5,
    readOnly: false,
    showText: true,
    showCancel: true,
    cancelText: 'Clear',
    clearable: true,
    theme: 'stars',
    size: 'medium',
    color: '#fbbf24',
    emptyColor: '#d1d5db',
    textPosition: 'right',
    animation: true,
    animationDuration: 300
  };

  heartRatingConfig: RatingConfig = {
    max: 5,
    readOnly: false,
    showText: true,
    showCancel: true,
    cancelText: 'Clear',
    clearable: true,
    theme: 'hearts',
    size: 'large',
    color: '#ef4444',
    emptyColor: '#d1d5db',
    textPosition: 'bottom',
    animation: true,
    animationDuration: 300
  };

  smileyRatingConfig: RatingConfig = {
    max: 5,
    readOnly: false,
    showText: true,
    showCancel: true,
    cancelText: 'Clear',
    clearable: true,
    theme: 'smiley',
    size: 'large',
    color: '#fbbf24',
    emptyColor: '#d1d5db',
    textPosition: 'bottom',
    animation: true,
    animationDuration: 300
  };

  thumbsRatingConfig: RatingConfig = {
    max: 5,
    readOnly: false,
    showText: true,
    showCancel: true,
    cancelText: 'Clear',
    clearable: true,
    theme: 'thumbs',
    size: 'large',
    color: '#10b981',
    emptyColor: '#d1d5db',
    textPosition: 'bottom',
    animation: true,
    animationDuration: 300
  };

  // Demo ratings
  basicRating = signal<number>(0);
  heartRating = signal<number>(0);
  smileyRating = signal<number>(0);
  thumbsRating = signal<number>(0);
  productRating = signal<number>(0);
  reviewRating = signal<number>(0);

  // Stats
  ratingStats = signal({
    average: 4.3,
    total: 262,
    distribution: [
      { rating: 5, count: 120, percentage: 45.8 },
      { rating: 4, count: 89, percentage: 34.0 },
      { rating: 3, count: 35, percentage: 13.4 },
      { rating: 2, count: 12, percentage: 4.6 },
      { rating: 1, count: 6, percentage: 2.3 }
    ]
  });

  // Form data
  newReview = signal({
    userName: '',
    rating: 0,
    title: '',
    comment: ''
  });

  constructor(private i18n: I18nService) {}

  ngOnInit(): void {
    // Initialize with some demo ratings
    this.basicRating.set(4);
    this.heartRating.set(5);
    this.smileyRating.set(3);
    this.thumbsRating.set(4);
  }

  onRatingChange(rating: number, type: string) {
    console.log(`${type} rating changed to:`, rating);

    switch (type) {
      case 'basic':
        this.basicRating.set(rating);
        break;
      case 'heart':
        this.heartRating.set(rating);
        break;
      case 'smiley':
        this.smileyRating.set(rating);
        break;
      case 'thumbs':
        this.thumbsRating.set(rating);
        break;
      case 'product':
        this.productRating.set(rating);
        break;
      case 'review':
        this.reviewRating.set(rating);
        break;
    }
  }

  onRatingHover(rating: number, type: string) {
    console.log(`${type} rating hover:`, rating);
  }

  onRatingLeave(type: string) {
    console.log(`${type} rating leave`);
  }

  onRatingSelect(rating: number, type: string) {
    console.log(`${type} rating selected:`, rating);
  }

  onRatingClear(type: string) {
    console.log(`${type} rating cleared`);

    switch (type) {
      case 'basic':
        this.basicRating.set(0);
        break;
      case 'heart':
        this.heartRating.set(0);
        break;
      case 'smiley':
        this.smileyRating.set(0);
        break;
      case 'thumbs':
        this.thumbsRating.set(0);
        break;
      case 'product':
        this.productRating.set(0);
        break;
      case 'review':
        this.reviewRating.set(0);
        break;
    }
  }

  submitReview() {
    if (this.newReview().rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!this.newReview().userName || !this.newReview().title || !this.newReview().comment) {
      alert('Please fill in all fields');
      return;
    }

    const review: Review = {
      id: this.reviews().length + 1,
      productId: 1, // Default to first product
      userName: this.newReview().userName,
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      rating: this.newReview().rating,
      title: this.newReview().title,
      comment: this.newReview().comment,
      date: new Date(),
      helpful: 0,
      verified: false
    };

    this.reviews.update(reviews => [...reviews, review]);

    // Reset form
    this.newReview.set({
      userName: '',
      rating: 0,
      title: '',
      comment: ''
    });

    alert('Review submitted successfully!');
  }

  markHelpful(reviewId: number) {
    this.reviews.update(reviews =>
      reviews.map(review =>
        review.id === reviewId
          ? { ...review, helpful: review.helpful + 1 }
          : review
      )
    );
  }

  getProductRating(productId: number): number {
    const productReviews = this.reviews().filter(r => r.productId === productId);
    if (productReviews.length === 0) return 0;

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / productReviews.length;
  }

  getProductReviewCount(productId: number): number {
    return this.reviews().filter(r => r.productId === productId).length;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}


