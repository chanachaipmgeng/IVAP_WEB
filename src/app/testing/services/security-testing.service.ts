import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface SecurityTest {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'network_security' | 'api_security' | 'vulnerability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number; // milliseconds
  startTime?: Date;
  endTime?: Date;
  vulnerability: SecurityVulnerability;
  remediation: SecurityRemediation;
  compliance: SecurityCompliance;
}

export interface SecurityVulnerability {
  type: 'sql_injection' | 'xss' | 'csrf' | 'authentication_bypass' | 'privilege_escalation' | 'data_exposure' | 'insecure_deserialization' | 'xxe' | 'ssrf' | 'file_upload';
  description: string;
  cve?: string;
  cvss_score: number; // 0-10
  exploitability: 'easy' | 'medium' | 'hard' | 'theoretical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  affected_components: string[];
  proof_of_concept: string;
  references: string[];
}

export interface SecurityRemediation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  steps: string[];
  code_examples: string[];
  testing_required: boolean;
  rollback_plan: string;
}

export interface SecurityCompliance {
  standard: 'OWASP' | 'NIST' | 'ISO27001' | 'PCI_DSS' | 'GDPR' | 'SOC2';
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'partially_compliant';
  evidence: string[];
  last_assessed: Date;
  next_assessment: Date;
}

export interface SecurityScan {
  id: string;
  name: string;
  description: string;
  type: 'automated' | 'manual' | 'penetration' | 'code_review' | 'dependency';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  duration: number;
  vulnerabilities: SecurityVulnerability[];
  findings: SecurityFinding[];
  recommendations: SecurityRecommendation[];
  coverage: number; // percentage
}

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  code_snippet: string;
  impact: string;
  recommendation: string;
  references: string[];
  status: 'open' | 'in_progress' | 'resolved' | 'false_positive';
  assigned_to?: string;
  due_date?: Date;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'code' | 'configuration' | 'infrastructure' | 'process';
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    cost: 'low' | 'medium' | 'high';
  };
  benefits: string[];
  risks: string[];
  dependencies: string[];
}

export interface SecurityReport {
  id: string;
  name: string;
  description: string;
  generatedAt: Date;
  scanId: string;
  summary: {
    total_vulnerabilities: number;
    critical_vulnerabilities: number;
    high_vulnerabilities: number;
    medium_vulnerabilities: number;
    low_vulnerabilities: number;
    risk_score: number; // 0-100
    compliance_score: number; // 0-100
  };
  vulnerabilities: SecurityVulnerability[];
  findings: SecurityFinding[];
  recommendations: SecurityRecommendation[];
  compliance: SecurityCompliance[];
  trends: SecurityTrend[];
  executive_summary: string;
}

