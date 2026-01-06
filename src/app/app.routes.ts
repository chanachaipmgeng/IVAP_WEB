import { Routes } from '@angular/router';
import { authGuard, superAdminGuard, companyAdminGuard } from './core/guards/auth.guard';
// import { permissionGuard } from './core/guards/permission.guard';
import { getDemoRoutes } from './demo.routes';

export const routes: Routes = [
  // Landing Page
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component')
      .then(m => m.LandingComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/landing/landing.component')
      .then(m => m.LandingComponent)
  },

  // Register Route
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },

  // Public Routes
  {
    path: 'events/register/:publicUrl',
    loadComponent: () => import('./features/public/event-registration/event-registration.component')
      .then(m => m.EventRegistrationComponent)
  },
  {
    path: 'events/register/:publicUrl/confirm',
    loadComponent: () => import('./features/public/event-email-confirmation/event-email-confirmation.component')
      .then(m => m.EventEmailConfirmationComponent)
  },
  {
    path: 'verify/public/:templateId',
    loadComponent: () => import('./features/public/public-verification/public-verification.component')
      .then(m => m.PublicVerificationComponent)
  },

  // Kiosk Routes
  {
    path: 'kiosk/:deviceId',
    loadComponent: () => import('./features/kiosk/kiosk-view/kiosk-view.component')
      .then(m => m.KioskViewComponent)
  },

  // Portal Routes (Company Admin)
  {
    path: 'portal',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/portal/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'mfa-setup',
        loadComponent: () => import('./features/portal/mfa-setup/mfa-setup.component')
          .then(m => m.MfaSetupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/portal/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password/:token',
        loadComponent: () => import('./features/portal/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        loadComponent: () => import('./features/portal/portal-layout/portal-layout.component')
          .then(m => m.PortalLayoutComponent),
        canActivate: [authGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./features/portal/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
          },
          {
            path: 'profile',
            loadComponent: () => import('./features/portal/profile/profile.component')
              .then(m => m.ProfileComponent)
          },
          {
            path: 'employees',
            loadComponent: () => import('./features/portal/employees/employees.component')
              .then(m => m.EmployeesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'employee.view' }
          },
          {
            path: 'visitors',
            loadComponent: () => import('./features/portal/visitors/visitors.component')
              .then(m => m.VisitorsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'visitor.view' }
          },
          {
            path: 'guests',
            loadComponent: () => import('./features/portal/guests/guests.component')
              .then(m => m.GuestsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'guest.view' }
          },
          {
            path: 'structure',
            loadComponent: () => import('./features/portal/structure/structure.component')
              .then(m => m.StructureComponent)
          },
          {
            path: 'departments',
            loadComponent: () => import('./features/portal/departments/departments.component')
              .then(m => m.DepartmentsComponent)
          },
          {
            path: 'positions',
            loadComponent: () => import('./features/portal/positions/positions.component')
              .then(m => m.PositionsComponent)
          },
          {
            path: 'config/shifts',
            loadComponent: () => import('./features/portal/shifts/shifts.component')
              .then(m => m.ShiftsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'shift.view' }
          },
          {
            path: 'config',
            loadComponent: () => import('./features/portal/shifts/shifts.component')
              .then(m => m.ShiftsComponent)
          },
          {
            path: 'access-control',
            loadComponent: () => import('./features/portal/access-control/access-control.component')
              .then(m => m.AccessControlComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'door.view' }
          },
          {
            path: 'access-control/doors',
            loadComponent: () => import('./features/portal/doors/doors.component')
              .then(m => m.DoorsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'door.view' }
          },
          {
            path: 'vehicles',
            loadComponent: () => import('./features/portal/vehicles/vehicles.component')
              .then(m => m.VehiclesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'vehicle.view' }
          },
          {
            path: 'parking-spots',
            loadComponent: () => import('./features/portal/parking-spots/parking-spots.component')
              .then(m => m.ParkingSpotsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'parking.view' }
          },
          {
            path: 'devices',
            loadComponent: () => import('./features/portal/devices/devices.component')
              .then(m => m.DevicesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'device.view' }
          },
          {
            path: 'attendance',
            loadComponent: () => import('./features/portal/attendance/attendance.component')
              .then(m => m.AttendanceComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'attendance.view' }
          },
          {
            path: 'monitoring',
            loadComponent: () => import('./features/portal/monitoring/monitoring.component')
              .then(m => m.MonitoringComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'monitoring.view' }
          },
          {
            path: 'video-analytics',
            loadComponent: () => import('./features/portal/video-analytics/video-analytics.component')
              .then(m => m.VideoAnalyticsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'analytics.view' }
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/portal/notifications/notifications.component')
              .then(m => m.NotificationsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'notification.view' }
          },
          {
            path: 'events',
            loadComponent: () => import('./features/portal/events/events.component')
              .then(m => m.EventsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'event.view' }
          },
          {
            path: 'events/analytics',
            loadComponent: () => import('./features/portal/events/event-analytics/event-analytics.component')
              .then(m => m.EventAnalyticsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'event.view' }
          },
          {
            path: 'events/:eventId/checkin-history',
            loadComponent: () => import('./features/portal/events/event-checkin-history/event-checkin-history.component')
              .then(m => m.EventCheckinHistoryComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'event.view' }
          },
          {
            path: 'locations',
            loadComponent: () => import('./features/portal/locations/locations.component')
              .then(m => m.LocationsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'location.view' }
          },
          {
            path: 'leaves',
            loadComponent: () => import('./features/portal/leaves/leaves.component')
              .then(m => m.LeavesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'leave.view' }
          },
          {
            path: 'qr-codes',
            loadComponent: () => import('./features/portal/qr-codes/qr-codes.component')
              .then(m => m.QRCodesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'qrcode.view' }
          },
          {
            path: 'biometric-data',
            loadComponent: () => import('./features/portal/biometric-data/biometric-data.component')
              .then(m => m.BiometricDataComponent)
          },
          {
            path: 'rfid-cards',
            loadComponent: () => import('./features/portal/rfid-cards/rfid-cards.component')
              .then(m => m.RFIDCardsComponent)
          },
          {
            path: 'ai-models',
            loadComponent: () => import('./features/portal/ai-models/ai-models.component')
              .then(m => m.AIModelsComponent)
          },
          {
            path: 'alerts',
            loadComponent: () => import('./features/portal/alerts/alerts.component')
              .then(m => m.AlertsComponent)
          },
          {
            path: 'template-management',
            loadComponent: () => import('./features/portal/template-management/template-management.component')
              .then(m => m.TemplateManagementComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('./features/portal/reports/reports.component')
              .then(m => m.ReportsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'report.view' }
          },
          {
            path: 'advanced-forms',
            loadComponent: () => import('./features/portal/advanced-forms/advanced-forms.component')
              .then(m => m.AdvancedFormsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'form.view' }
          },
          {
            path: 'hr-dashboard',
            loadComponent: () => import('./features/portal/hr-dashboard/hr-dashboard.component')
              .then(m => m.HrDashboardComponent)
          },
          {
            path: 'advanced-features',
            loadComponent: () => import('./features/portal/advanced-features-dashboard/advanced-features-dashboard.component')
              .then(m => m.AdvancedFeaturesDashboardComponent)
          },
          {
            path: 'performance-dashboard',
            loadComponent: () => import('./features/portal/performance-dashboard/performance-dashboard.component')
              .then(m => m.PerformanceDashboardComponent)
          },
          {
            path: 'accessibility-dashboard',
            loadComponent: () => import('./features/portal/accessibility-dashboard/accessibility-dashboard.component')
              .then(m => m.AccessibilityDashboardComponent)
          },
          {
            path: 'help-center',
            loadComponent: () => import('./features/portal/help-center/help-center.component')
              .then(m => m.HelpCenterComponent)
          },
          {
            path: 'safety-dashboard',
            loadComponent: () => import('./features/portal/safety-dashboard/safety-dashboard.component')
              .then(m => m.SafetyDashboardComponent)
          },
          {
            path: 'hardware-status-dashboard',
            loadComponent: () => import('./features/portal/hardware-status-dashboard/hardware-status-dashboard.component')
              .then(m => m.HardwareStatusDashboardComponent)
          },
          {
            path: 'face-recognition-live',
            loadComponent: () => import('./features/portal/face-recognition-live/face-recognition-live.component')
              .then(m => m.FaceRecognitionLiveComponent)
          },
          // Demo routes (development only)
          ...getDemoRoutes(),
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },

  // Super Admin Routes
  {
    path: 'super',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/portal/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: '',
        loadComponent: () => import('./features/super-admin/super-admin-layout/super-admin-layout.component')
          .then(m => m.SuperAdminLayoutComponent),
        canActivate: [superAdminGuard],
        children: [
          {
            path: '',
            redirectTo: 'companies',
            pathMatch: 'full'
          },
          {
            path: 'companies',
            loadComponent: () => import('./features/super-admin/companies/companies.component')
              .then(m => m.CompaniesComponent)
          },
          {
            path: 'rbac',
            loadComponent: () => import('./features/super-admin/rbac/rbac.component')
              .then(m => m.RbacComponent)
          },
          {
            path: 'permissions',
            loadComponent: () => import('./features/super-admin/rbac/rbac.component')
              .then(m => m.RbacComponent)
          },
          {
            path: 'users',
            loadComponent: () => import('./features/super-admin/users/users.component')
              .then(m => m.UsersComponent)
          },
          {
            path: 'settings',
            loadComponent: () => import('./features/super-admin/system-settings/system-settings.component')
              .then(m => m.SystemSettingsComponent)
          },
          {
            path: 'audit-logs',
            loadComponent: () => import('./features/super-admin/audit-logs/audit-logs.component')
              .then(m => m.AuditLogsComponent)
          },
          {
            path: 'backup-restore',
            loadComponent: () => import('./features/super-admin/backup-restore/backup-restore.component')
              .then(m => m.BackupRestoreComponent)
          },
          {
            path: 'license',
            loadComponent: () => import('./features/super-admin/license-management/license-management.component')
              .then(m => m.LicenseManagementComponent)
          },
          {
            path: 'maintenance',
            loadComponent: () => import('./features/super-admin/maintenance/maintenance.component')
              .then(m => m.MaintenanceComponent)
          },
          {
            path: 'module-subscription',
            loadComponent: () => import('./features/super-admin/module-subscription/module-subscription.component')
              .then(m => m.ModuleSubscriptionComponent)
          },
          {
            path: '',
            redirectTo: 'companies',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },

  // Error Pages
  {
    path: 'error/401',
    loadComponent: () => import('./shared/components/error-pages/error-401/error-401.component')
      .then(m => m.Error401Component)
  },
  {
    path: 'error/404',
    loadComponent: () => import('./shared/components/error-pages/error-404/error-404.component')
      .then(m => m.Error404Component)
  },
  {
    path: 'error/500',
    loadComponent: () => import('./shared/components/error-pages/error-500/error-500.component')
      .then(m => m.Error500Component)
  },
  {
    path: 'maintenance',
    loadComponent: () => import('./shared/components/error-pages/maintenance/maintenance.component')
      .then(m => m.MaintenanceComponent)
  },
  {
    path: 'coming-soon',
    loadComponent: () => import('./shared/components/error-pages/coming-soon/coming-soon.component')
      .then(m => m.ComingSoonComponent)
  },

  // Test API route
  {
    path: 'test-api',
    loadComponent: () => import('./features/test-api/test-api.component').then(m => m.TestApiComponent),
    title: 'API Test'
  },

  // 404 - Not Found
  {
    path: '**',
    redirectTo: ''
  }
];
