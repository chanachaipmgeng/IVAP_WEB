import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, throwError, timer, of } from 'rxjs';
import { map, catchError, retry, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface VerificationMethod {
  id: string;
  type: 'sms' | 'email' | 'totp' | 'push' | 'biometric' | 'hardware_token';
  name: string;
  enabled: boolean;
  priority: number;
  icon: string;
  description: string;
  requiresSetup: boolean;
  isSetup: boolean;
}

export interface VerificationCode {
  id: string;
  method: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  used: boolean;
  createdAt: Date;
}

export interface VerificationSession {
  id: string;
  userId: string;
  sessionId: string;
  methods: VerificationMethod[];
  completedMethods: string[];
  requiredMethods: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  metadata: Record<string, any>;
}

export interface BiometricData {
  id: string;
  userId: string;
  type: 'fingerprint' | 'face' | 'voice' | 'iris' | 'palm';
  template: string;
  quality: number;
  enrolledAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

export interface HardwareToken {
  id: string;
  userId: string;
  serialNumber: string;
  type: 'yubikey' | 'fido2' | 'u2f' | 'totp_hardware';
  name: string;
  registeredAt: Date;
  lastUsed: Date;
  isActive: boolean;
  publicKey?: string;
  attestation?: string;
}

export interface PushNotification {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: 'ios' | 'android' | 'web';
  token: string;
  registeredAt: Date;
  lastUsed: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MultiFactorVerificationService {
  private api = inject(ApiService);

  // ✅ Signals for reactive state
  private _verificationMethods = signal<VerificationMethod[]>([]);
  private _activeSession = signal<VerificationSession | null>(null);
  private _biometricData = signal<BiometricData[]>([]);
  private _hardwareTokens = signal<HardwareToken[]>([]);
  private _pushNotifications = signal<PushNotification[]>([]);

  // ✅ Readonly signals for public access
  public readonly verificationMethods = this._verificationMethods.asReadonly();
  public readonly activeSession = this._activeSession.asReadonly();
  public readonly biometricData = this._biometricData.asReadonly();
  public readonly hardwareTokens = this._hardwareTokens.asReadonly();
  public readonly pushNotifications = this._pushNotifications.asReadonly();

  // ✅ Computed signals for derived state
  public readonly verificationMethodsCount = computed(() => this._verificationMethods().length);
  public readonly enabledMethodsCount = computed(() =>
    this._verificationMethods().filter(m => m.enabled).length
  );
  public readonly biometricDataCount = computed(() => this._biometricData().length);
  public readonly activeBiometricDataCount = computed(() =>
    this._biometricData().filter(b => b.isActive).length
  );
  public readonly hardwareTokensCount = computed(() => this._hardwareTokens().length);
  public readonly activeHardwareTokensCount = computed(() =>
    this._hardwareTokens().filter(t => t.isActive).length
  );
  public readonly pushNotificationsCount = computed(() => this._pushNotifications().length);
  public readonly activePushNotificationsCount = computed(() =>
    this._pushNotifications().filter(p => p.isActive).length
  );
  public readonly hasActiveSession = computed(() => this._activeSession() !== null);
  public readonly isSessionCompleted = computed(() =>
    this._activeSession()?.status === 'completed'
  );

  // ✅ Observable compatibility layer (for backward compatibility)
  getVerificationMethods$(): Observable<VerificationMethod[]> {
    return new Observable<VerificationMethod[]>(observer => {
      observer.next(this._verificationMethods());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }
  getActiveSession$(): Observable<VerificationSession | null> {
    return new Observable<VerificationSession | null>(observer => {
      observer.next(this._activeSession());
      // Note: This is a compatibility layer - prefer using signals directly
    });
  }

  constructor() {
    this.initializeVerificationMethods();
  }

  private initializeVerificationMethods(): void {
    const methods: VerificationMethod[] = [
      {
        id: 'sms',
        type: 'sms',
        name: 'SMS Code',
        enabled: true,
        priority: 1,
        icon: '📱',
        description: 'Receive verification code via SMS',
        requiresSetup: true,
        isSetup: true
      },
      {
        id: 'email',
        type: 'email',
        name: 'Email Code',
        enabled: true,
        priority: 2,
        icon: '📧',
        description: 'Receive verification code via email',
        requiresSetup: true,
        isSetup: true
      },
      {
        id: 'totp',
        type: 'totp',
        name: 'Authenticator App',
        enabled: true,
        priority: 3,
        icon: '🔐',
        description: 'Use authenticator app for time-based codes',
        requiresSetup: true,
        isSetup: false
      },
      {
        id: 'push',
        type: 'push',
        name: 'Push Notification',
        enabled: true,
        priority: 4,
        icon: '🔔',
        description: 'Approve via push notification',
        requiresSetup: true,
        isSetup: false
      },
      {
        id: 'biometric',
        type: 'biometric',
        name: 'Biometric',
        enabled: true,
        priority: 5,
        icon: '👆',
        description: 'Use fingerprint or face recognition',
        requiresSetup: true,
        isSetup: false
      },
      {
        id: 'hardware_token',
        type: 'hardware_token',
        name: 'Hardware Token',
        enabled: true,
        priority: 6,
        icon: '🔑',
        description: 'Use hardware security key',
        requiresSetup: true,
        isSetup: false
      }
    ];

    this._verificationMethods.set(methods);
  }

  // Verification Methods Management
  getVerificationMethods(): Observable<VerificationMethod[]> {
    return this.getVerificationMethods$();
  }

  updateVerificationMethod(methodId: string, updates: Partial<VerificationMethod>): Observable<boolean> {
    const methods = this._verificationMethods();
    const index = methods.findIndex(method => method.id === methodId);

    if (index === -1) {
      return throwError(() => new Error('Verification method not found'));
    }

    methods[index] = { ...methods[index], ...updates };
    this._verificationMethods.set([...methods]);

    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  // Verification Session Management
  createVerificationSession(userId: string, requiredMethods: string[]): Observable<VerificationSession> {
    const methods = this._verificationMethods().filter((method: VerificationMethod) =>
      requiredMethods.includes(method.id) && method.enabled
    );

    const session: VerificationSession = {
      id: this.generateId(),
      userId,
      sessionId: this.generateSessionId(),
      methods,
      completedMethods: [],
      requiredMethods,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      lastActivity: new Date(),
      metadata: {}
    };

    this._activeSession.set(session);

    return new Observable(observer => {
      observer.next(session);
      observer.complete();
    });
  }

  getActiveSession(): Observable<VerificationSession | null> {
    return this.getActiveSession$();
  }

  // SMS Verification
  sendSMSVerification(memberId: string, companyId: string, phoneNumber: string): Observable<any> {
    // Backend: POST /api/v1/mfa/send/sms?member_id={member_id}&company_id={company_id}&phone_number={phone_number}
    return this.api.post<any>('/mfa/send/sms', {}, {
      member_id: memberId,
      company_id: companyId,
      phone_number: phoneNumber
    });
  }

  verifySMSCode(verificationRequest: any): Observable<boolean> {
    // Backend: POST /api/v1/mfa/verify
    return this.api.post<{ valid: boolean; verified?: boolean }>('/mfa/verify', verificationRequest).pipe(
      map((response: any) => {
        const isValid = response.valid || response.verified || false;
        if (isValid) {
          this.completeVerificationMethod('sms');
        }
        return isValid;
      }),
      catchError((error) => {
        console.error('Error verifying SMS code:', error);
        throw error;
      })
    );
  }

  // Email Verification
  sendEmailVerification(memberId: string, companyId: string, email: string): Observable<any> {
    // Backend: POST /api/v1/mfa/send/email?member_id={member_id}&company_id={company_id}&email={email}
    return this.api.post<any>('/mfa/send/email', {}, {
      member_id: memberId,
      company_id: companyId,
      email: email
    });
  }

  verifyEmailCode(verificationRequest: any): Observable<boolean> {
    // Backend: POST /api/v1/mfa/verify
    return this.api.post<{ valid: boolean; verified?: boolean }>('/mfa/verify', verificationRequest).pipe(
      map((response: any) => {
        const isValid = response.valid || response.verified || false;
        if (isValid) {
          this.completeVerificationMethod('email');
        }
        return isValid;
      }),
      catchError((error) => {
        console.error('Error verifying email code:', error);
        throw error;
      })
    );
  }

  // MFA Config Management
  createMfaConfig(configData: any): Observable<any> {
    // Backend: POST /api/v1/mfa/config
    return this.api.post<any>('/mfa/config', configData);
  }

  getMfaConfig(): Observable<any> {
    // Backend: GET /api/v1/mfa/config
    return this.api.get<any>('/mfa/config');
  }

  getMfaConfigByMemberId(memberId: string, companyId: string): Observable<any> {
    // Backend: GET /api/v1/mfa/config/{member_id}?company_id={company_id}
    return this.api.get<any>(`/mfa/config/${memberId}`, { company_id: companyId });
  }

  updateMfaConfig(memberId: string, companyId: string, updateData: any): Observable<any> {
    // Backend: PUT /api/v1/mfa/config/{member_id}?company_id={company_id}
    return this.api.put<any>(`/mfa/config/${memberId}`, updateData, { company_id: companyId });
  }

  deleteMfaConfig(memberId: string, companyId: string): Observable<any> {
    // Backend: DELETE /api/v1/mfa/config/{member_id}?company_id={company_id}
    return this.api.delete<any>(`/mfa/config/${memberId}`, { company_id: companyId });
  }

  // TOTP (Time-based One-Time Password)
  generateTOTPSecret(setupData?: any): Observable<{ secret: string; qrCode: string }> {
    // Backend: POST /api/v1/mfa/setup/totp
    return this.api.post<{ secret: string; qrCode: string; qr_code?: string }>('/mfa/setup/totp', setupData || {}).pipe(
      map((response: any) => ({
        secret: response.secret || response.data?.secret || '',
        qrCode: response.qrCode || response.qr_code || response.data?.qr_code || ''
      })),
      catchError((error) => {
        console.error('Error generating TOTP secret:', error);
        throw error;
      })
    );
  }

  verifyTOTPCode(verificationRequest: any): Observable<boolean> {
    // Backend: POST /api/v1/mfa/verify
    return this.api.post<{ valid: boolean; verified?: boolean }>('/mfa/verify', verificationRequest).pipe(
      map((response: any) => {
        const isValid = response.valid || response.verified || false;
        if (isValid) {
          this.completeVerificationMethod('totp');
        }
        return isValid;
      }),
      catchError((error) => {
        console.error('Error verifying TOTP code:', error);
        throw error;
      })
    );
  }

  // Push Notification Verification
  sendPushVerification(deviceId: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate push notification sending
      timer(1000).subscribe(() => {
        // Push notification sent
        observer.next(true);
        observer.complete();
      });
    });
  }

  approvePushVerification(deviceId: string, approved: boolean): Observable<boolean> {
    return new Observable(observer => {
      if (approved) {
        this.completeVerificationMethod('push');
      }

      observer.next(approved);
      observer.complete();
    });
  }

  // Biometric Verification
  enrollBiometric(userId: string, type: BiometricData['type'], template: string): Observable<BiometricData> {
    const biometric: BiometricData = {
      id: this.generateId(),
      userId,
      type,
      template,
      quality: Math.floor(Math.random() * 40) + 60, // 60-100
      enrolledAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    };

    const biometrics = this._biometricData();
    this._biometricData.set([...biometrics, biometric]);

    return new Observable(observer => {
      observer.next(biometric);
      observer.complete();
    });
  }

  verifyBiometric(userId: string, type: BiometricData['type'], template: string): Observable<boolean> {
    return new Observable(observer => {
      const biometrics = this._biometricData();
      const userBiometric = biometrics.find(b =>
        b.userId === userId && b.type === type && b.isActive
      );

      if (userBiometric) {
        // Simulate biometric verification
        const isMatch = this.simulateBiometricMatch(template, userBiometric.template);

        if (isMatch) {
          userBiometric.lastUsed = new Date();
          this._biometricData.set([...biometrics]);
          this.completeVerificationMethod('biometric');
        }

        observer.next(isMatch);
      } else {
        observer.next(false);
      }

      observer.complete();
    });
  }

  // Hardware Token Verification
  registerHardwareToken(userId: string, token: Omit<HardwareToken, 'id' | 'registeredAt' | 'lastUsed'>): Observable<HardwareToken> {
    const hardwareToken: HardwareToken = {
      ...token,
      id: this.generateId(),
      registeredAt: new Date(),
      lastUsed: new Date()
    };

    const tokens = this._hardwareTokens();
    this._hardwareTokens.set([...tokens, hardwareToken]);

    return new Observable(observer => {
      observer.next(hardwareToken);
      observer.complete();
    });
  }

  verifyHardwareToken(userId: string, challenge: string, response: string): Observable<boolean> {
    return new Observable(observer => {
      const tokens = this._hardwareTokens();
      const userToken = tokens.find(t => t.userId === userId && t.isActive);

      if (userToken) {
        // Simulate hardware token verification
        const isValid = this.simulateHardwareTokenVerification(challenge, response);

        if (isValid) {
          userToken.lastUsed = new Date();
          this._hardwareTokens.set([...tokens]);
          this.completeVerificationMethod('hardware_token');
        }

        observer.next(isValid);
      } else {
        observer.next(false);
      }

      observer.complete();
    });
  }

  // Session Management
  completeVerificationMethod(methodId: string): void {
    const session = this._activeSession();
    if (session && !session.completedMethods.includes(methodId)) {
      session.completedMethods.push(methodId);
      session.lastActivity = new Date();

      // Check if all required methods are completed
      const allRequiredCompleted = session.requiredMethods.every(method =>
        session.completedMethods.includes(method)
      );

      if (allRequiredCompleted) {
        session.status = 'completed';
      } else {
        session.status = 'in_progress';
      }

      this._activeSession.set({ ...session });
    }
  }

  isVerificationComplete(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const session = this._activeSession();
      if (!session) {
        observer.next(false);
        observer.complete();
        return;
      }
      const isComplete = session.requiredMethods.every((method: string) =>
        session.completedMethods.includes(method)
      );
      observer.next(isComplete);
      observer.complete();
    });
  }

  getVerificationProgress(): Observable<{ completed: number; total: number; percentage: number }> {
    return new Observable<{ completed: number; total: number; percentage: number }>(observer => {
      const session = this._activeSession();
      if (!session) {
        observer.next({ completed: 0, total: 0, percentage: 0 });
        observer.complete();
        return;
      }

      const completed = session.completedMethods.length;
      const total = session.requiredMethods.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      observer.next({ completed, total, percentage });
      observer.complete();
    });
  }

  clearVerificationSession(): void {
    this._activeSession.set(null);
  }

  // Backup Codes
  generateBackupCodes(request: any): Observable<any> {
    // Backend: POST /api/v1/mfa/backup-codes/generate
    return this.api.post<any>('/mfa/backup-codes/generate', request);
  }

  // MFA Status
  getMfaStatus(memberId: string, companyId: string): Observable<any> {
    // Backend: GET /api/v1/mfa/status/{member_id}?company_id={company_id}
    return this.api.get<any>(`/mfa/status/${memberId}`, { company_id: companyId });
  }

  // Device Trust
  trustDevice(request: any): Observable<any> {
    // Backend: POST /api/v1/mfa/device/trust
    return this.api.post<any>('/mfa/device/trust', request);
  }

  // Utility Methods
  private generateId(): string {
    return 'mfa-' + Math.random().toString(36).substr(2, 9);
  }

  private generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 12);
  }

  private generateCode(length: number): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateSecret(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private simulateBiometricMatch(template1: string, template2: string): boolean {
    // Simulate biometric matching with 95% success rate
    return Math.random() < 0.95;
  }

  private simulateHardwareTokenVerification(challenge: string, response: string): boolean {
    // Simulate hardware token verification with 98% success rate
    return Math.random() < 0.98;
  }
}

