import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface EncryptionKey {
  id: string;
  name: string;
  algorithm: 'AES-256' | 'RSA-2048' | 'RSA-4096' | 'ChaCha20' | 'Blowfish';
  keySize: number;
  status: 'active' | 'inactive' | 'expired' | 'compromised';
  createdAt: Date;
  expiresAt?: Date;
  lastUsed: Date;
  usage: {
    encryptCount: number;
    decryptCount: number;
    lastEncrypt: Date;
    lastDecrypt: Date;
  };
  metadata: {
    createdBy: string;
    purpose: string;
    environment: 'development' | 'staging' | 'production';
    rotationPolicy: 'manual' | 'automatic' | 'scheduled';
    nextRotation?: Date;
  };
}

export interface EncryptionPolicy {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  encryptionLevel: 'none' | 'basic' | 'standard' | 'high' | 'maximum';
  algorithm: string;
  keySize: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  rules: EncryptionRule[];
}

export interface EncryptionRule {
  id: string;
  field: string;
  table: string;
  condition: string;
  action: 'encrypt' | 'decrypt' | 'hash' | 'mask' | 'tokenize';
  algorithm?: string;
  keyId?: string;
  isActive: boolean;
}

export interface EncryptionAudit {
  id: string;
  operation: 'encrypt' | 'decrypt' | 'key_rotation' | 'policy_change' | 'access_denied';
  dataType: string;
  recordId: string;
  userId: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  keyId?: string;
  algorithm?: string;
  processingTime: number; // in ms
}

export interface SecurityMetrics {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  compromisedKeys: number;
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageProcessingTime: number;
  encryptionCoverage: number; // percentage
  complianceScore: number; // percentage
  lastKeyRotation: Date;
  nextScheduledRotation: Date;
  auditEvents: number;
  securityIncidents: number;
}

export interface EncryptionResult {
  success: boolean;
  encryptedData?: string;
  decryptedData?: string;
  keyId: string;
  algorithm: string;
  processingTime: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataEncryptionService {
  // ✅ Signals for reactive state
  private _keys = signal<EncryptionKey[]>([]);
  private _policies = signal<EncryptionPolicy[]>([]);
  private _audit = signal<EncryptionAudit[]>([]);
  private _metrics = signal<SecurityMetrics>(this.getDefaultMetrics());

  // ✅ Readonly signals for public access
  public readonly keys = this._keys.asReadonly();
  public readonly policies = this._policies.asReadonly();
  public readonly audit = this._audit.asReadonly();
  public readonly metrics = this._metrics.asReadonly();

  // ✅ Computed signals for derived state
  public readonly keysCount = computed(() => this._keys().length);
  public readonly activeKeysCount = computed(() =>
    this._keys().filter(k => k.status === 'active').length
  );
  public readonly expiredKeysCount = computed(() =>
    this._keys().filter(k => k.status === 'expired').length
  );
  public readonly policiesCount = computed(() => this._policies().length);
  public readonly enabledPoliciesCount = computed(() =>
    this._policies().filter(p => p.isEnabled).length
  );
  public readonly auditCount = computed(() => this._audit().length);
  public readonly recentAuditCount = computed(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this._audit().filter(a => a.timestamp >= oneDayAgo).length;
  });

