/**
 * Face Recognition Test Component
 * 
 * Component for testing face recognition identification.
 * Allows uploading an image or capturing from camera to test identification against enrolled faces.
 */

import { Component, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';
import { PageLayoutComponent } from '../../../../shared/components/page-layout/page-layout.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-face-recognition-test',
  standalone: true,
  imports: [CommonModule, GlassButtonComponent, PageLayoutComponent, FormsModule],
  templateUrl: './face-recognition-test.component.html',
  styleUrls: ['./face-recognition-test.component.scss']
})
export class FaceRecognitionTestComponent implements OnDestroy {
  selectedImage: string | null = null;
  identificationResult: any = null;
  loading = signal(false);

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
    this.reset();
    
    if (type === 'camera') {
        this.startCamera();
    } else {
        this.stopCamera();
    }
  }

  // --- File Upload ---

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.identificationResult = null; // Reset result
      };
      reader.readAsDataURL(file);
    }
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
    if (!this.selectedImage) return;
    
    this.loading.set(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock result (in real app, send this.selectedImage base64 to backend)
      const randomScore = Math.random();
      
      if (randomScore > 0.3) {
          this.identificationResult = {
            name: 'John Doe',
            confidence: 0.90 + (Math.random() * 0.09),
            employeeId: 'EMP-001',
            department: 'IT Department'
          };
      } else {
          this.identificationResult = null; // No match
          alert('No face match found.');
      }
      
      this.loading.set(false);
    }, 1500);
  }

  reset() {
    this.selectedImage = null;
    this.identificationResult = null;
    if (this.inputType() === 'camera') {
        this.startCamera(); // Restart camera if we reset in camera mode (though we usually switch mode)
    }
  }
}
