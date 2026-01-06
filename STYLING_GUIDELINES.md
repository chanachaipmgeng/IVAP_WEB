# 🎨 Styling Guidelines - Tailwind vs SCSS

**Last Updated**: 2025-12-21  
**Status**: ✅ **Guidelines Created**

---

## 📋 สารบัญ

1. [Overview](#overview)
2. [Decision Tree](#decision-tree)
3. [When to Use Tailwind](#when-to-use-tailwind)
4. [When to Use SCSS](#when-to-use-scss)
5. [Design Tokens Usage](#design-tokens-usage)
6. [Migration Strategy](#migration-strategy)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## 🎯 Overview

โปรเจคนี้ใช้ **Tailwind CSS** เป็นหลักสำหรับ styling และใช้ **SCSS** เฉพาะเมื่อจำเป็นเท่านั้น

### Core Principles

1. **Tailwind First**: ใช้ Tailwind CSS utility classes เป็นหลัก
2. **SCSS for Complex Cases**: ใช้ SCSS เฉพาะเมื่อ Tailwind ไม่สามารถทำได้
3. **Design Tokens**: ใช้ design tokens ผ่าน CSS variables เสมอ
4. **Consistency**: รักษา consistency ในการใช้ styling approach

---

## 🌳 Decision Tree

```
Start: Need to style something?
│
├─ Is it a simple utility (spacing, color, typography)?
│  └─ YES → Use Tailwind classes ✅
│
├─ Is it a complex animation or pseudo-element?
│  └─ YES → Use SCSS ✅
│
├─ Is it a reusable pattern used in multiple places?
│  └─ YES → Create utility class in SCSS or Tailwind config ✅
│
├─ Is it component-specific complex styling?
│  └─ YES → Use component SCSS file ✅
│
└─ Is it a simple one-off style?
   └─ YES → Use Tailwind classes ✅
```

---

## ✅ When to Use Tailwind CSS

### 1. **Layout & Spacing**
```html
<!-- ✅ Use Tailwind -->
<div class="flex items-center justify-between p-4 gap-2">
  <span class="ml-2 mr-4">Content</span>
</div>

<!-- ❌ Avoid SCSS -->
<div class="custom-layout">
  <span class="custom-spacing">Content</span>
</div>
```

### 2. **Colors & Typography**
```html
<!-- ✅ Use Tailwind with design tokens -->
<h1 class="text-primary-500 text-2xl font-bold">
  Title
</h1>

<p class="text-gray-600 text-base">
  Description
</p>

<!-- ❌ Avoid inline styles -->
<h1 style="color: #3b82f6; font-size: 1.5rem;">
  Title
</h1>
```

### 3. **Responsive Design**
```html
<!-- ✅ Use Tailwind breakpoints -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Content -->
</div>

<!-- ❌ Avoid SCSS media queries for simple responsive -->
```

### 4. **State Variants**
```html
<!-- ✅ Use Tailwind state variants -->
<button class="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 
               disabled:opacity-50 disabled:cursor-not-allowed">
  Click Me
</button>
```

### 5. **Dark Mode**
```html
<!-- ✅ Use Tailwind dark mode -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### 6. **Simple Animations**
```html
<!-- ✅ Use Tailwind transitions -->
<button class="transition-all duration-300 hover:scale-105">
  Hover Me
</button>
```

---

## 🎨 When to Use SCSS

### 1. **Complex Animations**
```scss
// ✅ Use SCSS for complex keyframe animations
@keyframes slideInFromLeft {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in {
  animation: slideInFromLeft 0.5s ease-out;
}
```

### 2. **Pseudo-elements (::before, ::after)**
```scss
// ✅ Use SCSS for pseudo-elements
.tooltip {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: var(--color-gray-800);
  }
}
```

### 3. **Complex Selectors**
```scss
// ✅ Use SCSS for complex nested selectors
.card {
  &:hover {
    .card-image {
      transform: scale(1.05);
    }
    
    .card-overlay {
      opacity: 1;
    }
  }
  
  &:nth-child(odd) {
    background: var(--color-gray-50);
  }
}
```

### 4. **Component-Specific Styles**
```scss
// ✅ Use SCSS for component-specific complex styles
// component-name.component.scss
:host {
  display: block;
  
  .internal-structure {
    // Complex component-specific styling
  }
}
```

### 5. **CSS Variables with Calculations**
```scss
// ✅ Use SCSS for complex calculations
.container {
  padding: calc(var(--spacing-md) + var(--spacing-xs));
  margin: calc(var(--spacing-xl) * 2);
}
```

### 6. **Glass Morphism Effects**
```scss
// ✅ Use SCSS for glass morphism (if not using utility class)
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

---

## 🎨 Design Tokens Usage

### In Tailwind Classes

Tailwind config ใช้ design tokens แล้ว ดังนั้น classes ต่อไปนี้ใช้ tokens อัตโนมัติ:

```html
<!-- Colors -->
<div class="bg-primary-500 text-error-500 border-warning-500">
  <!-- Uses design tokens automatically -->
</div>

<!-- Spacing -->
<div class="p-md m-lg gap-sm">
  <!-- Uses design tokens automatically -->
</div>

<!-- Typography -->
<p class="text-base font-semibold">
  <!-- Uses design tokens automatically -->
</p>
```

### In SCSS Files

```scss
// ✅ Always use CSS variables from design tokens
.my-component {
  color: var(--color-primary-500);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-normal);
}

// ❌ Never use hardcoded values
.my-component {
  color: #3b82f6; // ❌ Don't do this
  padding: 1rem; // ❌ Don't do this
}
```

### In TypeScript (Inline Styles)

```typescript
// ✅ Use CSS variables
const style = {
  color: 'var(--color-primary-500)',
  padding: 'var(--spacing-md)'
};

// ❌ Avoid hardcoded values
const style = {
  color: '#3b82f6', // ❌ Don't do this
  padding: '1rem' // ❌ Don't do this
};
```

---

## 🔄 Migration Strategy

### Phase 1: Inline Styles → Tailwind (Priority: High)

**Target**: Components with inline styles

**Steps**:
1. Identify components with inline styles
2. Convert simple inline styles to Tailwind classes
3. Move complex inline styles to SCSS
4. Use design tokens for all values

**Example**:
```typescript
// ❌ Before: Inline styles
<div [style.color]="'#3b82f6'" [style.padding]="'1rem'">
  Content
</div>

// ✅ After: Tailwind classes
<div class="text-primary-500 p-md">
  Content
</div>
```

### Phase 2: SCSS → Tailwind (Priority: Medium)

**Target**: Simple SCSS that can be replaced with Tailwind

**Steps**:
1. Identify SCSS that's just utility classes
2. Replace with Tailwind classes
3. Keep only complex SCSS

**Example**:
```scss
// ❌ Before: Simple SCSS
.container {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin: 0.5rem;
}

// ✅ After: Tailwind classes
// Remove SCSS, use in template:
// <div class="flex items-center p-md m-sm">
```

### Phase 3: Create Utility Classes (Priority: Medium)

**Target**: Common patterns used across multiple components

**Steps**:
1. Identify repeated patterns
2. Create utility classes in `styles.scss` or Tailwind config
3. Document usage

**Example**:
```scss
// ✅ Create utility class for common pattern
.glass-card {
  @apply bg-white/10 backdrop-blur-lg border border-white/20;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

---

## 📚 Best Practices

### 1. **Component Structure**

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  // ✅ Use SCSS only when necessary
  styleUrls: ['./example.component.scss'] // Only if complex styling needed
})
export class ExampleComponent {
  // Component logic
}
```

```html
<!-- ✅ Template: Use Tailwind classes -->
<div class="flex items-center justify-between p-md bg-white rounded-lg shadow-sm">
  <h2 class="text-xl font-bold text-gray-900">Title</h2>
  <button class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600">
    Action
  </button>
</div>
```

### 2. **Naming Conventions**

- **Tailwind Classes**: Use as-is (e.g., `flex`, `p-md`, `text-primary-500`)
- **SCSS Classes**: Use BEM-like naming (e.g., `.card`, `.card__header`, `.card--featured`)
- **Utility Classes**: Use descriptive names (e.g., `.glass-card`, `.fade-in`)

### 3. **Responsive Design**

```html
<!-- ✅ Use Tailwind responsive classes -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <!-- Content -->
</div>

<!-- ❌ Avoid SCSS media queries for simple responsive -->
```

### 4. **Dark Mode**

```html
<!-- ✅ Use Tailwind dark mode classes -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### 5. **Performance**

- ✅ **Use Tailwind**: Smaller bundle size (unused classes are purged)
- ✅ **Minimize SCSS**: Only include necessary SCSS
- ✅ **Avoid Inline Styles**: Use Tailwind or SCSS instead

---

## 💡 Examples

### Example 1: Simple Card Component

```html
<!-- ✅ Template: Tailwind only -->
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-xl font-bold text-gray-900 mb-2">Card Title</h3>
  <p class="text-gray-600">Card description</p>
</div>
```

**No SCSS needed!**

### Example 2: Complex Card with Animation

```html
<!-- Template -->
<div class="card-container">
  <div class="card">
    <div class="card-overlay"></div>
    <div class="card-content">
      <h3>Card Title</h3>
    </div>
  </div>
</div>
```

```scss
// ✅ Component SCSS: Complex styling
.card-container {
  position: relative;
  perspective: 1000px;
}

.card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  
  &:hover {
    transform: rotateY(180deg);
    
    .card-overlay {
      opacity: 1;
    }
  }
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity var(--transition-normal);
  backdrop-filter: blur(4px);
}
```

### Example 3: Using Design Tokens

```scss
// ✅ SCSS with design tokens
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-500);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-normal);
  
  &:hover {
    background: var(--color-primary-600);
  }
  
  &:disabled {
    background: var(--color-gray-300);
    cursor: not-allowed;
  }
}
```

---

## 🚫 Anti-Patterns

### ❌ Don't Mix Approaches Unnecessarily

```html
<!-- ❌ Bad: Mixing inline styles with Tailwind -->
<div class="flex p-4" [style.color]="'#3b82f6'">
  Content
</div>

<!-- ✅ Good: Use Tailwind classes -->
<div class="flex p-md text-primary-500">
  Content
</div>
```

### ❌ Don't Create SCSS for Simple Utilities

```scss
// ❌ Bad: SCSS for simple utility
.simple-container {
  display: flex;
  padding: 1rem;
}

// ✅ Good: Use Tailwind
// <div class="flex p-md">
```

### ❌ Don't Use Hardcoded Values

```scss
// ❌ Bad: Hardcoded values
.component {
  color: #3b82f6;
  padding: 1rem;
}

// ✅ Good: Design tokens
.component {
  color: var(--color-primary-500);
  padding: var(--spacing-md);
}
```

---

## 📊 Checklist

### Before Writing Styles

- [ ] Can this be done with Tailwind classes?
  - [ ] YES → Use Tailwind ✅
  - [ ] NO → Continue to next question
- [ ] Is this a complex animation or pseudo-element?
  - [ ] YES → Use SCSS ✅
  - [ ] NO → Continue to next question
- [ ] Is this a reusable pattern?
  - [ ] YES → Create utility class ✅
  - [ ] NO → Use component SCSS ✅

### Code Review Checklist

- [ ] No inline styles (except dynamic values)
- [ ] Using design tokens (CSS variables)
- [ ] Tailwind classes used where possible
- [ ] SCSS only for complex cases
- [ ] Responsive design with Tailwind breakpoints
- [ ] Dark mode support where needed

---

## 🛠️ Available Utility Classes

### Animation Utilities
- `.fade-in` - Fade in animation
- `.slide-in-top` - Slide in from top
- `.slide-in-bottom` - Slide in from bottom
- `.scale-in` - Scale in animation
- `.pulse-slow` - Slow pulse animation
- `.spin-slow` - Slow spin animation
- `.bounce-subtle` - Subtle bounce animation
- `.shimmer` - Shimmer effect

### Text Utilities
- `.text-truncate` - Truncate to 1 line
- `.text-truncate-2` - Truncate to 2 lines
- `.text-truncate-3` - Truncate to 3 lines

### Scrollbar Utilities
- `.scrollbar-thin` - Thin styled scrollbar (supports dark mode)

### Aspect Ratio Utilities
- `.aspect-square` - 1:1 aspect ratio
- `.aspect-video` - 16:9 aspect ratio
- `.aspect-4-3` - 4:3 aspect ratio

### Gradient Utilities
- `.gradient-primary` - Primary color gradient
- `.gradient-secondary` - Secondary color gradient
- `.gradient-success` - Success color gradient
- `.gradient-error` - Error color gradient

### Backdrop Blur Utilities
- `.backdrop-blur-glass` - Glass blur effect (10px)
- `.backdrop-blur-glass-lg` - Large glass blur effect (20px)

### Shadow Utilities
- `.shadow-glass` - Glass morphism shadow
- `.shadow-glass-lg` - Large glass morphism shadow

### Loading Utilities
- `.spinner` - Loading spinner
- `.spinner-sm` - Small spinner (16px)
- `.spinner-md` - Medium spinner (24px)
- `.spinner-lg` - Large spinner (32px)

### Focus Utilities
- `.focus-ring` - Standard focus ring with design tokens

**All utilities use design tokens and support dark mode!**

---

## 🔗 Related Documentation

- [INLINE_STYLES_MIGRATION_GUIDE.md](./INLINE_STYLES_MIGRATION_GUIDE.md) - Guide for migrating inline styles
- [DESIGN_TOKENS_USAGE.md](./DESIGN_TOKENS_USAGE.md) - Design tokens reference
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Next steps for styling standardization
- [IMPROVEMENT_CHECKLIST.md](./IMPROVEMENT_CHECKLIST.md) - Overall improvement checklist

---

**สร้างเมื่อ**: 2025-12-21  
**อัปเดตล่าสุด**: 2025-12-21  
**ผู้สร้าง**: AI Assistant

---

## 📚 Related Documentation

- [INLINE_STYLES_MIGRATION_GUIDE.md](./INLINE_STYLES_MIGRATION_GUIDE.md) - Guide for migrating inline styles
- [DESIGN_TOKENS_USAGE.md](./DESIGN_TOKENS_USAGE.md) - Design tokens reference
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Next steps for styling standardization
- [IMPROVEMENT_CHECKLIST.md](./IMPROVEMENT_CHECKLIST.md) - Overall improvement checklist

