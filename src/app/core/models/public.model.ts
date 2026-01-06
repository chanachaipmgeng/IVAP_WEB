export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  publicUrl: string;
  isActive: boolean;
  maxAttendees: number;
  currentAttendees: number;
  registrationDeadline: string;
  requirements: string[];
  instructions: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  settings: {
    allowWalkIns: boolean;
    requireApproval: boolean;
    sendConfirmation: boolean;
    collectAdditionalInfo: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  faceImage: string;
  additionalInfo: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  registeredAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface EventRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  faceImage: File | string; // Can be File or Base64 string
  additionalInfo?: Record<string, any>;
}

export interface VerificationTemplate {
  id: string;
  name: string;
  description: string;
  fields: VerificationField[];
  isActive: boolean;
  companyId: string;
  companyName: string;
  settings: {
    allowMultipleSubmissions: boolean;
    requireApproval: boolean;
    sendNotification: boolean;
    expireAfterDays?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VerificationField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'file' | 'select' | 'textarea' | 'date' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  helpText?: string;
}

export interface VerificationSubmission {
  id: string;
  templateId: string;
  data: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface VerificationSubmissionForm {
  data: Record<string, any>;
}

export interface PublicPageData {
  events: Event[];
  templates: VerificationTemplate[];
  statistics: {
    totalEvents: number;
    activeEvents: number;
    totalRegistrations: number;
    totalVerifications: number;
  };
}

export interface PublicFilters {
  search: string;
  eventType: string;
  dateFrom: string;
  dateTo: string;
  location: string;
}

export interface EventStatistics {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
}

export interface VerificationStatistics {
  totalTemplates: number;
  activeTemplates: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
}
