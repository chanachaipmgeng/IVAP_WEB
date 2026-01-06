/**
 * Guest Management Models
 *
 * Guest system for event registration and management
 * Includes Guest, GuestRegistration, GuestService
 *
 * NOTE: Guest is different from Visitor
 * - Guest: For events and special occasions
 * - Visitor: For regular visits
 */

import { UUID, BaseTimestamps } from './base.model';
import { GuestStatus } from './enums.model';

/**
 * Guest Interface
 * Guest information for events
 * Matches GuestResponse schema from backend (guest_schema.py)
 * Uses snake_case to match backend
 */
export interface Guest extends BaseTimestamps {
  // Primary identification
  id: UUID;  // id from backend (UUID)
  company_id: UUID;  // company_id from backend (REQUIRED)

  // Personal information (from GuestBase)
  name: string;  // name from backend (REQUIRED)
  email: string;  // email from backend (EmailStr, REQUIRED)
  phone: string;  // phone from backend (REQUIRED)
  company?: string;  // company from backend (optional)

  // Visit information (from GuestBase)
  purpose: string;  // purpose from backend (REQUIRED)
  host_employee_id?: UUID;  // host_employee_id from backend (optional)
  host_employee_name?: string;  // host_employee_name from backend (optional)
  notes?: string;  // notes from backend (optional)
  expected_duration?: number;  // expected_duration from backend (optional, in minutes)
  expiry_date?: string;  // expiry_date from backend (optional, datetime)

  // Status and tracking (from GuestResponse)
  status: GuestStatus;  // status from backend (REQUIRED: 'pending', 'checked-in', 'checked-out', 'expired')
  check_in_time?: string;  // check_in_time from backend (optional, datetime)
  check_out_time?: string;  // check_out_time from backend (optional, datetime)
}

/**
 * Guest Create Request
 * Matches GuestCreate schema from backend
 */
export interface GuestCreate {
  company_id: UUID;  // REQUIRED
  name: string;
  email: string;
  phone: string;
  company?: string;
  purpose: string;
  host_employee_id?: UUID;
  host_employee_name?: string;
  notes?: string;
  expected_duration?: number;
  expiry_date?: string;
}

/**
 * Guest Update Request
 * Matches GuestUpdate schema from backend
 */
export interface GuestUpdate {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose?: string;
  host_employee_id?: UUID;
  host_employee_name?: string;
  notes?: string;
  expected_duration?: number;
  expiry_date?: string;
  status?: GuestStatus;
}

/**
 * Guest Check-in Request
 * Matches GuestCheckIn schema from backend
 */
export interface GuestCheckIn {
  check_in_time?: string;
  location?: string;
  notes?: string;
}

/**
 * Guest Check-out Request
 * Matches GuestCheckOut schema from backend
 */
export interface GuestCheckOut {
  check_out_time?: string;
  notes?: string;
}

/**
 * Guest Registration
 * Links a guest to a specific event
 */
export interface GuestRegistration extends BaseTimestamps {
  id: UUID;  // registration_id
  guestId: UUID;  // FK to guests.guest_id
  eventId: UUID;  // FK to events.event_id

  registrationCode: string;
  registrationType?: string;

  // Guest info (denormalized for performance)
  fullName: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  position?: string;
  specialRequirements?: string;

  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended';
  confirmedAt?: string;
  cancelledAt?: string;
  attendedAt?: string;
}

/**
 * Guest Registration Create
 */
export interface GuestRegistrationCreate {
  guestId: UUID;
  eventId: UUID;
  registrationType?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  position?: string;
  specialRequirements?: string;
}

/**
 * Guest Service
 * Special services provided to guests
 */
export interface GuestService extends BaseTimestamps {
  id: UUID;  // service_id
  guestId: UUID;  // FK to member.member_id (guest actor)

  serviceType: string;
  serviceName: string;
  description?: string;

  providedAt?: string;
  providedBy?: UUID;

  cost?: number;
  status: 'requested' | 'approved' | 'provided' | 'cancelled';
  notes?: string;
}

/**
 * Guest Service Create
 */
export interface GuestServiceCreate {
  guestId: UUID;
  serviceType: string;
  serviceName: string;
  description?: string;
  cost?: number;
  notes?: string;
}

/**
 * Guest Filters
 */
export interface GuestFilters {
  search?: string;
  company_id?: UUID;
  status?: GuestStatus;
  host_employee_id?: UUID;
  expiry_from?: string;
  expiry_to?: string;
  check_in_from?: string;
  check_in_to?: string;
}

/**
 * Guest Statistics
 */
export interface GuestStats {
  totalGuests: number;
  pendingGuests: number;
  checkedInGuests: number;
  checkedOutGuests: number;
  expiredGuests: number;
  cancelledGuests: number;
  todayGuests: number;
  thisWeekGuests: number;
  thisMonthGuests: number;

  // Event related
  totalRegistrations: number;
  confirmedRegistrations: number;
  attendedRegistrations: number;

  // Service related
  totalServices: number;
  requestedServices: number;
  providedServices: number;
}

/**
 * Guest Summary (lightweight)
 */
export interface GuestSummary {
  id: UUID;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: GuestStatus;
  host_employee_name?: string;
  check_in_time?: string;
}

// ==================== Helper Functions ====================

/**
 * Check if guest is currently checked in
 */
export function isGuestCheckedIn(guest: Guest): boolean {
  return guest.status === GuestStatus.CHECKED_IN;
}

/**
 * Check if guest has expired
 */
export function isGuestExpired(guest: Guest): boolean {
  if (!guest.expiry_date) {
    return false;
  }
  return new Date(guest.expiry_date) < new Date();
}

/**
 * Get guest duration in minutes
 */
export function getGuestDuration(guest: Guest): number | null {
  if (!guest.check_in_time || !guest.check_out_time) {
    return null;
  }
  const checkIn = new Date(guest.check_in_time);
  const checkOut = new Date(guest.check_out_time);
  return Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60));
}

/**
 * Check if guest can check in
 */
export function canGuestCheckIn(guest: Guest): boolean {
  return guest.status === GuestStatus.PENDING && !isGuestExpired(guest);
}

/**
 * Check if guest can check out
 */
export function canGuestCheckOut(guest: Guest): boolean {
  return guest.status === GuestStatus.CHECKED_IN;
}
