/**
 * Template Management Component
 *
 * Component for managing email, SMS, report, and page templates.
 * Supports template creation, editing, preview, and categorization.
 *
 * @example
 * ```html
 * <app-template-management></app-template-management>
 * ```
 */

import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { RichTextComponent } from '../../../shared/components/rich-text/rich-text.component';
import { TemplateManagementService } from '../../../core/services/template-management.service';
import { Template, TemplateContent, TemplateAsset } from '../../../core/models/template-management.model';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-template-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GlassCardComponent,
    GlassButtonComponent,
    DataTableComponent,
    ModalComponent,
    RichTextComponent
  ],
  templateUrl: './template-management.component.html',
  styleUrl: './template-management.component.scss'
})
export class TemplateManagementComponent implements OnInit {
  showModal = signal(false);
  showPreviewModal = signal(false);
  saving = signal(false);
  editingTemplate = signal<Template | null>(null);
  previewingTemplate = signal<Template | null>(null);

  selectedCategory = signal<string>('all');
  searchQuery = signal('');

  // Form data
  formData = {
    name: '',
    displayName: '',
    description: '',
    type: 'email' as 'page' | 'component' | 'layout' | 'email' | 'report',
    category: 'email',
    content: {
      html: '',
      css: '',
      assets: [] as TemplateAsset[]
    } as TemplateContent,
    variables: [] as any[]
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'Template Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (value) => this.formatDate(value)
    },
    {
      key: 'usage.usageCount',
      label: 'Usage',
      sortable: true,
      render: (value) => value || 0
    }
  ];

  actions: TableAction[] = [
    {
      icon: '👁️',
      label: 'Preview',
      onClick: (row) => this.previewTemplate(row)
    },
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editTemplate(row)
    },
    {
      icon: '📋',
      label: 'Copy',
      onClick: (row) => this.copyTemplate(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteTemplate(row)
    }
  ];

  constructor(
    private templateService: TemplateManagementService,
    private i18n: I18nService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Service uses BehaviorSubject, templates are available immediately
    // Subscribe to changes if needed
    // ✅ Using signals (no subscription needed)
    effect(() => {
      const templates = this.templateService.templates();
      // Handle templates changes
    });
    this.loadTemplates();
  }

  loadTemplates(): void {
    const currentUser = this.authService.currentUser();
    const companyId = currentUser?.companyId ? String(currentUser.companyId) : '';

    if (!companyId) {
      console.error('Company ID not found');
      return;
    }

    this.templateService.loadTemplates(companyId).subscribe({
      next: () => {
        // Templates are updated via BehaviorSubject
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  // Getters from service
  getTemplates = () => this.templateService.getTemplates();

  // Computed signals
  templates = computed(() => {
    let filtered = this.getTemplates();

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(t => t.category === this.selectedCategory() || t.type === this.selectedCategory());
    }

    // Filter by search
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.displayName.toLowerCase().includes(query) ||
        (t.content.html && t.content.html.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  categories = computed(() => {
    const cats = new Set<string>(['all']);
    this.getTemplates().forEach(t => {
      cats.add(t.category);
      cats.add(t.type);
    });
    return Array.from(cats);
  });

  openAddModal(): void {
    this.editingTemplate.set(null);
    this.formData = {
      name: '',
      displayName: '',
      description: '',
      type: 'email',
      category: 'email',
      content: {
        html: '',
        css: '',
        assets: []
      },
      variables: []
    };
    this.showModal.set(true);
  }

  editTemplate(template: Template): void {
    this.editingTemplate.set(template);
    this.formData = {
      name: template.name,
      displayName: template.displayName,
      description: template.description,
      type: template.type,
      category: template.category,
      content: template.content,
      variables: template.variables || []
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTemplate.set(null);
  }

  saveTemplate(): void {
    this.saving.set(true);

    // Extract variables from HTML content
    const extractedVars = this.extractVariables(this.formData.content.html);
    const variables = extractedVars.map(v => ({
      id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: v,
      type: 'text' as const,
      defaultValue: '',
      required: false,
      description: `Variable: ${v}`
    }));

    const templateData = {
      name: this.formData.name,
      displayName: this.formData.displayName || this.formData.name,
      description: this.formData.description || '',
      type: this.formData.type,
      category: this.formData.category,
      isActive: true,
      isPublic: false,
      theme: 'default',
      content: this.formData.content,
      variables: variables,
      preview: {
        image: '',
        thumbnail: '',
        description: this.formData.description
      },
      metadata: {
        createdBy: 'user',
        tags: [this.formData.category, this.formData.type],
        version: '1.0.0',
        compatibility: ['all'],
        dependencies: []
      }
    };

    const currentUser = this.authService.currentUser();
    const companyId = currentUser?.companyId ? String(currentUser.companyId) : '';

    if (!companyId) {
      console.error('Company ID not found');
      alert('Company ID not found. Please login again.');
      this.saving.set(false);
      return;
    }

    if (this.editingTemplate()) {
      this.templateService.updateTemplate(this.editingTemplate()!.id, companyId, templateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error updating template:', error);
          alert('Failed to update template');
          this.saving.set(false);
        }
      });
    } else {
      this.templateService.createTemplate(companyId, templateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error creating template:', error);
          alert('Failed to create template');
          this.saving.set(false);
        }
      });
    }
  }

  deleteTemplate(template: Template): void {
    if (!confirm(`Delete template "${template.name}"?`)) return;

    const currentUser = this.authService.currentUser();
    const companyId = currentUser?.companyId ? String(currentUser.companyId) : '';

    if (!companyId) {
      console.error('Company ID not found');
      alert('Company ID not found. Please login again.');
      return;
    }

    this.templateService.deleteTemplate(template.id, companyId).subscribe({
      next: () => {
        this.loadTemplates();
      },
      error: (error) => {
        console.error('Error deleting template:', error);
        alert('Failed to delete template');
      }
    });
  }

  previewTemplate(template: Template): void {
    this.previewingTemplate.set(template);
    this.showPreviewModal.set(true);
  }

  closePreviewModal(): void {
    this.showPreviewModal.set(false);
    this.previewingTemplate.set(null);
  }

  copyTemplate(template: Template): void {
    this.formData = {
      name: `${template.name} (Copy)`,
      displayName: `${template.displayName || template.name} (Copy)`,
      description: template.description,
      type: template.type,
      category: template.category,
      content: {
        html: template.content.html || '',
        css: template.content.css || '',
        assets: [...(template.content.assets || [])]
      },
      variables: [...(template.variables || [])]
    };
    this.editingTemplate.set(null);
    this.showModal.set(true);
  }

  extractVariables(content: string): string[] {
    if (!content) return [];
    // Extract variables like {{variableName}} from content
    const regex = /\{\{(\w+)\}\}/g;
    const matches = Array.from(content.matchAll(regex));
    const variables: string[] = [];
    for (const match of matches) {
      if (match[1] && !variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      sms: 'SMS',
      notification: 'Notification',
      report: 'Report',
      document: 'Document',
      page: 'Page',
      component: 'Component',
      layout: 'Layout'
    };
    return labels[category] || category;
  }

  formatVariableDisplay(variable: any): string {
    // Return variable name or id as string to avoid Angular interpolation issues
    const varName = typeof variable === 'string' ? variable : (variable.name || variable.id || '');
    // Use Unicode escape sequences for curly braces to avoid Angular parsing
    return '\u007B\u007B' + varName + '\u007D\u007D';
  }
}

