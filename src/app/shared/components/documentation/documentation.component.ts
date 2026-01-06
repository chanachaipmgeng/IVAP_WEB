/**
 * Documentation Component
 *
 * A documentation viewer component with search, filtering, and categorization.
 * Supports section navigation, reading time estimation, and difficulty levels.
 *
 * @example
 * ```html
 * <app-documentation
 *   [customClass]="'my-docs'"
 *   [ariaLabel]="'Documentation'">
 * </app-documentation>
 * ```
 */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent extends BaseComponent implements OnInit {
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
   * Selected section ID
   */
  selectedSection: string | null = null;

  /**
   * Loading state
   */
  isLoading: boolean = false;

  categories: DocCategory[] = [
    { id: 'all', name: 'All Documentation', icon: '📚', count: 0 },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀', count: 0 },
    { id: 'user-guide', name: 'User Guide', icon: '👤', count: 0 },
    { id: 'api', name: 'API Reference', icon: '🔌', count: 0 },
    { id: 'integrations', name: 'Integrations', icon: '🔗', count: 0 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧', count: 0 },
    { id: 'security', name: 'Security', icon: '🔒', count: 0 }
  ];

  documentationSections: DocSection[] = [
    // Getting Started
    {
      id: '1',
      category: 'getting-started',
      title: 'Quick Start Guide',
      description: 'Get up and running with our platform in minutes',
      content: 'This guide will walk you through the essential steps to set up your account, configure your first camera, and start monitoring your premises.',
      tags: ['setup', 'onboarding', 'quick-start'],
      lastUpdated: new Date('2024-01-15'),
      estimatedReadTime: 5,
      difficulty: 'beginner',
      steps: [
        'Create your account and verify your email',
        'Complete the setup wizard',
        'Add your first camera',
        'Configure basic settings',
        'Start monitoring'
      ]
    },
    {
      id: '2',
      category: 'getting-started',
      title: 'System Requirements',
      description: 'Hardware and software requirements for optimal performance',
      content: 'Ensure your system meets the minimum requirements for smooth operation and optimal performance.',
      tags: ['requirements', 'hardware', 'software'],
      lastUpdated: new Date('2024-01-20'),
      estimatedReadTime: 3,
      difficulty: 'beginner',
      steps: [
        'Check minimum system requirements',
        'Verify network connectivity',
        'Install required software',
        'Configure firewall settings'
      ]
    },
    {
      id: '3',
      category: 'getting-started',
      title: 'Installation Guide',
      description: 'Step-by-step installation instructions',
      content: 'Detailed installation guide for different operating systems and deployment scenarios.',
      tags: ['installation', 'setup', 'deployment'],
      lastUpdated: new Date('2024-01-25'),
      estimatedReadTime: 10,
      difficulty: 'intermediate',
      steps: [
        'Download the installation package',
        'Run the installer',
        'Configure initial settings',
        'Verify installation',
        'Launch the application'
      ]
    },

    // User Guide
    {
      id: '4',
      category: 'user-guide',
      title: 'Dashboard Overview',
      description: 'Understanding the main dashboard interface',
      content: 'Learn how to navigate the dashboard, customize your view, and access key features.',
      tags: ['dashboard', 'interface', 'navigation'],
      lastUpdated: new Date('2024-02-01'),
      estimatedReadTime: 7,
      difficulty: 'beginner',
      steps: [
        'Navigate the main dashboard',
        'Customize your view',
        'Access key features',
        'Set up notifications'
      ]
    },
    {
      id: '5',
      category: 'user-guide',
      title: 'Camera Management',
      description: 'Adding, configuring, and managing cameras',
      content: 'Complete guide to adding cameras, configuring settings, and managing your camera network.',
      tags: ['cameras', 'management', 'configuration'],
      lastUpdated: new Date('2024-02-05'),
      estimatedReadTime: 12,
      difficulty: 'intermediate',
      steps: [
        'Add new cameras',
        'Configure camera settings',
        'Set up recording schedules',
        'Manage camera groups',
        'Monitor camera health'
      ]
    },
    {
      id: '6',
      category: 'user-guide',
      title: 'User Management',
      description: 'Managing users, roles, and permissions',
      content: 'Learn how to add users, assign roles, and manage permissions for your organization.',
      tags: ['users', 'roles', 'permissions'],
      lastUpdated: new Date('2024-02-10'),
      estimatedReadTime: 8,
      difficulty: 'intermediate',
      steps: [
        'Add new users',
        'Assign roles and permissions',
        'Configure user settings',
        'Manage user access'
      ]
    },

    // API Reference
    {
      id: '7',
      category: 'api',
      title: 'API Authentication',
      description: 'How to authenticate with our API',
      content: 'Learn how to authenticate with our REST API using API keys and OAuth tokens.',
      tags: ['api', 'authentication', 'oauth'],
      lastUpdated: new Date('2024-02-15'),
      estimatedReadTime: 6,
      difficulty: 'advanced',
      steps: [
        'Generate API keys',
        'Configure OAuth',
        'Test authentication',
        'Handle tokens'
      ]
    },
    {
      id: '8',
      category: 'api',
      title: 'Camera API Endpoints',
      description: 'API endpoints for camera management',
      content: 'Complete reference for camera-related API endpoints including CRUD operations.',
      tags: ['api', 'cameras', 'endpoints'],
      lastUpdated: new Date('2024-02-20'),
      estimatedReadTime: 15,
      difficulty: 'advanced',
      steps: [
        'List cameras',
        'Get camera details',
        'Update camera settings',
        'Delete cameras'
      ]
    },
    {
      id: '9',
      category: 'api',
      title: 'Webhook Integration',
      description: 'Setting up webhooks for real-time notifications',
      content: 'Configure webhooks to receive real-time notifications about events and alerts.',
      tags: ['webhooks', 'notifications', 'integration'],
      lastUpdated: new Date('2024-02-25'),
      estimatedReadTime: 10,
      difficulty: 'advanced',
      steps: [
        'Create webhook endpoints',
        'Configure event types',
        'Test webhook delivery',
        'Handle webhook responses'
      ]
    },

    // Integrations
    {
      id: '10',
      category: 'integrations',
      title: 'Third-party Integrations',
      description: 'Integrating with popular third-party services',
      content: 'Learn how to integrate with popular services like Slack, Microsoft Teams, and more.',
      tags: ['integrations', 'third-party', 'slack'],
      lastUpdated: new Date('2024-03-01'),
      estimatedReadTime: 12,
      difficulty: 'intermediate',
      steps: [
        'Choose integration type',
        'Configure API credentials',
        'Set up event triggers',
        'Test integration'
      ]
    },
    {
      id: '11',
      category: 'integrations',
      title: 'Database Integration',
      description: 'Connecting to external databases',
      content: 'Guide to connecting your platform to external databases for data synchronization.',
      tags: ['database', 'integration', 'sync'],
      lastUpdated: new Date('2024-03-05'),
      estimatedReadTime: 15,
      difficulty: 'advanced',
      steps: [
        'Configure database connection',
        'Set up data mapping',
        'Configure sync settings',
        'Monitor data flow'
      ]
    },

    // Troubleshooting
    {
      id: '12',
      category: 'troubleshooting',
      title: 'Common Issues',
      description: 'Solutions to frequently encountered problems',
      content: 'Troubleshooting guide for common issues and their solutions.',
      tags: ['troubleshooting', 'issues', 'solutions'],
      lastUpdated: new Date('2024-03-10'),
      estimatedReadTime: 8,
      difficulty: 'beginner',
      steps: [
        'Identify the issue',
        'Check system status',
        'Apply recommended solutions',
        'Verify resolution'
      ]
    },
    {
      id: '13',
      category: 'troubleshooting',
      title: 'Performance Optimization',
      description: 'Optimizing system performance',
      content: 'Tips and techniques for optimizing your system performance and reducing resource usage.',
      tags: ['performance', 'optimization', 'tuning'],
      lastUpdated: new Date('2024-03-15'),
      estimatedReadTime: 10,
      difficulty: 'intermediate',
      steps: [
        'Monitor system resources',
        'Identify bottlenecks',
        'Apply optimizations',
        'Test performance'
      ]
    },

    // Security
    {
      id: '14',
      category: 'security',
      title: 'Security Best Practices',
      description: 'Essential security practices for your deployment',
      content: 'Comprehensive guide to securing your platform and protecting your data.',
      tags: ['security', 'best-practices', 'protection'],
      lastUpdated: new Date('2024-03-20'),
      estimatedReadTime: 12,
      difficulty: 'intermediate',
      steps: [
        'Configure authentication',
        'Set up encryption',
        'Configure firewall rules',
        'Regular security audits'
      ]
    },
    {
      id: '15',
      category: 'security',
      title: 'Data Privacy',
      description: 'Understanding data privacy and compliance',
      content: 'Guide to data privacy, GDPR compliance, and data protection measures.',
      tags: ['privacy', 'gdpr', 'compliance'],
      lastUpdated: new Date('2024-03-25'),
      estimatedReadTime: 8,
      difficulty: 'intermediate',
      steps: [
        'Understand data collection',
        'Configure privacy settings',
        'Implement data retention',
        'Ensure compliance'
      ]
    }
  ];

  filteredSections: DocSection[] = [];

  constructor(private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.updateCategoryCounts();
    this.filterSections();
  }

  /**
   * Update category counts
   */
  updateCategoryCounts(): void {
    this.categories.forEach(category => {
      if (category.id === 'all') {
        category.count = this.documentationSections.length;
      } else {
        category.count = this.documentationSections.filter(section => section.category === category.id).length;
      }
    });
  }

  /**
   * Filter documentation sections
   */
  filterSections(): void {
    let filtered = [...this.documentationSections];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(section => section.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query) ||
        section.content.toLowerCase().includes(query) ||
        section.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    this.filteredSections = filtered;
  }

  onSearchInput(): void {
    this.filterSections();
  }

  onCategoryChange(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterSections();
  }

  toggleSection(sectionId: string): void {
    this.selectedSection = this.selectedSection === sectionId ? null : sectionId;
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'info';
    }
  }

  /**
   * Get difficulty text
   */
  getDifficultyText(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return 'Unknown';
    }
  }

  /**
   * Get category icon
   */
  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.icon || '📚';
  }

  /**
   * Get category name
   */
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  }

  /**
   * Check if section is selected
   */
  isSectionSelected(sectionId: string): boolean {
    return this.selectedSection === sectionId;
  }

  /**
   * Get filtered count
   */
  getFilteredCount(): number {
    return this.filteredSections.length;
  }

  /**
   * Check if has search results
   */
  hasSearchResults(): boolean {
    return this.filteredSections.length > 0;
  }

  /**
   * Get search message
   */
  getSearchMessage(): string {
    if (this.searchQuery.trim() && this.filteredSections.length === 0) {
      return `No documentation found for "${this.searchQuery}"`;
    }
    return '';
  }

  /**
   * Download PDF for section
   */
  downloadPDF(sectionId: string): void {
    // In a real app, this would download a PDF version
    // PDF download initiated
  }

  /**
   * TrackBy function for documentation sections
   */
  trackBySection(index: number, section: DocSection): string {
    return section.id;
  }

  /**
   * TrackBy function for categories
   */
  trackByCategory(index: number, category: DocCategory): string {
    return category.id;
  }

  printSection(sectionId: string): void {
    // In a real app, this would open print dialog
    // Print dialog opened
  }

  contactSupport(): void {
    this.router.navigate(['/support/contact']);
  }
}

interface DocCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

/**
 * Documentation section interface
 */
interface DocSection {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  lastUpdated: Date;
  estimatedReadTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
}
