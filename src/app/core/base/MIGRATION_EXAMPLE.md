# Migration Example: CalendarDemoComponent

## 📋 Before: Manual Subscription Management

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CalendarService } from '@core/services/calendar.service';

@Component({
  selector: 'app-calendar-demo',
  standalone: true,
  // ...
})
export class CalendarDemoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  events: CalendarEvent[] = [];

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.calendarService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe((events: CalendarEvent[]) => {
        this.events = events;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## ✅ After: Using BaseComponent

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { CalendarService } from '@core/services/calendar.service';

@Component({
  selector: 'app-calendar-demo',
  standalone: true,
  // ...
})
export class CalendarDemoComponent extends BaseComponent implements OnInit {
  events: CalendarEvent[] = [];

  constructor(private calendarService: CalendarService) {
    super(); // ✅ Don't forget to call super()
  }

  ngOnInit(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.calendarService.getEvents(),
      events => {
        this.events = events;
      }
    );
  }
  // ✅ ngOnDestroy handled automatically - no need to implement!
}
```

## 📊 Changes Summary

### Removed
- ❌ `private destroy$ = new Subject<void>();`
- ❌ `OnDestroy` interface
- ❌ `ngOnDestroy()` method
- ❌ `takeUntil(this.destroy$)` pipe

### Added
- ✅ `extends BaseComponent`
- ✅ `super()` call in constructor
- ✅ `this.subscribe()` method

### Benefits
- 📉 **Less Code**: Reduced from ~25 lines to ~15 lines
- 🛡️ **Memory Safe**: Automatic cleanup guaranteed
- 🎯 **Consistent**: Same pattern across all components
- 🚀 **Maintainable**: Easier to understand and maintain

---

## 🔄 Step-by-Step Migration

### Step 1: Import BaseComponent

```typescript
// Add import
import { BaseComponent } from '@core/base/base.component';
```

### Step 2: Extend BaseComponent

```typescript
// Change from:
export class MyComponent implements OnInit, OnDestroy {

// To:
export class MyComponent extends BaseComponent implements OnInit {
```

### Step 3: Remove destroy$ and OnDestroy

```typescript
// Remove:
private destroy$ = new Subject<void>();
// And remove OnDestroy from implements
```

### Step 4: Add super() in constructor

```typescript
constructor(private myService: MyService) {
  super(); // ✅ Add this
}
```

### Step 5: Replace subscriptions

```typescript
// Change from:
this.service.data$
  .pipe(takeUntil(this.destroy$))
  .subscribe(data => {
    this.data = data;
  });

// To:
this.subscribe(
  this.service.data$,
  data => this.data = data
);
```

### Step 6: Remove ngOnDestroy

```typescript
// Remove entire ngOnDestroy method:
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## ✅ Migration Checklist

- [ ] Import BaseComponent
- [ ] Extend BaseComponent
- [ ] Remove OnDestroy from implements
- [ ] Remove destroy$ property
- [ ] Add super() in constructor
- [ ] Replace all .pipe(takeUntil(this.destroy$)).subscribe() with this.subscribe()
- [ ] Remove ngOnDestroy() method
- [ ] Test component works correctly
- [ ] Verify no memory leaks

---

**อัปเดตล่าสุด**: 2024
