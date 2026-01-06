# 🎨 Frontend Standardization Guide

This document outlines the standardization guidelines for the IVAP Frontend application. The goal is to ensure consistency, maintainability, and performance across the codebase by unifying the styling system and component architecture.

## 1. Core Technologies

- **Framework**: Angular v20+ (Standalone Components, Signals)
- **Styling**: Tailwind CSS (Utility-first) + SCSS (for complex animations only)
- **UI Library**: Angular Material (integrated with Tailwind via Design Tokens)
- **Design System**: Glassmorphism (Gemini 2.0 Flash inspired)

## 2. Styling Standards

### ✅ Do: Use Tailwind Utility Classes

Use Tailwind classes directly in your HTML for:

- **Layout**: `flex`, `grid`, `absolute`, `relative`, `block`, `hidden`
- **Spacing**: `m-4`, `p-6`, `gap-4`, `space-x-2`
- **Typography**: `text-xl`, `font-bold`, `leading-tight`
- **Colors**: `bg-white`, `text-slate-900`, `border-gray-200`
- **Responsive**: `md:flex`, `lg:w-1/2`
- **Dark Mode**: `dark:bg-slate-900`, `dark:text-white`

**Example:**

```html
<!-- Correct -->
<div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
  <h2 class="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
</div>
```

### ❌ Don't: Use Component SCSS for Utilities

Avoid writing standard CSS properties in component SCSS files.

**Example:**

```scss
// Incorrect - Don't do this
.header-container {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
}
```

### 🎨 Global Components & Layers

We have defined standard components in `src/styles.scss` within `@layer components`. Use these classes instead of re-implementing styles.

- **Cards**: `.glass-card` (or usage of `<app-glass-card>`)
- **Buttons**: `.glass-button`, `.glass-button-primary`, `.glass-button-danger` (or usage of `<app-glass-button>`)
- **Inputs**: `.glass-input`

**Example:**

```html
<div class="glass-card p-6">
  <input class="glass-input" type="text" placeholder="Search...">
  <button class="glass-button-primary mt-4">Save</button>
</div>
```

## 3. Dark Mode Standardization

### ✅ Do: Use `dark:` Modifier

Use Tailwind's built-in `dark:` prefix for all dark mode styles.

```html
<p class="text-slate-600 dark:text-gray-300">Description text</p>
```

### ❌ Don't: Use SCSS Overrides or ::ng-deep

Do not use `host-context` or `::ng-deep` to force colors based on theme classes, as this breaks encapsulation and makes code hard to read.

```scss
// Incorrect - Don't do this
:host-context(.dark) {
  .description { color: white !important; }
}
```

## 4. Migration Workflow

To migrate an existing component to the standard:

1. **Analyze SCSS**: Read the `component.scss` file.
2. **Move to HTML**: Identify properties (padding, margins, colors) and translate them to Tailwind classes in `component.html`.
3. **Use Global Components**: If you see button/card styles, replace them with global classes (`.glass-card`, etc.) or components.
4. **Clean Up SCSS**: Delete the migrated styles from `component.scss`.
5. **Keep Complex Logic**: Keep `@keyframes`, complex pseudo-elements (`::before`/`::after`), or vendor-specific hacks in SCSS (but try to use `@apply` if possible).

## 5. Directory Structure

Ensure new features follow the established pattern:

```
features/
  ├── [feature-name]/
  │   ├── components/       # Sub-components specific to this feature
  │   ├── [feature-name].routes.ts
  │   └── [feature-name].component.ts|html|scss
```

---
**Note**: If you encounter `Unknown at rule @apply` warnings in SCSS files, you can safely ignore them as they are valid Tailwind directives.
