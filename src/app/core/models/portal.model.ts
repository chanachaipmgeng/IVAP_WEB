export interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'hr' | 'safety' | 'performance' | 'accessibility' | 'hardware';
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'map' | 'calendar' | 'list';
  title: string;
  data: any;
  position: { x: number; y: number; w: number; h: number };
  settings: Record<string, any>;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gap: number;
  breakpoints: Record<string, any>;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  managerId?: string;
  managerName?: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  avatar?: string;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose: string;
  hostEmployeeId: string;
  hostEmployeeName: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked_in' | 'checked_out' | 'expired';
  photo?: string;
  idDocument?: string;
  notes?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  hostEmployeeId: string;
  hostEmployeeName: string;
  purpose: string;
  expectedArrival: string;
  actualArrival?: string;
  departure?: string;
  status: 'expected' | 'arrived' | 'departed' | 'cancelled';
  photo?: string;
  notes?: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: 'car' | 'motorcycle' | 'truck' | 'van' | 'other';
  brand?: string;
  model?: string;
  color?: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'parked' | 'departed' | 'expired';
  location: string;
  spotNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  eventId?: string;
  name: string;
  eventName?: string;
  description: string;
  type?: 'meeting' | 'training' | 'conference' | 'social' | 'workshop' | 'seminar' | 'webinar' | 'other';
  eventType?: 'meeting' | 'training' | 'conference' | 'social' | 'workshop' | 'seminar' | 'webinar' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  organizerId?: string;
  organizerName?: string;
  attendees?: EventAttendee[];
  maxAttendees?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'upcoming' | 'active' | 'past';
  isPublic?: boolean;
  publicUrl?: string;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  employeeId?: string;
  visitorId?: string;
  name: string;
  email: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: string;
  attendedAt?: string;
}

export interface Door {
  id: string;
  name: string;
  location: string;
  type: 'main' | 'emergency' | 'service' | 'restricted';
  status: 'open' | 'closed' | 'locked' | 'unlocked' | 'maintenance';
  accessLevel: 'public' | 'employee' | 'admin' | 'restricted';
  lastAccess?: string;
  lastAccessedBy?: string;
  isOnline: boolean;
  hardwareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: { lat: number; lng: number };
  type: 'office' | 'warehouse' | 'factory' | 'retail' | 'other';
  capacity?: number;
  isActive: boolean;
  parentLocationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  isActive: boolean;
  employees: ShiftEmployee[];
  createdAt: string;
  updatedAt: string;
}

export interface ShiftEmployee {
  id: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  assignedDate: string;
  status: 'scheduled' | 'present' | 'absent' | 'late';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';
  location: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'attendance' | 'visitor' | 'security' | 'performance' | 'custom';
  parameters: ReportParameters;
  data: any[];
  generatedAt: string;
  generatedBy: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportParameters {
  dateFrom: string;
  dateTo: string;
  department?: string;
  location?: string;
  employeeId?: string;
  includeInactive?: boolean;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'security' | 'attendance' | 'visitor' | 'general';
  isRead: boolean;
  isActionRequired: boolean;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortalStatistics {
  totalEmployees: number;
  activeEmployees: number;
  totalVisitors: number;
  activeVisitors: number;
  totalGuests: number;
  activeGuests: number;
  totalVehicles: number;
  parkedVehicles: number;
  totalEvents: number;
  upcomingEvents: number;
  totalDoors: number;
  onlineDoors: number;
  totalLocations: number;
  activeLocations: number;
  totalShifts: number;
  activeShifts: number;
  totalReports: number;
  unreadNotifications: number;
}

export interface PortalFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  department: string;
  location: string;
  status: string;
  type: string;
}

export interface PortalForm {
  // Common form fields
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  department?: string;
  status?: string;
  notes?: string;
  // Visitor specific fields
  company?: string;
  purpose?: string;
  hostEmployee?: string;
  // Employee specific fields
  firstName?: string;
  lastName?: string;
  employeeId?: string;
  position?: string;
  managerId?: string;
  hireDate?: string;
  avatar?: string;
  permissions?: string[];
  // Vehicle specific fields
  licensePlate?: string;
  vehicleType?: string;
  brand?: string;
  model?: string;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  spotNumber?: string;
  // Event specific fields
  eventName?: string;
  eventDescription?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  publicUrl?: string;
  organizerId?: string;
  maxAttendees?: number;
  isPublic?: boolean;
  requirements?: string[];
  // Door specific fields
  doorCode?: string;
  deviceId?: string;
  hardwareId?: string;
  accessLevel?: string;
  // Location specific fields
  address?: string;
  coordinates?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  capacity?: number;
  parentLocationId?: string;
}

export interface PortalSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultLayout: string;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  security: {
    sessionTimeout: number;
    requireMFA: boolean;
    passwordPolicy: string;
  };
}
