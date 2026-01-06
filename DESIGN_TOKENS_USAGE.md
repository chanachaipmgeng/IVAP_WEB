# 🎨 Design Tokens Usage Guide

**Last Updated**: 2025-12-21  
**Status**: ✅ **All Shared Components Updated with Design Tokens**  
**Styling Guidelines**: ✅ **Created** - See [STYLING_GUIDELINES.md](./STYLING_GUIDELINES.md)

---

## 📊 Overview

Design tokens are now available as CSS variables and can be used in:
- SCSS files (via CSS variables)
- TypeScript components (via `DESIGN_TOKENS` import)
- Tailwind classes (via Tailwind config)

---

## 🎯 Components Updated ✅

### GlassButtonComponent

### Changes Made

1. **CSS Variables Added** (`styles.scss`)
   - Color tokens (primary, secondary, warning, error, etc.)
   - Spacing tokens (xs, sm, md, lg, xl)
   - Border radius tokens (sm, md, lg, xl, 2xl)
   - Typography tokens (font-size, font-weight)
   - Transition tokens (fast, normal, slow)

2. **Glass Button Styles Updated** (`styles.scss`)
   - `.glass-button` - Uses design tokens for:
     - Font size: `var(--font-size-sm)` (14px)
     - Font weight: `var(--font-weight-semibold)` (600)
     - Padding: `var(--spacing-sm)` and calculated values
     - Border radius: `var(--radius-lg)` (12px)
     - Transition: `var(--transition-normal)` (300ms)
   
   - `.glass-button-primary` - Uses design tokens for:
     - Colors: `var(--color-warning-500)`, `var(--color-warning-600)`, etc.
     - Same spacing/typography tokens as secondary
   
   - `.glass-button-danger` - Uses design tokens for:
     - Colors: `var(--color-error-500)`, `var(--color-error-600)`
     - Same spacing/typography tokens

3. **Component SCSS Updated** (`glass-button.component.scss`)
   - Responsive styles now use CSS variables
   - Padding: `var(--spacing-sm) var(--spacing-md)`
   - Font size: `var(--font-size-sm)`

4. **Component TypeScript** (`glass-button.component.ts`)
   - Comments updated to reference design tokens
   - Size classes still use Tailwind (which uses design tokens via config)

### GlassCardComponent - Updated ✅

1. **Glass Card Styles Updated** (`styles.scss`)
   - `.glass-card` - Uses design tokens for:
     - Border radius: `var(--radius-2xl)` (24px)
     - Transition: `var(--transition-normal)` (300ms)
     - Colors: Uses primary-500 for borders

2. **Component TypeScript** (`glass-card.component.ts`)
   - Comments updated to reference design tokens
   - Padding classes use Tailwind (which uses design tokens via config)

### GlassInputComponent - Updated ✅

1. **Glass Input Styles Updated** (`styles.scss`)
   - `.glass-input` - Uses design tokens for:
     - Border radius: `var(--radius-lg)` (12px)
     - Padding: `var(--spacing-md)` (16px)
     - Font size: `var(--font-size-base)` (16px)
     - Transition: `var(--transition-normal)` (300ms)
     - Colors: Uses design tokens (gray-900, gray-500, warning-500, primary-500)

2. **Component TypeScript** (`glass-input.component.ts`)
   - Error color updated to use `text-error-500` (Tailwind class)

### BadgeComponent - Updated ✅

1. **Badge Styles Updated** (inline styles in component)
   - All variant colors use design tokens:
     - `.badge-primary`: `var(--color-primary-500)`
     - `.badge-success`: `var(--color-success-500)`
     - `.badge-warning`: `var(--color-warning-500)`
     - `.badge-danger`: `var(--color-error-500)`
     - `.badge-info`: `var(--color-info-500)`
     - `.badge-secondary`: `var(--color-secondary-500)`
     - `.badge-default`: `var(--color-gray-500)`
   - Sizes use design tokens:
     - Padding: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`
     - Font sizes: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`
   - Border radius: `var(--radius-md)`

### AlertComponent - Updated ✅

1. **Alert Styles Updated** (inline styles in component)
   - All variant colors use design tokens:
     - Background colors: rgba with design token colors
     - Border colors: rgba with design token colors
     - Text colors: design token colors (info-600, success-700, etc.)
   - Sizes use design tokens:
     - Padding: `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`
     - Font sizes: `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`
   - Border radius: `var(--radius-lg)`
   - Transition: `var(--transition-normal)`

