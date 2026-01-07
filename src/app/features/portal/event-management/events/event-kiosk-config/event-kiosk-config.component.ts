import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-event-kiosk-config',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './event-kiosk-config.component.html',
  styleUrls: ['./event-kiosk-config.component.scss']
})
export class EventKioskConfigComponent implements OnInit {
  configForm: FormGroup;
  previewMode = signal<'desktop' | 'mobile'>('desktop');
  
  // Mock themes
  themes = [
    { id: 'modern', name: 'Modern Dark', primaryColor: '#6366f1', bgColor: '#1f2937' },
    { id: 'corporate', name: 'Corporate Blue', primaryColor: '#2563eb', bgColor: '#ffffff' },
    { id: 'elegant', name: 'Elegant Gold', primaryColor: '#d97706', bgColor: '#1c1917' },
    { id: 'vibrant', name: 'Vibrant Purple', primaryColor: '#9333ea', bgColor: '#f3e8ff' }
  ];

  selectedTheme = signal(this.themes[0]);

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      welcomeMessage: ['Welcome to the Event', Validators.required],
      subMessage: ['Please scan your QR code or face to check in', Validators.required],
      themeId: ['modern', Validators.required],
      showLogo: [true],
      showTime: [true],
      showWeather: [false],
      autoCloseSeconds: [5, [Validators.min(1), Validators.max(60)]]
    });
  }

  ngOnInit() {
    // Load existing config (Mock)
    this.configForm.get('themeId')?.valueChanges.subscribe(themeId => {
      const theme = this.themes.find(t => t.id === themeId);
      if (theme) {
        this.selectedTheme.set(theme);
      }
    });
  }

  saveConfig() {
    if (this.configForm.valid) {
      console.log('Saving kiosk config:', this.configForm.value);
      alert('Kiosk configuration saved successfully!');
    }
  }

  resetConfig() {
    this.configForm.reset({
      welcomeMessage: 'Welcome to the Event',
      subMessage: 'Please scan your QR code or face to check in',
      themeId: 'modern',
      showLogo: true,
      showTime: true,
      showWeather: false,
      autoCloseSeconds: 5
    });
  }
}

