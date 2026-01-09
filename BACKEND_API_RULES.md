# 📐 Backend API Integration Rules

กฎและแนวทางปฏิบัติสำหรับการพัฒนา Angular Frontend ให้สอดคล้องกับ Backend API

**อัปเดตล่าสุด:** 2026-01-09

---

## 🎯 หลักการพื้นฐาน

### 1. **Naming Convention: snake_case**
- **Backend API ใช้ `snake_case` สำหรับทุก field**
- **Frontend Models ต้องใช้ `snake_case` ตรงกับ Backend**
- **ไม่ต้องแปลง `camelCase` ↔ `snake_case` ใน Components**

```typescript
// ✅ ถูกต้อง
interface User {
  member_id: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
}

// ❌ ผิด
interface User {
  memberId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}
```

### 2. **Service Pattern: BaseCrudService**
- **ทุก Service ต้อง extend `BaseCrudService<T, TCreate, TUpdate>`**
- **ใช้ `skipTransform: true` ในทุก API calls**
- **ไม่ต้องเขียน CRUD operations เอง**

```typescript
// ✅ ถูกต้อง
@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseCrudService<Company, CompanyCreate, CompanyUpdate> {
  constructor(api: ApiService) {
    super(api, '/companies', true); // true = useSnakeCase
  }
}

// ❌ ผิด
@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private api: ApiService) {}
  
  getAll(): Observable<Company[]> {
    return this.api.get<Company[]>('/companies'); // ไม่มี skipTransform
  }
}
```

### 3. **Model Structure**
- **ใช้ `BaseTimestamps` สำหรับ `created_at`, `updated_at`**
- **ใช้ `UUID` type สำหรับ ID fields**
- **ตรวจสอบให้ตรงกับ backend schema (`*_schema.py`)**

```typescript
// ✅ ถูกต้อง
import { UUID, BaseTimestamps } from './base.model';

export interface Company extends BaseTimestamps {
  company_id: UUID;
  company_name: string;
  company_code: string;
  owner_name: string;
}

// ❌ ผิด
export interface Company {
  companyId: string; // camelCase
  companyName: string;
  createdAt: Date; // ไม่ใช่ string และไม่ extend BaseTimestamps
}
```

---

## 📸 Face Enrollment & Biometric Data Rules (Updated)

### 1. **Biometric Types**
- Backend **ต้องส่งค่าเป็น lowercase** เสมอ (เช่น `"face"`, `"fingerprint"`) ให้ตรงกับ Frontend Enums
- Frontend Models:
```typescript
export enum BiometricType {
  FACE = 'face',
  FINGERPRINT = 'fingerprint',
  // ...
}
```

### 2. **Image Handling**
- **Upload:** ส่งรูปภาพเป็น **Base64 String** (ตัด header `data:image/...;base64,` ออก) หรือ **File Object** ผ่าน `FormData`
- **Download/Display:**
  - Backend ส่ง URL เป็น **Relative Path** (เช่น `/enrolled_images/xxx.jpg`)
  - Frontend ต้อง **เติม Base URL** (เช่น `http://localhost:8000`) ก่อนนำไปแสดงผลใน `<img>` tag
- **Preview:** ใช้ `Base64` สำหรับรูปที่เพิ่งถ่าย/เลือก และ `URL` สำหรับรูปที่มีอยู่แล้ว

### 3. **Deletion Policy**
- **ห้าม** ให้มีปุ่มลบ (Delete) ในหน้าจอรวม (`/portal/biometric-data`)
- การลบข้อมูล Sensitive ต้องทำผ่าน API เฉพาะทาง หรือหน้าจอ Admin ที่มีการยืนยันตัวตนระดับสูง

### 4. **Camera Access**
- ใช้ `navigator.mediaDevices.getUserMedia` เพื่อเข้าถึงกล้อง
- ต้อง Handle permission errors เสมอ
- ต้อง Stop stream (`stream.getTracks().forEach(track => track.stop())`) เมื่อเลิกใช้งาน

---

## 🎨 UI/UX Standards (Updated)

### 1. **Icons**
- ใช้ **FontAwesome Classes** (e.g., `fas fa-edit`, `fas fa-trash`) สำหรับ `DataTable` actions และ `PageLayout` buttons
- **ห้าม** ใช้ชื่อ icon เดี่ยวๆ (e.g. "edit", "trash") เพราะจะไม่แสดงผล

### 2. **Data Tables**
- ใช้ `app-data-table` พร้อม `[columns]` ที่กำหนด Template ได้
- ใช้ `ng-template` สำหรับ Column ที่ต้องการแสดงผลพิเศษ (เช่น รูปภาพ, สถานะสี)

---

## 🏠 Portal Dashboard & Navigation (New)

### 1. **Landing Hub**
- หน้า **Dashboard** (`/portal/dashboard`) ทำหน้าที่เป็น Landing Page หลัก
- แสดง **Module Shortcuts** 12 กลุ่ม เพื่อให้เข้าถึงฟังก์ชันงานต่างๆ ได้ง่าย
- แสดงภาพรวมระบบ (System Overview) และสถิติสำคัญ

### 2. **ECharts Configuration**
- ใช้ `NgxEchartsModule` แบบ Standalone
- ต้องระบุ `importProvidersFrom(NgxEchartsModule.forRoot(...))` ใน `app.config.ts`

---

## 👑 Super Admin Dashboard (New)

### 1. **Overview Dashboard**
- หน้า **Dashboard** (`/super/dashboard`) รวมสถิติภาพรวมระบบ
- แสดงกราฟรายได้ (Revenue Growth) และการใช้งาน Module
- **Component:** `SuperAdminDashboardComponent`

