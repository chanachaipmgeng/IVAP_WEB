import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer, interval } from 'rxjs';
import { map, catchError, retry, switchMap, take } from 'rxjs/operators';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'load_time' | 'memory' | 'cpu' | 'network' | 'rendering' | 'interaction';
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'good' | 'warning' | 'critical';
}

export interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  type: 'load' | 'stress' | 'spike' | 'volume' | 'endurance' | 'scalability';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration: number; // seconds
  startTime?: Date;
  endTime?: Date;
  metrics: PerformanceMetric[];
  scenarios: PerformanceScenario[];
  results: PerformanceResults;
  configuration: PerformanceConfiguration;
}

export interface PerformanceScenario {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage of total load
  users: number;
  rampUpTime: number; // seconds
  duration: number; // seconds
  actions: PerformanceAction[];
  expectedResponseTime: number; // milliseconds
  expectedThroughput: number; // requests per second
}

export interface PerformanceAction {
  id: string;
  name: string;
  type: 'navigation' | 'click' | 'input' | 'api_call' | 'wait' | 'assertion';
  target: string;
  value?: string;
  expectedDuration: number; // milliseconds
  actualDuration?: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface PerformanceResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // requests per second
  errorRate: number; // percentage
  cpuUsage: number; // percentage
  memoryUsage: number; // MB
  networkUsage: number; // MB
  concurrentUsers: number;
  peakUsers: number;
  duration: number; // seconds
}

export interface PerformanceConfiguration {
  baseUrl: string;
  maxUsers: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
  thinkTime: number; // seconds between actions
  timeout: number; // milliseconds
  retryAttempts: number;
  monitoring: {
    enabled: boolean;
    interval: number; // seconds
    metrics: string[];
  };
  thresholds: {
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    cpuUsage: number; // percentage
    memoryUsage: number; // MB
  };
}

export interface PerformanceReport {
  id: string;
  testId: string;
  name: string;
  description: string;
  generatedAt: Date;
  summary: {
    status: 'passed' | 'failed' | 'warning';
    overallScore: number; // 0-100
    recommendations: string[];
  };
  results: PerformanceResults;
  metrics: PerformanceMetric[];
  charts: PerformanceChart[];
  analysis: PerformanceAnalysis;
}

export interface PerformanceChart {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'pie' | 'scatter';
  data: any[];
  xAxis: string;
  yAxis: string;
  title: string;
  description: string;
}