### ProgressBarComponent - Updated ✅

1. **Progress Bar Styles Updated** (`progress-bar.component.scss`)
   - Border radius: `var(--radius-sm)`
   - Transition: `var(--transition-normal)`
   - Color variants use design tokens:
     - `.progress-bar-primary`: `var(--color-primary-500)`, `var(--color-primary-700)`
     - `.progress-bar-success`: `var(--color-success-500)`, `var(--color-success-600)`
     - `.progress-bar-warning`: `var(--color-warning-500)`, `var(--color-warning-600)`
     - `.progress-bar-danger`: `var(--color-error-500)`, `var(--color-error-600)`
     - `.progress-bar-info`: `var(--color-info-500)`, `var(--color-info-600)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`
   - Status colors: `var(--color-success-500)`, `var(--color-warning-500)`, `var(--color-error-500)`

### ModalComponent - Updated ✅

1. **Modal Styles Updated** (`modal.component.scss`)
   - Spacing tokens:
     - `--modal-dialog-margin`: `var(--spacing-lg)`
     - `--modal-dialog-margin-y`: `var(--spacing-xl)`
     - `--modal-header-padding`: Uses `var(--spacing-lg)` and calculated values
     - `--modal-body-padding`: Uses `var(--spacing-xl)` and calculated values
     - `--modal-footer-padding`: Uses `var(--spacing-lg)` and calculated values
     - `--modal-header-gap`: `var(--spacing-lg)`
     - `--modal-footer-gap`: `var(--spacing-md)`
     - `--modal-section-gap`: `var(--spacing-lg)`
   - Border radius: `var(--radius-2xl)` (24px)
   - Colors: Uses primary-500, secondary-500, gray tokens
   - Typography: Uses gray color tokens for text

### LoadingStateComponent - Updated ✅

1. **Loading State Styles Updated** (inline styles in component)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-xl)`
   - Colors: `var(--color-primary-500)` for spinners, dots, bars, pulse
   - Border radius: `var(--radius-sm)`, `var(--radius-md)`
   - Typography: `var(--font-size-sm)`, `var(--font-weight-medium)`
   - Transitions: Uses rgba with primary-500 for gradients

### SkeletonComponent - Updated ✅

1. **Skeleton Styles Updated** (inline styles in component)
   - Spacing: `var(--spacing-md)` for gap
   - Colors: rgba with `primary-500` for gradient backgrounds
   - Border radius: `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-xl)`

### PaginationComponent - Updated ✅

1. **Pagination Styles Updated** (inline styles in component)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`
   - Colors: `var(--color-gray-300)`, `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-gray-700)`, `var(--color-primary-500)`
   - Border radius: `var(--radius-md)`
   - Typography: `var(--font-size-sm)`
   - Transitions: `var(--transition-fast)`

### ErrorMessageComponent - Updated ✅

1. **Error Message Classes Updated** (TypeScript methods)
   - Uses Tailwind classes that map to design tokens:
     - `bg-error-50`, `bg-warning-50`, `bg-info-50`, `bg-success-50`
     - `text-error-800`, `text-warning-800`, etc.
     - `text-error-500`, `hover:bg-error-100`, etc.

### TooltipComponent - Updated ✅

1. **Tooltip Styles Updated** (`tooltip.component.scss`)
   - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`
   - Border radius: `var(--radius-lg)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`
   - Transitions: `var(--transition-fast)`
   - Colors: `var(--color-primary-500)`, `var(--color-primary-700)`, `var(--color-success-500)`, `var(--color-warning-500)`, `var(--color-error-500)`, `var(--color-info-500)`, `var(--color-gray-*)`

### AccordionComponent - Updated ✅

1. **Accordion Styles Updated** (`accordion.component.scss`)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`
   - Border radius: `var(--radius-sm)`, `var(--radius-lg)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Transitions: `var(--transition-normal)`
   - Colors: `var(--color-primary-500)`, `var(--color-success-500)`, `var(--color-warning-500)`, `var(--color-error-500)`, `var(--color-info-500)`, `var(--color-gray-500)`, `var(--color-gray-400)`

### TabsComponent - Updated ✅

1. **Tabs Classes Updated** (TypeScript methods)
   - Uses Tailwind classes that map to design tokens:
     - `border-primary-500`, `text-primary-600`, `text-primary-400`
     - `bg-primary-100`, `bg-primary-900`, `text-primary-600`, `text-primary-300`

### DividerComponent - Updated ✅

1. **Divider Styles Updated** (inline styles in component)
   - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`
   - Typography: `var(--font-size-sm)`
   - Colors: `var(--color-gray-500)`

