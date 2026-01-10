/**
 * Company Employee Service
 *
 * Service for managing company employees
 * Uses BaseCrudService and snake_case models to match backend
 * All endpoints match backend API: /api/v1/employees
 */

import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import {
  CompanyEmployee,
  CompanyEmployeeCreate,
  CompanyEmployeeUpdate,
  CompanyEmployeeFilters
} from '../models/company-employee.model';
import {
  EmployeeDisplay,
  companyEmployeeToDisplay,
  EmployeeFilters,
  EmployeeStatistics
} from '../models/employee-display.model';
import { PaginatedApiResponse } from '../utils/response-handler';

@Injectable({
  providedIn: 'root'
})
export class CompanyEmployeeService extends BaseCrudService<CompanyEmployee, CompanyEmployeeCreate, CompanyEmployeeUpdate> {
  protected baseEndpoint = '/employees';

  // Internal state management
  private employees = signal<EmployeeDisplay[]>([]);
  private loading = signal(false);

  constructor(api: ApiService) {
    super(api);
  }

  // Getters for signals
  getEmployeesSignal = () => this.employees.asReadonly();
  getLoadingSignal = () => this.loading.asReadonly();

  /**
   * Get employees with filters and pagination
   * Backend: GET /api/v1/employees
   * Returns: PaginatedResponse<CompanyEmployeeResponse>
   */
  getEmployees(filters?: EmployeeFilters): Observable<PaginatedApiResponse<EmployeeDisplay>> {
    this.loading.set(true);
    const options = { skipTransform: true };

    // Backend route does NOT require trailing slash for GET list
    return this.api.get<any>(`${this.baseEndpoint}`, filters, options).pipe(
      map((response: any) => {
        // Backend returns PaginatedResponse with items array
        const items = response.items || response.data || [];
        const companyEmployees = items as CompanyEmployee[];

        // Convert to EmployeeDisplay
        const employees = companyEmployees.map(ce => companyEmployeeToDisplay(ce));

        // Update local state
        this.employees.set(employees);
        this.loading.set(false);

        return {
          total: response.total || employees.length,
          data: employees,
          items: employees,
          page: response.page || 1,
          size: response.size || response.page_size || employees.length
        } as PaginatedApiResponse<EmployeeDisplay>;
      })
    );
  }

  /**
   * Get employee by ID
   * Backend: GET /api/v1/employees/{employee_id}
   * Returns: CompanyEmployeeResponse
   */
  getEmployeeById(employeeId: string): Observable<EmployeeDisplay> {
    const options = { skipTransform: true };
    return this.api.get<CompanyEmployee>(`${this.baseEndpoint}/${employeeId}`, undefined, options).pipe(
      map(companyEmployee => companyEmployeeToDisplay(companyEmployee))
    );
  }

  /**
   * Create new employee
   * Backend: POST /api/v1/employees
   * Returns: CompanyEmployeeResponse
   */
  createEmployee(data: CompanyEmployeeCreate): Observable<EmployeeDisplay> {
    const options = { skipTransform: true };
    // Backend route does NOT require trailing slash for POST
    return this.api.post<CompanyEmployee>(`${this.baseEndpoint}`, data, undefined, options).pipe(
      map(companyEmployee => companyEmployeeToDisplay(companyEmployee)),
      tap((employee) => {
        // Update local state
        const current = this.employees();
        this.employees.set([...current, employee]);
      })
    );
  }

  /**
   * Update employee
   * Backend: PUT /api/v1/employees/{employee_id}
   * Returns: CompanyEmployeeResponse
   */
  updateEmployee(employeeId: string, data: CompanyEmployeeUpdate): Observable<EmployeeDisplay> {
    const options = { skipTransform: true };
    return this.api.put<CompanyEmployee>(`${this.baseEndpoint}/${employeeId}`, data, undefined, options).pipe(
      map(companyEmployee => companyEmployeeToDisplay(companyEmployee)),
      tap((employee) => {
        // Update local state
        const current = this.employees();
        const index = current.findIndex(e => e.company_employee_id === employeeId);
        if (index >= 0) {
          current[index] = employee;
          this.employees.set([...current]);
        }
      })
    );
  }

  /**
   * Delete employee
   * Backend: DELETE /api/v1/employees/{employee_id}
   */
  deleteEmployee(employeeId: string): Observable<void> {
    const options = { skipTransform: true };
    return this.api.delete<void>(`${this.baseEndpoint}/${employeeId}`, undefined, undefined, options).pipe(
      tap(() => {
        // Update local state
        const current = this.employees();
        this.employees.set(current.filter(e => e.company_employee_id !== employeeId));
      })
    );
  }

  /**
   * Get subordinates
   * Backend: GET /api/v1/employees/{employee_id}/subordinates
   */
  getSubordinates(employeeId: string, filters?: EmployeeFilters): Observable<PaginatedApiResponse<EmployeeDisplay>> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/${employeeId}/subordinates`, filters, options).pipe(
      map((response: any) => {
        const items = response.items || response.data || [];
        const companyEmployees = items as CompanyEmployee[];
        const employees = companyEmployees.map(ce => companyEmployeeToDisplay(ce));

        return {
          total: response.total || employees.length,
          data: employees,
          items: employees,
          page: response.page || 1,
          size: response.size || employees.length
        } as PaginatedApiResponse<EmployeeDisplay>;
      })
    );
  }

  /**
   * Get employees as list (without pagination)
   */
  getEmployeesList(filters?: EmployeeFilters): Observable<EmployeeDisplay[]> {
    return this.getEmployees(filters).pipe(
      map(response => response.data || response.items || [])
    );
  }

  /**
   * Load employees (refresh from server)
   */
  loadEmployees(filters?: EmployeeFilters): Observable<EmployeeDisplay[]> {
    return this.getEmployeesList(filters);
  }
}

