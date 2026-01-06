/**
 * Super Admin Layout Component
 *
 * Main layout component for the super admin application.
 * Provides header, sidebar navigation, and routing for super admin features.
 *
 * @example
 * ```html
 * <app-super-admin-layout>
 *   <router-outlet></router-outlet>
 * </app-super-admin-layout>
 * ```
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent, MenuItem } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  templateUrl: './super-admin-layout.component.html',
  styleUrls: ['./super-admin-layout.component.scss']
})
export class SuperAdminLayoutComponent {
  menuItems: MenuItem[] = [
    // Companies Management
    {
      icon: '🏢',
      label: 'Companies',
      route: '/super/companies',
      permission: 'company.manage'
    },

    // Access Control
    {
      icon: '🔐',
      label: 'Access Control',
      route: '/super/users',
      expanded: true,
      children: [
        {
          icon: '👥',
          label: 'User Management',
          route: '/super/users',
          permission: 'user.manage'
        },
        {
          icon: '🛡️',
          label: 'RBAC',
          route: '/super/rbac',
          permission: 'rbac.manage'
        }
      ]
    },

    // System Management
    {
      icon: '⚙️',
      label: 'System Management',
      route: '/super/settings',
      expanded: true,
      children: [
        {
          icon: '🔧',
          label: 'System Settings',
          route: '/super/settings',
          permission: 'system.manage'
        },
        {
          icon: '🛠️',
          label: 'Maintenance',
          route: '/super/maintenance',
          permission: 'system.manage'
        }
      ]
    },

    // Data & Security
    {
      icon: '🔒',
      label: 'Data & Security',
      route: '/super/audit-logs',
      expanded: false,
      children: [
        {
          icon: '📋',
          label: 'Audit Logs',
          route: '/super/audit-logs',
          permission: 'audit.view'
        },
        {
          icon: '💾',
          label: 'Backup & Restore',
          route: '/super/backup-restore',
          permission: 'system.manage'
        }
      ]
    },

    // License Management
    {
      icon: '🔑',
      label: 'License Management',
      route: '/super/license',
      permission: 'license.manage'
    }
  ];
}

