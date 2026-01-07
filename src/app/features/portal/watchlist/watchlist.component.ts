import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface WatchlistMember {
  id: string;
  name: string;
  photoUrl: string;
  reason: string;
  level: 'High' | 'Medium' | 'Low';
  addedAt: Date;
  status: 'Active' | 'Inactive';
}

import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassButtonComponent, GlassCardComponent],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss']
})
export class WatchlistComponent implements OnInit {
  watchlist = signal<WatchlistMember[]>([]);
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  watchlistForm: FormGroup;
  selectedMemberId: string | null = null;

  constructor(private fb: FormBuilder) {
    this.watchlistForm = this.fb.group({
      name: ['', Validators.required],
      reason: ['', Validators.required],
      level: ['Medium', Validators.required],
      photoUrl: [''],
      status: ['Active']
    });
  }

  ngOnInit() {
    // Mock data for demonstration
    this.watchlist.set([
      {
        id: '1',
        name: 'John Doe',
        photoUrl: 'assets/images/placeholder-face.jpg',
        reason: 'Suspicious behavior reported previously',
        level: 'High',
        addedAt: new Date('2023-10-15'),
        status: 'Active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        photoUrl: 'assets/images/placeholder-face.jpg',
        reason: 'VIP - Special access required',
        level: 'Low',
        addedAt: new Date('2023-11-20'),
        status: 'Active'
      }
    ]);
  }

  openAddModal() {
    this.isEditing.set(false);
    this.selectedMemberId = null;
    this.watchlistForm.reset({ level: 'Medium', status: 'Active' });
    this.showModal.set(true);
  }

  openEditModal(member: WatchlistMember) {
    this.isEditing.set(true);
    this.selectedMemberId = member.id;
    this.watchlistForm.patchValue({
      name: member.name,
      reason: member.reason,
      level: member.level,
      photoUrl: member.photoUrl,
      status: member.status
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveMember() {
    if (this.watchlistForm.valid) {
      const formValue = this.watchlistForm.value;
      
      if (this.isEditing() && this.selectedMemberId) {
        // Update existing
        this.watchlist.update(list => list.map(item => 
          item.id === this.selectedMemberId 
            ? { ...item, ...formValue } 
            : item
        ));
      } else {
        // Add new
        const newMember: WatchlistMember = {
          id: Math.random().toString(36).substring(7),
          ...formValue,
          addedAt: new Date()
        };
        this.watchlist.update(list => [newMember, ...list]);
      }
      this.closeModal();
    }
  }

  deleteMember(id: string) {
    if (confirm('Are you sure you want to remove this person from the watchlist?')) {
      this.watchlist.update(list => list.filter(item => item.id !== id));
    }
  }

  getBadgeClass(level: string): string {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}

