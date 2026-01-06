import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  type: 'user_guide' | 'api_documentation' | 'technical_spec' | 'deployment_guide' | 'troubleshooting' | 'changelog' | 'faq';
  category: 'getting_started' | 'user_management' | 'system_configuration' | 'api_reference' | 'troubleshooting' | 'advanced_topics';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  author: string;
  reviewers: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  version: string;
  tags: string[];
  dependencies: string[];
  relatedItems: string[];
  attachments: DocumentationAttachment[];
  metadata: Record<string, any>;
}

export interface DocumentationAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'code' | 'diagram' | 'screenshot';
  url: string;
  size: number;
  description: string;
  uploadedAt: Date;
}

export interface DocumentationSection {
  id: string;
  name: string;
  description: string;
  items: string[];
  order: number;
  isCollapsible: boolean;
  isExpanded: boolean;
  parentSection?: string;
  children: string[];
}

export interface DocumentationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'user_guide' | 'api_documentation' | 'technical_spec' | 'deployment_guide';
  structure: DocumentationStructure;
  content: string;
  variables: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentationStructure {
  sections: DocumentationSection[];
  order: string[];
  metadata: {
    title: string;
    description: string;
    author: string;
    version: string;
    lastUpdated: Date;
  };
}

export interface DocumentationReview {
  id: string;
  itemId: string;
  reviewer: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'needs_revision';
  comments: DocumentationComment[];
  rating: number; // 1-5
  submittedAt?: Date;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DocumentationComment {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  type: 'general' | 'suggestion' | 'question' | 'correction' | 'approval';
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  lineNumber?: number;
  section?: string;
}

export interface DocumentationReport {
  id: string;
  name: string;
  description: string;
  generatedAt: Date;
  type: 'completeness' | 'quality' | 'coverage' | 'usage' | 'maintenance';
  summary: {
    totalItems: number;
    publishedItems: number;
    draftItems: number;
    reviewItems: number;
    completenessScore: number; // 0-100
    qualityScore: number; // 0-100
    coverageScore: number; // 0-100
    lastUpdated: Date;
  };
  details: DocumentationReportDetail[];
  recommendations: string[];
  trends: DocumentationTrend[];
}

export interface DocumentationReportDetail {
  category: string;
  totalItems: number;
  publishedItems: number;
  draftItems: number;
  reviewItems: number;
  completeness: number;
  quality: number;
  lastUpdated: Date;
  issues: string[];
}

export interface DocumentationTrend {
  metric: string;
  currentValue: number;
  previousValue: number;
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number;
  period: string;
}

export interface DocumentationSearch {
  query: string;
  filters: {
    type?: string[];
    category?: string[];
    status?: string[];
    author?: string[];
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  results: DocumentationSearchResult[];
  totalResults: number;
  searchTime: number; // milliseconds
}

export interface DocumentationSearchResult {
  item: DocumentationItem;
  relevanceScore: number; // 0-100
  matchedFields: string[];
  highlights: string[];
  snippet: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentationCompletionService {
  // ✅ Private writable signals
  private _documentationItems = signal<DocumentationItem[]>([]);
  private _documentationSections = signal<DocumentationSection[]>([]);
  private _documentationTemplates = signal<DocumentationTemplate[]>([]);
  private _documentationReviews = signal<DocumentationReview[]>([]);
  private _documentationReports = signal<DocumentationReport[]>([]);
  private _isGenerating = signal<boolean>(false);

  // ✅ Public readonly signals
  public readonly documentationItems = this._documentationItems.asReadonly();
  public readonly documentationSections = this._documentationSections.asReadonly();
  public readonly documentationTemplates = this._documentationTemplates.asReadonly();
  public readonly documentationReviews = this._documentationReviews.asReadonly();
  public readonly documentationReports = this._documentationReports.asReadonly();
  public readonly isGenerating = this._isGenerating.asReadonly();

  // ✅ Computed signals for derived state
  public readonly documentationItemsCount = computed(() => this._documentationItems().length);
  public readonly publishedItemsCount = computed(() =>
    this._documentationItems().filter((item: DocumentationItem) => item.status === 'published').length
  );
  public readonly draftItemsCount = computed(() =>
    this._documentationItems().filter((item: DocumentationItem) => item.status === 'draft').length
  );
  public readonly reviewItemsCount = computed(() =>
    this._documentationItems().filter((item: DocumentationItem) => item.status === 'review').length
  );
  public readonly documentationSectionsCount = computed(() => this._documentationSections().length);
  public readonly documentationTemplatesCount = computed(() => this._documentationTemplates().length);
  public readonly documentationReviewsCount = computed(() => this._documentationReviews().length);
  public readonly documentationReportsCount = computed(() => this._documentationReports().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public documentationItems$ = new Observable<DocumentationItem[]>(observer => {
    observer.next(this._documentationItems());
  });
  public documentationSections$ = new Observable<DocumentationSection[]>(observer => {
    observer.next(this._documentationSections());
  });
  public documentationTemplates$ = new Observable<DocumentationTemplate[]>(observer => {
    observer.next(this._documentationTemplates());
  });
  public documentationReviews$ = new Observable<DocumentationReview[]>(observer => {
    observer.next(this._documentationReviews());
  });
  public documentationReports$ = new Observable<DocumentationReport[]>(observer => {
    observer.next(this._documentationReports());
  });
  public isGenerating$ = new Observable<boolean>(observer => {
    observer.next(this._isGenerating());
  });

  constructor() {
    this.initializeDocumentation();
  }

  private initializeDocumentation(): void {
    const items: DocumentationItem[] = [
      {
        id: 'doc-001',
        title: 'Getting Started Guide',
        description: 'Complete guide for new users to get started with the system',
        type: 'user_guide',
        category: 'getting_started',
        status: 'published',
        priority: 'high',
        content: '# Getting Started Guide\n\nWelcome to the Intelligent Video Analytics Platform...',
        author: 'System Administrator',
        reviewers: ['Technical Writer', 'Product Manager'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        publishedAt: new Date('2024-01-15'),
        version: '1.0.0',
        tags: ['getting-started', 'user-guide', 'tutorial'],
        dependencies: [],
        relatedItems: ['doc-002', 'doc-003'],
        attachments: [],
        metadata: {
          wordCount: 2500,
          readingTime: 15,
          difficulty: 'beginner'
        }
      },
      {
        id: 'doc-002',
        title: 'User Management',
        description: 'Guide for managing users, roles, and permissions',
        type: 'user_guide',
        category: 'user_management',
        status: 'published',
        priority: 'high',
        content: '# User Management\n\nThis guide covers user management features...',
        author: 'System Administrator',
        reviewers: ['Technical Writer'],
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-16'),
        publishedAt: new Date('2024-01-16'),
        version: '1.0.0',
        tags: ['user-management', 'roles', 'permissions'],
        dependencies: ['doc-001'],
        relatedItems: ['doc-001', 'doc-004'],
        attachments: [],
        metadata: {
          wordCount: 1800,
          readingTime: 12,
          difficulty: 'intermediate'
        }
      },
      {
        id: 'doc-003',
        title: 'API Reference',
        description: 'Complete API documentation with endpoints and examples',
        type: 'api_documentation',
        category: 'api_reference',
        status: 'review',
        priority: 'critical',
        content: '# API Reference\n\n## Authentication\n\nAll API requests require authentication...',
        author: 'Lead Developer',
        reviewers: ['Technical Writer', 'API Developer'],
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-17'),
        version: '1.0.0',
        tags: ['api', 'reference', 'endpoints'],
        dependencies: [],
        relatedItems: ['doc-001', 'doc-005'],
        attachments: [],
        metadata: {
          wordCount: 5000,
          readingTime: 30,
          difficulty: 'advanced'
        }
      },
      {
        id: 'doc-004',
        title: 'System Configuration',
        description: 'Guide for configuring system settings and parameters',
        type: 'technical_spec',
        category: 'system_configuration',
        status: 'draft',
        priority: 'medium',
        content: '# System Configuration\n\nThis document describes system configuration options...',
        author: 'System Administrator',
        reviewers: [],
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-18'),
        version: '0.9.0',
        tags: ['configuration', 'system', 'settings'],
        dependencies: ['doc-001'],
        relatedItems: ['doc-001', 'doc-002'],
        attachments: [],
        metadata: {
          wordCount: 1200,
          readingTime: 8,
          difficulty: 'intermediate'
        }
      },
      {
        id: 'doc-005',
        title: 'Deployment Guide',
        description: 'Step-by-step guide for deploying the system',
        type: 'deployment_guide',
        category: 'advanced_topics',
        status: 'review',
        priority: 'high',
        content: '# Deployment Guide\n\n## Prerequisites\n\nBefore deploying the system...',
        author: 'DevOps Engineer',
        reviewers: ['System Administrator', 'Lead Developer'],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-19'),
        version: '1.0.0',
        tags: ['deployment', 'devops', 'production'],
        dependencies: ['doc-001', 'doc-003'],
        relatedItems: ['doc-003', 'doc-006'],
        attachments: [],
        metadata: {
          wordCount: 3000,
          readingTime: 20,
          difficulty: 'advanced'
        }
      },
      {
        id: 'doc-006',
        title: 'Troubleshooting Guide',
        description: 'Common issues and their solutions',
        type: 'troubleshooting',
        category: 'troubleshooting',
        status: 'published',
        priority: 'medium',
        content: '# Troubleshooting Guide\n\n## Common Issues\n\n### Login Problems\n\nIf you cannot log in...',
        author: 'Support Team',
        reviewers: ['Technical Writer'],
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-20'),
        publishedAt: new Date('2024-01-20'),
        version: '1.0.0',
        tags: ['troubleshooting', 'support', 'issues'],
        dependencies: ['doc-001'],
        relatedItems: ['doc-001', 'doc-002'],
        attachments: [],
        metadata: {
          wordCount: 2000,
          readingTime: 15,
          difficulty: 'beginner'
        }
      }
    ];

    this._documentationItems.set(items);
    this.initializeSections();
    this.initializeTemplates();
  }

  private initializeSections(): void {
    const sections: DocumentationSection[] = [
      {
        id: 'section-001',
        name: 'Getting Started',
        description: 'Essential guides for new users',
        items: ['doc-001', 'doc-002'],
        order: 1,
        isCollapsible: false,
        isExpanded: true,
        children: []
      },
      {
        id: 'section-002',
        name: 'User Guides',
        description: 'Detailed user guides and tutorials',
        items: ['doc-001', 'doc-002', 'doc-004'],
        order: 2,
        isCollapsible: true,
        isExpanded: true,
        children: []
      },
      {
        id: 'section-003',
        name: 'Technical Documentation',
        description: 'Technical specifications and API documentation',
        items: ['doc-003', 'doc-005'],
        order: 3,
        isCollapsible: true,
        isExpanded: false,
        children: []
      },
      {
        id: 'section-004',
        name: 'Support',
        description: 'Troubleshooting and support resources',
        items: ['doc-006'],
        order: 4,
        isCollapsible: true,
        isExpanded: false,
        children: []
      }
    ];

    this._documentationSections.set(sections);
  }

  private initializeTemplates(): void {
    const templates: DocumentationTemplate[] = [
      {
        id: 'template-001',
        name: 'User Guide Template',
        description: 'Standard template for user guides',
        type: 'user_guide',
        structure: {
          sections: [
            {
              id: 'intro',
              name: 'Introduction',
              description: 'Overview and purpose',
              items: [],
              order: 1,
              isCollapsible: false,
              isExpanded: true,
              children: []
            },
            {
              id: 'prerequisites',
              name: 'Prerequisites',
              description: 'Requirements and setup',
              items: [],
              order: 2,
              isCollapsible: false,
              isExpanded: true,
              children: []
            },
            {
              id: 'steps',
              name: 'Step-by-Step Instructions',
              description: 'Detailed instructions',
              items: [],
              order: 3,
              isCollapsible: false,
              isExpanded: true,
              children: []
            }
          ],
          order: ['intro', 'prerequisites', 'steps'],
          metadata: {
            title: '{{title}}',
            description: '{{description}}',
            author: '{{author}}',
            version: '{{version}}',
            lastUpdated: new Date()
          }
        },
        content: '# {{title}}\n\n## Introduction\n\n{{description}}\n\n## Prerequisites\n\n{{prerequisites}}\n\n## Step-by-Step Instructions\n\n{{steps}}',
        variables: ['title', 'description', 'prerequisites', 'steps'],
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this._documentationTemplates.set(templates);
  }

  // Documentation Item Management
  getDocumentationItems(): Observable<DocumentationItem[]> {
    return this.documentationItems$;
  }

  getDocumentationItem(id: string): Observable<DocumentationItem | undefined> {
    return new Observable<DocumentationItem | undefined>(observer => {
      const item = this._documentationItems().find((item: DocumentationItem) => item.id === id);
      observer.next(item);
      observer.complete();
    });
  }

  createDocumentationItem(item: Omit<DocumentationItem, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'attachments' | 'metadata'>): Observable<DocumentationItem> {
    const newItem: DocumentationItem = {
      ...item,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      attachments: [],
      metadata: {}
    };

    const items = this._documentationItems();
    this._documentationItems.set([...items, newItem]);

    return new Observable(observer => {
      observer.next(newItem);
      observer.complete();
    });
  }

  updateDocumentationItem(id: string, updates: Partial<DocumentationItem>): Observable<DocumentationItem> {
    const items = this._documentationItems();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      return throwError(() => new Error('Documentation item not found'));
    }

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date(),
      version: this.incrementVersion(items[index].version)
    };
    this._documentationItems.set([...items]);

    return new Observable(observer => {
      observer.next(items[index]);
      observer.complete();
    });
  }

  publishDocumentationItem(id: string): Observable<DocumentationItem> {
    const items = this._documentationItems();
    const index = items.findIndex(item => item.id === id);

    if (index === -1) {
      return throwError(() => new Error('Documentation item not found'));
    }

    items[index].status = 'published';
    items[index].publishedAt = new Date();
    items[index].updatedAt = new Date();
    this._documentationItems.set([...items]);

    return new Observable(observer => {
      observer.next(items[index]);
      observer.complete();
    });
  }

  // Documentation Search
  searchDocumentation(query: string, filters?: Partial<DocumentationSearch['filters']>): Observable<DocumentationSearch> {
    const startTime = Date.now();
    const items = this._documentationItems();

    let filteredItems = items;

    // Apply filters
    if (filters?.type && filters.type.length > 0) {
      filteredItems = filteredItems.filter(item => filters.type!.includes(item.type));
    }

    if (filters?.category && filters.category.length > 0) {
      filteredItems = filteredItems.filter(item => filters.category!.includes(item.category));
    }

    if (filters?.status && filters.status.length > 0) {
      filteredItems = filteredItems.filter(item => filters.status!.includes(item.status));
    }

    if (filters?.author && filters.author.length > 0) {
      filteredItems = filteredItems.filter(item => filters.author!.includes(item.author));
    }

    if (filters?.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    if (filters?.dateRange) {
      filteredItems = filteredItems.filter(item =>
        item.updatedAt >= filters.dateRange!.start &&
        item.updatedAt <= filters.dateRange!.end
      );
    }

    // Search in content
    const searchResults: DocumentationSearchResult[] = filteredItems
      .map(item => {
        const relevanceScore = this.calculateRelevanceScore(item, query);
        if (relevanceScore > 0) {
          return {
            item,
            relevanceScore,
            matchedFields: this.getMatchedFields(item, query),
            highlights: this.getHighlights(item, query),
            snippet: this.getSnippet(item, query)
          };
        }
        return null;
      })
      .filter(result => result !== null)
      .sort((a, b) => b!.relevanceScore - a!.relevanceScore) as DocumentationSearchResult[];

    const search: DocumentationSearch = {
      query,
      filters: filters || {},
      results: searchResults,
      totalResults: searchResults.length,
      searchTime: Date.now() - startTime
    };

    return new Observable(observer => {
      observer.next(search);
      observer.complete();
    });
  }

  // Documentation Review Management
  createDocumentationReview(review: Omit<DocumentationReview, 'id' | 'submittedAt'>): Observable<DocumentationReview> {
    const newReview: DocumentationReview = {
      ...review,
      id: this.generateId(),
      submittedAt: undefined
    };

    const reviews = this._documentationReviews();
    this._documentationReviews.set([...reviews, newReview]);

    return new Observable(observer => {
      observer.next(newReview);
      observer.complete();
    });
  }

  submitDocumentationReview(reviewId: string, comments: DocumentationComment[], rating: number): Observable<DocumentationReview> {
    const reviews = this._documentationReviews();
    const index = reviews.findIndex(r => r.id === reviewId);

    if (index === -1) {
      return throwError(() => new Error('Documentation review not found'));
    }

    reviews[index].comments = comments;
    reviews[index].rating = rating;
    reviews[index].status = 'approved';
    reviews[index].submittedAt = new Date();

    this._documentationReviews.set([...reviews]);

    return new Observable(observer => {
      observer.next(reviews[index]);
      observer.complete();
    });
  }

  // Documentation Report Generation
  generateDocumentationReport(type: 'completeness' | 'quality' | 'coverage' | 'usage' | 'maintenance'): Observable<DocumentationReport> {
    this._isGenerating.set(true);

    return new Observable(observer => {
      timer(2000).subscribe(() => {
        const items = this._documentationItems();
        const reviews = this._documentationReviews();

        const report: DocumentationReport = {
          id: this.generateId(),
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Documentation Report`,
          description: `Comprehensive ${type} report for documentation`,
          generatedAt: new Date(),
          type,
          summary: this.calculateSummary(items, reviews),
          details: this.calculateDetails(items, reviews),
          recommendations: this.generateRecommendations(items, reviews),
          trends: this.generateTrends(items)
        };

        const reports = this._documentationReports();
        this._documentationReports.set([...reports, report]);

        this._isGenerating.set(false);
        observer.next(report);
        observer.complete();
      });
    });
  }

  // Status Monitoring
  getIsGenerating(): Observable<boolean> {
    return this.isGenerating$;
  }

  getDocumentationReports(): Observable<DocumentationReport[]> {
    return this.documentationReports$;
  }

  // Utility Methods
  private generateId(): string {
    return 'doc-' + Math.random().toString(36).substr(2, 9);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private calculateRelevanceScore(item: DocumentationItem, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    // Description match
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 30;
    }

    // Content match
    if (item.content.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    // Tags match
    if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 15;
    }

    return score;
  }

  private getMatchedFields(item: DocumentationItem, query: string): string[] {
    const queryLower = query.toLowerCase();
    const fields: string[] = [];

    if (item.title.toLowerCase().includes(queryLower)) fields.push('title');
    if (item.description.toLowerCase().includes(queryLower)) fields.push('description');
    if (item.content.toLowerCase().includes(queryLower)) fields.push('content');
    if (item.tags.some(tag => tag.toLowerCase().includes(queryLower))) fields.push('tags');

    return fields;
  }

  private getHighlights(item: DocumentationItem, query: string): string[] {
    const queryLower = query.toLowerCase();
    const highlights: string[] = [];

    // Find and highlight matching text
    const content = item.content;
    const regex = new RegExp(`(${query})`, 'gi');
    const matches = content.match(regex);

    if (matches) {
      highlights.push(...matches.slice(0, 3)); // Limit to 3 highlights
    }

    return highlights;
  }

  private getSnippet(item: DocumentationItem, query: string): string {
    const queryLower = query.toLowerCase();
    const content = item.content;
    const index = content.toLowerCase().indexOf(queryLower);

    if (index === -1) {
      return item.description.substring(0, 200) + '...';
    }

    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + 100);
    return content.substring(start, end) + '...';
  }

  private calculateSummary(items: DocumentationItem[], reviews: DocumentationReview[]): DocumentationReport['summary'] {
    const totalItems = items.length;
    const publishedItems = items.filter(item => item.status === 'published').length;
    const draftItems = items.filter(item => item.status === 'draft').length;
    const reviewItems = items.filter(item => item.status === 'review').length;

    const completenessScore = (publishedItems / totalItems) * 100;
    const qualityScore = reviews.length > 0 ?
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length * 20 : 0;
    const coverageScore = this.calculateCoverageScore(items);

    return {
      totalItems,
      publishedItems,
      draftItems,
      reviewItems,
      completenessScore,
      qualityScore,
      coverageScore,
      lastUpdated: new Date(Math.max(...items.map(item => item.updatedAt.getTime())))
    };
  }

  private calculateCoverageScore(items: DocumentationItem[]): number {
    const categories = ['getting_started', 'user_management', 'system_configuration', 'api_reference', 'troubleshooting', 'advanced_topics'];
    const coveredCategories = new Set(items.map(item => item.category));
    return (coveredCategories.size / categories.length) * 100;
  }

  private calculateDetails(items: DocumentationItem[], reviews: DocumentationReview[]): DocumentationReportDetail[] {
    const categories = ['getting_started', 'user_management', 'system_configuration', 'api_reference', 'troubleshooting', 'advanced_topics'];

    return categories.map(category => {
      const categoryItems = items.filter(item => item.category === category);
      const publishedItems = categoryItems.filter(item => item.status === 'published').length;
      const draftItems = categoryItems.filter(item => item.status === 'draft').length;
      const reviewItems = categoryItems.filter(item => item.status === 'review').length;

      return {
        category,
        totalItems: categoryItems.length,
        publishedItems,
        draftItems,
        reviewItems,
        completeness: categoryItems.length > 0 ? (publishedItems / categoryItems.length) * 100 : 0,
        quality: 0, // Would need more complex calculation
        lastUpdated: categoryItems.length > 0 ?
          new Date(Math.max(...categoryItems.map(item => item.updatedAt.getTime()))) : new Date(),
        issues: []
      };
    });
  }

  private generateRecommendations(items: DocumentationItem[], reviews: DocumentationReview[]): string[] {
    const recommendations: string[] = [];

    const draftItems = items.filter(item => item.status === 'draft');
    if (draftItems.length > 0) {
      recommendations.push(`Complete ${draftItems.length} draft documentation items`);
    }

    const reviewItems = items.filter(item => item.status === 'review');
    if (reviewItems.length > 0) {
      recommendations.push(`Review and approve ${reviewItems.length} items pending review`);
    }

    const categories: ('getting_started' | 'user_management' | 'system_configuration' | 'api_reference' | 'troubleshooting' | 'advanced_topics')[] = ['getting_started', 'user_management', 'system_configuration', 'api_reference', 'troubleshooting', 'advanced_topics'];
    const coveredCategories = new Set(items.map(item => item.category));
    const missingCategories = categories.filter(cat => !coveredCategories.has(cat));

    if (missingCategories.length > 0) {
      recommendations.push(`Add documentation for missing categories: ${missingCategories.join(', ')}`);
    }

    return recommendations;
  }

  private generateTrends(items: DocumentationItem[]): DocumentationTrend[] {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const currentItems = items.length;
    const lastMonthItems = items.filter(item => item.createdAt >= lastMonth).length;
    const lastWeekItems = items.filter(item => item.createdAt >= lastWeek).length;

    return [
      {
        metric: 'Documentation Items',
        currentValue: currentItems,
        previousValue: lastMonthItems,
        trend: currentItems > lastMonthItems ? 'improving' : 'stable',
        changePercentage: lastMonthItems > 0 ? ((currentItems - lastMonthItems) / lastMonthItems) * 100 : 0,
        period: 'Last 30 days'
      },
      {
        metric: 'New Items This Week',
        currentValue: lastWeekItems,
        previousValue: 0,
        trend: lastWeekItems > 0 ? 'improving' : 'stable',
        changePercentage: 0,
        period: 'Last 7 days'
      }
    ];
  }
}
