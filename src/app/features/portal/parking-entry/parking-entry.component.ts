/**
 * Parking Entry Component
 *
 * Component for processing vehicle entry into parking.
 * Handles vehicle entry requests and space assignment.
 *
 * @example
 * ```html
 * <app-parking-entry></app-parking-entry>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ParkingService } from '../../../core/services/parking.service';
import { VehicleEntryRequest, ParkingEvent, ParkingSpace } from '../../../core/models/parking.model';

@Component({
  selector: 'app-parking-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, ModalComponent],
  templateUrl: './parking-entry.component.html',
  styleUrl: './parking-entry.component.scss'
})
export class ParkingEntryComponent implements OnInit {
  showModal = signal(false);
  processing = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);
  
  entryData: VehicleEntryRequest = {
    plateNumber: '',
    notes: ''
  };
  
  entryResult = signal<ParkingEvent | null>(null);
  assignedSpace = signal<ParkingSpace | null>(null);

  constructor(private parkingService: ParkingService) {}

  ngOnInit(): void {}

  openModal(): void {
    this.showModal.set(true);
    this.entryData = { plateNumber: '', notes: '' };
    this.success.set(false);
    this.errorMessage.set(null);
    this.entryResult.set(null);
    this.assignedSpace.set(null);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.processing.set(false);
  }

  async processEntry(): Promise<void> {
    if (!this.entryData.plateNumber.trim()) {
      this.errorMessage.set('Please enter a valid plate number');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);

    this.parkingService.recordVehicleEntry(this.entryData).subscribe({
      next: (event) => {
        this.entryResult.set(event);
        this.success.set(true);
        this.processing.set(false);
        
        // Show success for 3 seconds then close
        setTimeout(() => {
          this.closeModal();
        }, 3000);
      },
      error: (error) => {
        console.error('Error processing entry:', error);
        this.errorMessage.set(error.error?.message || 'Failed to process entry');
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

