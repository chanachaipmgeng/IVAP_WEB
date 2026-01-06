# 📋 Model และ Service Backend API Compliance Report

เอกสารสรุปสถานะของ Models และ Services ที่ตรงกับ Backend API และตัวที่ยังต้องปรับปรุง

**อัปเดตล่าสุด:** 2024-12-20

## 🔄 การปรับปรุงล่าสุด

### 2024-12-20
- ✅ **ลบ `user.service.ts`** - Migrate ไปใช้ `MemberService`, `RbacService`, `CompanyService` แล้ว
- ✅ **ลบ `employee.service.ts`** - Migrate ไปใช้ `CompanyEmployeeService` แล้ว
- ✅ แก้ไข `RbacService` endpoints: `/roles/roles` → `/rbac/roles`, `/roles/permissions` → `/rbac/permissions`
- ✅ แก้ไข `users.component.ts`: ใช้ `MemberService`, `RbacService`, `CompanyService` แทน `UserService`
- ✅ แก้ไข `users.component.html`: ใช้ `getRoles()` และ `getCompanies()` getters แทน `userService`
- ✅ แก้ไข `doors.component.html`: ใช้ `snake_case` (`company_employee_id`, `employee_id`, `access_type`)
- ✅ เพิ่ม `resetPassword()` และ `exportMembers()` ใน `MemberService`

### 2024-12-19
- ✅ แก้ไข `user.model.ts`: ปรับ `User` interface ให้ extend `Member` โดยตรง (simplified)
- ✅ แก้ไข `auth.service.ts`: ปรับ `normalizeUser` method เพื่อลบ duplicate keys และใช้ `snake_case` อย่างสม่ำเสมอ
- ✅ แก้ไข `register` method: เปลี่ยน `actorType` เป็น `actor_type` และ `phoneNumber` เป็น `phone_number`

---

## ✅ Models และ Services ที่ตรงกับ Backend API แล้ว

### 1. **Member** (User Account)
- **Model:** `member.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`member_id`, `first_name`, `last_name`, `phone_number`, `actor_type`, `member_type`, `is_active`, `is_verified`)
  - ตรงกับ `member_schema.py`
- **Service:** `member.service.ts` ✅
  - Extend `BaseCrudService<Member, MemberCreate, MemberUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/members`

### 2. **Company**
- **Model:** `company.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`company_id`, `company_name`, `company_code`, `company_info`, `owner_name`)
  - ตรงกับ `company_schema.py`
- **Service:** `company.service.ts` ✅
  - Extend `BaseCrudService<Company, CompanyCreate, CompanyUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/companies`

### 3. **Visitor**
- **Model:** `visitor.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`visitor_id`, `company_id`, `first_name`, `last_name`, `visitor_type`, `visit_purpose`, `host_employee_id`)
  - ตรงกับ `visitor_schema.py`
- **Service:** `visitor.service.ts` ✅
  - Extend `BaseCrudService<Visitor, VisitorCreate, VisitorUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/visitors`

### 4. **Guest**
- **Model:** `guest.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`id`, `company_id`, `host_employee_id`, `check_in_time`, `check_out_time`, `expected_duration`)
  - ตรงกับ `guest_schema.py`
- **Service:** `guest.service.ts` ✅
  - Extend `BaseCrudService<Guest, GuestCreate, GuestUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/guests`

### 5. **Vehicle**
- **Model:** `vehicle.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`vehicle_id`, `plate_number`, `company_id`, `check_in_time`, `check_out_time`)
  - ตรงกับ `vehicle_schema.py`
- **Service:** `vehicle.service.ts` ✅
  - Extend `BaseCrudService<Vehicle, VehicleCreate, VehicleUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/vehicles`

### 6. **Parking**
- **Model:** `parking.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`vehicle_id`, `space_number`, `hourly_rate`, `check_in_time`, `check_out_time`)
  - ตรงกับ `parking_schema.py`
- **Service:** `parking.service.ts` ✅
  - Extend `BaseCrudService` (multiple entities)
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoints: `/parking/vehicles`, `/parking/spaces`, `/parking/events`, `/parking/reservations`

