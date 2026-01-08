# Schema Compliance Report

## สรุปการตรวจสอบ Schema Compliance

**วันที่:** 2024-12-20

### ✅ Services ที่แก้ไขแล้ว

#### 1. **Timestamp Service** ✅ **แก้ไขแล้ว**

**ปัญหา:**
- `transformCreateToBackend()` ใช้ `company_employeeId` (camelCase) แต่ backend ต้องการ `company_employee_id` (snake_case)
- ใช้ `timestampType` แต่ backend ต้องการ `timestamp_type`
- ใช้ `locationName` แต่ backend ต้องการ `location_name`
- ใช้ `photoTimestamp` แต่ backend ต้องการ `photo_timestamp`

**แก้ไข:**
- ✅ เปลี่ยน `company_employeeId` → `company_employee_id`
- ✅ เปลี่ยน `timestampType` → `timestamp_type`
- ✅ เปลี่ยน `locationName` → `location_name`
- ✅ เปลี่ยน `photoTimestamp` → `photo_timestamp`
- ✅ `transformUpdateToBackend()` แก้ไขเหมือนกัน

**ไฟล์:** `IVAP_WEB/src/app/core/services/timestamp.service.ts`

---

#### 2. **Guest Model** ✅ **แก้ไขแล้ว**

**ปัญหา:**
- `GuestCreate` interface มี `company_id: UUID` แต่ backend schema `GuestCreate` ไม่มี field นี้
- `company_id` อยู่ใน URL path parameter (`/guests/company/{company_id}`) ไม่ใช่ใน request body

**แก้ไข:**
- ✅ ลบ `company_id` ออกจาก `GuestCreate` interface
- ✅ เพิ่ม comment อธิบายว่า `company_id` อยู่ใน URL path

**ไฟล์:** `IVAP_WEB/src/app/core/models/guest.model.ts`

---

### ✅ Services ที่ถูกต้องแล้ว

#### 1. **CompanyEmployee Service** ✅

**ตรวจสอบ:**
- ✅ `CompanyEmployeeCreate` ส่ง nested object `member`, `position`, `department` ถูกต้อง
- ✅ `CompanyEmployeeUpdate` ส่ง nested object ถูกต้อง
- ✅ Field names ตรงกับ backend schema (`CompanyEmployeePost`, `CompanyEmployeeUpdate`)

**ตัวอย่าง payload:**
```typescript
{
  member: {
    email: "user@example.com",
    first_name: "John",
    last_name: "Doe",
    picture: undefined
  },
  position: {
    position_id: "uuid",
    th_name: "",
    eng_name: ""
  },
  department: {
    department_id: "uuid",
    th_name: "",
    eng_name: ""
  },
  employee_id: "EMP001",
  salary: 50000,
  boss_id: "EMP000",
  company_role_type: "EMPLOYEE",
  emp_type: "FULL_TIME",
  start_date: "2024-01-15T09:00:00Z"
}
```

---

#### 2. **Parking Service** ✅

**ตรวจสอบ:**
- ✅ `ParkingVehicleCreate` ตรงกับ backend `VehicleCreate` schema
- ✅ `ParkingSpaceCreate` ตรงกับ backend `ParkingSpaceCreate` schema
- ✅ `VehicleEntryRequest` ตรงกับ backend `VehicleEntryRequest` schema
- ✅ `VehicleExitRequest` ตรงกับ backend `VehicleExitRequest` schema
- ✅ `ParkingReservationCreate` ตรงกับ backend `ParkingReservationCreate` schema

**Field names:**
- ✅ ใช้ `snake_case` ทั้งหมด (`plate_number`, `vehicle_type`, `space_id`, etc.)
- ✅ Optional fields ถูกต้อง

---

#### 3. **Guest Service** ✅

**ตรวจสอบ:**
- ✅ `GuestCreate` ไม่มี `company_id` ใน body (ถูกต้อง - อยู่ใน URL path)
- ✅ `GuestUpdate` ตรงกับ backend `GuestUpdate` schema
- ✅ `GuestCheckIn` ตรงกับ backend `GuestCheckIn` schema
- ✅ `GuestCheckOut` ตรงกับ backend `GuestCheckOut` schema

---

#### 4. **NotificationApi Service** ✅

**ตรวจสอบ:**
- ✅ Payload mapping จาก `camelCase` เป็น `snake_case` ถูกต้อง
- ✅ `html_body`, `image_path`, `sticker_package_id`, `sticker_id`, `webhook_name`, `template_id`, `additional_data`, `event_type`, `company_id`, `user_id`, `notification_channels` ถูกต้อง

---

### 📋 Checklist การตรวจสอบ Schema

สำหรับ services ใหม่ที่เพิ่มเข้ามา ควรตรวจสอบ:

1. ✅ Field names ใช้ `snake_case` ตรงกับ backend
2. ✅ Required fields ครบถ้วน
3. ✅ Optional fields ถูกต้อง
4. ✅ Nested objects structure ตรงกับ backend schema
5. ✅ Enum values ตรงกับ backend
6. ✅ Date/datetime format ถูกต้อง (ISO 8601)
7. ✅ UUID format ถูกต้อง
8. ✅ Path parameters ไม่ควรอยู่ใน request body
9. ✅ Query parameters ไม่ควรอยู่ใน request body

---

### 🔍 Services ที่ต้องตรวจสอบเพิ่มเติม

1. **VisitorExtended Service** - ตรวจสอบ payload structure
2. **BiometricData Service** - ตรวจสอบ payload structure
3. **QRCode Service** - ตรวจสอบ payload structure
4. **RFIDCard Service** - ตรวจสอบ payload structure

---

**อัปเดตล่าสุด:** 2024-12-20









