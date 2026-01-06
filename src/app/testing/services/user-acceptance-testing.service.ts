import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface UATTest {
  id: string;
  name: string;
  description: string;
  category: 'functional' | 'usability' | 'performance' | 'compatibility' | 'accessibility' | 'business_process';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'blocked' | 'deferred';
  duration: number; // milliseconds
  startTime?: Date;
  endTime?: Date;
  testSteps: UATTestStep[];
  acceptanceCriteria: UATAcceptanceCriteria;
  testData: UATTestData;
  userStory: UATUserStory;
  feedback: UATFeedback[];
}

export interface UATTestStep {
  id: string;
  stepNumber: number;
  description: string;
  action: string;
  expectedResult: string;
  actualResult?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  screenshots: string[];
  notes: string;
  attachments: string[];
}

export interface UATAcceptanceCriteria {
  id: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  status: 'pending' | 'verified' | 'failed' | 'not_applicable';
  verificationMethod: 'manual' | 'automated' | 'observation';
  evidence: string[];
  comments: string;
}

export interface UATTestData {
  id: string;
  name: string;
  description: string;
  type: 'test_user' | 'test_data' | 'test_environment' | 'test_scenario';
  data: Record<string, any>;
  prerequisites: string[];
  cleanup: string[];
}

export interface UATUserStory {
  id: string;
  title: string;
  description: string;
  as_a: string; // user type
  i_want: string; // functionality
  so_that: string; // business value
  businessValue: number; // 1-10
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  dependencies: string[];
  stakeholders: string[];
}

export interface UATFeedback {
  id: string;
  testId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comments: string;
  category: 'usability' | 'functionality' | 'performance' | 'design' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  attachments: string[];
}

export interface UATSession {
  id: string;
  name: string;
  description: string;
  testSuite: string[];
  participants: UATParticipant[];
  startTime: Date;
  endTime?: Date;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  environment: UATEnvironment;
  results: UATSessionResults;
}

export interface UATParticipant {
  id: string;
  name: string;
  email: string;
  role: 'end_user' | 'business_analyst' | 'product_owner' | 'stakeholder' | 'tester';
  department: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  availability: {
    startTime: Date;
    endTime: Date;
    timezone: string;
  };
  status: 'invited' | 'accepted' | 'declined' | 'participating' | 'completed';
  feedback: UATFeedback[];
}

export interface UATEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'demo';
  url: string;
  configuration: Record<string, any>;
  testData: UATTestData[];
  access: {
    username: string;
    password: string;
    instructions: string;
  };
}

export interface UATSessionResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  skippedTests: number;
  passRate: number; // percentage
  averageRating: number; // 1-5
  feedbackCount: number;
  criticalIssues: number;
  highPriorityIssues: number;
  mediumPriorityIssues: number;
  lowPriorityIssues: number;
  recommendations: string[];
}

export interface UATReport {
  id: string;
  name: string;
  description: string;
  sessionId: string;
  generatedAt: Date;
  summary: {
    overallStatus: 'passed' | 'failed' | 'conditional' | 'incomplete';
    passRate: number;
    userSatisfaction: number;
    readinessScore: number; // 0-100
    recommendations: string[];
  };
  testResults: UATTest[];
  feedback: UATFeedback[];
  participants: UATParticipant[];
  findings: UATFinding[];
  nextSteps: UATNextStep[];
}

export interface UATFinding {
  id: string;
  title: string;
  description: string;
  category: 'bug' | 'enhancement' | 'usability' | 'performance' | 'accessibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  reportedBy: string;
  reportedAt: Date;
  assignedTo?: string;
  dueDate?: Date;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  screenshots: string[];
  attachments: string[];
}

