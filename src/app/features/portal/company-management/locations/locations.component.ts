/**
 * Locations Component
 *
 * Component for managing company locations with full CRUD operations.
 * Supports location creation, editing, deletion, and listing.
 *
 * @example
 * ```html
 * <app-locations></app-locations>
 * ```
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { PageLayoutComponent, PageAction } from '../../../../shared/components/page-layout/page-layout.component';
import { ModalFormComponent } from '../../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../../shared/components/form-field/form-field.component';
import { CompanyLocationService } from '../../../../core/services/company-location.service';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { CompanyLocation, CompanyLocationCreate, CompanyLocationUpdate } from '../../../../core/models/company-location.model';
import { BaseComponent } from '../../../../core/base/base.component';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    GlassCardComponent,
    GlassButtonComponent,
    DataTableComponent,
    PageLayoutComponent,
    ModalFormComponent
  ],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss'
})
export class LocationsComponent extends BaseComponent implements OnInit {
  showModal = signal(false);
  saving = signal(false);
  editingLocation = signal<CompanyLocation | null>(null);
  locations = signal<CompanyLocation[]>([]);
  loading = signal(false);

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add Location',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  formData: Partial<CompanyLocationCreate> = {
    location_name: '',
    latitude: 0,
    longitude: 0,
    radius: 100,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    location_type: 'OFFICE'
  };

  // Form fields configuration for ModalFormComponent
  locationFormFields = computed<FormFieldConfig[]>(() => {
    const location = this.editingLocation();
    
    return [
      {
        key: 'location_name',
        label: 'Location Name',
        type: 'text',
        placeholder: 'Head Office',
        required: true,
        value: location?.location_name || this.formData.location_name || ''
      },
      {
        key: 'latitude',
        label: 'Latitude',
        type: 'number',
        placeholder: '13.7563',
        required: true,
        value: location?.latitude?.toString() || this.formData.latitude?.toString() || '',
        hint: 'GPS latitude coordinate'
      },
      {
        key: 'longitude',
        label: 'Longitude',
        type: 'number',
        placeholder: '100.5018',
        required: true,
        value: location?.longitude?.toString() || this.formData.longitude?.toString() || '',
        hint: 'GPS longitude coordinate'
      },
      {
        key: 'radius',
        label: 'Radius (km)',
        type: 'number',
        placeholder: '0.1',
        required: true,
        value: location?.radius?.toString() || this.formData.radius?.toString() || '0.1',
        hint: 'Radius in kilometers (e.g., 0.1 = 100 meters)'
      },
      {
        key: 'start_date',
        label: 'Start Date',
        type: 'date',
        required: true,
        value: location?.start_date ? new Date(location.start_date).toISOString().split('T')[0] : this.formData.start_date ? new Date(this.formData.start_date).toISOString().split('T')[0] : ''
      },
      {
        key: 'end_date',
        label: 'End Date',
        type: 'date',
        required: true,
        value: location?.end_date ? new Date(location.end_date).toISOString().split('T')[0] : this.formData.end_date ? new Date(this.formData.end_date).toISOString().split('T')[0] : ''
      },
      {
        key: 'location_type',
        label: 'Location Type',
        type: 'select',
        required: true,
        options: [
          { value: 'OFFICE', label: 'Office' },
          { value: 'WAREHOUSE', label: 'Warehouse' },
          { value: 'FACTORY', label: 'Factory' },
          { value: 'BRANCH', label: 'Branch' },
          { value: 'REMOTE', label: 'Remote' },
          { value: 'OTHER', label: 'Other' }
        ],
        value: location?.location_type || this.formData.location_type || 'OFFICE'
      }
    ];
  });

  columns: TableColumn[] = [
    { key: 'location_name', label: 'Location Name', sortable: true },
    { key: 'location_type', label: 'Type', sortable: true },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  actions: TableAction[] = [
    {
      icon: '🗺️',
      label: 'View on Map',
      onClick: (row) => this.viewOnMap(row)
    },
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editLocation(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteLocation(row)
    }
  ];

  constructor(
    private locationService: CompanyLocationService,
    private auth: AuthService,
    private i18n: I18nService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.loading.set(true);
    const companyId = this.auth.currentUser()?.companyId || this.auth.currentUser()?.company_id;
    if (!companyId) {
      this.loading.set(false);
      return;
    }

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.locationService.getByCompanyId(String(companyId)),
      (response: any) => {
        const items = response.items || response.data || [];
        this.locations.set(items);
        this.loading.set(false);
      },
      (error: any) => {
        console.error('Error loading locations:', error);
        this.loading.set(false);
      }
    );
  }

  openAddModal(): void {
    this.editingLocation.set(null);
    this.formData = {
      location_name: '',
      latitude: 0,
      longitude: 0,
      radius: 0.1,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      location_type: 'OFFICE'
    };
    this.showModal.set(true);
  }

  editLocation(location: CompanyLocation): void {
    this.editingLocation.set(location);
    this.formData = {
      location_name: location.location_name,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      start_date: location.start_date,
      end_date: location.end_date,
      location_type: location.location_type
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingLocation.set(null);
  }

  onLocationFormSubmitted(formData: Record<string, any>): void {
    this.formData = {
      location_name: formData['location_name'] || '',
      latitude: parseFloat(formData['latitude']) || 0,
      longitude: parseFloat(formData['longitude']) || 0,
      radius: parseFloat(formData['radius']) || 0.1,
      start_date: formData['start_date'] ? new Date(formData['start_date']).toISOString() : new Date().toISOString(),
      end_date: formData['end_date'] ? new Date(formData['end_date']).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      location_type: formData['location_type'] || 'OFFICE'
    };
    this.saveLocation();
  }

  saveLocation(): void {
    this.saving.set(true);

    const companyId = this.auth.currentUser()?.companyId || this.auth.currentUser()?.company_id;
    if (!companyId) {
      this.saving.set(false);
      return;
    }

    const locationData: CompanyLocationCreate = {
      location_name: String(this.formData.location_name || ''),
      latitude: this.formData.latitude || 0,
      longitude: this.formData.longitude || 0,
      radius: this.formData.radius || 0.1,
      start_date: this.formData.start_date || new Date().toISOString(),
      end_date: this.formData.end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      location_type: String(this.formData.location_type || 'OFFICE')
    };

    const request = this.editingLocation()
      ? this.locationService.updateLocation(String(companyId), this.editingLocation()!.location_id, locationData)
      : this.locationService.createLocation(String(companyId), locationData);

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      request,
      () => {
        this.saving.set(false);
        this.closeModal();
        this.loadLocations();
      },
      (error: any) => {
        console.error('Error saving location:', error);
        this.saving.set(false);
      }
    );
  }

  deleteLocation(location: CompanyLocation): void {
    if (!confirm(`Delete location ${location.location_name}?`)) return;

    const companyId = this.auth.currentUser()?.companyId || this.auth.currentUser()?.company_id;
    if (!companyId) return;

    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.locationService.deleteLocation(String(companyId), location.location_id),
      () => {
        this.loadLocations();
      },
      (error: any) => {
        console.error('Error deleting location:', error);
      }
    );
  }

  viewOnMap(location: CompanyLocation): void {
    if (location.latitude && location.longitude) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('No coordinates available for this location');
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.formData.latitude = position.coords.latitude;
        this.formData.longitude = position.coords.longitude;
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}

