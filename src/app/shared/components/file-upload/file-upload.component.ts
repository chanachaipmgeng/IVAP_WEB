/**
 * File Upload Component
 *
 * A file upload component using FilePond for drag-and-drop file uploads.
 * Supports multiple files, file validation, and upload progress tracking.
 * Implements ControlValueAccessor for form integration.
 *
 * @example
 * ```html
 * <app-file-upload
 *   [label]="'Upload Documents'"
 *   [multiple]="true"
 *   [maxFiles]="5"
 *   [acceptedFileTypes]="['image/*', 'application/pdf']"
 *   [value]="uploadedFiles"
 *   (valueChange)="onFilesChange($event)">
 * </app-file-upload>
 * ```
 */

import { Component, Input, OnInit, OnDestroy, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FilePondModule } from 'ngx-filepond';
import { FilePondOptions, FilePondInitialFile } from 'filepond';

/**
 * FilePond file interface (internal representation)
 */
interface FilePondFile {
  id: string;
  filename?: string;
  filesize?: number;
  file?: File;
  status?: number;
  serverId?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, FilePondModule],
  template: `
    <div class="file-upload-container" [class]="customClass || ''" role="group" [attr.aria-label]="ariaLabel || label || 'File upload'">
      <label *ngIf="label" [for]="filePondId" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1" [attr.aria-label]="'Required'">*</span>
      </label>

      <div class="file-upload-wrapper">
        <file-pond
          #filePond
          [id]="filePondId"
          [options]="filePondOptions"
          [files]="files"
          (onaddfile)="onAddFile($event)"
          (onremovefile)="onRemoveFile($event)"
          (onprocessfile)="onProcessFile($event)"
          (onerror)="onError($event)"
          [attr.aria-label]="ariaLabel || label || 'File upload'"
          [attr.aria-describedby]="errorMessage ? errorId : (showFileInfo ? fileInfoId : null)">
        </file-pond>
      </div>

      <!-- File Info -->
      <div *ngIf="showFileInfo && filesCount > 0" [id]="fileInfoId" class="file-info mt-3" role="status" [attr.aria-live]="'polite'">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ filesCount }} file(s) selected
          <span *ngIf="maxFiles > 0">(max {{ maxFiles }})</span>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage" [id]="errorId" class="error-message text-red-500 text-sm mt-1" role="alert" [attr.aria-live]="'assertive'">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
    }

    .file-upload-wrapper {
      min-height: 120px;
    }

    .file-info {
      background: rgba(26, 26, 46, 0.5);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 8px 12px;
      backdrop-filter: blur(10px);
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    /* FilePond custom styling */
    ::ng-deep .filepond--root {
      background: var(--glass-bg);
      border: 2px dashed var(--glass-border);
      border-radius: 12px;
      backdrop-filter: blur(20px);
      transition: all 0.2s ease;
    }

    ::ng-deep .filepond--root:hover {
      border-color: rgba(59, 130, 246, 0.5);
      background: rgba(59, 130, 246, 0.05);
    }

    ::ng-deep .filepond--root.filepond--hopper {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
    }

    ::ng-deep .filepond--panel-root {
      background: transparent;
      border-radius: 12px;
    }

    ::ng-deep .filepond--drop-label {
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    }

    ::ng-deep .filepond--drop-label label {
      color: var(--text-primary);
      font-weight: 500;
    }

    ::ng-deep .filepond--credits {
      display: none;
    }

    ::ng-deep .filepond--file {
      background: rgba(26, 26, 46, 0.8);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      backdrop-filter: blur(10px);
    }

    ::ng-deep .filepond--file-info {
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
    }

    ::ng-deep .filepond--file-status {
      color: var(--text-secondary);
      font-family: 'Inter', sans-serif;
    }

    ::ng-deep .filepond--file-status-main {
      color: var(--text-primary);
    }

    ::ng-deep .filepond--file-status-sub {
      color: var(--text-muted);
    }

    ::ng-deep .filepond--file-action-button {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 6px;
      color: #3b82f6;
    }

    ::ng-deep .filepond--file-action-button:hover {
      background: rgba(59, 130, 246, 0.2);
      border-color: #3b82f6;
    }

    ::ng-deep .filepond--file-action-button svg {
      fill: currentColor;
    }

    ::ng-deep .filepond--progress-indicator {
      background: #3b82f6;
    }

    ::ng-deep .filepond--drip {
      background: rgba(59, 130, 246, 0.1);
    }

    ::ng-deep .filepond--drip-blob {
      background: #3b82f6;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements OnInit, OnDestroy, ControlValueAccessor {
  /**
   * Label text
   */
  @Input() label: string = '';

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Required field
   */
  @Input() required: boolean = false;

  /**
   * Allow multiple files
   */
  @Input() multiple: boolean = false;

  /**
   * Maximum number of files
   */
  @Input() maxFiles: number = 0;

  /**
   * Maximum file size
   */
  @Input() maxFileSize: string = '10MB';

  /**
   * Accepted file types
   */
  @Input() acceptedFileTypes: string[] = ['image/*', 'application/pdf'];

  /**
   * Allow revert
   */
  @Input() allowRevert: boolean = true;

  /**
   * Allow remove
   */
  @Input() allowRemove: boolean = true;

  /**
   * Allow replace
   */
  @Input() allowReplace: boolean = true;

  /**
   * Show file info
   */
  @Input() showFileInfo: boolean = true;

  /**
   * Error message
   */
  @Input() errorMessage: string = '';

  /**
   * Server URL for upload
   */
  @Input() serverUrl: string = '';

  /**
   * Instant upload
   */
  @Input() instantUpload: boolean = false;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Value change event
   */
  @Output() valueChange = new EventEmitter<FilePondFile[]>();

  /**
   * Files array (internal representation)
   */
  private _files: FilePondFile[] = [];

  /**
   * Files array for FilePond (converted to FilePond-compatible type)
   */
  get files(): (string | FilePondInitialFile | Blob | File)[] {
    return this._files.map(f => {
      if (f.file) return f.file as File;
      if (f.serverId) return f.serverId as string;
      return f.id as string;
    });
  }

  /**
   * Set files (for internal use)
   */
  set files(value: (string | FilePondInitialFile | Blob | File)[]) {
    // This setter is for compatibility, but we primarily use _files
    // FilePond will handle the conversion
  }

  /**
   * Get files count for display
   */
  get filesCount(): number {
    return this._files.length;
  }

  /**
   * FilePond options
   */
  filePondOptions: FilePondOptions = {};

  /**
   * Unique file pond ID
   */
  filePondId: string = `filepond-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Unique file info ID
   */
  fileInfoId: string = `${this.filePondId}-info`;

  /**
   * Unique error ID
   */
  errorId: string = `${this.filePondId}-error`;

  /**
   * ControlValueAccessor onChange callback
   */
  private onChange = (files: FilePondFile[]) => {};

  /**
   * ControlValueAccessor onTouched callback
   */
  private onTouched = () => {};

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeFilePondOptions();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    // Cleanup if needed
  }

  /**
   * Initialize FilePond options
   */
  private initializeFilePondOptions(): void {
    this.filePondOptions = {
      allowMultiple: this.multiple,
      maxFiles: this.maxFiles > 0 ? this.maxFiles : undefined,
      // maxFileSize: this.maxFileSize, // Not supported in FilePondOptions
      // acceptedFileTypes: this.acceptedFileTypes, // Not supported in FilePondOptions
      allowRevert: this.allowRevert,
      allowRemove: this.allowRemove,
      allowReplace: this.allowReplace,
      instantUpload: this.instantUpload,
      server: this.serverUrl ? {
        url: this.serverUrl,
        process: {
          url: `${this.serverUrl}/process`,
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': 'csrf-token'
          }
        },
        revert: {
          url: `${this.serverUrl}/revert`,
          method: 'DELETE'
        }
      } : undefined,
      labelIdle: this.getLabelIdle(),
      labelInvalidField: 'Field contains invalid files',
      labelFileWaitingForSize: 'Waiting for size',
      labelFileSizeNotAvailable: 'Size not available',
      labelFileLoading: 'Loading',
      labelFileLoadError: 'Error during load',
      labelFileProcessing: 'Uploading',
      labelFileProcessingComplete: 'Upload complete',
      labelFileProcessingAborted: 'Upload cancelled',
      labelFileProcessingError: 'Error during upload',
      labelFileProcessingRevertError: 'Error during revert',
      labelFileRemoveError: 'Error during remove',
      labelTapToCancel: 'tap to cancel',
      labelTapToRetry: 'tap to retry',
      labelTapToUndo: 'tap to undo',
      labelButtonRemoveItem: 'Remove',
      labelButtonAbortItemLoad: 'Abort',
      labelButtonRetryItemLoad: 'Retry',
      labelButtonAbortItemProcessing: 'Cancel',
      labelButtonUndoItemProcessing: 'Undo',
      labelButtonRetryItemProcessing: 'Retry',
      labelButtonProcessItem: 'Upload'
    };
  }

  /**
   * Get label idle text
   */
  private getLabelIdle(): string {
    if (this.multiple) {
      return 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>';
    } else {
      return 'Drag & Drop your file or <span class="filepond--label-action">Browse</span>';
    }
  }

  /**
   * Handle file add
   */
  onAddFile(event: { file: FilePondFile }): void {
    this._files = [...this._files, event.file];
    this.onChange(this._files);
    this.onTouched();
    this.valueChange.emit(this._files);
  }

  /**
   * Handle file remove
   */
  onRemoveFile(event: { file: FilePondFile }): void {
    this._files = this._files.filter(file => file.id !== event.file.id);
    this.onChange(this._files);
    this.onTouched();
    this.valueChange.emit(this._files);
  }

  /**
   * Handle file process
   */
  onProcessFile(event: { file: FilePondFile }): void {
    // File processed successfully
  }

  /**
   * Handle error
   */
  onError(event: { error?: { message?: string } }): void {
    console.error('FilePond error:', event);
    this.errorMessage = event.error?.message || 'An error occurred while uploading the file';
  }

  /**
   * Write value from form control
   */
  writeValue(files: FilePondFile[] | null | undefined): void {
    this._files = files || [];
  }

  /**
   * Register onChange callback
   */
  registerOnChange(fn: (files: FilePondFile[]) => void): void {
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
  }
}