### StatisticsCardComponent - Updated ✅

1. **Statistics Card Classes Updated** (TypeScript)
   - Uses Tailwind classes that map to design tokens:
     - `bg-primary-100`, `bg-primary-900` (via iconBgClass)

### AvatarComponent - Updated ✅

1. **Avatar Styles Updated** (inline styles in component)
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-semibold)`
   - Border radius: `var(--radius-lg)` for rounded shape
   - Colors: `var(--color-success-500)`, `var(--color-gray-500)`, `var(--color-warning-500)`, `var(--color-error-500)` for status indicators
   - Spacing: `var(--spacing-sm)` for group item margin

### BreadcrumbComponent - Updated ✅

1. **Breadcrumb Styles Updated** (inline styles in component)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`
   - Typography: `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-medium)`
   - Colors: `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-gray-900)`, `var(--color-primary-500)`
   - Transitions: `var(--transition-fast)`

### StepperComponent - Updated ✅

1. **Stepper Styles Updated** (inline styles in component)
   - Spacing: `var(--spacing-sm)` for gap
   - Typography: `var(--font-size-lg)` for icon size

### TimelineComponent - Updated ✅

1. **Timeline Styles Updated** (`timeline.component.scss`)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
   - Border radius: `var(--radius-sm)`, `var(--radius-lg)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Transitions: `var(--transition-normal)`
   - Colors: `var(--color-primary-500)`, `var(--color-success-500)`, `var(--color-warning-500)`, `var(--color-error-500)`, `var(--color-secondary-500)`, `var(--color-gray-500)`

2. **Timeline Component TypeScript** (`timeline.component.ts`)
   - Event type colors use design tokens: `var(--color-gray-500)`, `var(--color-success-500)`, etc.
   - Default line color: `var(--color-primary-500)`

### RatingComponent - Updated ✅

1. **Rating Styles Updated** (inline styles in component)
   - Colors: `var(--color-gray-300)`, `var(--color-warning-400)`, `var(--color-warning-500)`, `var(--color-error-500)`, `var(--color-error-600)`, `var(--color-success-500)`
   - Transitions: `var(--transition-normal)`
   - Uses Tailwind classes: `text-error-500` for required asterisk

### FormFieldComponent - Updated ✅

1. **Form Field Classes Updated** (TypeScript template)
   - Uses Tailwind classes that map to design tokens:
     - `text-error-500` for required asterisk
     - `border-error-500` for error borders
     - `text-error-600`, `text-error-400` for error messages

### GalleryComponent - Updated ✅

1. **Gallery Styles Updated** (`gallery.component.scss`)
   - CSS Variables: Updated to use design tokens for colors, spacing, border-radius, transitions
   - Colors: `var(--color-white)`, `var(--color-gray-*)`, `var(--color-primary-500)`, `var(--color-error-500)`
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`, `var(--spacing-2xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-xl)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`
   - Transitions: `var(--transition-normal)`
   - Theme variants: Dark and light themes use design tokens

### CalendarComponent - Updated ✅

1. **Calendar Styles Updated** (`calendar.component.scss`)
   - Spacing: `var(--spacing-md)`, `var(--spacing-sm)`, `var(--spacing-xs)`
   - Border-radius: `var(--radius-lg)`, `var(--radius-md)`
   - Typography: `var(--font-size-sm)`
   - Colors: `var(--color-primary-500)`, `var(--color-primary-600)`, `var(--color-success-500)`, `var(--color-warning-500)`, `var(--color-error-500)`, `var(--color-secondary-500)`, `var(--color-gray-500)`
   - Event categories and priorities use design tokens

### FAQComponent - Updated ✅

