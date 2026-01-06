# Component Interface Standards

**Last Updated**: 2025-12-21  
**Status**: ✅ **Standards Document Created**

---

## 📋 Overview

This document defines the standard interface patterns for all Angular components in the Intelligent Video Analytics Platform. These standards ensure consistency, maintainability, and ease of use across the entire component library.

---

## 🎯 Goals

1. **Consistency**: All components follow the same patterns
2. **Predictability**: Developers know what to expect from each component
3. **Maintainability**: Easier to update and extend components
4. **Type Safety**: Strong TypeScript typing throughout
5. **Documentation**: Self-documenting component APIs

---

## 📐 Common Input Patterns

### Standard Inputs

All components should support these common inputs when applicable:

#### 1. Loading State
```typescript
@Input() loading: boolean = false;
```
- **Purpose**: Indicate async operations in progress
- **Usage**: Show spinner/loading indicator
- **Default**: `false`
- **Examples**: DataTableComponent, AccordionComponent, ModalComponent

#### 2. Disabled State
```typescript
@Input() disabled: boolean = false;
```
- **Purpose**: Disable user interaction
- **Usage**: Form controls, buttons, interactive elements
- **Default**: `false`
- **Examples**: GlassButtonComponent, CheckboxComponent

#### 3. Size Variants
```typescript
@Input() size: 'sm' | 'md' | 'lg' = 'md';
```
- **Purpose**: Control component size
- **Usage**: Buttons, inputs, cards, modals
- **Default**: `'md'`
- **Design Tokens**: Use spacing tokens (`--spacing-sm`, `--spacing-md`, `--spacing-lg`)
- **Examples**: GlassButtonComponent, AccordionComponent

#### 4. Visual Variants
```typescript
@Input() variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' = 'secondary';
```
- **Purpose**: Control visual style/color
- **Usage**: Buttons, badges, alerts
- **Default**: `'secondary'`
- **Design Tokens**: Use color tokens (`--color-primary-500`, etc.)
- **Examples**: GlassButtonComponent, BadgeComponent, AlertComponent

#### 5. Custom Classes
```typescript
@Input() customClass: string = '';
```
- **Purpose**: Allow additional Tailwind classes
- **Usage**: All components that render HTML
- **Default**: `''`
- **Note**: Append to base classes, don't replace
- **Examples**: GlassButtonComponent, GlassCardComponent

#### 6. Configuration Object
```typescript
@Input() config: Partial<ComponentConfig> = {};
```
- **Purpose**: Complex configuration for advanced components
- **Usage**: Components with many options (Modal, DataTable, Accordion)
- **Default**: `{}` (merged with defaultConfig)
- **Pattern**: Always provide `defaultConfig` and `mergedConfig` getter
- **Examples**: ModalComponent, AccordionComponent, DataTableComponent

---

## 📤 Common Output Patterns

### Standard Outputs

All components should use these naming conventions for outputs:

#### 1. Click Events
```typescript
@Output() clicked = new EventEmitter<MouseEvent>();
// OR
@Output() click = new EventEmitter<MouseEvent>();
```
- **Purpose**: Handle click interactions
- **Usage**: Buttons, cards, clickable elements
- **Type**: `EventEmitter<MouseEvent>`
- **Examples**: GlassButtonComponent

#### 2. Change Events
```typescript
@Output() changed = new EventEmitter<T>();
// OR
@Output() change = new EventEmitter<T>();
```
- **Purpose**: Handle value changes
- **Usage**: Form controls, inputs, selects
- **Type**: `EventEmitter<T>` where T is the value type
- **Examples**: CheckboxComponent, SwitchComponent

#### 3. Selection Events
```typescript
@Output() selected = new EventEmitter<T>();
// OR
@Output() selectionChange = new EventEmitter<T[]>();
```
- **Purpose**: Handle selection changes
- **Usage**: Tables, lists, multi-select components
- **Type**: `EventEmitter<T>` for single, `EventEmitter<T[]>` for multiple
- **Examples**: DataTableComponent

#### 4. Open/Close Events
```typescript
@Output() opened = new EventEmitter<void>();
@Output() closed = new EventEmitter<void>();
```
- **Purpose**: Handle modal/dialog/accordion open/close
- **Usage**: Modals, dialogs, accordions, offcanvas
- **Type**: `EventEmitter<void>`
- **Examples**: ModalComponent, AccordionComponent

