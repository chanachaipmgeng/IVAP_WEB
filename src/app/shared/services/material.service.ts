import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { MaterialDialogComponent, DialogData } from '../components/material-dialog/material-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  // Dialog methods
  showDialog(data: DialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(MaterialDialogComponent, {
      data,
      width: '500px',
      maxWidth: '90vw',
      disableClose: data.type === 'confirm',
      panelClass: 'gemini-dialog'
    });
    return dialogRef.afterClosed();
  }

  showInfo(title: string, message: string): Observable<boolean> {
    return this.showDialog({
      title,
      message,
      type: 'info',
      icon: 'info'
    });
  }

  showWarning(title: string, message: string): Observable<boolean> {
    return this.showDialog({
      title,
      message,
      type: 'warning',
      icon: 'warning'
    });
  }

  showError(title: string, message: string): Observable<boolean> {
    return this.showDialog({
      title,
      message,
      type: 'error',
      icon: 'error'
    });
  }

  showSuccess(title: string, message: string): Observable<boolean> {
    return this.showDialog({
      title,
      message,
      type: 'success',
      icon: 'check_circle'
    });
  }

  showConfirm(title: string, message: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Observable<boolean> {
    return this.showDialog({
      title,
      message,
      type: 'confirm',
      icon: 'help',
      confirmText,
      cancelText,
      showCancel: true
    });
  }

  // Snackbar methods
  showSnackbar(message: string, action: string = 'Close', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: 'gemini-snackbar',
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  showSuccessSnackbar(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: 'gemini-snackbar gemini-snackbar-success',
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  showErrorSnackbar(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 5000,
      panelClass: 'gemini-snackbar gemini-snackbar-error',
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  showWarningSnackbar(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 4000,
      panelClass: 'gemini-snackbar gemini-snackbar-warning',
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }

  showInfoSnackbar(message: string, action: string = 'Close'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      panelClass: 'gemini-snackbar gemini-snackbar-info',
      horizontalPosition: 'right',
      verticalPosition: 'bottom'
    });
  }
}







