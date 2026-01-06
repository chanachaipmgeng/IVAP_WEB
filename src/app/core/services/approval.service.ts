import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApprovalRequest {
  id: string;
  type: 'leave' | 'overtime' | 'expense' | 'attendance' | 'salary' | 'other';
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestDate: Date;
  dueDate: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  comments?: string;
  attachments: string[]; // file URLs or IDs
  metadata: {
    leaveType?: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
    leaveStartDate?: Date;
    leaveEndDate?: Date;
    leaveDays?: number;
    overtimeHours?: number;
    overtimeDate?: Date;
    expenseAmount?: number;
    expenseCategory?: string;
    attendanceDate?: Date;
    attendanceType?: 'checkin' | 'checkout' | 'break';
    salaryAmount?: number;
    salaryType?: 'bonus' | 'raise' | 'adjustment';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  type: ApprovalRequest['type'];
  steps: ApprovalStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  approverId: string;
  approverName: string;
  isRequired: boolean;
  canDelegate: boolean;
  maxDays: number; // maximum days to respond
  conditions?: {
    minAmount?: number;
    maxAmount?: number;
    department?: string;
    position?: string;
  };
}

export interface ApprovalStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageProcessingTime: number; // in hours
  approvalRate: number; // percentage
  requestsByType: { [type: string]: number };
  requestsByPriority: { [priority: string]: number };
  overdueRequests: number;
}

