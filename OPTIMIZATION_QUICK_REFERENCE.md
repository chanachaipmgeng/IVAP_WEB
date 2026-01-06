# ⚡ Optimization Quick Reference

**Last Updated**: 2025-12-20

## 🚀 Quick Commands

### Bundle Analysis
```bash
npm run analyze
# Opens webpack-bundle-analyzer at http://127.0.0.1:8888
```

### Dependency Analysis
```bash
npm run check-deps          # Find unused dependencies
npm run analyze-deps-safe   # Safe analysis (filters critical deps)
npm run verify-deps         # Verify actual usage
```

### SCSS Analysis
```bash
npm run analyze-scss
# Generates scss-analysis-report.json
```

### Production Build
```bash
npm run build:prod
# Build with all optimizations enabled
```

---

## 📊 Current Metrics

### Bundle Size
- **Initial Bundle**: 591.98 kB raw, 150.65 kB gzipped ✅
- **Budget**: 1MB initial, 2MB error
- **Status**: Within budget ✅

### SCSS Files
- **Total**: 116 files
- **Largest**: 38.81 KB (`styles.scss`)
- **Budget**: 100 KB per file
- **Status**: All within budget ✅

### Lazy Chunks
- **Largest**: 2.02 MB raw, 34.10 kB gzipped
- **Status**: Acceptable for lazy-loaded ✅

### Image Tags
- **Total**: 25 tags
- **Optimized**: 25 tags (100%) ✅
- **Using ngSrc**: 25 tags (100%) ✅
- **Using directive**: 25 tags (100%) ✅
- **Using lazy loading**: 24 tags (96%) ✅

---

## 🛠️ Tools & Scripts

### Bundle Analysis
| Script | Purpose | Output |
|--------|---------|--------|
| `npm run analyze` | Analyze bundle size | Opens webpack-bundle-analyzer |

### Dependency Analysis
| Script | Purpose | Output |
|--------|---------|--------|
| `npm run check-deps` | Find unused deps | `depcheck-report.json` |
| `npm run analyze-deps-safe` | Safe analysis | `safe-deps-analysis.json` |
| `npm run verify-deps` | Verify usage | `deps-verification-report.json` |

### SCSS Analysis
| Script | Purpose | Output |
|--------|---------|--------|
| `npm run analyze-scss` | Analyze SCSS files | `scss-analysis-report.json` |

### Image Optimization
| Script | Purpose | Output |
|--------|---------|--------|
| `npm run audit-images` | Audit all images | `image-audit-report.json` |
| `npm run convert-webp` | Convert to WebP | WebP files |
| `npm run apply-image-opt` | Apply optimization | Modified files + report |
| `npm run apply-image-opt:dry` | Preview changes | Report only |
| `npm run fix-image-spacing` | Fix spacing issues | Modified files |
| `npm run fix-image-spacing` | Fix spacing issues | Modified files |

---

## 📚 Documentation

### Main Guides
- **OPTIMIZATION_GUIDE.md** - Complete optimization guide
- **OPTIMIZATION_ISSUES.md** - Issues and solutions
- **PHASE3_OPTIMIZATION_SUMMARY.md** - Phase 3 summary
- **PHASE3_COMPLETE_SUMMARY.md** - Phase 3 complete summary
- **IMAGE_OPTIMIZATION_GUIDE.md** - Image optimization guide
- **IMAGE_OPTIMIZATION_COMPLETE.md** - Image optimization completion

### Analysis Reports
- **SCSS_ANALYSIS_SUMMARY.md** - SCSS analysis results
- `scss-analysis-report.json` - Detailed SCSS report
- `safe-deps-analysis.json` - Safe dependency analysis
- `deps-verification-report.json` - Dependency verification

---

## 🎯 Optimization Checklist

### Bundle Size
- [x] Setup webpack-bundle-analyzer ✅
- [x] Configure production build ✅
- [x] Setup code splitting ✅
- [ ] Analyze bundle (Run `npm run analyze`)
- [ ] Remove unused dependencies
- [ ] Verify bundle size reduction

### SCSS
- [x] Setup SCSS analysis ✅
- [x] Analyze all SCSS files ✅
- [x] All files within budget ✅
- [ ] Optimize compiled CSS (if needed)

### Images
- [x] Create ImageOptimizationDirective ✅
- [x] Create image utilities ✅
- [x] Create audit script ✅ (Found 25 tags)
- [x] Create WebP conversion script ✅
- [x] Create apply optimization script ✅
- [ ] Run `npm run apply-image-opt` to optimize 25 tags
- [ ] Convert to WebP when images are added
- [ ] Test image loading

### Dependencies
- [x] Setup dependency analysis ✅
- [x] Configure CommonJS deps ✅
- [ ] Run analysis scripts
- [ ] Remove unused dependencies
- [ ] Verify no breaking changes

---

## ⚠️ Common Issues

### Issue: Bundle Analyzer Shows "No bundles were parsed"
**Solution**: Make sure to run `npm run build:prod` first, then `npm run analyze`

### Issue: SCSS File Exceeds Budget
**Solution**: 
- Check if it's compiled CSS (includes child components)
- If source file is large, split into multiple files
- Use Tailwind CSS for utilities

### Issue: CommonJS Warnings
**Solution**: Already configured in `angular.json` under `allowedCommonJsDependencies`

---

## 📞 Need Help?

1. Check **OPTIMIZATION_GUIDE.md** for detailed instructions
2. Check **OPTIMIZATION_ISSUES.md** for common issues
3. Review analysis reports in JSON files
4. Check **PHASE3_OPTIMIZATION_SUMMARY.md** for Phase 3 status

---

**สร้างเมื่อ**: 2025-12-20  
**อัปเดตล่าสุด**: 2025-12-20  
**ผู้สร้าง**: AI Assistant


