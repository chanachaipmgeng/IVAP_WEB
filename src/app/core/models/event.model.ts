/**
 * Event Models
 * 
 * Represents events and event management
 * Matches backend Event model and schema
 */

import { UUID, BaseTimestamps } from './base.model';

/**
 * Event Status Enum
 */
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

/**
 * Event Type Enum
 */
export type EventType = 'meeting' | 'training' | 'conference' | 'social' | 'workshop' | 'seminar' | 'webinar' | 'other';

/**
 * Registration Status Enum
 */
export type RegistrationStatus = 'registered' | 'attended' | 'cancelled';

/**
 * Event Interface
 * Represents an event
 */
export interface Event extends BaseTimestamps {
  // Primary key
  id: UUID;  // event_id in backend
  
  // Event information
  eventName: string;  // event_name in backend
  description?: string;  // description in backend
  startDate: string;  // start_date in backend (DateTime)
  endDate: string;  // end_date in backend (DateTime)
  location?: string;  // location in backend
  
  // Event configuration
  publicUrl?: string;  // public_url in backend (unique URL slug)
  status: EventStatus;  // status in backend
  eventType?: EventType;  // event_type in backend
  maxAttendees?: number;  // max_attendees in backend (null for unlimited)
  
  // Foreign key
  companyId: UUID;  // company_id in backend
}

/**
 * Event Create Request
 */
export interface EventCreate {
  eventName: string;
  description?: string;
  startDate: string;  // ISO 8601 datetime string
  endDate: string;  // ISO 8601 datetime string
  location?: string;
  publicUrl?: string;  // Unique URL slug
  status?: EventStatus;
  eventType?: EventType;
  maxAttendees?: number;
}

/**
 * Event Update Request
 */
export interface EventUpdate {
  eventName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  publicUrl?: string;
  status?: EventStatus;
  eventType?: EventType;
  maxAttendees?: number;
}

/**
 * Event Response (from API)
 */
export interface EventResponse extends Event {
  // All fields from Event interface
}

/**
 * Event Attendee Interface
 * Represents an attendee registered for an event
 */
export interface EventAttendee {
  id: UUID;  // attendee_id in backend
  eventId: UUID;  // event_id in backend
  memberId: UUID;  // member_id in backend
  status: RegistrationStatus;  // status in backend
  checkInTime?: string;  // check_in_time in backend (DateTime)
  checkOutTime?: string;  // check_out_time in backend (DateTime)
  durationMinutes?: string;  // duration_minutes in backend (Format: "HH:MM")
  gender?: string;  // gender in backend ('male' or 'female')
  ageRange?: string;  // age_range in backend ('10s', '20s', '30s', '40s', '50s', '60s', '70s', '80+')
  memberFirstName?: string;  // member_first_name in backend
  memberLastName?: string;  // member_last_name in backend
  createdAt: string;
}

/**
 * Event Attendee Create Request
 */
export interface EventAttendeeCreate {
  memberId: UUID;
  eventId: UUID;
}

/**
 * Event Attendee Response (from API)
 */
export interface EventAttendeeResponse extends EventAttendee {
  // All fields from EventAttendee interface
}

/**
 * Public Registration Request
 * Used for public event registration
 */
export interface PublicRegistrationRequest {
  email: string;
  firstName: string;
  lastName: string;
  faceImage: string;  // Base64 encoded image data string
}

/**
 * Public Event Response
 * Event details for public registration page
 */
export interface PublicEventResponse {
  eventName: string;
  description?: string;
  startDate: string;
  endDate: string;
}

/**
 * Event QR Code Response
 */
export interface EventQRCodeResponse {
  qrCodeData: string;  // Base64 encoded QR code image
  qrCodeUrl: string;  // URL to display QR code
  checkInUrl: string;  // URL for check-in
  expirationDate?: string;  // QR code expiration date
}

/**
 * Registration Trend Item
 */
export interface RegistrationTrendItem {
  date: string;  // Date in YYYY-MM-DD format
  count: number;  // Number of registrations on this date
}

/**
 * Attendance By Date Item
 */
export interface AttendanceByDateItem {
  date: string;  // Date in YYYY-MM-DD format
  attendance: number;  // Number of attendees on this date
}

/**
 * Event Statistics Response
 */
export interface EventStatisticsResponse {
  totalRegistrations: number;  // total_registrations in backend
  confirmedEmails: number;  // confirmed_emails in backend
  checkedIn: number;  // checked_in in backend
  attendanceRate: number;  // attendance_rate in backend (Percentage 0-100)
  registrationTrend: RegistrationTrendItem[];  // registration_trend in backend
  attendanceByDate: AttendanceByDateItem[];  // attendance_by_date in backend
}

/**
 * Event Reminder Request
 * Note: eventId is sent in URL path, not in request body
 */
export interface EventReminderRequest {
  reminderType: 'email' | 'sms';  // reminder_type in backend
  reminderTime?: string;  // reminder_time in backend (e.g., '24_hours_before', '1_hour_before')
  message?: string;  // message in backend
}

/**
 * Event Reminder Response
 */
export interface EventReminderResponse {
  success: boolean;  // success in backend
  emailsSent: number;  // emails_sent in backend
  messagesSent: number;  // messages_sent in backend
  message: string;  // message in backend
}

/**
 * Email Confirmation Response
 */
export interface EmailConfirmationResponse {
  success: boolean;
  message: string;
}

/**
 * Event Filters
 */
export interface EventFilters {
  search?: string;
  companyId?: UUID;
  status?: EventStatus;
  eventType?: EventType;
  startDateFrom?: string;
  startDateTo?: string;
}

/**
 * Event Statistics
 */
export interface EventStatistics {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  eventsByType: Record<EventType, number>;
  eventsByStatus: Record<EventStatus, number>;
}