export interface ApprovalFilter {
  type?: ApprovalRequest['type'];
  status?: ApprovalRequest['status'];
  priority?: ApprovalRequest['priority'];
  requesterId?: string;
  approverId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApprovalService {
  private requestsMap: Map<string, ApprovalRequest> = new Map();
  private workflowsMap: Map<string, ApprovalWorkflow> = new Map();

  // ✅ Signals for reactive state
  private _requests = signal<ApprovalRequest[]>([]);
  private _workflows = signal<ApprovalWorkflow[]>([]);
  private _stats = signal<ApprovalStats>(this.getInitialStats());

  // ✅ Readonly signals for public access
  public readonly requests = this._requests.asReadonly();
  public readonly workflows = this._workflows.asReadonly();
  public readonly stats = this._stats.asReadonly();

  // ✅ Computed signals for derived state
  public readonly requestsCount = computed(() => this._requests().length);
  public readonly pendingRequestsCount = computed(() =>
    this._requests().filter(r => r.status === 'pending').length
  );
  public readonly approvedRequestsCount = computed(() =>
    this._requests().filter(r => r.status === 'approved').length
  );
  public readonly rejectedRequestsCount = computed(() =>
    this._requests().filter(r => r.status === 'rejected').length
  );
  public readonly workflowsCount = computed(() => this._workflows().length);
  public readonly activeWorkflowsCount = computed(() =>
    this._workflows().filter(w => w.isActive).length
  );

  // ✅ Observable compatibility layer (for backward compatibility)
  public requests$ = new Observable<ApprovalRequest[]>(observer => {
    observer.next(this._requests());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public workflows$ = new Observable<ApprovalWorkflow[]>(observer => {
    observer.next(this._workflows());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public stats$ = new Observable<ApprovalStats>(observer => {
    observer.next(this._stats());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Initialize sample data
   */
  private initializeSampleData(): void {
    const sampleRequests: ApprovalRequest[] = [
      {
        id: 'req_001',
        type: 'leave',
        title: 'ขอลาพักผ่อนประจำปี',
        description: 'ขอลาพักผ่อนประจำปี 5 วัน เพื่อไปเที่ยวกับครอบครัว',
        requesterId: 'emp_002',
        requesterName: 'สมหญิง รักงาน',
        approverId: 'emp_001',
        approverName: 'สมชาย ใจดี',
        status: 'pending',
        priority: 'medium',
        requestDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        attachments: [],
        metadata: {
          leaveType: 'annual',
          leaveStartDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          leaveEndDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
          leaveDays: 5
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'req_002',
        type: 'overtime',
        title: 'ขอทำงานล่วงเวลา',
        description: 'ขอทำงานล่วงเวลา 2 ชั่วโมง เพื่อให้งานเสร็จทันกำหนด',
        requesterId: 'emp_003',
        requesterName: 'สมศักดิ์ ขยัน',
        approverId: 'emp_001',
        approverName: 'สมชาย ใจดี',
        status: 'approved',
        priority: 'high',
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        approvedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        comments: 'อนุมัติแล้ว เนื่องจากงานเร่งด่วน',
        attachments: [],
        metadata: {
          overtimeHours: 2,
          overtimeDate: new Date()
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'req_003',
        type: 'expense',
        title: 'ขอเบิกค่าใช้จ่ายในการเดินทาง',
        description: 'ขอเบิกค่าใช้จ่ายในการเดินทางไปประชุมที่เชียงใหม่',
        requesterId: 'emp_002',
        requesterName: 'สมหญิง รักงาน',
        approverId: 'emp_001',
        approverName: 'สมชาย ใจดี',
        status: 'rejected',
        priority: 'medium',
        requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        rejectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        comments: 'ไม่สามารถอนุมัติได้ เนื่องจากเกินงบประมาณที่กำหนด',
        attachments: ['receipt_001.pdf'],
        metadata: {
          expenseAmount: 5000,
          expenseCategory: 'travel'
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleRequests.forEach(request => {
      this.requestsMap.set(request.id, request);
    });

    this._requests.set(Array.from(this.requestsMap.values()));

    // Initialize workflows
    const sampleWorkflows: ApprovalWorkflow[] = [
      {
        id: 'wf_001',
        name: 'การลาพักผ่อนประจำปี',
        type: 'leave',
        steps: [
          {
            id: 'step_001',
            stepNumber: 1,
            approverId: 'emp_001',
            approverName: 'สมชาย ใจดี',
            isRequired: true,
            canDelegate: true,
            maxDays: 3,
            conditions: {
              minAmount: 1,
              maxAmount: 5
            }
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wf_002',
        name: 'การทำงานล่วงเวลา',
        type: 'overtime',
        steps: [
          {
            id: 'step_002',
            stepNumber: 1,
            approverId: 'emp_001',
            approverName: 'สมชาย ใจดี',
            isRequired: true,
            canDelegate: false,
            maxDays: 1
          }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    sampleWorkflows.forEach(workflow => {
      this.workflowsMap.set(workflow.id, workflow);
    });

    this._workflows.set(Array.from(this.workflowsMap.values()));
    this.updateStats();
  }

  /**
   * Get all requests
   */
  public getRequests(): ApprovalRequest[] {
    return Array.from(this.requestsMap.values());
  }

  /**
   * Get request by ID
   */
  public getRequestById(id: string): ApprovalRequest | undefined {
    return this.requestsMap.get(id);
  }

  /**
   * Get requests by approver
   */
  public getRequestsByApprover(approverId: string): ApprovalRequest[] {
    return Array.from(this.requestsMap.values()).filter(req => req.approverId === approverId);
  }

  /**
   * Get requests by requester
   */
  public getRequestsByRequester(requesterId: string): ApprovalRequest[] {
    return Array.from(this.requestsMap.values()).filter(req => req.requesterId === requesterId);
  }

  /**
   * Get pending requests
   */
  public getPendingRequests(): ApprovalRequest[] {
    return Array.from(this.requestsMap.values()).filter(req => req.status === 'pending');
  }

  /**
   * Get overdue requests
   */
  public getOverdueRequests(): ApprovalRequest[] {
    const now = new Date();
    return Array.from(this.requestsMap.values()).filter(req =>
      req.status === 'pending' && req.dueDate < now
    );
  }

  /**
   * Create new request
   */
  public createRequest(request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newRequest: ApprovalRequest = {
      ...request,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.requestsMap.set(id, newRequest);
    this._requests.set(Array.from(this.requestsMap.values()));
    this.updateStats();

    return id;
  }

  /**
   * Update request
   */
  public updateRequest(id: string, updates: Partial<ApprovalRequest>): boolean {
    const request = this.requestsMap.get(id);
    if (!request) return false;

    const updatedRequest: ApprovalRequest = {
      ...request,
      ...updates,
      updatedAt: new Date()
    };

    this.requestsMap.set(id, updatedRequest);
    this._requests.set(Array.from(this.requestsMap.values()));
    this.updateStats();

    return true;
  }

  /**
   * Approve request
   */
  public approveRequest(id: string, comments?: string): boolean {
    const request = this.requestsMap.get(id);
    if (!request || request.status !== 'pending') return false;

    const updatedRequest: ApprovalRequest = {
      ...request,
      status: 'approved',
      approvedDate: new Date(),
      comments: comments || request.comments,
      updatedAt: new Date()
    };

    this.requestsMap.set(id, updatedRequest);
    this._requests.set(Array.from(this.requestsMap.values()));
    this.updateStats();

    return true;
  }

  /**
   * Reject request
   */
  public rejectRequest(id: string, comments: string): boolean {
    const request = this.requestsMap.get(id);
    if (!request || request.status !== 'pending') return false;

    const updatedRequest: ApprovalRequest = {
      ...request,
      status: 'rejected',
      rejectedDate: new Date(),
      comments,
      updatedAt: new Date()
    };

    this.requestsMap.set(id, updatedRequest);
    this._requests.set(Array.from(this.requestsMap.values()));
    this.updateStats();

    return true;
  }

  /**
   * Cancel request
   */
  public cancelRequest(id: string, comments?: string): boolean {
    const request = this.requestsMap.get(id);
    if (!request || request.status !== 'pending') return false;

    const updatedRequest: ApprovalRequest = {
      ...request,
      status: 'cancelled',
      comments: comments || request.comments,
      updatedAt: new Date()
    };

    this.requestsMap.set(id, updatedRequest);
    this._requests.set(Array.from(this.requestsMap.values()));
    this.updateStats();

    return true;
  }

  /**
   * Filter requests
   */
  public filterRequests(filter: ApprovalFilter): ApprovalRequest[] {
    let filtered = Array.from(this.requestsMap.values());

    if (filter.type) {
      filtered = filtered.filter(req => req.type === filter.type);
    }

    if (filter.status) {
      filtered = filtered.filter(req => req.status === filter.status);
    }

    if (filter.priority) {
      filtered = filtered.filter(req => req.priority === filter.priority);
    }

    if (filter.requesterId) {
      filtered = filtered.filter(req => req.requesterId === filter.requesterId);
    }

    if (filter.approverId) {
      filtered = filtered.filter(req => req.approverId === filter.approverId);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter(req => req.requestDate >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filtered = filtered.filter(req => req.requestDate <= filter.dateTo!);
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(searchTerm) ||
        req.description.toLowerCase().includes(searchTerm) ||
        req.requesterName.toLowerCase().includes(searchTerm) ||
        req.approverName.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  /**
   * Get workflows
   */
  public getWorkflows(): ApprovalWorkflow[] {
    return Array.from(this.workflowsMap.values());
  }

  /**
   * Get workflow by type
   */
  public getWorkflowByType(type: ApprovalRequest['type']): ApprovalWorkflow | undefined {
    return Array.from(this.workflowsMap.values()).find(wf => wf.type === type && wf.isActive);
  }

  /**
   * Add workflow
   */
  public addWorkflow(workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workflowsMap.set(id, newWorkflow);
    this._workflows.set(Array.from(this.workflowsMap.values()));

    return id;
  }

  /**
   * Update workflow
   */
  public updateWorkflow(id: string, updates: Partial<ApprovalWorkflow>): boolean {
    const workflow = this.workflowsMap.get(id);
    if (!workflow) return false;

    const updatedWorkflow: ApprovalWorkflow = {
      ...workflow,
      ...updates,
      updatedAt: new Date()
    };

    this.workflowsMap.set(id, updatedWorkflow);
    this._workflows.set(Array.from(this.workflowsMap.values()));

    return true;
  }

  /**
   * Delete workflow
   */
  public deleteWorkflow(id: string): boolean {
    const workflow = this.workflowsMap.get(id);
    if (!workflow) return false;

    this.workflowsMap.delete(id);
    this._workflows.set(Array.from(this.workflowsMap.values()));

    return true;
  }

  /**
   * Get approval statistics
   */
  public getApprovalStats(): ApprovalStats {
    return this.calculateStats();
  }

  /**
   * Calculate statistics
   */
  private calculateStats(): ApprovalStats {
    const requests = Array.from(this.requestsMap.values());
    const now = new Date();

    const requestsByType: { [key: string]: number } = {};
    const requestsByPriority: { [key: string]: number } = {};

    let totalProcessingTime = 0;
    let processedRequests = 0;

    requests.forEach(request => {
      // Count by type
      requestsByType[request.type] = (requestsByType[request.type] || 0) + 1;

      // Count by priority
      requestsByPriority[request.priority] = (requestsByPriority[request.priority] || 0) + 1;

      // Calculate processing time
      if (request.status === 'approved' && request.approvedDate) {
        const processingTime = request.approvedDate.getTime() - request.requestDate.getTime();
        totalProcessingTime += processingTime;
        processedRequests++;
      } else if (request.status === 'rejected' && request.rejectedDate) {
        const processingTime = request.rejectedDate.getTime() - request.requestDate.getTime();
        totalProcessingTime += processingTime;
        processedRequests++;
      }
    });

    const averageProcessingTime = processedRequests > 0 ?
      (totalProcessingTime / processedRequests) / (1000 * 60 * 60) : 0; // Convert to hours

    const approvedCount = requests.filter(req => req.status === 'approved').length;
    const totalProcessed = requests.filter(req => req.status === 'approved' || req.status === 'rejected').length;
    const approvalRate = totalProcessed > 0 ? (approvedCount / totalProcessed) * 100 : 0;

    const overdueRequests = requests.filter(req =>
      req.status === 'pending' && req.dueDate < now
    ).length;

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(req => req.status === 'pending').length,
      approvedRequests: approvedCount,
      rejectedRequests: requests.filter(req => req.status === 'rejected').length,
      averageProcessingTime,
      approvalRate,
      requestsByType,
      requestsByPriority,
      overdueRequests
    };
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const stats = this.calculateStats();
    this._stats.set(stats);
  }

  /**
   * Get initial stats
   */
  private getInitialStats(): ApprovalStats {
    return {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      averageProcessingTime: 0,
      approvalRate: 0,
      requestsByType: {},
      requestsByPriority: {},
      overdueRequests: 0
    };
  }

  /**
   * Export approval data
   */
  public exportApprovalData(): string {
    const data = {
      requests: Array.from(this.requestsMap.values()),
      workflows: Array.from(this.workflowsMap.values()),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import approval data
   */
  public importApprovalData(data: string): void {
    try {
      const imported = JSON.parse(data);

      if (imported.requests) {
        imported.requests.forEach((req: any) => {
          req.requestDate = new Date(req.requestDate);
          req.dueDate = new Date(req.dueDate);
          if (req.approvedDate) req.approvedDate = new Date(req.approvedDate);
          if (req.rejectedDate) req.rejectedDate = new Date(req.rejectedDate);
          if (req.leaveStartDate) req.metadata.leaveStartDate = new Date(req.metadata.leaveStartDate);
          if (req.leaveEndDate) req.metadata.leaveEndDate = new Date(req.metadata.leaveEndDate);
          if (req.overtimeDate) req.metadata.overtimeDate = new Date(req.metadata.overtimeDate);
          if (req.attendanceDate) req.metadata.attendanceDate = new Date(req.metadata.attendanceDate);
          req.createdAt = new Date(req.createdAt);
          req.updatedAt = new Date(req.updatedAt);
          this.requestsMap.set(req.id, req);
        });
        this._requests.set(Array.from(this.requestsMap.values()));
      }

      if (imported.workflows) {
        imported.workflows.forEach((wf: any) => {
          wf.createdAt = new Date(wf.createdAt);
          wf.updatedAt = new Date(wf.updatedAt);
          this.workflowsMap.set(wf.id, wf);
        });
        this._workflows.set(Array.from(this.workflowsMap.values()));
      }

      this.updateStats();
    } catch (error) {
      console.error('Failed to import approval data:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