1. **FAQ Styles Updated** (`faq.component.scss`)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`, `var(--spacing-2xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`, `var(--font-weight-bold)`, `var(--font-weight-black)`
   - Border-radius: `var(--radius-sm)`, `var(--radius-lg)`, `var(--radius-xl)`, `var(--radius-2xl)`
   - Colors: `var(--color-primary-500)`, `var(--color-primary-600)`, `var(--color-success-500)`, `var(--color-success-50)`, `var(--color-error-500)`, `var(--color-error-50)`, `var(--color-gray-200)`
   - Transitions: `var(--transition-normal)`

### DocumentationComponent - Updated ✅

1. **Documentation Styles Updated** (`documentation.component.scss`)
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`, `var(--spacing-2xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`, `var(--font-weight-bold)`, `var(--font-weight-black)`
   - Border-radius: `var(--radius-sm)`, `var(--radius-lg)`, `var(--radius-xl)`, `var(--radius-2xl)`
   - Colors: `var(--color-primary-500)`, `var(--color-primary-600)`, `var(--color-success-100)`, `var(--color-success-800)`, `var(--color-warning-100)`, `var(--color-warning-800)`, `var(--color-error-100)`, `var(--color-error-800)`, `var(--color-info-100)`, `var(--color-info-800)`, `var(--color-gray-200)`, `var(--color-gray-700)`
   - Transitions: `var(--transition-normal)`

### OffcanvasComponent - Updated ✅

1. **Offcanvas Styles Updated** (`offcanvas.component.scss`)
   - CSS Variables: Updated to use design tokens for colors, spacing, border-radius, transitions
   - Colors: `var(--color-gray-900)`, `var(--color-gray-600)`, `var(--color-primary-500)`
   - Spacing: `var(--spacing-md)`, `var(--spacing-sm)`, `var(--spacing-xl)`
   - Typography: `var(--font-size-sm)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-md)`
   - Transitions: `var(--transition-normal)`

### SidebarComponent - Updated ✅

1. **Sidebar Styles Updated** (`sidebar.component.scss`)
   - Transitions: `var(--transition-normal)`
   - Colors: Comments added for primary-500 and warning-500 usage in rgba values

### HeaderComponent - Updated ✅

1. **Header Styles Updated** (`header.component.scss`)
   - Transitions: `var(--transition-normal)`
   - Colors: Comments added for primary-500 and warning-500 usage in rgba values

### DraggableCardsComponent - Updated ✅

1. **Draggable Cards Styles Updated** (`draggable-cards.component.scss`)
   - CSS Variables: Updated to use design tokens for border-radius, transitions, colors
   - Colors: `var(--color-primary-500)`, `var(--color-success-500)`, `var(--color-warning-500)`, `var(--color-error-500)`, `var(--color-info-500)`, `var(--color-gray-500)`
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-xl)`
   - Transitions: `var(--transition-normal)`

### SwiperGalleryComponent - Updated ✅

1. **Swiper Gallery Styles Updated** (`swiper-gallery.component.scss`)
   - CSS Variables: Updated to use design tokens for accent color, border-radius, transitions
   - Colors: `var(--color-primary-500)` for accent
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-weight-semibold)`, `var(--font-weight-bold)`
   - Border-radius: `var(--radius-lg)`, `var(--radius-xl)`
   - Transitions: `var(--transition-normal)`

### RichTextEditorComponent - Updated ✅

1. **Rich Text Editor Styles Updated** (`rich-text-editor.component.scss`)
   - CSS Variables: Updated to use design tokens for colors, spacing, border-radius, transitions
   - Colors: `var(--color-white)`, `var(--color-gray-50)`, `var(--color-gray-100)`, `var(--color-gray-200)`, `var(--color-gray-300)`, `var(--color-gray-500)`, `var(--color-gray-700)`, `var(--color-gray-900)`, `var(--color-primary-500)`
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-2xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-size-2xl)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-sm)`, `var(--radius-lg)`
   - Transitions: `var(--transition-fast)`

### PopoverComponent - Updated ✅

1. **Popover Styles Updated** (inline styles in component)
   - Colors: `var(--color-white)`, `var(--color-gray-200)`, `var(--color-gray-500)`, `var(--color-gray-700)`, `var(--color-gray-900)`
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`
   - Typography: `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-lg)`

### ChartComponent - Updated ✅

1. **Chart Styles Updated** (inline styles in component)
   - Minimal inline styles, mostly container positioning

### ApexChartComponent - Updated ✅

1. **Apex Chart Styles Updated** (inline styles in component)
   - Colors: `var(--color-white)`, `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-primary-500)`, `var(--color-purple-500)`, `var(--color-info-500)`, `var(--color-success-500)`, `var(--color-warning-500)`
   - Comments added for primary-500 usage in rgba values

### TimestampComponent - Updated ✅

1. **Timestamp Styles Updated** (`timestamp.component.scss` and TypeScript)
   - CSS Variables: Updated to use design tokens for colors
   - Colors: `var(--color-white)`, `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-gray-900)`, `var(--color-success-500)`, `var(--color-error-500)`, `var(--color-warning-500)`, `var(--color-primary-500)`
   - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
   - Typography: `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-size-xl)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`, `var(--font-weight-bold)`
   - Border-radius: `var(--radius-lg)`, `var(--radius-xl)`
   - Transitions: `var(--transition-normal)`
   - TypeScript: Updated `getLocationStatusColor()` method to use design token CSS variables

