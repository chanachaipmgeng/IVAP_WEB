/**
 * FAQ Component
 *
 * A frequently asked questions component with search, filtering, and categorization.
 * Supports helpful/not helpful feedback and category-based navigation.
 *
 * @example
 * ```html
 * <app-faq
 *   [customClass]="'my-faq'"
 *   [ariaLabel]="'Frequently asked questions'">
 * </app-faq>
 * ```
 */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent extends BaseComponent implements OnInit {
  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Search query
   */
  searchQuery: string = '';

  /**
   * Selected category
   */
  selectedCategory: string = 'all';

  /**
   * Selected question ID
   */
  selectedQuestion: string | null = null;

  /**
   * Loading state
   */
  isLoading: boolean = false;

  categories: FaqCategory[] = [
    { id: 'all', name: 'All Questions', icon: '📋', count: 0 },
    { id: 'general', name: 'General', icon: '❓', count: 0 },
    { id: 'account', name: 'Account', icon: '👤', count: 0 },
    { id: 'billing', name: 'Billing', icon: '💳', count: 0 },
    { id: 'technical', name: 'Technical', icon: '🔧', count: 0 },
    { id: 'security', name: 'Security', icon: '🔒', count: 0 },
    { id: 'mobile', name: 'Mobile', icon: '📱', count: 0 }
  ];

  faqItems: FaqItem[] = [
    // General Questions
    {
      id: '1',
      category: 'general',
      question: 'What is this platform?',
      answer: 'This is an intelligent video analytics platform that provides real-time monitoring, AI-powered analysis, and comprehensive reporting for security and business intelligence purposes.',
      tags: ['platform', 'overview', 'features'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2',
      category: 'general',
      question: 'How do I get started?',
      answer: 'To get started, simply create an account, complete the setup wizard, and configure your first camera. Our onboarding process will guide you through each step.',
      tags: ['getting-started', 'onboarding', 'setup'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-01-20')
    },
    {
      id: '3',
      category: 'general',
      question: 'What are the system requirements?',
      answer: 'Minimum requirements: Windows 10/macOS 10.14/Linux Ubuntu 18.04, 4GB RAM, 2GB free disk space. Recommended: 8GB RAM, 10GB free disk space, dedicated GPU for AI processing.',
      tags: ['system-requirements', 'hardware', 'compatibility'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-01-25')
    },

    // Account Questions
    {
      id: '4',
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the "Sign Up" button on the homepage, enter your email address, create a strong password, and verify your email address. You\'ll receive a confirmation email to complete the process.',
      tags: ['account', 'signup', 'registration'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-02-01')
    },
    {
      id: '5',
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your email address, check your email for a reset link, and follow the instructions to create a new password.',
      tags: ['password', 'reset', 'security'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-02-05')
    },
    {
      id: '6',
      category: 'account',
      question: 'How do I update my profile?',
      answer: 'Go to Settings > Profile, update your information, and click Save. You can change your name, email, phone number, and profile picture.',
      tags: ['profile', 'settings', 'update'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-02-10')
    },

    // Billing Questions
    {
      id: '7',
      category: 'billing',
      question: 'What are the pricing plans?',
      answer: 'We offer three plans: Basic ($29/month), Professional ($79/month), and Enterprise ($199/month). Each plan includes different features and usage limits. Contact sales for custom enterprise solutions.',
      tags: ['pricing', 'plans', 'cost'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-02-15')
    },
    {
      id: '8',
      category: 'billing',
      question: 'How do I upgrade my plan?',
      answer: 'Go to Billing > Plans, select your desired plan, and follow the upgrade process. Changes take effect immediately, and you\'ll be prorated for the remaining billing period.',
      tags: ['upgrade', 'billing', 'plans'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-02-20')
    },
    {
      id: '9',
      category: 'billing',
      question: 'How do I cancel my subscription?',
      answer: 'Go to Billing > Subscription, click "Cancel Subscription", and confirm your cancellation. Your access will continue until the end of your current billing period.',
      tags: ['cancel', 'subscription', 'billing'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-02-25')
    },

    // Technical Questions
    {
      id: '10',
      category: 'technical',
      question: 'How do I add a camera?',
      answer: 'Go to Devices > Add Camera, enter your camera\'s IP address or scan for devices, configure the connection settings, and test the connection before saving.',
      tags: ['camera', 'devices', 'setup'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-01')
    },
    {
      id: '11',
      category: 'technical',
      question: 'Why is my camera offline?',
      answer: 'Check your network connection, verify the camera\'s IP address, ensure the camera is powered on, and check if there are any firewall restrictions blocking the connection.',
      tags: ['camera', 'offline', 'troubleshooting'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-05')
    },
    {
      id: '12',
      category: 'technical',
      question: 'How do I export video footage?',
      answer: 'Go to Recordings, select the time range and cameras, choose your export format (MP4, AVI, etc.), and click Export. Large exports may take some time to process.',
      tags: ['export', 'video', 'recordings'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-10')
    },

    // Security Questions
    {
      id: '13',
      category: 'security',
      question: 'Is my data secure?',
      answer: 'Yes, we use end-to-end encryption, secure data centers, regular security audits, and comply with industry standards like GDPR and SOC 2. Your data is never shared with third parties.',
      tags: ['security', 'privacy', 'encryption'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-15')
    },
    {
      id: '14',
      category: 'security',
      question: 'How do I enable two-factor authentication?',
      answer: 'Go to Security > Two-Factor Authentication, scan the QR code with your authenticator app, enter the verification code, and enable 2FA for enhanced security.',
      tags: ['2fa', 'security', 'authentication'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-20')
    },
    {
      id: '15',
      category: 'security',
      question: 'Who can access my cameras?',
      answer: 'Only authorized users with proper permissions can access your cameras. You can manage user access in Settings > Users and set specific permissions for each user.',
      tags: ['access', 'permissions', 'users'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-25')
    },

    // Mobile Questions
    {
      id: '16',
      category: 'mobile',
      question: 'Is there a mobile app?',
      answer: 'Yes, we have mobile apps for iOS and Android. Download from the App Store or Google Play Store. The app provides full access to your cameras and recordings.',
      tags: ['mobile', 'app', 'ios', 'android'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-03-30')
    },
    {
      id: '17',
      category: 'mobile',
      question: 'Can I view live cameras on mobile?',
      answer: 'Yes, you can view live camera feeds, playback recordings, receive push notifications, and control your system remotely through the mobile app.',
      tags: ['mobile', 'live', 'viewing', 'remote'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-04-01')
    },
    {
      id: '18',
      category: 'mobile',
      question: 'How do I enable push notifications?',
      answer: 'Go to Settings > Notifications in the mobile app, enable push notifications, and configure which events you want to be notified about.',
      tags: ['notifications', 'mobile', 'push'],
      helpful: 0,
      notHelpful: 0,
      lastUpdated: new Date('2024-04-05')
    }
  ];

  filteredFaqItems: FaqItem[] = [];

  constructor(private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.updateCategoryCounts();
    this.filterFaqItems();
  }

  updateCategoryCounts(): void {
    this.categories.forEach(category => {
      if (category.id === 'all') {
        category.count = this.faqItems.length;
      } else {
        category.count = this.faqItems.filter(item => item.category === category.id).length;
      }
    });
  }

  filterFaqItems(): void {
    let filtered = [...this.faqItems];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    this.filteredFaqItems = filtered;
  }

  /**
   * Handle search input
   */
  onSearchInput(): void {
    this.filterFaqItems();
  }

  /**
   * Handle category change
   */
  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterFaqItems();
  }

  /**
   * Toggle question
   */
  toggleQuestion(questionId: string): void {
    this.selectedQuestion = this.selectedQuestion === questionId ? null : questionId;
  }

  /**
   * Mark question as helpful
   */
  markAsHelpful(questionId: string): void {
    const item = this.faqItems.find(item => item.id === questionId);
    if (item) {
      item.helpful++;
    }
  }

  /**
   * Mark question as not helpful
   */
  markAsNotHelpful(questionId: string): void {
    const item = this.faqItems.find(item => item.id === questionId);
    if (item) {
      item.notHelpful++;
    }
  }

  /**
   * Navigate to contact support
   */
  contactSupport(): void {
    this.router.navigate(['/support/contact']);
  }

  /**
   * Get category icon
   */
  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.icon || '❓';
  }

  /**
   * TrackBy function for FAQ items
   */
  trackByFaqItem(index: number, item: FaqItem): string {
    return item.id;
  }

  /**
   * TrackBy function for categories
   */
  trackByCategory(index: number, category: FaqCategory): string {
    return category.id;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  }

  getHelpfulnessPercentage(helpful: number, notHelpful: number): number {
    const total = helpful + notHelpful;
    return total > 0 ? Math.round((helpful / total) * 100) : 0;
  }

  isQuestionSelected(questionId: string): boolean {
    return this.selectedQuestion === questionId;
  }

  getFilteredCount(): number {
    return this.filteredFaqItems.length;
  }

  hasSearchResults(): boolean {
    return this.filteredFaqItems.length > 0;
  }

  getSearchMessage(): string {
    if (this.searchQuery.trim() && this.filteredFaqItems.length === 0) {
      return `No results found for "${this.searchQuery}"`;
    }
    return '';
  }
}

interface FaqCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

/**
 * FAQ item interface
 */
interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  lastUpdated: Date;
}

