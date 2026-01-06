/**
 * Devices Component
 *
 * Device management component with CRUD operations, event linking, and configuration.
 * Supports device creation, editing, deletion, event linking, and device configuration management.
 *
 * @example
 * ```html
 * <app-devices></app-devices>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { ApiService } from '../../../core/services/api.service';
import { DeviceService } from '../../../core/services/device.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { Device } from '../../../core/models/device.model';
import { BaseComponent } from '../../../core/base/base.component';

/**
 * Device status type
 */
type DeviceStatus = 'active' | 'inactive' | 'offline';

/**
 * Device form data interface
 */
interface DeviceFormData {
  deviceName: string;
  location: string;
  deviceType: string;
  status: DeviceStatus;
}

/**
 * Mapped device interface for component
 */
interface MappedDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  location: string;
  deviceType: string;
  status: DeviceStatus;
  activeEventId?: string;
  activeEventName?: string;
  apiKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    PageLayoutComponent
  ],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.scss'
})
export class DevicesComponent extends BaseComponent implements OnInit {
  showModal = signal(false);
  showLinkEventModal = signal(false);
  showConfigModal = signal(false);
  saving = signal(false);
  deleting = signal(false);
  loadingConfig = signal(false);
  editingDevice = signal<MappedDevice | null>(null);
  linkingDevice = signal<MappedDevice | null>(null);
  configuringDevice = signal<MappedDevice | null>(null);

  devices = signal<MappedDevice[]>([]);
  availableEvents = signal<Array<{ id: string; eventName: string }>>([]);
  deviceConfig: Record<string, unknown> = {};

  formData: DeviceFormData = {
    deviceName: '',
    location: '',
    deviceType: 'kiosk',
    status: 'active'
  };

