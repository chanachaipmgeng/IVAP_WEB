import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective {
    private templateRef = inject(TemplateRef<any>);
    private viewContainer = inject(ViewContainerRef);
    private authService = inject(AuthService);

    private permissions: string[] = [];
    private isHidden = true;

    constructor() {
        // React to user changes
        effect(() => {
            const user = this.authService.currentUser();
            this.updateView();
        });
    }

    @Input()
    set appHasPermission(val: string | string[]) {
        this.permissions = Array.isArray(val) ? val : [val];
        this.updateView();
    }

    private updateView() {
        if (this.checkPermission()) {
            if (this.isHidden) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.isHidden = false;
            }
        } else {
            this.isHidden = true;
            this.viewContainer.clear();
        }
    }

    private checkPermission(): boolean {
        // If no permissions required, show
        if (!this.permissions || this.permissions.length === 0) {
            return true;
        }

        // Super admin bypass
        if (this.authService.isSuperAdmin() || this.authService.isAdminSystem()) {
            return true;
        }

        // Check if user has ANY of the required permissions
        return this.permissions.some(perm => this.authService.hasPermission(perm));
    }
}