export interface PerformanceAnalysis {
  bottlenecks: string[];
  improvements: string[];
  risks: string[];
  trends: string[];
  compliance: {
    sla: boolean;
    performance: boolean;
    reliability: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceTestingService {
  // ✅ Private writable signals
  private _performanceTests = signal<PerformanceTest[]>([]);
  private _performanceReports = signal<PerformanceReport[]>([]);
  private _isRunning = signal<boolean>(false);
  private _currentTest = signal<PerformanceTest | null>(null);
  private _realTimeMetrics = signal<PerformanceMetric[]>([]);

  // ✅ Public readonly signals
  public readonly performanceTests = this._performanceTests.asReadonly();
  public readonly performanceReports = this._performanceReports.asReadonly();
  public readonly isRunning = this._isRunning.asReadonly();
  public readonly currentTest = this._currentTest.asReadonly();
  public readonly realTimeMetrics = this._realTimeMetrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly performanceTestsCount = computed(() => this._performanceTests().length);
  public readonly runningTestsCount = computed(() =>
    this._performanceTests().filter((t: PerformanceTest) => t.status === 'running').length
  );
  public readonly completedTestsCount = computed(() =>
    this._performanceTests().filter((t: PerformanceTest) => t.status === 'completed').length
  );
  public readonly failedTestsCount = computed(() =>
    this._performanceTests().filter((t: PerformanceTest) => t.status === 'failed').length
  );
  public readonly performanceReportsCount = computed(() => this._performanceReports().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public performanceTests$ = new Observable<PerformanceTest[]>(observer => {
    observer.next(this._performanceTests());
  });
  public performanceReports$ = new Observable<PerformanceReport[]>(observer => {
    observer.next(this._performanceReports());
  });
  public isRunning$ = new Observable<boolean>(observer => {
    observer.next(this._isRunning());
  });
  public currentTest$ = new Observable<PerformanceTest | null>(observer => {
    observer.next(this._currentTest());
  });
  public realTimeMetrics$ = new Observable<PerformanceMetric[]>(observer => {
    observer.next(this._realTimeMetrics());
  });

  constructor() {
    this.initializePerformanceTests();
  }

  private initializePerformanceTests(): void {
    const tests: PerformanceTest[] = [
      {
        id: 'perf-001',
        name: 'Homepage Load Test',
        description: 'Test homepage loading performance under normal load',
        type: 'load',
        status: 'pending',
        duration: 0,
        metrics: [],
        scenarios: [
          {
            id: 'scenario-001',
            name: 'Homepage Navigation',
            description: 'Navigate to homepage and verify load time',
            weight: 100,
            users: 50,
            rampUpTime: 30,
            duration: 300,
            actions: [
              {
                id: 'action-001',
                name: 'Navigate to homepage',
                type: 'navigation',
                target: '/',
                expectedDuration: 2000,
                success: false,
                timestamp: new Date()
              }
            ],
            expectedResponseTime: 2000,
            expectedThroughput: 10
          }
        ],
        results: this.getDefaultResults(),
        configuration: this.getDefaultConfiguration()
      },
      {
        id: 'perf-002',
        name: 'Dashboard Stress Test',
        description: 'Test dashboard performance under high load',
        type: 'stress',
        status: 'pending',
        duration: 0,
        metrics: [],
        scenarios: [
          {
            id: 'scenario-002',
            name: 'Dashboard Load',
            description: 'Load dashboard with multiple widgets',
            weight: 100,
            users: 100,
            rampUpTime: 60,
            duration: 600,
            actions: [
              {
                id: 'action-002',
                name: 'Load dashboard',
                type: 'navigation',
                target: '/dashboard',
                expectedDuration: 3000,
                success: false,
                timestamp: new Date()
              },
              {
                id: 'action-003',
                name: 'Load charts',
                type: 'api_call',
                target: '/api/charts',
                expectedDuration: 1000,
                success: false,
                timestamp: new Date()
              }
            ],
            expectedResponseTime: 3000,
            expectedThroughput: 5
          }
        ],
        results: this.getDefaultResults(),
        configuration: this.getDefaultConfiguration()
      },
      {
        id: 'perf-003',
        name: 'Camera Integration Load Test',
        description: 'Test camera integration performance',
        type: 'load',
        status: 'pending',
        duration: 0,
        metrics: [],
        scenarios: [
          {
            id: 'scenario-003',
            name: 'Camera Stream Load',
            description: 'Load multiple camera streams simultaneously',
            weight: 100,
            users: 25,
            rampUpTime: 30,
            duration: 300,
            actions: [
              {
                id: 'action-004',
                name: 'Connect to camera',
                type: 'api_call',
                target: '/api/camera/connect',
                expectedDuration: 1500,
                success: false,
                timestamp: new Date()
              },
              {
                id: 'action-005',
                name: 'Start video stream',
                type: 'api_call',
                target: '/api/camera/stream',
                expectedDuration: 2000,
                success: false,
                timestamp: new Date()
              }
            ],
            expectedResponseTime: 2000,
            expectedThroughput: 8
          }
        ],
        results: this.getDefaultResults(),
        configuration: this.getDefaultConfiguration()
      }
    ];

    this._performanceTests.set(tests);
  }

  // Performance Test Management
  getPerformanceTests(): Observable<PerformanceTest[]> {
    return this.performanceTests$;
  }

  getPerformanceTest(id: string): Observable<PerformanceTest | undefined> {
    return this.performanceTests$.pipe(
      map(tests => tests.find(t => t.id === id))
    );
  }

  createPerformanceTest(test: Omit<PerformanceTest, 'id' | 'status' | 'duration' | 'metrics' | 'results'>): Observable<PerformanceTest> {
    const newTest: PerformanceTest = {
      ...test,
      id: this.generateId(),
      status: 'pending',
      duration: 0,
      metrics: [],
      results: this.getDefaultResults()
    };

    const tests = this._performanceTests();
    this._performanceTests.set([...tests, newTest]);

    return new Observable(observer => {
      observer.next(newTest);
      observer.complete();
    });
  }

  // Test Execution
  runPerformanceTest(testId: string): Observable<PerformanceTest> {
    const tests = this._performanceTests();
    const test = tests.find(t => t.id === testId);

    if (!test) {
      return throwError(() => new Error('Performance test not found'));
    }

    test.status = 'running';
    test.startTime = new Date();
    this._currentTest.set(test);
    this._isRunning.set(true);

    const testsArray = this._performanceTests();
    const index = testsArray.findIndex((t: PerformanceTest) => t.id === testId);
    if (index !== -1) {
      const updatedTests = [...testsArray];
      updatedTests[index] = test;
      this._performanceTests.set(updatedTests);
    }

    return this.executePerformanceTest(test).pipe(
      map(updatedTest => {
        const tests = this._performanceTests();
        const index = tests.findIndex(t => t.id === testId);
        if (index !== -1) {
          const updatedTests = [...tests];
          updatedTests[index] = updatedTest;
          this._performanceTests.set(updatedTests);
        }
        this._currentTest.set(null);
        this._isRunning.set(false);
        return updatedTest;
      }),
      catchError(error => {
        test.status = 'failed';
        test.endTime = new Date();
        test.duration = test.endTime.getTime() - (test.startTime?.getTime() || 0);

        const tests = this._performanceTests();
        const index = tests.findIndex(t => t.id === testId);
        if (index !== -1) {
          const updatedTests = [...tests];
          updatedTests[index] = test;
          this._performanceTests.set(updatedTests);
        }
        this._currentTest.set(null);
        this._isRunning.set(false);
        return throwError(() => error);
      })
    );
  }

  private executePerformanceTest(test: PerformanceTest): Observable<PerformanceTest> {
    return new Observable(observer => {
      const startTime = Date.now();
      const metrics: PerformanceMetric[] = [];
      let totalRequests = 0;
      let successfulRequests = 0;
      let failedRequests = 0;
      const responseTimes: number[] = [];

      // Start real-time monitoring
      const monitoringInterval = interval(1000).pipe(
        take(test.configuration.testDuration)
      ).subscribe(() => {
        const currentMetrics = this.generateRealTimeMetrics();
        metrics.push(...currentMetrics);
        this._realTimeMetrics.set(currentMetrics);
      });

      // Execute scenarios
      const scenarioPromises = test.scenarios.map(scenario =>
        this.executeScenario(scenario, test.configuration)
      );

      Promise.all(scenarioPromises).then(scenarioResults => {
        monitoringInterval.unsubscribe();

        // Calculate results
        scenarioResults.forEach(result => {
          totalRequests += result.totalRequests;
          successfulRequests += result.successfulRequests;
          failedRequests += result.failedRequests;
          responseTimes.push(...result.responseTimes);
        });

        const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
        const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
        const p99Index = Math.floor(sortedResponseTimes.length * 0.99);

        test.results = {
          totalRequests,
          successfulRequests,
          failedRequests,
          averageResponseTime,
          minResponseTime: Math.min(...responseTimes),
          maxResponseTime: Math.max(...responseTimes),
          p95ResponseTime: sortedResponseTimes[p95Index] || 0,
          p99ResponseTime: sortedResponseTimes[p99Index] || 0,
          throughput: totalRequests / (test.configuration.testDuration || 1),
          errorRate: (failedRequests / totalRequests) * 100,
          cpuUsage: this.getRandomMetric(30, 80),
          memoryUsage: this.getRandomMetric(100, 500),
          networkUsage: this.getRandomMetric(50, 200),
          concurrentUsers: test.scenarios.reduce((sum, s) => sum + s.users, 0),
          peakUsers: test.scenarios.reduce((sum, s) => sum + s.users, 0),
          duration: test.configuration.testDuration
        };

        test.metrics = metrics;
        test.status = 'completed';
        test.endTime = new Date();
        test.duration = test.endTime.getTime() - (test.startTime?.getTime() || 0);

        observer.next(test);
        observer.complete();
      }).catch(error => {
        monitoringInterval.unsubscribe();
        test.status = 'failed';
        test.endTime = new Date();
        test.duration = test.endTime.getTime() - (test.startTime?.getTime() || 0);
        observer.error(error);
      });
    });
  }

  private executeScenario(scenario: PerformanceScenario, config: PerformanceConfiguration): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    responseTimes: number[];
  }> {
    return new Promise((resolve) => {
      const totalRequests = scenario.users * (scenario.duration / 10); // 1 request per 10 seconds per user
      const successfulRequests = Math.floor(totalRequests * 0.95); // 95% success rate
      const failedRequests = totalRequests - successfulRequests;
      const responseTimes: number[] = [];

      // Simulate requests
      for (let i = 0; i < totalRequests; i++) {
        const responseTime = this.getRandomMetric(scenario.expectedResponseTime * 0.5, scenario.expectedResponseTime * 1.5);
        responseTimes.push(responseTime);
      }

      // Simulate scenario duration
      setTimeout(() => {
        resolve({
          totalRequests,
          successfulRequests,
          failedRequests,
          responseTimes
        });
      }, scenario.duration * 1000);
    });
  }

  private generateRealTimeMetrics(): PerformanceMetric[] {
    const now = new Date();
    return [
      {
        name: 'Response Time',
        value: this.getRandomMetric(100, 2000),
        unit: 'ms',
        timestamp: now,
        category: 'load_time',
        threshold: { warning: 1000, critical: 2000 },
        status: 'good'
      },
      {
        name: 'CPU Usage',
        value: this.getRandomMetric(20, 80),
        unit: '%',
        timestamp: now,
        category: 'cpu',
        threshold: { warning: 70, critical: 90 },
        status: 'good'
      },
      {
        name: 'Memory Usage',
        value: this.getRandomMetric(100, 500),
        unit: 'MB',
        timestamp: now,
        category: 'memory',
        threshold: { warning: 400, critical: 600 },
        status: 'good'
      },
      {
        name: 'Network Throughput',
        value: this.getRandomMetric(1, 10),
        unit: 'Mbps',
        timestamp: now,
        category: 'network',
        threshold: { warning: 5, critical: 8 },
        status: 'good'
      }
    ];
  }

  // Report Generation
  generatePerformanceReport(testId: string): Observable<PerformanceReport> {
    const tests = this._performanceTests();
    const test = tests.find(t => t.id === testId);

    if (!test) {
      return throwError(() => new Error('Performance test not found'));
    }

    const report: PerformanceReport = {
      id: this.generateId(),
      testId,
      name: `Performance Report - ${test.name}`,
      description: `Performance test report for ${test.name}`,
      generatedAt: new Date(),
      summary: {
        status: this.calculateTestStatus(test.results),
        overallScore: this.calculateOverallScore(test.results),
        recommendations: this.generateRecommendations(test.results)
      },
      results: test.results,
      metrics: test.metrics,
      charts: this.generateCharts(test),
      analysis: this.generateAnalysis(test.results)
    };

    const reports = this._performanceReports();
    this._performanceReports.set([...reports, report]);

    return new Observable(observer => {
      observer.next(report);
      observer.complete();
    });
  }

  // Status Monitoring
  getIsRunning(): Observable<boolean> {
    return this.isRunning$;
  }

  getCurrentTest(): Observable<PerformanceTest | null> {
    return this.currentTest$;
  }

  getRealTimeMetrics(): Observable<PerformanceMetric[]> {
    return this.realTimeMetrics$;
  }

  getPerformanceReports(): Observable<PerformanceReport[]> {
    return this.performanceReports$;
  }

  // Utility Methods
  private generateId(): string {
    return 'perf-' + Math.random().toString(36).substr(2, 9);
  }

  private getRandomMetric(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private getDefaultResults(): PerformanceResults {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      networkUsage: 0,
      concurrentUsers: 0,
      peakUsers: 0,
      duration: 0
    };
  }

  private getDefaultConfiguration(): PerformanceConfiguration {
    return {
      baseUrl: 'http://localhost:4200',
      maxUsers: 100,
      rampUpTime: 60,
      testDuration: 300,
      thinkTime: 5,
      timeout: 30000,
      retryAttempts: 3,
      monitoring: {
        enabled: true,
        interval: 1,
        metrics: ['response_time', 'cpu', 'memory', 'network']
      },
      thresholds: {
        responseTime: 2000,
        errorRate: 5,
        cpuUsage: 80,
        memoryUsage: 500
      }
    };
  }

  private calculateTestStatus(results: PerformanceResults): 'passed' | 'failed' | 'warning' {
    if (results.errorRate > 5 || results.averageResponseTime > 2000) {
      return 'failed';
    }
    if (results.errorRate > 2 || results.averageResponseTime > 1000) {
      return 'warning';
    }
    return 'passed';
  }

  private calculateOverallScore(results: PerformanceResults): number {
    let score = 100;

    // Deduct points for high response time
    if (results.averageResponseTime > 1000) {
      score -= (results.averageResponseTime - 1000) / 10;
    }

    // Deduct points for high error rate
    score -= results.errorRate * 2;

    // Deduct points for high resource usage
    if (results.cpuUsage > 70) {
      score -= (results.cpuUsage - 70) / 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(results: PerformanceResults): string[] {
    const recommendations: string[] = [];

    if (results.averageResponseTime > 1000) {
      recommendations.push('Optimize response time - consider caching and database optimization');
    }

    if (results.errorRate > 2) {
      recommendations.push('Reduce error rate - investigate and fix failing requests');
    }

    if (results.cpuUsage > 70) {
      recommendations.push('Optimize CPU usage - consider code optimization and resource management');
    }

    if (results.memoryUsage > 400) {
      recommendations.push('Optimize memory usage - check for memory leaks and optimize data structures');
    }

    if (results.throughput < 10) {
      recommendations.push('Increase throughput - consider horizontal scaling and load balancing');
    }

    return recommendations;
  }

  private generateCharts(test: PerformanceTest): PerformanceChart[] {
    return [
      {
        id: 'chart-001',
        name: 'Response Time Trend',
        type: 'line',
        data: test.metrics.filter(m => m.category === 'load_time').map(m => ({
          x: m.timestamp,
          y: m.value
        })),
        xAxis: 'Time',
        yAxis: 'Response Time (ms)',
        title: 'Response Time Over Time',
        description: 'Shows how response time changes during the test'
      },
      {
        id: 'chart-002',
        name: 'Resource Usage',
        type: 'bar',
        data: [
          { name: 'CPU', value: test.results.cpuUsage },
          { name: 'Memory', value: test.results.memoryUsage },
          { name: 'Network', value: test.results.networkUsage }
        ],
        xAxis: 'Resource Type',
        yAxis: 'Usage',
        title: 'Resource Usage Summary',
        description: 'Shows CPU, memory, and network usage'
      }
    ];
  }

  private generateAnalysis(results: PerformanceResults): PerformanceAnalysis {
    const bottlenecks: string[] = [];
    const improvements: string[] = [];
    const risks: string[] = [];
    const trends: string[] = [];

    if (results.averageResponseTime > 1000) {
      bottlenecks.push('High response time');
      improvements.push('Implement caching strategy');
      risks.push('Poor user experience');
    }

    if (results.errorRate > 2) {
      bottlenecks.push('High error rate');
      improvements.push('Improve error handling');
      risks.push('System reliability issues');
    }

    if (results.cpuUsage > 70) {
      bottlenecks.push('High CPU usage');
      improvements.push('Optimize algorithms');
      risks.push('System performance degradation');
    }

    return {
      bottlenecks,
      improvements,
      risks,
      trends,
      compliance: {
        sla: results.averageResponseTime <= 2000,
        performance: results.throughput >= 10,
        reliability: results.errorRate <= 5
      }
    };
  }
}