#### 5. Action Events
```typescript
@Output() action = new EventEmitter<ActionEvent>();
```
- **Purpose**: Handle component-specific actions
- **Usage**: Custom actions (edit, delete, etc.)
- **Type**: `EventEmitter<ActionEvent>` with proper interface
- **Examples**: DataTableComponent (for row actions)

---

## 🏗️ Component Structure Patterns

### 1. Configuration Pattern

For components with complex configuration:

```typescript
export interface ComponentConfig {
  option1: string;
  option2: boolean;
  option3: number;
}

@Component({...})
export class MyComponent {
  @Input() config: Partial<ComponentConfig> = {};
  
  // Default configuration
  defaultConfig: ComponentConfig = {
    option1: 'default',
    option2: true,
    option3: 100
  };
  
  // Merged configuration getter
  get mergedConfig(): ComponentConfig {
    return { ...this.defaultConfig, ...this.config };
  }
}
```

**Benefits**:
- Flexible configuration
- Sensible defaults
- Type-safe options
- Easy to extend

**Examples**: ModalComponent, AccordionComponent, DataTableComponent

---

### 2. State Management Pattern

For components with internal state:

```typescript
@Component({...})
export class MyComponent {
  // Internal state (private)
  private _isOpen = signal<boolean>(false);
  
  // Public readonly accessor
  get isOpen(): boolean {
    return this._isOpen();
  }
  
  // Public methods to modify state
  open(): void {
    this._isOpen.set(true);
  }
  
  close(): void {
    this._isOpen.set(false);
  }
}
```

**Benefits**:
- Encapsulated state
- Controlled state changes
- Reactive updates
- Type safety

**Alternative**: Use `@Input() isOpen` with `@Output() opened` for parent-controlled state

---

### 3. Class Generation Pattern

For dynamic styling:

```typescript
@Component({...})
export class MyComponent {
  @Input() variant: 'primary' | 'secondary' = 'secondary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() customClass: string = '';
  
  get componentClasses(): string {
    const baseClasses = 'base-class-1 base-class-2';
    const variantClasses = `variant-${this.variant}`;
    const sizeClasses = `size-${this.size}`;
    
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${this.customClass}`.trim();
  }
}
```

**Benefits**:
- Consistent class generation
- Easy to override with customClass
- Type-safe variants
- Design token integration

**Examples**: GlassButtonComponent, BadgeComponent

---

### 4. TrackBy Pattern

For `*ngFor` loops:

```typescript
@Component({...})
export class MyComponent {
  @Input() items: Item[] = [];
  
  trackByItemId(index: number, item: Item): string {
    return item.id;
  }
}
```

**Template**:
```html
<div *ngFor="let item of items; trackBy: trackByItemId">
  {{ item.name }}
</div>
```

**Benefits**:
- Better performance
- Prevents unnecessary re-renders
- Required for virtual scrolling

**Examples**: AccordionComponent, DataTableComponent

---

## 📝 Naming Conventions

### Inputs
- Use **camelCase**: `isOpen`, `customClass`, `loading`
- Use **descriptive names**: `allowMultiple` not `multi`
- Use **boolean prefixes**: `is*`, `has*`, `can*`, `should*`, `enable*`
- Use **consistent names**: `loading` not `isLoading` or `showLoading`

### Outputs
- Use **past tense for events**: `opened`, `closed`, `changed`, `selected`
- Use **action names**: `clicked`, `submitted`, `deleted`
- Use **consistent naming**: `clicked` or `click` (pick one per component)

### Methods
- Use **verb prefixes**: `open()`, `close()`, `toggle()`, `get()`, `set()`
- Use **descriptive names**: `getMergedConfig()` not `config()`
- Use **boolean returns**: `isOpen()`, `hasItems()`, `canClose()`

### Interfaces
- Use **PascalCase**: `ComponentConfig`, `TableColumn`, `AccordionItem`
- Use **descriptive names**: `ModalConfig` not `Config`
- Use **suffixes**: `*Config`, `*Item`, `*Event`, `*Options`

---

## 🎨 Design Token Integration

### Colors
```typescript
// Use design token CSS variables
const primaryColor = 'var(--color-primary-500, #3b82f6)';
const secondaryColor = 'var(--color-secondary-500, #8b5cf6)';
```

### Spacing
```typescript
// Use Tailwind classes with design tokens
const padding = 'p-4'; // Uses --spacing-md
const margin = 'm-2';  // Uses --spacing-sm
```

### Typography
```typescript
// Use Tailwind classes with design tokens
const textSize = 'text-sm'; // Uses --font-size-sm
const fontWeight = 'font-semibold'; // Uses --font-weight-semibold
```

---

## 🔄 Lifecycle Hooks

### Standard Lifecycle Usage

```typescript
@Component({...})
export class MyComponent implements OnInit, OnChanges, OnDestroy {
  @Input() items: Item[] = [];
  
