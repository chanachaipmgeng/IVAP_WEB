import { Routes } from '@angular/router';
import { authGuard, superAdminGuard, companyAdminGuard } from './core/guards/auth.guard';
// import { permissionGuard } from './core/guards/permission.guard';

const DEMO_ROUTES: Routes = [
    {
      path: 'ui-kit',
      loadComponent: () => import('./features/portal/demo-group/component-showcase/component-showcase.component')
        .then(m => m.ComponentShowcaseComponent),
      title: 'UI Kit & Component Showcase'
    },
    {
      path: 'map-demo',
      loadComponent: () => import('./features/portal/demo-group/map-demo/map-demo.component')
        .then(m => m.MapDemoComponent)
    },
    {
      path: 'face-recognition-demo',
      loadComponent: () => import('./features/portal/face-recognition/face-recognition-demo/face-recognition-demo.component')
        .then(m => m.FaceRecognitionDemoComponent)
    },
    {
      path: 'face-recognition-live',
      loadComponent: () => import('./features/portal/face-recognition/face-recognition-live/face-recognition-live.component')
        .then(m => m.FaceRecognitionLiveComponent)
    },
    {
      path: 'timestamp-demo',
      loadComponent: () => import('./features/portal/demo-group/timestamp-demo/timestamp-demo.component')
        .then(m => m.TimestampDemoComponent)
    },
    {
      path: 'mobile-demo',
      loadComponent: () => import('./features/portal/demo-group/mobile-demo/mobile-demo.component')
        .then(m => m.MobileDemoComponent)
    },
    {
      path: 'echarts-demo',
      loadComponent: () => import('./features/portal/demo-group/echarts-demo/echarts-demo.component')
        .then(m => m.EChartsDemoComponent)
    },
    {
      path: 'rating-demo',
      loadComponent: () => import('./features/portal/demo-group/rating-demo/rating-demo.component')
        .then(m => m.RatingDemoComponent)
    },
    {
      path: 'validation-demo',
      loadComponent: () => import('./features/portal/demo-group/validation-demo/validation-demo.component')
        .then(m => m.ValidationDemoComponent)
    },
    {
      path: 'notification-demo',
      loadComponent: () => import('./features/portal/demo-group/notification-demo/notification-demo.component')
        .then(m => m.NotificationDemoComponent)
    },
    {
      path: 'calendar-demo',
      loadComponent: () => import('./features/portal/demo-group/calendar-demo/calendar-demo.component')
        .then(m => m.CalendarDemoComponent)
    },
    {
      path: 'timeline-demo',
      loadComponent: () => import('./features/portal/demo-group/timeline-demo/timeline-demo.component')
        .then(m => m.TimelineDemoComponent)
    },
    {
      path: 'advanced-ui-demo',
      loadComponent: () => import('./features/portal/demo-group/advanced-ui-demo/advanced-ui-demo.component')
        .then(m => m.AdvancedUiDemoComponent)
    },
    {
      path: 'accordion-demo',
      loadComponent: () => import('./features/portal/demo-group/accordion-demo/accordion-demo.component')
        .then(m => m.AccordionDemoComponent)
    },
    {
      path: 'draggable-cards-demo',
      loadComponent: () => import('./features/portal/demo-group/draggable-cards-demo/draggable-cards-demo.component')
        .then(m => m.DraggableCardsDemoComponent)
    },
    {
      path: 'swiper-gallery-demo',
      loadComponent: () => import('./features/portal/demo-group/swiper-gallery-demo/swiper-gallery-demo.component')
        .then(m => m.SwiperGalleryDemoComponent)
    },
    {
      path: 'offcanvas-demo',
      loadComponent: () => import('./features/portal/demo-group/offcanvas-demo/offcanvas-demo.component')
        .then(m => m.OffcanvasDemoComponent)
    },
    {
      path: 'rich-text-editor-demo',
      loadComponent: () => import('./features/portal/demo-group/rich-text-editor-demo/rich-text-editor-demo.component')
        .then(m => m.RichTextEditorDemoComponent)
    },
    {
      path: 'advanced-data-table-demo',
      loadComponent: () => import('./features/portal/demo-group/advanced-data-table-demo/advanced-data-table-demo.component')
        .then(m => m.AdvancedDataTableDemoComponent)
    },
    {
      path: 'gallery-demo',
      loadComponent: () => import('./features/portal/demo-group/gallery-demo/gallery-demo.component')
        .then(m => m.GalleryDemoComponent)
    }
  ];

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
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'mfa-setup',
        loadComponent: () => import('./features/portal/mfa-setup/mfa-setup.component')
          .then(m => m.MfaSetupComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password/:token',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      },
      {
        path: '',
        loadComponent: () => import('./features/portal/portal-layout/portal-layout.component')
          .then(m => m.PortalLayoutComponent),
        canActivate: [authGuard],
        children: [
          // --- Company Management ---
          { path: 'company-dashboard', loadComponent: () => import('./features/portal/dashboard/dashboard.component').then(m => m.DashboardComponent) },
          { path: 'company-holidays', loadComponent: () => import('./features/portal/company-management/company-holidays/company-holidays.component').then(m => m.CompanyHolidaysComponent) },
          { path: 'company-documents', loadComponent: () => import('./features/portal/company-management/company-documents/company-documents.component').then(m => m.CompanyDocumentsComponent) },
          { path: 'announcements', loadComponent: () => import('./features/portal/company-management/notifications/notifications.component').then(m => m.NotificationsComponent) },
          { path: 'company-reports', loadComponent: () => import('./features/portal/company-management/reports/reports.component').then(m => m.ReportsComponent) },

          // --- Face Recognition ---
          { path: 'watchlist', loadComponent: () => import('./features/portal/face-recognition/watchlist/watchlist.component').then(m => m.WatchlistComponent) },
          { path: 'recognition-history', loadComponent: () => import('./features/portal/face-recognition/recognition-history/recognition-history.component').then(m => m.RecognitionHistoryComponent) },

          // --- Event Management ---
          { path: 'event-dashboard', loadComponent: () => import('./features/portal/event-management/events/event-analytics/event-analytics.component').then(m => m.EventAnalyticsComponent) },
          { path: 'event-forms', loadComponent: () => import('./features/portal/event-management/events/event-registration-fields/event-registration-fields.component').then(m => m.EventRegistrationFieldsComponent) },
          { path: 'event-kiosk-config', loadComponent: () => import('./features/portal/event-management/events/event-kiosk-config/event-kiosk-config.component').then(m => m.EventKioskConfigComponent) },

          // --- Video Analytics ---
          { path: 'video-playback', loadComponent: () => import('./features/portal/video-analytics-group/video-playback/video-playback.component').then(m => m.VideoPlaybackComponent) },
          { path: 'zone-config', loadComponent: () => import('./features/portal/video-analytics-group/zone-config/zone-config.component').then(m => m.ZoneConfigComponent) },
          { path: 'heatmap-analytics', loadComponent: () => import('./features/portal/video-analytics-group/heatmap-analytics/heatmap-analytics.component').then(m => m.HeatmapAnalyticsComponent) },
          { path: 'incident-reports', loadComponent: () => import('./features/portal/smart-surveillance/incident-reports/incident-reports.component').then(m => m.IncidentReportsComponent) },

          // --- Access Control ---
          { path: 'access-dashboard', loadComponent: () => import('./features/portal/access-control-group/access-control/access-control.component').then(m => m.AccessControlComponent) },
          { path: 'access-groups', loadComponent: () => import('./features/portal/access-control-group/access-groups/access-groups.component').then(m => m.AccessGroupsComponent) },
          { path: 'access-schedules', loadComponent: () => import('./features/portal/access-control-group/access-schedules/access-schedules.component').then(m => m.AccessSchedulesComponent) },
          { path: 'access-logs', loadComponent: () => import('./features/portal/access-control-group/access-logs/access-logs.component').then(m => m.AccessLogsComponent) },

          // --- Attendance ---
          { path: 'attendance-dashboard', loadComponent: () => import('./features/portal/attendance-group/attendance/attendance.component').then(m => m.AttendanceComponent) },
          { path: 'timesheets', loadComponent: () => import('./features/portal/attendance-group/timesheets/timesheets.component').then(m => m.TimesheetsComponent) },
          { path: 'overtime-requests', loadComponent: () => import('./features/portal/attendance-group/overtime-requests/overtime-requests.component').then(m => m.OvertimeRequestsComponent) },
          { path: 'attendance-reports', loadComponent: () => import('./features/portal/attendance-group/payroll-export/payroll-export.component').then(m => m.PayrollExportComponent) },

          // --- Visitor Management ---
          { path: 'visitor-dashboard', loadComponent: () => import('./features/portal/visitor-management/visitor-dashboard/visitor-dashboard.component').then(m => m.VisitorDashboardComponent) },
          { path: 'visitor-blacklist', loadComponent: () => import('./features/portal/visitor-management/visitor-blacklist/visitor-blacklist.component').then(m => m.VisitorBlacklistComponent) },
          { path: 'visitor-reports', loadComponent: () => import('./features/portal/visitor-management/visitor-reports/visitor-reports.component').then(m => m.VisitorReportsComponent) },
          { path: 'visitor-parcels', loadComponent: () => import('./features/portal/visitor-management/visitor-parcels/visitor-parcels.component').then(m => m.VisitorParcelsComponent) },

          // --- Vehicle & Parking ---
          { path: 'parking-dashboard', loadComponent: () => import('./features/portal/vehicle-parking/parking-dashboard/parking-dashboard.component').then(m => m.ParkingDashboardComponent) },
          { path: 'parking-rules', loadComponent: () => import('./features/portal/vehicle-parking/parking-rules/parking-rules.component').then(m => m.ParkingRulesComponent) },
          { path: 'parking-logs', loadComponent: () => import('./features/portal/vehicle-parking/parking-logs/parking-logs.component').then(m => m.ParkingLogsComponent) },
          { path: 'parking-blacklist', loadComponent: () => import('./features/portal/vehicle-parking/parking-blacklist/parking-blacklist.component').then(m => m.ParkingBlacklistComponent) },

          // --- Smart Surveillance ---
          { path: 'surveillance-map', loadComponent: () => import('./features/portal/smart-surveillance/surveillance-map/surveillance-map.component').then(m => m.SurveillanceMapComponent) },
          { path: 'alert-history', loadComponent: () => import('./features/portal/smart-surveillance/alert-history/alert-history.component').then(m => m.AlertHistoryComponent) },

          // --- System Management ---
          { path: 'system-users', loadComponent: () => import('./features/portal/company-management/employees/employees.component').then(m => m.EmployeesComponent) },
          { path: 'audit-logs', loadComponent: () => import('./features/super-admin/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent) }, // Using super admin component if possible
          { path: 'system-settings', loadComponent: () => import('./features/super-admin/system-settings/system-settings.component').then(m => m.SystemSettingsComponent) }, // Using super admin component if possible

          {
            path: 'dashboard',
            loadComponent: () => import('./features/portal/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
          },
          {
            path: 'profile',
            loadComponent: () => import('./features/portal/company-management/profile/profile.component')
              .then(m => m.ProfileComponent)
          },
          {
            path: 'employees',
            loadComponent: () => import('./features/portal/company-management/employees/employees.component')
              .then(m => m.EmployeesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'employee.view' }
          },
          {
            path: 'visitors',
            loadComponent: () => import('./features/portal/visitor-management/visitors/visitors.component')
              .then(m => m.VisitorsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'visitor.view' }
          },
          {
            path: 'visitor-invitations',
            loadComponent: () => import('./features/portal/visitor-management/visitor-invitations/visitor-invitations.component')
              .then(m => m.VisitorInvitationsComponent)
          },
          {
            path: 'visitor-badges',
            loadComponent: () => import('./features/portal/visitor-management/visitor-badges/visitor-badges.component')
              .then(m => m.VisitorBadgesComponent)
          },
          {
            path: 'guests',
            loadComponent: () => import('./features/portal/visitor-management/guests/guests.component')
              .then(m => m.GuestsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'guest.view' }
          },
          {
            path: 'structure',
            loadComponent: () => import('./features/portal/company-management/structure/structure.component')
              .then(m => m.StructureComponent)
          },
          {
            path: 'departments',
            loadComponent: () => import('./features/portal/company-management/departments/departments.component')
              .then(m => m.DepartmentsComponent)
          },
          {
            path: 'positions',
            loadComponent: () => import('./features/portal/company-management/positions/positions.component')
              .then(m => m.PositionsComponent)
          },
          {
            path: 'config/shifts',
            loadComponent: () => import('./features/portal/attendance-group/shifts/shifts.component')
              .then(m => m.ShiftsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'shift.view' }
          },
          {
            path: 'config',
            loadComponent: () => import('./features/portal/attendance-group/shifts/shifts.component')
              .then(m => m.ShiftsComponent)
          },
          {
            path: 'access-control',
            loadComponent: () => import('./features/portal/access-control-group/access-control/access-control.component')
              .then(m => m.AccessControlComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'door.view' }
          },
          {
            path: 'access-control/doors',
            loadComponent: () => import('./features/portal/access-control-group/doors/doors.component')
              .then(m => m.DoorsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'door.view' }
          },
          {
            path: 'vehicles',
            loadComponent: () => import('./features/portal/vehicle-parking/vehicles/vehicles.component')
              .then(m => m.VehiclesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'vehicle.view' }
          },
          {
            path: 'parking-spots',
            loadComponent: () => import('./features/portal/vehicle-parking/parking-spots/parking-spots.component')
              .then(m => m.ParkingSpotsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'parking.view' }
          },
          {
            path: 'parking-reservation',
            loadComponent: () => import('./features/portal/vehicle-parking/parking-reservation/parking-reservation.component')
              .then(m => m.ParkingReservationComponent)
          },
          {
            path: 'parking-entry',
            loadComponent: () => import('./features/portal/vehicle-parking/parking-entry/parking-entry.component')
              .then(m => m.ParkingEntryComponent)
          },
          {
            path: 'parking-exit',
            loadComponent: () => import('./features/portal/vehicle-parking/parking-exit/parking-exit.component')
              .then(m => m.ParkingExitComponent)
          },
          {
            path: 'parking-statistics',
            loadComponent: () => import('./features/portal/vehicle-parking/parking-statistics/parking-statistics.component')
              .then(m => m.ParkingStatisticsComponent)
          },
          {
            path: 'devices',
            loadComponent: () => import('./features/portal/system-management/devices/devices.component')
              .then(m => m.DevicesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'device.view' }
          },
          {
            path: 'attendance',
            loadComponent: () => import('./features/portal/attendance-group/attendance/attendance.component')
              .then(m => m.AttendanceComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'attendance.view' }
          },
          {
            path: 'monitoring',
            loadComponent: () => import('./features/portal/video-analytics-group/monitoring/monitoring.component')
              .then(m => m.MonitoringComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'monitoring.view' }
          },
          {
            path: 'video-analytics',
            loadComponent: () => import('./features/portal/video-analytics-group/video-analytics/video-analytics.component')
              .then(m => m.VideoAnalyticsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'analytics.view' }
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/portal/company-management/notifications/notifications.component')
              .then(m => m.NotificationsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'notification.view' }
          },
          {
            path: 'events',
            loadComponent: () => import('./features/portal/event-management/events/events.component')
              .then(m => m.EventsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'event.view' }
          },
          {
            path: 'events/analytics',
            loadComponent: () => import('./features/portal/event-management/events/event-analytics/event-analytics.component')
              .then(m => m.EventAnalyticsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'event.view' }
          },
          {
            path: 'events/:eventId/checkin-history',
            loadComponent: () => import('./features/portal/event-management/events/event-checkin-history/event-checkin-history.component')
              .then(m => m.EventCheckinHistoryComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'event.view' }
          },
          {
            path: 'locations',
            loadComponent: () => import('./features/portal/company-management/locations/locations.component')
              .then(m => m.LocationsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'location.view' }
          },
          {
            path: 'leaves',
            loadComponent: () => import('./features/portal/attendance-group/leaves/leaves.component')
              .then(m => m.LeavesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'leave.view' }
          },
          {
            path: 'qr-codes',
            loadComponent: () => import('./features/portal/access-control-group/qr-codes/qr-codes.component')
              .then(m => m.QRCodesComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'qrcode.view' }
          },
          {
            path: 'biometric-data',
            loadComponent: () => import('./features/portal/face-recognition/biometric-data/biometric-data.component')
              .then(m => m.BiometricDataComponent)
          },
          {
            path: 'rfid-cards',
            loadComponent: () => import('./features/portal/access-control-group/rfid-cards/rfid-cards.component')
              .then(m => m.RFIDCardsComponent)
          },
          {
            path: 'ai-models',
            loadComponent: () => import('./features/portal/face-recognition/ai-models/ai-models.component')
              .then(m => m.AIModelsComponent)
          },
          {
            path: 'alerts',
            loadComponent: () => import('./features/portal/smart-surveillance/alerts/alerts.component')
              .then(m => m.AlertsComponent)
          },
          {
            path: 'template-management',
            loadComponent: () => import('./features/portal/system-management/template-management/template-management.component')
              .then(m => m.TemplateManagementComponent)
          },
          {
            path: 'reports',
            loadComponent: () => import('./features/portal/company-management/reports/reports.component')
              .then(m => m.ReportsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'report.view' }
          },
          {
            path: 'advanced-forms',
            loadComponent: () => import('./features/portal/demo-group/advanced-forms/advanced-forms.component')
              .then(m => m.AdvancedFormsComponent),
            // canActivate: [permissionGuard],
            // data: { permission: 'form.view' }
          },
          {
            path: 'hr-dashboard',
            loadComponent: () => import('./features/portal/demo-group/hr-dashboard/hr-dashboard.component')
              .then(m => m.HrDashboardComponent)
          },
          {
            path: 'advanced-features',
            loadComponent: () => import('./features/portal/demo-group/advanced-features-dashboard/advanced-features-dashboard.component')
              .then(m => m.AdvancedFeaturesDashboardComponent)
          },
          {
            path: 'performance-dashboard',
            loadComponent: () => import('./features/portal/demo-group/performance-dashboard/performance-dashboard.component')
              .then(m => m.PerformanceDashboardComponent)
          },
          {
            path: 'accessibility-dashboard',
            loadComponent: () => import('./features/portal/demo-group/accessibility-dashboard/accessibility-dashboard.component')
              .then(m => m.AccessibilityDashboardComponent)
          },
          {
            path: 'help-center',
            loadComponent: () => import('./features/portal/demo-group/help-center/help-center.component')
              .then(m => m.HelpCenterComponent)
          },
          {
            path: 'safety-dashboard',
            loadComponent: () => import('./features/portal/demo-group/safety-dashboard/safety-dashboard.component')
              .then(m => m.SafetyDashboardComponent)
          },
          {
            path: 'hardware-status-dashboard',
            loadComponent: () => import('./features/portal/system-management/hardware-status-dashboard/hardware-status-dashboard.component')
              .then(m => m.HardwareStatusDashboardComponent)
          },
          {
            path: 'face-recognition-live',
            loadComponent: () => import('./features/portal/face-recognition/face-recognition-live/face-recognition-live.component')
              .then(m => m.FaceRecognitionLiveComponent)
          },
          {
            path: 'face-recognition-test',
            loadComponent: () => import('./features/portal/face-recognition/face-recognition-test/face-recognition-test.component')
              .then(m => m.FaceRecognitionTestComponent)
          },
          // Demo routes (development only)
          ...DEMO_ROUTES,
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
        loadComponent: () => import('./features/auth/login/login.component')
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
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/super-admin/dashboard/super-admin-dashboard.component')
              .then(m => m.SuperAdminDashboardComponent)
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
            path: 'reports',
            loadComponent: () => import('./features/super-admin/reports/super-admin-reports.component')
              .then(m => m.SuperAdminReportsComponent)
          },
          {
            path: 'announcements',
            loadComponent: () => import('./features/super-admin/announcements/super-admin-announcements.component')
              .then(m => m.SuperAdminAnnouncementsComponent)
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
