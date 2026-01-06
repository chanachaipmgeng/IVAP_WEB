# State Management Guidelines

## 📋 ภาพรวม

เอกสารนี้กำหนดแนวทางการจัดการ state ใน Angular application โดยใช้ Angular Signals และ RxJS Observables

**Last Updated:** 2025-01-21

---

## 🎯 หลักการพื้นฐาน

### เมื่อไหร่ควรใช้ Signals

✅ **ใช้ Signals สำหรับ:**
- Local component state
- Derived/computed values
- UI state (loading, errors, form state)
- Simple reactive state ที่ไม่ต้อง async

### เมื่อไหร่ควรใช้ Observables

✅ **ใช้ Observables สำหรับ:**
- HTTP requests (API calls)
- Event streams
- WebSocket connections
- Complex async operations
- เมื่อต้องใช้ RxJS operators (debounce, throttle, switchMap, etc.)

---

## 📝 Patterns และ Best Practices

### 1. Service Pattern

#### ✅ Recommended: Signals for State, Observables for Operations

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  // ✅ Signals for reactive state
  private items = signal<Item[]>([]);
  public readonly items = this.items.asReadonly();
  
  private loading = signal<boolean>(false);
  public readonly loading = this.loading.asReadonly();
  
  private error = signal<string | null>(null);
  public readonly error = this.error.asReadonly();
  
  // ✅ Computed signals
  public readonly itemCount = computed(() => this.items().length);
  public readonly hasItems = computed(() => this.items().length > 0);
  
  // ✅ Observables for async operations
  constructor(private http: HttpClient) {}
  
  loadItems(): Observable<Item[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<Item[]>('/api/items').pipe(
      tap(items => {
        this.items.set(items);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set(error.message);
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }
  
  addItem(item: Item): Observable<Item> {
    return this.http.post<Item>('/api/items', item).pipe(
      tap(newItem => {
        this.items.update(items => [...items, newItem]);
      })
    );
  }
  
  updateItem(id: string, item: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`/api/items/${id}`, item).pipe(
      tap(updatedItem => {
        this.items.update(items =>
          items.map(i => i.id === id ? updatedItem : i)
        );
      })
    );
  }
  
  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`/api/items/${id}`).pipe(
      tap(() => {
        this.items.update(items => items.filter(i => i.id !== id));
      })
    );
  }
}
```

### 2. Component Pattern

#### ✅ Recommended: Use BaseComponent for Subscription Management

```typescript
import { Component, OnInit, computed } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { MyService } from '@core/services/my.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `
    <div *ngIf="service.loading()">Loading...</div>
    <div *ngIf="service.error()">{{ service.error() }}</div>
    <div *ngFor="let item of service.items()">
      {{ item.name }}
    </div>
    <p>Total: {{ service.itemCount() }}</p>
  `
})
export class MyComponent extends BaseComponent implements OnInit {
  // ✅ Use computed signals from service
  items = computed(() => this.service.items());
  loading = computed(() => this.service.loading());
  error = computed(() => this.service.error());
  itemCount = computed(() => this.service.itemCount());
  
  constructor(public service: MyService) {
    super(); // ✅ Must call super()
  }
  
  ngOnInit(): void {
    // ✅ Use subscribe() from BaseComponent for auto-unsubscribe
    this.subscribe(
      this.service.loadItems(),
      items => {
        // Data is already set in service via signal
        console.log('Items loaded:', items);
      },
      error => {
        console.error('Error loading items:', error);
      }
    );
  }
  
  addItem(): void {
    const newItem = { name: 'New Item' };
    this.subscribe(
      this.service.addItem(newItem),
      item => {
        console.log('Item added:', item);
      }
    );
  }
}
```

### 3. Form State Pattern

#### ✅ Recommended: Signals for Form State

```typescript
import { Component, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@core/base/base.component';

@Component({
  selector: 'app-form-component',
  standalone: true,
  // ...
})
export class FormComponent extends BaseComponent {
  form: FormGroup;
  
  // ✅ Signals for form state
  isSubmitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  isDirty = signal<boolean>(false);
  
  // ✅ Computed signals
  canSubmit = computed(() => 
    this.form.valid && !this.isSubmitting() && this.isDirty()
  );
  
  constructor(private fb: FormBuilder) {
    super();
    
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
    
    // Watch form changes
    this.subscribe(
      this.form.valueChanges,
      () => this.isDirty.set(true)
    );
  }
  
  onSubmit(): void {
    if (!this.canSubmit()) return;
    
    this.isSubmitting.set(true);
    this.submitError.set(null);
    
    this.subscribe(
      this.service.save(this.form.value),
      () => {
        this.isSubmitting.set(false);
        this.isDirty.set(false);
        // Success handling
      },
      error => {
        this.isSubmitting.set(false);
        this.submitError.set(error.message);
      }
    );
  }
}
```

