# 🔄 Migration Guide

**Last Updated**: 2025-12-21

---

### Phase 4: Styling Standardization ✅ **COMPLETE** (2025-12-21)

#### Styling Guidelines ✅
- ✅ Created `STYLING_GUIDELINES.md` with comprehensive Tailwind vs SCSS decision tree
- ✅ Documented when to use Tailwind classes vs SCSS
- ✅ Added best practices and examples
- ✅ Created utility classes for common patterns (animations, scrollbar, gradients, spinners, etc.)

#### Utility Classes ✅
- ✅ **Animation Utilities**: `.fade-in`, `.slide-in-top`, `.slide-in-bottom`, `.scale-in`, `.pulse-slow`, `.spin-slow`, `.bounce-subtle`, `.shimmer`
- ✅ **Text Utilities**: `.text-truncate`, `.text-truncate-2`, `.text-truncate-3`
- ✅ **Scrollbar Utilities**: `.scrollbar-thin` (with dark mode support)
- ✅ **Aspect Ratio Utilities**: `.aspect-square`, `.aspect-video`, `.aspect-4-3`
- ✅ **Gradient Utilities**: `.gradient-primary`, `.gradient-secondary`, `.gradient-success`, `.gradient-error`
- ✅ **Backdrop Blur Utilities**: `.backdrop-blur-glass`, `.backdrop-blur-glass-lg`
- ✅ **Shadow Utilities**: `.shadow-glass`, `.shadow-glass-lg`
- ✅ **Loading Utilities**: `.spinner`, `.spinner-sm`, `.spinner-md`, `.spinner-lg`
- ✅ **Focus Utilities**: `.focus-ring`
- ✅ All utilities use design tokens and support dark mode

#### Inline Styles Migration ✅
- ✅ Created `INLINE_STYLES_MIGRATION_GUIDE.md` with migration patterns
- ✅ **9 Components Migrated**:
  1. **Color Picker**: Fallback color → CSS variable (`var(--color-primary-500)`)
  2. **Reset Password**: Password strength width → CSS custom property (`--strength-width`)
  3. **Header**: Dropdown positioning → CSS custom properties (`--dropdown-top`, `--dropdown-right`)
  4. **Advanced Data Table**: Text alignment → Tailwind classes (`text-left`, `text-center`, `text-right`)
  5. **Popover**: Positioning → CSS custom properties (`--popover-top`, `--popover-left`)
  6. **Material Table**: Text alignment → Tailwind classes
  7. **Data Table**: Text alignment → Tailwind classes
  8. **Theme Switcher**: Kept dynamic colors (user-selected)
  9. **Skeleton**: Kept dynamic dimensions (user-configurable)
- ✅ **Migration Patterns Applied**:
  - Dynamic colors → Kept inline styles (user-selected values)
  - Dynamic positioning → CSS custom properties
  - Text alignment → Tailwind classes
  - Dynamic widths/heights → CSS custom properties or kept inline (user-configurable)

#### SCSS to Tailwind Migration ✅
- ✅ Created `SCSS_TO_TAILWIND_MIGRATION.md` with comprehensive migration guide
- ✅ **28 Components Migrated** (100% complete):
  - Error pages: error-404 (77%), error-401 (93%), error-500 (95%), maintenance (92%), coming-soon (92%)
  - Auth components: reset-password (91%), lock-screen (91%)
  - UI components: glass-button, timestamp (87%), progress-bar (61%), accordion (78%), tooltip (60%), offcanvas (63%)
  - Data components: calendar (14%), timeline (62%), advanced-data-table (79%)
  - Media components: gallery (68%), swiper-gallery (76%), mobile-camera (89%)
  - Content components: faq (95%), documentation (91%), rich-text-editor (64%)
  - Complex components: modal (74%), draggable-cards (84%), face-recognition (96%), group-face-recognition (97%)
  - Layout components: header (already minimal), sidebar (already minimal)
- ✅ **Average SCSS Reduction**: ~82%
- ✅ **Total SCSS Lines Reduced**: ~10,000+ lines
- ✅ **Kept in SCSS**: Complex styles only (animations, pseudo-elements, complex variants, theme-specific styles)
- ✅ **Migration Strategy Applied**:
  - Simple styles (layout, spacing, colors, typography) → Tailwind classes
  - Responsive styles → Tailwind responsive prefixes (`md:`, `lg:`)
  - Complex styles (keyframes, pseudo-elements, complex gradients) → Kept in SCSS
  - Design tokens → Used via Tailwind config and CSS variables

