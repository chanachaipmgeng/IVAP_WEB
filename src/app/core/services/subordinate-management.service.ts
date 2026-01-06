import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeDisplay as Employee } from '../models/employee-display.model';

export interface SubordinateTask {
  id: string;
  title: string;
  description: string;
  assignerId: string;
  assignerName: string;
  assigneeId: string;
  assigneeName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  completedDate?: Date;
  progress: number; // 0-100
  comments: TaskComment[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  period: {
    start: Date;
    end: Date;
  };
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  ratings: {
    [category: string]: number; // 1-5 scale
  };
  goals: {
    [goalId: string]: {
      description: string;
      target: string;
      achieved: boolean;
      notes?: string;
    };
  };
  strengths: string[];
  areasForImprovement: string[];
  overallRating: number;
  comments: string;
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'on_leave';
  lastActive: Date;
  currentTasks: number;
  completedTasks: number;
  performanceScore: number;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  averagePerformance: number;
  teamProductivity: number; // percentage
}

export interface SubordinateFilter {
  search?: string;
  status?: TeamMember['status'];
  department?: string;
  position?: string;
  performanceMin?: number;
  performanceMax?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubordinateManagementService {
  private tasksMap: Map<string, SubordinateTask> = new Map();
  private performanceReviewsMap: Map<string, PerformanceReview> = new Map();
  private teamMembersMap: Map<string, TeamMember> = new Map();

  // ✅ Signals for reactive state
  private _tasks = signal<SubordinateTask[]>([]);
  private _performanceReviews = signal<PerformanceReview[]>([]);
  private _teamMembers = signal<TeamMember[]>([]);
  private _teamStats = signal<TeamStats>(this.getInitialTeamStats());

  // ✅ Readonly signals for public access
  public readonly tasks = this._tasks.asReadonly();
  public readonly performanceReviews = this._performanceReviews.asReadonly();
  public readonly teamMembers = this._teamMembers.asReadonly();
  public readonly teamStats = this._teamStats.asReadonly();

  // ✅ Computed signals for derived state
  public readonly tasksCount = computed(() => this._tasks().length);
  public readonly pendingTasksCount = computed(() => this._tasks().filter(t => t.status === 'pending').length);
  public readonly completedTasksCount = computed(() => this._tasks().filter(t => t.status === 'completed').length);
  public readonly teamMembersCount = computed(() => this._teamMembers().length);
  public readonly activeMembersCount = computed(() => this._teamMembers().filter(m => m.status === 'active').length);

  constructor() {
    this.initializeSampleData();
  }

  /**
   * Initialize sample data
   */
  private initializeSampleData(): void {
    // Initialize team members
    const sampleTeamMembers: TeamMember[] = [
      {
        id: 'emp_002',
        name: 'สมหญิง รักงาน',
        position: 'Senior Developer',
        department: 'IT',
        avatar: 'https://via.placeholder.com/150/10B981/FFFFFF?text=SY',
        status: 'active',
        lastActive: new Date(),
        currentTasks: 3,
        completedTasks: 15,
        performanceScore: 4.2
      },
      {
        id: 'emp_003',
        name: 'สมศักดิ์ ขยัน',
        position: 'Developer',
        department: 'IT',
        avatar: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=SS',
        status: 'active',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        currentTasks: 2,
        completedTasks: 8,
        performanceScore: 3.8
      },
      {
        id: 'emp_004',
        name: 'สมพร เก่ง',
        position: 'Junior Developer',
        department: 'IT',
        avatar: 'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=SP',
        status: 'active',
        lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        currentTasks: 1,
        completedTasks: 5,
        performanceScore: 4.0
      }
    ];

    sampleTeamMembers.forEach(member => {
      this.teamMembersMap.set(member.id, member);
    });

    this._teamMembers.set(Array.from(this.teamMembersMap.values()));

    // Initialize tasks
    const sampleTasks: SubordinateTask[] = [
      {
        id: 'task_001',
        title: 'พัฒนาระบบจัดการพนักงาน',
        description: 'พัฒนาระบบจัดการพนักงานใหม่ด้วย Angular และ Node.js',
        assignerId: 'emp_001',
        assignerName: 'สมชาย ใจดี',
        assigneeId: 'emp_002',
        assigneeName: 'สมหญิง รักงาน',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        progress: 65,
        comments: [
          {
            id: 'comment_001',
            authorId: 'emp_002',
            authorName: 'สมหญิง รักงาน',
            content: 'กำลังดำเนินการอยู่ คาดว่าจะเสร็จใน 2-3 วัน',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ],
        attachments: ['design_doc.pdf'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'task_002',
        title: 'แก้ไขบัคในระบบรายงาน',
        description: 'แก้ไขบัคที่เกิดขึ้นในระบบรายงานประจำเดือน',
        assignerId: 'emp_001',
        assignerName: 'สมชาย ใจดี',
        assigneeId: 'emp_003',
        assigneeName: 'สมศักดิ์ ขยัน',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        progress: 100,
        comments: [
          {
            id: 'comment_002',
            authorId: 'emp_003',
            authorName: 'สมศักดิ์ ขยัน',
            content: 'แก้ไขเสร็จแล้ว ระบบทำงานปกติ',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        attachments: [],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'task_003',
        title: 'อัปเดตเอกสาร API',
        description: 'อัปเดตเอกสาร API สำหรับระบบใหม่',
        assignerId: 'emp_001',
        assignerName: 'สมชาย ใจดี',
        assigneeId: 'emp_004',
        assigneeName: 'สมพร เก่ง',
        status: 'pending',
        priority: 'low',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        progress: 0,
        comments: [],
        attachments: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleTasks.forEach(task => {
      this.tasksMap.set(task.id, task);
    });

    this._tasks.set(Array.from(this.tasksMap.values()));

    // Initialize performance reviews
    const sampleReviews: PerformanceReview[] = [
      {
        id: 'review_001',
        employeeId: 'emp_002',
        employeeName: 'สมหญิง รักงาน',
        reviewerId: 'emp_001',
        reviewerName: 'สมชาย ใจดี',
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-12-31')
        },
        status: 'approved',
        ratings: {
          'technical_skills': 4,
          'communication': 4,
          'teamwork': 5,
          'problem_solving': 4,
          'leadership': 3
        },
        goals: {
          'goal_001': {
            description: 'พัฒนาทักษะการเป็นผู้นำ',
            target: 'เข้าร่วมหลักสูตร Leadership Training',
            achieved: true,
            notes: 'เข้าร่วมหลักสูตรแล้วและได้ใบรับรอง'
          },
          'goal_002': {
            description: 'เพิ่มประสิทธิภาพการทำงาน',
            target: 'ลดเวลาการพัฒนาระบบลง 20%',
            achieved: true,
            notes: 'ใช้เครื่องมือใหม่ช่วยเพิ่มประสิทธิภาพ'
          }
        },
        strengths: ['ทักษะทางเทคนิคดี', 'ทำงานเป็นทีมได้ดี', 'แก้ไขปัญหาได้เร็ว'],
        areasForImprovement: ['การเป็นผู้นำ', 'การนำเสนอผลงาน'],
        overallRating: 4.2,
        comments: 'พนักงานที่มีศักยภาพสูง ควรส่งเสริมให้เป็นผู้นำทีม',
        recommendations: ['ส่งไปอบรมหลักสูตร Leadership', 'ให้โอกาสนำโครงการใหม่'],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ];

    sampleReviews.forEach(review => {
      this.performanceReviewsMap.set(review.id, review);
    });

    this._performanceReviews.set(Array.from(this.performanceReviewsMap.values()));
    this.updateTeamStats();
  }

  /**
   * Get all tasks
   */
  public getTasks(): SubordinateTask[] {
    return Array.from(this.tasksMap.values());
  }

  /**
   * Get tasks by assigner
   */
  public getTasksByAssigner(assignerId: string): SubordinateTask[] {
    return Array.from(this.tasksMap.values()).filter(task => task.assignerId === assignerId);
  }

  /**
   * Get tasks by assignee
   */
  public getTasksByAssignee(assigneeId: string): SubordinateTask[] {
    return Array.from(this.tasksMap.values()).filter(task => task.assigneeId === assigneeId);
  }

  /**
   * Get task by ID
   */
  public getTaskById(id: string): SubordinateTask | undefined {
    return this.tasksMap.get(id);
  }

  /**
   * Create new task
   */
  public createTask(task: Omit<SubordinateTask, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newTask: SubordinateTask = {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tasksMap.set(id, newTask);
    this._tasks.set(Array.from(this.tasksMap.values()));
    this.updateTeamStats();

    return id;
  }

  /**
   * Update task
   */
  public updateTask(id: string, updates: Partial<SubordinateTask>): boolean {
    const task = this.tasksMap.get(id);
    if (!task) return false;

    const updatedTask: SubordinateTask = {
      ...task,
      ...updates,
      updatedAt: new Date()
    };

    this.tasksMap.set(id, updatedTask);
    this._tasks.set(Array.from(this.tasksMap.values()));
    this.updateTeamStats();

    return true;
  }

  /**
   * Add task comment
   */
  public addTaskComment(taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>): boolean {
    const task = this.tasksMap.get(taskId);
    if (!task) return false;

    const newComment: TaskComment = {
      ...comment,
      id: this.generateId(),
      createdAt: new Date()
    };

    task.comments.push(newComment);
    task.updatedAt = new Date();

    this.tasksMap.set(taskId, task);
    this._tasks.set(Array.from(this.tasksMap.values()));

    return true;
  }

  /**
   * Update task progress
   */
  public updateTaskProgress(taskId: string, progress: number): boolean {
    const task = this.tasksMap.get(taskId);
    if (!task) return false;

    task.progress = Math.max(0, Math.min(100, progress));

    if (progress === 100 && task.status !== 'completed') {
      task.status = 'completed';
      task.completedDate = new Date();
    } else if (progress > 0 && task.status === 'pending') {
      task.status = 'in_progress';
    }

    task.updatedAt = new Date();

    this.tasksMap.set(taskId, task);
    this._tasks.set(Array.from(this.tasksMap.values()));
    this.updateTeamStats();

    return true;
  }

  /**
   * Get all team members
   */
  public getTeamMembers(): TeamMember[] {
    return Array.from(this.teamMembersMap.values());
  }

  /**
   * Get team member by ID
   */
  public getTeamMemberById(id: string): TeamMember | undefined {
    return this.teamMembersMap.get(id);
  }

  /**
   * Filter team members
   */
  public filterTeamMembers(filter: SubordinateFilter): TeamMember[] {
    let filtered = Array.from(this.teamMembersMap.values());

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm) ||
        member.position.toLowerCase().includes(searchTerm) ||
        member.department.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.status) {
      filtered = filtered.filter(member => member.status === filter.status);
    }

    if (filter.department) {
      filtered = filtered.filter(member => member.department === filter.department);
    }

    if (filter.position) {
      filtered = filtered.filter(member => member.position === filter.position);
    }

    if (filter.performanceMin !== undefined) {
      filtered = filtered.filter(member => member.performanceScore >= filter.performanceMin!);
    }

    if (filter.performanceMax !== undefined) {
      filtered = filtered.filter(member => member.performanceScore <= filter.performanceMax!);
    }

    return filtered;
  }

  /**
   * Get performance reviews
   */
  public getPerformanceReviews(): PerformanceReview[] {
    return Array.from(this.performanceReviewsMap.values());
  }

  /**
   * Get performance review by ID
   */
  public getPerformanceReviewById(id: string): PerformanceReview | undefined {
    return this.performanceReviewsMap.get(id);
  }

  /**
   * Get performance reviews by employee
   */
  public getPerformanceReviewsByEmployee(employeeId: string): PerformanceReview[] {
    return Array.from(this.performanceReviewsMap.values()).filter(review => review.employeeId === employeeId);
  }

  /**
   * Create performance review
   */
  public createPerformanceReview(review: Omit<PerformanceReview, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newReview: PerformanceReview = {
      ...review,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.performanceReviewsMap.set(id, newReview);
    this._performanceReviews.set(Array.from(this.performanceReviewsMap.values()));

    return id;
  }

  /**
   * Update performance review
   */
  public updatePerformanceReview(id: string, updates: Partial<PerformanceReview>): boolean {
    const review = this.performanceReviewsMap.get(id);
    if (!review) return false;

    const updatedReview: PerformanceReview = {
      ...review,
      ...updates,
      updatedAt: new Date()
    };

    this.performanceReviewsMap.set(id, updatedReview);
    this._performanceReviews.set(Array.from(this.performanceReviewsMap.values()));

    return true;
  }

  /**
   * Get team statistics
   */
  public getTeamStats(): TeamStats {
    return this.calculateTeamStats();
  }

  /**
   * Calculate team statistics
   */
  private calculateTeamStats(): TeamStats {
    const members = Array.from(this.teamMembersMap.values());
    const tasks = Array.from(this.tasksMap.values());
    const now = new Date();

    const activeMembers = members.filter(member => member.status === 'active').length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length;
    const overdueTasks = tasks.filter(task =>
      (task.status === 'pending' || task.status === 'in_progress') &&
      task.dueDate < now
    ).length;

    const averagePerformance = members.length > 0 ?
      members.reduce((sum, member) => sum + member.performanceScore, 0) / members.length : 0;

    const teamProductivity = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    return {
      totalMembers: members.length,
      activeMembers,
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      averagePerformance,
      teamProductivity
    };
  }

  /**
   * Update team statistics
   */
  private updateTeamStats(): void {
    const stats = this.calculateTeamStats();
    this._teamStats.set(stats);
  }

  /**
   * Get initial team stats
   */
  private getInitialTeamStats(): TeamStats {
    return {
      totalMembers: 0,
      activeMembers: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      averagePerformance: 0,
      teamProductivity: 0
    };
  }

  /**
   * Export subordinate data
   */
  public exportSubordinateData(): string {
    const data = {
      tasks: Array.from(this.tasksMap.values()),
      performanceReviews: Array.from(this.performanceReviewsMap.values()),
      teamMembers: Array.from(this.teamMembersMap.values()),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import subordinate data
   */
  public importSubordinateData(data: string): void {
    try {
      const imported = JSON.parse(data);

      if (imported.tasks) {
        imported.tasks.forEach((task: any) => {
          task.dueDate = new Date(task.dueDate);
          if (task.completedDate) task.completedDate = new Date(task.completedDate);
          task.comments.forEach((comment: any) => {
            comment.createdAt = new Date(comment.createdAt);
          });
          task.createdAt = new Date(task.createdAt);
          task.updatedAt = new Date(task.updatedAt);
          this.tasksMap.set(task.id, task);
        });
        this._tasks.set(Array.from(this.tasksMap.values()));
      }

      if (imported.performanceReviews) {
        imported.performanceReviews.forEach((review: any) => {
          review.period.start = new Date(review.period.start);
          review.period.end = new Date(review.period.end);
          review.createdAt = new Date(review.createdAt);
          review.updatedAt = new Date(review.updatedAt);
          this.performanceReviewsMap.set(review.id, review);
        });
        this._performanceReviews.set(Array.from(this.performanceReviewsMap.values()));
      }

      if (imported.teamMembers) {
        imported.teamMembers.forEach((member: any) => {
          member.lastActive = new Date(member.lastActive);
          this.teamMembersMap.set(member.id, member);
        });
        this._teamMembers.set(Array.from(this.teamMembersMap.values()));
      }

      this.updateTeamStats();
    } catch (error) {
      console.error('Failed to import subordinate data:', error);
      throw error;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

