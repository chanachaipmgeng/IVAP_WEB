import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';

export interface NativeCapabilities {
  hasCamera: boolean;
  hasLocation: boolean;
  hasPushNotifications: boolean;
  hasBiometric: boolean;
  hasNFC: boolean;
  hasBluetooth: boolean;
  hasWifi: boolean;
  hasCellular: boolean;
  platform: 'android' | 'ios' | 'web';
  version: string;
  deviceId: string;
  model: string;
  manufacturer: string;
}

export interface CameraOptions {
  quality: number; // 0-100
  allowEdit: boolean;
  correctOrientation: boolean;
  saveToPhotoAlbum: boolean;
  targetWidth?: number;
  targetHeight?: number;
  encodingType: 'JPEG' | 'PNG';
  sourceType: 'CAMERA' | 'PHOTOLIBRARY' | 'SAVEDPHOTOALBUM';
}

export interface LocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  showLocationDialog: boolean;
  showSettingsDialog: boolean;
}

export interface PushNotificationOptions {
  title: string;
  body: string;
  data?: { [key: string]: any };
  badge?: number;
  sound?: string;
  vibrate?: number[];
  priority?: 'high' | 'normal' | 'low';
  channelId?: string;
}

export interface BiometricOptions {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackTitle?: string;
  disableBackup?: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometricType?: 'fingerprint' | 'face' | 'iris' | 'voice';
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  manufacturer: string;
  serial: string;
  uuid: string;
  isVirtual: boolean;
  cordova: string;
  isDevice: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NativeBridgeService {
  private capabilitiesData: NativeCapabilities | null = null;
  private deviceInfoData: DeviceInfo | null = null;
  private isNativeApp = false;

  // ✅ Signals for reactive state
  private _capabilities = signal<NativeCapabilities | null>(null);
  private _deviceInfo = signal<DeviceInfo | null>(null);

  // ✅ Readonly signals for public access
  public readonly capabilities = this._capabilities.asReadonly();
  public readonly deviceInfo = this._deviceInfo.asReadonly();

  // ✅ Computed signals for derived state
  public readonly isNativePlatform = computed(() => this._capabilities()?.platform !== 'web');
  public readonly hasCameraCapability = computed(() => this._capabilities()?.hasCamera ?? false);
  public readonly hasLocationCapability = computed(() => this._capabilities()?.hasLocation ?? false);

  // ✅ Observable compatibility layer (for backward compatibility)
  public capabilities$ = new Observable<NativeCapabilities | null>(observer => {
    observer.next(this._capabilities());
    // Note: This is a compatibility layer - prefer using signals directly
  });
  public deviceInfo$ = new Observable<DeviceInfo | null>(observer => {
    observer.next(this._deviceInfo());
    // Note: This is a compatibility layer - prefer using signals directly
  });

  constructor() {
    this.initializeNativeBridge();
  }

  /**
   * Initialize native bridge
   */
  private async initializeNativeBridge(): Promise<void> {
    try {
      // Check if running in native app
      this.isNativeApp = this.checkIfNativeApp();

      if (this.isNativeApp) {
        await this.loadDeviceInfo();
        await this.loadCapabilities();
      } else {
        // Web fallback
        this.capabilitiesData = this.getWebCapabilities();
        this.deviceInfoData = this.getWebDeviceInfo();
        this._capabilities.set(this.capabilitiesData);
        this._deviceInfo.set(this.deviceInfoData);
      }
    } catch (error) {
      console.error('Failed to initialize native bridge:', error);
      // Fallback to web capabilities
      this.capabilitiesData = this.getWebCapabilities();
      this.deviceInfoData = this.getWebDeviceInfo();
      this._capabilities.set(this.capabilitiesData);
      this._deviceInfo.set(this.deviceInfoData);
    }
  }

  /**
   * Check if running in native app
   */
  private checkIfNativeApp(): boolean {
    return !!(window as any).cordova || !!(window as any).Capacitor;
  }

  /**
   * Load device information
   */
  private async loadDeviceInfo(): Promise<void> {
    try {
      if ((window as any).device) {
        // Cordova
        this.deviceInfoData = {
          platform: (window as any).device.platform,
          version: (window as any).device.version,
          model: (window as any).device.model,
          manufacturer: (window as any).device.manufacturer,
          serial: (window as any).device.serial,
          uuid: (window as any).device.uuid,
          isVirtual: (window as any).device.isVirtual,
          cordova: (window as any).device.cordova,
          isDevice: (window as any).device.isDevice
        };
      } else if ((window as any).Capacitor) {
        // Capacitor
        try {
          const { Device } = await import('@capacitor/device' as any);
          const info = await Device.getInfo();
          this.deviceInfoData = {
            platform: info.platform,
            version: info.osVersion,
            model: info.model,
            manufacturer: info.manufacturer,
            serial: info.serialNumber || '',
            uuid: info.uuid,
            isVirtual: info.isVirtual,
            cordova: '',
            isDevice: true
          };
        } catch (error) {
          console.warn('Capacitor Device plugin not available:', error);
        }
      }

      this._deviceInfo.set(this.deviceInfoData);
    } catch (error) {
      console.error('Failed to load device info:', error);
    }
  }

  /**
   * Load native capabilities
   */
  private async loadCapabilities(): Promise<void> {
    try {
      const capabilities: NativeCapabilities = {
        hasCamera: await this.checkCameraCapability(),
        hasLocation: await this.checkLocationCapability(),
        hasPushNotifications: await this.checkPushNotificationCapability(),
        hasBiometric: await this.checkBiometricCapability(),
        hasNFC: await this.checkNFCCapability(),
        hasBluetooth: await this.checkBluetoothCapability(),
        hasWifi: await this.checkWifiCapability(),
        hasCellular: await this.checkCellularCapability(),
        platform: this.deviceInfoData?.platform as 'android' | 'ios' | 'web' || 'web',
        version: this.deviceInfoData?.version || 'unknown',
        deviceId: this.deviceInfoData?.uuid || 'unknown',
        model: this.deviceInfoData?.model || 'unknown',
        manufacturer: this.deviceInfoData?.manufacturer || 'unknown'
      };

      this.capabilitiesData = capabilities;
      this._capabilities.set(capabilities);
    } catch (error) {
      console.error('Failed to load capabilities:', error);
    }
  }

  /**
   * Check camera capability
   */
  private async checkCameraCapability(): Promise<boolean> {
    try {
      if ((window as any).navigator.mediaDevices && (window as any).navigator.mediaDevices.getUserMedia) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check location capability
   */
  private async checkLocationCapability(): Promise<boolean> {
    try {
      return !!(window as any).navigator.geolocation;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check push notification capability
   */
  private async checkPushNotificationCapability(): Promise<boolean> {
    try {
      if ((window as any).Capacitor) {
        try {
          await import('@capacitor/push-notifications' as any);
          return true;
        } catch (error) {
          return false;
        }
      }
      return !!(window as any).navigator.serviceWorker && 'PushManager' in window;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check biometric capability
   */
  private async checkBiometricCapability(): Promise<boolean> {
    try {
      if ((window as any).Capacitor) {
        try {
          const { BiometricAuth } = await import('@capacitor-community/biometric-auth' as any);
          const result = await BiometricAuth.isAvailable();
          return result.isAvailable;
        } catch (error) {
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check NFC capability
   */
  private async checkNFCCapability(): Promise<boolean> {
    try {
      if ((window as any).Capacitor) {
        try {
          await import('@capacitor-community/nfc' as any);
          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check Bluetooth capability
   */
  private async checkBluetoothCapability(): Promise<boolean> {
    try {
      if ((window as any).Capacitor) {
        try {
          await import('@capacitor-community/bluetooth-le' as any);
          return true;
        } catch (error) {
          return false;
        }
      }
      return !!(window as any).navigator.bluetooth;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check WiFi capability
   */
  private async checkWifiCapability(): Promise<boolean> {
    try {
      if ((window as any).Capacitor) {
        try {
          const { Network } = await import('@capacitor/network' as any);
          const status = await Network.getStatus();
          return status.connected;
        } catch (error) {
          return window.navigator.onLine;
        }
      }
      return window.navigator.onLine;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check cellular capability
   */
  private async checkCellularCapability(): Promise<boolean> {
    try {
      if ((window as any).Capacitor) {
        try {
          const { Network } = await import('@capacitor/network' as any);
          const status = await Network.getStatus();
          return status.connectionType === 'cellular';
        } catch (error) {
          return false;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get web capabilities fallback
   */
  private getWebCapabilities(): NativeCapabilities {
    return {
      hasCamera: !!(window as any).navigator.mediaDevices && (window as any).navigator.mediaDevices.getUserMedia,
      hasLocation: !!(window as any).navigator.geolocation,
      hasPushNotifications: !!(window as any).navigator.serviceWorker && 'PushManager' in window,
      hasBiometric: false,
      hasNFC: false,
      hasBluetooth: !!(window as any).navigator.bluetooth,
      hasWifi: window.navigator.onLine,
      hasCellular: false,
      platform: 'web',
      version: navigator.userAgent,
      deviceId: 'web-' + Math.random().toString(36).substr(2, 9),
      model: 'Web Browser',
      manufacturer: navigator.vendor
    };
  }

  /**
   * Get web device info fallback
   */
  private getWebDeviceInfo(): DeviceInfo {
    return {
      platform: 'web',
      version: navigator.userAgent,
      model: 'Web Browser',
      manufacturer: navigator.vendor,
      serial: '',
      uuid: 'web-' + Math.random().toString(36).substr(2, 9),
      isVirtual: false,
      cordova: '',
      isDevice: false
    };
  }

  /**
   * Take photo using native camera
   */
  public async takePhoto(options: Partial<CameraOptions> = {}): Promise<string> {
    const defaultOptions: CameraOptions = {
      quality: 80,
      allowEdit: false,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      encodingType: 'JPEG',
      sourceType: 'CAMERA'
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { Camera } = await import('@capacitor/camera' as any);
          const result = await Camera.getPhoto({
            quality: finalOptions.quality,
            allowEditing: finalOptions.allowEdit,
            resultType: 'DataUrl',
            source: 'CAMERA'
          });
          return result.dataUrl || '';
        } catch (error) {
          console.warn('Capacitor Camera plugin not available, using web fallback:', error);
          return await this.takePhotoWeb();
        }
      } else {
        // Web fallback
        return await this.takePhotoWeb();
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      throw error;
    }
  }

  /**
   * Take photo using web camera
   */
  private async takePhotoWeb(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'camera';

      input.onchange = (event: any) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        } else {
          reject(new Error('No file selected'));
        }
      };

      input.click();
    });
  }

  /**
   * Get current location
   */
  public async getCurrentLocation(options: Partial<LocationOptions> = {}): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    const defaultOptions: LocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
      showLocationDialog: true,
      showSettingsDialog: true
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { Geolocation } = await import('@capacitor/geolocation' as any);
          const result = await Geolocation.getCurrentPosition({
            enableHighAccuracy: finalOptions.enableHighAccuracy,
            timeout: finalOptions.timeout,
            maximumAge: finalOptions.maximumAge
          });
          return {
            latitude: result.coords.latitude,
            longitude: result.coords.longitude,
            accuracy: result.coords.accuracy
          };
        } catch (error) {
          console.warn('Capacitor Geolocation plugin not available, using web fallback:', error);
          return await this.getCurrentLocationWeb(finalOptions);
        }
      } else {
        // Web fallback
        return await this.getCurrentLocationWeb(finalOptions);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      throw error;
    }
  }

  /**
   * Get current location using web API
   */
  private async getCurrentLocationWeb(options: LocationOptions): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge
        }
      );
    });
  }

  /**
   * Send push notification
   */
  public async sendPushNotification(options: PushNotificationOptions): Promise<void> {
    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications' as any);
          await PushNotifications.schedule({
            notifications: [{
              title: options.title,
              body: options.body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: options.sound,
              attachments: undefined,
              actionTypeId: '',
              extra: options.data
            }]
          });
        } catch (error) {
          console.warn('Capacitor Push Notifications plugin not available, using web fallback:', error);
          // Web fallback
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(options.title, {
              body: options.body,
              icon: '/assets/icons/icon-192x192.png',
              badge: '/assets/icons/icon-72x72.png',
              data: options.data
            });
          }
        }
      } else {
        // Web fallback
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(options.title, {
            body: options.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            data: options.data
          });
        }
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
      throw error;
    }
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { PushNotifications } = await import('@capacitor/push-notifications' as any);
          const result = await PushNotifications.requestPermissions();
          return result.receive === 'granted';
        } catch (error) {
          console.warn('Capacitor Push Notifications plugin not available, using web fallback:', error);
          // Web fallback
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
          }
          return false;
        }
      } else {
        // Web fallback
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Authenticate using biometric
   */
  public async authenticateBiometric(options: Partial<BiometricOptions> = {}): Promise<BiometricResult> {
    const defaultOptions: BiometricOptions = {
      title: 'Biometric Authentication',
      subtitle: 'Please authenticate to continue',
      description: 'Use your biometric to authenticate',
      fallbackTitle: 'Use Password',
      disableBackup: false
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { BiometricAuth } = await import('@capacitor-community/biometric-auth' as any);
          const result = await BiometricAuth.authenticate(finalOptions);
          return {
            success: result.succeeded,
            error: result.error,
            biometricType: result.biometryType as any
          };
        } catch (error) {
          console.warn('Capacitor Biometric Auth plugin not available:', error);
          return {
            success: false,
            error: 'Biometric authentication not available'
          };
        }
      } else {
        // Web fallback - not supported
        return {
          success: false,
          error: 'Biometric authentication not supported on web'
        };
      }
    } catch (error) {
      console.error('Failed to authenticate biometric:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Vibrate device
   */
  public async vibrate(duration: number = 200): Promise<void> {
    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { Haptics } = await import('@capacitor/haptics' as any);
          await Haptics.vibrate({ duration });
        } catch (error) {
          console.warn('Capacitor Haptics plugin not available, using web fallback:', error);
          // Web fallback
          if ('vibrate' in navigator) {
            navigator.vibrate(duration);
          }
        }
      } else {
        // Web fallback
        if ('vibrate' in navigator) {
          navigator.vibrate(duration);
        }
      }
    } catch (error) {
      console.error('Failed to vibrate:', error);
    }
  }

  /**
   * Get device capabilities
   */
  public getCapabilities(): NativeCapabilities | null {
    return this.capabilitiesData;
  }

  /**
   * Get device info
   */
  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfoData;
  }

  /**
   * Check if running in native app (legacy method - prefer using isNative signal)
   */
  public getIsNative(): boolean {
    return this.isNativeApp;
  }

  /**
   * Check if running in native app (backward compatibility - prefer using isNative signal)
   * @deprecated Use isNative signal instead
   */
  public isNative(): boolean {
    return this.isNativeApp;
  }

  /**
   * Check if capability is available
   */
  public hasCapability(capability: keyof NativeCapabilities): boolean {
    return this.capabilitiesData ? Boolean(this.capabilitiesData[capability]) : false;
  }

  /**
   * Open native settings
   */
  public async openSettings(): Promise<void> {
    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { App } = await import('@capacitor/app' as any);
          await App.openUrl({ url: 'app-settings:' });
        } catch (error) {
          console.warn('Capacitor App plugin not available:', error);
        }
      } else {
        // Web fallback - not supported
        console.warn('Settings cannot be opened on web');
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }

  /**
   * Check network status
   */
  public async getNetworkStatus(): Promise<{ connected: boolean; connectionType: string }> {
    try {
      if (this.isNativeApp && (window as any).Capacitor) {
        try {
          const { Network } = await import('@capacitor/network' as any);
          const status = await Network.getStatus();
          return {
            connected: status.connected,
            connectionType: status.connectionType
          };
        } catch (error) {
          console.warn('Capacitor Network plugin not available, using web fallback:', error);
          return {
            connected: window.navigator.onLine,
            connectionType: 'unknown'
          };
        }
      } else {
        // Web fallback
        return {
          connected: window.navigator.onLine,
          connectionType: 'unknown'
        };
      }
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        connected: false,
        connectionType: 'unknown'
      };
    }
  }
}
