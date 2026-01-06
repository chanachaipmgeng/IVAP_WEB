import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface ProductionReadinessCheck {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'performance' | 'reliability' | 'scalability' | 'monitoring' | 'compliance' | 'backup' | 'disaster_recovery';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'warning' | 'not_applicable';
  score: number; // 0-100
  weight: number; // 1-10
  requirements: ProductionRequirement[];
  findings: ProductionFinding[];
  recommendations: ProductionRecommendation[];
  lastChecked: Date;
  nextCheck: Date;
  checkedBy: string;
  evidence: string[];
  compliance: ComplianceStatus;
}

export interface ProductionRequirement {
  id: string;
  title: string;
  description: string;
  type: 'mandatory' | 'recommended' | 'optional';
  status: 'met' | 'not_met' | 'partial' | 'not_applicable';
  evidence: string[];
  notes: string;
  references: string[];
}

export interface ProductionFinding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'reliability' | 'compliance' | 'operational';
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  impact: string;
  likelihood: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100
  remediation: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  assignedTo?: string;
  dueDate?: Date;
  evidence: string[];
  references: string[];
}

export interface ProductionRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'reliability' | 'operational' | 'compliance';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  cost: 'low' | 'medium' | 'high';
  benefits: string[];
  risks: string[];
  dependencies: string[];
  implementation: string[];
  successCriteria: string[];
  owner?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface ComplianceStatus {
  standard: string;
  version: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';
  score: number; // 0-100
  requirements: ComplianceRequirement[];
  gaps: ComplianceGap[];
  lastAssessed: Date;
  nextAssessment: Date;
  assessor: string;
  evidence: string[];
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
  evidence: string[];
  notes: string;
  references: string[];
}

export interface ComplianceGap {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  remediation: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  owner?: string;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface ProductionReadinessReport {
  id: string;
  name: string;
  description: string;
  generatedAt: Date;
  overallScore: number; // 0-100
  readinessStatus: 'ready' | 'not_ready' | 'conditional' | 'needs_improvement';
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
    criticalIssues: number;
    highPriorityIssues: number;
    mediumPriorityIssues: number;
    lowPriorityIssues: number;
  };
  checks: ProductionReadinessCheck[];
  findings: ProductionFinding[];
  recommendations: ProductionRecommendation[];
  compliance: ComplianceStatus[];
  trends: ProductionTrend[];
  nextSteps: ProductionNextStep[];
  executiveSummary: string;
}

export interface ProductionTrend {
  metric: string;
  currentValue: number;
  previousValue: number;
  trend: 'improving' | 'stable' | 'declining';
  changePercentage: number;
  period: string;
  target?: number;
}

export interface ProductionNextStep {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'performance' | 'reliability' | 'compliance' | 'operational';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  dependencies: string[];
  successCriteria: string[];
  owner?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ProductionMetrics {
  availability: number; // percentage
  performance: number; // score 0-100
  security: number; // score 0-100
  reliability: number; // score 0-100
  scalability: number; // score 0-100
  compliance: number; // score 0-100
  monitoring: number; // score 0-100
  backup: number; // score 0-100
  disasterRecovery: number; // score 0-100
  overall: number; // weighted average
}

@Injectable({
  providedIn: 'root'
})
export class ProductionReadinessService {
  // ✅ Private writable signals
  private _readinessChecks = signal<ProductionReadinessCheck[]>([]);
  private _readinessReports = signal<ProductionReadinessReport[]>([]);
  private _productionMetrics = signal<ProductionMetrics | null>(null);
  private _isAssessing = signal<boolean>(false);

  // ✅ Public readonly signals
  public readonly readinessChecks = this._readinessChecks.asReadonly();
  public readonly readinessReports = this._readinessReports.asReadonly();
  public readonly productionMetrics = this._productionMetrics.asReadonly();
  public readonly isAssessing = this._isAssessing.asReadonly();

