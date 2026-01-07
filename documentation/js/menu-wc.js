'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">frontend documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AccessControlComponent.html" data-type="entity-link" >AccessControlComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccessGroupsComponent.html" data-type="entity-link" >AccessGroupsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccessibilityDashboardComponent.html" data-type="entity-link" >AccessibilityDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccessLogsComponent.html" data-type="entity-link" >AccessLogsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccessSchedulesComponent.html" data-type="entity-link" >AccessSchedulesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccordionComponent.html" data-type="entity-link" >AccordionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AccordionDemoComponent.html" data-type="entity-link" >AccordionDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdvancedDataTableComponent.html" data-type="entity-link" class="deprecated-name">AdvancedDataTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdvancedDataTableDemoComponent.html" data-type="entity-link" >AdvancedDataTableDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdvancedFeaturesDashboardComponent.html" data-type="entity-link" >AdvancedFeaturesDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdvancedFormsComponent.html" data-type="entity-link" >AdvancedFormsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdvancedRichTextComponent.html" data-type="entity-link" >AdvancedRichTextComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdvancedUiDemoComponent.html" data-type="entity-link" >AdvancedUiDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AIModelsComponent.html" data-type="entity-link" >AIModelsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlertComponent.html" data-type="entity-link" >AlertComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlertHistoryComponent.html" data-type="entity-link" >AlertHistoryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AlertsComponent.html" data-type="entity-link" >AlertsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ApexChartComponent.html" data-type="entity-link" >ApexChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/AttendanceComponent.html" data-type="entity-link" >AttendanceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuditLogsComponent.html" data-type="entity-link" >AuditLogsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AvatarComponent.html" data-type="entity-link" >AvatarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BackupRestoreComponent.html" data-type="entity-link" >BackupRestoreComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BadgeComponent.html" data-type="entity-link" >BadgeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BaseComponent.html" data-type="entity-link" >BaseComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BiometricDataComponent.html" data-type="entity-link" >BiometricDataComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BreadcrumbComponent.html" data-type="entity-link" >BreadcrumbComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarComponent.html" data-type="entity-link" >CalendarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CalendarDemoComponent.html" data-type="entity-link" >CalendarDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ChartComponent.html" data-type="entity-link" >ChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CheckboxComponent.html" data-type="entity-link" >CheckboxComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ColorPickerComponent.html" data-type="entity-link" >ColorPickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ComingSoonComponent.html" data-type="entity-link" >ComingSoonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompaniesComponent.html" data-type="entity-link" >CompaniesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyDocumentsComponent.html" data-type="entity-link" >CompanyDocumentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CompanyHolidaysComponent.html" data-type="entity-link" >CompanyHolidaysComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ComponentShowcaseComponent.html" data-type="entity-link" >ComponentShowcaseComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DataTableComponent.html" data-type="entity-link" >DataTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DateTimePickerComponent.html" data-type="entity-link" >DateTimePickerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DepartmentsComponent.html" data-type="entity-link" >DepartmentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DevicesComponent.html" data-type="entity-link" >DevicesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DividerComponent.html" data-type="entity-link" >DividerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DocumentationComponent.html" data-type="entity-link" >DocumentationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DoorsComponent.html" data-type="entity-link" >DoorsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DraggableCardsComponent.html" data-type="entity-link" >DraggableCardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DraggableCardsDemoComponent.html" data-type="entity-link" >DraggableCardsDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EChartsChartComponent.html" data-type="entity-link" >EChartsChartComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EChartsDemoComponent.html" data-type="entity-link" >EChartsDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmployeesComponent.html" data-type="entity-link" >EmployeesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmployeesNewComponent.html" data-type="entity-link" >EmployeesNewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EmptyStateComponent.html" data-type="entity-link" >EmptyStateComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Error401Component.html" data-type="entity-link" >Error401Component</a>
                            </li>
                            <li class="link">
                                <a href="components/Error404Component.html" data-type="entity-link" >Error404Component</a>
                            </li>
                            <li class="link">
                                <a href="components/Error500Component.html" data-type="entity-link" >Error500Component</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorMessageComponent.html" data-type="entity-link" >ErrorMessageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ErrorToastComponent.html" data-type="entity-link" >ErrorToastComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventAnalyticsComponent.html" data-type="entity-link" >EventAnalyticsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventCheckinHistoryComponent.html" data-type="entity-link" >EventCheckinHistoryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventEmailConfirmationComponent.html" data-type="entity-link" >EventEmailConfirmationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventKioskConfigComponent.html" data-type="entity-link" >EventKioskConfigComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventRegistrationComponent.html" data-type="entity-link" >EventRegistrationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventRegistrationFieldsComponent.html" data-type="entity-link" >EventRegistrationFieldsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EventsComponent.html" data-type="entity-link" >EventsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FaceRecognitionComponent.html" data-type="entity-link" >FaceRecognitionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FaceRecognitionDemoComponent.html" data-type="entity-link" >FaceRecognitionDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FaceRecognitionLiveComponent.html" data-type="entity-link" >FaceRecognitionLiveComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FaceRecognitionTestComponent.html" data-type="entity-link" >FaceRecognitionTestComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FaqComponent.html" data-type="entity-link" >FaqComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FileUploadComponent.html" data-type="entity-link" >FileUploadComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FilterSectionComponent.html" data-type="entity-link" >FilterSectionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ForgotPasswordComponent.html" data-type="entity-link" >ForgotPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FormFieldComponent.html" data-type="entity-link" >FormFieldComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GalleryComponent.html" data-type="entity-link" >GalleryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GalleryDemoComponent.html" data-type="entity-link" >GalleryDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlassButtonComponent.html" data-type="entity-link" >GlassButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlassCardComponent.html" data-type="entity-link" >GlassCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GlassInputComponent.html" data-type="entity-link" >GlassInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GroupFaceRecognitionComponent.html" data-type="entity-link" >GroupFaceRecognitionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GuestsComponent.html" data-type="entity-link" >GuestsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HardwareStatusDashboardComponent.html" data-type="entity-link" >HardwareStatusDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeatmapAnalyticsComponent.html" data-type="entity-link" >HeatmapAnalyticsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HelpCenter.html" data-type="entity-link" >HelpCenter</a>
                            </li>
                            <li class="link">
                                <a href="components/HelpCenterComponent.html" data-type="entity-link" >HelpCenterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HrDashboardComponent.html" data-type="entity-link" >HrDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/IconComponent.html" data-type="entity-link" >IconComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/IncidentReportsComponent.html" data-type="entity-link" >IncidentReportsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/KioskViewComponent.html" data-type="entity-link" >KioskViewComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LandingComponent.html" data-type="entity-link" >LandingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LeafletMapComponent.html" data-type="entity-link" >LeafletMapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LeavesComponent.html" data-type="entity-link" >LeavesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LicenseManagementComponent.html" data-type="entity-link" >LicenseManagementComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingComponent.html" data-type="entity-link" >LoadingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingStateComponent.html" data-type="entity-link" >LoadingStateComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LocationsComponent.html" data-type="entity-link" >LocationsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LockScreenComponent.html" data-type="entity-link" >LockScreenComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginComponent.html" data-type="entity-link" >LoginComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaintenanceComponent.html" data-type="entity-link" >MaintenanceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaintenanceComponent-1.html" data-type="entity-link" >MaintenanceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapComponent.html" data-type="entity-link" >MapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MapDemoComponent.html" data-type="entity-link" >MapDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialButtonComponent.html" data-type="entity-link" >MaterialButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialCardComponent.html" data-type="entity-link" >MaterialCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialDialogComponent.html" data-type="entity-link" >MaterialDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialInputComponent.html" data-type="entity-link" >MaterialInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MaterialTableComponent.html" data-type="entity-link" >MaterialTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MfaSetupComponent.html" data-type="entity-link" >MfaSetupComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MobileCameraComponent.html" data-type="entity-link" >MobileCameraComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MobileDemoComponent.html" data-type="entity-link" >MobileDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModalComponent.html" data-type="entity-link" >ModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModalFormComponent.html" data-type="entity-link" >ModalFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModuleSubscriptionComponent.html" data-type="entity-link" >ModuleSubscriptionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MonitoringComponent.html" data-type="entity-link" >MonitoringComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationCenterComponent.html" data-type="entity-link" >NotificationCenterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationDemoComponent.html" data-type="entity-link" >NotificationDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationsComponent.html" data-type="entity-link" >NotificationsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationSettingsComponent.html" data-type="entity-link" >NotificationSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OffcanvasComponent.html" data-type="entity-link" >OffcanvasComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OffcanvasDemoComponent.html" data-type="entity-link" >OffcanvasDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OvertimeRequestsComponent.html" data-type="entity-link" >OvertimeRequestsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageLayoutComponent.html" data-type="entity-link" >PageLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PaginationComponent.html" data-type="entity-link" >PaginationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingBlacklistComponent.html" data-type="entity-link" >ParkingBlacklistComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingDashboardComponent.html" data-type="entity-link" >ParkingDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingEntryComponent.html" data-type="entity-link" >ParkingEntryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingExitComponent.html" data-type="entity-link" >ParkingExitComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingLogsComponent.html" data-type="entity-link" >ParkingLogsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingReservationComponent.html" data-type="entity-link" >ParkingReservationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingRulesComponent.html" data-type="entity-link" >ParkingRulesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingSpotsComponent.html" data-type="entity-link" >ParkingSpotsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ParkingStatisticsComponent.html" data-type="entity-link" >ParkingStatisticsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PayrollExportComponent.html" data-type="entity-link" >PayrollExportComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PerformanceDashboardComponent.html" data-type="entity-link" >PerformanceDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PopoverComponent.html" data-type="entity-link" >PopoverComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PortalLayoutComponent.html" data-type="entity-link" >PortalLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PositionsComponent.html" data-type="entity-link" >PositionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfileComponent.html" data-type="entity-link" >ProfileComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ProgressBarComponent.html" data-type="entity-link" >ProgressBarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PublicVerificationComponent.html" data-type="entity-link" >PublicVerificationComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/QRCodesComponent.html" data-type="entity-link" >QRCodesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RadioComponent.html" data-type="entity-link" >RadioComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RangeSliderComponent.html" data-type="entity-link" >RangeSliderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RatingComponent.html" data-type="entity-link" >RatingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RatingDemoComponent.html" data-type="entity-link" >RatingDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RbacComponent.html" data-type="entity-link" >RbacComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RecognitionHistoryComponent.html" data-type="entity-link" >RecognitionHistoryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterComponent.html" data-type="entity-link" >RegisterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportsComponent.html" data-type="entity-link" >ReportsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ResetPasswordComponent-1.html" data-type="entity-link" >ResetPasswordComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RFIDCardsComponent.html" data-type="entity-link" >RFIDCardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RichTextComponent.html" data-type="entity-link" >RichTextComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RichTextEditorComponent.html" data-type="entity-link" >RichTextEditorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RichTextEditorDemoComponent.html" data-type="entity-link" >RichTextEditorDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SafetyDashboardComponent.html" data-type="entity-link" >SafetyDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchInputComponent.html" data-type="entity-link" >SearchInputComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ShiftsComponent.html" data-type="entity-link" >ShiftsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SidebarComponent.html" data-type="entity-link" >SidebarComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SkeletonComponent.html" data-type="entity-link" >SkeletonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatisticsCardComponent.html" data-type="entity-link" >StatisticsCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatisticsGridComponent.html" data-type="entity-link" >StatisticsGridComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StepperComponent.html" data-type="entity-link" >StepperComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StructureComponent.html" data-type="entity-link" >StructureComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuperAdminAnnouncementsComponent.html" data-type="entity-link" >SuperAdminAnnouncementsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuperAdminDashboardComponent.html" data-type="entity-link" >SuperAdminDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuperAdminLayoutComponent.html" data-type="entity-link" >SuperAdminLayoutComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SuperAdminReportsComponent.html" data-type="entity-link" >SuperAdminReportsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SurveillanceMapComponent.html" data-type="entity-link" >SurveillanceMapComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SwiperGalleryComponent.html" data-type="entity-link" >SwiperGalleryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SwiperGalleryDemoComponent.html" data-type="entity-link" >SwiperGalleryDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SwitchComponent.html" data-type="entity-link" >SwitchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SystemSettingsComponent.html" data-type="entity-link" >SystemSettingsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TabsComponent.html" data-type="entity-link" >TabsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TemplateManagementComponent.html" data-type="entity-link" >TemplateManagementComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TestApiComponent.html" data-type="entity-link" >TestApiComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ThemeSwitcherComponent.html" data-type="entity-link" >ThemeSwitcherComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimelineComponent.html" data-type="entity-link" >TimelineComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimelineDemoComponent.html" data-type="entity-link" >TimelineDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimesheetsComponent.html" data-type="entity-link" >TimesheetsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimestampComponent.html" data-type="entity-link" >TimestampComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TimestampDemoComponent.html" data-type="entity-link" >TimestampDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TooltipComponent.html" data-type="entity-link" >TooltipComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UsersComponent.html" data-type="entity-link" >UsersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ValidationDemoComponent.html" data-type="entity-link" >ValidationDemoComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VehiclesComponent.html" data-type="entity-link" >VehiclesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VideoAnalyticsComponent.html" data-type="entity-link" >VideoAnalyticsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VideoPlaybackComponent.html" data-type="entity-link" >VideoPlaybackComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorBadgesComponent.html" data-type="entity-link" >VisitorBadgesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorBlacklistComponent.html" data-type="entity-link" >VisitorBlacklistComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorDashboardComponent.html" data-type="entity-link" >VisitorDashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorInvitationsComponent.html" data-type="entity-link" >VisitorInvitationsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorParcelsComponent.html" data-type="entity-link" >VisitorParcelsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorReportsComponent.html" data-type="entity-link" >VisitorReportsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VisitorsComponent.html" data-type="entity-link" >VisitorsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WatchlistComponent.html" data-type="entity-link" >WatchlistComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ZoneConfigComponent.html" data-type="entity-link" >ZoneConfigComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/HasPermissionDirective.html" data-type="entity-link" >HasPermissionDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/ImageOptimizationDirective.html" data-type="entity-link" >ImageOptimizationDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CustomTranslateLoader.html" data-type="entity-link" >CustomTranslateLoader</a>
                            </li>
                            <li class="link">
                                <a href="classes/CustomValidators.html" data-type="entity-link" >CustomValidators</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AccessControlService.html" data-type="entity-link" >AccessControlService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AccessibilityService.html" data-type="entity-link" >AccessibilityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AdvancedReportsService.html" data-type="entity-link" >AdvancedReportsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AIModelManagementService.html" data-type="entity-link" >AIModelManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AIModelService.html" data-type="entity-link" >AIModelService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AiSecurityService.html" data-type="entity-link" >AiSecurityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AlertService.html" data-type="entity-link" >AlertService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiService.html" data-type="entity-link" >ApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApprovalService.html" data-type="entity-link" >ApprovalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuditLoggingService.html" data-type="entity-link" >AuditLoggingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuditService.html" data-type="entity-link" >AuditService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BackupService.html" data-type="entity-link" >BackupService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BaseCrudService.html" data-type="entity-link" >BaseCrudService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BiometricDataService.html" data-type="entity-link" >BiometricDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CalendarService.html" data-type="entity-link" >CalendarService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CameraIntegrationService.html" data-type="entity-link" >CameraIntegrationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyEmployeeService.html" data-type="entity-link" >CompanyEmployeeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyLocationService.html" data-type="entity-link" >CompanyLocationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyService.html" data-type="entity-link" >CompanyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DatabaseOptimizationService.html" data-type="entity-link" >DatabaseOptimizationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataEncryptionService.html" data-type="entity-link" >DataEncryptionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DepartmentService.html" data-type="entity-link" >DepartmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeploymentPreparationService.html" data-type="entity-link" >DeploymentPreparationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeviceConfigurationService.html" data-type="entity-link" >DeviceConfigurationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeviceService.html" data-type="entity-link" >DeviceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DocumentationCompletionService.html" data-type="entity-link" >DocumentationCompletionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DoorService.html" data-type="entity-link" >DoorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EnvironmentMonitoringService.html" data-type="entity-link" >EnvironmentMonitoringService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EquipmentMonitoringService.html" data-type="entity-link" >EquipmentMonitoringService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ErrorHandlerService.html" data-type="entity-link" >ErrorHandlerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EventService.html" data-type="entity-link" >EventService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExportService.html" data-type="entity-link" >ExportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FaceApiService.html" data-type="entity-link" >FaceApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FaceDetectionService.html" data-type="entity-link" >FaceDetectionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FaceService.html" data-type="entity-link" >FaceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileUploadService.html" data-type="entity-link" >FileUploadService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GuestAdminService.html" data-type="entity-link" >GuestAdminService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GuestService.html" data-type="entity-link" >GuestService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HardwareDeviceManagementService.html" data-type="entity-link" >HardwareDeviceManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/I18nService.html" data-type="entity-link" >I18nService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/KioskService.html" data-type="entity-link" >KioskService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LandingService.html" data-type="entity-link" >LandingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LeaveService.html" data-type="entity-link" >LeaveService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LicenseService.html" data-type="entity-link" >LicenseService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LocationService.html" data-type="entity-link" >LocationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MaintenanceService.html" data-type="entity-link" >MaintenanceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MaterialService.html" data-type="entity-link" >MaterialService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MemberService.html" data-type="entity-link" >MemberService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MobileCameraService.html" data-type="entity-link" >MobileCameraService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModuleSubscriptionService.html" data-type="entity-link" >ModuleSubscriptionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MultiFactorVerificationService.html" data-type="entity-link" >MultiFactorVerificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MultiTenantService.html" data-type="entity-link" >MultiTenantService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NativeBridgeService.html" data-type="entity-link" >NativeBridgeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationApiService.html" data-type="entity-link" >NotificationApiService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationService.html" data-type="entity-link" >NotificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OfflineSupportService.html" data-type="entity-link" >OfflineSupportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ParkingService.html" data-type="entity-link" >ParkingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PerformanceService.html" data-type="entity-link" >PerformanceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PerformanceTestingService.html" data-type="entity-link" >PerformanceTestingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PerformanceUtils.html" data-type="entity-link" >PerformanceUtils</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PortalService.html" data-type="entity-link" >PortalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PositionService.html" data-type="entity-link" >PositionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductionReadinessService.html" data-type="entity-link" >ProductionReadinessService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PublicService.html" data-type="entity-link" >PublicService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PushNotificationsService.html" data-type="entity-link" >PushNotificationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/QRCodeService.html" data-type="entity-link" >QRCodeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RbacService.html" data-type="entity-link" >RbacService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RealTimeHardwareMonitoringService.html" data-type="entity-link" >RealTimeHardwareMonitoringService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportService.html" data-type="entity-link" >ReportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RFIDCardService.html" data-type="entity-link" >RFIDCardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RoleBasedMenuService.html" data-type="entity-link" >RoleBasedMenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SecurityTestingService.html" data-type="entity-link" >SecurityTestingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ShiftService.html" data-type="entity-link" >ShiftService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SubordinateManagementService.html" data-type="entity-link" >SubordinateManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemConfigurationService.html" data-type="entity-link" >SystemConfigurationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemIntegrationTestingService.html" data-type="entity-link" >SystemIntegrationTestingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemService.html" data-type="entity-link" >SystemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TemplateManagementService.html" data-type="entity-link" >TemplateManagementService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemeService.html" data-type="entity-link" >ThemeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TimestampService.html" data-type="entity-link" >TimestampService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserAcceptanceTestingService.html" data-type="entity-link" >UserAcceptanceTestingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ValidationService.html" data-type="entity-link" >ValidationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VehicleService.html" data-type="entity-link" >VehicleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VideoAnalyticsService.html" data-type="entity-link" >VideoAnalyticsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VisitorExtendedService.html" data-type="entity-link" >VisitorExtendedService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VisitorService.html" data-type="entity-link" >VisitorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/WorkerSafetyService.html" data-type="entity-link" >WorkerSafetyService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AccessEvent.html" data-type="entity-link" >AccessEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessException.html" data-type="entity-link" >AccessException</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessGroup.html" data-type="entity-link" >AccessGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessibilityFeatures.html" data-type="entity-link" >AccessibilityFeatures</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessibilitySettings.html" data-type="entity-link" >AccessibilitySettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessLog.html" data-type="entity-link" >AccessLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessMethod.html" data-type="entity-link" >AccessMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessMetrics.html" data-type="entity-link" >AccessMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessPermission.html" data-type="entity-link" >AccessPermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessPoint.html" data-type="entity-link" >AccessPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessRule.html" data-type="entity-link" >AccessRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccessSchedule.html" data-type="entity-link" >AccessSchedule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccordionConfig.html" data-type="entity-link" >AccordionConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AccordionItem.html" data-type="entity-link" >AccordionItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Activity.html" data-type="entity-link" >Activity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActivityLog.html" data-type="entity-link" >ActivityLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AddFaceResponse.html" data-type="entity-link" >AddFaceResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AIModel.html" data-type="entity-link" >AIModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AIModel-1.html" data-type="entity-link" >AIModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Alert.html" data-type="entity-link" >Alert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Alert-1.html" data-type="entity-link" >Alert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlertAction.html" data-type="entity-link" >AlertAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlertConfig.html" data-type="entity-link" >AlertConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlertDashboard.html" data-type="entity-link" >AlertDashboard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlertStatistics.html" data-type="entity-link" >AlertStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlertTestRequest.html" data-type="entity-link" >AlertTestRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AlertTestResponse.html" data-type="entity-link" >AlertTestResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyticsData.html" data-type="entity-link" >AnalyticsData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyticsEvent.html" data-type="entity-link" >AnalyticsEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyticsRule.html" data-type="entity-link" >AnalyticsRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyticsStats.html" data-type="entity-link" >AnalyticsStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnalyticsTask.html" data-type="entity-link" >AnalyticsTask</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnimationSettings.html" data-type="entity-link" >AnimationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiResponse.html" data-type="entity-link" >ApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApiResponse-1.html" data-type="entity-link" >ApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApprovalFilter.html" data-type="entity-link" >ApprovalFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApprovalRequest.html" data-type="entity-link" >ApprovalRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApprovalStats.html" data-type="entity-link" >ApprovalStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApprovalStep.html" data-type="entity-link" >ApprovalStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApprovalWorkflow.html" data-type="entity-link" >ApprovalWorkflow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Attendance.html" data-type="entity-link" >Attendance</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttendanceByDateItem.html" data-type="entity-link" >AttendanceByDateItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttendanceReport.html" data-type="entity-link" >AttendanceReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttendanceReport-1.html" data-type="entity-link" >AttendanceReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttendanceReportFilters.html" data-type="entity-link" >AttendanceReportFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttendanceReportRow.html" data-type="entity-link" >AttendanceReportRow</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AttendanceSummaryResponse.html" data-type="entity-link" >AttendanceSummaryResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditConfig.html" data-type="entity-link" >AuditConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditFilter.html" data-type="entity-link" >AuditFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditFilters.html" data-type="entity-link" >AuditFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditLog.html" data-type="entity-link" >AuditLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditLog-1.html" data-type="entity-link" >AuditLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditMetrics.html" data-type="entity-link" >AuditMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditPolicy.html" data-type="entity-link" >AuditPolicy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditReport.html" data-type="entity-link" >AuditReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditRule.html" data-type="entity-link" >AuditRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuditStatistics.html" data-type="entity-link" >AuditStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthenticationConfig.html" data-type="entity-link" >AuthenticationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthorizationConfig.html" data-type="entity-link" >AuthorizationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AutoScalingConfig.html" data-type="entity-link" >AutoScalingConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendPerformanceMetrics.html" data-type="entity-link" >BackendPerformanceMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackendPerformanceMetrics-1.html" data-type="entity-link" >BackendPerformanceMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Backup.html" data-type="entity-link" >Backup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackupConfig.html" data-type="entity-link" >BackupConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackupForm.html" data-type="entity-link" >BackupForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BackupStatistics.html" data-type="entity-link" >BackupStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseModel.html" data-type="entity-link" >BaseModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BaseTimestamps.html" data-type="entity-link" >BaseTimestamps</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricData.html" data-type="entity-link" >BiometricData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricData-1.html" data-type="entity-link" >BiometricData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricOptions.html" data-type="entity-link" >BiometricOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricResult.html" data-type="entity-link" >BiometricResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricStatistics.html" data-type="entity-link" >BiometricStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricTypesResponse.html" data-type="entity-link" >BiometricTypesResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricVerifyRequest.html" data-type="entity-link" >BiometricVerifyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BiometricVerifyResponse.html" data-type="entity-link" >BiometricVerifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BlacklistEntry.html" data-type="entity-link" >BlacklistEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BreadcrumbItem.html" data-type="entity-link" >BreadcrumbItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BreadcrumbItem-1.html" data-type="entity-link" >BreadcrumbItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkAlertAction.html" data-type="entity-link" >BulkAlertAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkNotificationItem.html" data-type="entity-link" >BulkNotificationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkNotificationItem-1.html" data-type="entity-link" >BulkNotificationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkNotificationRequest.html" data-type="entity-link" >BulkNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkNotificationRequest-1.html" data-type="entity-link" >BulkNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BulkNotificationResponse.html" data-type="entity-link" >BulkNotificationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CacheConfig.html" data-type="entity-link" >CacheConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CalendarEventMeta.html" data-type="entity-link" >CalendarEventMeta</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Camera.html" data-type="entity-link" >Camera</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraCapabilities.html" data-type="entity-link" >CameraCapabilities</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraDevice.html" data-type="entity-link" >CameraDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraDevice-1.html" data-type="entity-link" >CameraDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraError.html" data-type="entity-link" >CameraError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraEvent.html" data-type="entity-link" >CameraEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraOptions.html" data-type="entity-link" >CameraOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraSettings.html" data-type="entity-link" >CameraSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraSettings-1.html" data-type="entity-link" >CameraSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraState.html" data-type="entity-link" >CameraState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraStatus.html" data-type="entity-link" >CameraStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CameraStream.html" data-type="entity-link" >CameraStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartData.html" data-type="entity-link" >ChartData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartData-1.html" data-type="entity-link" >ChartData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CheckFaceEmployeeResponse.html" data-type="entity-link" >CheckFaceEmployeeResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CheckInRecord.html" data-type="entity-link" >CheckInRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Color.html" data-type="entity-link" >Color</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColorPalette.html" data-type="entity-link" >ColorPalette</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColorScheme.html" data-type="entity-link" >ColorScheme</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ColorVariant.html" data-type="entity-link" >ColorVariant</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Company.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyCreate.html" data-type="entity-link" >CompanyCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyEmployee.html" data-type="entity-link" >CompanyEmployee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyEmployeeCreate.html" data-type="entity-link" >CompanyEmployeeCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyEmployeeFilters.html" data-type="entity-link" >CompanyEmployeeFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyEmployeeUpdate.html" data-type="entity-link" >CompanyEmployeeUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyFilters.html" data-type="entity-link" >CompanyFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyLocation.html" data-type="entity-link" >CompanyLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyLocationCreate.html" data-type="entity-link" >CompanyLocationCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyLocationFilters.html" data-type="entity-link" >CompanyLocationFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyLocationResponse.html" data-type="entity-link" >CompanyLocationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyLocationUpdate.html" data-type="entity-link" >CompanyLocationUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanySettings.html" data-type="entity-link" >CompanySettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanySettingsUpdate.html" data-type="entity-link" >CompanySettingsUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyStatistics.html" data-type="entity-link" >CompanyStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CompanyUpdate.html" data-type="entity-link" >CompanyUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComplianceConfig.html" data-type="entity-link" >ComplianceConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComplianceGap.html" data-type="entity-link" >ComplianceGap</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComplianceRequirement.html" data-type="entity-link" >ComplianceRequirement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComplianceStatus.html" data-type="entity-link" >ComplianceStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComponentSettings.html" data-type="entity-link" >ComponentSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ComputeConfig.html" data-type="entity-link" >ComputeConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationBackup.html" data-type="entity-link" >ConfigurationBackup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationBackup-1.html" data-type="entity-link" >ConfigurationBackup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationDeployment.html" data-type="entity-link" >ConfigurationDeployment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationGroup.html" data-type="entity-link" >ConfigurationGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationMetrics.html" data-type="entity-link" >ConfigurationMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfigurationTemplate.html" data-type="entity-link" >ConfigurationTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConnectionPoolConfig.html" data-type="entity-link" >ConnectionPoolConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ContactForm.html" data-type="entity-link" >ContactForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateAlertDto.html" data-type="entity-link" >CreateAlertDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateBiometricDataDto.html" data-type="entity-link" >CreateBiometricDataDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateQRCodeDto.html" data-type="entity-link" >CreateQRCodeDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CreateRFIDCardDto.html" data-type="entity-link" >CreateRFIDCardDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Dashboard.html" data-type="entity-link" >Dashboard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardLayout.html" data-type="entity-link" >DashboardLayout</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardStats.html" data-type="entity-link" >DashboardStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardStatsResponse.html" data-type="entity-link" >DashboardStatsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardWidget.html" data-type="entity-link" >DashboardWidget</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatabaseConfig.html" data-type="entity-link" >DatabaseConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatabaseIndex.html" data-type="entity-link" >DatabaseIndex</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DatabaseMetrics.html" data-type="entity-link" >DatabaseMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeleteFaceEncodingResponse.html" data-type="entity-link" >DeleteFaceEncodingResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Department.html" data-type="entity-link" >Department</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentCreate.html" data-type="entity-link" >DepartmentCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentFilters.html" data-type="entity-link" >DepartmentFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentFormData.html" data-type="entity-link" >DepartmentFormData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentInput.html" data-type="entity-link" >DepartmentInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentResponse.html" data-type="entity-link" >DepartmentResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentResponse-1.html" data-type="entity-link" >DepartmentResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentStatistics.html" data-type="entity-link" >DepartmentStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DepartmentUpdate.html" data-type="entity-link" >DepartmentUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentConfiguration.html" data-type="entity-link" >DeploymentConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentEnvironment.html" data-type="entity-link" >DeploymentEnvironment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentIssue.html" data-type="entity-link" >DeploymentIssue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentMetrics.html" data-type="entity-link" >DeploymentMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentPlan.html" data-type="entity-link" >DeploymentPlan</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentReport.html" data-type="entity-link" >DeploymentReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeploymentStep.html" data-type="entity-link" >DeploymentStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetectedFace.html" data-type="entity-link" >DetectedFace</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Detection.html" data-type="entity-link" >Detection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetectionInfo.html" data-type="entity-link" >DetectionInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetectionRequest.html" data-type="entity-link" >DetectionRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetectionResponse.html" data-type="entity-link" >DetectionResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Device.html" data-type="entity-link" >Device</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceAlert.html" data-type="entity-link" >DeviceAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceApiKeyResponse.html" data-type="entity-link" >DeviceApiKeyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceCapabilities.html" data-type="entity-link" >DeviceCapabilities</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceConfiguration.html" data-type="entity-link" >DeviceConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceConfiguration-1.html" data-type="entity-link" >DeviceConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceConfigurationTemplate.html" data-type="entity-link" >DeviceConfigurationTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceCreate.html" data-type="entity-link" >DeviceCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceFilters.html" data-type="entity-link" >DeviceFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceFormData.html" data-type="entity-link" >DeviceFormData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceGroup.html" data-type="entity-link" >DeviceGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceGroupRule.html" data-type="entity-link" >DeviceGroupRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceHealth.html" data-type="entity-link" >DeviceHealth</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceHealthStatus.html" data-type="entity-link" >DeviceHealthStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceInfo.html" data-type="entity-link" >DeviceInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceSettings.html" data-type="entity-link" >DeviceSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DevicesOverview.html" data-type="entity-link" >DevicesOverview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceStats.html" data-type="entity-link" >DeviceStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceStatus.html" data-type="entity-link" >DeviceStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceStatus-1.html" data-type="entity-link" >DeviceStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeviceUpdate.html" data-type="entity-link" >DeviceUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DialogData.html" data-type="entity-link" >DialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocCategory.html" data-type="entity-link" >DocCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocSection.html" data-type="entity-link" >DocSection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationAttachment.html" data-type="entity-link" >DocumentationAttachment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationComment.html" data-type="entity-link" >DocumentationComment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationItem.html" data-type="entity-link" >DocumentationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationReport.html" data-type="entity-link" >DocumentationReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationReportDetail.html" data-type="entity-link" >DocumentationReportDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationReview.html" data-type="entity-link" >DocumentationReview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationSearch.html" data-type="entity-link" >DocumentationSearch</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationSearchResult.html" data-type="entity-link" >DocumentationSearchResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationSection.html" data-type="entity-link" >DocumentationSection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationStructure.html" data-type="entity-link" >DocumentationStructure</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationTemplate.html" data-type="entity-link" >DocumentationTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DocumentationTrend.html" data-type="entity-link" >DocumentationTrend</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Door.html" data-type="entity-link" >Door</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Door-1.html" data-type="entity-link" >Door</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorCreate.html" data-type="entity-link" >DoorCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorFilters.html" data-type="entity-link" >DoorFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorPermission.html" data-type="entity-link" >DoorPermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorPermission-1.html" data-type="entity-link" >DoorPermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorPermissionCreate.html" data-type="entity-link" >DoorPermissionCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorPermissionResponse.html" data-type="entity-link" >DoorPermissionResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorResponse.html" data-type="entity-link" >DoorResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorStatistics.html" data-type="entity-link" >DoorStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DoorUpdate.html" data-type="entity-link" >DoorUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DraggableCard.html" data-type="entity-link" >DraggableCard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DraggableCardsConfig.html" data-type="entity-link" >DraggableCardsConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EChartsData.html" data-type="entity-link" >EChartsData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailConfirmationResponse.html" data-type="entity-link" >EmailConfirmationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailNotificationRequest.html" data-type="entity-link" >EmailNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailNotificationRequest-1.html" data-type="entity-link" >EmailNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Employee.html" data-type="entity-link" >Employee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Employee-1.html" data-type="entity-link" >Employee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Employee-2.html" data-type="entity-link" >Employee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeCreateForm.html" data-type="entity-link" >EmployeeCreateForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeDetail.html" data-type="entity-link" >EmployeeDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeDisplay.html" data-type="entity-link" >EmployeeDisplay</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeFilters.html" data-type="entity-link" >EmployeeFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeHierarchy.html" data-type="entity-link" >EmployeeHierarchy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeListItem.html" data-type="entity-link" >EmployeeListItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeModel.html" data-type="entity-link" >EmployeeModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeStatistics.html" data-type="entity-link" >EmployeeStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestamp.html" data-type="entity-link" >EmployeeTimestamp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestamp-1.html" data-type="entity-link" >EmployeeTimestamp</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestampCreate.html" data-type="entity-link" >EmployeeTimestampCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestampCreate-1.html" data-type="entity-link" >EmployeeTimestampCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestampFilters.html" data-type="entity-link" >EmployeeTimestampFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestampStatusUpdate.html" data-type="entity-link" >EmployeeTimestampStatusUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestampUpdate.html" data-type="entity-link" >EmployeeTimestampUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeTimestampUpdate-1.html" data-type="entity-link" >EmployeeTimestampUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeUpdateForm.html" data-type="entity-link" >EmployeeUpdateForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmptyStateAction.html" data-type="entity-link" >EmptyStateAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EncryptionAudit.html" data-type="entity-link" >EncryptionAudit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EncryptionConfig.html" data-type="entity-link" >EncryptionConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EncryptionKey.html" data-type="entity-link" >EncryptionKey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EncryptionPolicy.html" data-type="entity-link" >EncryptionPolicy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EncryptionResult.html" data-type="entity-link" >EncryptionResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EncryptionRule.html" data-type="entity-link" >EncryptionRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnvironmentAlert.html" data-type="entity-link" >EnvironmentAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnvironmentalHazard.html" data-type="entity-link" >EnvironmentalHazard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnvironmentMetrics.html" data-type="entity-link" >EnvironmentMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnvironmentRule.html" data-type="entity-link" >EnvironmentRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnvironmentSensor.html" data-type="entity-link" >EnvironmentSensor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EnvironmentZone.html" data-type="entity-link" >EnvironmentZone</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Equipment.html" data-type="entity-link" >Equipment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EquipmentAlert.html" data-type="entity-link" >EquipmentAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EquipmentMetrics.html" data-type="entity-link" >EquipmentMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EquipmentRule.html" data-type="entity-link" >EquipmentRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EquipmentZone.html" data-type="entity-link" >EquipmentZone</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorMessage.html" data-type="entity-link" >ErrorMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ErrorMessage-1.html" data-type="entity-link" >ErrorMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Event.html" data-type="entity-link" >Event</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Event-1.html" data-type="entity-link" >Event</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Event-2.html" data-type="entity-link" >Event</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventAttendee.html" data-type="entity-link" >EventAttendee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventAttendee-1.html" data-type="entity-link" >EventAttendee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventAttendeeCreate.html" data-type="entity-link" >EventAttendeeCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventAttendeeResponse.html" data-type="entity-link" >EventAttendeeResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventCreate.html" data-type="entity-link" >EventCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventFilters.html" data-type="entity-link" >EventFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventNotificationRequest.html" data-type="entity-link" >EventNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventQRCodeResponse.html" data-type="entity-link" >EventQRCodeResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventRegistration.html" data-type="entity-link" >EventRegistration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventRegistrationForm.html" data-type="entity-link" >EventRegistrationForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventReminderRequest.html" data-type="entity-link" >EventReminderRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventReminderResponse.html" data-type="entity-link" >EventReminderResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventResponse.html" data-type="entity-link" >EventResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventStatistics.html" data-type="entity-link" >EventStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventStatistics-1.html" data-type="entity-link" >EventStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventStatisticsResponse.html" data-type="entity-link" >EventStatisticsResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventStats.html" data-type="entity-link" >EventStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventUpdate.html" data-type="entity-link" >EventUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExportJob.html" data-type="entity-link" >ExportJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExportRequest.html" data-type="entity-link" >ExportRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExportResponse.html" data-type="entity-link" >ExportResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaceDetectionResult.html" data-type="entity-link" >FaceDetectionResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaceEncodingResponse.html" data-type="entity-link" >FaceEncodingResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaceEnrollmentData.html" data-type="entity-link" >FaceEnrollmentData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaceRecognitionResult.html" data-type="entity-link" >FaceRecognitionResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaqCategory.html" data-type="entity-link" >FaqCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaqItem.html" data-type="entity-link" >FaqItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FaqItem-1.html" data-type="entity-link" >FaqItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Feature.html" data-type="entity-link" >Feature</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FieldStatus.html" data-type="entity-link" >FieldStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FieldValidationConfig.html" data-type="entity-link" >FieldValidationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilePondFile.html" data-type="entity-link" >FilePondFile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterActionButton.html" data-type="entity-link" >FilterActionButton</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FilterField.html" data-type="entity-link" >FilterField</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FirewallConfig.html" data-type="entity-link" >FirewallConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FirewallRule.html" data-type="entity-link" >FirewallRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FormFieldConfig.html" data-type="entity-link" >FormFieldConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GalleryAction.html" data-type="entity-link" >GalleryAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GalleryConfig.html" data-type="entity-link" >GalleryConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GalleryFilter.html" data-type="entity-link" >GalleryFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GalleryItem.html" data-type="entity-link" >GalleryItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GallerySort.html" data-type="entity-link" >GallerySort</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GeofenceEvent.html" data-type="entity-link" >GeofenceEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GeofenceEvent-1.html" data-type="entity-link" >GeofenceEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GeofenceZone.html" data-type="entity-link" >GeofenceZone</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GroupRecognitionResult.html" data-type="entity-link" >GroupRecognitionResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Guest.html" data-type="entity-link" >Guest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Guest-1.html" data-type="entity-link" >Guest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestCheckIn.html" data-type="entity-link" >GuestCheckIn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestCheckOut.html" data-type="entity-link" >GuestCheckOut</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestCreate.html" data-type="entity-link" >GuestCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestFilters.html" data-type="entity-link" >GuestFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestRegistration.html" data-type="entity-link" >GuestRegistration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestRegistrationCreate.html" data-type="entity-link" >GuestRegistrationCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestService.html" data-type="entity-link" >GuestService</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestServiceCreate.html" data-type="entity-link" >GuestServiceCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestStats.html" data-type="entity-link" >GuestStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestSummary.html" data-type="entity-link" >GuestSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GuestUpdate.html" data-type="entity-link" >GuestUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HardwareAlert.html" data-type="entity-link" >HardwareAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HardwareDevice.html" data-type="entity-link" >HardwareDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HardwareMetrics.html" data-type="entity-link" >HardwareMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HardwareToken.html" data-type="entity-link" >HardwareToken</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HealthCheckConfig.html" data-type="entity-link" >HealthCheckConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HelpCategory.html" data-type="entity-link" >HelpCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HttpRequestOptions.html" data-type="entity-link" >HttpRequestOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImageBase64Response.html" data-type="entity-link" >ImageBase64Response</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImageQualityAssessment.html" data-type="entity-link" >ImageQualityAssessment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImageQualityMetrics.html" data-type="entity-link" >ImageQualityMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InfrastructureConfig.html" data-type="entity-link" >InfrastructureConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/KioskDevice.html" data-type="entity-link" >KioskDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LandingFilters.html" data-type="entity-link" >LandingFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LandingPageData.html" data-type="entity-link" >LandingPageData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LayoutSettings.html" data-type="entity-link" >LayoutSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Leave.html" data-type="entity-link" >Leave</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveApproval.html" data-type="entity-link" >LeaveApproval</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveBalance.html" data-type="entity-link" >LeaveBalance</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveBalanceResponse.html" data-type="entity-link" >LeaveBalanceResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveCreate.html" data-type="entity-link" >LeaveCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveFilters.html" data-type="entity-link" >LeaveFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveRejection.html" data-type="entity-link" >LeaveRejection</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveStatistics.html" data-type="entity-link" >LeaveStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LeaveUpdate.html" data-type="entity-link" >LeaveUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/License.html" data-type="entity-link" >License</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LicenseActivationForm.html" data-type="entity-link" >LicenseActivationForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LicenseStatistics.html" data-type="entity-link" >LicenseStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LicenseUpgradeForm.html" data-type="entity-link" >LicenseUpgradeForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LicenseUsage.html" data-type="entity-link" >LicenseUsage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LineNotificationRequest.html" data-type="entity-link" >LineNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LineNotificationRequest-1.html" data-type="entity-link" >LineNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoadBalancerConfig.html" data-type="entity-link" >LoadBalancerConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Location.html" data-type="entity-link" >Location</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationData.html" data-type="entity-link" >LocationData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationOptions.html" data-type="entity-link" >LocationOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationPermission.html" data-type="entity-link" >LocationPermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationSettings.html" data-type="entity-link" >LocationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationSettings-1.html" data-type="entity-link" >LocationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LocationSettings-2.html" data-type="entity-link" >LocationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginCredentials.html" data-type="entity-link" >LoginCredentials</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceFilters.html" data-type="entity-link" >MaintenanceFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceLog.html" data-type="entity-link" >MaintenanceLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceRecord.html" data-type="entity-link" >MaintenanceRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceSchedule.html" data-type="entity-link" >MaintenanceSchedule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceStatistics.html" data-type="entity-link" >MaintenanceStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceTask.html" data-type="entity-link" >MaintenanceTask</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MaintenanceUpdate.html" data-type="entity-link" >MaintenanceUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapMarker.html" data-type="entity-link" >MapMarker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapMarker-1.html" data-type="entity-link" >MapMarker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapOptions.html" data-type="entity-link" >MapOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MapOptions-1.html" data-type="entity-link" >MapOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MappedDevice.html" data-type="entity-link" >MappedDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Member.html" data-type="entity-link" >Member</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberCreate.html" data-type="entity-link" >MemberCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberFilters.html" data-type="entity-link" >MemberFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberInput.html" data-type="entity-link" >MemberInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberResponse.html" data-type="entity-link" >MemberResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberResponse-1.html" data-type="entity-link" >MemberResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberStatistics.html" data-type="entity-link" >MemberStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberSummary.html" data-type="entity-link" >MemberSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MemberUpdate.html" data-type="entity-link" >MemberUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuCondition.html" data-type="entity-link" >MenuCondition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuContext.html" data-type="entity-link" >MenuContext</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem-1.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuMetrics.html" data-type="entity-link" >MenuMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MFAConfig.html" data-type="entity-link" >MFAConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MFASetup.html" data-type="entity-link" >MFASetup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModalConfig.html" data-type="entity-link" >ModalConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelConfiguration.html" data-type="entity-link" >ModelConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelDeployment.html" data-type="entity-link" >ModelDeployment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelDetails.html" data-type="entity-link" >ModelDetails</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelInfo.html" data-type="entity-link" >ModelInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelMetrics.html" data-type="entity-link" >ModelMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModelTrainingJob.html" data-type="entity-link" >ModelTrainingJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Module.html" data-type="entity-link" >Module</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModuleFeature.html" data-type="entity-link" >ModuleFeature</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModuleShortcut.html" data-type="entity-link" >ModuleShortcut</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonitoringAlert.html" data-type="entity-link" >MonitoringAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonitoringConfig.html" data-type="entity-link" >MonitoringConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonitoringConfig-1.html" data-type="entity-link" >MonitoringConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MonitoringDashboard.html" data-type="entity-link" >MonitoringDashboard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MultiTenantConfig.html" data-type="entity-link" >MultiTenantConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NativeCapabilities.html" data-type="entity-link" >NativeCapabilities</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NetworkingConfig.html" data-type="entity-link" >NetworkingConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NetworkInterface.html" data-type="entity-link" >NetworkInterface</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NetworkSecurityConfig.html" data-type="entity-link" >NetworkSecurityConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Notification.html" data-type="entity-link" >Notification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationAction.html" data-type="entity-link" >NotificationAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationChannel.html" data-type="entity-link" >NotificationChannel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationConfig.html" data-type="entity-link" >NotificationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationConfig-1.html" data-type="entity-link" >NotificationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationHistory.html" data-type="entity-link" >NotificationHistory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationListItem.html" data-type="entity-link" >NotificationListItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationPermission.html" data-type="entity-link" >NotificationPermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationResponse.html" data-type="entity-link" >NotificationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationResponse-1.html" data-type="entity-link" >NotificationResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationSettings.html" data-type="entity-link" >NotificationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationSettings-1.html" data-type="entity-link" >NotificationSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationStatusResponse.html" data-type="entity-link" >NotificationStatusResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationTemplate.html" data-type="entity-link" >NotificationTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NotificationTemplate-1.html" data-type="entity-link" >NotificationTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OffcanvasConfig.html" data-type="entity-link" >OffcanvasConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OfflineCheckIn.html" data-type="entity-link" >OfflineCheckIn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OfflineData.html" data-type="entity-link" >OfflineData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OfflineSettings.html" data-type="entity-link" >OfflineSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OptimizationConfig.html" data-type="entity-link" >OptimizationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OptimizationTask.html" data-type="entity-link" >OptimizationTask</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OTRequest.html" data-type="entity-link" >OTRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PageAction.html" data-type="entity-link" >PageAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginatedApiResponse.html" data-type="entity-link" >PaginatedApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginatedResponse.html" data-type="entity-link" >PaginatedResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginatedResponse-1.html" data-type="entity-link" >PaginatedResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginatedResponse-2.html" data-type="entity-link" >PaginatedResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationConfig.html" data-type="entity-link" >PaginationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginationParams.html" data-type="entity-link" >PaginationParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingEvent.html" data-type="entity-link" >ParkingEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingReservation.html" data-type="entity-link" >ParkingReservation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingReservationCreate.html" data-type="entity-link" >ParkingReservationCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingReservationUpdate.html" data-type="entity-link" >ParkingReservationUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingRule.html" data-type="entity-link" >ParkingRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingSpace.html" data-type="entity-link" >ParkingSpace</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingSpaceCreate.html" data-type="entity-link" >ParkingSpaceCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingSpaceUpdate.html" data-type="entity-link" >ParkingSpaceUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingSpot.html" data-type="entity-link" >ParkingSpot</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingSpotAssignment.html" data-type="entity-link" >ParkingSpotAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingSpotCreate.html" data-type="entity-link" >ParkingSpotCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingStatistics.html" data-type="entity-link" >ParkingStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingVehicle.html" data-type="entity-link" >ParkingVehicle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingVehicleCreate.html" data-type="entity-link" >ParkingVehicleCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParkingVehicleUpdate.html" data-type="entity-link" >ParkingVehicleUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PasswordPolicy.html" data-type="entity-link" >PasswordPolicy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PasswordRequirement.html" data-type="entity-link" >PasswordRequirement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PasswordRequirement-1.html" data-type="entity-link" >PasswordRequirement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceAction.html" data-type="entity-link" >PerformanceAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceAnalysis.html" data-type="entity-link" >PerformanceAnalysis</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceChart.html" data-type="entity-link" >PerformanceChart</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceConfiguration.html" data-type="entity-link" >PerformanceConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceMetric.html" data-type="entity-link" >PerformanceMetric</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceMetrics.html" data-type="entity-link" >PerformanceMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceMetrics-1.html" data-type="entity-link" >PerformanceMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceReport.html" data-type="entity-link" >PerformanceReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceResults.html" data-type="entity-link" >PerformanceResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceReview.html" data-type="entity-link" >PerformanceReview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceScenario.html" data-type="entity-link" >PerformanceScenario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PerformanceTest.html" data-type="entity-link" >PerformanceTest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Permission.html" data-type="entity-link" >Permission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Permission-1.html" data-type="entity-link" >Permission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionCategory.html" data-type="entity-link" >PermissionCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionCondition.html" data-type="entity-link" >PermissionCondition</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PermissionForm.html" data-type="entity-link" >PermissionForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PhotoResult.html" data-type="entity-link" >PhotoResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Point.html" data-type="entity-link" >Point</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PortalFilters.html" data-type="entity-link" >PortalFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PortalForm.html" data-type="entity-link" >PortalForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PortalSettings.html" data-type="entity-link" >PortalSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PortalStatistics.html" data-type="entity-link" >PortalStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Position.html" data-type="entity-link" >Position</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionCreate.html" data-type="entity-link" >PositionCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionFilters.html" data-type="entity-link" >PositionFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionInput.html" data-type="entity-link" >PositionInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionResponse.html" data-type="entity-link" >PositionResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionResponse-1.html" data-type="entity-link" >PositionResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionStatistics.html" data-type="entity-link" >PositionStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PositionUpdate.html" data-type="entity-link" >PositionUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PricingPlan.html" data-type="entity-link" >PricingPlan</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PricingTier.html" data-type="entity-link" >PricingTier</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessInfo.html" data-type="entity-link" >ProcessInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessingStatus.html" data-type="entity-link" >ProcessingStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Product.html" data-type="entity-link" >Product</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionFinding.html" data-type="entity-link" >ProductionFinding</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionMetrics.html" data-type="entity-link" >ProductionMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionNextStep.html" data-type="entity-link" >ProductionNextStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionReadinessCheck.html" data-type="entity-link" >ProductionReadinessCheck</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionReadinessReport.html" data-type="entity-link" >ProductionReadinessReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionRecommendation.html" data-type="entity-link" >ProductionRecommendation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionRequirement.html" data-type="entity-link" >ProductionRequirement</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductionTrend.html" data-type="entity-link" >ProductionTrend</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProgressBarConfig.html" data-type="entity-link" >ProgressBarConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PublicEventResponse.html" data-type="entity-link" >PublicEventResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PublicFilters.html" data-type="entity-link" >PublicFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PublicPageData.html" data-type="entity-link" >PublicPageData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PublicRegistrationRequest.html" data-type="entity-link" >PublicRegistrationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PushNotification.html" data-type="entity-link" >PushNotification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PushNotification-1.html" data-type="entity-link" >PushNotification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PushNotificationOptions.html" data-type="entity-link" >PushNotificationOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QRCode.html" data-type="entity-link" >QRCode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QRCodeScanResult.html" data-type="entity-link" >QRCodeScanResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/QueryPerformance.html" data-type="entity-link" >QueryPerformance</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RatingConfig.html" data-type="entity-link" >RatingConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RatingStats.html" data-type="entity-link" >RatingStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RBACFilters.html" data-type="entity-link" >RBACFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RBACStatistics.html" data-type="entity-link" >RBACStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecognitionLog.html" data-type="entity-link" >RecognitionLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecognizeManyFacesResponse.html" data-type="entity-link" >RecognizeManyFacesResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecordingSettings.html" data-type="entity-link" >RecordingSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterForm.html" data-type="entity-link" >RegisterForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegistrationTrendItem.html" data-type="entity-link" >RegistrationTrendItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReplicationConfig.html" data-type="entity-link" >ReplicationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Report.html" data-type="entity-link" >Report</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportConfig.html" data-type="entity-link" >ReportConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportData.html" data-type="entity-link" >ReportData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportExportOptions.html" data-type="entity-link" >ReportExportOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportFilters.html" data-type="entity-link" >ReportFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportParameters.html" data-type="entity-link" >ReportParameters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportSchedule.html" data-type="entity-link" >ReportSchedule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportStats.html" data-type="entity-link" >ReportStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportTemplate.html" data-type="entity-link" >ReportTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportType.html" data-type="entity-link" >ReportType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RestoreForm.html" data-type="entity-link" >RestoreForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RestoreJob.html" data-type="entity-link" >RestoreJob</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review.html" data-type="entity-link" >Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RFIDCard.html" data-type="entity-link" >RFIDCard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RFIDStatistics.html" data-type="entity-link" >RFIDStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RFIDVerifyRequest.html" data-type="entity-link" >RFIDVerifyRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RFIDVerifyResponse.html" data-type="entity-link" >RFIDVerifyResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RichTextEditorConfig.html" data-type="entity-link" >RichTextEditorConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Role.html" data-type="entity-link" >Role</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Role-1.html" data-type="entity-link" >Role</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Role-2.html" data-type="entity-link" >Role</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RoleForm.html" data-type="entity-link" >RoleForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RolePermission.html" data-type="entity-link" >RolePermission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RollbackPlan.html" data-type="entity-link" >RollbackPlan</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SafetyAlert.html" data-type="entity-link" >SafetyAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SafetyMetrics.html" data-type="entity-link" >SafetyMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SafetyRule.html" data-type="entity-link" >SafetyRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SafetyViolation.html" data-type="entity-link" >SafetyViolation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SafetyViolation-1.html" data-type="entity-link" >SafetyViolation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SafetyZone.html" data-type="entity-link" >SafetyZone</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScalingPolicy.html" data-type="entity-link" >ScalingPolicy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Schedule.html" data-type="entity-link" >Schedule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduleForm.html" data-type="entity-link" >ScheduleForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScheduleForm-1.html" data-type="entity-link" >ScheduleForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchParams.html" data-type="entity-link" >SearchParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityAlert.html" data-type="entity-link" >SecurityAlert</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityCompliance.html" data-type="entity-link" >SecurityCompliance</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityConfig.html" data-type="entity-link" >SecurityConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityConfig-1.html" data-type="entity-link" >SecurityConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityFinding.html" data-type="entity-link" >SecurityFinding</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityMetrics.html" data-type="entity-link" >SecurityMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityRecommendation.html" data-type="entity-link" >SecurityRecommendation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityRemediation.html" data-type="entity-link" >SecurityRemediation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityReport.html" data-type="entity-link" >SecurityReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityRule.html" data-type="entity-link" >SecurityRule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityScan.html" data-type="entity-link" >SecurityScan</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityStats.html" data-type="entity-link" >SecurityStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityTest.html" data-type="entity-link" >SecurityTest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityThreat.html" data-type="entity-link" >SecurityThreat</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityTrend.html" data-type="entity-link" >SecurityTrend</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityVulnerability.html" data-type="entity-link" >SecurityVulnerability</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SecurityZone.html" data-type="entity-link" >SecurityZone</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Shift.html" data-type="entity-link" >Shift</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Shift-1.html" data-type="entity-link" >Shift</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShiftCreate.html" data-type="entity-link" >ShiftCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShiftEmployee.html" data-type="entity-link" >ShiftEmployee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShiftFilters.html" data-type="entity-link" >ShiftFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShiftResponse.html" data-type="entity-link" >ShiftResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShiftStatistics.html" data-type="entity-link" >ShiftStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ShiftUpdate.html" data-type="entity-link" >ShiftUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SkeletonItem.html" data-type="entity-link" >SkeletonItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SMSNotificationRequest.html" data-type="entity-link" >SMSNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SMSNotificationRequest-1.html" data-type="entity-link" >SMSNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SortEvent.html" data-type="entity-link" >SortEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SpacingSettings.html" data-type="entity-link" >SpacingSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StandardApiResponse.html" data-type="entity-link" >StandardApiResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StarData.html" data-type="entity-link" >StarData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StatCard.html" data-type="entity-link" >StatCard</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StepperSelectionEvent.html" data-type="entity-link" >StepperSelectionEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StepperStep.html" data-type="entity-link" >StepperStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageConfig.html" data-type="entity-link" >StorageConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StorageInfo.html" data-type="entity-link" >StorageInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubordinateFilter.html" data-type="entity-link" >SubordinateFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubordinateTask.html" data-type="entity-link" >SubordinateTask</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Subscription.html" data-type="entity-link" >Subscription</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubscriptionMetrics.html" data-type="entity-link" >SubscriptionMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SwiperGalleryConfig.html" data-type="entity-link" >SwiperGalleryConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SwiperSlide.html" data-type="entity-link" >SwiperSlide</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SyncStatus.html" data-type="entity-link" >SyncStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemAction.html" data-type="entity-link" >SystemAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemConfiguration.html" data-type="entity-link" >SystemConfiguration</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemHealth.html" data-type="entity-link" >SystemHealth</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemHealth-1.html" data-type="entity-link" >SystemHealth</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemInfo.html" data-type="entity-link" >SystemInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemLog.html" data-type="entity-link" >SystemLog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemMetrics.html" data-type="entity-link" >SystemMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemNotificationRequest.html" data-type="entity-link" >SystemNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemOverview.html" data-type="entity-link" >SystemOverview</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemSetting.html" data-type="entity-link" >SystemSetting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SystemStats.html" data-type="entity-link" >SystemStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tab.html" data-type="entity-link" >Tab</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableAction.html" data-type="entity-link" >TableAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableAction-1.html" data-type="entity-link" >TableAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableAction-2.html" data-type="entity-link" >TableAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableColumn.html" data-type="entity-link" >TableColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableColumn-1.html" data-type="entity-link" >TableColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableColumn-2.html" data-type="entity-link" >TableColumn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableConfig.html" data-type="entity-link" >TableConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableFilter.html" data-type="entity-link" >TableFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TablePage.html" data-type="entity-link" >TablePage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableSort.html" data-type="entity-link" >TableSort</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableStatistics.html" data-type="entity-link" >TableStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaskComment.html" data-type="entity-link" >TaskComment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaskForm.html" data-type="entity-link" >TaskForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TeamMember.html" data-type="entity-link" >TeamMember</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TeamStats.html" data-type="entity-link" >TeamStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Template.html" data-type="entity-link" >Template</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TemplateAsset.html" data-type="entity-link" >TemplateAsset</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TemplateContent.html" data-type="entity-link" >TemplateContent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TemplateMetrics.html" data-type="entity-link" >TemplateMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TemplateNotificationRequest.html" data-type="entity-link" >TemplateNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TemplateVariable.html" data-type="entity-link" >TemplateVariable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tenant.html" data-type="entity-link" >Tenant</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tenant-1.html" data-type="entity-link" >Tenant</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TenantConfig.html" data-type="entity-link" >TenantConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TenantStats.html" data-type="entity-link" >TenantStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TenantUser.html" data-type="entity-link" >TenantUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TestArtifact.html" data-type="entity-link" >TestArtifact</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TestCase.html" data-type="entity-link" >TestCase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TestEnvironment.html" data-type="entity-link" >TestEnvironment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Testimonial.html" data-type="entity-link" >Testimonial</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TestReport.html" data-type="entity-link" >TestReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TestStep.html" data-type="entity-link" >TestStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TestSuite.html" data-type="entity-link" >TestSuite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Theme.html" data-type="entity-link" >Theme</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineConfig.html" data-type="entity-link" >TimelineConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineEvent.html" data-type="entity-link" >TimelineEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimesheetEntry.html" data-type="entity-link" >TimesheetEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimestampFilters.html" data-type="entity-link" >TimestampFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimestampRecord.html" data-type="entity-link" >TimestampRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimestampRecord-1.html" data-type="entity-link" >TimestampRecord</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimestampStats.html" data-type="entity-link" >TimestampStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimestampStats-1.html" data-type="entity-link" >TimestampStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TooltipConfig.html" data-type="entity-link" >TooltipConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrackedFace.html" data-type="entity-link" >TrackedFace</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TypographySettings.html" data-type="entity-link" >TypographySettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATAcceptanceCriteria.html" data-type="entity-link" >UATAcceptanceCriteria</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATEnvironment.html" data-type="entity-link" >UATEnvironment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATFeedback.html" data-type="entity-link" >UATFeedback</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATFinding.html" data-type="entity-link" >UATFinding</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATNextStep.html" data-type="entity-link" >UATNextStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATParticipant.html" data-type="entity-link" >UATParticipant</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATReport.html" data-type="entity-link" >UATReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATSession.html" data-type="entity-link" >UATSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATSessionResults.html" data-type="entity-link" >UATSessionResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATTest.html" data-type="entity-link" >UATTest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATTestData.html" data-type="entity-link" >UATTestData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATTestStep.html" data-type="entity-link" >UATTestStep</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UATUserStory.html" data-type="entity-link" >UATUserStory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateAlertDto.html" data-type="entity-link" >UpdateAlertDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateBiometricDataDto.html" data-type="entity-link" >UpdateBiometricDataDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateQRCodeDto.html" data-type="entity-link" >UpdateQRCodeDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UpdateRFIDCardDto.html" data-type="entity-link" >UpdateRFIDCardDto</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UploadImageResponse.html" data-type="entity-link" >UploadImageResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseCase.html" data-type="entity-link" >UseCase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserFilters.html" data-type="entity-link" >UserFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserInfo.html" data-type="entity-link" >UserInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserProfile.html" data-type="entity-link" >UserProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRole.html" data-type="entity-link" >UserRole</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRole-1.html" data-type="entity-link" >UserRole</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserRoleForm.html" data-type="entity-link" >UserRoleForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserShift.html" data-type="entity-link" >UserShift</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserShiftAssign.html" data-type="entity-link" >UserShiftAssign</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserShiftResponse.html" data-type="entity-link" >UserShiftResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserStatistics.html" data-type="entity-link" >UserStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationConfig.html" data-type="entity-link" >ValidationConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationDemo.html" data-type="entity-link" >ValidationDemo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValidationSummary.html" data-type="entity-link" >ValidationSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Vehicle.html" data-type="entity-link" >Vehicle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Vehicle-1.html" data-type="entity-link" >Vehicle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleCheckIn.html" data-type="entity-link" >VehicleCheckIn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleCheckOut.html" data-type="entity-link" >VehicleCheckOut</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleCreate.html" data-type="entity-link" >VehicleCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleEntryRequest.html" data-type="entity-link" >VehicleEntryRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleExitRequest.html" data-type="entity-link" >VehicleExitRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleStats.html" data-type="entity-link" >VehicleStats</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VehicleUpdate.html" data-type="entity-link" >VehicleUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationCode.html" data-type="entity-link" >VerificationCode</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationField.html" data-type="entity-link" >VerificationField</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationMethod.html" data-type="entity-link" >VerificationMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationResult.html" data-type="entity-link" >VerificationResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationSession.html" data-type="entity-link" >VerificationSession</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationStatistics.html" data-type="entity-link" >VerificationStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationSubmission.html" data-type="entity-link" >VerificationSubmission</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationSubmissionForm.html" data-type="entity-link" >VerificationSubmissionForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerificationTemplate.html" data-type="entity-link" >VerificationTemplate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VerifyFaceResponse.html" data-type="entity-link" >VerifyFaceResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VideoAnalyticsConfig.html" data-type="entity-link" >VideoAnalyticsConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VideoStream.html" data-type="entity-link" >VideoStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VideoStream-1.html" data-type="entity-link" >VideoStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Visitor.html" data-type="entity-link" >Visitor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Visitor-1.html" data-type="entity-link" >Visitor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorApproval.html" data-type="entity-link" >VisitorApproval</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBadge.html" data-type="entity-link" >VisitorBadge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBadge-1.html" data-type="entity-link" >VisitorBadge</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBadgeIssue.html" data-type="entity-link" >VisitorBadgeIssue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBadgeIssue-1.html" data-type="entity-link" >VisitorBadgeIssue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBadgeReturn.html" data-type="entity-link" >VisitorBadgeReturn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBadgeReturn-1.html" data-type="entity-link" >VisitorBadgeReturn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorBlacklist.html" data-type="entity-link" >VisitorBlacklist</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorCheckIn.html" data-type="entity-link" >VisitorCheckIn</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorCheckOut.html" data-type="entity-link" >VisitorCheckOut</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorCreate.html" data-type="entity-link" >VisitorCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorFilters.html" data-type="entity-link" >VisitorFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorInvitation.html" data-type="entity-link" >VisitorInvitation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorInvitation-1.html" data-type="entity-link" >VisitorInvitation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorInvitationCreate.html" data-type="entity-link" >VisitorInvitationCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorInvitationCreate-1.html" data-type="entity-link" >VisitorInvitationCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorInvitationVerify.html" data-type="entity-link" >VisitorInvitationVerify</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorStatistics.html" data-type="entity-link" >VisitorStatistics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorSummary.html" data-type="entity-link" >VisitorSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorUpdate.html" data-type="entity-link" >VisitorUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorVisit.html" data-type="entity-link" >VisitorVisit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorVisit-1.html" data-type="entity-link" >VisitorVisit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorVisitCreate.html" data-type="entity-link" >VisitorVisitCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/VisitorVisitCreate-1.html" data-type="entity-link" >VisitorVisitCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WatchlistMember.html" data-type="entity-link" >WatchlistMember</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebhookNotificationRequest.html" data-type="entity-link" >WebhookNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebhookNotificationRequest-1.html" data-type="entity-link" >WebhookNotificationRequest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Zone.html" data-type="entity-link" >Zone</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/TranslatePipe.html" data-type="entity-link" >TranslatePipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});