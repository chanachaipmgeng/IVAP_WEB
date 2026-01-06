/**
 * Portal Layout Component
 *
 * Main layout component for the portal application.
 * Provides header, sidebar navigation, and error toast notifications.
 *
 * @example
 * ```html
 * <app-portal-layout>
 *   <router-outlet></router-outlet>
 * </app-portal-layout>
 * ```
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent, MenuItem } from '../../../shared/components/sidebar/sidebar.component';
import { ErrorToastComponent } from '../../../shared/components/error-toast/error-toast.component';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, ErrorToastComponent],
  templateUrl: './portal-layout.component.html',
  styleUrls: ['./portal-layout.component.scss']
})
export class PortalLayoutComponent {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
  menuItems: MenuItem[] = [
    // --- Dashboards ---
    {
      icon: '📊',
      label: 'Dashboards',
      expanded: true,
      children: [
        {
          icon: '📈',
          label: 'Main Dashboard',
          route: '/portal/dashboard',
          permission: 'dashboard.view'
        },
        {
          icon: '👥',
          label: 'HR Dashboard',
          route: '/portal/hr-dashboard',
          permission: 'dashboard.view'
        },
        {
          icon: '🛡️',
          label: 'Safety Dashboard',
          route: '/portal/safety-dashboard',
          permission: 'dashboard.view'
        },
        {
          icon: '⚡',
          label: 'Performance Dashboard',
          route: '/portal/performance-dashboard',
          permission: 'dashboard.view'
        }
      ]
    },

    // --- People Management ---
    {
      icon: '👥',
      label: 'People Management',
      route: '/portal/employees',
      expanded: false,
      children: [
        {
          icon: '👔',
          label: 'Employees',
          route: '/portal/employees',
          permission: 'employee.view'
        },
        {
          icon: '🚶',
          label: 'Visitors',
          route: '/portal/visitors',
          permission: 'visitor.view'
        },
        {
          icon: '🏠',
          label: 'Guests',
          route: '/portal/guests',
          permission: 'guest.view'
        }
      ]
    },

    // --- Access Control ---
    {
      icon: '🚪',
      label: 'Access Control',
      route: '/portal/access-control',
      expanded: false,
      children: [
        {
          icon: '🚪',
          label: 'Doors',
          route: '/portal/access-control/doors',
          permission: 'door.view'
        },
        {
          icon: '🚗',
          label: 'Vehicles',
          route: '/portal/vehicles',
          permission: 'vehicle.view'
        },
        {
          icon: '🅿️',
          label: 'Parking Spots',
          route: '/portal/parking-spots',
          permission: 'parking.view'
        },
        {
          icon: '🔲',
          label: 'QR Codes',
          route: '/portal/qr-codes',
          permission: 'qrcode.view'
        },
        {
          icon: '👤',
          label: 'Biometric Data',
          route: '/portal/biometric-data',
          permission: 'biometric.view'
        },
        {
          icon: '💳',
          label: 'RFID Cards',
          route: '/portal/rfid-cards',
          permission: 'rfid.view'
        }
      ]
    },

    // --- Workforce Management ---
    {
      icon: '👨‍💼',
      label: 'Workforce Management',
      route: '/portal/attendance',
      expanded: false,
      children: [
        {
          icon: '📋',
          label: 'Attendance',
          route: '/portal/attendance',
          permission: 'attendance.view'
        },
        {
          icon: '⏰',
          label: 'Shifts',
          route: '/portal/config/shifts',
          permission: 'shift.view'
        },
        {
          icon: '🏖️',
          label: 'Leaves',
          route: '/portal/leaves',
          permission: 'leave.view'
        }
      ]
    },

    // --- Event Management ---
    {
      icon: '🎉',
      label: 'Event Management',
      route: '/portal/events',
      expanded: false,
      children: [
        {
          icon: '📅',
          label: 'Events',
          route: '/portal/events',
          permission: 'event.view'
        },
        {
          icon: '📊',
          label: 'Event Analytics',
          route: '/portal/events/analytics',
          permission: 'event.view'
        }
      ]
    },

    // --- Core Operations ---
    {
      icon: '📹',
      label: 'Core Operations',
      route: '/portal/monitoring',
      expanded: false,
      children: [
        {
          icon: '🎥',
          label: 'Monitoring',
          route: '/portal/monitoring',
          permission: 'monitoring.view'
        },
        {
          icon: '🔬',
          label: 'Video Analytics',
          route: '/portal/video-analytics',
          permission: 'analytics.view'
        },
        {
          icon: '🤖',
          label: 'AI Models',
          route: '/portal/ai-models',
          permission: 'ai.view'
        },
        {
          icon: '🚨',
          label: 'Alerts',
          route: '/portal/alerts',
          permission: 'alert.view'
        },
        {
          icon: '📢',
          label: 'Notifications',
          route: '/portal/notifications',
          permission: 'notification.view'
        },
        {
          icon: '👁️',
          label: 'Face Recognition Live',
          route: '/portal/face-recognition-live',
          permission: 'face.recognition.view'
        }
      ]
    },

    // --- Hardware & Locations ---
    {
      icon: '🖥️',
      label: 'Hardware & Locations',
      route: '/portal/devices',
      expanded: false,
      children: [
        {
          icon: '🖥️',
          label: 'Devices',
          route: '/portal/devices',
          permission: 'device.view'
        },
        {
          icon: '📍',
          label: 'Locations',
          route: '/portal/locations',
          permission: 'location.view'
        },
        {
          icon: '🔧',
          label: 'Hardware Status',
          route: '/portal/hardware-status-dashboard',
          permission: 'dashboard.view'
        }
      ]
    },

    // --- Configuration ---
    {
      icon: '⚙️',
      label: 'Configuration',
      route: '/portal/config',
      expanded: false,
      children: [
        {
          icon: '👤',
          label: 'Profile',
          route: '/portal/profile',
          permission: 'profile.view'
        },
        {
          icon: '🏢',
          label: 'Structure (Organization)',
          route: '/portal/structure',
          permission: 'company.view'
        },
        {
          icon: '📁',
          label: 'Departments',
          route: '/portal/departments',
          permission: 'department.view'
        },
        {
          icon: '💼',
          label: 'Positions',
          route: '/portal/positions',
          permission: 'position.view'
        }
      ]
    },

    // --- Data & Reports ---
    {
      icon: '📄',
      label: 'Data & Reports',
      route: '/portal/reports',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Reports',
          route: '/portal/reports',
          permission: 'report.view'
        },
        {
          icon: '📝',
          label: 'Advanced Forms',
          route: '/portal/advanced-forms',
          permission: 'form.view'
        },
        {
          icon: '📋',
          label: 'Template Management',
          route: '/portal/template-management',
          permission: 'template.manage'
        }
      ]
    },

    // --- Help Center ---
    {
      icon: '📖',
      label: 'Help Center',
      route: '/portal/help-center'
      // No permission - accessible to all
    },

    // --- DEMO PAGES ---
    {
      icon: '🧪',
      label: 'UI Demos',
      expanded: false,
      children: [
        { icon: '🎨', label: 'Advanced UI', route: '/portal/advanced-ui-demo' },
        { icon: '📑', label: 'Accordion', route: '/portal/accordion-demo' },
        { icon: '📊', label: 'Advanced Data Table', route: '/portal/advanced-data-table-demo' },
        { icon: '⭐', label: 'Advanced Features', route: '/portal/advanced-features' },
        { icon: '♿', label: 'Accessibility', route: '/portal/accessibility-dashboard' },
        { icon: '📅', label: 'Calendar', route: '/portal/calendar-demo' },
        { icon: '🃏', label: 'Draggable Cards', route: '/portal/draggable-cards-demo' },
        { icon: '📈', label: 'ECharts', route: '/portal/echarts-demo' },
        { icon: '👤', label: 'Face Recognition', route: '/portal/face-recognition-demo' },
        { icon: '👁️', label: 'Face Recognition Live', route: '/portal/face-recognition-live' },
        { icon: '🖼️', label: 'Gallery', route: '/portal/gallery-demo' },
        { icon: '🗺️', label: 'Map', route: '/portal/map-demo' },
        { icon: '📱', label: 'Mobile', route: '/portal/mobile-demo' },
        { icon: '🔔', label: 'Notification', route: '/portal/notification-demo' },
        { icon: '📂', label: 'Offcanvas', route: '/portal/offcanvas-demo' },
        { icon: '⭐', label: 'Rating', route: '/portal/rating-demo' },
        { icon: '✏️', label: 'Rich Text Editor', route: '/portal/rich-text-editor-demo' },
        { icon: '🎞️', label: 'Swiper Gallery', route: '/portal/swiper-gallery-demo' },
        { icon: '⏳', label: 'Timeline', route: '/portal/timeline-demo' },
        { icon: '🕐', label: 'Timestamp', route: '/portal/timestamp-demo' },
        { icon: '✅', label: 'Validation', route: '/portal/validation-demo' },
      ]
    }
  ];
}

