/**
 * Advanced Rich Text Component
 *
 * An advanced rich text editor component using ngx-editor.
 * Provides comprehensive text formatting options including bold, italic, headings, lists, colors, and alignment.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-advanced-rich-text
 *   [content]="htmlContent"
 *   [placeholder]="'Enter text...'"
 *   [disabled]="false"
 *   (contentChange)="onContentChange($event)">
 * </app-advanced-rich-text>
 * ```
 */

import { Component, Input, OnInit, OnDestroy, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';

@Component({
  selector: 'app-advanced-rich-text',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxEditorModule],
  template: `
    <div class="advanced-rich-text-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || 'Rich text editor'">
      <!-- Ngx Editor -->
      <div class="ngx-editor-wrapper">
        <ngx-editor-menu [editor]="ngxEditor" [toolbar]="ngxToolbar" [attr.aria-label]="'Editor toolbar'" [attr.aria-hidden]="false"></ngx-editor-menu>
        <ngx-editor
          [editor]="ngxEditor"
          [ngModel]="content"
          (ngModelChange)="onContentChange($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [attr.aria-label]="ariaLabel || 'Rich text editor'"
          [attr.aria-required]="required ? 'true' : null"
          [attr.aria-describedby]="showCharCount ? charCountId : null">
        </ngx-editor>
      </div>

      <!-- Character Count -->
      <div *ngIf="showCharCount" [id]="charCountId" class="char-count mt-2 text-right text-sm text-gray-500" role="status" [attr.aria-live]="'polite'">
        {{ getCharCount() }} / {{ maxLength || '∞' }} characters
      </div>
    </div>
  `,
  styles: [`
    .advanced-rich-text-container {
      width: 100%;
    }

    /* Ngx Editor Styling */
    ::ng-deep .NgxEditor {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      overflow: hidden;
    }

    ::ng-deep .NgxEditor__MenuBar {
      background: rgba(26, 26, 46, 0.9);
      border-bottom: 1px solid var(--glass-border);
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    ::ng-deep .NgxEditor__MenuItem {
      color: var(--text-primary);
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 6px 8px;
      margin: 2px;
      cursor: pointer;
    }

    ::ng-deep .NgxEditor__MenuItem:hover {
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }

    ::ng-deep .NgxEditor__MenuItem--active {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
    }

    ::ng-deep .NgxEditor__Content {
      background: rgba(26, 26, 46, 0.8);
      color: var(--text-primary);
      min-height: 200px;
      padding: 16px;
      font-family: 'Inter', sans-serif;
    }

    ::ng-deep .NgxEditor__Content:focus {
      outline: none;
    }

    .char-count {
      color: var(--text-muted);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdvancedRichTextComponent),
      multi: true
    }
  ]
})
export class AdvancedRichTextComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /**
   * Editor content (HTML)
   */
  @Input() content: string = '';

  /**
   * Placeholder text
   */
  @Input() placeholder: string = 'Enter text...';

  /**
   * Editor height
   */
  @Input() height: string = '200px';

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * Show editor selector (deprecated)
   */
  @Input() showEditorSelector: boolean = false; // Deprecated

  /**
   * Show character count
   */
  @Input() showCharCount: boolean = true;

  /**
   * Maximum length
   */
  @Input() maxLength: number = 0;

  /**
   * Editor type (deprecated)
   */
  @Input() editorType: string = 'ngx-editor'; // Deprecated

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Content change event
   */
  @Output() contentChange = new EventEmitter<string>();

  /**
   * Unique character count ID
   */
  charCountId: string = `char-count-${Math.random().toString(36).substr(2, 9)}`;

  // Ngx Editor
  ngxEditor!: Editor;
  ngxToolbar: Toolbar = [
      ['bold', 'italic'],
      ['underline', 'strike'],
      ['code', 'blockquote'],
      ['ordered_list', 'bullet_list'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['text_color', 'background_color'],
      ['align_left', 'align_center', 'align_right', 'align_justify'],
      ['link'],
      ['undo', 'redo']
    ];

  // ControlValueAccessor
  private onChange = (value: string) => {};
  private onTouched = () => {};

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.ngxEditor = new Editor({
      content: this.content,
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
      plugins: []
    });
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    if (this.ngxEditor) {
      this.ngxEditor.destroy();
    }
  }

  /**
   * Set editor type (deprecated)
   */
  setEditorType(type: string): void {
    // Deprecated: No-op
  }

  /**
   * Handle content change
   */
  onContentChange(content: string): void {
    this.content = content;
    this.onChange(content);
    this.onTouched();
    this.contentChange.emit(content);
  }

  /**
   * Get character count
   */
  getCharCount(): number {
    const textContent = this.content.replace(/<[^>]*>/g, '');
    return textContent.length;
  }

  /**
   * Write value from form control
   */
  writeValue(value: string): void {
    this.content = value || '';
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Register onTouched callback
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.ngxEditor) {
       // Re-create to update disabled state if needed, or rely on template binding
       // ngx-editor input [disabled] handles it.
    }
  }
}

