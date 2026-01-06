# Intelligent Video Analytics Platform (IVAP)

โปรเจค Angular สำหรับระบบวิเคราะห์วิดีโอด้วย AI พร้อมระบบจดจำใบหน้า

## 🎨 Features

- ✨ **Glass Morphism Design System** - ระบบออกแบบแบบ Glass Morphism ที่ทันสมัยและสวยงาม
  - Glass Card, Glass Button, Glass Input components
  - Glass Dropdown และ Glass Modal สำหรับ UI elements
  - รองรับ Dark Mode และ Light Mode
  - Responsive design สำหรับทุกอุปกรณ์
- 🌍 **Multi-language Support** - รองรับภาษาไทยและภาษาอังกฤษ (i18n)
- 🎭 **Theme Switching** - เปลี่ยน theme ได้ (Light, Dark, Auto)
- 📱 **Responsive Design** - รองรับทุกขนาดหน้าจอ (mobile-first approach)
- 🔐 **Role-based Access Control** - แยกสิทธิ์การใช้งานตาม role
- 🚀 **Modern Angular** - ใช้ Standalone Components และ Signals
- 🎯 **Component Standardization** - ทุก component แยก HTML, SCSS, TS files ตามมาตรฐาน
- 🌈 **Consistent UI/UX** - ทุกหน้าจอใช้ Glass Morphism Design System

## 📂 โครงสร้างโปรเจค

```
src/
├── app/
│   ├── core/                     # Core modules
│   │   ├── services/            # Services (Auth, API, Theme, i18n)
│   │   ├── guards/              # Route guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # TypeScript interfaces
│   │   └── constants/           # Constants
│   ├── shared/                   # Shared modules
│   │   ├── components/          # Reusable components
│   │   │   ├── glass-card/     # Frosted glass card
│   │   │   ├── glass-button/   # Frosted glass button
│   │   │   ├── glass-input/    # Frosted glass input
│   │   │   ├── header/         # Header component
│   │   │   ├── sidebar/        # Sidebar navigation
│   │   │   ├── modal/          # Modal dialog
│   │   │   ├── loading/        # Loading spinner
│   │   │   └── data-table/     # Data table with pagination
│   │   ├── directives/         # Custom directives
│   │   └── pipes/              # Custom pipes
│   └── features/                 # Feature modules
│       ├── public/              # Public views
│       │   └── event-registration/
│       ├── kiosk/               # Kiosk portal
│       │   └── kiosk-view/
│       ├── portal/              # Company admin portal
│       │   ├── login/
│       │   ├── portal-layout/
│       │   ├── dashboard/
│       │   └── employees/
│       └── super-admin/         # Super admin portal
│           ├── super-admin-layout/
│           └── companies/
```

## 🚀 การติดตั้งและใช้งาน

### Prerequisites

- Node.js 18+ 
- npm หรือ yarn

### ติดตั้ง

```bash
cd frontend
npm install
```

### รัน Development Server

```bash
npm start
```

เปิดเว็บเบราว์เซอร์ไปที่ `http://localhost:4200/`

### Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`

## 🎯 Routes

### Public Routes
- `/events/register/:publicUrl` - ลงทะเบียนอีเวนต์

### Kiosk Routes
- `/kiosk/:deviceId` - หน้าจอ kiosk สำหรับ check-in

### Company Admin Portal (`/portal`)
**Authentication:**
- `/portal/login` - Login page ✅ Glass Morphism
- `/portal/forgot-password` - ลืมรหัสผ่าน ✅ Glass Morphism
- `/portal/reset-password/:token` - Reset password ✅ Glass Morphism

**Navigation:**
- ✅ Parent menu items สามารถคลิกเพื่อ navigate ได้ (อัพเดท: 19 ธ.ค. 2024)
- ✅ Sidebar component รองรับ parent menu navigation
- ✅ Expand/collapse children menu ทำงานถูกต้อง
- `/portal/mfa-setup` - ตั้งค่า MFA ✅ Glass Morphism

