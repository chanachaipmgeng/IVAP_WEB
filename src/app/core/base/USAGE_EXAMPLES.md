# BaseComponent Usage Examples

## 📚 ตัวอย่างการใช้งาน BaseComponent

### Example 1: Basic Component with Single Subscription

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { EmployeeService } from '@core/services/employee.service';
import { Employee } from '@core/models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  template: `
    <div class="employees-list">
      @for (employee of employees; track employee.id) {
        <div>{{ employee.name }}</div>
      }
    </div>
  `
})
export class EmployeesComponent extends BaseComponent implements OnInit {
  employees: Employee[] = [];

  constructor(private employeeService: EmployeeService) {
    super();
  }

  ngOnInit(): void {
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.employeeService.getAllList(),
      employees => {
        this.employees = employees;
      },
      error => {
        console.error('Failed to load employees:', error);
      }
    );
  }
}
```

### Example 2: Multiple Subscriptions

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { DashboardService } from '@core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `...`
})
export class DashboardComponent extends BaseComponent implements OnInit {
  stats: any = {};
  notifications: any[] = [];
  recentActivities: any[] = [];

  constructor(private dashboardService: DashboardService) {
    super();
  }

  ngOnInit(): void {
    // ✅ Multiple subscriptions - all auto-unsubscribe
    this.subscribe(
      this.dashboardService.stats$,
      stats => this.stats = stats
    );

    this.subscribe(
      this.dashboardService.notifications$,
      notifications => this.notifications = notifications
    );

    this.subscribe(
      this.dashboardService.recentActivities$,
      activities => this.recentActivities = activities
    );
  }
}
```

### Example 3: Async Operations with safeAsync

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-data-loader',
  standalone: true,
  template: `
    @if (loading) {
      <div>Loading...</div>
    } @else {
      <div>{{ data }}</div>
    }
  `
})
export class DataLoaderComponent extends BaseComponent implements OnInit {
  data: any = null;
  loading = false;

  constructor(private dataService: DataService) {
    super();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // ✅ Safe async operation
    this.safeAsync(async () => {
      const result = await this.dataService.loadData();
      this.safeUpdate(() => {
        this.data = result;
        this.loading = false;
      });
    }, error => {
      console.error('Failed to load data:', error);
      this.safeUpdate(() => {
        this.loading = false;
      });
    });
  }
}
```

### Example 4: Search with Debounce

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { SearchService } from '@core/services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  template: `
    <input 
      type="text" 
      [value]="searchQuery"
      (input)="onSearchChange($event)"
      placeholder="Search...">
    
    <div class="results">
      @for (result of searchResults; track result.id) {
        <div>{{ result.name }}</div>
      }
    </div>
  `
})
export class SearchComponent extends BaseComponent {
  searchQuery = '';
  searchResults: any[] = [];
  
  // ✅ Debounced search function
  private debouncedSearch = this.debounce((query: string) => {
    this.performSearch(query);
  }, 300);

  constructor(private searchService: SearchService) {
    super();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.debouncedSearch(query);
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.searchResults = [];
      return;
    }

    this.subscribe(
      this.searchService.search(query),
      results => {
        this.searchResults = results;
      }
    );
  }
}
```

### Example 5: Scroll with Throttle

```typescript
import { Component, OnInit, HostListener } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';

@Component({
  selector: 'app-scroll-component',
  standalone: true,
  template: `
    <div [class.scrolled]="isScrolled">
      Scroll position: {{ scrollY }}
    </div>
  `
})
export class ScrollComponent extends BaseComponent {
  scrollY = 0;
  isScrolled = false;

  // ✅ Throttled scroll handler
  private throttledScroll = this.throttle(() => {
    this.handleScroll();
  }, 100);

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    this.throttledScroll();
  }

  private handleScroll(): void {
    this.scrollY = window.scrollY;
    this.isScrolled = this.scrollY > 100;
  }
}
```

### Example 6: Form with Multiple Subscriptions

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@core/base/base.component';
import { FormService } from '@core/services/form.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" placeholder="Name">
      <input formControlName="email" placeholder="Email">
      <button type="submit">Submit</button>
    </form>
  `
})
export class FormComponent extends BaseComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formService: FormService
  ) {
    super();
    this.form = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  ngOnInit(): void {
    // ✅ Subscribe to form value changes
    this.subscribe(
      this.form.valueChanges,
      values => {
        console.log('Form values changed:', values);
      }
    );

    // ✅ Subscribe to form status changes
    this.subscribe(
      this.form.statusChanges,
      status => {
        console.log('Form status:', status);
      }
    );
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.safeAsync(async () => {
        await this.formService.submit(this.form.value);
        // Handle success
      }, error => {
        console.error('Form submission error:', error);
      });
    }
  }
}
```

### Example 7: Real-time Data with Multiple Streams

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { RealTimeService } from '@core/services/real-time.service';

@Component({
  selector: 'app-real-time',
  standalone: true,
  template: `
    <div class="real-time-dashboard">
      <div>Active Users: {{ activeUsers }}</div>
      <div>Messages: {{ messageCount }}</div>
      <div>Notifications: {{ notificationCount }}</div>
    </div>
  `
})
export class RealTimeComponent extends BaseComponent implements OnInit {
  activeUsers = 0;
  messageCount = 0;
  notificationCount = 0;

  constructor(private realTimeService: RealTimeService) {
    super();
  }

  ngOnInit(): void {
    // ✅ Multiple real-time subscriptions
    this.subscribe(
      this.realTimeService.activeUsers$,
      count => {
        this.activeUsers = count;
      }
    );

    this.subscribe(
      this.realTimeService.messages$,
      messages => {
        this.messageCount = messages.length;
      }
    );

    this.subscribe(
      this.realTimeService.notifications$,
      notifications => {
        this.notificationCount = notifications.length;
      }
    );
  }
}
```

### Example 8: Component with Manual Subscription Management

```typescript
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@core/base/base.component';
import { Subscription } from 'rxjs';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-manual-subscription',
  standalone: true,
  template: `...`
})
export class ManualSubscriptionComponent extends BaseComponent implements OnInit {
  private manualSubscription?: Subscription;

  constructor(private dataService: DataService) {
    super();
  }

  ngOnInit(): void {
    // ✅ Track manual subscription
    this.manualSubscription = this.subscribe(
      this.dataService.data$,
      data => {
        // Handle data
      }
    );

    // Or use trackSubscription if you create subscription manually
    // const sub = this.dataService.data$.subscribe(...);
    // this.trackSubscription(sub);
  }

  // Optional: Manual cleanup if needed before component destroy
  stopSubscription(): void {
    if (this.manualSubscription) {
      this.unsubscribe(this.manualSubscription);
    }
  }
}
```

## 🔄 Migration Examples

### Before: Manual Subscription Management

```typescript
export class OldComponent implements OnInit, OnDestroy {
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

### After: Using BaseComponent

```typescript
export class NewComponent extends BaseComponent implements OnInit {
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

## 💡 Tips

1. **Always extend BaseComponent** for components that use observables
2. **Use subscribe()** instead of direct .subscribe()
3. **Use safeAsync()** for async operations that might complete after destroy
4. **Use safeUpdate()** when updating state from async operations
5. **Use debounce/throttle** for performance optimization
6. **Don't create destroy$ manually** - BaseComponent handles it

---

**อัปเดตล่าสุด**: 2024
