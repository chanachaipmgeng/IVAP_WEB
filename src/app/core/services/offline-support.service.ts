import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { NativeBridgeService } from './native-bridge.service';

export interface OfflineData {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  synced: boolean;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal' | 'low';
}

export interface OfflineSettings {
  enabled: boolean;
  maxStorageSize: number; // in MB
  syncInterval: number; // in milliseconds
  retryInterval: number; // in milliseconds
  maxRetries: number;
  autoSync: boolean;
  syncOnReconnect: boolean;
  compressionEnabled: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingItems: number;
  failedItems: number;
  totalItems: number;
  syncProgress: number; // 0-100
}

export interface StorageInfo {
  used: number; // in bytes
  available: number; // in bytes
  total: number; // in bytes
  percentage: number; // 0-100
}

@Injectable({
  providedIn: 'root'
})
export class OfflineSupportService {
  private offlineDataMap: Map<string, OfflineData> = new Map();
  private settings: OfflineSettings = this.getDefaultSettings();
  private syncStatusData: SyncStatus = this.getInitialSyncStatus();
  private isOnline = navigator.onLine;
  private syncInterval: any = null;
  private retryInterval: any = null;

  // ✅ Signals for reactive state
  private _offlineData = signal<OfflineData[]>([]);
  private _syncStatus = signal<SyncStatus>(this.syncStatusData);
  private _storageInfo = signal<StorageInfo>(this.getStorageInfo());

  // ✅ Readonly signals for public access
  public readonly offlineData = this._offlineData.asReadonly();
  public readonly syncStatus = this._syncStatus.asReadonly();
  public readonly storageInfo = this._storageInfo.asReadonly();

  // ✅ Computed signals for derived state
  public readonly offlineDataCount = computed(() => this._offlineData().length);
  public readonly pendingItemsCount = computed(() =>
    this._offlineData().filter(d => !d.synced && d.retryCount < d.maxRetries).length
  );
  public readonly failedItemsCount = computed(() =>
    this._offlineData().filter(d => !d.synced && d.retryCount >= d.maxRetries).length
  );
  public readonly syncedItemsCount = computed(() =>
    this._offlineData().filter(d => d.synced).length
  );
  public readonly isOnlineStatus = computed(() => this._syncStatus().isOnline);
  public readonly isSyncingStatus = computed(() => this._syncStatus().isSyncing);