  // ✅ Computed signals for derived state
  public readonly readinessChecksCount = computed(() => this._readinessChecks().length);
  public readonly passedChecksCount = computed(() =>
    this._readinessChecks().filter((c: ProductionReadinessCheck) => c.status === 'passed').length
  );
  public readonly failedChecksCount = computed(() =>
    this._readinessChecks().filter((c: ProductionReadinessCheck) => c.status === 'failed').length
  );
  public readonly warningChecksCount = computed(() =>
    this._readinessChecks().filter((c: ProductionReadinessCheck) => c.status === 'warning').length
  );
  public readonly readinessReportsCount = computed(() => this._readinessReports().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public readinessChecks$ = new Observable<ProductionReadinessCheck[]>(observer => {
    observer.next(this._readinessChecks());
  });
  public readinessReports$ = new Observable<ProductionReadinessReport[]>(observer => {
    observer.next(this._readinessReports());
  });
  public productionMetrics$ = new Observable<ProductionMetrics | null>(observer => {
    observer.next(this._productionMetrics());
  });
  public isAssessing$ = new Observable<boolean>(observer => {
    observer.next(this._isAssessing());
  });

  constructor() {
    this.initializeReadinessChecks();
  }

  private initializeReadinessChecks(): void {
    const checks: ProductionReadinessCheck[] = [
      // Security Checks
      {
        id: 'check-001',
        name: 'Security Configuration Review',
        description: 'Comprehensive review of security configurations and controls',
        category: 'security',
        priority: 'critical',
        status: 'pending',
        score: 0,
        weight: 10,
        requirements: [
          {
            id: 'req-001',
            title: 'Authentication and Authorization',
            description: 'Proper authentication and authorization mechanisms in place',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['OWASP-A2', 'NIST-800-63B']
          },
          {
            id: 'req-002',
            title: 'Data Encryption',
            description: 'Data encrypted at rest and in transit',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['OWASP-A3', 'NIST-800-53']
          },
          {
            id: 'req-003',
            title: 'Security Headers',
            description: 'Proper security headers configured',
            type: 'recommended',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['OWASP-A6', 'Mozilla Security Headers']
          }
        ],
        findings: [],
        recommendations: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        checkedBy: 'Security Team',
        evidence: [],
        compliance: {
          standard: 'OWASP Top 10',
          version: '2021',
          status: 'not_assessed',
          score: 0,
          requirements: [],
          gaps: [],
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          assessor: 'Security Team',
          evidence: []
        }
      },
      // Performance Checks
      {
        id: 'check-002',
        name: 'Performance and Scalability Assessment',
        description: 'Assessment of system performance and scalability',
        category: 'performance',
        priority: 'high',
        status: 'pending',
        score: 0,
        weight: 8,
        requirements: [
          {
            id: 'req-004',
            title: 'Response Time Requirements',
            description: 'System meets response time requirements',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Performance SLA', 'User Experience Guidelines']
          },
          {
            id: 'req-005',
            title: 'Load Testing',
            description: 'System tested under expected load',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Load Testing Standards', 'Performance Benchmarks']
          },
          {
            id: 'req-006',
            title: 'Auto-scaling Configuration',
            description: 'Auto-scaling properly configured',
            type: 'recommended',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Scalability Guidelines', 'Cloud Best Practices']
          }
        ],
        findings: [],
        recommendations: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        checkedBy: 'Performance Team',
        evidence: [],
        compliance: {
          standard: 'Performance SLA',
          version: '1.0',
          status: 'not_assessed',
          score: 0,
          requirements: [],
          gaps: [],
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          assessor: 'Performance Team',
          evidence: []
        }
      },
      // Reliability Checks
      {
        id: 'check-003',
        name: 'Reliability and Availability Assessment',
        description: 'Assessment of system reliability and availability',
        category: 'reliability',
        priority: 'high',
        status: 'pending',
        score: 0,
        weight: 9,
        requirements: [
          {
            id: 'req-007',
            title: 'High Availability Configuration',
            description: 'System configured for high availability',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['High Availability Guidelines', 'SLA Requirements']
          },
          {
            id: 'req-008',
            title: 'Fault Tolerance',
            description: 'System designed for fault tolerance',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Fault Tolerance Standards', 'Resilience Guidelines']
          },
          {
            id: 'req-009',
            title: 'Health Checks',
            description: 'Comprehensive health checks implemented',
            type: 'recommended',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Health Check Standards', 'Monitoring Guidelines']
          }
        ],
        findings: [],
        recommendations: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        checkedBy: 'Reliability Team',
        evidence: [],
        compliance: {
          standard: 'Reliability Standards',
          version: '1.0',
          status: 'not_assessed',
          score: 0,
          requirements: [],
          gaps: [],
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          assessor: 'Reliability Team',
          evidence: []
        }
      },
      // Monitoring Checks
      {
        id: 'check-004',
        name: 'Monitoring and Observability Setup',
        description: 'Assessment of monitoring and observability capabilities',
        category: 'monitoring',
        priority: 'high',
        status: 'pending',
        score: 0,
        weight: 7,
        requirements: [
          {
            id: 'req-010',
            title: 'Application Monitoring',
            description: 'Comprehensive application monitoring in place',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Monitoring Standards', 'Observability Guidelines']
          },
          {
            id: 'req-011',
            title: 'Infrastructure Monitoring',
            description: 'Infrastructure monitoring configured',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Infrastructure Monitoring', 'System Health Guidelines']
          },
          {
            id: 'req-012',
            title: 'Logging and Alerting',
            description: 'Proper logging and alerting configured',
            type: 'recommended',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Logging Standards', 'Alerting Guidelines']
          }
        ],
        findings: [],
        recommendations: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        checkedBy: 'Monitoring Team',
        evidence: [],
        compliance: {
          standard: 'Monitoring Standards',
          version: '1.0',
          status: 'not_assessed',
          score: 0,
          requirements: [],
          gaps: [],
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          assessor: 'Monitoring Team',
          evidence: []
        }
      },
      // Backup and Disaster Recovery Checks
      {
        id: 'check-005',
        name: 'Backup and Disaster Recovery Assessment',
        description: 'Assessment of backup and disaster recovery capabilities',
        category: 'backup',
        priority: 'critical',
        status: 'pending',
        score: 0,
        weight: 9,
        requirements: [
          {
            id: 'req-013',
            title: 'Data Backup Strategy',
            description: 'Comprehensive data backup strategy implemented',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Backup Standards', 'Data Protection Guidelines']
          },
          {
            id: 'req-014',
            title: 'Disaster Recovery Plan',
            description: 'Disaster recovery plan documented and tested',
            type: 'mandatory',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['Disaster Recovery Standards', 'Business Continuity Guidelines']
          },
          {
            id: 'req-015',
            title: 'Recovery Time Objectives',
            description: 'Recovery time objectives defined and achievable',
            type: 'recommended',
            status: 'not_met',
            evidence: [],
            notes: '',
            references: ['RTO/RPO Guidelines', 'Business Requirements']
          }
        ],
        findings: [],
        recommendations: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        checkedBy: 'Backup Team',
        evidence: [],
        compliance: {
          standard: 'Backup and DR Standards',
          version: '1.0',
          status: 'not_assessed',
          score: 0,
          requirements: [],
          gaps: [],
          lastAssessed: new Date(),
          nextAssessment: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          assessor: 'Backup Team',
          evidence: []
        }
      }
    ];

    this._readinessChecks.set(checks);
  }

  // Readiness Check Management
  getReadinessChecks(): Observable<ProductionReadinessCheck[]> {
    return this.readinessChecks$;
  }

  getReadinessCheck(id: string): Observable<ProductionReadinessCheck | undefined> {
    return new Observable<ProductionReadinessCheck | undefined>(observer => {
      const check = this._readinessChecks().find((check: ProductionReadinessCheck) => check.id === id);
      observer.next(check);
      observer.complete();
    });
  }

  createReadinessCheck(check: Omit<ProductionReadinessCheck, 'id' | 'score' | 'findings' | 'recommendations' | 'lastChecked' | 'nextCheck' | 'evidence' | 'compliance'>): Observable<ProductionReadinessCheck> {
    const newCheck: ProductionReadinessCheck = {
      ...check,
      id: this.generateId(),
      score: 0,
      findings: [],
      recommendations: [],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      evidence: [],
      compliance: {
        standard: 'Custom',
        version: '1.0',
        status: 'not_assessed',
        score: 0,
        requirements: [],
        gaps: [],
        lastAssessed: new Date(),
        nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        assessor: 'System',
        evidence: []
      }
    };

    const checks = this._readinessChecks();
    this._readinessChecks.set([...checks, newCheck]);

    return new Observable(observer => {
      observer.next(newCheck);
      observer.complete();
    });
  }

  // Assessment Execution
  runReadinessAssessment(): Observable<ProductionReadinessCheck[]> {
    this._isAssessing.set(true);

    return new Observable(observer => {
      timer(5000).subscribe(() => {
        const checks = this._readinessChecks();
        const updatedChecks = checks.map(check => this.assessReadinessCheck(check));

        this._readinessChecks.set(updatedChecks);
        this._isAssessing.set(false);
        observer.next(updatedChecks);
        observer.complete();
      });
    });
  }

  private assessReadinessCheck(check: ProductionReadinessCheck): ProductionReadinessCheck {
    // Simulate assessment
    const requirements = check.requirements.map(req => {
      const status = Math.random() > 0.3 ? 'met' : 'not_met';
      return { ...req, status: status as 'met' | 'not_met' | 'partial' | 'not_applicable' };
    });

    const metRequirements = requirements.filter(req => req.status === 'met').length;
    const totalRequirements = requirements.length;
    const score = totalRequirements > 0 ? (metRequirements / totalRequirements) * 100 : 0;

    const status = score >= 90 ? 'passed' : score >= 70 ? 'warning' : 'failed';

    const findings = this.generateFindings(check, requirements);
    const recommendations = this.generateRecommendations(check, requirements);

    return {
      ...check,
      requirements,
      score,
      status,
      findings,
      recommendations,
      lastChecked: new Date(),
      evidence: this.generateEvidence(check)
    };
  }

  private generateFindings(check: ProductionReadinessCheck, requirements: ProductionRequirement[]): ProductionFinding[] {
    const findings: ProductionFinding[] = [];

    requirements.filter(req => req.status === 'not_met').forEach(req => {
      findings.push({
        id: this.generateId(),
        title: `Requirement Not Met: ${req.title}`,
        description: req.description,
        severity: req.type === 'mandatory' ? 'high' : 'medium',
        category: check.category as any,
        status: 'open',
        impact: `System may not meet ${req.title} requirements`,
        likelihood: 'medium',
        riskScore: req.type === 'mandatory' ? 80 : 50,
        remediation: `Implement ${req.title} requirements`,
        effort: 'medium',
        timeline: '2-4 weeks',
        evidence: [],
        references: req.references
      });
    });

    return findings;
  }

  private generateRecommendations(check: ProductionReadinessCheck, requirements: ProductionRequirement[]): ProductionRecommendation[] {
    const recommendations: ProductionRecommendation[] = [];

    const unmetRequirements = requirements.filter(req => req.status === 'not_met');

    if (unmetRequirements.length > 0) {
      recommendations.push({
        id: this.generateId(),
        title: `Address ${check.name} Requirements`,
        description: `Implement missing requirements for ${check.name}`,
        priority: check.priority,
        category: check.category as any,
        effort: 'high',
        timeline: '4-6 weeks',
        cost: 'medium',
        benefits: ['Improved security', 'Better compliance', 'Reduced risk'],
        risks: ['Implementation delays', 'Resource constraints'],
        dependencies: [],
        implementation: ['Assess current state', 'Develop implementation plan', 'Execute implementation', 'Validate results'],
        successCriteria: ['All requirements met', 'Score above 90%', 'No critical findings'],
        status: 'pending'
      });
    }

    return recommendations;
  }

  private generateEvidence(check: ProductionReadinessCheck): string[] {
    const evidence: string[] = [];

    if (check.category === 'security') {
      evidence.push('Security configuration files', 'Penetration test results', 'Vulnerability scan reports');
    } else if (check.category === 'performance') {
      evidence.push('Load test results', 'Performance benchmarks', 'Scalability test reports');
    } else if (check.category === 'reliability') {
      evidence.push('Availability metrics', 'Fault tolerance test results', 'HA configuration');
    } else if (check.category === 'monitoring') {
      evidence.push('Monitoring dashboard screenshots', 'Alert configuration', 'Log analysis reports');
    } else if (check.category === 'backup') {
      evidence.push('Backup test results', 'DR plan documentation', 'Recovery test reports');
    }

    return evidence;
  }

  // Report Generation
  generateReadinessReport(): Observable<ProductionReadinessReport> {
    const checks = this._readinessChecks();
    const allFindings = checks.flatMap(check => check.findings);
    const allRecommendations = checks.flatMap(check => check.recommendations);

    const totalChecks = checks.length;
    const passedChecks = checks.filter(check => check.status === 'passed').length;
    const failedChecks = checks.filter(check => check.status === 'failed').length;
    const warningChecks = checks.filter(check => check.status === 'warning').length;

    const criticalIssues = allFindings.filter(f => f.severity === 'critical').length;
    const highPriorityIssues = allFindings.filter(f => f.severity === 'high').length;
    const mediumPriorityIssues = allFindings.filter(f => f.severity === 'medium').length;
    const lowPriorityIssues = allFindings.filter(f => f.severity === 'low').length;

    const overallScore = this.calculateOverallScore(checks);
    const readinessStatus = this.calculateReadinessStatus(overallScore, criticalIssues);

    const report: ProductionReadinessReport = {
      id: this.generateId(),
      name: 'Production Readiness Assessment Report',
      description: 'Comprehensive production readiness assessment report',
      generatedAt: new Date(),
      overallScore,
      readinessStatus,
      summary: {
        totalChecks,
        passedChecks,
        failedChecks,
        warningChecks,
        criticalIssues,
        highPriorityIssues,
        mediumPriorityIssues,
        lowPriorityIssues
      },
      checks,
      findings: allFindings,
      recommendations: allRecommendations,
      compliance: checks.map(check => check.compliance),
      trends: this.generateTrends(checks),
      nextSteps: this.generateNextSteps(allFindings, allRecommendations),
      executiveSummary: this.generateExecutiveSummary(overallScore, readinessStatus, criticalIssues)
    };

    const reports = this._readinessReports();
    this._readinessReports.set([...reports, report]);

    return new Observable(observer => {
      observer.next(report);
      observer.complete();
    });
  }

  // Metrics Calculation
  calculateProductionMetrics(): Observable<ProductionMetrics> {
    const checks = this._readinessChecks();

    const metrics: ProductionMetrics = {
      availability: this.calculateCategoryScore(checks, 'reliability'),
      performance: this.calculateCategoryScore(checks, 'performance'),
      security: this.calculateCategoryScore(checks, 'security'),
      reliability: this.calculateCategoryScore(checks, 'reliability'),
      scalability: this.calculateCategoryScore(checks, 'scalability'),
      compliance: this.calculateCategoryScore(checks, 'compliance'),
      monitoring: this.calculateCategoryScore(checks, 'monitoring'),
      backup: this.calculateCategoryScore(checks, 'backup'),
      disasterRecovery: this.calculateCategoryScore(checks, 'disaster_recovery'),
      overall: this.calculateOverallScore(checks)
    };

    this._productionMetrics.set(metrics);

    return new Observable(observer => {
      observer.next(metrics);
      observer.complete();
    });
  }

  // Status Monitoring
  getIsAssessing(): Observable<boolean> {
    return this.isAssessing$;
  }

  getProductionMetrics(): Observable<ProductionMetrics | null> {
    return this.productionMetrics$;
  }

  getReadinessReports(): Observable<ProductionReadinessReport[]> {
    return this.readinessReports$;
  }

  // Utility Methods
  private generateId(): string {
    return 'prod-' + Math.random().toString(36).substr(2, 9);
  }

  private calculateOverallScore(checks: ProductionReadinessCheck[]): number {
    if (checks.length === 0) return 0;

    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
    const weightedScore = checks.reduce((sum, check) => sum + (check.score * check.weight), 0);

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  private calculateCategoryScore(checks: ProductionReadinessCheck[], category: string): number {
    const categoryChecks = checks.filter(check => check.category === category);
    if (categoryChecks.length === 0) return 0;

    return categoryChecks.reduce((sum, check) => sum + check.score, 0) / categoryChecks.length;
  }

  private calculateReadinessStatus(overallScore: number, criticalIssues: number): 'ready' | 'not_ready' | 'conditional' | 'needs_improvement' {
    if (criticalIssues > 0) return 'not_ready';
    if (overallScore >= 90) return 'ready';
    if (overallScore >= 70) return 'conditional';
    return 'needs_improvement';
  }

  private generateTrends(checks: ProductionReadinessCheck[]): ProductionTrend[] {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const currentScore = this.calculateOverallScore(checks);
    const previousScore = currentScore * 0.8; // Simulated previous score

    return [
      {
        metric: 'Overall Readiness Score',
        currentValue: currentScore,
        previousValue: previousScore,
        trend: currentScore > previousScore ? 'improving' : 'stable',
        changePercentage: ((currentScore - previousScore) / previousScore) * 100,
        period: 'Last 30 days',
        target: 90
      }
    ];
  }

  private generateNextSteps(findings: ProductionFinding[], recommendations: ProductionRecommendation[]): ProductionNextStep[] {
    const nextSteps: ProductionNextStep[] = [];

    const criticalFindings = findings.filter(f => f.severity === 'critical');
    if (criticalFindings.length > 0) {
      nextSteps.push({
        id: this.generateId(),
        title: 'Address Critical Findings',
        description: 'Resolve all critical findings before production deployment',
        priority: 'critical',
        category: 'security',
        effort: 'high',
        timeline: '1-2 weeks',
        dependencies: [],
        successCriteria: ['All critical findings resolved', 'No critical issues remaining'],
        status: 'pending'
      });
    }

    const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high');
    if (highPriorityRecommendations.length > 0) {
      nextSteps.push({
        id: this.generateId(),
        title: 'Implement High Priority Recommendations',
        description: 'Implement high priority recommendations to improve readiness',
        priority: 'high',
        category: 'operational',
        effort: 'medium',
        timeline: '2-4 weeks',
        dependencies: [],
        successCriteria: ['High priority recommendations implemented', 'Readiness score improved'],
        status: 'pending'
      });
    }

    return nextSteps;
  }

  private generateExecutiveSummary(overallScore: number, readinessStatus: string, criticalIssues: number): string {
    let summary = `Production readiness assessment completed with an overall score of ${overallScore.toFixed(1)}%. `;

    if (readinessStatus === 'ready') {
      summary += 'The system is ready for production deployment.';
    } else if (readinessStatus === 'conditional') {
      summary += 'The system is conditionally ready for production with some improvements needed.';
    } else if (readinessStatus === 'not_ready') {
      summary += 'The system is not ready for production deployment due to critical issues.';
    } else {
      summary += 'The system needs significant improvements before production deployment.';
    }

    if (criticalIssues > 0) {
      summary += ` ${criticalIssues} critical issues must be resolved before deployment.`;
    }

    return summary;
  }
}