export interface UATNextStep {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'fix' | 'enhancement' | 'investigation' | 'documentation';
  assignedTo?: string;
  dueDate?: Date;
  dependencies: string[];
  effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class UserAcceptanceTestingService {
  // ✅ Private writable signals
  private _uatTests = signal<UATTest[]>([]);
  private _uatSessions = signal<UATSession[]>([]);
  private _uatReports = signal<UATReport[]>([]);
  private _isRunning = signal<boolean>(false);
  private _currentSession = signal<UATSession | null>(null);

  // ✅ Public readonly signals
  public readonly uatTests = this._uatTests.asReadonly();
  public readonly uatSessions = this._uatSessions.asReadonly();
  public readonly uatReports = this._uatReports.asReadonly();
  public readonly isRunning = this._isRunning.asReadonly();
  public readonly currentSession = this._currentSession.asReadonly();

  // ✅ Computed signals for derived state
  public readonly uatTestsCount = computed(() => this._uatTests().length);
  public readonly runningTestsCount = computed(() =>
    this._uatTests().filter((t: UATTest) => t.status === 'running').length
  );
  public readonly passedTestsCount = computed(() =>
    this._uatTests().filter((t: UATTest) => t.status === 'passed').length
  );
  public readonly failedTestsCount = computed(() =>
    this._uatTests().filter((t: UATTest) => t.status === 'failed').length
  );
  public readonly uatSessionsCount = computed(() => this._uatSessions().length);
  public readonly activeSessionsCount = computed(() =>
    this._uatSessions().filter((s: UATSession) => s.status === 'in_progress').length
  );
  public readonly uatReportsCount = computed(() => this._uatReports().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public uatTests$ = new Observable<UATTest[]>(observer => {
    observer.next(this._uatTests());
  });
  public uatSessions$ = new Observable<UATSession[]>(observer => {
    observer.next(this._uatSessions());
  });
  public uatReports$ = new Observable<UATReport[]>(observer => {
    observer.next(this._uatReports());
  });
  public isRunning$ = new Observable<boolean>(observer => {
    observer.next(this._isRunning());
  });
  public currentSession$ = new Observable<UATSession | null>(observer => {
    observer.next(this._currentSession());
  });

  constructor() {
    this.initializeUATTests();
  }

  private initializeUATTests(): void {
    const tests: UATTest[] = [
      // Functional Tests
      {
        id: 'uat-001',
        name: 'User Login and Authentication',
        description: 'Test user login functionality and authentication flow',
        category: 'functional',
        priority: 'critical',
        status: 'pending',
        duration: 0,
        testSteps: [
          {
            id: 'step-001',
            stepNumber: 1,
            description: 'Navigate to login page',
            action: 'Open browser and navigate to login URL',
            expectedResult: 'Login page loads successfully',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          },
          {
            id: 'step-002',
            stepNumber: 2,
            description: 'Enter valid credentials',
            action: 'Enter username and password',
            expectedResult: 'Credentials are accepted',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          },
          {
            id: 'step-003',
            stepNumber: 3,
            description: 'Submit login form',
            action: 'Click login button',
            expectedResult: 'User is redirected to dashboard',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          }
        ],
        acceptanceCriteria: {
          id: 'ac-001',
          description: 'User can successfully log in with valid credentials',
          priority: 'must_have',
          status: 'pending',
          verificationMethod: 'manual',
          evidence: [],
          comments: ''
        },
        testData: {
          id: 'td-001',
          name: 'Test User Credentials',
          description: 'Valid test user credentials for login testing',
          type: 'test_user',
          data: {
            username: 'testuser@example.com',
            password: 'TestPassword123!'
          },
          prerequisites: ['Test user account created', 'Database seeded with test data'],
          cleanup: ['Logout user', 'Clear browser cache']
        },
        userStory: {
          id: 'us-001',
          title: 'User Login',
          description: 'As a user, I want to log in to the system so that I can access my account and data',
          as_a: 'registered user',
          i_want: 'to log in with my credentials',
          so_that: 'I can access the system and my personal data',
          businessValue: 10,
          complexity: 'low',
          dependencies: ['User registration', 'Database setup'],
          stakeholders: ['end_users', 'system_administrators']
        },
        feedback: []
      },
      {
        id: 'uat-002',
        name: 'Camera Integration and Video Streaming',
        description: 'Test camera integration and video streaming functionality',
        category: 'functional',
        priority: 'high',
        status: 'pending',
        duration: 0,
        testSteps: [
          {
            id: 'step-004',
            stepNumber: 1,
            description: 'Access camera dashboard',
            action: 'Navigate to camera section',
            expectedResult: 'Camera dashboard loads with available cameras',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          },
          {
            id: 'step-005',
            stepNumber: 2,
            description: 'Select a camera',
            action: 'Click on a camera from the list',
            expectedResult: 'Camera details and controls are displayed',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          },
          {
            id: 'step-006',
            stepNumber: 3,
            description: 'Start video stream',
            action: 'Click start streaming button',
            expectedResult: 'Video stream starts and displays live feed',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          }
        ],
        acceptanceCriteria: {
          id: 'ac-002',
          description: 'User can view live video feed from connected cameras',
          priority: 'must_have',
          status: 'pending',
          verificationMethod: 'manual',
          evidence: [],
          comments: ''
        },
        testData: {
          id: 'td-002',
          name: 'Test Camera Configuration',
          description: 'Test camera setup and configuration data',
          type: 'test_environment',
          data: {
            camera_ip: '192.168.1.100',
            camera_port: 80,
            username: 'admin',
            password: 'admin123'
          },
          prerequisites: ['Camera hardware connected', 'Network configuration complete'],
          cleanup: ['Stop video stream', 'Disconnect from camera']
        },
        userStory: {
          id: 'us-002',
          title: 'Camera Video Streaming',
          description: 'As a security operator, I want to view live video feeds from cameras so that I can monitor the premises',
          as_a: 'security operator',
          i_want: 'to view live video feeds from cameras',
          so_that: 'I can monitor the premises and respond to incidents',
          businessValue: 9,
          complexity: 'medium',
          dependencies: ['Camera hardware', 'Network infrastructure'],
          stakeholders: ['security_operators', 'system_administrators']
        },
        feedback: []
      },
      // Usability Tests
      {
        id: 'uat-003',
        name: 'Dashboard Navigation and User Interface',
        description: 'Test dashboard navigation and user interface usability',
        category: 'usability',
        priority: 'high',
        status: 'pending',
        duration: 0,
        testSteps: [
          {
            id: 'step-007',
            stepNumber: 1,
            description: 'Navigate to main dashboard',
            action: 'Access the main dashboard after login',
            expectedResult: 'Dashboard loads with all widgets and navigation',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          },
          {
            id: 'step-008',
            stepNumber: 2,
            description: 'Test sidebar navigation',
            action: 'Click on different menu items in sidebar',
            expectedResult: 'Navigation works smoothly and pages load correctly',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          },
          {
            id: 'step-009',
            stepNumber: 3,
            description: 'Test responsive design',
            action: 'Resize browser window to different sizes',
            expectedResult: 'Interface adapts to different screen sizes',
            status: 'pending',
            duration: 0,
            screenshots: [],
            notes: '',
            attachments: []
          }
        ],
        acceptanceCriteria: {
          id: 'ac-003',
          description: 'Dashboard is intuitive and easy to navigate',
          priority: 'should_have',
          status: 'pending',
          verificationMethod: 'observation',
          evidence: [],
          comments: ''
        },
        testData: {
          id: 'td-003',
          name: 'UI Test Data',
          description: 'Test data for UI testing',
          type: 'test_scenario',
          data: {
            screen_sizes: ['1920x1080', '1366x768', '768x1024', '375x667'],
            browsers: ['Chrome', 'Firefox', 'Safari', 'Edge']
          },
          prerequisites: ['User logged in', 'Dashboard accessible'],
          cleanup: ['Reset browser size', 'Clear browser cache']
        },
        userStory: {
          id: 'us-003',
          title: 'Intuitive Dashboard',
          description: 'As a user, I want an intuitive dashboard so that I can easily find and access the features I need',
          as_a: 'system user',
          i_want: 'an intuitive and easy-to-use dashboard',
          so_that: 'I can efficiently perform my tasks',
          businessValue: 8,
          complexity: 'medium',
          dependencies: ['UI/UX design', 'Component library'],
          stakeholders: ['end_users', 'ui_ux_designers']
        },
        feedback: []
      }
    ];

    this._uatTests.set(tests);
  }

  // UAT Test Management
  getUATTests(): Observable<UATTest[]> {
    return this.uatTests$;
  }

  getUATTest(id: string): Observable<UATTest | undefined> {
    return new Observable<UATTest | undefined>(observer => {
      const test = this._uatTests().find((t: UATTest) => t.id === id);
      observer.next(test);
      observer.complete();
    });
  }

  createUATTest(test: Omit<UATTest, 'id' | 'status' | 'duration' | 'feedback'>): Observable<UATTest> {
    const newTest: UATTest = {
      ...test,
      id: this.generateId(),
      status: 'pending',
      duration: 0,
      feedback: []
    };

    const tests = this._uatTests();
    this._uatTests.set([...tests, newTest]);

    return new Observable(observer => {
      observer.next(newTest);
      observer.complete();
    });
  }

  // UAT Session Management
  createUATSession(session: Omit<UATSession, 'id' | 'status' | 'duration' | 'results'>): Observable<UATSession> {
    const newSession: UATSession = {
      ...session,
      id: this.generateId(),
      status: 'scheduled',
      duration: 0,
      results: this.getDefaultSessionResults()
    };

    const sessions = this._uatSessions();
    this._uatSessions.set([...sessions, newSession]);

    return new Observable(observer => {
      observer.next(newSession);
      observer.complete();
    });
  }

  startUATSession(sessionId: string): Observable<UATSession> {
    const sessions = this._uatSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      return throwError(() => new Error('UAT session not found'));
    }

    session.status = 'in_progress';
    session.startTime = new Date();
    this._currentSession.set(session);
    this._isRunning.set(true);

    const sessionsArray = this._uatSessions();
    const index = sessionsArray.findIndex((s: UATSession) => s.id === sessionId);
    if (index !== -1) {
      const updatedSessions = [...sessionsArray];
      updatedSessions[index] = session;
      this._uatSessions.set(updatedSessions);
    }

    return new Observable(observer => {
      observer.next(session);
      observer.complete();
    });
  }

  completeUATSession(sessionId: string): Observable<UATSession> {
    const sessions = this._uatSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      return throwError(() => new Error('UAT session not found'));
    }

    session.status = 'completed';
    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    session.results = this.calculateSessionResults(session);

    const sessionsArray = this._uatSessions();
    const index = sessionsArray.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      const updatedSessions = [...sessionsArray];
      updatedSessions[index] = session;
      this._uatSessions.set(updatedSessions);
    }

