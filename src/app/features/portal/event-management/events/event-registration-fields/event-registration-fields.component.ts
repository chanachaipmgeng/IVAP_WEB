import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-event-registration-fields',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './event-registration-fields.component.html',
  styleUrls: ['./event-registration-fields.component.scss']
})
export class EventRegistrationFieldsComponent implements OnInit {
  form: FormGroup;
  fieldTypes = [
    { value: 'text', label: 'Text Input', icon: 'fa-font' },
    { value: 'number', label: 'Number', icon: 'fa-hashtag' },
    { value: 'email', label: 'Email', icon: 'fa-envelope' },
    { value: 'tel', label: 'Phone', icon: 'fa-phone' },
    { value: 'select', label: 'Dropdown', icon: 'fa-list' },
    { value: 'checkbox', label: 'Checkbox', icon: 'fa-check-square' },
    { value: 'date', label: 'Date', icon: 'fa-calendar' }
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fields: this.fb.array([])
    });
  }

  ngOnInit() {
    // Add default fields
    this.addField('First Name', 'first_name', 'text', true);
    this.addField('Last Name', 'last_name', 'text', true);
    this.addField('Email', 'email', 'email', true);
  }

  get fields() {
    return this.form.get('fields') as FormArray;
  }

  addField(label: string = '', key: string = '', type: string = 'text', required: boolean = false) {
    const fieldGroup = this.fb.group({
      label: [label, Validators.required],
      key: [key, Validators.required], // Should be snake_case
      type: [type, Validators.required],
      required: [required],
      options: [''], // Comma separated for select
      placeholder: ['']
    });

    // Auto-generate key from label changes
    fieldGroup.get('label')?.valueChanges.subscribe(val => {
      if (!fieldGroup.get('key')?.dirty && val) {
        const key = val.toLowerCase().replace(/[^a-z0-9]/g, '_');
        fieldGroup.get('key')?.setValue(key);
      }
    });

    this.fields.push(fieldGroup);
  }

  removeField(index: number) {
    this.fields.removeAt(index);
  }

  moveField(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index > 0) {
      const field = this.fields.at(index);
      this.fields.removeAt(index);
      this.fields.insert(index - 1, field);
    } else if (direction === 'down' && index < this.fields.length - 1) {
      const field = this.fields.at(index);
      this.fields.removeAt(index);
      this.fields.insert(index + 1, field);
    }
  }

  saveFields() {
    if (this.form.valid) {
      const formData = this.form.value;
      console.log('Saving registration fields:', formData);
      // Process options string to array for backend
      const processedFields = formData.fields.map((f: any) => ({
        ...f,
        options: f.options ? f.options.split(',').map((o: string) => o.trim()) : []
      }));
      console.log('Processed for backend:', processedFields);
      alert('Registration form configuration saved!');
    } else {
        this.form.markAllAsTouched();
    }
  }
}

