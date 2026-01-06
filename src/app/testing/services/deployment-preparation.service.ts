import { Injectable, signal, computed } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

export interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'demo';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  url: string;
  configuration: DeploymentConfiguration;
  infrastructure: InfrastructureConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  lastDeployed?: Date;
  lastHealthCheck?: Date;
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
}

export interface DeploymentConfiguration {
  version: string;
  buildNumber: string;
  environment: string;
  features: string[];
  config: Record<string, any>;
  secrets: string[];
  environmentVariables: Record<string, string>;
  database: DatabaseConfig;
  cache: CacheConfig;
  storage: StorageConfig;
  networking: NetworkingConfig;
}

export interface InfrastructureConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'on-premise' | 'hybrid';
  region: string;
  availabilityZones: string[];
  compute: ComputeConfig;
  storage: StorageConfig;
  networking: NetworkingConfig;
  loadBalancer: LoadBalancerConfig;
  autoScaling: AutoScalingConfig;
  backup: BackupConfig;
}

export interface ComputeConfig {
  instanceType: string;
  minInstances: number;
  maxInstances: number;
  currentInstances: number;
  cpu: number;
  memory: number;
  storage: number;
  operatingSystem: string;
  containerRuntime?: string;
}

export interface StorageConfig {
  type: 'local' | 'network' | 'cloud';
  size: number;
  iops: number;
  encryption: boolean;
  backup: boolean;
  redundancy: 'none' | 'single' | 'multiple';
}

export interface NetworkingConfig {
  vpc: string;
  subnets: string[];
  securityGroups: string[];
  ports: number[];
  protocols: string[];
  ssl: boolean;
  cdn: boolean;
  firewall: FirewallConfig;
}

export interface LoadBalancerConfig {
  type: 'application' | 'network' | 'classic';
  algorithm: 'round_robin' | 'least_connections' | 'ip_hash';
  healthCheck: HealthCheckConfig;
  ssl: boolean;
  stickySessions: boolean;
}

export interface AutoScalingConfig {
  enabled: boolean;
  minCapacity: number;
  maxCapacity: number;
  targetUtilization: number;
  scaleUpPolicy: ScalingPolicy;
  scaleDownPolicy: ScalingPolicy;
  cooldown: number;
}

export interface BackupConfig {
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  retention: number; // days
  encryption: boolean;
  compression: boolean;
  location: string;
}

export interface MonitoringConfig {
  enabled: boolean;
  tools: string[];
  metrics: string[];
  alerts: AlertConfig[];
  dashboards: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  retention: number; // days
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  network: NetworkSecurityConfig;
  compliance: ComplianceConfig;
  audit: AuditConfig;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'elasticsearch';
  host: string;
  port: number;
  name: string;
  username: string;
  ssl: boolean;
  connectionPool: ConnectionPoolConfig;
  backup: BackupConfig;
  replication: ReplicationConfig;
}

export interface CacheConfig {
  type: 'redis' | 'memcached' | 'in-memory';
  host: string;
  port: number;
  password?: string;
  ttl: number; // seconds
  maxMemory: string;
  evictionPolicy: string;
}

export interface FirewallConfig {
  enabled: boolean;
  rules: FirewallRule[];
  defaultAction: 'allow' | 'deny';
}

export interface FirewallRule {
  id: string;
  name: string;
  action: 'allow' | 'deny';
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  port: number | string;
  source: string;
  destination: string;
  priority: number;
}

export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
  interval: number; // seconds
  timeout: number; // seconds
  healthyThreshold: number;
  unhealthyThreshold: number;
  expectedStatus: number;
}

export interface ScalingPolicy {
  type: 'target_tracking' | 'step_scaling' | 'simple_scaling';
  targetValue?: number;
  adjustmentType: 'change_in_capacity' | 'percent_change_in_capacity' | 'exact_capacity';
  adjustmentValue: number;
  cooldown: number;
}

export interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
  cooldown: number;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  algorithm: string;
  keyManagement: 'aws_kms' | 'azure_keyvault' | 'gcp_kms' | 'self_managed';
  keyRotation: boolean;
  rotationPeriod: number; // days
}

export interface AuthenticationConfig {
  method: 'password' | 'oauth' | 'saml' | 'ldap' | 'multi_factor';
  providers: string[];
  sessionTimeout: number; // minutes
  passwordPolicy: PasswordPolicy;
  mfa: MFAConfig;
}

export interface AuthorizationConfig {
  model: 'rbac' | 'abac' | 'dac' | 'mac';
  roles: string[];
  permissions: string[];
  policies: string[];
  inheritance: boolean;
}

export interface NetworkSecurityConfig {
  vpn: boolean;
  privateNetwork: boolean;
  ipWhitelist: string[];
  ddosProtection: boolean;
  waf: boolean;
  ssl: boolean;
  certificates: string[];
}

export interface ComplianceConfig {
  standards: string[];
  certifications: string[];
  auditLogging: boolean;
  dataRetention: number; // days
  privacyControls: string[];
  riskAssessment: string;
}

export interface AuditConfig {
  enabled: boolean;
  events: string[];
  retention: number; // days
  encryption: boolean;
  realTime: boolean;
  reporting: boolean;
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // days
  historyCount: number;
}

export interface MFAConfig {
  enabled: boolean;
  methods: string[];
  required: boolean;
  backupCodes: boolean;
  rememberDevice: boolean;
}

export interface ConnectionPoolConfig {
  min: number;
  max: number;
  idle: number; // seconds
  acquire: number; // seconds
  timeout: number; // seconds
}

export interface ReplicationConfig {
  enabled: boolean;
  type: 'master_slave' | 'master_master' | 'cluster';
  replicas: number;
  lag: number; // seconds
  failover: boolean;
}

export interface DeploymentPlan {
  id: string;
  name: string;
  description: string;
  environment: string;
  version: string;
  strategy: 'blue_green' | 'rolling' | 'canary' | 'recreate';
  steps: DeploymentStep[];
  rollbackPlan: RollbackPlan;
  validation: ValidationConfig;
  notifications: NotificationConfig;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
  createdAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // minutes
}

export interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  type: 'pre_deployment' | 'deployment' | 'post_deployment' | 'validation' | 'rollback';
  order: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number; // minutes
  startTime?: Date;
  endTime?: Date;
  commands: string[];
  scripts: string[];
  dependencies: string[];
  timeout: number; // minutes
  retryCount: number;
  maxRetries: number;
  rollbackCommands: string[];
  validation: ValidationConfig;
}

export interface RollbackPlan {
  id: string;
  name: string;
  description: string;
  steps: DeploymentStep[];
  triggers: string[];
  automatic: boolean;
  timeout: number; // minutes
  validation: ValidationConfig;
}

export interface ValidationConfig {
  enabled: boolean;
  tests: string[];
  healthChecks: string[];
  smokeTests: string[];
  performanceTests: string[];
  securityTests: string[];
  timeout: number; // minutes
  retryCount: number;
  maxRetries: number;
}

export interface NotificationConfig {
  enabled: boolean;
  channels: string[];
  events: string[];
  recipients: string[];
  templates: string[];
  schedule: string;
}

export interface DeploymentReport {
  id: string;
  name: string;
  description: string;
  deploymentId: string;
  environment: string;
  version: string;
  status: 'success' | 'failure' | 'partial' | 'rolled_back';
  generatedAt: Date;
  summary: {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    skippedSteps: number;
    duration: number; // minutes
    successRate: number; // percentage
  };
  steps: DeploymentStep[];
  metrics: DeploymentMetrics;
  issues: DeploymentIssue[];
  recommendations: string[];
  nextSteps: string[];
}

