import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Event,
  EventRegistration,
  EventRegistrationForm,
  VerificationTemplate,
  VerificationSubmission,
  VerificationSubmissionForm,
  PublicPageData,
  PublicFilters,
  EventStatistics,
  VerificationStatistics
} from '../models/public.model';

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private events = signal<Event[]>([]);
  private templates = signal<VerificationTemplate[]>([]);
  private loading = signal(false);

  constructor(private api: ApiService) {}

  // Getters
  getEvents = () => this.events.asReadonly();
  getTemplates = () => this.templates.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Event Management
  loadEvents(): Observable<Event[]> {
    this.loading.set(true);
    return this.api.get<Event[]>('/events/public').pipe(
      tap((response: any) => {
        this.events.set(response.data || response || []);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading events:', error);
        this.events.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  getEventByPublicUrl(publicUrl: string): Observable<Event> {
    this.loading.set(true);
    // Backend endpoint is /events/public/details/{public_url}
    return this.api.get<Event>(`/events/public/details/${publicUrl}`).pipe(
      tap((response: any) => {
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading event:', error);
        this.loading.set(false);
        throw error;
      })
    );
  }

  registerForEvent(publicUrl: string, registrationData: EventRegistrationForm): Observable<EventRegistration> {
    // Convert File to Base64 string
    return new Observable<EventRegistration>(observer => {
      if (registrationData.faceImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          
          // Ensure base64 string has proper format
          if (!base64String.startsWith('data:image/')) {
            observer.error(new Error('Invalid image format. Please upload a valid image file.'));
            return;
          }
          
          // Prepare JSON payload
          const payload = {
            email: registrationData.email.trim(),
            firstName: registrationData.firstName.trim(),
            lastName: registrationData.lastName.trim(),
            faceImage: base64String
          };

          this.api.post<EventRegistration>(
            `/events/public/register/${publicUrl}`,
            payload,
            undefined,
            { skipTransform: true }
          ).subscribe({
            next: (response) => observer.next(response),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          });
        };
        reader.onerror = (error) => observer.error(error);
        reader.readAsDataURL(registrationData.faceImage);
      } else {
        // If already a base64 string, ensure it has proper format
        if (!registrationData.faceImage || !registrationData.faceImage.startsWith('data:image/')) {
          observer.error(new Error('Invalid image format. Please upload or capture a valid image.'));
          return;
        }
        
        // Prepare JSON payload
        const payload = {
          email: registrationData.email.trim(),
          firstName: registrationData.firstName.trim(),
          lastName: registrationData.lastName.trim(),
          faceImage: registrationData.faceImage
        };

        this.api.post<EventRegistration>(
          `/events/public/register/${publicUrl}`,
          payload,
          undefined,
          { skipTransform: true }
        ).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      }
    });
  }

  // Verification Management
  loadTemplates(): Observable<VerificationTemplate[]> {
    this.loading.set(true);
    return this.api.get<VerificationTemplate[]>('/verify/templates/public').pipe(
      tap((response: any) => {
        this.templates.set(response.data || response || []);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading templates:', error);
        this.templates.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  getTemplateById(templateId: string): Observable<VerificationTemplate> {
    this.loading.set(true);
    return this.api.get<VerificationTemplate>(`/verify/templates/${templateId}`).pipe(
      tap((response: any) => {
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading template:', error);
        this.loading.set(false);
        throw error;
      })
    );
  }

  submitVerification(templateId: string, submissionData: VerificationSubmissionForm): Observable<VerificationSubmission> {
    return this.api.post<VerificationSubmission>(`/verify/public/${templateId}`, submissionData);
  }

  // Statistics
  getEventStatistics(): Observable<EventStatistics> {
    return this.api.get<EventStatistics>('/events/public/statistics');
  }

  getVerificationStatistics(): Observable<VerificationStatistics> {
    return this.api.get<VerificationStatistics>('/verify/public/statistics');
  }

  // Filtering
  filterEvents(filters: PublicFilters): Event[] {
    let filtered = this.events();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.location.toLowerCase().includes(search)
      );
    }

    if (filters.eventType) {
      // Add event type filtering logic here
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(event =>
        new Date(event.startDate) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event =>
        new Date(event.startDate) <= new Date(filters.dateTo)
      );
    }

    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase()) ||
        event.city.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    return filtered;
  }

  // Helper methods
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

  formatDateShort(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  isEventActive(event: Event): boolean {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return event.isActive && now >= startDate && now <= endDate;
  }

  isEventUpcoming(event: Event): boolean {
    const now = new Date();
    const startDate = new Date(event.startDate);
    return event.isActive && now < startDate;
  }

  isEventPast(event: Event): boolean {
    const now = new Date();
    const endDate = new Date(event.endDate);
    return now > endDate;
  }

  canRegisterForEvent(event: Event): boolean {
    if (!event.isActive) return false;

    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    const maxAttendees = event.maxAttendees;
    const currentAttendees = event.currentAttendees;

    return now <= registrationDeadline && currentAttendees < maxAttendees;
  }

  getRegistrationStatus(event: Event): 'open' | 'closed' | 'full' | 'expired' {
    if (!event.isActive) return 'closed';

    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    const maxAttendees = event.maxAttendees;
    const currentAttendees = event.currentAttendees;

    if (now > registrationDeadline) return 'expired';
    if (currentAttendees >= maxAttendees) return 'full';
    return 'open';
  }

  // File handling
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please select a valid image file (JPEG, PNG, or WebP)' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true };
  }

  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Check check-in status
  checkCheckInStatus(publicUrl: string, email: string): Observable<any> {
    // Backend endpoint uses query parameter: /events/public/{public_url}/check-status?email={email}
    return this.api.get<any>(`/events/public/${publicUrl}/check-status`, { email: email });
  }

  // Mock data for development
  getMockEvents(): Event[] {
    return [
      {
        id: '1',
        name: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations',
        startDate: '2024-12-30T09:00:00Z',
        endDate: '2024-12-30T17:00:00Z',
        location: 'Convention Center',
        address: '123 Main St',
        city: 'Bangkok',
        state: 'Bangkok',
        country: 'Thailand',
        postalCode: '10110',
        publicUrl: 'tech-conf-2024',
        isActive: true,
        maxAttendees: 500,
        currentAttendees: 250,
        registrationDeadline: '2024-12-28T23:59:59Z',
        requirements: ['Valid ID', 'Face photo'],
        instructions: 'Please arrive 30 minutes early for check-in',
        contactInfo: {
          name: 'Event Organizer',
          email: 'events@example.com',
          phone: '+66-2-123-4567'
        },
        settings: {
          allowWalkIns: false,
          requireApproval: true,
          sendConfirmation: true,
          collectAdditionalInfo: true
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-12-25T10:30:00Z'
      }
    ];
  }

  getMockTemplates(): VerificationTemplate[] {
    return [
      {
        id: '1',
        name: 'Visitor Verification',
        description: 'Verify visitor identity and purpose',
        fields: [
          {
            id: 'name',
            label: 'Full Name',
            type: 'text',
            required: true,
            placeholder: 'Enter your full name'
          },
          {
            id: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            placeholder: 'Enter your email'
          },
          {
            id: 'phone',
            label: 'Phone Number',
            type: 'phone',
            required: false,
            placeholder: 'Enter your phone number'
          },
          {
            id: 'purpose',
            label: 'Purpose of Visit',
            type: 'select',
            required: true,
            options: ['Meeting', 'Interview', 'Delivery', 'Other']
          },
          {
            id: 'photo',
            label: 'Photo ID',
            type: 'file',
            required: true,
            helpText: 'Upload a clear photo of your ID'
          }
        ],
        isActive: true,
        companyId: '1',
        companyName: 'Example Company',
        settings: {
          allowMultipleSubmissions: false,
          requireApproval: true,
          sendNotification: true,
          expireAfterDays: 30
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-12-25T10:30:00Z'
      }
    ];
  }
}