### FaceRecognitionComponent - Updated ✅

1. **Face Recognition Styles Updated** (`face-recognition.component.scss`)
   - CSS Variables: Updated to use design tokens for colors
   - Colors: `var(--color-white)`, `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-gray-900)`, `var(--color-success-500)`, `var(--color-error-500)`, `var(--color-warning-500)`, `var(--color-primary-500)`
   - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-lg)`, `var(--radius-xl)`
   - Transitions: `var(--transition-normal)`
   - Comments added for color usage in rgba values

### GroupFaceRecognitionComponent - Updated ✅

1. **Group Face Recognition Styles Updated** (`group-face-recognition.component.scss`)
   - CSS Variables: Updated to use design tokens for colors
   - Colors: `var(--color-white)`, `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-gray-900)`, `var(--color-success-500)`, `var(--color-error-500)`, `var(--color-warning-500)`, `var(--color-primary-500)`
   - Spacing: `var(--spacing-xs)`, `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`
   - Typography: `var(--font-size-xs)`, `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-medium)`, `var(--font-weight-semibold)`
   - Border-radius: `var(--radius-lg)`, `var(--radius-xl)`
   - Transitions: `var(--transition-normal)`
   - Comments added for color usage in rgba values

### MobileCameraComponent - Updated ✅

1. **Mobile Camera Styles Updated** (`mobile-camera.component.scss`)
   - CSS Variables: Updated to use design tokens for colors
   - Colors: `var(--color-white)`, `var(--color-gray-400)`, `var(--color-gray-500)`, `var(--color-gray-900)`, `var(--color-success-500)`, `var(--color-error-500)`, `var(--color-warning-500)`, `var(--color-primary-500)`
   - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`, `var(--spacing-lg)`, `var(--spacing-xl)`, `var(--spacing-2xl)`
   - Typography: `var(--font-size-sm)`, `var(--font-size-base)`, `var(--font-size-lg)`, `var(--font-weight-medium)`
   - Border-radius: `var(--radius-lg)`, `var(--radius-xl)`
   - Transitions: `var(--transition-fast)`

### NotificationCenterComponent - Updated ✅

1. **Notification Center Styles Updated** (inline styles in component)
   - Tailwind Classes: Updated from hardcoded `bg-red-500`, `bg-blue-500`, `text-red-400`, `text-blue-400` to design-token-mapped `bg-error-500`, `bg-primary-500`, `text-error-400`, `text-primary-400`
   - Inline Styles: Updated colors, spacing, border-radius, transitions to use design tokens
   - Colors: `var(--color-primary-500)`, `var(--color-success-500)`, `var(--color-error-500)`, `var(--color-warning-500)`, `var(--color-gray-400)`
   - Spacing: `var(--spacing-sm)`, `var(--spacing-md)`
   - Border-radius: `var(--radius-sm)`, `var(--radius-xl)`
   - Transitions: `var(--transition-fast)`
   - Comments added for primary-500 usage in rgba values

---

## 📝 Available CSS Variables

### Colors
```css
/* Primary */
--color-primary-500: #3b82f6;
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;

/* Secondary */
--color-secondary-500: #8b5cf6;

/* Warning */
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;
--color-warning-700: #b45309;

/* Error/Danger */
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Info */
--color-info-500: #06b6d4;

/* Success */
--color-success-500: #10b981;

/* Gray Scale */
--color-gray-50 through --color-gray-950
```

### Spacing
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

### Border Radius
```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
```

### Typography
```css
--font-size-xs: 0.75rem;     /* 12px */
--font-size-sm: 0.875rem;    /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-weight-semibold: 600;
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🔧 Usage Examples

### In SCSS Files
```scss
.my-component {
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-500);
  transition: var(--transition-normal);
}
```

### In TypeScript (via DESIGN_TOKENS)
```typescript
import { DESIGN_TOKENS, getColorToken, getSpacingToken } from '@core/config/design-tokens';

// Get color
const primaryColor = getColorToken('primary', 500); // '#3b82f6'

// Get spacing
const mediumSpacing = getSpacingToken('md'); // '1rem'