export interface DeploymentMetrics {
  deploymentTime: number; // minutes
  downtime: number; // minutes
  errorRate: number; // percentage
  throughput: number; // requests per second
  responseTime: number; // milliseconds
  resourceUsage: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    network: number; // Mbps
  };
  healthScore: number; // 0-100
}

export interface DeploymentIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'infrastructure' | 'application' | 'configuration' | 'network' | 'security';
  step: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
  assignedTo?: string;
  dueDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DeploymentPreparationService {
  // ✅ Private writable signals
  private _deploymentEnvironments = signal<DeploymentEnvironment[]>([]);
  private _deploymentPlans = signal<DeploymentPlan[]>([]);
  private _deploymentReports = signal<DeploymentReport[]>([]);
  private _isDeploying = signal<boolean>(false);
  private _currentDeployment = signal<DeploymentPlan | null>(null);

  // ✅ Public readonly signals
  public readonly deploymentEnvironments = this._deploymentEnvironments.asReadonly();
  public readonly deploymentPlans = this._deploymentPlans.asReadonly();
  public readonly deploymentReports = this._deploymentReports.asReadonly();
  public readonly isDeploying = this._isDeploying.asReadonly();
  public readonly currentDeployment = this._currentDeployment.asReadonly();

  // ✅ Computed signals for derived state
  public readonly deploymentEnvironmentsCount = computed(() => this._deploymentEnvironments().length);
  public readonly activeEnvironmentsCount = computed(() =>
    this._deploymentEnvironments().filter(e => e.status === 'active').length
  );
  public readonly deploymentPlansCount = computed(() => this._deploymentPlans().length);
  public readonly deploymentReportsCount = computed(() => this._deploymentReports().length);

  // ✅ Observable compatibility layer (for backward compatibility)
  public deploymentEnvironments$ = new Observable<DeploymentEnvironment[]>(observer => {
    observer.next(this._deploymentEnvironments());
  });
  public deploymentPlans$ = new Observable<DeploymentPlan[]>(observer => {
    observer.next(this._deploymentPlans());
  });
  public deploymentReports$ = new Observable<DeploymentReport[]>(observer => {
    observer.next(this._deploymentReports());
  });
  public isDeploying$ = new Observable<boolean>(observer => {
    observer.next(this._isDeploying());
  });
  public currentDeployment$ = new Observable<DeploymentPlan | null>(observer => {
    observer.next(this._currentDeployment());
  });

  constructor() {
    this.initializeDeploymentEnvironments();
  }

  private initializeDeploymentEnvironments(): void {
    const environments: DeploymentEnvironment[] = [
      {
        id: 'env-dev',
        name: 'Development Environment',
        type: 'development',
        status: 'active',
        url: 'https://dev.example.com',
        configuration: {
          version: '1.0.0-dev',
          buildNumber: '123',
          environment: 'development',
          features: ['debug', 'hot_reload', 'mock_data'],
          config: {
            debug: true,
            logLevel: 'debug',
            mockApi: true
          },
          secrets: ['dev-db-password', 'dev-api-key'],
          environmentVariables: {
            NODE_ENV: 'development',
            API_URL: 'https://dev-api.example.com',
            DB_HOST: 'dev-db.example.com'
          },
          database: {
            type: 'postgresql',
            host: 'dev-db.example.com',
            port: 5432,
            name: 'dev_db',
            username: 'dev_user',
            ssl: false,
            connectionPool: {
              min: 2,
              max: 10,
              idle: 300,
              acquire: 60000,
              timeout: 60000
            },
            backup: {
              enabled: true,
              frequency: 'daily',
              retention: 7,
              encryption: false,
              compression: true,
              location: 's3://dev-backups'
            },
            replication: {
              enabled: false,
              type: 'master_slave',
              replicas: 0,
              lag: 0,
              failover: false
            }
          },
          cache: {
            type: 'redis',
            host: 'dev-cache.example.com',
            port: 6379,
            ttl: 3600,
            maxMemory: '256mb',
            evictionPolicy: 'allkeys-lru'
          },
          storage: {
            type: 'local',
            size: 100,
            iops: 1000,
            encryption: false,
            backup: true,
            redundancy: 'single'
          },
          networking: {
            vpc: 'dev-vpc',
            subnets: ['dev-subnet-1', 'dev-subnet-2'],
            securityGroups: ['dev-sg'],
            ports: [80, 443, 3000],
            protocols: ['tcp', 'udp'],
            ssl: true,
            cdn: false,
            firewall: {
              enabled: true,
              rules: [],
              defaultAction: 'deny'
            }
          }
        },
        infrastructure: {
          provider: 'aws',
          region: 'us-east-1',
          availabilityZones: ['us-east-1a', 'us-east-1b'],
          compute: {
            instanceType: 't3.medium',
            minInstances: 1,
            maxInstances: 3,
            currentInstances: 1,
            cpu: 2,
            memory: 4,
            storage: 20,
            operatingSystem: 'Ubuntu 20.04',
            containerRuntime: 'Docker'
          },
          storage: {
            type: 'cloud',
            size: 100,
            iops: 1000,
            encryption: true,
            backup: true,
            redundancy: 'multiple'
          },
          networking: {
            vpc: 'dev-vpc',
            subnets: ['dev-subnet-1', 'dev-subnet-2'],
            securityGroups: ['dev-sg'],
            ports: [80, 443, 3000],
            protocols: ['tcp', 'udp'],
            ssl: true,
            cdn: false,
            firewall: {
              enabled: true,
              rules: [],
              defaultAction: 'deny'
            }
          },
          loadBalancer: {
            type: 'application',
            algorithm: 'round_robin',
            healthCheck: {
              enabled: true,
              path: '/health',
              interval: 30,
              timeout: 5,
              healthyThreshold: 2,
              unhealthyThreshold: 3,
              expectedStatus: 200
            },
            ssl: true,
            stickySessions: false
          },
          autoScaling: {
            enabled: true,
            minCapacity: 1,
            maxCapacity: 5,
            targetUtilization: 70,
            scaleUpPolicy: {
              type: 'target_tracking',
              targetValue: 70,
              adjustmentType: 'change_in_capacity',
              adjustmentValue: 1,
              cooldown: 300
            },
            scaleDownPolicy: {
              type: 'target_tracking',
              targetValue: 30,
              adjustmentType: 'change_in_capacity',
              adjustmentValue: -1,
              cooldown: 300
            },
            cooldown: 300
          },
          backup: {
            enabled: true,
            frequency: 'daily',
            retention: 30,
            encryption: true,
            compression: true,
            location: 's3://dev-backups'
          }
        },
        monitoring: {
          enabled: true,
          tools: ['cloudwatch', 'datadog', 'newrelic'],
          metrics: ['cpu', 'memory', 'disk', 'network', 'response_time'],
          alerts: [
            {
              id: 'alert-001',
              name: 'High CPU Usage',
              metric: 'cpu_utilization',
              threshold: 80,
              operator: 'greater_than',
              severity: 'high',
              enabled: true,
              channels: ['email', 'slack'],
              cooldown: 300
            }
          ],
          dashboards: ['main-dashboard', 'performance-dashboard'],
          logLevel: 'info',
          retention: 30
        },
        security: {
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'AES-256',
            keyManagement: 'aws_kms',
            keyRotation: true,
            rotationPeriod: 90
          },
          authentication: {
            method: 'multi_factor',
            providers: ['local', 'saml'],
            sessionTimeout: 480,
            passwordPolicy: {
              minLength: 12,
              maxLength: 128,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: true,
              maxAge: 90,
              historyCount: 5
            },
            mfa: {
              enabled: true,
              methods: ['totp', 'sms'],
              required: true,
              backupCodes: true,
              rememberDevice: true
            }
          },
          authorization: {
            model: 'rbac',
            roles: ['admin', 'user', 'viewer'],
            permissions: ['read', 'write', 'delete', 'admin'],
            policies: ['admin-policy', 'user-policy'],
            inheritance: true
          },
          network: {
            vpn: false,
            privateNetwork: true,
            ipWhitelist: ['10.0.0.0/8', '172.16.0.0/12'],
            ddosProtection: true,
            waf: true,
            ssl: true,
            certificates: ['dev-cert']
          },
          compliance: {
            standards: ['SOC2', 'ISO27001'],
            certifications: ['SOC2 Type II'],
            auditLogging: true,
            dataRetention: 2555,
            privacyControls: ['data_encryption', 'access_control'],
            riskAssessment: 'low'
          },
          audit: {
            enabled: true,
            events: ['login', 'logout', 'data_access', 'configuration_change'],
            retention: 2555,
            encryption: true,
            realTime: true,
            reporting: true
          }
        },
        lastDeployed: new Date('2024-01-20'),
        lastHealthCheck: new Date(),
        healthStatus: 'healthy'
      }
    ];

    this._deploymentEnvironments.set(environments);
  }

  // Deployment Environment Management
  getDeploymentEnvironments(): Observable<DeploymentEnvironment[]> {
    return this.deploymentEnvironments$;
  }

  getDeploymentEnvironment(id: string): Observable<DeploymentEnvironment | undefined> {
    return new Observable<DeploymentEnvironment | undefined>(observer => {
      const environment = this._deploymentEnvironments().find((e: DeploymentEnvironment) => e.id === id);
      observer.next(environment);
      observer.complete();
    });
  }

  createDeploymentEnvironment(environment: Omit<DeploymentEnvironment, 'id' | 'lastDeployed' | 'lastHealthCheck' | 'healthStatus'>): Observable<DeploymentEnvironment> {
    const newEnvironment: DeploymentEnvironment = {
      ...environment,
      id: this.generateId(),
      lastHealthCheck: new Date(),
      healthStatus: 'unknown'
    };

    const environments = this._deploymentEnvironments();
    this._deploymentEnvironments.set([...environments, newEnvironment]);

    return new Observable(observer => {
      observer.next(newEnvironment);
      observer.complete();
    });
  }

  // Deployment Plan Management
  createDeploymentPlan(plan: Omit<DeploymentPlan, 'id' | 'status' | 'createdAt' | 'duration'>): Observable<DeploymentPlan> {
    const newPlan: DeploymentPlan = {
      ...plan,
      id: this.generateId(),
      status: 'draft',
      createdAt: new Date()
    };

    const plans = this._deploymentPlans();
    this._deploymentPlans.set([...plans, newPlan]);

    return new Observable(observer => {
      observer.next(newPlan);
      observer.complete();
    });
  }

  executeDeploymentPlan(planId: string): Observable<DeploymentPlan> {
    const plans = this._deploymentPlans();
    const plan = plans.find(p => p.id === planId);

    if (!plan) {
      return throwError(() => new Error('Deployment plan not found'));
    }

    plan.status = 'in_progress';
    plan.startedAt = new Date();
    this._currentDeployment.set(plan);
    this._isDeploying.set(true);

    const plansArray = this._deploymentPlans();
    const index = plansArray.findIndex((p: DeploymentPlan) => p.id === planId);
    if (index !== -1) {
      const updatedPlans = [...plansArray];
      updatedPlans[index] = plan;
      this._deploymentPlans.set(updatedPlans);
    }

    return this.executeDeploymentSteps(plan).pipe(
      map(completedPlan => {
        const plans = this._deploymentPlans();
        const index = plans.findIndex(p => p.id === planId);
        if (index !== -1) {
          const updatedPlans = [...plans];
          updatedPlans[index] = completedPlan;
          this._deploymentPlans.set(updatedPlans);
        }
        this._currentDeployment.set(null);
        this._isDeploying.set(false);
        return completedPlan;
      }),
      catchError(error => {
        plan.status = 'failed';
        plan.completedAt = new Date();
        plan.duration = plan.completedAt.getTime() - (plan.startedAt?.getTime() || 0);

        const plans = this._deploymentPlans();
        const index = plans.findIndex(p => p.id === planId);
        if (index !== -1) {
          const updatedPlans = [...plans];
          updatedPlans[index] = plan;
          this._deploymentPlans.set(updatedPlans);
        }
        this._currentDeployment.set(null);
        this._isDeploying.set(false);
        return throwError(() => error);
      })
    );
  }

  private executeDeploymentSteps(plan: DeploymentPlan): Observable<DeploymentPlan> {
    return new Observable(observer => {
      let currentStepIndex = 0;
      const executeNextStep = () => {
        if (currentStepIndex >= plan.steps.length) {
          // All steps completed
          plan.status = 'completed';
          plan.completedAt = new Date();
          plan.duration = plan.completedAt.getTime() - (plan.startedAt?.getTime() || 0);
          observer.next(plan);
          observer.complete();
          return;
        }

        const step = plan.steps[currentStepIndex];
        step.status = 'running';
        step.startTime = new Date();

        // Simulate step execution
        this.executeDeploymentStep(step).subscribe({
          next: (result) => {
            step.status = result.success ? 'completed' : 'failed';
            step.endTime = new Date();
            step.duration = step.endTime.getTime() - (step.startTime!.getTime());

            if (!result.success) {
              step.retryCount++;
              if (step.retryCount < step.maxRetries) {
                // Retry step
                setTimeout(() => {
                  executeNextStep();
                }, 5000);
                return;
              }
            }

            currentStepIndex++;
            executeNextStep();
          },
          error: (error) => {
            step.status = 'failed';
            step.endTime = new Date();
            step.duration = step.endTime.getTime() - (step.startTime!.getTime());
            observer.error(error);
          }
        });
      };

      executeNextStep();
    });
  }

  private executeDeploymentStep(step: DeploymentStep): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // Simulate step execution with random success/failure
      const success = Math.random() > 0.1; // 90% success rate
      const duration = Math.random() * 30000 + 5000; // 5-35 seconds

      setTimeout(() => {
        if (success) {
          observer.next({
            success: true,
            message: `Step ${step.name} completed successfully`
          });
        } else {
          observer.next({
            success: false,
            message: `Step ${step.name} failed: Simulated error`
          });
        }
        observer.complete();
      }, duration);
    });
  }

  // Deployment Report Generation
  generateDeploymentReport(planId: string): Observable<DeploymentReport> {
    const plans = this._deploymentPlans();
    const plan = plans.find(p => p.id === planId);

    if (!plan) {
      return throwError(() => new Error('Deployment plan not found'));
    }

    const completedSteps = plan.steps.filter(s => s.status === 'completed').length;
    const failedSteps = plan.steps.filter(s => s.status === 'failed').length;
    const skippedSteps = plan.steps.filter(s => s.status === 'skipped').length;

    const report: DeploymentReport = {
      id: this.generateId(),
      name: `Deployment Report - ${plan.name}`,
      description: `Deployment report for ${plan.name}`,
      deploymentId: planId,
      environment: plan.environment,
      version: plan.version,
      status: this.calculateDeploymentStatus(plan),
      generatedAt: new Date(),
      summary: {
        totalSteps: plan.steps.length,
        completedSteps,
        failedSteps,
        skippedSteps,
        duration: plan.duration || 0,
        successRate: plan.steps.length > 0 ? (completedSteps / plan.steps.length) * 100 : 0
      },
      steps: plan.steps,
      metrics: this.calculateDeploymentMetrics(plan),
      issues: this.generateDeploymentIssues(plan),
      recommendations: this.generateDeploymentRecommendations(plan),
      nextSteps: this.generateNextSteps(plan)
    };

    const reports = this._deploymentReports();
    this._deploymentReports.set([...reports, report]);

    return new Observable(observer => {
      observer.next(report);
      observer.complete();
    });
  }

  // Status Monitoring
  getIsDeploying(): Observable<boolean> {
    return this.isDeploying$;
  }

  getCurrentDeployment(): Observable<DeploymentPlan | null> {
    return this.currentDeployment$;
  }

  getDeploymentReports(): Observable<DeploymentReport[]> {
    return this.deploymentReports$;
  }

  // Utility Methods
  private generateId(): string {
    return 'deploy-' + Math.random().toString(36).substr(2, 9);
  }

  private calculateDeploymentStatus(plan: DeploymentPlan): 'success' | 'failure' | 'partial' | 'rolled_back' {
    const failedSteps = plan.steps.filter(s => s.status === 'failed').length;
    const completedSteps = plan.steps.filter(s => s.status === 'completed').length;

    if (failedSteps === 0) return 'success';
    if (completedSteps > 0 && failedSteps > 0) return 'partial';
    if (plan.status === 'rolled_back') return 'rolled_back';
    return 'failure';
  }

  private calculateDeploymentMetrics(plan: DeploymentPlan): DeploymentMetrics {
    const totalTime = plan.duration || 0;
    const failedSteps = plan.steps.filter(s => s.status === 'failed').length;
    const totalSteps = plan.steps.length;

    return {
      deploymentTime: totalTime,
      downtime: Math.random() * 5, // Simulated downtime
      errorRate: totalSteps > 0 ? (failedSteps / totalSteps) * 100 : 0,
      throughput: Math.random() * 1000 + 500, // Simulated throughput
      responseTime: Math.random() * 200 + 100, // Simulated response time
      resourceUsage: {
        cpu: Math.random() * 30 + 20,
        memory: Math.random() * 40 + 30,
        disk: Math.random() * 20 + 10,
        network: Math.random() * 100 + 50
      },
      healthScore: totalSteps > 0 ? ((totalSteps - failedSteps) / totalSteps) * 100 : 100
    };
  }

  private generateDeploymentIssues(plan: DeploymentPlan): DeploymentIssue[] {
    const issues: DeploymentIssue[] = [];

    plan.steps.filter(s => s.status === 'failed').forEach(step => {
      issues.push({
        id: this.generateId(),
        title: `Deployment Step Failed: ${step.name}`,
        description: `Step ${step.name} failed during deployment`,
        severity: 'high',
        category: 'application',
        step: step.name,
        timestamp: step.endTime || new Date(),
        resolved: false
      });
    });

    return issues;
  }

  private generateDeploymentRecommendations(plan: DeploymentPlan): string[] {
    const recommendations: string[] = [];

    const failedSteps = plan.steps.filter(s => s.status === 'failed').length;
    if (failedSteps > 0) {
      recommendations.push('Investigate and fix failed deployment steps');
    }

    const longSteps = plan.steps.filter(s => s.duration && s.duration > 10).length;
    if (longSteps > 0) {
      recommendations.push('Optimize deployment steps that take too long');
    }

    if (plan.strategy === 'recreate') {
      recommendations.push('Consider using blue-green or rolling deployment for zero-downtime deployments');
    }

    return recommendations;
  }

  private generateNextSteps(plan: DeploymentPlan): string[] {
    const nextSteps: string[] = [];

    if (plan.status === 'completed') {
      nextSteps.push('Monitor application health and performance');
      nextSteps.push('Update monitoring dashboards');
      nextSteps.push('Notify stakeholders of successful deployment');
    } else if (plan.status === 'failed') {
      nextSteps.push('Investigate deployment failures');
      nextSteps.push('Execute rollback plan if necessary');
      nextSteps.push('Fix issues and retry deployment');
    }

    return nextSteps;
  }
}

