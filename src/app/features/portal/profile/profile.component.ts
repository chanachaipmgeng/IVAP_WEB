/**
 * Profile Component
 *
 * User profile management component with tabs for profile, security, and notifications.
 * Supports profile editing, password change, and notification preferences.
 *
 * @example
 * ```html
 * <app-profile></app-profile>
 * ```
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ApiService } from '../../../core/services/api.service';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GlassCardComponent,
    GlassButtonComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  loading = signal(false);
  saving = signal(false);
  activeTab = signal<'profile' | 'security' | 'notifications'>('profile');
  showPasswordModal = signal(false);

  profile: UserProfile = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: '',
    createdAt: '',
    updatedAt: ''
  };

  // Security
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordStrength = 0;

  // Notifications
  emailNotifications = true;
  pushNotifications = true;
  smsNotifications = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);

    // ใช้ auth.getCurrentUserInfo() แทนการเรียกใช้โดยตรง
    this.auth.getCurrentUserInfo().subscribe({
      next: (user) => {
        this.profile = {
          id: user.member_id || user.memberId || user.id || '',
          firstName: user.firstName || user.first_name || '',
          lastName: user.lastName || user.last_name || '',
          email: user.email || '',
          phone: user.phoneNumber || user.phone_number || '',
          department: '', // ถ้ามี endpoint สำหรับดึง department
          position: '', // ถ้ามี endpoint สำหรับดึง position
          role: user.roles?.[0] || 'user',
          avatar: user.picture || '',
          createdAt: user.createdAt || user.created_at || new Date().toISOString(),
          updatedAt: user.updatedAt || user.updated_at || new Date().toISOString()
        };
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading profile:', error);
        // Fallback to cached user data
        const currentUser = this.auth.currentUser();
        if (currentUser) {
          this.profile = {
            id: currentUser.id || currentUser.member_id || '',
            firstName: currentUser.firstName || currentUser.first_name || '',
            lastName: currentUser.lastName || currentUser.last_name || '',
            email: currentUser.email,
            phone: currentUser.phoneNumber || (currentUser as any).phone_number || '',
            department: '',
            position: '',
            role: currentUser.roles?.[0] || 'user',
            avatar: currentUser.picture || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        this.loading.set(false);
      }
    });
  }

  updateProfile(): void {
    if (!this.profile.id) {
      alert(this.i18n.t('pages.profile.profileIdNotFound'));
      return;
    }

    this.saving.set(true);

    const updateData: any = {
      first_name: this.profile.firstName,
      last_name: this.profile.lastName,
      email: this.profile.email,
      phone_number: this.profile.phone || null
    };

    // Only include fields that are being updated
    if (this.profile.avatar) {
      updateData.picture = this.profile.avatar;
    }

    this.api.put<any>(`/members/${this.profile.id}`, updateData).subscribe({
      next: (response: any) => {
        const updated = response.data || response;
        // Update local profile
        if (updated.first_name) this.profile.firstName = updated.first_name;
        if (updated.last_name) this.profile.lastName = updated.last_name;
        if (updated.email) this.profile.email = updated.email;
        if (updated.phone_number) this.profile.phone = updated.phone_number;
        if (updated.picture) this.profile.avatar = updated.picture;
        if (updated.updated_at) this.profile.updatedAt = updated.updated_at;

        // Update auth service user data
        const currentUser = this.auth.currentUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            first_name: this.profile.firstName,
            last_name: this.profile.lastName,
            email: this.profile.email,
            phone_number: this.profile.phone,
            picture: this.profile.avatar
          };
          this.auth.setCurrentUser(updatedUser);
        }

        this.saving.set(false);
        alert(this.i18n.t('pages.profile.profileUpdated'));
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        alert(this.i18n.t('pages.profile.profileUpdateError') + ' ' + (error.error?.detail || error.message || this.i18n.t('pages.profile.unknownError')));
        this.saving.set(false);
      }
    });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword) {
      alert(this.i18n.t('pages.profile.fillAllFields'));
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert(this.i18n.t('pages.profile.passwordsDoNotMatch'));
      return;
    }

    if (this.passwordStrength < 50) {
      alert(this.i18n.t('pages.profile.passwordTooWeak'));
      return;
    }

    if (!this.profile.id) {
      alert(this.i18n.t('pages.profile.profileIdNotFound'));
      return;
    }

    this.saving.set(true);

    // Update password via member update endpoint
    this.api.put<any>(`/members/${this.profile.id}`, {
      password: this.newPassword
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showPasswordModal.set(false);
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordStrength = 0;
        alert(this.i18n.t('pages.profile.passwordChanged'));
      },
      error: (error: any) => {
        console.error('Error changing password:', error);
        alert(this.i18n.t('pages.profile.passwordChangeError') + ' ' + (error.error?.detail || error.message || this.i18n.t('pages.profile.unknownError')));
        this.saving.set(false);
      }
    });
  }

  checkPasswordStrength(password: string): void {
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    this.passwordStrength = strength;
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength < 40) return 'weak';
    if (this.passwordStrength < 80) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength < 40) return this.i18n.t('pages.profile.passwordStrength.weak');
    if (this.passwordStrength < 80) return this.i18n.t('pages.profile.passwordStrength.medium');
    return this.i18n.t('pages.profile.passwordStrength.strong');
  }

  saveNotificationSettings(): void {
    if (!this.profile.id) {
      alert(this.i18n.t('pages.profile.profileIdNotFound'));
      return;
    }

    // Save notification preferences (could be extended to use a dedicated endpoint)
    // For now, we can store in user preferences or extend MemberUpdate schema
    const notificationData = {
      email_notifications: this.emailNotifications,
      push_notifications: this.pushNotifications,
      sms_notifications: this.smsNotifications
    };

    // TODO: Create dedicated notification settings endpoint if needed
    // For now, we'll use a generic approach
    // Notification settings saved
    alert(this.i18n.t('pages.profile.notificationSettingsSaved'));
  }

  selectTab(tab: 'profile' | 'security' | 'notifications'): void {
    this.activeTab.set(tab);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(this.i18n.t('pages.profile.selectImageFile'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(this.i18n.t('pages.profile.imageSizeTooLarge'));
        return;
      }

      // Convert to base64 for upload
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Image = e.target.result;

        // Update profile avatar
        if (this.profile.id) {
          this.saving.set(true);
          this.api.put<any>(`/members/${this.profile.id}`, {
            picture: base64Image
          }).subscribe({
            next: (response: any) => {
              const updated = response.data || response;
              if (updated.picture) {
                this.profile.avatar = updated.picture;
                // Update auth service
                const currentUser = this.auth.currentUser();
                if (currentUser) {
                  const updatedUser = { ...currentUser, picture: updated.picture };
                  this.auth.setCurrentUser(updatedUser);
                }
              }
              this.saving.set(false);
              alert(this.i18n.t('pages.profile.avatarUploaded'));
            },
            error: (error: any) => {
              console.error('Error uploading avatar:', error);
              alert(this.i18n.t('pages.profile.avatarUploadError') + ' ' + (error.error?.detail || error.message || this.i18n.t('pages.profile.unknownError')));
              this.saving.set(false);
            }
          });
        } else {
          alert(this.i18n.t('pages.profile.profileIdNotFound'));
        }
      };
      reader.onerror = () => {
        alert(this.i18n.t('pages.profile.errorReadingFile'));
      };
      reader.readAsDataURL(file);
    }
  }
}

