/**
 * Parking Reservation Component
 *
 * Component for creating parking reservations.
 * Supports reservation creation with available space selection and time scheduling.
 *
 * @example
 * ```html
 * <app-parking-reservation></app-parking-reservation>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ParkingService } from '../../../core/services/parking.service';
import { ParkingReservationCreate, ParkingReservation, ParkingSpace } from '../../../core/models/parking.model';

@Component({
  selector: 'app-parking-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassButtonComponent, ModalComponent],
  templateUrl: './parking-reservation.component.html',
  styleUrl: './parking-reservation.component.scss'
})
export class ParkingReservationComponent implements OnInit {
  showModal = signal(false);
  processing = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);
  
  reservationData: Partial<ParkingReservationCreate> = {
    spaceId: '',
    plateNumber: '',
    reserverName: '',
    reserverPhone: '',
    reserverEmail: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
    notes: ''
  };
  
  reservationResult = signal<ParkingReservation | null>(null);
  availableSpaces = signal<ParkingSpace[]>([]);

  constructor(private parkingService: ParkingService) {}

  ngOnInit(): void {
    this.loadAvailableSpaces();
  }

  loadAvailableSpaces(): void {
    this.parkingService.getParkingSpaces({ 
      status: 'available',
      is_reservable: true 
    }).subscribe({
      next: (response) => {
        this.availableSpaces.set(response.data || []);
      },
      error: (error) => {
        console.error('Error loading available spaces:', error);
      }
    });
  }

  openModal(): void {
    this.showModal.set(true);
    this.reservationData = {
      spaceId: '',
      plateNumber: '',
      reserverName: '',
      reserverPhone: '',
      reserverEmail: '',
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16),
      notes: ''
    };
    this.success.set(false);
    this.errorMessage.set(null);
    this.reservationResult.set(null);
    this.loadAvailableSpaces();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.processing.set(false);
  }

  async createReservation(): Promise<void> {
    if (!this.reservationData.spaceId?.trim()) {
      this.errorMessage.set('Please select a parking space');
      return;
    }
    if (!this.reservationData.reserverName?.trim()) {
      this.errorMessage.set('Please enter reserver name');
      return;
    }
    if (!this.reservationData.startTime || !this.reservationData.endTime) {
      this.errorMessage.set('Please select start and end times');
      return;
    }

    this.processing.set(true);
    this.errorMessage.set(null);

    const createData: ParkingReservationCreate = {
      ...this.reservationData,
      spaceId: this.reservationData.spaceId!,
      reserverName: this.reservationData.reserverName!,
      startTime: this.reservationData.startTime!,
      endTime: this.reservationData.endTime!
    };

    this.parkingService.createReservation(createData).subscribe({
      next: (reservation) => {
        this.reservationResult.set(reservation);
        this.success.set(true);
        this.processing.set(false);
        
        // Show success for 5 seconds then close
        setTimeout(() => {
          this.closeModal();
        }, 5000);
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.errorMessage.set(error.error?.message || 'Failed to create reservation');
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

