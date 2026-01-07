import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlassCardComponent } from '../../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

interface ParkingRule {
  id: string;
  name: string;
  type: 'Free' | 'Flat Rate' | 'Hourly';
  rate: number;
  gracePeriod: number;
  description: string;
}

@Component({
  selector: 'app-parking-rules',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './parking-rules.component.html',
  styleUrls: ['./parking-rules.component.scss']
})
export class ParkingRulesComponent implements OnInit {
  rules = signal<ParkingRule[]>([]);
  showModal = signal(false);
  ruleForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.ruleForm = this.fb.group({
      name: ['', Validators.required],
      type: ['Hourly', Validators.required],
      rate: [0, [Validators.required, Validators.min(0)]],
      gracePeriod: [15, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  ngOnInit() {
    this.rules.set([
      { id: '1', name: 'Standard Visitor', type: 'Hourly', rate: 20, gracePeriod: 15, description: 'Standard rate for visitors' },
      { id: '2', name: 'Staff Permit', type: 'Free', rate: 0, gracePeriod: 0, description: 'Free parking for registered staff' },
      { id: '3', name: 'Event Rate', type: 'Flat Rate', rate: 100, gracePeriod: 30, description: 'Flat rate for event days' }
    ]);
  }

  addRule() {
    this.ruleForm.reset({ type: 'Hourly', rate: 0, gracePeriod: 15 });
    this.showModal.set(true);
  }

  saveRule() {
    if (this.ruleForm.valid) {
      const newRule: ParkingRule = {
        id: Math.random().toString(36).substr(2, 9),
        ...this.ruleForm.value
      };
      this.rules.update(list => [...list, newRule]);
      this.showModal.set(false);
    }
  }

  deleteRule(id: string) {
    this.rules.update(list => list.filter(r => r.id !== id));
  }
}