### 7. **Device**
- **Model:** `device.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`device_id`, `device_name`, `device_type`, `api_key`, `last_seen`, `created_at`, `updated_at`)
  - ตรงกับ `device_schema.py`
- **Service:** `device.service.ts` ✅
  - Extend `BaseCrudService<Device, DeviceCreate, DeviceUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/devices`

### 8. **Department**
- **Model:** `department.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`department_id`, `th_name`, `eng_name`, `company_id`)
  - ตรงกับ `department_schema.py`
- **Service:** `department.service.ts` ✅
  - Extend `BaseCrudService<Department, DepartmentCreate, DepartmentUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/departments`

### 9. **Position**
- **Model:** `position.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`position_id`, `th_name`, `eng_name`, `company_id`)
  - ตรงกับ `position_schema.py`
- **Service:** `position.service.ts` ✅
  - Extend `BaseCrudService<Position, PositionCreate, PositionUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/positions`

### 10. **CompanyEmployee**
- **Model:** `company-employee.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`company_employee_id`, `member_id`, `employee_id`, `department_id`, `position_id`, `company_id`, `start_date`, `boss_id`)
  - ตรงกับ `company_employee_schema.py`
- **Service:** `company-employee.service.ts` ✅
  - Extend `BaseCrudService<CompanyEmployee, CompanyEmployeeCreate, CompanyEmployeeUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/company-employees`

### 11. **Shift**
- **Model:** `shift.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`shift_id`, `company_id`, `start_time`, `end_time`)
  - ตรงกับ `shift_schema.py`
- **Service:** `shift.service.ts` ✅
  - Extend `BaseCrudService<Shift, ShiftCreate, ShiftUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/shifts`

### 12. **Leave**
- **Model:** `leave.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`leave_id`, `company_employee_id`, `leave_type`, `start_date`, `end_date`, `approval_status`)
  - ตรงกับ `leave_schema.py`
- **Service:** `leave.service.ts` ✅
  - Extend `BaseCrudService<Leave, LeaveCreate, LeaveUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/leaves`

### 13. **CompanyLocation**
- **Model:** `company-location.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`location_id`, `company_id`, `latitude`, `longitude`)
  - ตรงกับ `company_location_schema.py`
- **Service:** `company-location.service.ts` ✅
  - Extend `BaseCrudService<CompanyLocation, CompanyLocationCreate, CompanyLocationUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/company-locations`

### 14. **Event**
- **Model:** `event.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`event_name`, `start_date`, `end_date`, `company_id`, `public_url`, `event_type`, `max_attendees`)
  - ตรงกับ `event_schema.py`
- **Service:** `event.service.ts` ✅
  - Extend `BaseCrudService<Event, EventCreate, EventUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/events`

### 15. **Door**
- **Model:** `door.model.ts` ✅
  - ใช้ `snake_case` ทั้งหมด (`door_name`, `company_id`, `door_id`, `company_employee_id`)
  - ตรงกับ `door_schema.py`
- **Service:** `door.service.ts` ✅
  - Extend `BaseCrudService<Door, DoorCreate, DoorUpdate>`
  - ใช้ `skipTransform: true` ในทุก API calls
  - Endpoint: `/doors`

---

## ⚠️ Models และ Services ที่ยังต้องปรับปรุง

### 1. **User** (Frontend-Specific Interface)
- **Model:** `user.model.ts` ✅ (ปรับปรุงแล้ว)
  - Extends `Member` โดยตรง (ไม่ซ้ำซ้อน)
  - เพิ่มเฉพาะ fields ที่จำเป็นสำหรับ frontend:
    - `id`, `memberId`: Backward compatibility
    - `companyId`, `company_id`, `companyName`: Company info จาก JWT
    - `fullName`: Computed field สำหรับ UI
    - `password`: Form data
  - **สถานะ:** Frontend-specific interface สำหรับ UI และ backward compatibility
  - **คำแนะนำ:** 
    - ใช้ `Member` สำหรับ API calls (ตรงกับ backend 100%)
    - ใช้ `User` สำหรับ frontend state และ UI components
- **Service:** `user.service.ts` ✅ **ลบแล้ว** (2024-12-20)
  - **Migration:** 
    - Member operations → `MemberService`
    - Role operations → `RbacService`
    - Company operations → `CompanyService`

