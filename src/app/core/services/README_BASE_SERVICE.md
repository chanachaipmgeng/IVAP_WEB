# Base CRUD Service

## Overview

`BaseCrudService<T>` เป็น abstract base class สำหรับ services ที่ต้องการ CRUD operations พื้นฐาน

**ประโยชน์:**
- ✅ ลด code duplication ได้ ~70%
- ✅ Standardize API calls
- ✅ Type-safe operations
- ✅ Easy to maintain
- ✅ Consistent error handling

## Usage

### Basic Usage

```typescript
import { Injectable } from '@angular/core';
import { BaseCrudService } from './base-crud.service';
import { ApiService } from './api.service';
import { Employee } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseCrudService<Employee> {
  constructor(api: ApiService) {
    super(api, 'employees'); // endpoint: /api/v1/employees
  }
  
  // Add custom methods here
  uploadFace(id: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.api.post(`${this.apiUrl}/${id}/face`, formData);
  }
  
  getSubordinates(id: string): Observable<Employee[]> {
    return this.api.get<Employee[]>(`${this.apiUrl}/${id}/subordinates`);
  }
}
```

### With Company ID

For services that need company_id in the URL:

```typescript
@Injectable({ providedIn: 'root' })
export class VisitorService extends BaseCrudService<Visitor> {
  constructor(
    api: ApiService,
    private authService: AuthService
  ) {
    super(api, `visitors/company/${authService.currentUser()?.companyId}`);
  }
  
  // Or override methods if needed
  override getAll(params?: any): Observable<Visitor[]> {
    const companyId = this.authService.currentUser()?.companyId;
    return this.api.get<Visitor[]>(`${environment.apiUrl}/visitors/company/${companyId}`, params);
  }
}
```

## Available Methods

### Read Operations

```typescript
// Get all items
service.getAll().subscribe(items => console.log(items));

// Get paginated items
service.getPaginated(1, 20).subscribe(response => {
  console.log(response.data);
  console.log(response.pagination);
});

// Get by ID
service.getById('uuid').subscribe(item => console.log(item));

// Search
service.search('john').subscribe(results => console.log(results));

// Count
service.count().subscribe(({ count }) => console.log(count));

// Check exists
service.exists('uuid').subscribe(exists => console.log(exists));
```

### Write Operations

```typescript
// Create
service.create({ name: 'John' }).subscribe(created => console.log(created));

// Update (PUT - full update)
service.update('uuid', { name: 'Jane' }).subscribe(updated => console.log(updated));

// Patch (PATCH - partial update)
service.patch('uuid', { status: 'active' }).subscribe(updated => console.log(updated));

// Delete
service.delete('uuid').subscribe(() => console.log('Deleted'));
```

### Bulk Operations

```typescript
// Bulk create
service.bulkCreate([
  { name: 'John' },
  { name: 'Jane' }
]).subscribe(created => console.log(created));

// Bulk update
service.bulkUpdate([
  { id: 'uuid1', data: { status: 'active' } },
  { id: 'uuid2', data: { status: 'inactive' } }
]).subscribe(updated => console.log(updated));

// Bulk delete
service.bulkDelete(['uuid1', 'uuid2']).subscribe(() => console.log('Deleted'));
```

### Utility Operations

```typescript
// Get statistics
service.getStatistics().subscribe(stats => console.log(stats));

// Export data
service.export('csv').subscribe(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
});
```

## Migration Guide

### Before (Without Base Service)

```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;
  
  constructor(private api: ApiService) {}
  
  getAll(params?: any): Observable<Employee[]> {
    return this.api.get<Employee[]>(this.apiUrl, params);
  }
  
  getById(id: string): Observable<Employee> {
    return this.api.get<Employee>(`${this.apiUrl}/${id}`);
  }
  
  create(data: any): Observable<Employee> {
    return this.api.post<Employee>(this.apiUrl, data);
  }
  
  update(id: string, data: any): Observable<Employee> {
    return this.api.put<Employee>(`${this.apiUrl}/${id}`, data);
  }
  
  delete(id: string): Observable<void> {
    return this.api.delete(`${this.apiUrl}/${id}`);
  }
  
  // 100+ lines of boilerplate code...
}
```

### After (With Base Service)

```typescript
@Injectable({ providedIn: 'root' })
export class EmployeeService extends BaseCrudService<Employee> {
  constructor(api: ApiService) {
    super(api, 'employees');
  }
  
  // Only custom methods! (~10-20 lines)
  uploadFace(id: string, image: File): Observable<any> {
    // Custom logic
  }
}
```

**Result:** ✅ Reduced from ~100 lines to ~20 lines (-80%)

## Services to Migrate

### Priority 1 (Most Used)
1. ✅ `employee.service.ts`
2. ✅ `visitor.service.ts`
3. ✅ `guest.service.ts`
4. ✅ `vehicle.service.ts`
5. ✅ `parking.service.ts`

### Priority 2 (Important)
6. `leave.service.ts`
7. `timestamp.service.ts`
8. `biometric-data.service.ts`
9. `qr-code.service.ts`
10. `rfid-card.service.ts`

### Priority 3 (Nice to have)
11. `company-location.service.ts`
12. `alert.service.ts`
13. `ai-model.service.ts`

## Benefits

### Code Reduction

**Before:**
- 30 services × 100 lines = 3,000 lines
- Lots of duplication
- Hard to maintain

**After:**
- 30 services × 30 lines = 900 lines
- Consistent patterns
- Easy to maintain

**Savings:** -2,100 lines (-70%) ✅

### Consistency

All services now use:
- ✅ Same method names
- ✅ Same parameters
- ✅ Same return types
- ✅ Same error handling

### Type Safety

```typescript
// Type-safe operations
const employee: Employee = await service.getById('uuid');
const employees: Employee[] = await service.getAll();
```

## Best Practices

1. **Use Generic Type:** Always specify the model type
   ```typescript
   extends BaseCrudService<Employee>
   ```

2. **Keep Custom Methods:** Only add methods that are specific to your service
   ```typescript
   uploadFace(id: string, image: File): Observable<any>
   ```

3. **Override When Needed:** Override base methods if you need custom behavior
   ```typescript
   override getAll(params?: any): Observable<T[]> {
     // Custom implementation
   }
   ```

4. **Use Protected apiUrl:** Access the base URL in custom methods
   ```typescript
   return this.api.post(`${this.apiUrl}/${id}/custom`, data);
   ```

## Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { ApiService } from './api.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EmployeeService,
        { provide: ApiService, useValue: apiSpy }
      ]
    });
    
    service = TestBed.inject(EmployeeService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should call API service getAll', () => {
    service.getAll();
    expect(apiService.get).toHaveBeenCalled();
  });
});
```

## Migration Checklist

- [ ] Import `BaseCrudService`
- [ ] Extend `BaseCrudService<YourModel>`
- [ ] Remove boilerplate CRUD methods
- [ ] Keep only custom methods
- [ ] Update imports if needed
- [ ] Test the service
- [ ] Update documentation

---

**Created:** November 16, 2025  
**Purpose:** Reduce code duplication and standardize service patterns  
**Status:** Ready for use ✅
