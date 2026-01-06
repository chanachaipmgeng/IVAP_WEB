# Base Component

## 📋 ภาพรวม

`BaseComponent` เป็น abstract base class สำหรับ Angular components ที่ให้คุณสมบัติ:

- ✅ **Automatic subscription management** - ป้องกัน memory leaks
- ✅ **Helper methods** - สำหรับ operations ที่ใช้บ่อย
- ✅ **Lifecycle management** - จัดการ component lifecycle อัตโนมัติ

## 🚀 การใช้งาน

### Basic Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { MyService } from '@core/services/my.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `...`
})
export class MyComponent extends BaseComponent implements OnInit {
  data: any[] = [];

  constructor(private myService: MyService) {
    super();
  }

  ngOnInit(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.myService.data$,
      data => this.data = data
    );
  }
}
```

### With Error Handling

```typescript
ngOnInit(): void {
  this.subscribe(
    this.myService.data$,
    data => this.data = data,
    error => {
      console.error('Error loading data:', error);
      // Handle error
    }
  );
}
```

### Multiple Subscriptions

```typescript
ngOnInit(): void {
  // Multiple subscriptions - all auto-unsubscribe
  this.subscribe(
    this.service1.data$,
    data => this.data1 = data
  );

  this.subscribe(
    this.service2.data$,
    data => this.data2 = data
  );

  this.subscribe(
    this.service3.data$,
    data => this.data3 = data
  );
}
```

## 🔧 Methods

### subscribe()

Subscribe to Observable with automatic unsubscribe.

```typescript
protected subscribe<T>(
  observable: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void
): Subscription
```

**Example:**
```typescript
this.subscribe(
  this.service.data$,
  data => this.data = data,
  error => console.error(error)
);
```

### subscribeUntil()

Subscribe using takeUntil pattern (backward compatibility).

```typescript
protected subscribeUntil<T>(
  observable: Observable<T>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void
): Subscription
```

### safeAsync()

Safely execute async operations.

```typescript
protected safeAsync(
  fn: () => Promise<any>,
  onError?: (error: any) => void
): void
```

**Example:**
```typescript
this.safeAsync(async () => {
  const data = await this.service.loadData();
  this.data = data;
}, error => {
  console.error('Failed to load data:', error);
});
```

### debounce()

Debounce function calls.

```typescript
protected debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void
```

**Example:**
```typescript
export class SearchComponent extends BaseComponent {
  private debouncedSearch = this.debounce((query: string) => {
    this.performSearch(query);
  }, 300);

  onInputChange(query: string): void {
    this.debouncedSearch(query);
  }
}
```

### throttle()

Throttle function calls.

```typescript
protected throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 100
): (...args: Parameters<T>) => void
```

**Example:**
```typescript
export class ScrollComponent extends BaseComponent {
  private throttledScroll = this.throttle(() => {
    this.handleScroll();
  }, 100);

  onScroll(): void {
    this.throttledScroll();
  }
}
```

### safeUpdate()

Safely update component state (only if component is active).

```typescript
protected safeUpdate(updateFn: () => void): void
```

**Example:**
```typescript
this.service.loadData().then(data => {
  this.safeUpdate(() => {
    this.data = data;
    this.loading = false;
  });
});
```

## 📝 Migration Guide

### Before (Without BaseComponent)

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  data: any[] = [];

  ngOnInit(): void {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### After (With BaseComponent)

```typescript
export class MyComponent extends BaseComponent implements OnInit {
  data: any[] = [];

  ngOnInit(): void {
    this.subscribe(
      this.service.data$,
      data => this.data = data
    );
  }
  // ✅ ngOnDestroy handled automatically!
}
```

## ✅ Benefits

1. **Less Boilerplate** - ไม่ต้องเขียน destroy$ และ ngOnDestroy ทุกครั้ง
2. **Memory Leak Prevention** - Auto-unsubscribe อัตโนมัติ
3. **Consistent Pattern** - ใช้ pattern เดียวกันทั้งโปรเจกต์
4. **Helper Methods** - มี utility methods ที่ใช้บ่อย
5. **Type Safe** - Full TypeScript support

## 🎯 Best Practices

### ✅ DO

```typescript
// ✅ Use subscribe() for automatic cleanup
this.subscribe(
  this.service.data$,
  data => this.data = data
);

// ✅ Use safeAsync() for async operations
this.safeAsync(async () => {
  const data = await this.service.loadData();
  this.data = data;
});

// ✅ Use debounce/throttle for performance
const debouncedSearch = this.debounce((query: string) => {
  this.search(query);
}, 300);
```

### ❌ DON'T

```typescript
// ❌ Don't manually manage subscriptions
this.service.data$.subscribe(data => {
  this.data = data;
  // Missing unsubscribe - memory leak!
});

// ❌ Don't create destroy$ manually
private destroy$ = new Subject<void>(); // Not needed with BaseComponent

// ❌ Don't forget to extend BaseComponent
export class MyComponent implements OnInit {
  // Missing BaseComponent - no auto-cleanup
}
```

## 🔍 Troubleshooting

### Issue: Subscriptions not unsubscribing

**Solution:** Make sure you're using `this.subscribe()` instead of direct `.subscribe()`

```typescript
// ❌ Wrong
this.service.data$.subscribe(data => this.data = data);

// ✅ Correct
this.subscribe(
  this.service.data$,
  data => this.data = data
);
```

### Issue: Component destroyed but async operation completes

**Solution:** Use `safeUpdate()` to check if component is still active

```typescript
this.service.loadData().then(data => {
  this.safeUpdate(() => {
    this.data = data;
  });
});
```

## 📚 Related

- [BaseCrudService](../services/base-crud.service.ts) - Base service for CRUD operations
- [Angular Lifecycle Hooks](https://angular.io/guide/lifecycle-hooks)
- [RxJS takeUntilDestroyed](https://rxjs.dev/api/operators/takeUntilDestroyed)

---

**สร้างเมื่อ**: 2024  
**อัปเดตล่าสุด**: 2024