### 2. **Employee** (Legacy)
- **Model:** `employee.model.ts` ⚠️ (Legacy - ไม่แนะนำให้ใช้)
  - ใช้ `camelCase` (`employeeCode`, `firstName`, `lastName`, `departmentId`, `positionId`, `companyId`, `isActive`)
  - **คำแนะนำ:** ใช้ `CompanyEmployee` และ `EmployeeDisplay` แทน
- **Service:** `employee.service.ts` ✅ **ลบแล้ว** (2024-12-20)
  - **Migration:** ใช้ `CompanyEmployeeService` แทน
  - **Components Migrated:** `hr-dashboard.component.ts`, `access-control.component.ts`

### 3. **Timestamp / EmployeeTimestamp**
- **Model:** `timestamp.model.ts` / `employee-timestamp.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `timestamp.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 4. **Visitor Extended**
- **Model:** `visitor-extended.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `visitor-extended.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 5. **RFID Card**
- **Model:** `rfid-card.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `rfid-card.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 6. **QR Code**
- **Model:** `qr-code.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `qr-code.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 7. **Report**
- **Model:** `report.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `report.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 8. **Notification**
- **Model:** `notification.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `notification.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 9. **Audit**
- **Model:** `audit.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `audit.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 10. **System / System Configuration**
- **Model:** `system.model.ts` ⚠️
  - ต้องตรวจสอบว่าใช้ `snake_case` หรือไม่
- **Service:** `system.service.ts` / `system-configuration.service.ts` ⚠️
  - ต้องตรวจสอบว่า extend `BaseCrudService` หรือไม่

### 11. **Other Services** (ยังไม่ได้ตรวจสอบ)
- `kiosk.service.ts`
- `license.service.ts`
- `maintenance.service.ts`
- `backup.service.ts`
- `template-management.service.ts`
- `module-subscription.service.ts`
- `performance.service.ts`
- `safety.service.ts`
- `hardware-monitoring.service.ts`
- `monitoring.service.ts`
- `ai-model.service.ts`
- `alert.service.ts`
- และอื่นๆ

---

## 📊 สรุปสถิติ

### ✅ ตรงกับ Backend API แล้ว
- **Models:** 15+ models
- **Services:** 15+ services

### ⚠️ ยังต้องปรับปรุง
- **Models:** ~35+ models (ต้องตรวจสอบ)
- **Services:** ~65+ services (ต้องตรวจสอบ)

---

## 🔧 แนวทางการปรับปรุง

### สำหรับ Models:
1. ✅ เปลี่ยน field names จาก `camelCase` เป็น `snake_case`
2. ✅ ตรวจสอบให้ตรงกับ backend schema (`*_schema.py`)
3. ✅ ใช้ `BaseTimestamps` สำหรับ `created_at`, `updated_at`
4. ✅ ใช้ `UUID` type สำหรับ ID fields

### สำหรับ Services:
1. ✅ Extend `BaseCrudService<T, TCreate, TUpdate>`
2. ✅ ใช้ `skipTransform: true` ในทุก API calls
3. ✅ ใช้ `baseEndpoint` property
4. ✅ ลบ manual CRUD operations ที่ซ้ำซ้อน

### Checklist สำหรับการ Migrate:
- [ ] ตรวจสอบ backend schema (`*_schema.py`)
- [ ] ปรับ model ให้ใช้ `snake_case`
- [ ] ปรับ service ให้ extend `BaseCrudService`
- [ ] เพิ่ม `skipTransform: true` ในทุก API calls
- [ ] อัปเดต components ที่ใช้ model/service
- [ ] ทดสอบ CRUD operations
- [ ] ตรวจสอบ linter errors

---

## 📝 หมายเหตุ

1. **Backward Compatibility:** Models เก่าที่ใช้ `camelCase` ยังคงใช้งานได้ แต่แนะนำให้ migrate ไปใช้ `snake_case`
2. **User vs Member:** ใช้ `Member` model แทน `User` model ในโค้ดใหม่
3. **Employee vs CompanyEmployee:** ใช้ `CompanyEmployee` model แทน `Employee` model ในโค้ดใหม่
4. **BaseCrudService:** Services ใหม่ควร extend `BaseCrudService` เพื่อลดความซ้ำซ้อน
5. **skipTransform:** ใช้ `skipTransform: true` เพื่อใช้ `snake_case` โดยตรงกับ backend

---

**เอกสารนี้จะอัปเดตเมื่อมีการปรับปรุง models และ services เพิ่มเติม**