  // ✅ Observable compatibility layer (for backward compatibility)
  public offlineData$ = new Observable<OfflineData[]>(observer => {
    observer.next(this._offlineData());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public syncStatus$ = new Observable<SyncStatus>(observer => {
    observer.next(this._syncStatus());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public storageInfo$ = new Observable<StorageInfo>(observer => {
    observer.next(this._storageInfo());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor(
    private nativeBridge: NativeBridgeService
  ) {
    this.initializeOfflineSupport();
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): OfflineSettings {
    return {
      enabled: true,
      maxStorageSize: 50, // 50MB
      syncInterval: 30000, // 30 seconds
      retryInterval: 60000, // 1 minute
      maxRetries: 3,
      autoSync: true,
      syncOnReconnect: true,
      compressionEnabled: true
    };
  }

  /**
   * Get initial sync status
   */
  private getInitialSyncStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSync: null,
      pendingItems: 0,
      failedItems: 0,
      totalItems: 0,
      syncProgress: 0
    };
  }

  /**
   * Initialize offline support
   */
  private async initializeOfflineSupport(): Promise<void> {
    try {
      // Load offline data from storage
      await this.loadOfflineData();

      // Set up online/offline listeners
      this.setupNetworkListeners();

      // Start sync interval if enabled
      if (this.settings.enabled && this.settings.autoSync) {
        this.startSyncInterval();
      }

      // Update sync status
      this.updateSyncStatus();
    } catch (error) {
      console.error('Failed to initialize offline support:', error);
    }
  }

  /**
   * Set up network listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncStatusData.isOnline = true;
      this.updateSyncStatus();

      if (this.settings.syncOnReconnect) {
        this.syncOfflineData();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.syncStatusData.isOnline = false;
      this.updateSyncStatus();
    });

    // Listen to network status changes (for mobile)
    if (this.nativeBridge.isNative()) {
      this.nativeBridge.getNetworkStatus().then(status => {
        this.isOnline = status.connected;
        this.syncStatusData.isOnline = status.connected;
        this.updateSyncStatus();
      });
    }
  }

  /**
   * Load offline data from storage
   */
  private async loadOfflineData(): Promise<void> {
    try {
      const stored = localStorage.getItem('offline_data');
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach((item: any) => {
          item.timestamp = new Date(item.timestamp);
          this.offlineDataMap.set(item.id, item);
        });
        this._offlineData.set(Array.from(this.offlineDataMap.values()));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  /**
   * Save offline data to storage
   */
  private async saveOfflineData(): Promise<void> {
    try {
      const data = Array.from(this.offlineDataMap.values());
      localStorage.setItem('offline_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  /**
   * Store data for offline use
   */
  public async storeOfflineData(
    type: string,
    data: any,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> {
    try {
      const id = this.generateId();
      const offlineItem: OfflineData = {
        id,
        type,
        data,
        timestamp: new Date(),
        synced: false,
        retryCount: 0,
        maxRetries: this.settings.maxRetries,
        priority
      };

      // Check storage limit
      if (this.isStorageLimitExceeded(offlineItem)) {
        throw new Error('Storage limit exceeded');
      }

      this.offlineDataMap.set(id, offlineItem);
      this._offlineData.set(Array.from(this.offlineDataMap.values()));
      await this.saveOfflineData();
      this.updateSyncStatus();

      // Try to sync immediately if online
      if (this.isOnline && this.settings.autoSync) {
        this.syncOfflineData();
      }

      return id;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw error;
    }
  }

  /**
   * Check if storage limit is exceeded
   */
  private isStorageLimitExceeded(newItem: OfflineData): boolean {
    const currentSize = this.getStorageSize();
    const newItemSize = this.estimateDataSize(newItem);
    const maxSizeBytes = this.settings.maxStorageSize * 1024 * 1024; // Convert MB to bytes

    return (currentSize + newItemSize) > maxSizeBytes;
  }

  /**
   * Get current storage size
   */
  private getStorageSize(): number {
    try {
      const stored = localStorage.getItem('offline_data');
      return stored ? new Blob([stored]).size : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Estimate data size
   */
  private estimateDataSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get storage info
   */
  private getStorageInfo(): StorageInfo {
    const used = this.getStorageSize();
    const maxSizeBytes = this.settings.maxStorageSize * 1024 * 1024;
    const available = Math.max(0, maxSizeBytes - used);
    const percentage = (used / maxSizeBytes) * 100;

    return {
      used,
      available,
      total: maxSizeBytes,
      percentage
    };
  }

  /**
   * Sync offline data
   */
  public async syncOfflineData(): Promise<void> {
    if (!this.isOnline || this.syncStatusData.isSyncing) {
      return;
    }

    try {
      this.syncStatusData.isSyncing = true;
      this.syncStatusData.syncProgress = 0;
      this.updateSyncStatus();

      const unsyncedItems = Array.from(this.offlineDataMap.values())
        .filter(item => !item.synced)
        .sort((a, b) => {
          // Sort by priority: high -> normal -> low
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

      let syncedCount = 0;
      let failedCount = 0;

      for (const item of unsyncedItems) {
        try {
          await this.syncItem(item);
          item.synced = true;
          item.retryCount = 0;
          syncedCount++;
        } catch (error) {
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            item.synced = true; // Mark as synced to stop retrying
            failedCount++;
          }
          console.error(`Failed to sync item ${item.id}:`, error);
        }

        // Update progress
        this.syncStatusData.syncProgress = ((syncedCount + failedCount) / unsyncedItems.length) * 100;
        this.updateSyncStatus();
      }

      // Update sync status
      this.syncStatusData.lastSync = new Date();
      this.syncStatusData.pendingItems = unsyncedItems.length - syncedCount - failedCount;
      this.syncStatusData.failedItems = failedCount;
      this.syncStatusData.syncProgress = 100;

      // Save updated data
      await this.saveOfflineData();
      this._offlineData.set(Array.from(this.offlineDataMap.values()));

    } catch (error) {
      console.error('Failed to sync offline data:', error);
    } finally {
      this.syncStatusData.isSyncing = false;
      this.updateSyncStatus();
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: OfflineData): Promise<void> {
    // This is a mock implementation
    // In a real app, this would make actual API calls based on the item type
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate API call
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Simulated API error'));
        }
      }, 1000);
    });
  }

  /**
   * Get offline data by type
   */
  public getOfflineDataByType(type: string): OfflineData[] {
    return Array.from(this.offlineDataMap.values())
      .filter(item => item.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get unsynced data
   */
  public getUnsyncedData(): OfflineData[] {
    return Array.from(this.offlineDataMap.values())
      .filter(item => !item.synced)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Delete offline data
   */
  public async deleteOfflineData(id: string): Promise<void> {
    this.offlineDataMap.delete(id);
    this._offlineData.set(Array.from(this.offlineDataMap.values()));
    await this.saveOfflineData();
    this.updateSyncStatus();
  }

  /**
   * Clear all offline data
   */
  public async clearAllOfflineData(): Promise<void> {
    this.offlineDataMap.clear();
    this._offlineData.set([]);
    await this.saveOfflineData();
    this.updateSyncStatus();
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<OfflineSettings>): void {
    this.settings = { ...this.settings, ...settings };

    // Restart sync interval if settings changed
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.settings.enabled && this.settings.autoSync) {
      this.startSyncInterval();
    }
  }

  /**
   * Get current settings
   */
  public getSettings(): OfflineSettings {
    return { ...this.settings };
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    return { ...this._syncStatus() };
  }

  /**
   * Check if online
   */
  public getIsOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Start sync interval
   */
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.settings.autoSync) {
        this.syncOfflineData();
      }
    }, this.settings.syncInterval);
  }

  /**
   * Stop sync interval
   */
  public stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Update sync status
   */
  private updateSyncStatus(): void {
    const totalItems = this.offlineDataMap.size;
    const pendingItems = Array.from(this.offlineDataMap.values()).filter(item => !item.synced).length;
    const failedItems = Array.from(this.offlineDataMap.values()).filter(item => !item.synced && item.retryCount >= item.maxRetries).length;

    this.syncStatusData = {
      ...this.syncStatusData,
      pendingItems,
      failedItems,
      totalItems
    };

    this._syncStatus.set(this.syncStatusData);
    this._storageInfo.set(this.getStorageInfo());
  }

  /**
   * Check if offline support is enabled
   */
  public isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Enable offline support
   */
  public enable(): void {
    this.settings.enabled = true;
    if (this.settings.autoSync) {
      this.startSyncInterval();
    }
  }

  /**
   * Disable offline support
   */
  public disable(): void {
    this.settings.enabled = false;
    this.stopSyncInterval();
  }

  /**
   * Force sync
   */
  public async forceSync(): Promise<void> {
    await this.syncOfflineData();
  }

  /**
   * Get offline data count
   */
  public getOfflineDataCount(): number {
    return this.offlineDataMap.size;
  }

  /**
   * Get pending sync count
   */
  public getPendingSyncCount(): number {
    return Array.from(this.offlineDataMap.values()).filter(item => !item.synced).length;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Export offline data
   */
  public exportOfflineData(): string {
    const data = {
      offlineData: Array.from(this.offlineDataMap.values()),
      settings: this.settings,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import offline data
   */
  public importOfflineData(data: string): void {
    try {
      const imported = JSON.parse(data);

      if (imported.offlineData) {
        imported.offlineData.forEach((item: any) => {
          item.timestamp = new Date(item.timestamp);
          this.offlineDataMap.set(item.id, item);
        });
        this._offlineData.set(Array.from(this.offlineDataMap.values()));
        this.updateSyncStatus();
      }

      if (imported.settings) {
        this.settings = { ...this.settings, ...imported.settings };
      }
    } catch (error) {
      console.error('Failed to import offline data:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopSyncInterval();
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
  }
}