**Dashboards:**
- `/portal/dashboard` - Main dashboard ✅ Glass Morphism
- `/portal/hr-dashboard` - HR Dashboard ✅ Glass Morphism
- `/portal/safety-dashboard` - Safety Dashboard ✅ Glass Morphism
- `/portal/performance-dashboard` - Performance Dashboard ✅ Glass Morphism
- `/portal/hardware-status-dashboard` - Hardware Status Dashboard ✅ Glass Morphism

**People Management:**
- `/portal/profile` - ข้อมูลส่วนตัว ✅ Glass Morphism
- `/portal/employees` - จัดการพนักงาน ✅ Glass Morphism
- `/portal/visitors` - จัดการผู้เยี่ยมชม ✅ Glass Morphism
- `/portal/guests` - จัดการแขก ✅ Glass Morphism
- `/portal/structure` - โครงสร้างองค์กร ✅ Glass Morphism

**Workforce Management:**
- `/portal/attendance` - การลงเวลา ✅ Glass Morphism
- `/portal/leaves` - จัดการวันลา ✅ Glass Morphism
- `/portal/config/shifts` - จัดการกะการทำงาน ✅ Glass Morphism

**Access Control:**
- `/portal/access-control/doors` - จัดการประตู ✅ Glass Morphism
- `/portal/qr-codes` - จัดการ QR Codes ✅ Glass Morphism
- `/portal/rfid-cards` - จัดการ RFID Cards ✅ Glass Morphism
- `/portal/biometric-data` - จัดการข้อมูล Biometric ✅ Glass Morphism
- `/portal/vehicles` - จัดการยานพาหนะ ✅ Glass Morphism
- `/portal/parking-spots` - จัดการที่จอดรถ ✅ Glass Morphism

**Core Operations:**
- `/portal/events` - จัดการอีเวนต์ ✅ Glass Morphism (Enhanced with Status, Type, Search, Filter, Pagination)
- `/portal/alerts` - การแจ้งเตือน ✅ Glass Morphism
- `/portal/notifications` - การแจ้งเตือน ✅ Glass Morphism
- `/portal/monitoring` - ตรวจสอบแบบ Real-time ✅ Glass Morphism
- `/portal/video-analytics` - วิเคราะห์วิดีโอ ✅ Glass Morphism
- `/portal/ai-models` - จัดการ AI Models ✅ Glass Morphism
- `/portal/reports` - รายงาน ✅ Glass Morphism

**Hardware & Locations:**
- `/portal/devices` - จัดการอุปกรณ์ ✅ Glass Morphism
- `/portal/locations` - จัดการสถานที่ ✅ Glass Morphism

**System:**
- `/portal/help-center` - ศูนย์ช่วยเหลือ ✅ Glass Morphism
- `/portal/template-management` - จัดการ Templates ✅ Glass Morphism

### Super Admin Portal (`/super`)
- `/super/login` - Super admin login
- `/super/companies` - จัดการบริษัท
- `/super/users` - จัดการผู้ใช้
- `/super/rbac` - จัดการ Role-Based Access Control
- `/super/settings` - ตั้งค่าระบบ
- `/super/audit-logs` - Audit logs
- `/super/backup-restore` - Backup & Restore
- `/super/license` - จัดการ License
- `/super/maintenance` - บำรุงรักษาระบบ
- `/super/module-subscription` - จัดการ Module Subscription

## 🎨 Customization

### Theme

แก้ไขไฟล์ `tailwind.config.js` เพื่อปรับแต่ง theme colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
}
```

### Translations

แก้ไขไฟล์ `src/app/core/services/i18n.service.ts` เพื่อเพิ่มหรือแก้ไขคำแปล:

```typescript
this.translations.th = {
  common: {
    // Thai translations
  }
};

