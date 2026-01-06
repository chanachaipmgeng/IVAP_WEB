import { Injectable, signal } from '@angular/core';
import { extractErrorMessage } from '../utils/response-handler';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errors = signal<ErrorMessage[]>([]);
  public errors$ = this.errors.asReadonly();

  /**
   * Show error message
   */
  showError(message: string, duration: number = 5000, action?: { label: string; handler: () => void }): string {
    return this.addMessage({
      id: this.generateId(),
      message,
      type: 'error',
      duration,
      action
    });
  }

  /**
   * Show warning message
   */
  showWarning(message: string, duration: number = 4000, action?: { label: string; handler: () => void }): string {
    return this.addMessage({
      id: this.generateId(),
      message,
      type: 'warning',
      duration,
      action
    });
  }

  /**
   * Show info message
   */
  showInfo(message: string, duration: number = 3000, action?: { label: string; handler: () => void }): string {
    return this.addMessage({
      id: this.generateId(),
      message,
      type: 'info',
      duration,
      action
    });
  }

  /**
   * Show success message
   */
  showSuccess(message: string, duration: number = 3000, action?: { label: string; handler: () => void }): string {
    return this.addMessage({
      id: this.generateId(),
      message,
      type: 'success',
      duration,
      action
    });
  }

  /**
   * Handle API error
   */
  handleApiError(error: any): string {
    let message = 'เกิดข้อผิดพลาดในการดำเนินการ';

    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.error?.detail) {
      message = error.error.detail;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Handle specific error codes
    if (error?.status === 401) {
      message = 'กรุณาเข้าสู่ระบบใหม่';
    } else if (error?.status === 403) {
      message = 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
    } else if (error?.status === 404) {
      message = 'ไม่พบข้อมูลที่ต้องการ';
    } else if (error?.status === 409) {
      message = 'ข้อมูลซ้ำกันในระบบ';
    } else if (error?.status === 422) {
      message = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    } else if (error?.status === 500) {
      message = 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่ภายหลัง';
    } else if (error?.status === 0) {
      message = 'ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }

    return this.showError(message);
  }

  /**
   * Remove error message
   */
  removeError(id: string): void {
    this.errors.set(this.errors().filter(e => e.id !== id));
  }

  /**
   * Clear all errors
   */
  clearAll(): void {
    this.errors.set([]);
  }

  /**
   * Get current errors
   */
  getErrors(): ErrorMessage[] {
    return this.errors();
  }

  /**
   * Extract error message from error object
   */
  getErrorMessage(error: any): string {
    return extractErrorMessage(error);
  }

  private addMessage(message: ErrorMessage): string {
    this.errors.set([...this.errors(), message]);

    // Auto remove after duration
    if (message.duration && message.duration > 0) {
      setTimeout(() => {
        this.removeError(message.id);
      }, message.duration);
    }

    return message.id;
  }

  private generateId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

