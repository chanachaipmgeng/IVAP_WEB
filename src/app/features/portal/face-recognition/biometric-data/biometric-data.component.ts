import { Component, OnInit, signal, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { BiometricDataService } from '../../../../core/services/biometric-data.service';
import { BiometricData, BiometricType, CreateBiometricDataDto, UpdateBiometricDataDto, BIOMETRIC_TYPE_LABELS } from '../../../../core/models/biometric-data.model';
import { PageLayoutComponent, PageAction } from '../../../../shared/components/page-layout/page-layout.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { FilterSectionComponent, FilterField } from '../../../../shared/components/filter-section/filter-section.component';
import { StatisticsGridComponent, StatCard } from '../../../../shared/components/statistics-grid/statistics-grid.component';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ValidationService } from '../../../../core/services/validation.service';

@Component({
  selector: 'app-biometric-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PageLayoutComponent,
    DataTableComponent,
    ModalComponent,
    FilterSectionComponent,
    StatisticsGridComponent,
    TranslateModule
  ],
  templateUrl: './biometric-data.component.html',
  styleUrl: './biometric-data.component.scss'
})
export class BiometricDataComponent implements OnInit {
  private fb = inject(FormBuilder);
  private biometricService = inject(BiometricDataService);
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);

  biometricData = signal<BiometricData[]>([]);
  filteredData = signal<BiometricData[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  selectedData = signal<BiometricData | null>(null);
  errorMessage = signal<string | null>(null);
  enrollmentMode = signal<'upload' | 'camera'>('upload');
  
  // Camera signals
  videoDevices = signal<MediaDeviceInfo[]>([]);
  selectedVideoDevice = signal<string>('');
  videoStream: MediaStream | null = null;
  capturedImage: string | null = null; // Base64 string

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  biometricForm: FormGroup;
  BiometricType = BiometricType;
  BIOMETRIC_TYPE_LABELS = BIOMETRIC_TYPE_LABELS;

  biometricTypes = signal<BiometricType[]>(Object.values(BiometricType) as BiometricType[]);

  statisticsCards = signal<StatCard[]>([
    { label: 'Total Records', value: 0, icon: 'bg-blue-500' },
    { label: 'Face Data', value: 0, icon: 'bg-green-500' },
    { label: 'Fingerprints', value: 0, icon: 'bg-purple-500' },
    { label: 'Other Types', value: 0, icon: 'bg-orange-500' }
  ]);

  columns: TableColumn[] = [
    { key: 'previewImage', label: 'Preview', sortable: false, template: undefined }, // Will be set via ng-template in HTML if needed, or use custom render
    { key: 'member_id', label: 'Member ID', sortable: true },
    { key: 'biometric_type', label: 'Type', sortable: true, 
      render: (value) => this.BIOMETRIC_TYPE_LABELS[value as BiometricType] || value 
    },
    { key: 'is_primary', label: 'Primary', sortable: true, type: 'boolean' },
    { key: 'created_at', label: 'Created At', sortable: true, type: 'date' },
    { key: 'updated_at', label: 'Updated At', sortable: true, type: 'date' }
  ];

  actions: TableAction[] = [
    { label: 'Edit', icon: 'edit', onClick: (row) => this.editData(row) },
    { label: 'Delete', icon: 'trash', onClick: (row) => this.deleteData(row) }
  ];

  pageActions = signal<PageAction[]>([
    { label: 'Export', icon: 'download', onClick: () => this.exportData(), variant: 'secondary' },
    { label: 'Add Data', icon: 'plus', onClick: () => this.addData(), variant: 'primary' }
  ]);

  filterFields = signal<FilterField[]>([
    { key: 'member_id', label: 'Member ID', type: 'text', placeholder: 'Search by Member ID' },
    { key: 'biometric_type', label: 'Type', type: 'select', options: Object.entries(this.BIOMETRIC_TYPE_LABELS).map(([value, label]) => ({ label, value })) }
  ]);

  constructor() {
    this.biometricForm = this.fb.group({
      member_id: ['', [Validators.required]],
      biometric_type: [BiometricType.FACE, [Validators.required]],
      biometric_value: ['', [Validators.required]],
      is_primary: [true]
    });
    
    // Watch for type changes to reset validation or adjust UI
    this.biometricForm.get('biometric_type')?.valueChanges.subscribe(type => {
      if (type === BiometricType.FACE) {
        this.enrollmentMode.set('upload'); // Default to upload for face
      }
    });
  }

  ngOnInit() {
    this.loadData();
    this.getVideoDevices();
  }
  
  // Camera handling methods
  async getVideoDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      this.videoDevices.set(videoDevices);
      if (videoDevices.length > 0) {
        this.selectedVideoDevice.set(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error listing devices:', error);
    }
  }

  async setEnrollmentMode(mode: 'upload' | 'camera') {
    this.enrollmentMode.set(mode);
    if (mode === 'camera') {
      await this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  async startCamera() {
    try {
      this.stopCamera();
      const constraints = {
        video: { deviceId: this.selectedVideoDevice() ? { exact: this.selectedVideoDevice() } : undefined }
      };
      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.videoStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.errorHandler.handleApiError(error);
    }
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  captureImage() {
    if (this.videoElement?.nativeElement && this.canvasElement?.nativeElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert to Base64
        const dataUrl = canvas.toDataURL('image/jpeg');
        this.capturedImage = dataUrl;
        
        // Remove data:image/jpeg;base64, prefix for API
        const base64Value = dataUrl.split(',')[1];
        this.biometricForm.patchValue({ biometric_value: base64Value });
        
        // Switch back to upload mode to show preview
        this.enrollmentMode.set('upload');
        this.stopCamera();
      }
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.capturedImage = result;
        // Remove data:image/...;base64, prefix
        const base64Value = result.split(',')[1];
        this.biometricForm.patchValue({ biometric_value: base64Value });
      };
      
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.capturedImage = null;
    this.biometricForm.patchValue({ biometric_value: '' });
  }

  // Existing CRUD methods...
  loadData() {
    this.isLoading.set(true);
    this.biometricService.getAll().subscribe({
      next: (response) => {
        const data = response.data || [];
        // Add preview image logic if value is base64 image (simplified check)
        const dataWithPreview = data.map(item => ({
            ...item,
            previewImage: item.biometric_type === BiometricType.FACE ? `data:image/jpeg;base64,${item.biometric_value}` : null
        }));
        
        this.biometricData.set(dataWithPreview);
        this.filteredData.set(dataWithPreview);
        this.updateStatistics(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.handleApiError(error));
        this.isLoading.set(false);
      }
    });
  }

  updateStatistics(data: BiometricData[]) {
    const total = data.length;
    const face = data.filter(d => d.biometric_type === BiometricType.FACE).length;
    const fingerprint = data.filter(d => d.biometric_type === BiometricType.FINGERPRINT).length;
    const other = total - face - fingerprint;

    this.statisticsCards.set([
      { label: 'Total Records', value: total, icon: 'bg-blue-500' },
      { label: 'Face Data', value: face, icon: 'bg-green-500' },
      { label: 'Fingerprints', value: fingerprint, icon: 'bg-purple-500' },
      { label: 'Other Types', value: other, icon: 'bg-orange-500' }
    ]);
  }

  onFilterChange(filters: Record<string, any>) {
    let data = this.biometricData();
    
    if (filters['member_id']) {
      data = data.filter(d => d.member_id.toLowerCase().includes(filters['member_id'].toLowerCase()));
    }
    
    if (filters['biometric_type']) {
      data = data.filter(d => d.biometric_type === filters['biometric_type']);
    }

    this.filteredData.set(data);
  }

  addData() {
    this.selectedData.set(null);
    this.biometricForm.reset({
      biometric_type: BiometricType.FACE,
      is_primary: true
    });
    this.capturedImage = null;
    this.showModal.set(true);
  }

  editData(data: BiometricData) {
    this.selectedData.set(data);
    this.biometricForm.patchValue({
      member_id: data.member_id,
      biometric_type: data.biometric_type,
      biometric_value: data.biometric_value,
      is_primary: data.is_primary
    });
    
    if (data.biometric_type === BiometricType.FACE) {
        this.capturedImage = `data:image/jpeg;base64,${data.biometric_value}`;
    } else {
        this.capturedImage = null;
    }
    
    this.showModal.set(true);
  }

  deleteData(data: BiometricData) {
    if (confirm('Are you sure you want to delete this biometric data?')) {
      this.isLoading.set(true);
      // Use 'id' instead of 'biometric_id'
      this.biometricService.delete(data.id).subscribe({
        next: () => {
          this.loadData();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(this.errorHandler.handleApiError(error));
          this.isLoading.set(false);
        }
      });
    }
  }

  saveBiometricData() {
    if (this.biometricForm.invalid) {
      this.markFormGroupTouched(this.biometricForm);
      return;
    }

    this.isLoading.set(true);
    const formValue = this.biometricForm.value;

    if (this.selectedData()) {
      const updateData: UpdateBiometricDataDto = {
        biometric_value: formValue.biometric_value,
        is_primary: formValue.is_primary
      };

      // Use 'id' instead of 'biometric_id'
      this.biometricService.update(this.selectedData()!.id, updateData).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (error) => {
          this.errorMessage.set(this.errorHandler.handleApiError(error));
          this.isLoading.set(false);
        }
      });
    } else {
      const createData: CreateBiometricDataDto = {
        member_id: formValue.member_id,
        biometric_type: formValue.biometric_type,
        biometric_value: formValue.biometric_value,
        is_primary: formValue.is_primary
      };

      this.biometricService.create(createData).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (error) => {
          this.errorMessage.set(this.errorHandler.handleApiError(error));
          this.isLoading.set(false);
        }
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedData.set(null);
    this.errorMessage.set(null);
    this.stopCamera();
  }

  getFieldError(fieldName: string): string {
    return this.validationService.getErrorMessage(this.biometricForm.get(fieldName) as FormControl, fieldName);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  exportData() {
    console.log('Exporting data...');
    // Implement export functionality
  }
}
