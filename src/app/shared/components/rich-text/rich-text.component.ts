/**
 * Rich Text Component
 *
 * A rich text editor component wrapper using AdvancedRichTextComponent.
 * Provides a simplified interface for rich text editing with character count and formatting options.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-rich-text
 *   [content]="htmlContent"
 *   [placeholder]="'Enter text...'"
 *   [disabled]="false"
 *   (contentChange)="onContentChange($event)">
 * </app-rich-text>
 * ```
 */

import { Component, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AdvancedRichTextComponent } from '../advanced-rich-text/advanced-rich-text.component';

@Component({
  selector: 'app-rich-text',
  standalone: true,
  imports: [CommonModule, FormsModule, AdvancedRichTextComponent],
  template: `
    <div class="rich-text-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || 'Rich text editor'">
      <app-advanced-rich-text
        [(ngModel)]="content"
        (ngModelChange)="onContentChange($event)"
        [placeholder]="placeholder"
        [height]="height"
        [disabled]="readonly"
        [customClass]="'gemini-rich-text'"
        [showCharCount]="showCharCount"
        [maxLength]="maxLength"
        [ariaLabel]="ariaLabel || 'Rich text editor'">
      </app-advanced-rich-text>
    </div>
  `,
  styles: [`
    .rich-text-container {
      width: 100%;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextComponent),
      multi: true
    }
  ]
})
export class RichTextComponent implements ControlValueAccessor {
  @Input() content: string = '';
  @Input() placeholder: string = 'Enter text...';
  @Input() height: string = '200px';
  @Input() readonly: boolean = false;
  @Input() toolbar: string[] = []; // Deprecated
  @Input() customClass?: string;
  @Input() useLegacyEditor: boolean = false; // Deprecated
  @Input() showEditorSelector: boolean = false; // Deprecated

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;
  @Input() showCharCount: boolean = true;
  @Input() maxLength: number = 0;
  @Input() editorType: string = 'ngx-editor'; // Deprecated

  // ControlValueAccessor
  private onChange = (value: string) => {};
  private onTouched = () => {};

  onContentChange(content: string) {
    this.content = content;
    this.onChange(content);
    this.onTouched();
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
    this.readonly = isDisabled;
  }
}