  ngOnInit(): void {
    // Initialize component state
    this.initializeState();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // React to input changes
    if (changes['items']) {
      this.updateState();
    }
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions, timers, etc.
    this.cleanup();
  }
}
```

**Note**: If using observables, extend `BaseComponent` instead of implementing `OnDestroy` manually.

---

## 🧪 Testing Patterns

### Component Testing

```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should emit clicked event', () => {
    spyOn(component.clicked, 'emit');
    component.handleClick(new MouseEvent('click'));
    expect(component.clicked.emit).toHaveBeenCalled();
  });
});
```

---

## 📚 Documentation Requirements

### Component Documentation

Every component should have:

1. **Component-level JSDoc**:
```typescript
/**
 * Component Name
 * 
 * Description of what this component does.
 * 
 * @example
 * ```html
 * <app-my-component
 *   [items]="items"
 *   [config]="config"
 *   (clicked)="onClick($event)">
 * </app-my-component>
 * ```
 */
@Component({...})
export class MyComponent {
  // ...
}
```

2. **Input/Output Documentation**:
```typescript
/**
 * Whether the component is in loading state
 * @default false
 */
@Input() loading: boolean = false;

/**
 * Emitted when component is clicked
 */
@Output() clicked = new EventEmitter<MouseEvent>();
```

3. **Method Documentation**:
```typescript
/**
 * Opens the component
 * 
 * @returns void
 */
open(): void {
  // Implementation
}
```

---

## ✅ Component Checklist

Before considering a component complete, ensure:

- [ ] All inputs have default values
- [ ] All outputs are properly typed
- [ ] Configuration pattern used (if complex)
- [ ] TrackBy function implemented (if using *ngFor)
- [ ] Design tokens used for colors/spacing
- [ ] Custom classes supported
- [ ] Loading state supported (if applicable)
- [ ] Disabled state supported (if applicable)
- [ ] Proper lifecycle hooks implemented
- [ ] JSDoc comments added
- [ ] Type safety ensured (no `any` types)
- [ ] Accessibility considered (ARIA labels, keyboard navigation)
- [ ] Responsive design considered
- [ ] Dark mode support (if applicable)

---

## 📖 Examples

### Example 1: Simple Button Component

```typescript
/**
 * Glass Button Component
 * 
 * A button component with glass morphism styling.
 */
@Component({
  selector: 'app-glass-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)">
      <span *ngIf="loading" class="spinner">⟳</span>
      <ng-content></ng-content>
    </button>
  `
})
export class GlassButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'secondary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() customClass: string = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center transition-all';
    const variantClasses = `variant-${this.variant}`;
    const sizeClasses = `size-${this.size}`;
    const widthClass = this.fullWidth ? 'w-full' : '';
    
    return `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${this.customClass}`.trim();
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
```

### Example 2: Complex Component with Configuration

```typescript
export interface AccordionConfig {
  allowMultiple: boolean;
  animation: boolean;
  variant: 'default' | 'bordered' | 'flush';
  size: 'sm' | 'md' | 'lg';
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html'
})
export class AccordionComponent implements OnInit {
  @Input() items: AccordionItem[] = [];
  @Input() config: Partial<AccordionConfig> = {};
  @Input() loading: boolean = false;

  @Output() itemToggle = new EventEmitter<AccordionItem>();

  defaultConfig: AccordionConfig = {
    allowMultiple: false,
    animation: true,
    variant: 'default',
    size: 'md'
  };

  get mergedConfig(): AccordionConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  trackByItemId(index: number, item: AccordionItem): string {
    return item.id;
  }

  // ... rest of implementation
}
```

---

## 🔗 Related Documentation

- [STYLING_GUIDELINES.md](./STYLING_GUIDELINES.md) - When to use Tailwind vs SCSS
- [DESIGN_TOKENS_USAGE.md](./DESIGN_TOKENS_USAGE.md) - Design tokens reference
- [SCSS_TO_TAILWIND_MIGRATION.md](./SCSS_TO_TAILWIND_MIGRATION.md) - Migration guide
- [.cursorrules](../.cursorrules) - Project coding standards

---

**Created**: 2025-12-21  
**Last Updated**: 2025-12-21
