# ⚠️ Deprecation Notice: AdvancedDataTableComponent

**Status**: Deprecated  
**Deprecated Date**: 2025-12-20  
**Removal Date**: TBD (Future version)

## 📋 Overview

`AdvancedDataTableComponent` has been deprecated in favor of the enhanced `DataTableComponent`. The new component provides all the same features with improved performance, better maintainability, and a cleaner API.

## 🔄 Migration Guide

### Quick Migration Steps

1. **Update Imports**
   ```typescript
   // ❌ Before
   import { AdvancedDataTableComponent } from '@shared/components/advanced-data-table/advanced-data-table.component';
   
   // ✅ After
   import { DataTableComponent } from '@shared/components/data-table/data-table.component';
   ```

2. **Update Component Usage**
   ```typescript
   // ❌ Before
   imports: [AdvancedDataTableComponent]
   
   // ✅ After
   imports: [DataTableComponent]
   ```

3. **Update Template**
   ```html
   <!-- ❌ Before -->
   <app-advanced-data-table
     [data]="data"
     [columns]="columns"
     [config]="config"
     [actions]="actions">
   </app-advanced-data-table>
   
   <!-- ✅ After -->
   <app-data-table
     [data]="data"
     [columns]="columns"
     [actions]="actions"
     [pageSize]="pageSize"
     [enableColumnFilters]="true"
     [selectable]="true"
     [showExport]="true">
   </app-data-table>
   ```

### API Changes

#### TableColumn Interface

| Old Property | New Property | Notes |
|------------|-------------|-------|
| `title` | `label` | Renamed for consistency |
| `formatter` | `render` | Same functionality, renamed |
| `searchable` | - | Removed (use global search instead) |

#### Configuration

| Old (TableConfig) | New (@Input) | Notes |
|-----------------|-------------|-------|
| `config.pageSize` | `pageSize` | Direct input |
| `config.columnFilters` | `enableColumnFilters` | Boolean input |
| `config.multiSort` | `enableMultiSort` | Boolean input |
| `config.selectable` | `selectable` | Boolean input |
| `config.exportable` | `showExport` | Boolean input |
| `config.exportFormats` | `exportFormats` | Array input |
| `config.virtualScrolling` | `enableVirtualScrolling` | Boolean input |

#### Actions

| Old Property | New Property | Notes |
|------------|-------------|-------|
| `id` | - | Removed (not needed) |
| `icon: 'fas fa-*'` | `icon: 'emoji'` | Use emoji instead of FontAwesome |
| `variant: 'info'` | `variant: 'primary'` | Only 'primary', 'secondary', 'danger' supported |

#### Events

| Old Event | New Event | Notes |
|---------|----------|-------|
| `(sortChange)` | `(sorted)` | Renamed |
| `(pageChange)` | `(pageChange)` | Same (but signature changed) |
| `(actionClick)` | - | Removed (use action.onClick directly) |

## ✨ New Features in DataTableComponent

- ✅ **Export Functionality**: CSV, Excel, JSON export
- ✅ **Virtual Scrolling**: Better performance for large datasets
- ✅ **Template Support**: Custom cell templates
- ✅ **Improved Performance**: Better change detection
- ✅ **Cleaner API**: Simpler configuration

## 📚 Resources

- [DataTableComponent Documentation](../data-table/README.md)
- [Migration Guide](../../../../MIGRATION_GUIDE.md)
- [Component Comparison](../data-table/COMPONENT_COMPARISON.md)

## ❓ Questions?

If you need help migrating, please refer to:
1. The migration guide in `MIGRATION_GUIDE.md`
2. Example migration in `advanced-data-table-demo.component.ts`
3. Component comparison in `COMPONENT_COMPARISON.md`

---

**Last Updated**: 2025-12-20