  // ✅ Observable compatibility layer (for backward compatibility)
  public keys$ = new Observable<EncryptionKey[]>(observer => {
    observer.next(this._keys());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public policies$ = new Observable<EncryptionPolicy[]>(observer => {
    observer.next(this._policies());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public audit$ = new Observable<EncryptionAudit[]>(observer => {
    observer.next(this._audit());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public metrics$ = new Observable<SecurityMetrics>(observer => {
    observer.next(this._metrics());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Get all encryption keys
   */
  getKeys(): EncryptionKey[] {
    return this._keys();
  }

  /**
   * Get active encryption keys
   */
  getActiveKeys(): EncryptionKey[] {
    return this._keys().filter(k => k.status === 'active');
  }

  /**
   * Create encryption key
   */
  createKey(key: Omit<EncryptionKey, 'id' | 'createdAt' | 'lastUsed' | 'usage'>): EncryptionKey {
    const newKey: EncryptionKey = {
      ...key,
      id: this.generateId(),
      createdAt: new Date(),
      lastUsed: new Date(),
      usage: {
        encryptCount: 0,
        decryptCount: 0,
        lastEncrypt: new Date(),
        lastDecrypt: new Date()
      }
    };

    const keys = this._keys();
    this._keys.set([...keys, newKey]);

    // Log audit event
    this.logAuditEvent({
      operation: 'key_rotation',
      dataType: 'encryption_key',
      recordId: newKey.id,
      userId: newKey.metadata.createdBy,
      timestamp: new Date(),
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      keyId: newKey.id,
      algorithm: newKey.algorithm,
      processingTime: 0
    });

    this.updateMetrics();
    return newKey;
  }

  /**
   * Rotate encryption key
   */
  rotateKey(keyId: string, newKey: Omit<EncryptionKey, 'id' | 'createdAt' | 'lastUsed' | 'usage'>): boolean {
    const keys = this._keys();
    const oldKey = keys.find(k => k.id === keyId);

    if (!oldKey) return false;

    // Mark old key as inactive
    oldKey.status = 'inactive';
    oldKey.expiresAt = new Date();

    // Create new key
    const rotatedKey = this.createKey(newKey);

    // Log audit event
    this.logAuditEvent({
      operation: 'key_rotation',
      dataType: 'encryption_key',
      recordId: keyId,
      userId: 'system',
      timestamp: new Date(),
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      keyId: rotatedKey.id,
      algorithm: rotatedKey.algorithm,
      processingTime: 0
    });

    return true;
  }

  /**
   * Encrypt data
   */
  async encryptData(data: string, dataType: string, userId: string = 'system'): Promise<EncryptionResult> {
    const startTime = Date.now();

    try {
      // Get appropriate key for data type
      const key = this.getKeyForDataType(dataType);
      if (!key) {
        throw new Error('No encryption key available for data type');
      }

      // Simulate encryption (in real app, use actual encryption)
      const encryptedData = this.simulateEncryption(data, key.algorithm);

      // Update key usage
      key.usage.encryptCount++;
      key.usage.lastEncrypt = new Date();
      key.lastUsed = new Date();

      const processingTime = Date.now() - startTime;

      // Log audit event
      this.logAuditEvent({
        operation: 'encrypt',
        dataType,
        recordId: this.generateId(),
        userId,
        timestamp: new Date(),
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
        keyId: key.id,
        algorithm: key.algorithm,
        processingTime
      });

      this.updateMetrics();

      return {
        success: true,
        encryptedData,
        keyId: key.id,
        algorithm: key.algorithm,
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Log audit event
      this.logAuditEvent({
        operation: 'encrypt',
        dataType,
        recordId: this.generateId(),
        userId,
        timestamp: new Date(),
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ipAddress: '127.0.0.1',
        userAgent: 'System',
        processingTime
      });

      return {
        success: false,
        keyId: '',
        algorithm: '',
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Decrypt data
   */
  async decryptData(encryptedData: string, keyId: string, userId: string = 'system'): Promise<EncryptionResult> {
    const startTime = Date.now();

    try {
      const key = this._keys().find((k: EncryptionKey) => k.id === keyId);
      if (!key || key.status !== 'active') {
        throw new Error('Invalid or inactive encryption key');
      }

      // Simulate decryption (in real app, use actual decryption)
      const decryptedData = this.simulateDecryption(encryptedData, key.algorithm);

      // Update key usage
      key.usage.decryptCount++;
      key.usage.lastDecrypt = new Date();
      key.lastUsed = new Date();

      const processingTime = Date.now() - startTime;

      // Log audit event
      this.logAuditEvent({
        operation: 'decrypt',
        dataType: 'encrypted_data',
        recordId: this.generateId(),
        userId,
        timestamp: new Date(),
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'System',
        keyId: key.id,
        algorithm: key.algorithm,
        processingTime
      });

      this.updateMetrics();

      return {
        success: true,
        decryptedData,
        keyId: key.id,
        algorithm: key.algorithm,
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Log audit event
      this.logAuditEvent({
        operation: 'decrypt',
        dataType: 'encrypted_data',
        recordId: this.generateId(),
        userId,
        timestamp: new Date(),
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        ipAddress: '127.0.0.1',
        userAgent: 'System',
        processingTime
      });

      return {
        success: false,
        keyId: '',
        algorithm: '',
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get encryption policies
   */
  getPolicies(): EncryptionPolicy[] {
    return this._policies();
  }

  /**
   * Create encryption policy
   */
  createPolicy(policy: Omit<EncryptionPolicy, 'id' | 'createdAt' | 'updatedAt'>): EncryptionPolicy {
    const newPolicy: EncryptionPolicy = {
      ...policy,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const policies = this._policies();
    this._policies.set([...policies, newPolicy]);

    // Log audit event
    this.logAuditEvent({
      operation: 'policy_change',
      dataType: 'encryption_policy',
      recordId: newPolicy.id,
      userId: newPolicy.createdBy,
      timestamp: new Date(),
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      processingTime: 0
    });

    return newPolicy;
  }

  /**
   * Update encryption policy
   */
  updatePolicy(policyId: string, updates: Partial<EncryptionPolicy>): boolean {
    const policies = this._policies();
    const policy = policies.find(p => p.id === policyId);

    if (!policy) return false;

    Object.assign(policy, updates);
    policy.updatedAt = new Date();

    this._policies.set([...policies]);

    // Log audit event
    this.logAuditEvent({
      operation: 'policy_change',
      dataType: 'encryption_policy',
      recordId: policyId,
      userId: 'system',
      timestamp: new Date(),
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'System',
      processingTime: 0
    });

    return true;
  }

  /**
   * Get audit logs
   */
  getAuditLogs(): EncryptionAudit[] {
    return this._audit();
  }

  /**
   * Get audit logs by operation
   */
  getAuditLogsByOperation(operation: string): EncryptionAudit[] {
    return this._audit().filter((a: EncryptionAudit) => a.operation === operation);
  }

  /**
   * Get security metrics
   */
  getMetrics(): SecurityMetrics {
    return this._metrics();
  }

  /**
   * Generate security report
   */
  generateSecurityReport(options: {
    dateFrom: Date;
    dateTo: Date;
    includeAuditLogs?: boolean;
  }): any {
    const keys = this._keys();
    const policies = this._policies();
    const auditLogs = options.includeAuditLogs ?
      this._audit().filter((a: EncryptionAudit) => a.timestamp >= options.dateFrom && a.timestamp <= options.dateTo) : [];

    const report = {
      period: {
        from: options.dateFrom,
        to: options.dateTo
      },
      summary: {
        totalKeys: keys.length,
        activeKeys: keys.filter(k => k.status === 'active').length,
        totalPolicies: policies.length,
        activePolicies: policies.filter(p => p.isEnabled).length,
        totalOperations: auditLogs.length,
        successfulOperations: auditLogs.filter(a => a.success).length,
        failedOperations: auditLogs.filter(a => !a.success).length
      },
      keys: keys,
      policies: policies,
      auditLogs: auditLogs,
      generatedAt: new Date()
    };

    return report;
  }

  /**
   * Get key for data type
   */
  private getKeyForDataType(dataType: string): EncryptionKey | undefined {
    const activeKeys = this.getActiveKeys();
    return activeKeys.find(k => k.metadata.purpose === dataType) || activeKeys[0];
  }

  /**
   * Simulate encryption
   */
  private simulateEncryption(data: string, algorithm: string): string {
    // In a real application, this would use actual encryption
    const encoded = btoa(data);
    return `${algorithm}:${encoded}`;
  }

  /**
   * Simulate decryption
   */
  private simulateDecryption(encryptedData: string, algorithm: string): string {
    // In a real application, this would use actual decryption
    const parts = encryptedData.split(':');
    if (parts.length !== 2 || parts[0] !== algorithm) {
      throw new Error('Invalid encrypted data format');
    }
    return atob(parts[1]);
  }

  /**
   * Log audit event
   */
  private logAuditEvent(audit: Omit<EncryptionAudit, 'id'>): void {
    const newAudit: EncryptionAudit = {
      ...audit,
      id: this.generateId()
    };

    const audits = this._audit();
    this._audit.set([newAudit, ...audits.slice(0, 999)]); // Keep last 1000 events
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const keys = this._keys();
    const policies = this._policies();
    const audits = this._audit();
    const metrics = this.calculateMetrics(keys, policies, audits);
    this._metrics.set(metrics);
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(keys: EncryptionKey[], policies: EncryptionPolicy[], audits: EncryptionAudit[]): SecurityMetrics {
    const totalKeys = keys.length;
    const activeKeys = keys.filter(k => k.status === 'active').length;
    const expiredKeys = keys.filter(k => k.status === 'expired').length;
    const compromisedKeys = keys.filter(k => k.status === 'compromised').length;

    const totalOperations = audits.length;
    const successfulOperations = audits.filter(a => a.success).length;
    const failedOperations = audits.filter(a => !a.success).length;

    const averageProcessingTime = audits.length > 0 ?
      audits.reduce((sum, a) => sum + a.processingTime, 0) / audits.length : 0;

    const encryptionCoverage = policies.filter(p => p.isEnabled).length / Math.max(policies.length, 1) * 100;
    const complianceScore = this.calculateComplianceScore(keys, policies, audits);

    const lastKeyRotation = keys.length > 0 ?
      new Date(Math.max(...keys.map(k => k.createdAt.getTime()))) : new Date();
    const nextScheduledRotation = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const auditEvents = audits.length;
    const securityIncidents = audits.filter(a => !a.success && a.operation === 'access_denied').length;

    return {
      totalKeys,
      activeKeys,
      expiredKeys,
      compromisedKeys,
      totalOperations,
      successfulOperations,
      failedOperations,
      averageProcessingTime,
      encryptionCoverage,
      complianceScore,
      lastKeyRotation,
      nextScheduledRotation,
      auditEvents,
      securityIncidents
    };
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(keys: EncryptionKey[], policies: EncryptionPolicy[], audits: EncryptionAudit[]): number {
    let score = 100;

    // Deduct points for expired keys
    const expiredKeys = keys.filter(k => k.status === 'expired').length;
    score -= expiredKeys * 5;

    // Deduct points for compromised keys
    const compromisedKeys = keys.filter(k => k.status === 'compromised').length;
    score -= compromisedKeys * 20;

    // Deduct points for failed operations
    const failedOperations = audits.filter(a => !a.success).length;
    score -= Math.min(failedOperations * 0.1, 20);

    // Deduct points for missing policies
    const missingPolicies = Math.max(0, 5 - policies.length);
    score -= missingPolicies * 10;

    return Math.max(0, score);
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): SecurityMetrics {
    return {
      totalKeys: 0,
      activeKeys: 0,
      expiredKeys: 0,
      compromisedKeys: 0,
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageProcessingTime: 0,
      encryptionCoverage: 0,
      complianceScore: 0,
      lastKeyRotation: new Date(),
      nextScheduledRotation: new Date(),
      auditEvents: 0,
      securityIncidents: 0
    };
  }

  /**
   * Initialize demo data
   */
  private initializeDemoData(): void {
    // Create demo keys
    const demoKeys: EncryptionKey[] = [
      {
        id: 'key-1',
        name: 'Primary AES Key',
        algorithm: 'AES-256',
        keySize: 256,
        status: 'active',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(),
        usage: {
          encryptCount: 1500,
          decryptCount: 1200,
          lastEncrypt: new Date(),
          lastDecrypt: new Date()
        },
        metadata: {
          createdBy: 'admin',
          purpose: 'user_data',
          environment: 'production',
          rotationPolicy: 'scheduled',
          nextRotation: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: 'key-2',
        name: 'RSA Public Key',
        algorithm: 'RSA-2048',
        keySize: 2048,
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(),
        usage: {
          encryptCount: 500,
          decryptCount: 300,
          lastEncrypt: new Date(),
          lastDecrypt: new Date()
        },
        metadata: {
          createdBy: 'admin',
          purpose: 'api_keys',
          environment: 'production',
          rotationPolicy: 'manual'
        }
      }
    ];

    this._keys.set(demoKeys);

    // Create demo policies
    const demoPolicies: EncryptionPolicy[] = [
      {
        id: 'policy-1',
        name: 'User Data Encryption',
        description: 'Encrypt all user personal data',
        dataTypes: ['email', 'phone', 'address', 'ssn'],
        encryptionLevel: 'high',
        algorithm: 'AES-256',
        keySize: 256,
        isEnabled: true,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'admin',
        rules: [
          {
            id: 'rule-1',
            field: 'email',
            table: 'users',
            condition: 'always',
            action: 'encrypt',
            algorithm: 'AES-256',
            keyId: 'key-1',
            isActive: true
          }
        ]
      }
    ];

    this._policies.set(demoPolicies);

    // Create demo audit logs
    const demoAudits: EncryptionAudit[] = [
      {
        id: 'audit-1',
        operation: 'encrypt',
        dataType: 'user_data',
        recordId: 'user-123',
        userId: 'admin',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        success: true,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        keyId: 'key-1',
        algorithm: 'AES-256',
        processingTime: 15
      }
    ];

    this._audit.set(demoAudits);
    this.updateMetrics();
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'enc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

