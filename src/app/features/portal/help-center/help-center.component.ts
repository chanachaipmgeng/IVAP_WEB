/**
 * Help Center Component
 *
 * Component for displaying help center with categories and FAQ.
 * Provides navigation to help sections and expandable FAQ items.
 *
 * @example
 * ```html
 * <app-help-center></app-help-center>
 * ```
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';

/**
 * Help category interface
 */
interface HelpCategory {
  icon: string;
  title: string;
  description: string;
  link: string;
}

/**
 * FAQ item interface
 */
interface FaqItem {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterModule, GlassCardComponent],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent {
  searchQuery = signal('');

  helpCategories = signal<HelpCategory[]>([
    { icon: '🚀', title: 'Getting Started', description: 'Learn the basics of setting up your account and first steps.', link: '/portal/dashboard' },
    { icon: '👥', title: 'People Management', description: 'Guides on managing employees, visitors, and guests.', link: '/portal/employees' },
    { icon: '📹', title: 'Video & Monitoring', description: 'How to use live monitoring and analyze video feeds.', link: '/portal/monitoring' },
    { icon: '⚙️', title: 'Configuration', description: 'Customize system settings, devices, and locations.', link: '/portal/config' },
    { icon: '📊', title: 'Reports & Analytics', description: 'Understand and export data from the system.', link: '/portal/reports' },
    { icon: '🔑', title: 'Access Control', description: 'Manage doors, vehicles, and QR codes.', link: '/portal/access-control' },
    { icon: '📋', title: 'Template Management', description: 'Create and manage templates for emails, SMS, and reports.', link: '/portal/template-management' },
  ]);

  faqItems = signal<FaqItem[]>([
    {
      question: 'How do I reset my password?',
      answer: 'Click the "Forgot Password?" link on the login page, enter your email address, and follow the instructions sent to your email. The reset link will expire after 24 hours for security.',
      expanded: false
    },
    {
      question: 'How do I add a new employee?',
      answer: 'Navigate to "People Management" > "Employees" from the sidebar menu, click the "Add Employee" button, fill in the required details (name, email, department, position), and save. The employee will receive an invitation email.',
      expanded: false
    },
    {
      question: 'Can I view multiple camera feeds at once?',
      answer: 'Yes, the Live Monitoring page allows you to create custom grid views (1x1, 2x2, 3x3, etc.) to see multiple camera feeds simultaneously. You can drag and drop cameras into the layout you prefer.',
      expanded: false
    },
    {
      question: 'How do I export an attendance report?',
      answer: 'Go to "Data & Reports" > "Reports" > "Attendance Report". Select your desired date range, apply filters (employee, status, type), and click the "Export to CSV" button. The file will download automatically.',
      expanded: false
    },
    {
      question: 'How do I manage access permissions?',
      answer: 'Go to "Access Control" in the sidebar to manage doors, vehicles, and QR codes. You can assign permissions to employees, set schedules, and view access logs.',
      expanded: false
    },
    {
      question: 'How do I create email templates?',
      answer: 'Navigate to "Data & Reports" > "Template Management". Click "Create Template", select a category (Email, SMS, etc.), use the rich text editor to create your template, and include variables like {{name}} or {{email}} for dynamic content.',
      expanded: false
    },
    {
      question: 'How do I view event details?',
      answer: 'Go to "Core Operations" > "Events", find the event in the table, and click the "View Details" button (eye icon) to see complete event information, including dates, location, description, and public registration link.',
      expanded: false
    },
    {
      question: 'What is the maximum file size for uploads?',
      answer: 'The maximum file size for profile pictures is 5MB. Supported formats include JPG, PNG, and GIF. For document uploads, the limit is 10MB with PDF, DOC, and DOCX formats supported.',
      expanded: false
    }
  ]);

  // Computed signal for filtered FAQs
  filteredFaqs = signal<FaqItem[]>(this.faqItems());

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (!query.trim()) {
      this.filteredFaqs.set(this.faqItems());
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = this.faqItems().filter(item =>
      item.question.toLowerCase().includes(lowerQuery) ||
      item.answer.toLowerCase().includes(lowerQuery)
    );
    this.filteredFaqs.set(filtered);
  }

  toggleFaq(item: FaqItem) {
    item.expanded = !item.expanded;
  }
}