export interface SecurityTrend {
  metric: string;
  current_value: number;
  previous_value: number;
  trend: 'improving' | 'stable' | 'declining';
  change_percentage: number;
  period: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityTestingService {
  // ✅ Private writable signals
  private _securityTests = signal<SecurityTest[]>([]);
  private _securityScans = signal<SecurityScan[]>([]);
  private _securityReports = signal<SecurityReport[]>([]);
  private _isRunning = signal<boolean>(false);
  private _currentScan = signal<SecurityScan | null>(null);

  // ✅ Public readonly signals
  public readonly securityTests = this._securityTests.asReadonly();
  public readonly securityScans = this._securityScans.asReadonly();
  public readonly securityReports = this._securityReports.asReadonly();
  public readonly isRunning = this._isRunning.asReadonly();
  public readonly currentScan = this._currentScan.asReadonly();

  // ✅ Computed signals for derived state
  public readonly securityTestsCount = computed(() => this._securityTests().length);
  public readonly runningTestsCount = computed(() =>
    this._securityTests().filter((t: SecurityTest) => t.status === 'running').length
  );
  public readonly passedTestsCount = computed(() =>
    this._securityTests().filter((t: SecurityTest) => t.status === 'passed').length
  );
  public readonly failedTestsCount = computed(() =>
    this._securityTests().filter((t: SecurityTest) => t.status === 'failed').length
  );
  public readonly securityScansCount = computed(() => this._securityScans().length);
  public readonly activeScansCount = computed(() =>
    this._securityScans().filter((s: SecurityScan) => s.status === 'running').length
  );
  public readonly securityReportsCount = computed(() => this._securityReports().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public securityTests$ = new Observable<SecurityTest[]>(observer => {
    observer.next(this._securityTests());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public securityScans$ = new Observable<SecurityScan[]>(observer => {
    observer.next(this._securityScans());
  });
  public securityReports$ = new Observable<SecurityReport[]>(observer => {
    observer.next(this._securityReports());
  });
  public isRunning$ = new Observable<boolean>(observer => {
    observer.next(this._isRunning());
  });
  public currentScan$ = new Observable<SecurityScan | null>(observer => {
    observer.next(this._currentScan());
  });

  constructor() {
    this.initializeSecurityTests();
  }

  private initializeSecurityTests(): void {
    const tests: SecurityTest[] = [
      // Authentication Security Tests
      {
        id: 'sec-001',
        name: 'Password Strength Validation',
        description: 'Test password strength validation and requirements',
        category: 'authentication',
        severity: 'high',
        status: 'pending',
        duration: 0,
        vulnerability: {
          type: 'authentication_bypass',
          description: 'Weak password policies allow easy password guessing',
          cvss_score: 7.5,
          exploitability: 'easy',
          impact: 'high',
          affected_components: ['login', 'registration', 'password_reset'],
          proof_of_concept: 'Password "123456" accepted by system',
          references: ['OWASP-A2', 'NIST-800-63B']
        },
        remediation: {
          priority: 'high',
          effort: 'medium',
          timeline: '2 weeks',
          steps: [
            'Implement password complexity requirements',
            'Add password strength meter',
            'Enforce minimum password length',
            'Add password history check'
          ],
          code_examples: [
            'const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;'
          ],
          testing_required: true,
          rollback_plan: 'Revert to previous password validation logic'
        },
        compliance: {
          standard: 'OWASP',
          requirement: 'A2:2017 - Broken Authentication',
          status: 'non_compliant',
          evidence: ['Weak password validation', 'No password complexity check'],
          last_assessed: new Date(),
          next_assessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'sec-002',
        name: 'Session Management Security',
        description: 'Test session management and token security',
        category: 'authentication',
        severity: 'critical',
        status: 'pending',
        duration: 0,
        vulnerability: {
          type: 'authentication_bypass',
          description: 'Insecure session management allows session hijacking',
          cvss_score: 9.1,
          exploitability: 'medium',
          impact: 'critical',
          affected_components: ['session_management', 'jwt_tokens', 'cookies'],
          proof_of_concept: 'Session token not properly secured',
          references: ['OWASP-A2', 'RFC-6265']
        },
        remediation: {
          priority: 'critical',
          effort: 'high',
          timeline: '1 week',
          steps: [
            'Implement secure session tokens',
            'Add token expiration',
            'Use HTTPS for all sessions',
            'Implement proper logout'
          ],
          code_examples: [
            'const token = jwt.sign(payload, secret, { expiresIn: "1h" });'
          ],
          testing_required: true,
          rollback_plan: 'Revert to previous session management'
        },
        compliance: {
          standard: 'OWASP',
          requirement: 'A2:2017 - Broken Authentication',
          status: 'non_compliant',
          evidence: ['Insecure session tokens', 'No token expiration'],
          last_assessed: new Date(),
          next_assessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      // Data Protection Tests
      {
        id: 'sec-003',
        name: 'SQL Injection Prevention',
        description: 'Test SQL injection vulnerability prevention',
        category: 'data_protection',
        severity: 'critical',
        status: 'pending',
        duration: 0,
        vulnerability: {
          type: 'sql_injection',
          description: 'SQL injection vulnerability in user input handling',
          cvss_score: 9.8,
          exploitability: 'easy',
          impact: 'critical',
          affected_components: ['database_queries', 'user_input', 'api_endpoints'],
          proof_of_concept: "'; DROP TABLE users; --",
          references: ['OWASP-A1', 'CWE-89']
        },
        remediation: {
          priority: 'critical',
          effort: 'medium',
          timeline: '3 days',
          steps: [
            'Use parameterized queries',
            'Implement input validation',
            'Use ORM with built-in protection',
            'Add SQL injection testing'
          ],
          code_examples: [
            'const query = "SELECT * FROM users WHERE id = ?";',
            'const result = await db.query(query, [userId]);'
          ],
          testing_required: true,
          rollback_plan: 'Revert to previous query implementation'
        },
        compliance: {
          standard: 'OWASP',
          requirement: 'A1:2017 - Injection',
          status: 'non_compliant',
          evidence: ['Raw SQL queries', 'No input sanitization'],
          last_assessed: new Date(),
          next_assessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'sec-004',
        name: 'XSS Prevention',
        description: 'Test Cross-Site Scripting (XSS) vulnerability prevention',
        category: 'data_protection',
        severity: 'high',
        status: 'pending',
        duration: 0,
        vulnerability: {
          type: 'xss',
          description: 'XSS vulnerability in user input rendering',
          cvss_score: 6.1,
          exploitability: 'easy',
          impact: 'medium',
          affected_components: ['user_input', 'html_rendering', 'templates'],
          proof_of_concept: '<script>alert("XSS")</script>',
          references: ['OWASP-A7', 'CWE-79']
        },
        remediation: {
          priority: 'high',
          effort: 'medium',
          timeline: '1 week',
          steps: [
            'Implement input sanitization',
            'Use output encoding',
            'Add Content Security Policy',
            'Validate all user inputs'
          ],
          code_examples: [
            'const sanitized = DOMPurify.sanitize(userInput);'
          ],
          testing_required: true,
          rollback_plan: 'Revert to previous input handling'
        },
        compliance: {
          standard: 'OWASP',
          requirement: 'A7:2017 - Cross-Site Scripting (XSS)',
          status: 'non_compliant',
          evidence: ['Unsanitized user input', 'No output encoding'],
          last_assessed: new Date(),
          next_assessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      // API Security Tests
      {
        id: 'sec-005',
        name: 'API Authentication Security',
        description: 'Test API authentication and authorization',
        category: 'api_security',
        severity: 'high',
        status: 'pending',
        duration: 0,
        vulnerability: {
          type: 'authentication_bypass',
          description: 'API endpoints lack proper authentication',
          cvss_score: 7.2,
          exploitability: 'easy',
          impact: 'high',
          affected_components: ['api_endpoints', 'authentication', 'authorization'],
          proof_of_concept: 'API accessible without authentication',
          references: ['OWASP-API1', 'RFC-6749']
        },
        remediation: {
          priority: 'high',
          effort: 'medium',
          timeline: '1 week',
          steps: [
            'Implement API authentication',
            'Add rate limiting',
            'Use API keys or tokens',
            'Implement proper error handling'
          ],
          code_examples: [
            'app.use("/api", authenticateToken);'
          ],
          testing_required: true,
          rollback_plan: 'Revert to previous API implementation'
        },
        compliance: {
          standard: 'OWASP',
          requirement: 'API1:2019 - Broken Object Level Authorization',
          status: 'non_compliant',
          evidence: ['No API authentication', 'Public API endpoints'],
          last_assessed: new Date(),
          next_assessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    this._securityTests.set(tests);
  }

  // Security Test Management
  getSecurityTests(): Observable<SecurityTest[]> {
    return this.securityTests$;
  }

  getSecurityTest(id: string): Observable<SecurityTest | undefined> {
    return new Observable<SecurityTest | undefined>(observer => {
      const test = this._securityTests().find((t: SecurityTest) => t.id === id);
      observer.next(test);
      observer.complete();
    });
  }

  createSecurityTest(test: Omit<SecurityTest, 'id' | 'status' | 'duration'>): Observable<SecurityTest> {
    const newTest: SecurityTest = {
      ...test,
      id: this.generateId(),
      status: 'pending',
      duration: 0
    };

    const tests = this._securityTests();
    this._securityTests.set([...tests, newTest]);

    return new Observable(observer => {
      observer.next(newTest);
      observer.complete();
    });
  }

  // Security Scan Management
  runSecurityScan(scanType: 'automated' | 'manual' | 'penetration' | 'code_review' | 'dependency'): Observable<SecurityScan> {
    const scan: SecurityScan = {
      id: this.generateId(),
      name: `${scanType.charAt(0).toUpperCase() + scanType.slice(1)} Security Scan`,
      description: `Comprehensive ${scanType} security scan`,
      type: scanType,
      status: 'running',
      startTime: new Date(),
      duration: 0,
      vulnerabilities: [],
      findings: [],
      recommendations: [],
      coverage: 0
    };

    const scans = this._securityScans();
    this._securityScans.set([...scans, scan]);
    this._currentScan.set(scan);
    this._isRunning.set(true);

    return this.executeSecurityScan(scan).pipe(
      map(completedScan => {
        const scans = this._securityScans();
        const index = scans.findIndex((s: SecurityScan) => s.id === scan.id);
        if (index !== -1) {
          const updatedScans = [...scans];
          updatedScans[index] = completedScan;
          this._securityScans.set(updatedScans);
        }
        this._currentScan.set(null);
        this._isRunning.set(false);
        return completedScan;
      }),
      catchError(error => {
        scan.status = 'failed';
        scan.endTime = new Date();
        scan.duration = scan.endTime.getTime() - scan.startTime.getTime();

        const scans = this._securityScans();
        const index = scans.findIndex((s: SecurityScan) => s.id === scan.id);
        if (index !== -1) {
          const updatedScans = [...scans];
          updatedScans[index] = scan;
          this._securityScans.set(updatedScans);
        }
        this._currentScan.set(null);
        this._isRunning.set(false);
        return throwError(() => error);
      })
    );
  }

  private executeSecurityScan(scan: SecurityScan): Observable<SecurityScan> {
    return new Observable(observer => {
      // Simulate scan execution
      const scanDuration = Math.random() * 300000 + 60000; // 1-6 minutes

      timer(scanDuration).subscribe(() => {
        // Generate scan results
        scan.vulnerabilities = this.generateVulnerabilities(scan.type);
        scan.findings = this.generateFindings(scan.type);
        scan.recommendations = this.generateRecommendations(scan.type);
        scan.coverage = Math.random() * 40 + 60; // 60-100%

        scan.status = 'completed';
        scan.endTime = new Date();
        scan.duration = scan.endTime.getTime() - scan.startTime.getTime();

        observer.next(scan);
        observer.complete();
      });
    });
  }

  private generateVulnerabilities(scanType: string): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 vulnerabilities

    for (let i = 0; i < count; i++) {
      const types: SecurityVulnerability['type'][] = [
        'sql_injection', 'xss', 'csrf', 'authentication_bypass',
        'privilege_escalation', 'data_exposure', 'insecure_deserialization'
      ];

      const type = types[Math.floor(Math.random() * types.length)];
      const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'critical';

      vulnerabilities.push({
        type,
        description: `${type.replace('_', ' ')} vulnerability detected`,
        cvss_score: Math.random() * 10,
        exploitability: ['easy', 'medium', 'hard', 'theoretical'][Math.floor(Math.random() * 4)] as 'easy' | 'medium' | 'hard' | 'theoretical',
        impact: severity,
        affected_components: ['component1', 'component2'],
        proof_of_concept: `Proof of concept for ${type}`,
        references: [`OWASP-${type.toUpperCase()}`, `CWE-${Math.floor(Math.random() * 1000)}`]
      });
    }

    return vulnerabilities;
  }

  private generateFindings(scanType: string): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const count = Math.floor(Math.random() * 10) + 5; // 5-14 findings

    for (let i = 0; i < count; i++) {
      const severity = ['info', 'low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 5)] as 'info' | 'low' | 'medium' | 'high' | 'critical';

      findings.push({
        id: this.generateId(),
        title: `Security Finding ${i + 1}`,
        description: `Security issue detected in ${scanType} scan`,
        severity,
        category: 'security',
        location: {
          file: `src/app/component${i + 1}.ts`,
          line: Math.floor(Math.random() * 100) + 1,
          column: Math.floor(Math.random() * 50) + 1
        },
        code_snippet: `// Vulnerable code snippet ${i + 1}`,
        impact: `Potential security impact ${i + 1}`,
        recommendation: `Recommendation for finding ${i + 1}`,
        references: [`Reference ${i + 1}`],
        status: 'open'
      });
    }

    return findings;
  }

  private generateRecommendations(scanType: string): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];
    const count = Math.floor(Math.random() * 8) + 3; // 3-10 recommendations

    for (let i = 0; i < count; i++) {
      const priority = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as 'low' | 'medium' | 'high' | 'critical';

      recommendations.push({
        id: this.generateId(),
        title: `Security Recommendation ${i + 1}`,
        description: `Security improvement recommendation for ${scanType}`,
        priority,
        category: ['code', 'configuration', 'infrastructure', 'process'][Math.floor(Math.random() * 4)] as 'code' | 'configuration' | 'infrastructure' | 'process',
        implementation: {
          effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          timeline: `${Math.floor(Math.random() * 4) + 1} weeks`,
          cost: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
        },
        benefits: [`Benefit ${i + 1}`, `Benefit ${i + 2}`],
        risks: [`Risk ${i + 1}`],
        dependencies: [`Dependency ${i + 1}`]
      });
    }

    return recommendations;
  }

  // Security Report Generation
  generateSecurityReport(scanId: string): Observable<SecurityReport> {
    const scans = this._securityScans();
    const scan = scans.find((s: SecurityScan) => s.id === scanId);

    if (!scan) {
      return throwError(() => new Error('Security scan not found'));
    }

    const vulnerabilities = scan.vulnerabilities;
    const criticalCount = vulnerabilities.filter((v: SecurityVulnerability) => v.impact === 'critical').length;
    const highCount = vulnerabilities.filter((v: SecurityVulnerability) => v.impact === 'high').length;
    const mediumCount = vulnerabilities.filter((v: SecurityVulnerability) => v.impact === 'medium').length;
    const lowCount = vulnerabilities.filter((v: SecurityVulnerability) => v.impact === 'low').length;

    const report: SecurityReport = {
      id: this.generateId(),
      name: `Security Report - ${scan.name}`,
      description: `Comprehensive security report for ${scan.name}`,
      generatedAt: new Date(),
      scanId,
      summary: {
        total_vulnerabilities: vulnerabilities.length,
        critical_vulnerabilities: criticalCount,
        high_vulnerabilities: highCount,
        medium_vulnerabilities: mediumCount,
        low_vulnerabilities: lowCount,
        risk_score: this.calculateRiskScore(vulnerabilities),
        compliance_score: this.calculateComplianceScore(scan)
      },
      vulnerabilities,
      findings: scan.findings,
      recommendations: scan.recommendations,
      compliance: this.generateComplianceData(),
      trends: this.generateTrends(),
      executive_summary: this.generateExecutiveSummary(scan)
    };

    const reports = this._securityReports();
    this._securityReports.set([...reports, report]);

    return new Observable(observer => {
      observer.next(report);
      observer.complete();
    });
  }

  // Status Monitoring
  getIsRunning(): Observable<boolean> {
    return this.isRunning$;
  }

  getCurrentScan(): Observable<SecurityScan | null> {
    return this.currentScan$;
  }

  getSecurityReports(): Observable<SecurityReport[]> {
    return this.securityReports$;
  }

  // Utility Methods
  private generateId(): string {
    return 'sec-' + Math.random().toString(36).substr(2, 9);
  }

  private calculateRiskScore(vulnerabilities: SecurityVulnerability[]): number {
    if (vulnerabilities.length === 0) return 0;

    const totalScore = vulnerabilities.reduce((sum, v) => sum + v.cvss_score, 0);
    return Math.min(100, (totalScore / vulnerabilities.length) * 10);
  }

  private calculateComplianceScore(scan: SecurityScan): number {
    const baseScore = 100;
    const vulnerabilityPenalty = scan.vulnerabilities.length * 5;
    const findingPenalty = scan.findings.filter(f => f.severity === 'high' || f.severity === 'critical').length * 3;

    return Math.max(0, baseScore - vulnerabilityPenalty - findingPenalty);
  }

  private generateComplianceData(): SecurityCompliance[] {
    return [
      {
        standard: 'OWASP',
        requirement: 'OWASP Top 10 2017',
        status: 'partially_compliant',
        evidence: ['Security tests implemented', 'Some vulnerabilities found'],
        last_assessed: new Date(),
        next_assessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      {
        standard: 'NIST',
        requirement: 'NIST Cybersecurity Framework',
        status: 'compliant',
        evidence: ['Security controls implemented', 'Regular assessments conducted'],
        last_assessed: new Date(),
        next_assessment: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  private generateTrends(): SecurityTrend[] {
    return [
      {
        metric: 'Vulnerability Count',
        current_value: 5,
        previous_value: 8,
        trend: 'improving',
        change_percentage: -37.5,
        period: 'Last 30 days'
      },
      {
        metric: 'Security Score',
        current_value: 85,
        previous_value: 78,
        trend: 'improving',
        change_percentage: 9.0,
        period: 'Last 30 days'
      }
    ];
  }

  private generateExecutiveSummary(scan: SecurityScan): string {
    const criticalCount = scan.vulnerabilities.filter(v => v.impact === 'critical').length;
    const highCount = scan.vulnerabilities.filter(v => v.impact === 'high').length;

    return `Security scan completed with ${scan.vulnerabilities.length} vulnerabilities found.
    ${criticalCount} critical and ${highCount} high severity issues require immediate attention.
    Overall security posture shows improvement with ${scan.coverage.toFixed(1)}% coverage achieved.`;
  }
}

