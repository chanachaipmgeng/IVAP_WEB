/**
 * Error 404 Component
 *
 * Displays a 404 Not Found error page with search functionality and navigation options.
 * Provides suggestions for common pages and allows users to search or navigate back.
 *
 * @example
 * ```html
 * <app-error-404></app-error-404>
 * ```
 */

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-error-404',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './error-404.component.html',
  styleUrls: ['./error-404.component.scss']
})
export class Error404Component implements OnInit {
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
   * Page suggestions
   */
  suggestions: string[] = [
    'Dashboard',
    'User Management',
    'Reports',
    'Settings',
    'Profile',
    'Notifications',
    'Calendar',
    'Analytics'
  ];

  /**
   * Filtered suggestions based on search
   */
  filteredSuggestions: string[] = [];

  /**
   * Show suggestions dropdown
   */
  showSuggestions: boolean = false;

  constructor(
    private router: Router,
    public i18n: I18nService
  ) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.filteredSuggestions = this.suggestions;
  }

  /**
   * Handle search input
   */
  onSearchInput(): void {
    if (this.searchQuery.trim()) {
      this.filteredSuggestions = this.suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.showSuggestions = this.filteredSuggestions.length > 0;
    } else {
      this.filteredSuggestions = this.suggestions;
      this.showSuggestions = false;
    }
  }

  /**
   * Handle search blur
   */
  onSearchBlur(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  /**
   * Handle search submit
   */
  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      // Navigate to search results or perform search
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  /**
   * Handle suggestion click
   */
  onSuggestionClick(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.onSearchSubmit();
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Navigate back
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Report issue
   */
  reportIssue(): void {
    // Navigate to issue reporting or open support ticket
    this.router.navigate(['/support/contact']);
  }

  /**
   * TrackBy function for suggestions
   */
  trackBySuggestion(index: number, suggestion: string): string {
    return suggestion;
  }
}
