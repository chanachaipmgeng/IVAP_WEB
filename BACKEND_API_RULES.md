# 📐 Backend API Integration Rules

กฎและแนวทางปฏิบัติสำหรับการพัฒนา Angular Frontend ให้สอดคล้องกับ Backend API

**อัปเดตล่าสุด:** 2024-12-20

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

## 📸 Face Enrollment & Camera Usage

### 1. **Camera Access**
- ใช้ `navigator.mediaDevices.getUserMedia` เพื่อเข้าถึงกล้อง
- ต้อง Handle permission errors เสมอ
- ต้อง Stop stream (`stream.getTracks().forEach(track => track.stop())`) เมื่อเลิกใช้งานหรือ destroy component

### 2. **Image Handling**
- ส่งรูปภาพเป็น **Base64 String** ไปยัง Backend
- Backend คาดหวัง Base64 string ที่ตัด header `data:image/jpeg;base64,` ออกแล้ว หรือจัดการตัดออกก่อนส่ง
- ใช้ `Canvas` ในการ Capture ภาพจาก Video Element

```typescript
// ตัวอย่างการ Capture
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
const dataUrl = canvas.toDataURL('image/jpeg');
const base64 = dataUrl.split(',')[1]; // ส่งค่านี้ไป Backend
```

---

## 🏢 Structure & Company Info

### 1. **Company Information**
- ข้อมูลพื้นฐานบริษัทใช้ `CompanyService` (`/companies/{id}`)
- ข้อมูลเพิ่มเติม (Email, Website, Tax ID) ให้เก็บใน JSON string ผ่านฟิลด์ `company_info` หากไม่มีฟิลด์เฉพาะใน Model
- Mapping ฟิลด์ให้ตรงกับ `snake_case` ของ Model (`company_name`, `address`, `contact`)

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

---

## 🔧 ตัวอย่างการใช้งาน

### 1. สร้าง Model

```typescript
// company.model.ts
import { UUID, BaseTimestamps } from './base.model';

export interface Company extends BaseTimestamps {
  company_id: UUID;
  company_name: string;
  company_code: string;
  company_info?: string;
  owner_name: string;
  contact?: string;
  picture?: string;
  status: 'PUBLIC' | 'PENDING' | number;
}

export interface CompanyCreate {
  company_name: string;
  company_code: string;
  company_info?: string;
  owner_name: string;
  contact?: string;
  picture?: string;
}

export interface CompanyUpdate {
  company_name?: string;
  company_code?: string;
  company_info?: string;
  owner_name?: string;
  contact?: string;
  picture?: string;
  status?: 'PUBLIC' | 'PENDING' | number;
}
```

### 2. สร้าง Service

```typescript
// company.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BaseCrudService } from './base-crud.service';
import { Company, CompanyCreate, CompanyUpdate } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService extends BaseCrudService<Company, CompanyCreate, CompanyUpdate> {
  constructor(api: ApiService) {
    super(api, '/companies', true); // true = useSnakeCase
  }

  // Custom methods (ถ้าจำเป็น)
  getCompanyStatistics(companyId: string): Observable<any> {
    const options = { skipTransform: true };
    return this.api.get<any>(`${this.baseEndpoint}/${companyId}/statistics`, undefined, options);
  }
}
```

### 3. ใช้ใน Component

```typescript
// companies.component.ts
import { Component, signal } from '@angular/core';
import { CompanyService } from '../../core/services/company.service';
import { Company, CompanyCreate } from '../../core/models/company.model';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html'
})
export class CompaniesComponent {
  companies = signal<Company[]>([]);
  formData: CompanyCreate = {
    company_name: '',
    company_code: '',
    owner_name: ''
  };

  constructor(private companyService: CompanyService) {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.companyService.getAll().subscribe({
      next: (response) => {
        this.companies.set(response.data || []);
      },
      error: (err) => console.error('Error loading companies:', err)
    });
  }

  saveCompany(): void {
    this.companyService.create(this.formData).subscribe({
      next: () => {
        this.loadCompanies();
        this.resetForm();
      },
      error: (err) => console.error('Error saving company:', err)
    });
  }

  resetForm(): void {
    this.formData = {
      company_name: '',
      company_code: '',
      owner_name: ''
    };
  }
}
```

### 4. ใช้ใน HTML Template

```html
<!-- companies.component.html -->
<div *ngFor="let company of companies(); trackBy: trackByCompanyId">
  <h3>{{ company.company_name }}</h3>
  <p>Code: {{ company.company_code }}</p>
  <p>Owner: {{ company.owner_name }}</p>
  <p>Created: {{ company.created_at | date }}</p>
</div>

<form (ngSubmit)="saveCompany()">
  <input [(ngModel)]="formData.company_name" name="company_name" placeholder="Company Name" />
  <input [(ngModel)]="formData.company_code" name="company_code" placeholder="Company Code" />
  <input [(ngModel)]="formData.owner_name" name="owner_name" placeholder="Owner Name" />
  <button type="submit">Save</button>
</form>
```

---

## ⚠️ ข้อควรระวัง

### 1. **User vs Member**
- **ใช้ `Member` model แทน `User` model ในโค้ดใหม่**
- **`User` model เป็น compatibility layer สำหรับ backward compatibility (extends `Member`)**
- **`Member` model ตรงกับ backend API โดยตรง**
- **`UserService` ถูกลบแล้ว - ใช้ `MemberService`, `RbacService`, `CompanyService` แทน**

