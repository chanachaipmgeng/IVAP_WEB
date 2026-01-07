import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

interface BlacklistEntry {
  id: string;
  name: string;
  reason: string;
  addedBy: string;
  dateAdded: Date;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-visitor-blacklist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './visitor-blacklist.component.html',
  styleUrls: ['./visitor-blacklist.component.scss']
})
export class VisitorBlacklistComponent implements OnInit {
  blacklist = signal<BlacklistEntry[]>([]);
  showModal = signal(false);
  entryForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.entryForm = this.fb.group({
      name: ['', Validators.required],
      reason: ['', Validators.required],
      status: ['Active']
    });
  }

  ngOnInit() {
    this.blacklist.set([
      { id: '1', name: 'John Trouble', reason: 'Security Threat', addedBy: 'Security Chief', dateAdded: new Date('2023-11-15'), status: 'Active' },
      { id: '2', name: 'Jane Ban', reason: 'Policy Violation', addedBy: 'HR Manager', dateAdded: new Date('2023-12-01'), status: 'Active' }
    ]);
  }

  addEntry() {
    this.entryForm.reset({ status: 'Active' });
    this.showModal.set(true);
  }

  saveEntry() {
    if (this.entryForm.valid) {
      const newEntry: BlacklistEntry = {
        id: Math.random().toString(36).substr(2, 9),
        ...this.entryForm.value,
        addedBy: 'Admin', // Mock user
        dateAdded: new Date()
      };
      this.blacklist.update(list => [...list, newEntry]);
      this.showModal.set(false);
    }
  }

  deleteEntry(id: string) {
    this.blacklist.update(list => list.filter(e => e.id !== id));
  }
}