    this._currentSession.set(null);
    this._isRunning.set(false);

    return new Observable(observer => {
      observer.next(session);
      observer.complete();
    });
  }

  // Feedback Management
  addFeedback(testId: string, feedback: Omit<UATFeedback, 'id' | 'testId' | 'createdAt' | 'updatedAt'>): Observable<UATFeedback> {
    const newFeedback: UATFeedback = {
      ...feedback,
      id: this.generateId(),
      testId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const tests = this._uatTests();
    const test = tests.find((t: UATTest) => t.id === testId);
    if (test) {
      test.feedback.push(newFeedback);
      this._uatTests.set([...tests]);
    }

    return new Observable(observer => {
      observer.next(newFeedback);
      observer.complete();
    });
  }

  // Report Generation
  generateUATReport(sessionId: string): Observable<UATReport> {
    const sessions = this._uatSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      return throwError(() => new Error('UAT session not found'));
    }

    const tests = this._uatTests().filter((t: UATTest) => session.testSuite.includes(t.id));
    const allFeedback = tests.flatMap(t => t.feedback);

    const report: UATReport = {
      id: this.generateId(),
      name: `UAT Report - ${session.name}`,
      description: `User Acceptance Testing report for ${session.name}`,
      sessionId,
      generatedAt: new Date(),
      summary: {
        overallStatus: this.calculateOverallStatus(session.results),
        passRate: session.results.passRate,
        userSatisfaction: this.calculateUserSatisfaction(allFeedback),
        readinessScore: this.calculateReadinessScore(session.results, allFeedback),
        recommendations: this.generateRecommendations(session.results, allFeedback)
      },
      testResults: tests,
      feedback: allFeedback,
      participants: session.participants,
      findings: this.generateFindings(tests, allFeedback),
      nextSteps: this.generateNextSteps(session.results, allFeedback)
    };

    const reports = this._uatReports();
    this._uatReports.set([...reports, report]);

    return new Observable(observer => {
      observer.next(report);
      observer.complete();
    });
  }

  // Status Monitoring
  getIsRunning(): Observable<boolean> {
    return this.isRunning$;
  }

  getCurrentSession(): Observable<UATSession | null> {
    return this.currentSession$;
  }

  getUATReports(): Observable<UATReport[]> {
    return this.uatReports$;
  }

  // Utility Methods
  private generateId(): string {
    return 'uat-' + Math.random().toString(36).substr(2, 9);
  }

  private getDefaultSessionResults(): UATSessionResults {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      blockedTests: 0,
      skippedTests: 0,
      passRate: 0,
      averageRating: 0,
      feedbackCount: 0,
      criticalIssues: 0,
      highPriorityIssues: 0,
      mediumPriorityIssues: 0,
      lowPriorityIssues: 0,
      recommendations: []
    };
  }

  private calculateSessionResults(session: UATSession): UATSessionResults {
    const tests = this._uatTests().filter((t: UATTest) => session.testSuite.includes(t.id));
    const allFeedback = tests.flatMap(t => t.feedback);

    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const blockedTests = tests.filter(t => t.status === 'blocked').length;
    const skippedTests = tests.filter(t => t.status === 'deferred').length;

    return {
      totalTests,
      passedTests,
      failedTests,
      blockedTests,
      skippedTests,
      passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      averageRating: allFeedback.length > 0 ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length : 0,
      feedbackCount: allFeedback.length,
      criticalIssues: allFeedback.filter(f => f.severity === 'critical').length,
      highPriorityIssues: allFeedback.filter(f => f.severity === 'high').length,
      mediumPriorityIssues: allFeedback.filter(f => f.severity === 'medium').length,
      lowPriorityIssues: allFeedback.filter(f => f.severity === 'low').length,
      recommendations: []
    };
  }

  private calculateOverallStatus(results: UATSessionResults): 'passed' | 'failed' | 'conditional' | 'incomplete' {
    if (results.passRate >= 90 && results.criticalIssues === 0) return 'passed';
    if (results.passRate >= 70 && results.criticalIssues <= 2) return 'conditional';
    if (results.passRate < 50) return 'failed';
    return 'incomplete';
  }

  private calculateUserSatisfaction(feedback: UATFeedback[]): number {
    if (feedback.length === 0) return 0;
    return feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
  }

  private calculateReadinessScore(results: UATSessionResults, feedback: UATFeedback[]): number {
    let score = 100;

    // Deduct points for low pass rate
    score -= (100 - results.passRate) * 0.5;

    // Deduct points for critical issues
    score -= results.criticalIssues * 10;

    // Deduct points for high priority issues
    score -= results.highPriorityIssues * 5;

    // Deduct points for low user satisfaction
    const avgRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 3;
    score -= (5 - avgRating) * 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(results: UATSessionResults, feedback: UATFeedback[]): string[] {
    const recommendations: string[] = [];

    if (results.passRate < 80) {
      recommendations.push('Improve test pass rate by addressing failed test cases');
    }

    if (results.criticalIssues > 0) {
      recommendations.push('Address critical issues before production release');
    }

    if (results.averageRating < 3) {
      recommendations.push('Improve user satisfaction by addressing usability issues');
    }

    const highPriorityFeedback = feedback.filter(f => f.severity === 'high' || f.severity === 'critical');
    if (highPriorityFeedback.length > 0) {
      recommendations.push('Prioritize resolution of high-priority feedback items');
    }

    return recommendations;
  }

  private generateFindings(tests: UATTest[], feedback: UATFeedback[]): UATFinding[] {
    const findings: UATFinding[] = [];

    // Generate findings from failed tests
    tests.filter(t => t.status === 'failed').forEach(test => {
      findings.push({
        id: this.generateId(),
        title: `Test Failed: ${test.name}`,
        description: `Test case ${test.name} failed during execution`,
        category: 'bug',
        severity: 'high',
        priority: 'high',
        status: 'open',
        reportedBy: 'UAT System',
        reportedAt: new Date(),
        stepsToReproduce: test.testSteps.map(step => step.description),
        expectedBehavior: test.acceptanceCriteria.description,
        actualBehavior: 'Test failed',
        screenshots: [],
        attachments: []
      });
    });

    // Generate findings from feedback
    feedback.filter(f => f.severity === 'high' || f.severity === 'critical').forEach(fb => {
      findings.push({
        id: this.generateId(),
        title: `User Feedback: ${fb.comments.substring(0, 50)}...`,
        description: fb.comments,
        category: 'usability',
        severity: fb.severity,
        priority: fb.severity,
        status: 'open',
        reportedBy: fb.userName,
        reportedAt: fb.createdAt,
        stepsToReproduce: [],
        expectedBehavior: '',
        actualBehavior: '',
        screenshots: [],
        attachments: fb.attachments
      });
    });

    return findings;
  }

  private generateNextSteps(results: UATSessionResults, feedback: UATFeedback[]): UATNextStep[] {
    const nextSteps: UATNextStep[] = [];

    if (results.criticalIssues > 0) {
      nextSteps.push({
        id: this.generateId(),
        title: 'Fix Critical Issues',
        description: 'Address all critical issues identified during UAT',
        priority: 'critical',
        category: 'fix',
        effort: 'high',
        dependencies: [],
        status: 'pending'
      });
    }

    if (results.passRate < 90) {
      nextSteps.push({
        id: this.generateId(),
        title: 'Improve Test Pass Rate',
        description: 'Work on improving the overall test pass rate',
        priority: 'high',
        category: 'fix',
        effort: 'medium',
        dependencies: [],
        status: 'pending'
      });
    }

    const usabilityFeedback = feedback.filter(f => f.category === 'usability');
    if (usabilityFeedback.length > 0) {
      nextSteps.push({
        id: this.generateId(),
        title: 'Address Usability Issues',
        description: 'Improve user experience based on feedback',
        priority: 'medium',
        category: 'enhancement',
        effort: 'medium',
        dependencies: [],
        status: 'pending'
      });
    }

    return nextSteps;
  }
}
