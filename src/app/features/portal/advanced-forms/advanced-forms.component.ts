/**
 * Advanced Forms Component
 *
 * Demo component showcasing advanced form controls including color picker, date/time picker, file upload, and range slider.
 * Demonstrates various form input types and their usage.
 *
 * @example
 * ```html
 * <app-advanced-forms></app-advanced-forms>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { ColorPickerComponent } from '../../../shared/components/color-picker/color-picker.component';
import { DateTimePickerComponent } from '../../../shared/components/date-time-picker/date-time-picker.component';
import { FileUploadComponent } from '../../../shared/components/file-upload/file-upload.component';
import { RangeSliderComponent } from '../../../shared/components/range-slider/range-slider.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-advanced-forms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    ColorPickerComponent,
    DateTimePickerComponent,
    FileUploadComponent,
    RangeSliderComponent
  ],
  templateUrl: './advanced-forms.component.html',
  styleUrl: './advanced-forms.component.scss'
})
export class AdvancedFormsComponent implements OnInit {
  // Form Data
  formData = signal({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    eventDate: null as Date | null,
    eventTime: null as Date | null,
    eventDateTime: null as Date | null,
    uploadedFiles: [] as any[],
    priority: 50,
    budget: 10000,
    rating: 4.5,
    isEnabled: true,
    description: '',
    category: ''
  });

  // Math reference for template
  Math = Math;

  // Demo data
  demoData = signal({
    totalForms: 8,
    completedForms: 0,
    lastUpdated: new Date()
  });

  constructor(private i18n: I18nService) {}

  ngOnInit(): void {
    this.loadDemoData();
  }

  loadDemoData(): void {
    // Simulate loading demo data
    this.demoData.update(data => ({
      ...data,
      completedForms: 3,
      lastUpdated: new Date()
    }));
  }

  onFormChange(): void {
    // Calculate completed forms
    const data = this.formData();
    let completed = 0;

    if (data.primaryColor) completed++;
    if (data.eventDate) completed++;
    if (data.uploadedFiles.length > 0) completed++;
    if (data.priority > 0) completed++;
    if (data.budget > 0) completed++;
    if (data.rating > 0) completed++;
    if (data.description) completed++;
    if (data.isEnabled !== undefined) completed++;

    this.demoData.update(d => ({
      ...d,
      completedForms: completed,
      lastUpdated: new Date()
    }));
  }

  resetForm(): void {
    this.formData.set({
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4',
      eventDate: null,
      eventTime: null,
      eventDateTime: null,
      uploadedFiles: [],
      priority: 50,
      budget: 10000,
      rating: 4.5,
      isEnabled: true,
      description: '',
      category: ''
    });
    this.onFormChange();
  }

  submitForm(): void {
    // Form submitted successfully
    // Simulate form submission
    alert('Form submitted successfully!');
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }
}
