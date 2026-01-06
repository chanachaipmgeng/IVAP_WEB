/**
 * Parking Exit Component
 *
 * Component for processing vehicle exit from parking.
 * Handles exit requests with payment method selection.
 *
 * @example
 * ```html
 * <app-parking-exit></app-parking-exit>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ParkingService } from '../../../core/services/parking.service';
import { VehicleExitRequest, ParkingEvent } from '../../../core/models/parking.model';

@Component({
  selector: 'app-parking-exit',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, ModalComponent],
  templateUrl: './parking-exit.component.html',
  styleUrl: './parking-exit.component.scss'
})
export class ParkingExitComponent implements OnInit {
  showModal = signal(false);
  processing = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);
  
  exitData: VehicleExitRequest = {
    plateNumber: '',
    paymentMethod: '',
    notes: ''
  };
  
  exitResult = signal<ParkingEvent | null>(null);

  paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'card', label: '💳 Card' },
    { value: 'qr', label: '📱 QR Payment' },
    { value: 'free', label: '🆓 Free' }
  ];

  constructor(private parkingService: ParkingService) {}

  ngOnInit(): void {}

  openModal(): void {
    this.showModal.set(true);
    this.exitData = { plateNumber: '', paymentMethod: '', notes: '' };
    this.success.set(false);
    this.errorMessage.set(null);
    this.exitResult.set(null);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.processing.set(false);
  }

  async processExit(): Promise<void> {
    if (!this.exitData.plateNumber.trim()) {
      this.errorMessage.set('Please enter a valid plate number');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);

    this.parkingService.recordVehicleExit(this.exitData).subscribe({
      next: (event) => {
        this.exitResult.set(event);
        this.success.set(true);
        this.processing.set(false);
        
        // Show success for 5 seconds (to review payment) then close
        setTimeout(() => {
          this.closeModal();
        }, 5000);
      },
      error: (error) => {
        console.error('Error processing exit:', error);
        this.errorMessage.set(error.error?.message || 'Failed to process exit');
        this.processing.set(false);
      }
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '฿0.00';
    return `฿${amount.toFixed(2)}`;
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

  formatDuration(minutes: number | undefined): string {
    if (minutes === undefined || minutes === null) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }
}

