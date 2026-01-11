import { Component, OnInit, signal, ViewChild, ElementRef, inject, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { BiometricDataService } from '../../../../core/services/biometric-data.service';
import { FaceService } from '../../../../core/services/face.service';
import { CompanyEmployeeService } from '../../../../core/services/company-employee.service';
import { BiometricData, BiometricType, CreateBiometricDataDto, UpdateBiometricDataDto, BIOMETRIC_TYPE_LABELS } from '../../../../core/models/biometric-data.model';
import { EmployeeDisplay } from '../../../../core/models/employee-display.model';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { FaceDetectionService } from '../../../../core/services/face-detection.service';

@Component({
  selector: 'app-biometric-data',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    TranslateModule
  ],
  templateUrl: './biometric-data.component.html',
  styleUrl: './biometric-data.component.scss'
})
export class BiometricDataComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private biometricService = inject(BiometricDataService);
  private faceService = inject(FaceService);
  private employeeService = inject(CompanyEmployeeService);
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private faceDetectionService = inject(FaceDetectionService);

  // Data Signals
  biometricData = signal<BiometricData[]>([]);
  employees = signal<EmployeeDisplay[]>([]); // List of employees for dropdown
  
  // UI State Signals
  searchTerm = signal<string>('');
  isLoading = signal(false);
  isProcessing = signal(false); // For button loading state
  showEnrollModal = signal(false);
  selectedData = signal<BiometricData | null>(null);
  errorMessage = signal<string | null>(null);
  enrollmentMode = signal<'upload' | 'camera'>('upload');
  
  // Camera Signals
  videoDevices = signal<MediaDeviceInfo[]>([]);
  selectedVideoDevice = signal<string>('');
  videoStream: MediaStream | null = null;
  isDetecting = signal(false);
  facesFound = signal(false);
  
  // Multi-angle Capture Signals
  currentAngleIndex = signal(0);
  captureAngles = ['Front', 'Left', 'Right', 'Up', 'Down'];
  angleInstructions = [
    'Look straight ahead',
    'Turn slightly left',
    'Turn slightly right',
    'Tilt head slightly up',
    'Tilt head slightly down'
  ];
  capturedAngles = signal<string[]>([]); // Stores base64 images for each angle

  // Enrollment Signals
  capturedImages = signal<string[]>([]); // Base64 strings for preview (Legacy/Upload)
  selectedFiles: File[] = []; // Actual files to upload
  
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  
  // Computed Properties
  isEditing = computed(() => !!this.selectedData());
  
  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const data = this.biometricData();
    if (!term) return data;

    return data.filter(item => 
      item.first_name?.toLowerCase().includes(term) ||
      item.last_name?.toLowerCase().includes(term) ||
      item.employee_id?.toLowerCase().includes(term) ||
      item.member_id?.toLowerCase().includes(term) ||
      item.department?.toLowerCase().includes(term)
    );
  });

  totalItems = computed(() => this.filteredData().length);
  
  // Aliases for template compatibility
  get members() { return this.employees(); }
  
  // Form & Helpers
  biometricForm: FormGroup;
  selectedMemberId: string | null = null;
  
  // Pagination (Simple implementation)
  currentPage = 1;
  pageSize = 10;
  protected Math = Math;

  constructor() {
    this.biometricForm = this.fb.group({
      member_id: ['', [Validators.required]],
      biometric_type: [BiometricType.FACE, [Validators.required]],
      biometric_value: ['', [Validators.required]],
      is_primary: [true]
    });
  }

  ngOnInit() {
    this.loadEmployees();
    this.getVideoDevices();
    // Ensure face detection models are loaded
    if (!this.faceDetectionService.isReady()) {
        console.log('Waiting for FaceDetectionService models...');
    }
  }

  ngOnDestroy() {
    this.stopCamera();
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
      this.capturedAngles.set([]);
      this.currentAngleIndex.set(0);
      setTimeout(() => this.startCamera(), 100);
    } else {
      this.stopCamera();
    }
  }

  async startCamera() {
    try {
      this.stopCamera();
      
      if (!this.selectedVideoDevice() && this.videoDevices().length > 0) {
          this.selectedVideoDevice.set(this.videoDevices()[0].deviceId);
      }

      const deviceId = this.selectedVideoDevice();
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true
      };
      
      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.videoStream;
        this.startFaceDetection();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please use file upload.');
      this.setEnrollmentMode('upload');
    }
  }

  stopCamera() {
    this.isDetecting.set(false);
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  // Real-time Face Detection Loop
  private async startFaceDetection() {
    this.isDetecting.set(true);
    
    const loop = async () => {
        if (!this.isDetecting() || !this.videoElement?.nativeElement) return;
        
        const video = this.videoElement.nativeElement;
        if (video.readyState === 4) { // HAVE_ENOUGH_DATA
            try {
                const detections = await this.faceDetectionService.detectFaces(video);
                const hasFace = detections.length > 0 && detections[0].confidence > 0.5;
                this.facesFound.set(hasFace);
            } catch (err) {
                console.warn('Face detection error:', err);
            }
        }
        
        if (this.isDetecting()) {
            requestAnimationFrame(loop);
        }
    };
    loop();
  }

  captureAngle() {
    if (!this.facesFound()) {
        alert('No face detected! Please position your face in the frame.');
        return;
    }

    if (this.videoElement?.nativeElement && this.canvasElement?.nativeElement) {
      const video = this.videoElement.nativeElement;
      const canvas = this.canvasElement.nativeElement;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Save captured image
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        // Update angles
        const currentAngles = this.capturedAngles();
        this.capturedAngles.set([...currentAngles, dataUrl]);
        
        // Move to next step
        const nextIndex = this.currentAngleIndex() + 1;
        if (nextIndex < this.captureAngles.length) {
            this.currentAngleIndex.set(nextIndex);
        } else {
            // All angles captured
            this.finishMultiAngleCapture();
        }
      }
    }
  }

  finishMultiAngleCapture() {
    // Convert all captured angles to Files
    const files: File[] = [];
    
    this.capturedAngles().forEach((dataUrl, index) => {
        // Convert DataURL to Blob to File
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], {type: mime});
        const angleName = this.captureAngles[index];
        const file = new File([blob], `capture-${angleName}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        files.push(file);
    });

    this.selectedFiles = files;
    this.capturedImages.set(this.capturedAngles()); // Show preview of all
    this.stopCamera();
    this.enrollmentMode.set('upload'); // Switch view to show captured images
  }

  resetMultiAngleCapture() {
    this.capturedAngles.set([]);
    this.currentAngleIndex.set(0);
  }

  captureImage() {
    // Legacy single capture (kept for fallback or if user prefers manual single shot)
    // Replaced by captureAngle logic for multi-angle flow
    this.captureAngle(); 
  }

  clearImages() {
    this.capturedImages.set([]);
    this.capturedAngles.set([]);
    this.currentAngleIndex.set(0);
    this.selectedFiles = [];
  }

  loadEmployees() {
    this.employeeService.getEmployees({ page: 1, size: 100 }).subscribe({
        next: (response) => {
            if (response && response.data) {
                this.employees.set(response.data);
            }
            this.loadData();
        },
        error: (err) => {
            console.error('Failed to load employees', err);
            this.loadData();
        }
    });
  }

  loadData() {
    this.isLoading.set(true);
    this.biometricService.getAll().subscribe({
      next: (response) => {
        const data = response.data || [];
        // Map employee data to biometric records
        const employees = this.employees();
        const enrichedData = data.map(record => {
            const employee = employees.find(e => e.member_id === record.member_id);
            return {
                ...record,
                first_name: employee?.first_name || 'Unknown',
                last_name: employee?.last_name || '',
                employee_id: employee?.employee_id || 'N/A',
                department: employee?.department_name || '-'
            };
        });
        
        this.biometricData.set(enrichedData);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(this.errorHandler.handleApiError(error));
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    // Search is handled by computed 'filteredData' signal automatically
    this.currentPage = 1; // Reset to first page
  }

  openEnrollModal() {
    this.selectedData.set(null);
    this.selectedMemberId = null;
    this.capturedImages.set([]);
    this.selectedFiles = [];
    this.biometricForm.reset({
      biometric_type: BiometricType.FACE,
      is_primary: true
    });
    this.showEnrollModal.set(true);
  }

  closeEnrollModal() {
    this.showEnrollModal.set(false);
    this.selectedData.set(null);
    this.selectedMemberId = null;
    this.capturedImages.set([]);
    this.selectedFiles = [];
    this.isProcessing.set(false);
    this.stopCamera(); // Ensure camera is stopped
    this.enrollmentMode.set('upload'); // Reset mode
  }

  editData(data: BiometricData) {
    this.selectedData.set(data);
    this.selectedMemberId = data.member_id;
    this.biometricForm.patchValue({
      member_id: data.member_id,
      biometric_type: data.biometric_type,
      is_primary: data.is_primary
    });
    this.capturedImages.set([]);
    this.selectedFiles = [];
    this.showEnrollModal.set(true);
  }

  deleteData(data: BiometricData) {
    if (confirm('Are you sure you want to delete this biometric data?')) {
      this.isLoading.set(true);
      
      const typeStr = data.biometric_type ? String(data.biometric_type).toLowerCase() : '';
      const isFace = typeStr === BiometricType.FACE.toLowerCase();

      if (isFace) {
          this.faceService.deleteFaceEncoding(data.id).subscribe({
            next: () => {
              this.loadData();
              this.isLoading.set(false);
            },
            error: (error) => {
              this.errorMessage.set(this.errorHandler.handleApiError(error));
              this.isLoading.set(false);
            }
          });
      } else {
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
  }

  // --- Image Handling ---

  get previewImage(): string | null {
    return this.capturedImages().length > 0 ? this.capturedImages()[0] : null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]) {
    // Filter for images
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length > 0) {
        this.selectedFiles = [...this.selectedFiles, ...validFiles]; // Append files
        
        // Read previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (result) {
                    this.capturedImages.update(images => [...images, result]);
                }
            };
            reader.readAsDataURL(file);
        });
    }
  }

  removeImage(index: number) {
    this.capturedImages.update(images => images.filter((_, i) => i !== index));
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  saveBiometricData() {
    if (!this.selectedMemberId) {
        alert('Please select an employee');
        return;
    }

    if (this.selectedFiles.length === 0 && !this.selectedData()) {
        alert('Please upload a face image');
        return;
    }

    this.isProcessing.set(true);

    // Handle Face Enrollment
    // Note: currently logic assumes mostly Face type as per template
    if (this.selectedFiles.length > 0) {
        this.faceService.addFace(this.selectedMemberId, this.selectedFiles).subscribe({
            next: (response) => {
                this.closeEnrollModal();
                this.loadData();
                this.isProcessing.set(false);
                // alert('Face enrolled successfully');
            },
            error: (error) => {
                console.error('Enrollment error:', error);
                this.isProcessing.set(false);
                alert('Failed to enroll face: ' + this.errorHandler.handleApiError(error));
            }
        });
    } else if (this.selectedData()) {
        // Update metadata only if no file changed
        // ... (Update logic if needed, but usually we just re-enroll faces)
        this.closeEnrollModal();
        this.isProcessing.set(false);
    }
  }
}
