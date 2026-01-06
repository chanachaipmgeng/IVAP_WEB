/**
 * Test API Component
 *
 * Development/testing component for testing API endpoints and services.
 * Provides interface for testing various API connections and authentication status.
 *
 * @example
 * ```html
 * <app-test-api></app-test-api>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { WorkerSafetyService } from '../../core/services/worker-safety.service';
import { RealTimeHardwareMonitoringService } from '../../core/services/real-time-hardware-monitoring.service';
import { TemplateManagementService } from '../../core/services/template-management.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-test-api',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">API Connection Test</h1>
      
      <!-- Authentication Status -->
      <div *ngIf="!isAuthenticated()" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p class="text-yellow-800">
          ⚠️ You are not authenticated. Please <a routerLink="/portal/login" class="underline">login</a> first to test API endpoints.
        </p>
      </div>
      
      <div *ngIf="isAuthenticated()" class="mb-4 p-4 bg-green-100 border border-green-400 rounded">
        <p class="text-green-800">
          ✅ Authenticated as: {{ authService.currentUser()?.username || 'User' }}
        </p>
      </div>
      
      <!-- Test Controls -->
      <div class="mb-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Company ID:</label>
          <input 
            type="text" 
            [(ngModel)]="companyId" 
            placeholder="Enter company ID"
            class="w-full px-4 py-2 border rounded"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Device ID (for Hardware tests):</label>
          <input 
            type="text" 
            [(ngModel)]="deviceId" 
            placeholder="Enter device ID"
            class="w-full px-4 py-2 border rounded"
          />
        </div>
      </div>

      <!-- Test Buttons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button 
          (click)="testSafety()" 
          [disabled]="isLoading() || !isAuthenticated()"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Safety API
        </button>
        
        <button 
          (click)="testHardware()" 
          [disabled]="isLoading() || !isAuthenticated()"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Hardware API
        </button>
        
        <button 
          (click)="testTemplates()" 
          [disabled]="isLoading() || !isAuthenticated()"
          class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Templates API
        </button>
        
        <button 
          (click)="testAll()" 
          [disabled]="isLoading() || !isAuthenticated()"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Test All APIs
        </button>
      </div>

      <!-- Results -->
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Test Results</h2>
        
        <div *ngIf="isLoading()" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-2">Testing...</p>
        </div>

        <div *ngIf="!isLoading() && testResult()" class="bg-gray-100 p-4 rounded">
          <div class="mb-2">
            <span class="font-semibold">Test Type:</span> {{ testResult()?.type }}
          </div>
          <div class="mb-2">
            <span class="font-semibold">Status:</span> 
            <span [class]="testResult()?.success ? 'text-green-600' : 'text-red-600'">
              {{ testResult()?.success ? '✅ Success' : '❌ Error' }}
            </span>
          </div>
          <div *ngIf="testResult()?.error" class="mb-2">
            <span class="font-semibold">Error:</span> 
            <span class="text-red-600">{{ testResult()?.error }}</span>
          </div>
          <details class="mt-4">
            <summary class="cursor-pointer font-semibold">Response Data</summary>
            <pre class="mt-2 p-4 bg-white rounded overflow-auto text-xs">{{ testResult()?.data | json }}</pre>
          </details>
        </div>
      </div>
    </div>
  `
})
export class TestApiComponent implements OnInit {
  companyId = signal<string>('');
  deviceId = signal<string>('');
  isLoading = signal<boolean>(false);
  testResult = signal<any>(null);

  isAuthenticated = computed(() => this.authService.isAuthenticated());

  constructor(
    private safetyService: WorkerSafetyService,
    private hardwareService: RealTimeHardwareMonitoringService,
    private templateService: TemplateManagementService,
    public authService: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.isAuthenticated()) {
      console.warn('User not authenticated. Please login first.');
      // Optionally redirect to login
      // this.router.navigate(['/portal/login']);
    }
    
    // Try to get company_id from current user
    this.loadUserInfo();
  }

  async loadUserInfo() {
    try {
      // ใช้ auth.getCurrentUserInfo() แทนการเรียกใช้โดยตรง
      const user = await this.authService.getCurrentUserInfo().toPromise();
      if (user) {
        if (user.companyId) {
          this.companyId.set(String(user.companyId));
        } else if (user.company_id) {
          this.companyId.set(user.company_id);
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      // Try to get from auth service cached data
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        if (currentUser.companyId) {
          this.companyId.set(String(currentUser.companyId));
        } else if ((currentUser as any).company_id) {
          this.companyId.set((currentUser as any).company_id);
        }
      }
    }
  }

  testSafety() {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Please enter Company ID');
      return;
    }

    this.isLoading.set(true);
    this.testResult.set(null);

    // Test Safety Metrics
    this.safetyService.loadMetrics(companyId).subscribe({
      next: (metrics: any) => {
        console.log('✅ Safety Metrics:', metrics);
        this.testResult.set({
          type: 'Safety Metrics',
          success: true,
          data: metrics
        });
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Safety Error:', error);
        this.testResult.set({
          type: 'Safety Metrics',
          success: false,
          error: error.message || 'Unknown error',
          data: error
        });
        this.isLoading.set(false);
      }
    });
  }

  testHardware() {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Please enter Company ID');
      return;
    }

    this.isLoading.set(true);
    this.testResult.set(null);

    // Test Devices Overview
    this.hardwareService.getDevicesOverview(companyId).subscribe({
      next: (overview: any) => {
        console.log('✅ Hardware Overview:', overview);
        this.testResult.set({
          type: 'Hardware Overview',
          success: true,
          data: overview
        });
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Hardware Error:', error);
        this.testResult.set({
          type: 'Hardware Overview',
          success: false,
          error: error.message || 'Unknown error',
          data: error
        });
        this.isLoading.set(false);
      }
    });
  }

  testTemplates() {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Please enter Company ID');
      return;
    }

    this.isLoading.set(true);
    this.testResult.set(null);

    // Test Load Templates
    this.templateService.loadTemplates(companyId).subscribe({
      next: (templates: any) => {
        console.log('✅ Templates:', templates);
        this.testResult.set({
          type: 'Templates',
          success: true,
          data: templates
        });
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Templates Error:', error);
        this.testResult.set({
          type: 'Templates',
          success: false,
          error: error.message || 'Unknown error',
          data: error
        });
        this.isLoading.set(false);
      }
    });
  }

  testAll() {
    const companyId = this.companyId();
    if (!companyId) {
      alert('Please enter Company ID');
      return;
    }

    console.log('🧪 Testing all APIs...');
    
    // Test Safety
    setTimeout(() => this.testSafety(), 100);
    
    // Test Hardware
    setTimeout(() => this.testHardware(), 500);
    
    // Test Templates
    setTimeout(() => this.testTemplates(), 1000);
  }
}

