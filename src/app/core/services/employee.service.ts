import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { UUID, PaginatedResponse } from '../models/base.model';
import {
  EmployeeDisplay,
  EmployeeListItem,
  EmployeeDetail,
  EmployeeCreateForm,
  EmployeeUpdateForm,
  EmployeeFilters,
  EmployeeStatistics,
  toEmployeeListItem,
  isEmployeeAdmin,
  getEmployeeTenure,
  isCurrentlyEmployed
} from '../models/employee-display.model';
import { Member } from '../models/member.model';
import { CompanyEmployee } from '../models/company-employee.model';
import { EmployeeHierarchy } from '../models/employee.model';

// Export aliases for backward compatibility
export type { EmployeeDisplay as Employee } from '../models/employee-display.model';
export type { EmployeeStatistics as EmployeeStats } from '../models/employee-display.model';
export type { EmployeeHierarchy };

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private currentEmployeeSubject = new BehaviorSubject<EmployeeDisplay | null>(null);
  public currentEmployee$ = this.currentEmployeeSubject.asObservable();

  constructor(
    private api: ApiService,
    private auth: AuthService
  ) {}

  /**
   * Get company ID from current user or JWT token
   */
  private getCompanyId(): string {
    // First try to get from user object
    const user = this.auth.getCurrentUser();
    if (user) {
      const companyId = user.companyId || (user as any).company_id;
      if (companyId) {
        return companyId.toString();
      }
    }

    // If not in user object, try to decode from JWT token
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        // Decode JWT token (base64url decode payload)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          const companyId = payload.company_id || payload.companyId;
          if (companyId) {
            return companyId.toString();
          }
        }
      } catch (e) {
        console.warn('Failed to decode JWT token:', e);
      }
    }

    throw new Error('User is not associated with a company');
  }

  // ==================== Employee CRUD ====================

  /**
   * Get employees with filtering and pagination
   * Returns paginated list of employees
   * Backend: GET /api/v1/employees/
   */
  public getEmployees(filters?: EmployeeFilters): Observable<PaginatedResponse<EmployeeDisplay>> {
    // Get company_id from current user and add to filters
    const companyId = this.getCompanyId();
    const filtersWithCompany = {
      ...filters,
      company_id: companyId
    };

    return this.api.get<any>('/employees/', filtersWithCompany).pipe(
      map(response => ({
        ...response,
        data: response.data?.map((item: any) => this.transformBackendToDisplay(item)) || []
      }))
    );
  }

  /**
   * Get employees as simple list (without pagination)
   */
  public getEmployeesList(filters?: EmployeeFilters): Observable<EmployeeListItem[]> {
    return this.getEmployees(filters).pipe(
      map(response => (response.data || []).map(emp => toEmployeeListItem(emp)))  // Handle undefined
    );
  }

  /**
   * Get a single employee by ID
   * Returns complete employee details
   * Backend: GET /api/v1/employees/{employee_id}
   */
  public getEmployeeById(id: UUID): Observable<EmployeeDetail> {
    return this.api.get<any>(`/employees/${id}`).pipe(
      map(response => this.transformBackendToDisplay(response) as EmployeeDetail)
    );
  }

  /**
   * Create a new employee
   * Creates both Member and CompanyEmployee records
   * Backend: POST /api/v1/employees/
   * Note: Must transform EmployeeCreateForm to CompanyEmployeePost format
   */
  public createEmployee(employeeData: EmployeeCreateForm): Observable<EmployeeDisplay> {
    // Transform frontend form to backend schema format
    const backendData = this.transformCreateFormToBackend(employeeData);
    return this.api.post<EmployeeDisplay>('/employees', backendData).pipe(
      map(response => this.transformBackendToDisplay(response))
    );
  }

  /**
   * Transform EmployeeCreateForm to backend CompanyEmployeePost format
   */
  private transformCreateFormToBackend(form: EmployeeCreateForm): any {
    // Helper to check if value is valid UUID (not undefined, null, empty string, or "undefined" string)
    const isValidId = (id: any): boolean => {
      if (!id) return false;
      if (typeof id === 'string' && (id === '' || id === 'undefined' || id === 'null')) return false;
      return true;
    };

    return {
      member: {
        email: form.email,
        first_name: form.first_name,  // snake_case
        last_name: form.last_name,  // snake_case
        phone_number: (form as any).phone_number || (form as any).phone || undefined,  // snake_case
        picture: (form as any).picture || undefined
      },
      position: isValidId(form.position_id) ? {  // snake_case
        position_id: form.position_id,  // snake_case
        th_name: '', // Will be filled by backend if needed
        eng_name: ''
      } : undefined,
      department: isValidId(form.department_id) ? {  // snake_case
        department_id: form.department_id,  // snake_case
        th_name: '', // Will be filled by backend if needed
        eng_name: ''
      } : undefined,
      employee_id: form.employee_id || undefined,  // snake_case
      salary: form.salary || undefined,
      boss_id: form.boss_id || undefined,  // snake_case
      company_role_type: form.company_role_type,  // snake_case
      emp_type: form.emp_type,  // snake_case
      start_date: form.start_date  // snake_case
    };
  }

  /**
   * Update an existing employee
   * Updates both Member and CompanyEmployee data
   * Backend: PUT /api/v1/employees/{employee_id}
   * Note: Must transform EmployeeUpdateForm to CompanyEmployeeUpdate format
   */
  public updateEmployee(id: UUID, updates: EmployeeUpdateForm): Observable<EmployeeDisplay> {
    // Transform frontend form to backend schema format
    const backendData = this.transformUpdateFormToBackend(id, updates);
    return this.api.put<EmployeeDisplay>(`/employees/${id}`, backendData).pipe(
      map(response => this.transformBackendToDisplay(response))
    );
  }

  /**
   * Transform EmployeeUpdateForm to backend CompanyEmployeeUpdate format
   */
  private transformUpdateFormToBackend(employeeId: UUID, form: EmployeeUpdateForm): any {
    // Helper to check if value is valid UUID (not undefined, null, empty string, or "undefined" string)
    const isValidId = (id: any): boolean => {
      if (!id) return false;
      if (typeof id === 'string' && (id === '' || id === 'undefined' || id === 'null')) return false;
      return true;
    };

    // Build member object only if there are fields to update
    const memberData: any = {};
    if (form.email !== undefined) memberData.email = form.email || '';
    if (form.first_name !== undefined) memberData.first_name = form.first_name;  // snake_case
    if (form.last_name !== undefined) memberData.last_name = form.last_name;  // snake_case
    if ((form as any).phone_number !== undefined) memberData.phone_number = (form as any).phone_number || undefined;  // snake_case
    if (form.picture !== undefined) memberData.picture = form.picture || undefined;

    return {
      member: Object.keys(memberData).length > 0 ? memberData : {
        email: form.email || '',
        first_name: form.first_name,  // snake_case
        last_name: form.last_name,  // snake_case
        phone_number: (form as any).phone_number || undefined,  // snake_case
        picture: form.picture || undefined
      },
      position: isValidId(form.position_id) ? {  // snake_case
        position_id: form.position_id,  // snake_case
        th_name: '',
        eng_name: ''
      } : undefined,
      department: isValidId(form.department_id) ? {  // snake_case
        department_id: form.department_id,  // snake_case
        th_name: '',
        eng_name: ''
      } : undefined,
      employee_id: form.employee_id || undefined,  // snake_case
      salary: form.salary !== undefined ? form.salary : undefined,
      boss_id: form.boss_id || undefined,  // snake_case
      company_employee_id: employeeId, // Required in backend
      company_role_type: form.company_role_type || 'EMPLOYEE',  // snake_case
      emp_type: form.emp_type || 'FULL_TIME',  // snake_case
      // Note: start_date is required in backend but may not be in update form
      // If not provided, we need to get it from existing employee data
      start_date: (form as any).startDate || new Date().toISOString() // Required in backend - may need to fetch from existing employee
    };
  }

  /**
   * Transform backend CompanyEmployeeResponse to frontend EmployeeDisplay
   */
  private transformBackendToDisplay(backend: any): EmployeeDisplay {
    // Handle both object format (from FastAPI serialization) and dict format
    const member = backend.member || {};
    const department = backend.department || {};
    const position = backend.position || {};

    // Extract IDs - handle both snake_case and camelCase
    const companyEmployeeId = backend.company_employee_id || backend.companyEmployeeId || backend.id;
    const memberId = member.member_id || member.memberId || backend.memberId;
    const companyId = backend.company_id || backend.companyId;
    const departmentId = department.department_id || department.departmentId || backend.departmentId;
    const positionId = position.position_id || position.positionId || backend.positionId;

    // Extract employee info
    const employeeId = backend.employee_id || backend.employeeId;
    const firstName = member.first_name || member.firstName || backend.firstName || '';
    const lastName = member.last_name || member.lastName || backend.lastName || '';
    const email = member.email || backend.email || '';
    const phoneNumber = member.phone_number || member.phoneNumber || backend.phoneNumber;
    const picture = member.picture || backend.picture;

    // Extract department/position names
    const departmentName = department.th_name || department.eng_name || backend.departmentName || backend.department;
    const positionName = position.th_name || position.eng_name || backend.positionName || backend.position;

    return {
      ...backend,
      // Flatten nested structure
      id: companyEmployeeId, // This is the key field for updates/deletes
      memberId: memberId,
      companyId: companyId,
      email: email,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      picture: picture,
      departmentName: departmentName,
      positionName: positionName,
      departmentId: departmentId,
      positionId: positionId,
      employeeId: employeeId,
      salary: backend.salary || 0,
      bossId: backend.boss_id || backend.bossId || '',
      companyRoleType: backend.company_role_type || backend.companyRoleType || 'EMPLOYEE',
      empType: backend.emp_type || backend.empType || 'FULL_TIME',
      startDate: backend.start_date || backend.startDate || '',
      fullName: `${firstName} ${lastName}`.trim() || email,
      displayName: `${firstName} ${lastName}`.trim() || email,
      // Additional fields
      username: member.username || backend.username || email,
      actorType: member.actor_type || backend.actorType || 'member',
      memberType: member.member_type || backend.memberType,
      roles: member.roles || backend.roles || [],
      permissions: member.permissions || backend.permissions || [],
      isActive: backend.is_active !== undefined ? backend.is_active : (backend.isActive !== undefined ? backend.isActive : true),
      status: backend.is_active === false || backend.isActive === false ? 'inactive' : 'active'
    } as EmployeeDisplay;
  }

  /**
   * Delete an employee
   * Soft delete - sets isActive to false
   */
  public deleteEmployee(id: UUID): Observable<void> {
    return this.api.delete<void>(`/employees/${id}`);
  }

  /**
   * Deactivate an employee (soft delete)
   */
  public deactivateEmployee(id: UUID, leftAt?: string): Observable<EmployeeDisplay> {
    // Note: isActive is not in EmployeeUpdateForm, need to update member status instead
    // This would require updating the member's is_active field via member service
    return this.updateEmployee(id, {
      company_employee_id: id,
      start_date: new Date().toISOString() // Required field
    } as EmployeeUpdateForm);
  }

  /**
   * Reactivate an employee
   */
  public reactivateEmployee(id: UUID): Observable<EmployeeDisplay> {
    // Note: isActive is not in EmployeeUpdateForm, need to update member status instead
    return this.updateEmployee(id, {
      company_employee_id: id,
      start_date: new Date().toISOString() // Required field
    } as EmployeeUpdateForm);
  }

  // ==================== Member Operations ====================

  /**
   * Get member information by member ID
   */
  public getMemberById(memberId: UUID): Observable<Member> {
    return this.api.get<Member>(`/members/${memberId}`);
  }

  /**
   * Update member information
   */
  public updateMember(memberId: UUID, updates: Partial<Member>): Observable<Member> {
    return this.api.put<Member>(`/members/${memberId}`, updates);
  }

  // ==================== Company Employee Operations ====================

  /**
   * Get company employee record by ID
   */
  public getCompanyEmployeeById(id: UUID): Observable<CompanyEmployee> {
    return this.api.get<CompanyEmployee>(`/company-employees/${id}`);
  }

  /**
   * Get all company employees for a company
   */
  public getCompanyEmployees(companyId: UUID, filters?: EmployeeFilters): Observable<PaginatedResponse<EmployeeDisplay>> {
    return this.api.get<PaginatedResponse<EmployeeDisplay>>('/employees/', {
      ...filters,
      company_id: companyId.toString()
    });
  }

  // ==================== Statistics & Reports ====================

  /**
   * Get employee statistics
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  public getEmployeeStats(companyId?: UUID): Observable<EmployeeStatistics> {
    // TODO: Check if backend has /employees/stats endpoint
    // If not, remove this function or implement client-side calculation
    return this.api.get<EmployeeStatistics>('/employees/stats', companyId ? { companyId } : undefined);
  }

  /**
   * Get employee hierarchy for organization chart
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  public getEmployeeHierarchy(companyId?: UUID): Observable<EmployeeHierarchy[]> {
    // TODO: Check if backend has /employees/hierarchy endpoint
    // If not, remove this function or implement client-side calculation
    return this.api.get<EmployeeHierarchy[]>('/employees/hierarchy', companyId ? { companyId } : undefined);
  }

  /**
   * Get employees by department
   */
  public getEmployeesByDepartment(departmentId: UUID): Observable<EmployeeDisplay[]> {
    return this.getEmployees({ department_id: departmentId }).pipe(  // snake_case
      map(response => response.data || [])  // Handle undefined
    );
  }

  /**
   * Get employees by position
   */
  public getEmployeesByPosition(positionId: UUID): Observable<EmployeeDisplay[]> {
    return this.getEmployees({ position_id: positionId }).pipe(  // snake_case
      map(response => response.data || [])  // Handle undefined
    );
  }

  /**
   * Get subordinates of an employee
   * Backend: GET /api/v1/employees/{employee_id}/subordinates
   */
  public getSubordinates(employeeId: UUID): Observable<PaginatedResponse<EmployeeDisplay>> {
    return this.api.get<PaginatedResponse<EmployeeDisplay>>(`/employees/${employeeId}/subordinates`);
  }

  /**
   * Get subordinates as list (without pagination)
   */
  public getSubordinatesList(employeeId: UUID): Observable<EmployeeDisplay[]> {
    return this.getSubordinates(employeeId).pipe(
      map(response => response.data || [])  // Handle undefined
    );
  }

  // ==================== Current Employee State ====================

  /**
   * Set the current employee for detail views
   */
  public setCurrentEmployee(employee: EmployeeDisplay | null): void {
    this.currentEmployeeSubject.next(employee);
  }

  /**
   * Get the currently selected employee
   */
  public getCurrentEmployee(): EmployeeDisplay | null {
    return this.currentEmployeeSubject.getValue();
  }

  // ==================== Search & Filter ====================

  /**
   * Search employees by query
   */
  public searchEmployees(query: string, companyId?: UUID): Observable<EmployeeDisplay[]> {
    return this.getEmployees({
      search: query,
      company_id: companyId  // snake_case
    }).pipe(
      map(response => response.data || [])  // Handle undefined
    );
  }

  /**
   * Get active employees only
   */
  public getActiveEmployees(companyId?: UUID): Observable<EmployeeDisplay[]> {
    // Note: isActive is not in EmployeeFilters, need to filter by status or use member service
    return this.getEmployees({
      company_id: companyId  // snake_case
    }).pipe(
      map(response => (response.data || []).filter(emp => emp.status !== 'inactive' && emp.status !== 'terminated'))  // Filter active employees
    );
  }

  /**
   * Get inactive employees
   */
  public getInactiveEmployees(companyId?: UUID): Observable<EmployeeDisplay[]> {
    // Note: isActive is not in EmployeeFilters, need to filter by status or use member service
    return this.getEmployees({
      company_id: companyId  // snake_case
    }).pipe(
      map(response => (response.data || []).filter(emp => emp.status === 'inactive' || emp.status === 'terminated'))  // Filter inactive employees
    );
  }

  // ==================== Import/Export ====================

  /**
   * Export employee data
   * Note: Backend endpoint may not exist - check /api/v1/reports/export-employees instead
   */
  public exportEmployees(format: 'csv' | 'json' | 'excel' = 'csv', filters?: EmployeeFilters): Observable<Blob> {
    // TODO: Check if backend has /employees/export endpoint
    // Alternative: Use /api/v1/reports/export-employees
    return this.api.get<Blob>(`/employees/export`, {
      ...filters,
      format
    });
  }

  /**
   * Import employee data from file
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  public importEmployees(file: File, companyId: UUID): Observable<{
    success: number;
    failed: number;
    errors: string[]
  }> {
    // TODO: Check if backend has /employees/import endpoint
    // If not, remove this function
    return this.api.upload<{
      success: number;
      failed: number;
      errors: string[]
    }>('/employees/import', file, { companyId });
  }

  /**
   * Download import template
   * Note: Backend endpoint may not exist - consider removing or implementing backend endpoint
   */
  public downloadImportTemplate(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    // TODO: Check if backend has /employees/import-template endpoint
    // If not, remove this function
    return this.api.get<Blob>(`/employees/import-template`, { format });
  }

  // ==================== Helper Methods ====================

  /**
   * Check if employee is admin
   */
  public isAdmin(employee: EmployeeDisplay): boolean {
    return isEmployeeAdmin(employee);
  }

  /**
   * Get employee tenure in months
   */
  public getTenure(employee: EmployeeDisplay): number {
    return getEmployeeTenure(employee);
  }

  /**
   * Check if employee is currently employed
   */
  public isCurrentlyEmployed(employee: EmployeeDisplay): boolean {
    return isCurrentlyEmployed(employee);
  }

  /**
   * Get employee full name
   */
  public getFullName(employee: EmployeeDisplay): string {
    return employee.full_name || `${employee.first_name} ${employee.last_name}`.trim();  // snake_case
  }

  /**
   * Get employee display name (with employee ID if available)
   */
  public getDisplayName(employee: EmployeeDisplay): string {
    const fullName = this.getFullName(employee);
    return employee.employee_id ? `${fullName} (${employee.employee_id})` : fullName;  // snake_case
  }

  // ==================== Face Enrollment ====================

  /**
   * Enroll face for employee
   * Backend: POST /api/v1/face/members/{member_id}/add-face
   */
  public enrollFace(memberId: UUID, file: File): Observable<any> {
    return this.api.upload<any>(`/face/members/${memberId}/add-face`, file);
  }

  /**
   * Get face encodings for employee
   * Backend: GET /api/v1/face/members/{member_id}/encodings
   */
  public getFaceEncodings(memberId: UUID): Observable<any[]> {
    return this.api.get<any[]>(`/face/members/${memberId}/encodings`);
  }

  /**
   * Delete face encoding
   * Backend: DELETE /api/v1/face/encodings/{face_encoding_id}
   */
  public deleteFaceEncoding(faceEncodingId: UUID): Observable<void> {
    return this.api.delete<void>(`/face/encodings/${faceEncodingId}`);
  }
}