### 2. **System Reports**
- หน้ารายงานระบบเชิงลึก (`/super/reports`)
- **Component:** `SuperAdminReportsComponent`

### 3. **Global Announcements**
- หน้าจัดการประกาศระบบ (`/super/announcements`)
- แจ้งเตือน Maintenance หรือ Features ใหม่
- **Component:** `SuperAdminAnnouncementsComponent`

---

## 🚶 Visitor Management (New)

### 1. **Visitor Dashboard**
- แสดงสถิติผู้มาติดต่อรายวัน (Total, Active, VIP)
- **Component:** `VisitorDashboardComponent`

### 2. **Blacklist**
- จัดการรายชื่อผู้ไม่อนุญาตให้เข้าพื้นที่
- **Component:** `VisitorBlacklistComponent`

### 3. **Delivery & Parcels**
- จัดการพัสดุขาเข้า (`/portal/visitor-parcels`)
- **Component:** `VisitorParcelsComponent`

---

## 🚗 Vehicle & Parking (New)

### 1. **Parking Dashboard**
- แสดงสถานะที่จอดรถ (Occupied, Available, Reserved)
- **Component:** `ParkingDashboardComponent`

### 2. **Rules & Fees**
- ตั้งค่ากฎและอัตราค่าบริการจอดรถ
- **Component:** `ParkingRulesComponent`

### 3. **Blocked Plates**
- จัดการ Blacklist ทะเบียนรถ (`/portal/parking-blacklist`)
- **Component:** `ParkingBlacklistComponent`

---

## 🛡️ Smart Surveillance (New)

### 1. **Map View (GIS)**
- แสดงตำแหน่งกล้องบนแผนที่
- **Component:** `SurveillanceMapComponent`

### 2. **Incident Reports**
- รายงานอุบัติการณ์และความผิดปกติ
- **Component:** `IncidentReportsComponent`

---

## 🏢 Structure & Company Info

### 1. **Company Information**
- ข้อมูลพื้นฐานบริษัทใช้ `CompanyService` (`/companies/{id}`)
- **Component:** `StructureComponent` (Tab: Company Info)

### 2. **Documents & Policies**
- จัดการเอกสารและนโยบายบริษัท (`/portal/company-documents`)
- **Component:** `CompanyDocumentsComponent`

### 3. **Holiday Calendar**
- ปฏิทินวันหยุดบริษัท
- **Component:** `CompanyHolidaysComponent`

---

## 📋 Checklist สำหรับการพัฒนา

### สำหรับ Models (`*.model.ts`)

- [ ] ใช้ `snake_case` สำหรับทุก field
- [ ] ตรวจสอบให้ตรงกับ backend schema (`*_schema.py`)
- [ ] ใช้ `BaseTimestamps` สำหรับ `created_at`, `updated_at`
- [ ] ใช้ `UUID` type สำหรับ ID fields
- [ ] กำหนด optional fields ด้วย `?` ตาม backend schema
- [ ] สร้าง `Create` และ `Update` interfaces แยกต่างหาก

### สำหรับ Services (`*.service.ts`)

- [ ] Extend `BaseCrudService<T, TCreate, TUpdate>`
- [ ] กำหนด `baseEndpoint` ใน constructor
- [ ] ตั้งค่า `useSnakeCase = true` ใน constructor
- [ ] ใช้ `skipTransform: true` ในทุก API calls (ถ้ามี custom methods)
- [ ] ไม่ต้องเขียน CRUD operations เอง (ใช้จาก BaseCrudService)
- [ ] Custom methods ต้องใช้ `this.api.get/post/put/delete` พร้อม `skipTransform: true`

### สำหรับ Components (`*.component.ts`)

- [ ] ใช้ `snake_case` properties จาก models
- [ ] ไม่ต้องแปลง `camelCase` ↔ `snake_case`
- [ ] ใช้ service methods โดยตรง
- [ ] Handle errors อย่างเหมาะสม
- [ ] ใช้ signals หรือ observables สำหรับ reactive data

### สำหรับ HTML Templates (`*.component.html`)

- [ ] ใช้ `snake_case` properties ใน bindings
- [ ] ใช้ `{{ model.field_name }}` แทน `{{ model.fieldName }}`
- [ ] ใช้ `[ngModel]="formData.field_name"` แทน `[ngModel]="formData.fieldName"`
- [ ] ใช้ `*ngFor="let item of items(); trackBy: trackByFn"` สำหรับ lists
- [ ] ใช้ `app-glass-card` และ `app-glass-button` สำหรับ UI มาตรฐาน

---

## 🔄 การอัปเดต

เอกสารนี้จะอัปเดตเมื่อมีการเปลี่ยนแปลงใน:
- Backend API structure
- Frontend architecture
- Naming conventions
- Best practices

**อัปเดตล่าสุด:** 2026-01-09

## 📋 การเปลี่ยนแปลงล่าสุด (2026-01-09)

### Face Recognition System
- ✅ **Upgraded Model:** เปลี่ยนใช้ `cnn` model เพื่อความแม่นยำสูงสุด
- ✅ **Strict Security:** ปรับ Threshold เป็น 0.35 และเพิ่ม Duplicate Check
- ✅ **API Standard:** ปรับ `biometric_type` response ให้เป็น lowercase (`"face"`)
- ✅ **UI Fixes:** แก้ไข Icon, Image Preview, และปิดการลบข้อมูลจากหน้าจอทั่วไป
