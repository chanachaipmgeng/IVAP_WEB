/**
 * Face Recognition Test Component
 *
 * Component for testing face recognition identification.
 * Allows uploading an image or capturing from camera to test identification against enrolled faces.
 */

import { Component, signal, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';
import { FormsModule } from '@angular/forms';
import { FaceService } from '../../../../core/services/face.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-face-recognition-test',
  standalone: true,
  imports: [
    CommonModule, 
    GlassButtonComponent, 
    GlassCardComponent, 
    PageLayoutComponent, 
    FormsModule,
    MatIconModule
  ],
  templateUrl: './face-recognition-test.component.html',
  styleUrls: ['./face-recognition-test.component.scss']
})
export class FaceRecognitionTestComponent implements OnDestroy {
  private faceService = inject(FaceService);

  selectedImage: string | null = null;
  selectedFile: File | null = null;
  identificationResult: any = null;
  loading = signal(false);
  isDragOver = signal(false);

  // Camera handling
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  isCameraActive = signal(false);
  availableDevices = signal<MediaDeviceInfo[]>([]);
  selectedDeviceId = signal<string>('');
  stream: MediaStream | null = null;
  inputType = signal<'upload' | 'camera'>('upload');

  constructor() {
    this.loadVideoInputDevices();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  // --- Mode Switching ---

  setInputType(type: 'upload' | 'camera'): void {
    this.inputType.set(type);
    this.reset(); // Clear previous state
    
    // Slight delay to ensure DOM update
    setTimeout(() => {
        if (type === 'camera') {
            this.startCamera();
        } else {
            this.stopCamera();
        }
    }, 50);
  }

  // --- File Upload & Drag Drop ---

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      this.identificationResult = null; // Reset result
    };
    reader.readAsDataURL(file);
  }

  // --- Camera Logic ---

  async loadVideoInputDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        this.availableDevices.set(videoDevices);

        if (videoDevices.length > 0 && !this.selectedDeviceId()) {
            this.selectedDeviceId.set(videoDevices[0].deviceId);
        }
    } catch (err) {
        console.error('Error loading devices', err);
    }
  }

  async startCamera() {
    this.stopCamera(); // Stop previous stream if any

    try {
        const constraints = {
            video: this.selectedDeviceId()
                ? { deviceId: { exact: this.selectedDeviceId() } }
                : true
        };

        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.isCameraActive.set(true);

        // Use timeout to ensure video element is available in DOM
        setTimeout(() => {
            if (this.videoElement) {
                this.videoElement.nativeElement.srcObject = this.stream;
            }
        }, 100);

    } catch (err) {
        console.error('Error accessing camera', err);
        alert('Could not access camera. Please check permissions.');
        this.inputType.set('upload');
    }
  }

  stopCamera() {
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
    }
    this.isCameraActive.set(false);
  }

  captureImage() {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.selectedImage = canvas.toDataURL('image/jpeg');

        // Convert canvas to file
        canvas.toBlob((blob) => {
            if (blob) {
                this.selectedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            }
        }, 'image/jpeg');

        this.stopCamera(); // Stop camera after capture (optional, depends on UX)
        this.inputType.set('upload'); // Switch view to show captured image
    }
  }

  onDeviceChange(event: any) {
    this.selectedDeviceId.set(event.target.value);
    if (this.inputType() === 'camera') {
        this.startCamera();
    }
  }


  // --- Identification ---

  identifyFace() {
    if (!this.selectedFile) return;

    this.loading.set(true);
    this.identificationResult = null; // Reset previous result

    // Call backend API using FaceService
    this.faceService.recognizeManyFaces(this.selectedFile).subscribe({
      next: (faces) => {
        console.log('faces', faces);
        this.loading.set(false);
        if (faces && faces.length > 0) {
            // Take the first detected face for this test
            const face = faces[0];
            this.identificationResult = {
                name: `${face.first_name || ''} ${face.last_name || ''}`.trim() || 'Unknown Member',
                confidence: face.confidence,
                employeeId: face.employee_id || face.member_id, // Use employee_id from backend response
                department: 'Verified Member' // Placeholder as dept is not yet fully linked in response or is null
            };
        } else {
            alert('No face match found.');
        }
      },
      error: (err) => {
        console.error('Identification error:', err);
        this.loading.set(false);
        alert('Error identifying face: ' + (err.error?.detail || err.message));
      }
    });
  }

  reset() {
    this.selectedImage = null;
    this.selectedFile = null;
    this.identificationResult = null;
    if (this.inputType() === 'camera') {
        this.startCamera();
    }
  }
}