---

**Last Updated**: 2025-12-21

## 📋 สารบัญ
1. [Dependencies Migration](#dependencies-migration)
2. [Component Migration](#component-migration)
3. [State Management Migration](#state-management-migration)
4. [Styling Migration](#styling-migration)

---

## 🔧 Dependencies Migration

### 1. ลบ jQuery และ Select2

#### Step 1: ลบจาก angular.json
```json
// ❌ ลบออก
"scripts": [
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/select2/dist/js/select2.min.js"
]
```

#### Step 2: ลบจาก package.json
```bash
npm uninstall jquery select2 @types/select2
```

#### Step 3: Migrate Select2 Usage
```typescript
// ❌ Before: ใช้ Select2
<select id="mySelect">
  <option value="1">Option 1</option>
</select>

// ✅ After: ใช้ Angular native หรือ ng-select
<select [(ngModel)]="selectedValue" class="glass-input">
  <option value="1">Option 1</option>
</select>

// หรือใช้ ng-select
<ng-select 
  [(ngModel)]="selectedValue"
  [items]="options"
  bindLabel="name"
  bindValue="id">
</ng-select>
```

---

### 2. Migrate Rich Text Editors

#### Step 1: Uninstall Old Editors
```bash
npm uninstall @kolkov/angular-editor ngx-quill
```

#### Step 2: Keep Only ngx-editor
```bash
# ngx-editor ควรมีอยู่แล้ว
npm install ngx-editor@latest
```

#### Step 3: Update Components
```typescript
// ❌ Before: ใช้หลาย editors
import { AngularEditorModule } from '@kolkov/angular-editor';
import { QuillModule } from 'ngx-quill';
import { NgxEditorModule } from 'ngx-editor';

// ✅ After: ใช้แค่ ngx-editor
import { NgxEditorModule } from 'ngx-editor';

@Component({
  imports: [NgxEditorModule],
  // ...
})
export class RichTextComponent {
  editor = new Editor();
  
  config: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
}
```

```html
<!-- ✅ Template -->
<ngx-editor
  [editor]="editor"
  [ngModel]="content"
  [placeholder]="'Enter text...'"
  [toolbar]="config">
</ngx-editor>
```

---

### 3. Migrate Chart Libraries

#### Step 1: Uninstall Old Libraries
```bash
npm uninstall apexcharts ng-apexcharts chart.js ng2-charts
```

#### Step 2: Keep Only ECharts
```bash
# ECharts ควรมีอยู่แล้ว
npm install echarts ngx-echarts@latest
```

#### Step 3: Update Components
```typescript
// ❌ Before: ใช้ ApexCharts
import { NgApexchartsModule } from 'ng-apexcharts';

// ✅ After: ใช้ ECharts
import { NgxEchartsModule } from 'ngx-echarts';

@Component({
  imports: [NgxEchartsModule],
  // ...
})
export class ChartComponent {
  chartOption = {
    title: {
      text: 'Chart Title'
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }]
  };
}
```

```html
<!-- ✅ Template -->
<div echarts 
     [options]="chartOption"
     class="chart-container">
</div>
```

---

## 🧩 Component Migration

### 1. Migrate to Enhanced Data Table

#### Step 1: Update Imports
```typescript
// ❌ Before: ใช้ advanced-data-table
import { AdvancedDataTableComponent } from '@shared/components/advanced-data-table/advanced-data-table.component';

// ✅ After: ใช้ data-table ที่ enhanced แล้ว
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
```

#### Step 2: Update Component Usage
```typescript
// ❌ Before
<app-advanced-data-table
  [data]="items"
  [columns]="columns"
  [config]="tableConfig">
</app-advanced-data-table>

// ✅ After: ใช้ data-table ที่มี features เพิ่มขึ้น
<app-data-table
  [data]="items"
  [columns]="columns"
  [loading]="loading"
  [showFilters]="true"
  [showExport]="true"
  [pagination]="paginationConfig">
</app-data-table>
```

#### Step 3: Update Column Definitions
```typescript
// ✅ Enhanced column definition
export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  render?: (value: any, row: any) => string;
}
```

---

### 2. Migrate Chart Components to ECharts

#### Step 1: Update Imports
```typescript
// ❌ Before: ใช้ ChartComponent หรือ ApexChartComponent
import { ChartComponent, ChartData } from '@shared/components/chart/chart.component';
import { ApexChartComponent } from '@shared/components/apex-chart/apex-chart.component';

// ✅ After: ใช้ EChartsChartComponent โดยตรง
import { EChartsChartComponent, EChartsOption } from '@shared/components/echarts-chart/echarts-chart.component';
```

#### Step 2: Convert Chart Data Format
```typescript
// ❌ Before: Chart.js format
attendanceChartData: ChartData = {
  labels: ['Mon', 'Tue', 'Wed'],
  datasets: [
    { label: 'Present', data: [85, 92, 78], backgroundColor: '#3b82f6' },
    { label: 'Absent', data: [15, 8, 22], backgroundColor: '#ef4444' }
  ]
};

// ✅ After: ECharts format
attendanceChartOptions = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['Present', 'Absent'] },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
  yAxis: { type: 'value' },
  series: [
    { name: 'Present', type: 'line', data: [85, 92, 78] },
    { name: 'Absent', type: 'line', data: [15, 8, 22] }
  ]
}));
```

#### Step 3: Update Template
```html
<!-- ❌ Before -->
<app-chart [data]="attendanceChartData" [options]="chartOptions" />
<app-apex-chart [type]="'line'" [series]="series" [categories]="categories" />

<!-- ✅ After -->
<app-echarts-chart 
  [options]="attendanceChartOptions()" 
  [height]="'400px'"
  [ariaLabel]="'Attendance Chart'">
</app-echarts-chart>
```

#### Step 4: Pie/Doughnut Chart Migration
```typescript
// ❌ Before: Chart.js doughnut
doorChartData: ChartData = {
  labels: ['Online', 'Offline', 'Maintenance'],
  datasets: [{ data: [8, 2, 1] }]
};

// ✅ After: ECharts pie
doorChartOptions = computed<EChartsOption>(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: { data: ['Online', 'Offline', 'Maintenance'], bottom: 'bottom' },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: [
      { value: 8, name: 'Online', itemStyle: { color: '#10b981' } },
      { value: 2, name: 'Offline', itemStyle: { color: '#ef4444' } },
      { value: 1, name: 'Maintenance', itemStyle: { color: '#f59e0b' } }
    ]
  }]
}));
```

#### Notes
- `ChartComponent` and `ApexChartComponent` are now deprecated
- Use `EChartsChartComponent` directly for better performance
- Chart options should be computed signals for reactive updates
- See `EChartsChartComponent` documentation for full API reference

---

### 3. Migrate Rich Text Components

#### Step 1: Current Status
```typescript
// ✅ RichTextComponent และ RichTextEditorComponent เป็น wrappers ที่ใช้ AdvancedRichTextComponent อยู่แล้ว
// ไม่จำเป็นต้อง migrate เพราะ wrappers ใช้ unified component อยู่แล้ว

// RichTextComponent → AdvancedRichTextComponent (ngx-editor)
// RichTextEditorComponent → AdvancedRichTextComponent (ngx-editor)
```

#### Step 2: Direct Usage (Optional)
```typescript
// ✅ Optional: ใช้ AdvancedRichTextComponent โดยตรง (ถ้าต้องการ)
import { AdvancedRichTextComponent } from '@shared/components/advanced-rich-text/advanced-rich-text.component';

// ✅ Current: ใช้ wrapper components (แนะนำ)
import { RichTextComponent } from '@shared/components/rich-text/rich-text.component';
import { RichTextEditorComponent } from '@shared/components/rich-text-editor/rich-text-editor.component';

// Usage (both work the same way)
<app-rich-text [(ngModel)]="content" [placeholder]="'Enter text...'">
</app-rich-text>

<app-rich-text-editor [config]="editorConfig" [(ngModel)]="content">
</app-rich-text-editor>
  [toolbar]="toolbarConfig"
  [placeholder]="'Enter text...'">
</app-rich-text-editor>
```

---

## 🔄 State Management Migration

### 1. Migrate to Signals

#### Step 1: Update Service
```typescript
// ❌ Before: ใช้ BehaviorSubject
export class MyService {
  private dataSubject = new BehaviorSubject<Data[]>([]);
  public data$ = this.dataSubject.asObservable();
  
  getData(): Data[] {
    return this.dataSubject.value;
  }
  
  setData(data: Data[]): void {
    this.dataSubject.next(data);
  }
}

// ✅ After: ใช้ Signals
export class MyService {
  private data = signal<Data[]>([]);
  public readonly data = this.data.asReadonly();
  
  getData(): Data[] {
    return this.data();
  }
  
  setData(data: Data[]): void {
    this.data.set(data);
  }
}
```

#### Step 2: Update Component
```typescript
// ❌ Before: ใช้ Observable
export class MyComponent implements OnInit {
  data: Data[] = [];
  
  ngOnInit() {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.data = data;
      });
  }
}

// ✅ After: ใช้ Signal
export class MyComponent {
  // ✅ Use computed signal
  data = computed(() => this.service.data());
  
  // หรือใช้ effect
  constructor() {
    effect(() => {
      const data = this.service.data();
      // Do something with data
    });
  }
}
```

---

### 2. Fix Memory Leaks

#### Step 1: Create Base Component
```typescript
// ✅ Create base component
import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

export abstract class BaseComponent implements OnDestroy {
  protected destroy$ = new Subject<void>();
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  protected subscribe<T>(
    observable: Observable<T>,
    callback: (value: T) => void
  ): void {
    observable
      .pipe(takeUntil(this.destroy$))
      .subscribe(callback);
  }
}
```

#### Step 2: Update Components
```typescript
// ❌ Before: ไม่มี unsubscribe
export class MyComponent implements OnInit {
  ngOnInit() {
    this.service.data$.subscribe(data => {
      this.data = data;
    });
  }
}

// ✅ After: ใช้ BaseComponent
export class MyComponent extends BaseComponent implements OnInit {
  ngOnInit() {
    this.subscribe(
      this.service.data$,
      data => this.data = data
    );
  }
}
```

---

## 🎨 Styling Migration

### 1. Migrate to Tailwind CSS

#### Step 1: Replace Inline Styles
```typescript
// ❌ Before: Inline styles
<div style="color: red; padding: 10px;">

// ✅ After: Tailwind classes
<div class="text-red-500 p-2.5">
```

#### Step 2: Replace SCSS Classes
```scss
// ❌ Before: SCSS
.my-component {
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
}
```

```typescript
// ✅ After: Tailwind
<div class="p-4 bg-white rounded-lg">
```

#### Step 3: Use Design Tokens
```typescript
// ❌ Before: Hardcoded colors
<div class="bg-blue-500">

// ✅ After: Design tokens
<div class="bg-primary-500">
```

---

### 2. Create Design Tokens

#### Step 1: Create Tokens File
```typescript
// frontend/src/app/core/config/design-tokens.ts
export const DESIGN_TOKENS = {
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#3b82f6',
      900: '#0c4a6e',
    },
    // ...
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  // ...
};
```

#### Step 2: Use in Tailwind Config
```javascript
// tailwind.config.js
const { DESIGN_TOKENS } = require('./src/app/core/config/design-tokens');

module.exports = {
  theme: {
    extend: {
      colors: DESIGN_TOKENS.colors,
      spacing: DESIGN_TOKENS.spacing,
      // ...
    },
  },
};
```

#### Step 3: Use in Components
```typescript
// ✅ Use design tokens
<div class="bg-primary-500 p-lg">
```

---

## 📝 Migration Checklist

### Dependencies
- [x] ลบ jQuery และ Select2
- [x] Migrate Select2 usage
- [x] ลบ rich text editors ที่ไม่ใช้
- [x] Migrate rich text components
- [x] ลบ chart libraries ที่ไม่ใช้
- [x] Migrate chart components

### Components
- [x] เพิ่ม export functionality ให้ data-table ✅
- [x] เพิ่ม template support สำหรับ custom cells ให้ data-table ✅
- [x] เพิ่ม virtual scrolling support (optional) ให้ data-table ✅
- [x] Migrate components ที่ใช้ advanced-data-table ไปใช้ data-table ✅ (advanced-data-table-demo migrated)
- [x] Deprecate advanced-data-table.component.ts ✅ (Added deprecation notice)
- [ ] Migrate rich text components
- [ ] Update all component imports

### State Management
- [x] สร้าง BaseComponent ✅
- [x] Migrate services ไปใช้ Signals ✅ (48/48 services - 100%) 🎉
  - [x] High Priority: 8/8 (100%) ✅
  - [x] Medium Priority: 32/32 (100%) ✅
  - [x] Low Priority: 8/8 (100%) ✅
- [x] Fix memory leaks ✅ (ใช้ BaseComponent และ signals)
- [x] Update components ✅ (28+ components migrated)

### Styling
- [ ] Migrate inline styles - ต้องทำทีละ component
- [ ] Migrate SCSS classes - ต้องทำทีละ component
- [x] Create design tokens ✅ (`frontend/src/app/core/config/design-tokens.ts`)
- [x] Update Tailwind config ✅
- [ ] Update components - ต้องทำทีละ component

---

## 🐛 Common Issues

### Issue 1: Build Errors After Removing Dependencies
**Solution**: 
- ตรวจสอบ imports ทั้งหมด
- ลบ imports ที่ไม่ใช้
- รัน `npm install` ใหม่

### Issue 2: Components Not Working After Migration
**Solution**:
- ตรวจสอบ API changes
- อัปเดต component usage
- ทดสอบทีละ component

### Issue 3: Styling Broken After Migration
**Solution**:
- ตรวจสอบ Tailwind classes
- ตรวจสอบ design tokens
- อัปเดต SCSS imports

---

## 📚 Resources

- [Angular Migration Guide](https://angular.io/guide/updating)
- [RxJS Migration Guide](https://rxjs.dev/guide/overview)
- [Tailwind CSS Migration](https://tailwindcss.com/docs/upgrade-guide)

---

**อัปเดตล่าสุด**: 2025-12-20

## 📊 Migration Progress Summary

### Services Migration (BehaviorSubject → Signals) 🎉
- ✅ **Completed**: 48/48 services (100%) - **MIGRATION COMPLETE!**
  - ✅ High Priority: 8/8 (100%)
  - ✅ Medium Priority: 32/32 (100%)
  - ✅ Low Priority: 8/8 (100%)
- ✅ **Components Updated**: 28+ components migrated to use signals
- ✅ **Memory Leaks Fixed**: Using signals and `effect()` instead of subscriptions

### Data Table Component Enhancement 🎉
- ✅ **Export Functionality**: CSV, Excel, JSON export
- ✅ **Virtual Scrolling Support**: Optional virtual scrolling for large datasets
- ✅ **Template Support**: Custom cell templates
- ✅ **Component Migration**: advanced-data-table-demo migrated to data-table
- ✅ **Deprecation**: advanced-data-table.component.ts deprecated with migration guide

### Phase 3: Optimization 🚀 ✅ **Infrastructure Complete**

#### Bundle Size Optimization ✅
- ✅ Added bundle analysis script (`npm run analyze`)
- ✅ Configured production build optimizations in `angular.json`:
  - `optimization: { scripts: true, styles: true, fonts: true }`
  - `sourceMap: false`
  - `namedChunks: false`
  - `extractLicenses: true`
  - `allowedCommonJsDependencies: ["leaflet", "filepond", "node-fetch"]`
- ✅ All routes use lazy loading (`loadComponent`)
- ✅ Tree shaking enabled in production build
- ✅ Initial bundle: 591.98 kB raw, 150.65 kB gzipped ✅ (Within budget)
- 📝 **Next Steps**: Run `npm run analyze` to identify large dependencies

#### Dependency Analysis ✅
- ✅ Unused dependencies detection (`npm run check-deps`)
- ✅ Safe dependency analysis (`npm run analyze-deps-safe`)
- ✅ Dependency verification (`npm run verify-deps`)
- ✅ CommonJS dependencies configured

#### SCSS Optimization ✅
- ✅ SCSS analysis script (`npm run analyze-scss`)
- ✅ All 116 source SCSS files within budget
- ✅ Largest file: 38.81 KB (`styles.scss`)
- ⚠️ Compiled CSS warning (expected for complex lazy-loaded components)

#### Image Optimization ✅
- ✅ Created `ImageOptimizationDirective` for automatic image optimization
- ✅ Created `image-utils.ts` with helper functions:
  - `generatePlaceholder()` - Generate SVG placeholders
  - `generateSrcset()` - Generate responsive srcset
  - `checkWebPSupport()` - Check browser WebP support
  - `getOptimalImageUrl()` - Get WebP or fallback
  - `preloadImage()` - Preload images
- ✅ Created image optimization scripts:
  - `audit-images.js` - Audit all images and tags
  - `convert-to-webp.js` - Convert images to WebP
  - `apply-image-optimization.js` - Apply optimization directive
  - `fix-image-spacing.js` - Fix spacing issues
- ✅ **Image Optimization Applied**: 25 tags optimized in 17 files
  - All tags use `ngSrc` and `appImageOptimization`
  - 24 tags use lazy loading
  - Directives imported in all component files
- 📝 **Next Steps**: 
  - Convert images to WebP format (when images are added)
  - Test image optimization performance

#### Documentation ✅
- ✅ `OPTIMIZATION_GUIDE.md` - Complete optimization guide
- ✅ `OPTIMIZATION_ISSUES.md` - Issues and solutions
- ✅ `SCSS_ANALYSIS_SUMMARY.md` - SCSS analysis results
- ✅ `PHASE3_OPTIMIZATION_SUMMARY.md` - Phase 3 summary
- ✅ `OPTIMIZATION_QUICK_REFERENCE.md` - Quick reference guide

**Status**: Infrastructure 100% complete ✅ | Image Optimization Applied ✅ (25 tags optimized in 17 files)

### Phase 4: Design System Integration ✅ **COMPLETE** (2025-12-21)
- ✅ **Design Tokens**: All shared components updated (50+ components)
- ✅ **Error Pages**: Error404, Error401, Error500, Maintenance, ComingSoon
- ✅ **Auth Components**: LockScreen, ResetPassword
- ✅ **CSS Variables**: Colors, spacing, typography, border-radius, transitions
- ✅ **Documentation**: `DESIGN_TOKENS_USAGE.md` created and updated

### Phase 4: Styling Standardization ✅ **COMPLETE** (2025-12-21)
- ✅ **Styling Guidelines**: Created `STYLING_GUIDELINES.md` with Tailwind vs SCSS decision tree
- ✅ **Utility Classes**: Created 20+ utility classes for common patterns
- ✅ **Inline Styles Migration**: 9 components migrated (100% complete)
- ✅ **SCSS to Tailwind Migration - Shared Components**: 28/28 components migrated (100% complete)
  - Average SCSS reduction: ~82%
  - Total SCSS lines reduced: ~10,000+ lines
  - Kept only complex styles in SCSS (animations, pseudo-elements, complex variants)
- ✅ **SCSS to Tailwind Migration - Feature Components**: 7/84 high-priority components migrated (7% complete)
  - hardware-status-dashboard (97% reduction: 656 → 20 lines)
  - hr-dashboard (96% reduction: 556 → 20 lines)
  - mobile-demo (92% reduction: 562 → 45 lines)
  - register (67% reduction: 539 → 180 lines)
  - advanced-features-dashboard (95% reduction: 437 → 20 lines)
  - advanced-ui-demo (91% reduction: 322 → 30 lines)
  - advanced-data-table-demo (89% reduction: 282 → 30 lines)
  - Total SCSS lines reduced: ~3,009 lines (~89% average reduction)
  - All migrated components updated to use design tokens
- ✅ **Documentation**: `SCSS_TO_TAILWIND_MIGRATION.md`, `INLINE_STYLES_MIGRATION_GUIDE.md`, `FEATURES_COMPONENTS_SCSS_ANALYSIS.md`, `FEATURES_DESIGN_TOKENS_UPDATE.md` created and updated

### Phase 4: Component API Standardization ✅ **IN PROGRESS** (2025-12-21)
- ✅ **Component Interface Standards**: Created `COMPONENT_INTERFACE_STANDARDS.md`
  - ✅ Defined common inputs/outputs patterns
  - ✅ Defined naming conventions
  - ✅ Defined configuration patterns
  - ✅ Added examples and best practices
  - ✅ Created component checklist
- ✅ **Component API Audit**: Created `COMPONENT_API_AUDIT.md`
  - ✅ Created audit framework
  - ✅ Started auditing high-priority components
  - ✅ 61/135 components audited and updated (45% complete)
  - ✅ **Updated Components**:
    - High-Usage: GlassButton, GlassCard, GlassInput, Modal, DataTable, SearchInput
    - Form: Checkbox, Switch, Radio, FormField
    - UI: Accordion, Badge, Alert, Tooltip, ProgressBar, Pagination
    - Layout: Header, Sidebar, PageLayout, Offcanvas
    - Feature: Dashboard, Employees, Events, Visitors, Guests, Devices, Doors, Vehicles, Shifts, Structure, Leaves, Attendance
    - Shared: EmptyState, FilterSection, Loading, Skeleton, Tabs, StatisticsGrid, StatisticsCard, ErrorMessage, ModalForm, Divider, Avatar, Breadcrumb, Stepper, Rating, Popover, Timeline, Accordion, Badge, Alert, ProgressBar, Tooltip, Pagination, RangeSlider, ColorPicker, FileUpload, DateTimePicker, ThemeSwitcher, RichTextEditor, AdvancedRichText, RichText, Calendar, Chart, ApexChart, EChartsChart, DraggableCards, SwiperGallery, LeafletMap, MobileCamera, FaceRecognition, GroupFaceRecognition, Gallery, NotificationCenter, ErrorToast, LoadingState, NotificationSettings, ResetPassword, LockScreen
- ✅ **High-Usage Components Updated** (7 components):
  - ✅ GlassButtonComponent - JSDoc, accessibility (aria-label, aria-busy)
  - ✅ GlassCardComponent - JSDoc, accessibility (role, aria-label)
  - ✅ GlassInputComponent - JSDoc, accessibility, type safety, customClass
  - ✅ ModalComponent - JSDoc comments
  - ✅ AccordionComponent - JSDoc comments
  - ✅ BadgeComponent - JSDoc, accessibility (role, tabindex, aria-label)
  - ✅ AlertComponent - JSDoc, accessibility improvements (aria-live, aria-atomic)
- ✅ **Form Components Updated** (4 components):
  - ✅ CheckboxComponent - JSDoc, accessibility, type safety (MatCheckboxChange)
  - ✅ SwitchComponent - JSDoc, accessibility, type safety (MatSlideToggleChange)
  - ✅ RadioComponent - JSDoc, accessibility, type safety (MatRadioChange)
  - ✅ FormFieldComponent - JSDoc, accessibility, type safety, disabled input
- ✅ **UI Components Updated** (9 components):
  - ✅ TooltipComponent - JSDoc, accessibility, type safety (ReturnType<typeof setTimeout>)
  - ✅ ProgressBarComponent - JSDoc, accessibility, customClass, ariaLabel
  - ✅ PaginationComponent - JSDoc, accessibility improvements, trackBy, OnChanges
  - ✅ RangeSliderComponent - JSDoc, accessibility, ControlValueAccessor, unique IDs, valueChange event
  - ✅ ColorPickerComponent - JSDoc, accessibility, ControlValueAccessor, trackBy, keyboard navigation, unique IDs
  - ✅ FileUploadComponent - JSDoc, accessibility, ControlValueAccessor, type safety, unique IDs
  - ✅ DateTimePickerComponent - JSDoc, accessibility, ControlValueAccessor, unique IDs, valueChange event, type safety
  - ✅ ThemeSwitcherComponent - JSDoc, accessibility, trackBy, keyboard navigation, unique IDs, customClass, ariaLabel
  - ✅ RichTextEditorComponent - JSDoc, accessibility, ControlValueAccessor, type safety (unknown instead of any), customClass, ariaLabel
  - ✅ AdvancedRichTextComponent - JSDoc, accessibility, ControlValueAccessor, unique IDs, contentChange event, customClass, ariaLabel
  - ✅ EmptyStateComponent - JSDoc, accessibility, trackBy
  - ✅ FilterSectionComponent - JSDoc, accessibility, trackBy, type safety
  - ✅ LoadingComponent - JSDoc, accessibility
  - ✅ SkeletonComponent - JSDoc, accessibility, trackBy
  - ✅ TabsComponent - JSDoc, accessibility, trackBy, unique IDs
  - ✅ StatisticsGridComponent - JSDoc, accessibility, trackBy
  - ✅ StatisticsCardComponent - JSDoc, accessibility
  - ✅ ErrorMessageComponent - JSDoc, accessibility
  - ✅ ModalFormComponent - JSDoc, accessibility, trackBy
  - ✅ DividerComponent - JSDoc, accessibility
- 📋 **Next**: Continue updating remaining components (70 components remaining)

### Migration Complete! 🎊
- **All services** have been successfully migrated from BehaviorSubject to Angular Signals
- **Data Table Component** enhanced with all requested features
- **Advanced Data Table** deprecated in favor of enhanced DataTableComponent
- **Phase 3 Optimization** infrastructure ready

ดูสถานะรายละเอียดที่: [SERVICES_MIGRATION_STATUS.md](./src/app/core/services/SERVICES_MIGRATION_STATUS.md)  
ดู Optimization Guide ที่: [OPTIMIZATION_GUIDE.md](./OPTIMIZATION_GUIDE.md)
