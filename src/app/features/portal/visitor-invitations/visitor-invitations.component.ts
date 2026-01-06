/**
 * Visitor Invitations Component
 *
 * Component for creating and managing visitor invitations.
 * Supports email, SMS, and QR code invitation types with visit purpose selection.
 *
 * @example
 * ```html
 * <app-visitor-invitations></app-visitor-invitations>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { VisitorExtendedService } from '../../../core/services/visitor-extended.service';
import { VisitorInvitation, VisitorInvitationCreate } from '../../../core/models/visitor-extended.model';
import { VisitPurpose } from '../../../core/models/enums.model';

@Component({
  selector: 'app-visitor-invitations',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, ModalComponent],
  templateUrl: './visitor-invitations.component.html',
  styleUrl: './visitor-invitations.component.scss'
})
export class VisitorInvitationsComponent implements OnInit {
  showModal = signal(false);
  processing = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);
  
  invitationData: Partial<VisitorInvitationCreate> = {
    invitationType: 'email',
    guestEmail: '',
    guestPhone: '',
    guestName: '',
    visitDate: new Date().toISOString().slice(0, 16),
    visitPurpose: VisitPurpose.MEETING,
    meetingRoom: '',
    notes: ''
  };
  
  invitationResult = signal<VisitorInvitation | null>(null);
  invitations = signal<VisitorInvitation[]>([]);

  invitationTypes = [
    { value: 'email', label: '📧 Email' },
    { value: 'sms', label: '💬 SMS' },
    { value: 'qr', label: '📱 QR Code' }
  ];

  visitPurposes = Object.values(VisitPurpose);

  constructor(private visitorExtService: VisitorExtendedService) {}

  ngOnInit(): void {
    this.loadInvitations();
  }

  loadInvitations(): void {
    this.visitorExtService.getInvitations().subscribe({
      next: (invitations) => {
        this.invitations.set(invitations);
      },
      error: (error) => {
        console.error('Error loading invitations:', error);
      }
    });
  }

  openModal(): void {
    this.showModal.set(true);
    this.invitationData = {
      invitationType: 'email',
      guestEmail: '',
      guestPhone: '',
      guestName: '',
      visitDate: new Date().toISOString().slice(0, 16),
      visitPurpose: VisitPurpose.MEETING,
      meetingRoom: '',
      notes: ''
    };
    this.success.set(false);
    this.errorMessage.set(null);
    this.invitationResult.set(null);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.processing.set(false);
  }

  async createInvitation(): Promise<void> {
    if (!this.invitationData.guestEmail?.trim() && !this.invitationData.guestPhone?.trim()) {
      this.errorMessage.set('Please provide email or phone number');
      return;
    }
    if (!this.invitationData.visitDate) {
      this.errorMessage.set('Please select visit date');
      return;
    }
    if (!this.invitationData.guestName?.trim()) {
      this.errorMessage.set('Please enter guest name');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);

    const createData: VisitorInvitationCreate = {
      invitationType: this.invitationData.invitationType || 'email',
      guestEmail: this.invitationData.guestEmail,
      guestPhone: this.invitationData.guestPhone,
      guestName: this.invitationData.guestName,
      visitDate: this.invitationData.visitDate!,
      visitPurpose: this.invitationData.visitPurpose || VisitPurpose.MEETING,
      meetingRoom: this.invitationData.meetingRoom,
      notes: this.invitationData.notes
    };

    this.visitorExtService.createInvitation(createData).subscribe({
      next: (invitation) => {
        this.invitationResult.set(invitation);
        this.success.set(true);
        this.processing.set(false);
        this.loadInvitations();
        
        setTimeout(() => {
          this.closeModal();
        }, 3000);
      },
      error: (error) => {
        console.error('Error creating invitation:', error);
        this.errorMessage.set(error.error?.message || 'Failed to create invitation');
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

  getInvitationStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'pending': '🟡',
      'sent': '📤',
      'delivered': '📨',
      'opened': '👁️',
      'used': '✅',
      'expired': '⏰'
    };
    return icons[status] || '❓';
  }
}

