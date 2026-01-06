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
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { ModalFormComponent } from '../../../shared/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../shared/components/form-field/form-field.component';
import { CompanyLocationService } from '../../../core/services/company-location.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { CompanyLocationModel } from '../../../core/models/company-location.model';

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
export class LocationsComponent implements OnInit {
  showModal = signal(false);
  saving = signal(false);
  editingLocation = signal<CompanyLocationModel | null>(null);

  // Getters from service
  getLocations = () => this.locationService.getLocations();
  getLoading = () => this.locationService.getLoading();

  // Computed signals
  locations = computed(() => this.getLocations()());

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add Location',
      variant: 'primary',
      onClick: () => this.openAddModal()
    }
  ]);

  formData: Partial<CompanyLocationModel> = {
    locationName: '',
    address: '',
    latitude: 0,
    longitude: 0,
    radius: 100
  };

  // Form fields configuration for ModalFormComponent
  locationFormFields = computed<FormFieldConfig[]>(() => {
    const location = this.editingLocation();
    
    return [
      {
        key: 'locationName',
        label: 'Location Name',
        type: 'text',
        placeholder: 'Head Office',
        required: true,
        value: location?.locationName || this.formData.locationName || ''
      },
      {
        key: 'address',
        label: 'Address',
        type: 'text',
        placeholder: '123 Main Street',
        required: false,
        value: location?.address || this.formData.address || ''
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
        label: 'Radius (meters)',
        type: 'number',
        placeholder: '100',
        required: true,
        value: location?.radius?.toString() || this.formData.radius?.toString() || '100',
        hint: 'Recommended: 50-500 meters depending on building size'
      }
    ];
  });

  columns: TableColumn[] = [
    { key: 'locationName', label: 'Location Name', sortable: true },
    { key: 'address', label: 'Address' },
    { key: 'locationType', label: 'Type' },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (value ? '✅ Active' : '⏸️ Inactive')
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
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.loadLocations().subscribe({
      next: () => {
        // Locations data automatically updated via signals
      },
      error: (error) => {
        console.error('Error loading locations:', error);
      }
    });
  }

  openAddModal(): void {
    this.editingLocation.set(null);
    this.formData = {
      locationName: '',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 100
    };
    this.showModal.set(true);
  }

  editLocation(location: CompanyLocationModel): void {
    this.editingLocation.set(location);
    this.formData = {
      locationName: location.locationName,
      address: location.address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingLocation.set(null);
  }

  onLocationFormSubmitted(formData: Record<string, any>): void {
    this.formData = {
      locationName: formData['locationName'] || '',
      address: formData['address'] || '',
      latitude: parseFloat(formData['latitude']) || 0,
      longitude: parseFloat(formData['longitude']) || 0,
      radius: parseFloat(formData['radius']) || 100
    };
    this.saveLocation();
  }

  saveLocation(): void {
    this.saving.set(true);

    const request = this.editingLocation()
      ? this.locationService.updateLocationForCurrentCompany(this.editingLocation()!.locationId, this.formData)
      : this.locationService.createLocationForCurrentCompany(this.formData);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadLocations();
      },
      error: (error: any) => {
        console.error('Error saving location:', error);
        this.saving.set(false);
      }
    });
  }

  deleteLocation(location: CompanyLocationModel): void {
    if (!confirm(`Delete location ${location.locationName}?`)) return;

    this.locationService.deleteLocationForCurrentCompany(location.locationId).subscribe({
      next: () => {
        this.loadLocations();
      },
      error: (error: any) => {
        console.error('Error deleting location:', error);
      }
    });
  }

  viewOnMap(location: CompanyLocationModel): void {
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