// Direct access
const fontSize = DESIGN_TOKENS.typography.fontSize.sm; // '0.875rem'
```

### In Tailwind Classes
```html
<!-- Tailwind config already uses design tokens -->
<div class="p-4 rounded-lg text-sm font-semibold bg-primary-500">
  <!-- p-4 uses spacing.md, rounded-lg uses radius.lg, etc. -->
</div>
```

---

## ✅ Benefits

1. **Consistency**: All components use the same design values
2. **Maintainability**: Change tokens once, update everywhere
3. **Type Safety**: TypeScript imports provide autocomplete
4. **Flexibility**: Can use CSS variables or TypeScript imports
5. **Theme Support**: Easy to switch themes by changing CSS variables

---

## 🎯 Error Pages & Auth Components

### Error404Component
- **File**: `error-404.component.scss`
- **Changes**: Replaced hardcoded values with design tokens for colors, spacing, typography, border-radius, and transitions
- **Key Updates**:
  - Colors: `#667eea` → `var(--color-primary-500, #667eea)`, `#2d3748` → `var(--color-gray-800, #2d3748)`, etc.
  - Spacing: `2rem` → `var(--spacing-xl)`, `3rem` → `var(--spacing-2xl)`, etc.
  - Typography: Font sizes and weights now use design tokens
  - Border radius: `20px` → `var(--radius-2xl)`, `12px` → `var(--radius-xl)`, etc.

### Error401Component
- **File**: `error-401.component.scss`
- **Changes**: Similar updates as Error404Component, with error-themed colors
- **Key Updates**:
  - Error colors: `#f5576c` → `var(--color-error-500, #f5576c)`
  - All spacing, typography, and border-radius values updated

### Error500Component
- **File**: `error-500.component.scss`
- **Changes**: Similar updates with error-themed colors and additional status indicators
- **Key Updates**:
  - Error colors: `#ff6b6b` → `var(--color-error-500, #ff6b6b)`
  - Warning colors: `#f6ad55` → `var(--color-warning-400, #f6ad55)`

### MaintenanceComponent
- **File**: `maintenance.component.scss`
- **Changes**: Updated with design tokens for progress indicators, timeline, and feature sections
- **Key Updates**:
  - Primary colors: `#667eea` → `var(--color-primary-500, #667eea)`
  - Success colors: `#48bb78` → `var(--color-success-500, #48bb78)`
  - Progress bar and timeline styling updated

### ComingSoonComponent
- **File**: `coming-soon.component.scss`
- **Changes**: Updated countdown, features, and notification sections
- **Key Updates**:
  - Primary colors throughout
  - Countdown styling with design tokens
  - Email form styling updated

### LockScreenComponent
- **File**: `lock-screen.component.scss`
- **Changes**: Updated lock screen UI with design tokens
- **Key Updates**:
  - Primary colors: `#667eea` → `var(--color-primary-500, #667eea)`
  - Error colors for lockout messages: `#e53e3e` → `var(--color-error-600, #e53e3e)`
  - Success colors for security tips: `#48bb78` → `var(--color-success-500, #48bb78)`
  - Form inputs and buttons updated

### ResetPasswordComponent
- **File**: `reset-password.component.scss`
- **Changes**: Updated multi-step password reset flow
- **Key Updates**:
  - Step indicators with design tokens
  - Error/success message styling: `#e53e3e` → `var(--color-error-600, #e53e3e)`, `#38a169` → `var(--color-success-600, #38a169)`
  - Password strength indicators: `#e53e3e` → `var(--color-error-600, #e53e3e)`, `#f6ad55` → `var(--color-warning-400, #f6ad55)`, `#48bb78` → `var(--color-success-500, #48bb78)`
  - Form inputs and validation styling updated

## ✅ All Shared Components Updated

All major shared components have been updated to use design tokens. The design system is now fully integrated across:
- ✅ High-usage components (GlassButton, GlassCard, GlassInput, DataTable)
- ✅ Medium-usage components (Badge, Alert, ProgressBar, Modal, etc.)
- ✅ Specialized components (Charts, Face Recognition, Timestamp, etc.)
- ✅ Error pages and auth components (Error404, Error401, Error500, Maintenance, ComingSoon, LockScreen, ResetPassword)

---

## 📚 Related Documentation

- **design-tokens.ts** - TypeScript design tokens
- **design-system.config.ts** - Design system configuration
- **tailwind.config.js** - Tailwind config using design tokens
- **styles.scss** - Global styles with CSS variables

---

**สร้างเมื่อ**: 2025-12-20  
**อัปเดตล่าสุด**: 2025-12-20  
**ผู้สร้าง**: AI Assistant


