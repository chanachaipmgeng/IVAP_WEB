import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-company-documents',
  standalone: true,
  imports: [CommonModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './company-documents.component.html',
  styleUrls: ['./company-documents.component.scss']
})
export class CompanyDocumentsComponent implements OnInit {
  documents = signal([
    { id: '1', name: 'Employee Handbook 2026', type: 'PDF', size: '2.5 MB', updated: new Date(), category: 'Policy' },
    { id: '2', name: 'Safety Guidelines', type: 'PDF', size: '1.2 MB', updated: new Date('2025-12-15'), category: 'Safety' },
    { id: '3', name: 'Leave Request Form', type: 'DOCX', size: '500 KB', updated: new Date('2025-11-20'), category: 'Form' }
  ]);

  constructor() {}

  ngOnInit() {}
}

