/**
 * Rich Text Editor Component
 *
 * A rich text editor component wrapper using AdvancedRichTextComponent.
 * Provides a unified interface for rich text editing with character count and formatting options.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-rich-text-editor
 *   [config]="editorConfig"
 *   [value]="content"
 *   (contentChange)="onContentChange($event)">
 * </app-rich-text-editor>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { AdvancedRichTextComponent } from '../advanced-rich-text/advanced-rich-text.component';

/**
 * Rich text editor configuration interface
 */
export interface RichTextEditorConfig {
  theme: 'snow' | 'bubble';
  placeholder: string;
  readOnly: boolean;
  modules: Record<string, unknown>; // Simplified for compatibility
  formats: string[];
  bounds: string | HTMLElement;
  debug: boolean;
  scrollingContainer: string | HTMLElement;
  strict: boolean;
}

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvancedRichTextComponent],
  template: `
    <div class="rich-text-editor-wrapper" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || 'Rich text editor'">
      <app-advanced-rich-text
        [(ngModel)]="_value"
        (ngModelChange)="onModelChange($event)"
        [placeholder]="config.placeholder || placeholder"
        [disabled]="disabled || config.readOnly || false"
        [customClass]="'unified-rich-text-editor'"
        [showCharCount]="true"
        [ariaLabel]="ariaLabel || 'Rich text editor'">
      </app-advanced-rich-text>
    </div>
  `,
  styles: [`
    .rich-text-editor-wrapper {
      width: 100%;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {
  /**
   * Editor configuration
   */
  @Input() config: Partial<RichTextEditorConfig> = {};

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Placeholder text
   */
  @Input() placeholder: string = 'Enter text...';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Content change event
   */
  @Output() contentChange = new EventEmitter<string>();

  /**
   * Selection change event
   */
  @Output() selectionChange = new EventEmitter<unknown>();

  /**
   * Text change event
   */
  @Output() textChange = new EventEmitter<{ source: string; value: string }>();

  /**
   * Editor ready event
   */
  @Output() editorReady = new EventEmitter<void>();

  // Default configuration
  defaultConfig: RichTextEditorConfig = {
    theme: 'snow',
    placeholder: 'Enter text...',
    readOnly: false,
    modules: {},
    formats: [],
    bounds: 'self',
    debug: false,
    scrollingContainer: 'self',
    strict: true
  };

  _value: string = '';

  // ControlValueAccessor implementation
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Simulate editor ready
    setTimeout(() => {
      this.editorReady.emit();
    }, 0);
  }

  ngOnDestroy(): void {
  }

  /**
   * Handle model change
   */
  onModelChange(value: string): void {
    this._value = value;
    this.onChange(value);
    this.contentChange.emit(value);
    // Emulate text change event
    this.textChange.emit({ source: 'user', value });
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): RichTextEditorConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Get editor content
   */
  getContent(): string {
    return this._value;
  }

  /**
   * Set editor content
   */
  setContent(content: string): void {
    this._value = content;
  }

  /**
   * Get text content
   */
  getText(): string {
    // Simple HTML strip
    return this._value.replace(/<[^>]*>/g, '');
  }

  /**
   * Insert text at cursor
   */
  insertText(text: string): void {
    // Not supported in this wrapper version
    console.warn('insertText not supported in this version');
  }

  /**
   * Insert HTML at cursor
   */
  insertHTML(html: string): void {
    // Not supported in this wrapper version
    console.warn('insertHTML not supported in this version');
  }

  /**
   * Format text
   */
  formatText(format: string, value: any): void {
     // Not supported in this wrapper version
     console.warn('formatText not supported in this version');
  }

  /**
   * Get format
   */
  getFormat(range?: any): any {
    return {};
  }

  /**
   * Remove format
   */
  removeFormat(range?: any): void {
     // Not supported in this wrapper version
  }

  /**
   * Focus editor
   */
  focus(): void {
    // Pass focus to child if possible
  }

  /**
   * Blur editor
   */
  blur(): void {
  }

  /**
   * Enable/disable editor
   */
  setEnabled(enabled: boolean): void {
    this.disabled = !enabled;
  }

  /**
   * Get editor bounds
   */
  getBounds(index?: number): unknown {
    return null;
  }

  /**
   * Get selection
   */
  getSelection(): unknown {
    return null;
  }

  /**
   * Set selection
   */
  setSelection(range: any): void {
  }

  /**
   * Get length
   */
  getLength(): number {
    return this.getText().length;
  }

  /**
   * Insert link
   */
  insertLink(): void {
  }

  /**
   * Insert image
   */
  insertImage(): void {
  }

  /**
   * Insert table
   */
  insertTable(): void {
  }

  /**
   * Undo
   */
  undo(): void {
  }

  /**
   * Redo
   */
  redo(): void {
  }

  /**
   * Get editor classes
   */
  getEditorClasses(): string[] {
    return ['rich-text-editor'];
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
