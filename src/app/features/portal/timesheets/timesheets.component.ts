import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

interface TimesheetEntry {
  id: string;
  employeeName: string;
  employeeId: string;
  date: Date;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  isCorrection: boolean;
}

@Component({
  selector: 'app-timesheets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss']
})
export class TimesheetsComponent implements OnInit {
  entries = signal<TimesheetEntry[]>([]);
  showModal = signal(false);
  entryForm: FormGroup;
  selectedEntryId: string | null = null;
  selectedDate = signal(new Date().toISOString().split('T')[0]);

  constructor(private fb: FormBuilder) {
    this.entryForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.entries.set([
      { id: '1', employeeName: 'John Doe', employeeId: 'EMP001', date: new Date(), checkIn: '08:05', checkOut: '17:00', totalHours: '8h 55m', status: 'present', isCorrection: false },
      { id: '2', employeeName: 'Jane Smith', employeeId: 'EMP002', date: new Date(), checkIn: '09:15', checkOut: '18:00', totalHours: '7h 45m', status: 'late', isCorrection: false },
      { id: '3', employeeName: 'Bob Brown', employeeId: 'EMP003', date: new Date(), checkIn: '-', checkOut: '-', totalHours: '0h 0m', status: 'absent', isCorrection: true }
    ]);
  }

  openCorrectionModal(entry: TimesheetEntry) {
    this.selectedEntryId = entry.id;
    this.entryForm.patchValue({
      checkIn: entry.checkIn !== '-' ? entry.checkIn : '',
      checkOut: entry.checkOut !== '-' ? entry.checkOut : '',
      reason: ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCorrection() {
    if (this.entryForm.valid && this.selectedEntryId) {
      const formValue = this.entryForm.value;
      this.entries.update(list => list.map(e => 
        e.id === this.selectedEntryId 
          ? { ...e, checkIn: formValue.checkIn, checkOut: formValue.checkOut, isCorrection: true, status: 'present' } 
          : e
      ));
      this.closeModal();
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}

