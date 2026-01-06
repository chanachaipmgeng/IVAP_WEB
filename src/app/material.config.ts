import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const materialConfig = {
  animations: provideAnimations(),
  toastr: provideToastr({
    timeOut: 3000,
    positionClass: 'toast-bottom-right',
    preventDuplicates: true,
    progressBar: true,
    closeButton: true,
    enableHtml: true,
    newestOnTop: true,
    tapToDismiss: true,
    maxOpened: 5,
    autoDismiss: true,
    iconClasses: {
      error: 'toast-error',
      info: 'toast-info',
      success: 'toast-success',
      warning: 'toast-warning'
    }
  })
};

