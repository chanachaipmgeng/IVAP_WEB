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
    // 1. การจัดการข้อมูลเกี่ยวกับบริษัท
    {
      icon: '🏢',
      label: 'การจัดการข้อมูลเกี่ยวกับบริษัท',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Overview',
          route: '/portal/company-dashboard',
          permission: 'dashboard.view'
        },
        {
          icon: '🏢',
          label: 'Structure (Organization)',
          route: '/portal/structure',
          permission: 'company.view'
        },
        {
          icon: '👔',
          label: 'Employees',
          route: '/portal/employees',
          permission: 'employee.view'
        },
        {
          icon: '📅',
          label: 'Holiday Calendar',
          route: '/portal/company-holidays',
          permission: 'company.view'
        },
        {
          icon: '📄',
          label: 'Documents & Policies',
          route: '/portal/company-documents',
          permission: 'company.view'
        },
        {
          icon: '📢',
          label: 'Announcements',
          route: '/portal/announcements',
          permission: 'company.view'
        },
        {
          icon: '📈',
          label: 'Reports',
          route: '/portal/company-reports',
          permission: 'report.view'
        }
      ]
    },

    // 2. Face Recognition
    {
      icon: '👁️',
      label: 'Face Recognition',
      expanded: false,
      children: [
        {
          icon: '👁️',
          label: 'Live Monitor',
          route: '/portal/face-recognition-live',
          permission: 'face.recognition.view'
        },
        {
          icon: '👤',
          label: 'Face Enrollment',
          route: '/portal/biometric-data',
          permission: 'biometric.view'
        },
        {
          icon: '🔍',
          label: 'Identification Test',
          route: '/portal/face-recognition-test',
          permission: 'face.recognition.view'
        },
        {
          icon: '🚫',
          label: 'Watchlist',
          route: '/portal/watchlist',
          permission: 'face.recognition.view'
        },
        {
          icon: '📜',
          label: 'Recognition History',
          route: '/portal/recognition-history',
          permission: 'report.view'
        }
      ]
    },

    // 3. Event Management
    {
      icon: '🎉',
      label: 'Event Management',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Event Dashboard',
          route: '/portal/event-dashboard',
          permission: 'event.view'
        },
        {
          icon: '📅',
          label: 'All Events',
          route: '/portal/events',
          permission: 'event.view'
        },
        {
          icon: '📝',
          label: 'Registration Forms',
          route: '/portal/event-forms',
          permission: 'event.manage'
        },
        {
          icon: '🖥️',
          label: 'Kiosk Config',
          route: '/portal/event-kiosk-config',
          permission: 'event.manage'
        },
        {
          icon: '📈',
          label: 'Analytics & Reports',
          route: '/portal/events/analytics',
          permission: 'event.view'
        }
      ]
    },

    // 4. Video Analytics
    {
      icon: '🔬',
      label: 'Video Analytics',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Analytics Overview',
          route: '/portal/video-analytics',
          permission: 'analytics.view'
        },
        {
          icon: '🎥',
          label: 'Cameras & Zones',
          route: '/portal/monitoring',
          permission: 'monitoring.view'
        },
        {
          icon: '📐',
          label: 'Zone Config',
          route: '/portal/zone-config',
          permission: 'monitoring.view'
        },
        {
          icon: '📼',
          label: 'Playback',
          route: '/portal/video-playback',
          permission: 'monitoring.view'
        },
        {
          icon: '🌡️',
          label: 'Heatmaps',
          route: '/portal/heatmap-analytics',
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
          label: 'Incident Reports',
          route: '/portal/incident-reports',
          permission: 'report.view'
        }
      ]
    },

    // 5. Access Control
    {
      icon: '🚪',
      label: 'Access Control',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Access Dashboard',
          route: '/portal/access-dashboard',
          permission: 'door.view'
        },
        {
          icon: '🚪',
          label: 'Doors Management',
          route: '/portal/access-control/doors',
          permission: 'door.view'
        },
        {
          icon: '🔐',
          label: 'Access Groups',
          route: '/portal/access-groups',
          permission: 'door.manage'
        },
        {
          icon: '⏰',
          label: 'Time Schedules',
          route: '/portal/access-schedules',
          permission: 'door.manage'
        },
        {
          icon: '💳',
          label: 'Credentials (QR/RFID)',
          route: '/portal/rfid-cards',
          permission: 'rfid.view'
        },
        {
          icon: '📜',
          label: 'Access Logs',
          route: '/portal/access-logs',
          permission: 'report.view'
        }
      ]
    },

    // 6. Attendance
    {
      icon: '📋',
      label: 'Attendance',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Today Overview',
          route: '/portal/attendance-dashboard',
          permission: 'attendance.view'
        },
        {
          icon: '📋',
          label: 'Daily Attendance',
          route: '/portal/attendance',
          permission: 'attendance.view'
        },
        {
          icon: '🕒',
          label: 'Timesheets',
          route: '/portal/timesheets',
          permission: 'attendance.manage'
        },
        {
          icon: '💪',
          label: 'Overtime (OT)',
          route: '/portal/overtime-requests',
          permission: 'attendance.manage'
        },
        {
          icon: '⏰',
          label: 'Shift Management',
          route: '/portal/config/shifts',
          permission: 'shift.view'
        },
        {
          icon: '🏖️',
          label: 'Leave Management',
          route: '/portal/leaves',
          permission: 'leave.view'
        },
        {
          icon: '📈',
          label: 'Monthly Reports',
          route: '/portal/attendance-reports',
          permission: 'report.view'
        }
      ]
    },

    // 7. Visitor Management
    {
      icon: '🚶',
      label: 'Visitor Management',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Visitor Dashboard',
          route: '/portal/visitor-dashboard',
          permission: 'visitor.view'
        },
        {
          icon: '🚶',
          label: 'Active Visitors',
          route: '/portal/visitors',
          permission: 'visitor.view'
        },
        {
          icon: '📩',
          label: 'Invitations',
          route: '/portal/visitor-invitations',
          permission: 'visitor.view'
        },
        {
          icon: '⛔',
          label: 'Blacklist',
          route: '/portal/visitor-blacklist',
          permission: 'visitor.manage'
        },
        {
          icon: '📦',
          label: 'Delivery & Parcels',
          route: '/portal/visitor-parcels',
          permission: 'visitor.manage'
        },
        {
          icon: '📜',
          label: 'Visitor Logs & Reports',
          route: '/portal/visitor-reports',
          permission: 'report.view'
        }
      ]
    },

    // 8. Vehicle & Parking
    {
      icon: '🚗',
      label: 'Vehicle & Parking',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'Parking Dashboard',
          route: '/portal/parking-dashboard',
          permission: 'parking.view'
        },
        {
          icon: '🚗',
          label: 'Registered Vehicles',
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
          icon: '⚖️',
          label: 'Rules & Fees',
          route: '/portal/parking-rules',
          permission: 'parking.manage'
        },
        {
          icon: '🚫',
          label: 'Blocked Plates',
          route: '/portal/parking-blacklist',
          permission: 'parking.manage'
        },
        {
          icon: '📈',
          label: 'Parking Logs',
          route: '/portal/parking-logs',
          permission: 'report.view'
        }
      ]
    },

    // 9. Smart Surveillance
    {
      icon: '🛡️',
      label: 'Smart Surveillance',
      expanded: false,
      children: [
        {
          icon: '🗺️',
          label: 'Map View (GIS)',
          route: '/portal/surveillance-map',
          permission: 'monitoring.view'
        },
        {
          icon: '🎥',
          label: 'All Cameras',
          route: '/portal/monitoring',
          permission: 'monitoring.view'
        },
        {
          icon: '🚨',
          label: 'Active Alerts',
          route: '/portal/alerts',
          permission: 'alert.view'
        },
        {
          icon: '📜',
          label: 'Alert History',
          route: '/portal/alert-history',
          permission: 'report.view'
        }
      ]
    },

    // 10. System Management
    {
      icon: '⚙️',
      label: 'System Management',
      expanded: false,
      children: [
        {
          icon: '📊',
          label: 'System Health',
          route: '/portal/hardware-status-dashboard',
          permission: 'dashboard.view'
        },
        {
          icon: '👥',
          label: 'User Management',
          route: '/portal/system-users',
          permission: 'user.manage'
        },
        {
          icon: '🖥️',
          label: 'Devices Config',
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
          icon: '📜',
          label: 'Audit Logs',
          route: '/portal/audit-logs',
          permission: 'audit.view'
        },
        {
          icon: '⚙️',
          label: 'General Settings',
          route: '/portal/system-settings',
          permission: 'settings.manage'
        }
      ]
    },

    // 11. Public & Kiosk Mode
    {
      icon: '🌐',
      label: 'Public & Kiosk Mode',
      expanded: false,
      children: [
        {
          icon: '🖥️',
          label: 'Kiosk Display',
          route: '/kiosk/default-device',
          permission: 'device.view'
        },
        {
          icon: '📝',
          label: 'Event Registration',
          route: '/events/register/demo-event',
          permission: 'event.view'
        },
        {
          icon: '✅',
          label: 'Public Verification',
          route: '/verify/public/demo-template',
          permission: 'report.view'
        }
      ]
    },

    // 13. Demo
    {
      icon: '🧪',
      label: 'Demo',
      expanded: false,
      children: [
        { icon: '🧩', label: 'UI Kit (Components)', route: '/portal/ui-kit' },
        { icon: '🎨', label: 'Advanced UI', route: '/portal/advanced-ui-demo' },
        { icon: '📑', label: 'Accordion', route: '/portal/accordion-demo' },
        { icon: '📊', label: 'Advanced Data Table', route: '/portal/advanced-data-table-demo' },
        { icon: '⭐', label: 'Advanced Features', route: '/portal/advanced-features' },
        { icon: '♿', label: 'Accessibility', route: '/portal/accessibility-dashboard' },
        { icon: '📅', label: 'Calendar', route: '/portal/calendar-demo' },
        { icon: '🃏', label: 'Draggable Cards', route: '/portal/draggable-cards-demo' },
        { icon: '📈', label: 'ECharts', route: '/portal/echarts-demo' },
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
    },

    // 13. อื่นๆที่เหลือ
    {
      icon: '📊',
      label: 'Dashboards',
      expanded: false,
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
        },
        {
          icon: '⭐',
          label: 'Advanced Features',
          route: '/portal/advanced-features',
          permission: 'dashboard.view'
        }
      ]
    },

    {
      icon: '📄',
      label: 'Data & Reports',
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

    {
      icon: '📖',
      label: 'Help Center',
      route: '/portal/help-center'
      // No permission - accessible to all
    }
  ];
}
