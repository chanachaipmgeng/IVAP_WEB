import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

interface Schedule {
  id: string;
  name: string;
  type: 'weekly' | 'holiday' | 'special';
  days: string[];
  startTime: string;
  endTime: string;
  isActive: boolean;
}

@Component({
  selector: 'app-access-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './access-schedules.component.html',
  styleUrls: ['./access-schedules.component.scss']
})
export class AccessSchedulesComponent implements OnInit {
  schedules = signal<Schedule[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  scheduleForm: FormGroup;
  selectedScheduleId: string | null = null;

  daysOfWeek = [
    { value: 'mon', label: 'Mon' },
    { value: 'tue', label: 'Tue' },
    { value: 'wed', label: 'Wed' },
    { value: 'thu', label: 'Thu' },
    { value: 'fri', label: 'Fri' },
    { value: 'sat', label: 'Sat' },
    { value: 'sun', label: 'Sun' }
  ];

  constructor(private fb: FormBuilder) {
    this.scheduleForm = this.fb.group({
      name: ['', Validators.required],
      type: ['weekly', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['18:00', Validators.required],
      days: [[], Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.schedules.set([
      { id: '1', name: 'Standard Office Hours', type: 'weekly', days: ['mon','tue','wed','thu','fri'], startTime: '08:00', endTime: '18:00', isActive: true },
      { id: '2', name: 'Weekend Shift', type: 'weekly', days: ['sat','sun'], startTime: '10:00', endTime: '16:00', isActive: true }
    ]);
  }

  toggleDay(day: string) {
    const currentDays = this.scheduleForm.get('days')?.value as string[];
    if (currentDays.includes(day)) {
      this.scheduleForm.patchValue({ days: currentDays.filter(d => d !== day) });
    } else {
      this.scheduleForm.patchValue({ days: [...currentDays, day] });
    }
  }

  openAddModal() {
    this.isEditing.set(false);
    this.selectedScheduleId = null;
    this.scheduleForm.reset({ type: 'weekly', startTime: '09:00', endTime: '18:00', isActive: true, days: [] });
    this.showModal.set(true);
  }

  openEditModal(schedule: Schedule) {
    this.isEditing.set(true);
    this.selectedScheduleId = schedule.id;
    this.scheduleForm.patchValue({
      name: schedule.name,
      type: schedule.type,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      days: schedule.days,
      isActive: schedule.isActive
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveSchedule() {
    if (this.scheduleForm.valid) {
      const formValue = this.scheduleForm.value;
      if (this.isEditing() && this.selectedScheduleId) {
        this.schedules.update(list => list.map(s => s.id === this.selectedScheduleId ? { ...s, ...formValue } : s));
      } else {
        const newSchedule: Schedule = { id: Date.now().toString(), ...formValue };
        this.schedules.update(list => [...list, newSchedule]);
      }
      this.closeModal();
    }
  }

  deleteSchedule(id: string) {
    if(confirm('Delete this schedule?')) {
      this.schedules.update(list => list.filter(s => s.id !== id));
    }
  }

  getDaysLabel(days: string[]): string {
    if (days.length === 7) return 'Everyday';
    if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) return 'Weekdays';
    if (days.length === 2 && days.includes('sat') && days.includes('sun')) return 'Weekends';
    return days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
  }
}

