import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import {
  Dashboard,
  Employee,
  Notification,
  PortalStatistics,
  PortalFilters,
  PortalForm,
  PortalSettings
} from '../models/portal.model';

@Injectable({
  providedIn: 'root'
})
export class PortalService {
  private dashboard = signal<Dashboard | null>(null);
  private employees = signal<Employee[]>([]);
  private notifications = signal<Notification[]>([]);
  private statistics = signal<PortalStatistics | null>(null);
  private loading = signal(false);

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  /**
   * Get company ID from current user
   */
  private getCompanyId(): string {
    const user = this.auth.getCurrentUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }
    // Try both companyId and company_id (from JWT token)
    const companyId = user.companyId || (user as any).company_id;
    if (!companyId) {
      throw new Error('User is not associated with a company');
    }
    return companyId.toString();
  }

  // Getters
  getDashboard = () => this.dashboard.asReadonly();
  getEmployees = () => this.employees.asReadonly();
  getNotifications = () => this.notifications.asReadonly();
  getStatistics = () => this.statistics.asReadonly();
  getLoading = () => this.loading.asReadonly();

  // Dashboard Management
  loadDashboard(dashboardId?: string): Observable<Dashboard> {
    this.loading.set(true);
    try {
      const companyId = this.getCompanyId();
      // Use the correct endpoint: /dashboard/stats/{companyId}
      const endpoint = `/dashboard/stats/${companyId}`;
      return this.api.get<Dashboard>(endpoint).pipe(
        tap((response: any) => {
          this.dashboard.set(response.data || response);
          this.loading.set(false);
        }),
        catchError((error) => {
          console.error('Error loading dashboard:', error);
          this.loading.set(false);
          throw error;
        })
      );
    } catch (error) {
      this.loading.set(false);
      return new Observable(observer => {
        observer.error(error);
      });
    }
  }

  updateDashboard(dashboardId: string, dashboardData: Partial<Dashboard>): Observable<Dashboard> {
    return this.api.put<Dashboard>(`/dashboard/${dashboardId}`, dashboardData);
  }

  // Employee Management
  loadEmployees(params: { page: number; limit: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Observable<{ data: Employee[], total: number }> {
    this.loading.set(true);
    let query = `?page=${params.page}&limit=${params.limit}`;
    if (params.search) {
      query += `&search=${params.search}`;
    }
    if (params.sortBy) {
      query += `&sortBy=${params.sortBy}`;
    }
    if (params.sortOrder) {
      query += `&sortOrder=${params.sortOrder}`;
    }

    return this.api.get<{ data: Employee[], total: number }>(`/employees${query}`).pipe(
      tap((response: any) => {
        // The component will now handle setting its own data
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading employees:', error);
        this.employees.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  createEmployee(employeeData: PortalForm): Observable<Employee> {
    return this.api.post<Employee>('/employees', employeeData);
  }

  updateEmployee(employeeId: string, employeeData: Partial<PortalForm>): Observable<Employee> {
    return this.api.put<Employee>(`/employees/${employeeId}`, employeeData);
  }

  deleteEmployee(employeeId: string): Observable<void> {
    return this.api.delete<void>(`/employees/${employeeId}`);
  }

  // ============================================================================
  // REMOVED: Visitor Management - Moved to VisitorService
  // Use VisitorService for: loadVisitors, createVisitor, updateVisitor, deleteVisitor,
  // checkInVisitor, checkOutVisitor
  // ============================================================================

  // ============================================================================
  // REMOVED: Event Management - Moved to EventService
  // Use EventService for: loadEvents (getAll), createEvent (create), updateEvent (update),
  // deleteEvent (delete), loadEventAttendees (getAttendees), sendEventReminders (sendReminders)
  // ============================================================================

  // ============================================================================
  // REMOVED: Door Management - Moved to DoorService
  // Use DoorService for: loadDoors, getDoorById, createDoor, updateDoor, deleteDoor,
  // grantDoorPermission, revokeDoorPermission, getDoorPermissions
  // ============================================================================

  // ============================================================================
  // REMOVED: Guest Management - Moved to GuestService
  // Use GuestService for: loadGuests, createGuest, updateGuest, deleteGuest
  // ============================================================================

  // ============================================================================
  // REMOVED: Vehicle Management - Moved to VehicleService
  // Use VehicleService for: loadVehicles, createVehicle, updateVehicle, deleteVehicle
  // ============================================================================

  // ============================================================================
  // REMOVED: Location Management - Moved to CompanyLocationService
  // Use CompanyLocationService for: loadLocations, createLocation, updateLocation, deleteLocation
  // ============================================================================

  // ============================================================================
  // REMOVED: Shift Management - Moved to ShiftService
  // Use ShiftService for: loadShifts, getShiftById, createShift, updateShift,
  // deleteShift, assignShiftToEmployee
  // ============================================================================

  // ============================================================================
  // REMOVED: Attendance Management - Moved to TimestampService
  // Use TimestampService for: loadAttendance (getTimestamps), createAttendance, updateAttendance, deleteAttendance
  // ============================================================================

  // ============================================================================
  // REMOVED: Employee Timestamp Management - Moved to TimestampService
  // Use TimestampService for: loadTimestamps (getTimestamps), approveTimestamp, rejectTimestamp,
  // bulkApproveTimestamps, exportTimestamps
  // ============================================================================

  // ============================================================================
  // REMOVED: Report Management - Moved to ReportService
  // Use ReportService for: loadReports, generateReport, downloadReport, exportAttendanceReport, exportEmployeesReport
  // ============================================================================

  // ============================================================================
  // REMOVED: Report Management - Moved to ReportService
  // Use ReportService for: exportAttendanceReport, exportEmployeesReport
  // ============================================================================

  // Notification Management
  loadNotifications(): Observable<Notification[]> {
    this.loading.set(true);
    return this.api.get<Notification[]>('/notifications').pipe(
      tap((response: any) => {
        this.notifications.set(response.data || response || []);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Error loading notifications:', error);
        this.notifications.set([]);
        this.loading.set(false);
        throw error;
      })
    );
  }

  markNotificationAsRead(notificationId: string): Observable<Notification> {
    return this.api.put<Notification>(`/notifications/${notificationId}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.api.put<void>('/notifications/read-all', {});
  }

  // Statistics
  loadStatistics(): Observable<PortalStatistics> {
    this.loading.set(true);
    try {
      const companyId = this.getCompanyId();
      // Use dashboard stats endpoint as portal statistics
      // The endpoint /portal/statistics doesn't exist, so we use dashboard stats
      const endpoint = `/dashboard/stats/${companyId}`;
      return this.api.get<any>(endpoint).pipe(
        tap((response: any) => {
          // Map dashboard stats to PortalStatistics format
          const stats = response.data || response;
          const portalStats: PortalStatistics = {
            totalEmployees: stats.summary?.totalEmployees || 0,
            activeEmployees: stats.summary?.activeEmployees || 0,
            // Note: Visitor, Guest, Vehicle stats are available from their respective services
            totalEvents: stats.summary?.totalEvents || 0,
            checkInsToday: stats.summary?.checkInsToday || 0,
            checkOutsToday: stats.summary?.checkOutsToday || 0,
            ...stats
          };
          this.statistics.set(portalStats);
          this.loading.set(false);
        }),
        catchError((error) => {
          console.error('Error loading statistics:', error);
          this.statistics.set(null);
          this.loading.set(false);
          // Don't throw error - statistics are not critical
          return of(null as any);
        })
      );
    } catch (error) {
      this.loading.set(false);
      this.statistics.set(null);
      // Return empty observable - statistics are not critical
      return of(null as any);
    }
  }

  // Filtering
  filterEmployees(filters: PortalFilters): Employee[] {
    let filtered = this.employees();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.firstName.toLowerCase().includes(search) ||
        employee.lastName.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.department.toLowerCase().includes(search)
      );
    }

    if (filters.department) {
      filtered = filtered.filter(employee => employee.department === filters.department);
    }

    if (filters.status) {
      filtered = filtered.filter(employee => employee.status === filters.status);
    }

    return filtered;
  }

  // ============================================================================
  // REMOVED: filterVisitors - Use VisitorService for visitor filtering
  // ============================================================================

  // Helper methods
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(startTime: string, endTime?: string): string {
    if (!endTime) return 'Ongoing';

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'active': 'text-green-600',
      'inactive': 'text-gray-600',
      'checked_in': 'text-green-600',
      'checked_out': 'text-blue-600',
      'expired': 'text-red-600',
      'present': 'text-green-600',
      'absent': 'text-red-600',
      'late': 'text-yellow-600',
      'open': 'text-green-600',
      'closed': 'text-gray-600',
      'locked': 'text-red-600',
      'online': 'text-green-600',
      'offline': 'text-red-600'
    };

    return statusColors[status] || 'text-gray-600';
  }

  getStatusIcon(status: string): string {
    const statusIcons: Record<string, string> = {
      'active': '✅',
      'inactive': '⏸️',
      'checked_in': '✅',
      'checked_out': '🚪',
      'expired': '⏰',
      'present': '✅',
      'absent': '❌',
      'late': '⏰',
      'open': '🔓',
      'closed': '🔒',
      'locked': '🔐',
      'online': '🟢',
      'offline': '🔴'
    };

    return statusIcons[status] || '❓';
  }
}
