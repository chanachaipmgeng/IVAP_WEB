# Service และ Model Standardization

## ภาพรวม

ปรับปรุง service และ model ใน frontend ให้สอดคล้องกับ backend โดยใช้ **snake_case** ตรงกับ backend schemas และแยก models กับ services ให้ชัดเจน

## สิ่งที่ทำแล้ว

### 1. BaseCrudService
- ✅ ปรับปรุงให้รองรับ snake_case โดยตรง
- ✅ เพิ่มฟีเจอร์ CRUD พื้นฐาน (getAll, getById, create, update, patch, delete)
- ✅ เพิ่มฟีเจอร์เสริม (count, exists, getAllList)
- ✅ รองรับ backend response structures (StandardResponse, PaginatedResponse)

**ไฟล์:** `IVAP_WEB/src/app/core/services/base-crud.service.ts`

### 2. ApiService
- ✅ เพิ่ม `skipTransform` option เพื่อใช้ snake_case โดยตรง
- ✅ รองรับทั้ง camelCase (เดิม) และ snake_case (ใหม่)
- ✅ ปรับปรุง methods ทั้งหมด (get, post, put, patch, delete)

**ไฟล์:** `IVAP_WEB/src/app/core/services/api.service.ts`

### 3. Base Models
- ✅ ปรับปรุง `BaseTimestamps` ให้ใช้ `created_at`, `updated_at`
- ✅ ปรับปรุง `PaginatedResponse` ให้ตรงกับ backend structure

**ไฟล์:** `IVAP_WEB/src/app/core/models/base.model.ts`

### 4. Models ที่ใช้ snake_case
สร้าง models ใหม่ที่ใช้ snake_case ตรงกับ backend schemas:

- ✅ **Member** - `member.model.ts` (ตรงกับ `member_schema.py`)
- ✅ **Company** - `company.model.ts` (ตรงกับ `company_schema.py`)
- ✅ **Visitor** - `visitor.model.ts` (ตรงกับ `visitor_schema.py`)
- ✅ **CompanyEmployee** - `company-employee.model.ts` (ตรงกับ `company_employee_schema.py`)
- ✅ **EmployeeTimestamp** - `employee-timestamp.model.ts` (ตรงกับ `employee_timestamp_schema.py`)

### 5. Services ตัวอย่าง
สร้าง services ใหม่ที่ใช้ BaseCrudService:

- ✅ **MemberService** - `member.service.ts`
- ✅ **CompanyService** - `company.service.ts`
- ✅ **VisitorService** - `visitor.service.ts`

## วิธีใช้งาน

### 1. สร้าง Service ใหม่

```typescript
import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { YourModel, YourModelCreate, YourModelUpdate } from '../models/your-model.model';

@Injectable({
  providedIn: 'root'
})
export class YourService extends BaseCrudService<YourModel, YourModelCreate, YourModelUpdate> {
  protected baseEndpoint = '/your-endpoint';

  constructor(api: ApiService) {
    super(api);
  }

  // CRUD operations are automatically available:
  // - getAll(filters?)
  // - getById(id)
  // - create(data)
  // - update(id, data)
  // - patch(id, data)
  // - delete(id)
  // - count(filters?)
  // - exists(id)
  // - getAllList(filters?)

  // Add custom methods if needed
  customMethod(id: string): Observable<any> {
    const options = { skipTransform: true };
    return this.api.get(`/your-endpoint/${id}/custom`, undefined, options);
  }
}
```

### 2. สร้าง Model ใหม่

```typescript
import { UUID, BaseTimestamps } from './base.model';

/**
 * Your Model Interface
 * Uses snake_case to match backend schema
 */
export interface YourModel extends BaseTimestamps {
  your_id: UUID;
  your_field: string;
  another_field?: number;
}

/**
 * Create Request
 */
export interface YourModelCreate {
  your_field: string;
  another_field?: number;
}

/**
 * Update Request
 */
export interface YourModelUpdate {
  your_field?: string;
  another_field?: number;
}
```

### 3. ใช้ Service ใน Component

```typescript
import { Component, OnInit } from '@angular/core';
import { YourService } from '../core/services/your.service';
import { YourModel } from '../core/models/your-model.model';

@Component({
  selector: 'app-your-component',
  templateUrl: './your-component.component.html'
})
export class YourComponent implements OnInit {
  items: YourModel[] = [];

  constructor(private yourService: YourService) {}

  ngOnInit() {
    // Get all items
    this.yourService.getAll().subscribe(response => {
      this.items = response.data;
    });

    // Get by ID
    this.yourService.getById('some-id').subscribe(item => {
      console.log(item);
    });

    // Create
    this.yourService.create({
      your_field: 'value',
      another_field: 123
    }).subscribe(created => {
      console.log('Created:', created);
    });

    // Update
    this.yourService.update('some-id', {
      your_field: 'new value'
    }).subscribe(updated => {
      console.log('Updated:', updated);
    });

    // Delete
    this.yourService.delete('some-id').subscribe(() => {
      console.log('Deleted');
    });
  }
}
```

## การแปลงจาก camelCase เป็น snake_case

### Models
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`
- `memberId` → `member_id`
- `companyId` → `company_id`
- `firstName` → `first_name`
- `lastName` → `last_name`
- `isActive` → `is_active`
- `phoneNumber` → `phone_number`

### Services
- ใช้ `BaseCrudService` แทนการเขียน CRUD operations เอง
- ใช้ `skipTransform: true` ใน options เมื่อเรียก `api.get/post/put/patch/delete` โดยตรง

## Backend Response Structures

### StandardResponse
```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}
```

### PaginatedResponse
```typescript
{
  items: T[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
```

## Services ที่ต้องปรับปรุงต่อไป

Services เหล่านี้ควรปรับปรุงให้ใช้ BaseCrudService และ models ที่เป็น snake_case:

1. `employee.service.ts` - ใช้ `CompanyEmployee` model
2. `timestamp.service.ts` - ใช้ `EmployeeTimestamp` model
3. `guest.service.ts` - ใช้ `Visitor` model
4. `vehicle.service.ts`
5. `parking.service.ts`
6. `leave.service.ts`
7. `department.service.ts`
8. `position.service.ts`
9. และอื่นๆ

## ข้อดี

1. ✅ **ลดความซ้ำซ้อน** - ใช้ BaseCrudService แทนการเขียน CRUD ซ้ำๆ
2. ✅ **สอดคล้องกับ Backend** - ใช้ snake_case ตรงกับ backend schemas
3. ✅ **Type Safety** - TypeScript types ตรงกับ backend
4. ✅ **ง่ายต่อการบำรุงรักษา** - แยก models และ services ชัดเจน
5. ✅ **มาตรฐานเดียวกัน** - ทุก service ใช้ pattern เดียวกัน

## หมายเหตุ

- Models เก่าที่ใช้ camelCase ยังคงใช้งานได้ (backward compatibility)
- ApiService ยังรองรับ camelCase อยู่ (ถ้าไม่ใช้ `skipTransform`)
- Services เก่ายังใช้งานได้ แต่แนะนำให้ migrate ไปใช้ BaseCrudService

