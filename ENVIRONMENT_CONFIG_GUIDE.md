# Angular Environment Configuration Guide

## 📋 ปัญหา: environment.prod.ts ไม่ทำงาน

### สาเหตุ
Angular build configuration ไม่มี `fileReplacements` ทำให้เมื่อ build production ไม่ได้แทนที่ `environment.ts` ด้วย `environment.prod.ts`

### ✅ วิธีแก้ไข

**ไฟล์: `frontend/angular.json`**

เพิ่ม `fileReplacements` ใน production configuration:

```json
"configurations": {
  "production": {
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.prod.ts"
      }
    ],
    // ... rest of config
  }
}
```

## 🔧 การใช้งาน Environment Files

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  baseUrl: 'http://localhost:8000',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
};
```

### Production (`environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ivap.tech/api/v1',
  baseUrl: 'https://ivap.tech/',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
};
```

## 🚀 Build Commands

### Development Build
```bash
ng build --configuration development
# หรือ
ng build
```

### Production Build
```bash
ng build --configuration production
# หรือ
ng build --prod
```

## ✅ ตรวจสอบว่าใช้ Environment ถูกต้อง

### 1. ตรวจสอบใน Code
```typescript
import { environment } from '../../../environments/environment';

console.log('API URL:', environment.apiUrl);
console.log('Production:', environment.production);
```

### 2. ตรวจสอบใน Build Output
หลังจาก build production:
```bash
# ตรวจสอบว่าใช้ environment.prod.ts
grep -r "ivap.tech" dist/frontend/browser/
```

### 3. ตรวจสอบใน Browser Console
เปิด browser console และตรวจสอบ:
```javascript
// ควรเห็น production URL
console.log(environment.apiUrl); // ควรเป็น https://ivap.tech/api/v1
```

## ⚠️ หมายเหตุ

1. **อย่า hardcode URLs** ใน services - ใช้ `environment.apiUrl` เสมอ
2. **ตรวจสอบ fileReplacements** - ต้องมีใน production configuration
3. **Build production** - ใช้ `--configuration production` เพื่อให้ fileReplacements ทำงาน
4. **Environment variables** - ถ้าต้องการใช้ environment variables จากระบบ ให้ใช้ `process.env` (ต้องตั้งค่าใน build script)

## 🔐 Security Notes

- **อย่า commit secrets** ใน environment files
- **ใช้ environment variables** สำหรับ sensitive data (API keys, etc.)
- **ตรวจสอบ production URLs** ก่อน deploy

## 📝 Checklist

- [x] เพิ่ม `fileReplacements` ใน `angular.json`
- [ ] ตั้งค่า `apiUrl` ใน `environment.prod.ts`
- [ ] ตั้งค่า `baseUrl` ใน `environment.prod.ts`
- [ ] ตั้งค่า Google Maps API key (ถ้าใช้)
- [ ] ทดสอบ build production
- [ ] ตรวจสอบว่าใช้ production environment ใน build output
- [ ] ทดสอบ API calls ใน production build