### 4. Derived State Pattern

#### ✅ Recommended: Computed Signals

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-filtered-list',
  standalone: true,
  // ...
})
export class FilteredListComponent extends BaseComponent {
  // ✅ Base state
  items = signal<Item[]>([]);
  searchTerm = signal<string>('');
  selectedCategory = signal<string | null>(null);
  
  // ✅ Derived state using computed
  filteredItems = computed(() => {
    let result = this.items();
    
    // Filter by search term
    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    const category = this.selectedCategory();
    if (category) {
      result = result.filter(item => item.category === category);
    }
    
    return result;
  });
  
  // ✅ More derived state
  itemCount = computed(() => this.filteredItems().length);
  hasResults = computed(() => this.itemCount() > 0);
  
  // ✅ Categories from items
  categories = computed(() => {
    const cats = new Set(this.items().map(item => item.category));
    return Array.from(cats);
  });
}
```

---

## ⚠️ Anti-Patterns (อย่าทำ)

### ❌ Don't: Mix Signals and Observables Unnecessarily

```typescript
// ❌ Bad: Converting Observable to Signal unnecessarily
export class BadService {
  private dataSubject = new BehaviorSubject<Data[]>([]);
  public data$ = this.dataSubject.asObservable();
  public data = toSignal(this.data$); // ❌ Unnecessary conversion
}

// ✅ Good: Use Signals directly
export class GoodService {
  private data = signal<Data[]>([]);
  public readonly data = this.data.asReadonly();
}
```

### ❌ Don't: Subscribe Without Unsubscribe

```typescript
// ❌ Bad: Memory leak risk
export class BadComponent implements OnInit {
  ngOnInit() {
    this.service.data$.subscribe(data => {
      this.data = data; // ❌ No unsubscribe
    });
  }
}

// ✅ Good: Use BaseComponent
export class GoodComponent extends BaseComponent implements OnInit {
  ngOnInit() {
    this.subscribe(
      this.service.data$,
      data => this.data = data // ✅ Auto-unsubscribe
    );
  }
}
```

### ❌ Don't: Use BehaviorSubject for Simple State

```typescript
// ❌ Bad: Overcomplicated
export class BadService {
  private stateSubject = new BehaviorSubject<State>(initialState);
  public state$ = this.stateSubject.asObservable();
  
  getState(): State {
    return this.stateSubject.value;
  }
  
  setState(state: State): void {
    this.stateSubject.next(state);
  }
}

// ✅ Good: Use Signals
export class GoodService {
  private state = signal<State>(initialState);
  public readonly state = this.state.asReadonly();
  
  setState(state: State): void {
    this.state.set(state);
  }
}
```

---

## 🔄 Migration Guide

### Migrating from BehaviorSubject to Signals

#### Before (BehaviorSubject)

```typescript
export class OldService {
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  public items$ = this.itemsSubject.asObservable();
  
  getItems(): Item[] {
    return this.itemsSubject.value;
  }
  
  setItems(items: Item[]): void {
    this.itemsSubject.next(items);
  }
}
```

#### After (Signals)

```typescript
export class NewService {
  private items = signal<Item[]>([]);
  public readonly items = this.items.asReadonly();
  
  setItems(items: Item[]): void {
    this.items.set(items);
  }
}
```

### Migrating Component Usage

#### Before (Observable)

```typescript
export class OldComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.items = items;
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### After (Signal + BaseComponent)

```typescript
export class NewComponent extends BaseComponent implements OnInit {
  // ✅ Direct access to signal
  items = computed(() => this.service.items());
  
  ngOnInit() {
    // ✅ Load data if needed
    this.subscribe(
      this.service.loadItems(),
      () => {} // Data is already in signal
    );
  }
  // ✅ No ngOnDestroy needed - BaseComponent handles it
}
```

---

## 📚 Resources

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [RxJS Documentation](https://rxjs.dev/)
- [BaseComponent Documentation](../../base/README.md)

---

## ✅ Checklist

เมื่อสร้าง service หรือ component ใหม่:

- [ ] ใช้ Signals สำหรับ local state
- [ ] ใช้ Observables สำหรับ async operations (HTTP, WebSocket)
- [ ] ใช้ computed signals สำหรับ derived state
- [ ] Components ที่ใช้ observables ต้อง extend BaseComponent
- [ ] ใช้ `this.subscribe()` จาก BaseComponent แทน manual subscription
- [ ] ไม่มี memory leaks (ทุก subscription ต้อง unsubscribe)
- [ ] มี error handling
- [ ] มี loading states
- [ ] มี proper TypeScript types

---

**อัปเดตล่าสุด**: 2025-01-21
