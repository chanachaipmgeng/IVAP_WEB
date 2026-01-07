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
    // 1. Overview
    {
      icon: '📊',
      label: 'Overview',
      route: '/super/dashboard',
      permission: 'dashboard.view'
    },

    // 2. Tenant Management
    {
      icon: '🏢',
      label: 'Tenant Management',
      route: '/super/companies',
      expanded: true,
      children: [
        {
          icon: '🏢',
          label: 'Companies',
          route: '/super/companies',
          permission: 'company.manage'
        },
        {
          icon: '💳',
          label: 'Subscriptions',
          route: '/super/module-subscription',
          permission: 'subscription.manage'
        },
        {
          icon: '📢',
          label: 'Announcements',
          route: '/super/announcements',
          permission: 'announcement.manage'
        },
        {
          icon: '🔑',
          label: 'License Keys',
          route: '/super/license',
          permission: 'license.manage'
        }
      ]
    },

    // 3. Platform Administration
    {
      icon: '⚙️',
      label: 'Platform Admin',
      route: '/super/users',
      expanded: false,
      children: [
        {
          icon: '👥',
          label: 'Admin Users',
          route: '/super/users',
          permission: 'user.manage'
        },
        {
          icon: '🛡️',
          label: 'Roles & Permissions',
          route: '/super/rbac',
          permission: 'rbac.manage'
        },
        {
          icon: '🔧',
          label: 'Global Settings',
          route: '/super/settings',
          permission: 'system.manage'
        }
      ]
    },

    // 4. Operations & Security
    {
      icon: '🔒',
      label: 'Ops & Security',
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
          icon: '📈',
          label: 'System Reports',
          route: '/super/reports',
          permission: 'report.view'
        },
        {
          icon: '💾',
          label: 'Backup & Restore',
          route: '/super/backup-restore',
          permission: 'system.manage'
        },
        {
          icon: '🛠️',
          label: 'Maintenance Mode',
          route: '/super/maintenance',
          permission: 'system.manage'
        }
      ]
    }
  ];
}