this.translations.en = {
  common: {
    // English translations
  }
};
```

## 🔌 API Integration

แก้ไข API URL ในไฟล์ `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  baseUrl: 'http://localhost:8000',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
};
```

สำหรับ Production ให้แก้ไขไฟล์ `src/environments/environment.prod.ts`

## 🎯 Event Management System

Event Management System ได้รับการปรับปรุงให้สมบูรณ์แล้ว (พฤศจิกายน 2025):

### Features
- **Event Status Management**: draft, published, cancelled, completed
- **Event Type Classification**: meeting, training, conference, social, workshop, seminar, webinar, other
- **Search & Filter**: ค้นหาและกรอง events ตามชื่อ, status, type, location
- **Pagination**: ระบบ pagination แบบ page-based
- **Max Attendees Control**: ควบคุมจำนวนผู้เข้าร่วม
- **Enhanced UI**: ปรับปรุง UI ให้ใช้งานง่ายขึ้น

### Event Routes
- `/portal/events` - จัดการอีเวนต์ (Enhanced)

ดูรายละเอียดเพิ่มเติม:
- [Event System Improvements](../EVENT_SYSTEM_IMPROVEMENTS_COMPLETED.md)
- [Event System Quick Start](../QUICK_START_GUIDE.md)
- [Event API Documentation](../docs/api/EVENT_API.md)

## 🛠️ Technologies

- **Angular 17+** - Framework (Standalone Components)
- **TypeScript** - Language (Strict Mode)
- **Tailwind CSS** - Utility-first CSS framework
- **SCSS** - CSS Preprocessor
- **RxJS** - Reactive programming
- **Angular Signals** - State management
- **Chart.js** - Data visualization
- **Glass Morphism Design** - Modern UI design system

## 🎨 Design System

### Gemini 2.0 Flash Style

โปรเจคใช้ **Gemini 2.0 Flash Style** ที่มีลักษณะ:
- Modern, Clean, Secure, Intelligent aesthetic
- Glassmorphism UI style
- Vertical gradient backgrounds
- Subtle animations
- Full dark/light mode support

**เอกสาร:**
- 📘 [Design System Guide](../docs/DESIGN_SYSTEM.md) - รายละเอียดครบถ้วน
- 📘 [Development Standards](../docs/DEVELOPMENT_STANDARDS.md) - มาตรฐานการพัฒนา

### Glass Morphism Components
- **GlassCardComponent** - Card component with glass effect
- **GlassButtonComponent** - Button component with variants (primary, secondary, danger)
- **Glass Input** - Input fields with glass styling
- **Glass Dropdown** - Dropdown menus with glass effect
- **Glass Modal** - Modal dialogs with glass morphism
- **LoadingComponent** - Loading states and skeleton screens

### Theme Support
- **Light Mode** - Light theme with glass effects
- **Dark Mode** - Dark theme with glass effects
- **Auto Mode** - Automatic theme switching based on system preferences

### Responsive Design
- **Mobile First** - Designed for mobile devices first
- **Tablet Support** - Optimized for tablet screens
- **Desktop Support** - Full features for desktop
- **Breakpoints** - Standard Tailwind CSS breakpoints

## ✅ Component Status

### ✅ Completed (Glass Morphism Design)
- ✅ Login, Forgot Password, Reset Password
- ✅ Dashboard, HR Dashboard, Safety Dashboard, Performance Dashboard
- ✅ Profile, Help Center
- ✅ Employees, Visitors, Guests, Structure
- ✅ Attendance, Leaves, Shifts
- ✅ Events, Alerts, Notifications, Reports
- ✅ QR Codes, RFID Cards, Biometric Data
- ✅ Devices, Locations, Hardware Status Dashboard
- ✅ AI Models, Video Analytics, Monitoring
- ✅ Access Control, Doors, Vehicles, Parking Spots
- ✅ Template Management

### 📋 Standards
- ✅ All components use separate HTML, SCSS, TS files
- ✅ All components use Glass Morphism Design System
- ✅ All components support Dark Mode
- ✅ All components are responsive (mobile, tablet, desktop)
- ✅ All components use Angular Signals for state management

## 📝 License

MIT License

## 👥 Contributors

- Your Team

## 🙏 Acknowledgments

- Angular Team
- Tailwind CSS Team
