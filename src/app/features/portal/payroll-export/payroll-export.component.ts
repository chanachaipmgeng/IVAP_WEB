import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-payroll-export',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './payroll-export.component.html',
  styleUrls: ['./payroll-export.component.scss']
})
export class PayrollExportComponent implements OnInit {
  exportForm: FormGroup;
  isExporting = signal(false);
  lastExport = signal<Date | null>(null);

  constructor(private fb: FormBuilder) {
    this.exportForm = this.fb.group({
      period: ['month'], // month, week, custom
      month: [new Date().toISOString().slice(0, 7)],
      format: ['csv'], // csv, excel, pdf
      includeOvertime: [true],
      includeDeductions: [true]
    });
  }

  ngOnInit() {}

  exportData() {
    this.isExporting.set(true);
    // Simulate export process
    setTimeout(() => {
      this.isExporting.set(false);
      this.lastExport.set(new Date());
      alert('Payroll data exported successfully!');
    }, 2000);
  }
}

