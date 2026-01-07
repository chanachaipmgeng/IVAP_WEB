import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

interface AccessGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  doorsCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-access-groups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './access-groups.component.html',
  styleUrls: ['./access-groups.component.scss']
})
export class AccessGroupsComponent implements OnInit {
  groups = signal<AccessGroup[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  groupForm: FormGroup;
  selectedGroupId: string | null = null;

  // Mock Data
  mockDoors = [
    { id: '1', name: 'Main Entrance' },
    { id: '2', name: 'Back Door' },
    { id: '3', name: 'Server Room' },
    { id: '4', name: 'Meeting Room A' }
  ];

  constructor(private fb: FormBuilder) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      doors: [[]], // Array of door IDs
      isActive: [true]
    });
  }

  ngOnInit() {
    this.groups.set([
      { id: '1', name: 'All Access', description: 'Access to all doors 24/7', membersCount: 5, doorsCount: 4, isActive: true },
      { id: '2', name: 'General Staff', description: 'Standard working hours access', membersCount: 45, doorsCount: 2, isActive: true },
      { id: '3', name: 'IT Team', description: 'Server room access', membersCount: 3, doorsCount: 3, isActive: true }
    ]);
  }

  openAddModal() {
    this.isEditing.set(false);
    this.selectedGroupId = null;
    this.groupForm.reset({ isActive: true, doors: [] });
    this.showModal.set(true);
  }

  openEditModal(group: AccessGroup) {
    this.isEditing.set(true);
    this.selectedGroupId = group.id;
    this.groupForm.patchValue({
      name: group.name,
      description: group.description,
      isActive: group.isActive,
      doors: ['1', '2'] // Mock selected doors
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveGroup() {
    if (this.groupForm.valid) {
      const formValue = this.groupForm.value;
      
      if (this.isEditing() && this.selectedGroupId) {
        this.groups.update(list => list.map(g => 
          g.id === this.selectedGroupId 
            ? { ...g, ...formValue, doorsCount: formValue.doors?.length || 0 } 
            : g
        ));
      } else {
        const newGroup: AccessGroup = {
          id: Date.now().toString(),
          ...formValue,
          membersCount: 0,
          doorsCount: formValue.doors?.length || 0
        };
        this.groups.update(list => [...list, newGroup]);
      }
      this.closeModal();
    }
  }

  deleteGroup(id: string) {
    if(confirm('Are you sure you want to delete this access group?')) {
      this.groups.update(list => list.filter(g => g.id !== id));
    }
  }
}