### 2. **Employee vs CompanyEmployee**
- **ใช้ `CompanyEmployee` model แทน `Employee` model**
- **`Employee` model เป็น legacy model (ไม่แนะนำให้ใช้)**
- **`CompanyEmployee` model ตรงกับ backend API โดยตรง**
- **`EmployeeService` ถูกลบแล้ว - ใช้ `CompanyEmployeeService` แทน**

### 3. **skipTransform: true**
- **ต้องใช้ `skipTransform: true` ในทุก API calls**
- **ถ้าไม่ใช้ จะเกิด double transformation (snake_case → camelCase → snake_case)**
- **BaseCrudService จัดการให้อัตโนมัติ ถ้า `useSnakeCase = true`**

### 4. **Type Safety**
- **ใช้ TypeScript types อย่างเคร่งครัด**
- **ตรวจสอบ types ก่อน commit**
- **ใช้ `read_lints` tool เพื่อตรวจสอบ errors**

### 5. **Error Handling**
- **Handle errors อย่างเหมาะสม**
- **แสดง error messages ที่ user-friendly**
- **Log errors สำหรับ debugging**

---

## 🚫 สิ่งที่ห้ามทำ

1. ❌ **ห้ามใช้ `camelCase` ใน models**
2. ❌ **ห้ามแปลง `snake_case` ↔ `camelCase` ใน components**
3. ❌ **ห้ามเขียน CRUD operations เอง (ใช้ BaseCrudService)**
4. ❌ **ห้ามลืม `skipTransform: true` ใน custom API calls**
5. ❌ **ห้ามใช้ legacy services (`UserService`, `EmployeeService`) ในโค้ดใหม่**
   - ใช้ `MemberService` แทน `UserService`
   - ใช้ `CompanyEmployeeService` แทน `EmployeeService`
   - ใช้ `RbacService` สำหรับ role operations
6. ❌ **ห้าม hardcode API endpoints (ใช้ `baseEndpoint`)**
7. ❌ **ห้ามใช้ `any` type (ใช้ specific types)**

---

## 📚 เอกสารอ้างอิง

- [MODEL_SERVICE_BACKEND_COMPLIANCE.md](./MODEL_SERVICE_BACKEND_COMPLIANCE.md) - รายการ models และ services ที่ตรงกับ backend
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - เอกสาร API endpoints
- [README_BASE_SERVICE.md](./src/app/core/services/README_BASE_SERVICE.md) - เอกสาร BaseCrudService

---

## 🔄 การอัปเดต

เอกสารนี้จะอัปเดตเมื่อมีการเปลี่ยนแปลงใน:
- Backend API structure
- Frontend architecture
- Naming conventions
- Best practices

**อัปเดตล่าสุด:** 2024-12-20

## 📋 การเปลี่ยนแปลงล่าสุด (2024-12-20)

### Services ที่ถูกลบ
- ✅ `UserService` - ลบแล้ว (ใช้ `MemberService`, `RbacService`, `CompanyService` แทน)
- ✅ `EmployeeService` - ลบแล้ว (ใช้ `CompanyEmployeeService` แทน)

### Services ที่ปรับปรุง
- ✅ `RbacService` - แก้ไข endpoints เป็น `/rbac/roles`, `/rbac/permissions`
- ✅ `MemberService` - เพิ่ม `resetPassword()`, `exportMembers()`
- ✅ `CompanyEmployeeService` - แก้ไข trailing slash สำหรับ `/employees/`
- ✅ `BiometricDataService` - Extend `BaseCrudService`, เปลี่ยน `HttpClient` → `ApiService`
- ✅ `QRCodeService` - Extend `BaseCrudService`, เปลี่ยน `HttpClient` → `ApiService`
- ✅ `RFIDCardService` - Extend `BaseCrudService`, เปลี่ยน `HttpClient` → `ApiService`
- ✅ `GuestAdminService` - Extend `BaseCrudService`
- ✅ `NotificationApiService` - ใช้ `snake_case` และ `skipTransform: true`
- ✅ `VisitorExtendedService` - ใช้ `snake_case` และ `skipTransform: true`
- ✅ `TimestampService` - ใช้ `snake_case` และ `skipTransform: true` สำหรับ API calls

### Components ที่ปรับปรุง
- ✅ `users.component.ts` - ใช้ `MemberService`, `RbacService`, `CompanyService`
- ✅ `users.component.html` - ใช้ `getRoles()`, `getCompanies()` getters
- ✅ `doors.component.html` - ใช้ `snake_case` properties
- ✅ `hr-dashboard.component.ts` - ใช้ `CompanyEmployeeService`
- ✅ `events.component.ts` & `.html` - ใช้ `snake_case` properties
- ✅ `qr-codes.component.ts` - ใช้ `snake_case` properties และ `BaseCrudService` methods
- ✅ `rfid-cards.component.ts` - ใช้ `snake_case` properties และ `BaseCrudService` methods
- ✅ `biometric-data.component.ts` - ใช้ `snake_case` properties และ `BaseCrudService` methods
- ✅ `structure.component.ts` - เพิ่ม Company Info Management และใช้ `CompanyService`
- ✅ `face-recognition-test.component.ts` - สร้างใหม่พร้อมรองรับ Camera/Upload

### สถานะปัจจุบัน
- ✅ **22 services** ตรงกับ Backend API 100%
- ✅ **All services** ใช้ `snake_case` models
- ✅ **All services** ใช้ `ApiService` แทน `HttpClient`
- ✅ **CRUD services** extend `BaseCrudService`
- ✅ **No linter errors**
