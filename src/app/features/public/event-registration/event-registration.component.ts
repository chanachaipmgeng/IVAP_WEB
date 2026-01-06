/**
 * Event Registration Component
 *
 * Public component for event registration with face recognition.
 * Supports event registration form, face capture, and registration submission.
 *
 * @example
 * ```html
 * <app-event-registration></app-event-registration>
 * ```
 */

import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassInputComponent } from '../../../shared/components/glass-input/glass-input.component';
import { PublicService } from '../../../core/services/public.service';
import { EventService } from '../../../core/services/event.service';
import { I18nService } from '../../../core/services/i18n.service';
import { firstValueFrom } from 'rxjs';
import { FaceRecognitionComponent } from '../../../shared/components/face-recognition/face-recognition.component';
import { FaceDetectionResult } from '../../../core/services/face-detection.service';
import { BaseComponent } from '../../../core/base/base.component';

import { ImageOptimizationDirective } from '../../../shared/directives/image-optimization.directive';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    GlassInputComponent,
    FaceRecognitionComponent,
    NgOptimizedImage,
    ImageOptimizationDirective
  ],
  templateUrl: './event-registration.component.html',
  styleUrl: './event-registration.component.scss'
})
export class EventRegistrationComponent extends BaseComponent implements OnInit {
  @ViewChild(FaceRecognitionComponent) faceComponent!: FaceRecognitionComponent;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  publicUrl = signal<string>('');
  loading = signal(false);
  event = signal<any>(null);
  faceImagePreview = signal<string | null>(null);

  /**
   * Check if image URL is Base64 encoded
   */
  isBase64Image(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('data:image/') || url.startsWith('data:image/svg+xml');
  }
  showCameraModal = signal(false);
  errorMessage = signal<string | null>(null);
  validationErrors = signal<string[]>([]);
  faceDetected = signal(false);
  faceDetectionMessage = signal<string>('Position your face in front of the camera');

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private publicService: PublicService,
    private eventService: EventService,
    public i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.route.params,
      (params: any) => {
        this.publicUrl.set(params['publicUrl']);
        this.loadEventDetails();
      }
    );
  }

  async loadEventDetails(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.eventService.getPublicEventDetails(this.publicUrl()));
      this.event.set(response);
    } catch (error) {
      console.error('Error loading event:', error);
      this.event.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async submitRegistration(): Promise<void> {
    // Clear previous errors
    this.errorMessage.set(null);
    this.validationErrors.set([]);

    if (!this.isFormValid()) {
      this.errorMessage.set('Please fill in all required fields and upload a face image.');
      return;
    }

    // Validate face image format
    const faceImage = this.faceImagePreview();
    if (!faceImage || !faceImage.startsWith('data:image/')) {
      this.errorMessage.set('Please upload or capture a valid face image.');
      return;
    }

    this.loading.set(true);
    try {
      await firstValueFrom(this.eventService.registerForPublicEvent(this.publicUrl(), {
        email: this.formData.email.trim(),
        firstName: this.formData.firstName.trim(),
        lastName: this.formData.lastName.trim(),
        faceImage: faceImage // Already in correct format (data:image/jpeg;base64,...)
      }));
      this.router.navigate(['/events/register', this.publicUrl(), 'confirm']);
    } catch (error: any) {
      console.error('Error registering:', error);

      let validationErrors: string[] = [];
      let errorMsg = 'Registration failed. Please try again.';

      // Get error response body (HttpErrorResponse.error contains the response body)
      const errorBody = error?.error;

      if (errorBody) {
        if (errorBody.validationErrors && Array.isArray(errorBody.validationErrors)) {
          validationErrors = errorBody.validationErrors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.field && err.message) return `${err.field}: ${err.message}`;
            return JSON.stringify(err);
          });
          errorMsg = 'Please fix the following errors:';
        }
        else if (errorBody.validation_errors && Array.isArray(errorBody.validation_errors)) {
          validationErrors = errorBody.validation_errors.map((err: any) => {
            if (typeof err === 'string') return err;
            if (err.field && err.message) return `${err.field}: ${err.message}`;
            if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`;
            return JSON.stringify(err);
          });
          errorMsg = 'Please fix the following errors:';
        }
        else if (errorBody.error?.message) {
          errorMsg = errorBody.error.message;
        } else if (errorBody.detail) {
          errorMsg = errorBody.detail;
        } else if (errorBody.message) {
          errorMsg = errorBody.message;
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }

      if (validationErrors.length === 0) {
        console.warn('No validation errors found in response:', errorBody);
      }

      this.validationErrors.set(validationErrors);
      this.errorMessage.set(errorMsg);
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }

  captureFaceImage(): void {
    this.showCameraModal.set(true);
  }

  onFaceDetected(detections: FaceDetectionResult[]): void {
    if (detections.length > 0) {
      this.faceDetected.set(true);
      this.faceDetectionMessage.set('Face detected! Click Capture Photo when ready.');
    } else {
      this.faceDetected.set(false);
      this.faceDetectionMessage.set('Position your face in front of the camera');
    }
  }

  async capturePhoto(): Promise<void> {
    if (!this.faceComponent || !this.faceComponent.videoElement) {
      return;
    }

    if (!this.faceDetected()) {
      this.errorMessage.set('Please ensure your face is clearly visible and properly positioned before capturing.');
      return;
    }

    const video = this.faceComponent.videoElement.nativeElement;

    // Create a temporary canvas if not available in view
    let canvas = this.canvasElement?.nativeElement;
    if (!canvas) {
      canvas = document.createElement('canvas');
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    this.faceImagePreview.set(imageData);

    // Close modal
    this.closeCameraModal();
    this.errorMessage.set(null);
  }

  closeCameraModal(): void {
    this.showCameraModal.set(false);
    this.faceDetected.set(false);
  }

  override ngOnDestroy(): void {
    // FaceRecognitionComponent handles its own cleanup
    super.ngOnDestroy();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isFormValid(): boolean {
    return !!(
      this.formData.firstName &&
      this.formData.lastName &&
      this.formData.email &&
      this.faceImagePreview()
    );
  }
}