  selectedEventId = '';

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: this.i18n.t('common.refresh'),
      variant: 'secondary',
      onClick: () => this.loadDevices()
    },
    {
      label: this.i18n.t('common.add') + ' Device',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  columns: TableColumn[] = [
    { key: 'deviceName', label: 'Device Name', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'deviceType', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const icons = {
          'active': '🟢',
          'inactive': '🟡',
          'offline': '🔴'
        };
        return `${icons[value as keyof typeof icons]} ${value}`;
      }
    },
    {
      key: 'activeEventName',
      label: 'Active Event',
      render: (value) => value || 'No event linked'
    }
  ];

  actions: TableAction[] = [
    {
      icon: '🎯',
      label: 'Link Event',
      onClick: (row) => this.linkDeviceToEvent(row)
    },
    {
      icon: '⚙️',
      label: 'Configure',
      onClick: (row) => this.configureDevice(row)
    },
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editDevice(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteDevice(row)
    }
  ];

  constructor(
    private api: ApiService,
    private deviceService: DeviceService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // Convert companyId to string (UUID)
    const companyIdStr = String(companyId);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.deviceService.getDevices(companyIdStr),
      (response) => {
        // Map Device model to component format
        const mappedDevices: MappedDevice[] = (response.data || []).map(device => ({
          id: device.deviceId,
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          location: device.location || '',
          deviceType: device.deviceType.toLowerCase(),
          status: device.status.toLowerCase() as DeviceStatus,
          activeEventId: undefined,
          activeEventName: undefined,
          apiKey: device.apiKey,
          createdAt: device.createdAt,
          updatedAt: device.updatedAt || device.createdAt
        }));
        this.devices.set(mappedDevices);
      },
      (error: any) => {
        console.error('Error loading devices:', error);
      }
    );
  }

  /**
   * Open add device modal
   */
  openAddModal(): void {
    this.editingDevice.set(null);
    this.formData = {
      deviceName: '',
      location: '',
      deviceType: 'kiosk',
      status: 'active'
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingDevice.set(null);
  }

  /**
   * Edit device
   */
  editDevice(device: MappedDevice): void {
    this.editingDevice.set(device);
    // Convert DeviceStatus to lowercase for form
    const statusMap: Record<string, 'active' | 'inactive' | 'offline'> = {
      'ACTIVE': 'active',
      'INACTIVE': 'inactive',
      'DISABLED': 'offline'
    };
    this.formData = {
      deviceName: device.deviceName || '',
      location: device.location || '',
      deviceType: (device.deviceType || 'KIOSK').toLowerCase(),
      status: statusMap[device.status] || 'active'
    };
    this.showModal.set(true);
  }

  /**
   * Save device (create or update)
   */
  saveDevice(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // Convert companyId to string (UUID)
    const companyIdStr = String(companyId);

    this.saving.set(true);

    const deviceData = {
      deviceName: this.formData.deviceName,
      deviceType: this.formData.deviceType.toUpperCase() as any,
      location: this.formData.location,
      status: this.formData.status.toUpperCase() as any
    };

    const request = this.editingDevice()
      ? this.deviceService.updateDevice(this.editingDevice()!.deviceId || this.editingDevice()!.id, companyIdStr, deviceData, true)
      : this.deviceService.createDevice(companyIdStr, deviceData);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.loadDevices();
        this.closeModal();
        this.saving.set(false);
      },
      (error: unknown) => {
        console.error('Error saving device:', error);
        this.saving.set(false);
      }
    );
  }

  deleteDevice(device: any): void {
    if (!confirm(`Are you sure you want to delete ${device.deviceName}?`)) return;

    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // Convert companyId to string (UUID)
    const companyIdStr = String(companyId);

    this.deleting.set(true);

    // Use deviceId from Device model or id from mapped device
    const deviceId = device.deviceId || device.id;
    this.deviceService.deleteDevice(deviceId, companyIdStr, true).subscribe({
      next: () => {
        this.loadDevices();
        this.deleting.set(false);
      },
      error: (error: unknown) => {
        console.error('Error deleting device:', error);
        this.deleting.set(false);
      }
    });
  }

  linkDeviceToEvent(device: any): void {
    this.linkingDevice.set(device);
    this.loadAvailableEvents();
    this.showLinkEventModal.set(true);
  }

  /**
   * Close link event modal
   */
  closeLinkEventModal(): void {
    this.showLinkEventModal.set(false);
    this.linkingDevice.set(null);
    this.selectedEventId = '';
  }

  loadAvailableEvents(): void {
    const companyId = this.auth.currentUser()?.companyId;
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.api.get<any[]>(`/events?companyId=${companyId}`),
      (response: { data?: Array<{ id: string; eventName: string }> } | Array<{ id: string; eventName: string }>) => {
        const events = Array.isArray(response) ? response : (response.data || []);
        this.availableEvents.set(events);
      },
      (error: unknown) => {
        console.error('Error loading events:', error);
      }
    );
  }

  confirmLinkEvent(): void {
    if (!this.selectedEventId || !this.linkingDevice()) return;

    // Use deviceId from Device model or id from mapped device
    const deviceId = this.linkingDevice()?.deviceId || this.linkingDevice()?.id;
    if (!deviceId) return;

    // Link device to event via DeviceService
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.deviceService.linkDeviceToEvent(deviceId, this.selectedEventId),
      () => {
        alert('Device linked to event successfully!');
        this.loadDevices();
        this.closeLinkEventModal();
        this.selectedEventId = '';
      },
      (error: unknown) => {
        console.error('Error linking device to event:', error);
        const errorMessage = (error as { error?: { detail?: string }; message?: string })?.error?.detail ||
                            (error as { message?: string })?.message ||
                            'Unknown error';
        alert('Error linking device to event: ' + errorMessage);
      }
    );
  }

  /**
   * Configure device
   */
  configureDevice(device: MappedDevice): void {
    this.configuringDevice.set(device);
    // Use deviceId from Device model or id from mapped device
    const deviceId = device.deviceId || device.id;
    this.loadDeviceConfig(deviceId);
    this.showConfigModal.set(true);
  }

  closeConfigModal(): void {
    this.showConfigModal.set(false);
    this.configuringDevice.set(null);
    this.deviceConfig = {};
  }

  /**
   * Load device configuration
   */
  loadDeviceConfig(deviceId: string): void {
    this.loadingConfig.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.deviceService.getDeviceConfig(deviceId),
      (config) => {
        this.deviceConfig = config || {};
        this.loadingConfig.set(false);
      },
      (error) => {
        console.error('Error loading device config:', error);
        // Initialize with default config if not found
        this.deviceConfig = {
          autoCheckIn: false,
          requireApproval: true,
          notificationEnabled: true,
          maxCheckInsPerDay: 100,
          checkInTimeout: 300,
          displayLanguage: 'en',
          soundEnabled: true,
          screenTimeout: 300
        };
        this.loadingConfig.set(false);
      }
    );
  }

  /**
   * Save device configuration
   */
  saveDeviceConfig(): void {
    const device = this.configuringDevice();
    if (!device) return;

    // Use deviceId from Device model or id from mapped device
    const deviceId = device.deviceId || device.id;
    if (!deviceId) return;

    this.saving.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.deviceService.updateDeviceConfig(deviceId, this.deviceConfig),
      () => {
        this.saving.set(false);
        this.closeConfigModal();
        alert('Device configuration saved successfully');
      },
      (error) => {
        console.error('Error saving device config:', error);
        alert('Error saving device configuration');
        this.saving.set(false);
      }
    );
  }

  /**
   * Translate key using i18n service
   */
  t(key: string): string {
    return this.i18n.translate(key);
  }
}

