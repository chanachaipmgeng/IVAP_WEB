# 🖼️ Image Optimization Guide

**Last Updated**: 2025-12-20

## 📋 สารบัญ
1. [Image Audit](#image-audit)
2. [WebP Conversion](#webp-conversion)
3. [Apply Optimization Directive](#apply-optimization-directive)
4. [Manual Optimization](#manual-optimization)
5. [Best Practices](#best-practices)

---

## 🔍 Image Audit

### Run Image Audit
```bash
npm run audit-images
```

### What It Does
- Finds all image files (jpg, jpeg, png, gif, webp, svg)
- Finds all `<img>` tags in HTML templates
- Identifies large images (>500KB)
- Identifies unoptimized image tags
- Generates detailed report

### Report Location
- Console output: Summary report
- `image-audit-report.json`: Detailed JSON report

### Current Status (2025-12-20)
- **Total images**: 1 (SVG)
- **Total <img> tags**: 25
- **Unoptimized tags**: 25
- **WebP images**: 0
- **Large images**: 0

---

## 🎨 WebP Conversion

### Prerequisites
Install sharp-cli:
```bash
npm install -g sharp-cli
```

Or install sharp package:
```bash
npm install --save-dev sharp
```

### Convert Images to WebP

#### Basic Usage
```bash
npm run convert-webp <input-dir> [output-dir]
```

#### Examples
```bash
# Convert images in src/assets/images to WebP
npm run convert-webp src/assets/images

# Convert to specific output directory
npm run convert-webp src/assets/images src/assets/images/webp
```

### Manual Conversion
If you prefer manual conversion:

```bash
# Single image
sharp -i input.jpg -o output.webp

# Directory
sharp -i "src/assets/images/*.jpg" -o "src/assets/images/webp/" -f webp
```

### Using sharp Package (Node.js)
```javascript
const sharp = require('sharp');

sharp('input.jpg')
  .webp({ quality: 80 })
  .toFile('output.webp');
```

### Quality Settings
- **High quality**: `quality: 90` (larger file, better quality)
- **Balanced**: `quality: 80` (recommended)
- **Small file**: `quality: 60` (smaller file, lower quality)

---

## 🚀 Apply Optimization Directive

### Dry Run (Preview Changes)
```bash
npm run apply-image-opt:dry
```

### Apply Changes
```bash
npm run apply-image-opt
```

### What It Does
1. Finds all `<img>` tags in HTML templates
2. Replaces `src` with `ngSrc`
3. Adds `appImageOptimization` directive
4. Adds `loading="lazy"` for below-the-fold images
5. Adds `priority` for above-the-fold images
6. Adds `alt` attribute if missing
7. Imports `ImageOptimizationDirective` in component TypeScript files

### Manual Application

#### Before
```html
<img src="/assets/image.jpg" alt="Description">
```

#### After
```html
<img 
  appImageOptimization
  ngSrc="/assets/image.jpg"
  width="800"
  height="600"
  loading="lazy"
  alt="Description">
```

### For Above-the-Fold Images
```html
<img 
  appImageOptimization
  ngSrc="/assets/hero.jpg"
  width="1920"
  height="1080"
  priority
  alt="Hero Image">
```

---

## ✋ Manual Optimization

### When to Optimize Manually

1. **Complex Image Requirements**
   - Responsive images with multiple sizes
   - Art direction (different images for different screens)
   - Custom loading strategies

2. **Dynamic Images**
   - Images loaded from API
   - User-uploaded images
   - Conditional image loading

3. **Special Cases**
   - Background images
   - CSS images
   - Icon fonts vs SVG

### Example: Responsive Images

```html
<picture>
  <source 
    media="(max-width: 768px)"
    srcset="/assets/image-mobile.webp"
    type="image/webp">
  <source 
    media="(max-width: 768px)"
    srcset="/assets/image-mobile.jpg">
  <source 
    srcset="/assets/image.webp"
    type="image/webp">
  <img 
    appImageOptimization
    ngSrc="/assets/image.jpg"
    width="1200"
    height="800"
    alt="Description">
</picture>
```

### Example: Dynamic Images

```typescript
// Component
export class MyComponent {
  imageUrl = signal<string>('');
  
  loadImage() {
    this.imageUrl.set('/api/images/user-123');
  }
}
```

```html
<!-- Template -->
<img 
  *ngIf="imageUrl()"
  appImageOptimization
  [ngSrc]="imageUrl()"
  width="400"
  height="400"
  loading="lazy"
  alt="User Image">
```

---

## ✅ Best Practices

### 1. Always Specify Dimensions
```html
<!-- ✅ Good -->
<img ngSrc="/assets/image.jpg" width="800" height="600" alt="Description">

<!-- ❌ Bad -->
<img ngSrc="/assets/image.jpg" alt="Description">
```

### 2. Use Lazy Loading for Below-the-Fold
```html
<!-- ✅ Good: Below-the-fold -->
<img ngSrc="/assets/image.jpg" loading="lazy" alt="Description">

<!-- ✅ Good: Above-the-fold -->
<img ngSrc="/assets/hero.jpg" priority alt="Hero">
```

### 3. Provide Alt Text
```html
<!-- ✅ Good -->
<img ngSrc="/assets/image.jpg" alt="Descriptive alt text">

<!-- ❌ Bad -->
<img ngSrc="/assets/image.jpg" alt="">
```

### 4. Use WebP with Fallback
```html
<picture>
  <source srcset="/assets/image.webp" type="image/webp">
  <img ngSrc="/assets/image.jpg" alt="Description">
</picture>
```

### 5. Optimize Image Sizes
- **Hero images**: 1920x1080 (max)
- **Feature images**: 800x600
- **Thumbnails**: 300x200
- **Avatars**: 200x200

### 6. Use Appropriate Formats
- **Photos**: WebP or JPEG
- **Icons/Logos**: SVG
- **Simple graphics**: SVG
- **Complex graphics**: PNG or WebP

---

## 📊 Optimization Checklist

### Image Files
- [ ] Run `npm run audit-images`
- [ ] Identify large images (>500KB)
- [ ] Convert images to WebP
- [ ] Optimize image dimensions
- [ ] Remove unused images

### Image Tags
- [ ] Run `npm run apply-image-opt:dry` (preview)
- [ ] Run `npm run apply-image-opt` (apply)
- [ ] Verify all images use `ngSrc`
- [ ] Verify all images use `appImageOptimization`
- [ ] Add `loading="lazy"` for below-the-fold
- [ ] Add `priority` for above-the-fold
- [ ] Add `alt` attributes
- [ ] Specify `width` and `height`

### Testing
- [ ] Test image loading
- [ ] Test lazy loading
- [ ] Test WebP fallback
- [ ] Test responsive images
- [ ] Verify no broken images
- [ ] Check performance metrics

---

## 🛠️ Tools & Scripts

| Script | Purpose | Output |
|--------|---------|--------|
| `npm run audit-images` | Audit all images | `image-audit-report.json` |
| `npm run convert-webp` | Convert to WebP | WebP files in output directory |
| `npm run apply-image-opt:dry` | Preview changes | Console + report |
| `npm run apply-image-opt` | Apply optimization | Modified files + report |

---

## 📚 Related Documentation

- **ImageOptimizationDirective**: `src/app/shared/directives/image-optimization.directive.ts`
- **Image Utilities**: `src/app/shared/utils/image-utils.ts`
- **OPTIMIZATION_GUIDE.md**: Complete optimization guide
- **PHASE3_OPTIMIZATION_SUMMARY.md**: Phase 3 summary

---

## 🎯 Expected Results

### File Size Reduction
- **WebP conversion**: 30-50% smaller than JPEG/PNG
- **Optimized dimensions**: 50-70% smaller

### Performance Improvements
- **Lazy loading**: Faster initial page load
- **Priority loading**: Better LCP (Largest Contentful Paint)
- **WebP support**: Faster image loading

### Metrics
- **LCP improvement**: 20-30% faster
- **Total page size**: 20-40% reduction
- **Image load time**: 50% faster

---

**สร้างเมื่อ**: 2025-12-20  
**อัปเดตล่าสุด**: 2025-12-20  
**ผู้สร้าง**: AI Assistant


