import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer, forkJoin, of } from 'rxjs';
import { map, catchError, retry, switchMap, tap } from 'rxjs/operators';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number; // milliseconds
  startTime?: Date;
  endTime?: Date;
  error?: string;
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  tags: string[];
  dependencies: string[];
  retryCount: number;
  maxRetries: number;
}

export interface TestStep {
  id: string;
  name: string;
  description: string;
  action: string;
  expected: string;
  actual?: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
  logs: string[];
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  coverage: number; // percentage
}

export interface TestReport {
  id: string;
  name: string;
  description: string;
  testSuites: TestSuite[];
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
  artifacts: TestArtifact[];
}

export interface TestArtifact {
  id: string;
  name: string;
  type: 'screenshot' | 'video' | 'log' | 'report' | 'coverage' | 'performance';
  path: string;
  size: number;
  createdAt: Date;
  description: string;
}

export interface TestEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'testing';
  url: string;
  status: 'active' | 'inactive' | 'maintenance';
  configuration: Record<string, any>;
  capabilities: string[];
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SystemIntegrationTestingService {
  // ✅ Private writable signals
  private _testCases = signal<TestCase[]>([]);
  private _testSuites = signal<TestSuite[]>([]);
  private _testReports = signal<TestReport[]>([]);
  private _testEnvironments = signal<TestEnvironment[]>([]);
  private _isRunning = signal<boolean>(false);
  private _currentTest = signal<TestCase | null>(null);

  // ✅ Public readonly signals
  public readonly testCases = this._testCases.asReadonly();
  public readonly testSuites = this._testSuites.asReadonly();
  public readonly testReports = this._testReports.asReadonly();
  public readonly testEnvironments = this._testEnvironments.asReadonly();
  public readonly isRunning = this._isRunning.asReadonly();
  public readonly currentTest = this._currentTest.asReadonly();

  // ✅ Computed signals for derived state
  public readonly testCasesCount = computed(() => this._testCases().length);
  public readonly runningTestsCount = computed(() =>
    this._testCases().filter((t: TestCase) => t.status === 'running').length
  );
  public readonly passedTestsCount = computed(() =>
    this._testCases().filter((t: TestCase) => t.status === 'passed').length
  );
  public readonly failedTestsCount = computed(() =>
    this._testCases().filter((t: TestCase) => t.status === 'failed').length
  );
  public readonly testSuitesCount = computed(() => this._testSuites().length);
  public readonly testReportsCount = computed(() => this._testReports().length);
  public readonly testEnvironmentsCount = computed(() => this._testEnvironments().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public testCases$ = new Observable<TestCase[]>(observer => {
    observer.next(this._testCases());
  });
  public testSuites$ = new Observable<TestSuite[]>(observer => {
    observer.next(this._testSuites());
  });
  public testReports$ = new Observable<TestReport[]>(observer => {
    observer.next(this._testReports());
  });
  public testEnvironments$ = new Observable<TestEnvironment[]>(observer => {
    observer.next(this._testEnvironments());
  });
  public isRunning$ = new Observable<boolean>(observer => {
    observer.next(this._isRunning());
  });
  public currentTest$ = new Observable<TestCase | null>(observer => {
    observer.next(this._currentTest());
  });

  constructor() {
    this.initializeTestCases();
    this.initializeTestEnvironments();
  }

  private initializeTestCases(): void {
    const testCases: TestCase[] = [
      // Authentication Tests
      {
        id: 'auth-001',
        name: 'User Login Test',
        description: 'Test user login functionality with valid credentials',
        category: 'integration',
        priority: 'high',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-001',
            name: 'Navigate to login page',
            description: 'Open the login page',
            action: 'navigate',
            expected: 'Login page loads successfully',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-002',
            name: 'Enter credentials',
            description: 'Enter valid username and password',
            action: 'input',
            expected: 'Credentials entered successfully',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-003',
            name: 'Submit login form',
            description: 'Click login button',
            action: 'click',
            expected: 'User logged in successfully',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'User successfully logged in and redirected to dashboard',
        tags: ['authentication', 'login', 'ui'],
        dependencies: [],
        retryCount: 0,
        maxRetries: 3
      },
      {
        id: 'auth-002',
        name: 'Invalid Login Test',
        description: 'Test login with invalid credentials',
        category: 'integration',
        priority: 'high',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-004',
            name: 'Enter invalid credentials',
            description: 'Enter invalid username and password',
            action: 'input',
            expected: 'Invalid credentials entered',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-005',
            name: 'Submit login form',
            description: 'Click login button',
            action: 'click',
            expected: 'Error message displayed',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'Error message displayed and user not logged in',
        tags: ['authentication', 'error-handling', 'ui'],
        dependencies: [],
        retryCount: 0,
        maxRetries: 3
      },
      // Camera Integration Tests
      {
        id: 'camera-001',
        name: 'Camera Connection Test',
        description: 'Test camera connection and initialization',
        category: 'integration',
        priority: 'critical',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-006',
            name: 'Initialize camera service',
            description: 'Initialize camera integration service',
            action: 'initialize',
            expected: 'Camera service initialized successfully',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-007',
            name: 'Connect to camera',
            description: 'Establish connection to camera device',
            action: 'connect',
            expected: 'Camera connected successfully',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-008',
            name: 'Verify camera status',
            description: 'Check camera online status',
            action: 'verify',
            expected: 'Camera status is online',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'Camera connected and status verified as online',
        tags: ['camera', 'integration', 'hardware'],
        dependencies: [],
        retryCount: 0,
        maxRetries: 3
      },
      {
        id: 'camera-002',
        name: 'Video Stream Test',
        description: 'Test video streaming functionality',
        category: 'integration',
        priority: 'high',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-009',
            name: 'Start video stream',
            description: 'Start video streaming from camera',
            action: 'start-stream',
            expected: 'Video stream started successfully',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-010',
            name: 'Verify stream quality',
            description: 'Check video stream quality and resolution',
            action: 'verify-quality',
            expected: 'Stream quality meets requirements',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'Video stream started with acceptable quality',
        tags: ['camera', 'streaming', 'video'],
        dependencies: ['camera-001'],
        retryCount: 0,
        maxRetries: 3
      },
      // Face Recognition Tests
      {
        id: 'face-001',
        name: 'Face Detection Test',
        description: 'Test face detection functionality',
        category: 'integration',
        priority: 'high',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-011',
            name: 'Load face detection model',
            description: 'Load face detection AI model',
            action: 'load-model',
            expected: 'Face detection model loaded successfully',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-012',
            name: 'Detect faces in image',
            description: 'Detect faces in test image',
            action: 'detect-faces',
            expected: 'Faces detected successfully',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'Faces detected with acceptable accuracy',
        tags: ['face-recognition', 'ai', 'detection'],
        dependencies: [],
        retryCount: 0,
        maxRetries: 3
      },
      // Performance Tests
      {
        id: 'perf-001',
        name: 'Page Load Performance Test',
        description: 'Test page load performance',
        category: 'performance',
        priority: 'medium',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-013',
            name: 'Measure page load time',
            description: 'Measure time to load main dashboard',
            action: 'measure-load-time',
            expected: 'Page loads within acceptable time',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-014',
            name: 'Check resource usage',
            description: 'Check memory and CPU usage',
            action: 'check-resources',
            expected: 'Resource usage within limits',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'Page loads within 3 seconds with acceptable resource usage',
        tags: ['performance', 'load-time', 'resources'],
        dependencies: [],
        retryCount: 0,
        maxRetries: 2
      },
      // Security Tests
      {
        id: 'sec-001',
        name: 'Authentication Security Test',
        description: 'Test authentication security measures',
        category: 'security',
        priority: 'critical',
        status: 'pending',
        duration: 0,
        steps: [
          {
            id: 'step-015',
            name: 'Test password encryption',
            description: 'Verify password encryption',
            action: 'test-encryption',
            expected: 'Passwords are properly encrypted',
            status: 'pending',
            duration: 0,
            logs: []
          },
          {
            id: 'step-016',
            name: 'Test session security',
            description: 'Verify session security',
            action: 'test-session',
            expected: 'Sessions are secure',
            status: 'pending',
            duration: 0,
            logs: []
          }
        ],
        expectedResult: 'Authentication security measures are properly implemented',
        tags: ['security', 'authentication', 'encryption'],
        dependencies: [],
        retryCount: 0,
        maxRetries: 3
      }
    ];

    this._testCases.set(testCases);
  }

  private initializeTestEnvironments(): void {
    const environments: TestEnvironment[] = [
      {
        id: 'env-001',
        name: 'Development Environment',
        type: 'development',
        url: 'http://localhost:4200',
        status: 'active',
        configuration: {
          apiUrl: 'http://localhost:3000/api',
          debugMode: true,
          logLevel: 'debug'
        },
        capabilities: ['chrome', 'firefox', 'safari'],
        lastUpdated: new Date()
      },
      {
        id: 'env-002',
        name: 'Staging Environment',
        type: 'staging',
        url: 'https://staging.example.com',
        status: 'active',
        configuration: {
          apiUrl: 'https://staging-api.example.com',
          debugMode: false,
          logLevel: 'info'
        },
        capabilities: ['chrome', 'firefox', 'safari', 'edge'],
        lastUpdated: new Date()
      },
      {
        id: 'env-003',
        name: 'Production Environment',
        type: 'production',
        url: 'https://app.example.com',
        status: 'active',
        configuration: {
          apiUrl: 'https://api.example.com',
          debugMode: false,
          logLevel: 'error'
        },
        capabilities: ['chrome', 'firefox', 'safari', 'edge'],
        lastUpdated: new Date()
      }
    ];

    this._testEnvironments.set(environments);
  }

  // Test Case Management
  getTestCases(): Observable<TestCase[]> {
    return this.testCases$;
  }

  getTestCase(id: string): Observable<TestCase | undefined> {
    return new Observable<TestCase | undefined>(observer => {
      const testCase = this._testCases().find((tc: TestCase) => tc.id === id);
      observer.next(testCase);
      observer.complete();
    });
  }

  createTestCase(testCase: Omit<TestCase, 'id' | 'status' | 'duration' | 'retryCount'>): Observable<TestCase> {
    const newTestCase: TestCase = {
      ...testCase,
      id: this.generateId(),
      status: 'pending',
      duration: 0,
      retryCount: 0
    };

    const testCases = this._testCases();
    this._testCases.set([...testCases, newTestCase]);

    return new Observable(observer => {
      observer.next(newTestCase);
      observer.complete();
    });
  }

  updateTestCase(id: string, updates: Partial<TestCase>): Observable<TestCase> {
    const testCases = this._testCases();
    const index = testCases.findIndex((tc: TestCase) => tc.id === id);

    if (index === -1) {
      return throwError(() => new Error('Test case not found'));
    }

    const updatedTestCases = [...testCases];
    updatedTestCases[index] = { ...testCases[index], ...updates };
    this._testCases.set(updatedTestCases);

    return new Observable(observer => {
      observer.next(testCases[index]);
      observer.complete();
    });
  }

  // Test Execution
  runTestCase(testCaseId: string, environmentId: string): Observable<TestCase> {
    const testCases = this._testCases();
    const testCase = testCases.find((tc: TestCase) => tc.id === testCaseId);

    if (!testCase) {
      return throwError(() => new Error('Test case not found'));
    }

    const environments = this._testEnvironments();
    const environment = environments.find(env => env.id === environmentId);

    if (!environment) {
      return throwError(() => new Error('Test environment not found'));
    }

    // Update test case status
    testCase.status = 'running';
    testCase.startTime = new Date();
    this._currentTest.set(testCase);
    this._testCases.set([...testCases]);

    return this.executeTestSteps(testCase, environment).pipe(
      map(updatedTestCase => {
        const testCases = this._testCases();
        const index = testCases.findIndex(tc => tc.id === testCaseId);
        if (index !== -1) {
          const updatedTestCases = [...testCases];
          updatedTestCases[index] = updatedTestCase;
          this._testCases.set(updatedTestCases);
        }
        this._currentTest.set(null);
        return updatedTestCase;
      }),
      catchError(error => {
        testCase.status = 'failed';
        testCase.error = error.message;
        testCase.endTime = new Date();
        testCase.duration = testCase.endTime.getTime() - (testCase.startTime?.getTime() || 0);

        const testCases = this._testCases();
        const index = testCases.findIndex(tc => tc.id === testCaseId);
        if (index !== -1) {
          testCases[index] = testCase;
          this._testCases.set([...testCases]);
        }
        this._currentTest.set(null);
        return throwError(() => error);
      })
    );
  }

  private executeTestSteps(testCase: TestCase, environment: TestEnvironment): Observable<TestCase> {
    return new Observable(observer => {
      let currentStepIndex = 0;
      const executeNextStep = () => {
        if (currentStepIndex >= testCase.steps.length) {
          // All steps completed
          testCase.status = testCase.steps.every(step => step.status === 'passed') ? 'passed' : 'failed';
          testCase.endTime = new Date();
          testCase.duration = testCase.endTime.getTime() - (testCase.startTime?.getTime() || 0);
          observer.next(testCase);
          observer.complete();
          return;
        }

        const step = testCase.steps[currentStepIndex];
        step.status = 'running';
        step.duration = 0;
        const stepStartTime = Date.now();

        // Simulate step execution
        this.executeTestStep(step, environment).subscribe({
          next: (result) => {
            step.status = result.success ? 'passed' : 'failed';
            step.actual = result.actual;
            step.duration = Date.now() - stepStartTime;
            step.logs.push(`Step ${currentStepIndex + 1} completed: ${result.success ? 'PASSED' : 'FAILED'}`);

            if (!result.success) {
              step.error = result.error;
            }

            currentStepIndex++;
            executeNextStep();
          },
          error: (error) => {
            step.status = 'failed';
            step.error = error.message;
            step.duration = Date.now() - stepStartTime;
            step.logs.push(`Step ${currentStepIndex + 1} failed: ${error.message}`);

            testCase.status = 'failed';
            testCase.error = error.message;
            testCase.endTime = new Date();
            testCase.duration = testCase.endTime.getTime() - (testCase.startTime?.getTime() || 0);
            observer.next(testCase);
            observer.complete();
          }
        });
      };

      executeNextStep();
    });
  }

  private executeTestStep(step: TestStep, environment: TestEnvironment): Observable<{ success: boolean; actual: string; error?: string }> {
    return new Observable(observer => {
      // Simulate step execution with random success/failure
      const success = Math.random() > 0.1; // 90% success rate
      const duration = Math.random() * 2000 + 500; // 500-2500ms

      setTimeout(() => {
        if (success) {
          observer.next({
            success: true,
            actual: `Step executed successfully in ${duration.toFixed(0)}ms`
          });
        } else {
          observer.next({
            success: false,
            actual: 'Step execution failed',
            error: 'Simulated test failure'
          });
        }
        observer.complete();
      }, duration);
    });
  }

  // Test Suite Management
  createTestSuite(suite: Omit<TestSuite, 'id' | 'status' | 'duration' | 'passed' | 'failed' | 'skipped' | 'total' | 'coverage'>): Observable<TestSuite> {
    const newSuite: TestSuite = {
      ...suite,
      id: this.generateId(),
      status: 'pending',
      duration: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      total: suite.testCases.length,
      coverage: 0
    };

    const testSuites = this._testSuites();
    this._testSuites.set([...testSuites, newSuite]);

    return new Observable(observer => {
      observer.next(newSuite);
      observer.complete();
    });
  }

  runTestSuite(suiteId: string, environmentId: string): Observable<TestSuite> {
    const testSuites = this._testSuites();
    const suite = testSuites.find(s => s.id === suiteId);

    if (!suite) {
      return throwError(() => new Error('Test suite not found'));
    }

    suite.status = 'running';
    suite.startTime = new Date();
    this._testSuites.set([...testSuites]);

    // Run all test cases in the suite
    const testCaseObservables = suite.testCases.map((testCaseId: string) =>
      this.runTestCase(testCaseId, environmentId).pipe(
        catchError(error => of(null)) // Continue even if a test fails
      )
    );

    return forkJoin(testCaseObservables).pipe(
      map(results => {
        suite.endTime = new Date();
        suite.duration = suite.endTime.getTime() - (suite.startTime?.getTime() || 0);

        suite.passed = (results as TestCase[]).filter((r: TestCase) => r && r.status === 'passed').length;
        suite.failed = (results as TestCase[]).filter((r: TestCase) => r && r.status === 'failed').length;
        suite.skipped = (results as TestCase[]).filter((r: TestCase) => !r).length;

        suite.status = suite.failed === 0 ? 'completed' : 'failed';
        suite.coverage = (suite.passed / suite.total) * 100;

        this._testSuites.set([...testSuites]);
        return suite;
      })
    );
  }

  // Test Report Management
  generateTestReport(suiteIds: string[]): Observable<TestReport> {
    const testSuites = this._testSuites().filter((s: TestSuite) => suiteIds.includes(s.id));

    const report: TestReport = {
      id: this.generateId(),
      name: `Test Report ${new Date().toISOString()}`,
      description: 'Automated test report',
      testSuites,
      status: 'completed',
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      totalTests: testSuites.reduce((sum: number, s: TestSuite) => sum + s.total, 0),
      passedTests: testSuites.reduce((sum: number, s: TestSuite) => sum + s.passed, 0),
      failedTests: testSuites.reduce((sum: number, s: TestSuite) => sum + s.failed, 0),
      skippedTests: testSuites.reduce((sum: number, s: TestSuite) => sum + s.skipped, 0),
      coverage: 0,
      quality: 'good',
      recommendations: [],
      artifacts: []
    };

    report.coverage = (report.passedTests / report.totalTests) * 100;
    report.quality = this.calculateQuality(report.coverage);
    report.recommendations = this.generateRecommendations(report);

    const reports = this._testReports();
    this._testReports.set([...reports, report]);

    return new Observable(observer => {
      observer.next(report);
      observer.complete();
    });
  }

  // Status Monitoring
  getIsRunning(): Observable<boolean> {
    return this.isRunning$;
  }

  getCurrentTest(): Observable<TestCase | null> {
    return this.currentTest$;
  }

  getTestReports(): Observable<TestReport[]> {
    return this.testReports$;
  }

  getTestEnvironments(): Observable<TestEnvironment[]> {
    return this.testEnvironments$;
  }

  // Utility Methods
  private generateId(): string {
    return 'test-' + Math.random().toString(36).substr(2, 9);
  }

  private calculateQuality(coverage: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (coverage >= 95) return 'excellent';
    if (coverage >= 85) return 'good';
    if (coverage >= 70) return 'fair';
    return 'poor';
  }

  private generateRecommendations(report: TestReport): string[] {
    const recommendations: string[] = [];

    if (report.coverage < 80) {
      recommendations.push('Increase test coverage to at least 80%');
    }

    if (report.failedTests > 0) {
      recommendations.push('Investigate and fix failed test cases');
    }

    if (report.skippedTests > 0) {
      recommendations.push('Review and run skipped test cases');
    }

    if (report.quality === 'poor') {
      recommendations.push('Improve overall test quality and reliability');
    }

    return recommendations;
  }
}

