/**
 * Visitor Badges Component
 *
 * Component for managing visitor badge issuance and returns.
 * Supports temporary, permanent, event, and VIP badge types.
 *
 * @example
 * ```html
 * <app-visitor-badges></app-visitor-badges>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { VisitorExtendedService } from '../../../core/services/visitor-extended.service';
import { VisitorBadge, VisitorBadgeIssue, VisitorBadgeReturn } from '../../../core/models/visitor-extended.model';

@Component({
  selector: 'app-visitor-badges',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, ModalComponent],
  templateUrl: './visitor-badges.component.html',
  styleUrl: './visitor-badges.component.scss'
})
export class VisitorBadgesComponent implements OnInit {
  showIssueModal = signal(false);
  showReturnModal = signal(false);
  processing = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);
  
  badgeIssueData: Partial<VisitorBadgeIssue> = {
    badgeNumber: '',
    badgeType: 'temporary',
    visitorId: undefined,
    visitId: undefined
  };
  
  badgeReturnData: Partial<VisitorBadgeReturn> = {
    returnNotes: ''
  };
  
  selectedBadge = signal<VisitorBadge | null>(null);
  badges = signal<VisitorBadge[]>([]);
  activeBadges = signal<VisitorBadge[]>([]);

  badgeTypes = [
    { value: 'temporary', label: '🕐 Temporary' },
    { value: 'permanent', label: '🔷 Permanent' },
    { value: 'event', label: '🎉 Event' },
    { value: 'vip', label: '⭐ VIP' }
  ];

  constructor(private visitorExtService: VisitorExtendedService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.visitorExtService.getBadges().subscribe({
      next: (badges) => {
        this.badges.set(badges);
        this.activeBadges.set(badges.filter(b => b.badgeStatus === 'active'));
      },
      error: (error) => {
        console.error('Error loading badges:', error);
      }
    });
  }

  openIssueModal(): void {
    this.showIssueModal.set(true);
    this.badgeIssueData = {
      badgeNumber: '',
      badgeType: 'temporary',
      visitorId: undefined,
      visitId: undefined
    };
    this.success.set(false);
    this.errorMessage.set(null);
  }

  closeIssueModal(): void {
    this.showIssueModal.set(false);
    this.processing.set(false);
  }

  openReturnModal(badge: VisitorBadge): void {
    this.selectedBadge.set(badge);
    this.showReturnModal.set(true);
    this.badgeReturnData = { returnNotes: '' };
    this.success.set(false);
    this.errorMessage.set(null);
  }

  closeReturnModal(): void {
    this.showReturnModal.set(false);
    this.selectedBadge.set(null);
    this.processing.set(false);
  }

  async issueBadge(): Promise<void> {
    if (!this.badgeIssueData.badgeNumber?.trim()) {
      this.errorMessage.set('Please enter a badge number');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);

    const issueData: VisitorBadgeIssue = {
      badgeNumber: this.badgeIssueData.badgeNumber!,
      badgeType: this.badgeIssueData.badgeType || 'temporary',
      visitorId: this.badgeIssueData.visitorId,
      visitId: this.badgeIssueData.visitId
    };

    this.visitorExtService.issueBadge(issueData).subscribe({
      next: (badge) => {
        this.success.set(true);
        this.processing.set(false);
        this.loadBadges();
        
        setTimeout(() => {
          this.closeIssueModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error issuing badge:', error);
        this.errorMessage.set(error.error?.message || 'Failed to issue badge');
        this.processing.set(false);
      }
    });
  }

  async returnBadge(): Promise<void> {
    if (!this.selectedBadge()) return;

    this.processing.set(true);
    this.errorMessage.set(null);

    const returnData: VisitorBadgeReturn = {
      returnNotes: this.badgeReturnData.returnNotes
    };

    this.visitorExtService.returnBadge(this.selectedBadge()!.badgeId, returnData).subscribe({
      next: (badge) => {
        this.success.set(true);
        this.processing.set(false);
        this.loadBadges();
        
        setTimeout(() => {
          this.closeReturnModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Error returning badge:', error);
        this.errorMessage.set(error.error?.message || 'Failed to return badge');
        this.processing.set(false);
      }
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

