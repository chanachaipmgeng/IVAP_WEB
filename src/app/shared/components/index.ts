// Glass Components
export * from './glass-card/glass-card.component';
export * from './glass-button/glass-button.component';
export * from './glass-input/glass-input.component';

// Material Components
export * from './material-button/material-button.component';
export * from './material-input/material-input.component';
export * from './material-card/material-card.component';
export { MaterialTableComponent } from './material-table/material-table.component';
export type { TableColumn as MaterialTableColumn, TableAction as MaterialTableAction } from './material-table/material-table.component';
export * from './material-dialog/material-dialog.component';

// Other Components
export * from './header/header.component';
export * from './sidebar/sidebar.component';
export * from './loading/loading.component';
export { DataTableComponent } from './data-table/data-table.component';
export type { TableColumn, TableAction } from './data-table/data-table.component';
// Chart components - deprecated, use EChartsChartComponent instead
// export * from './chart/chart.component'; // @deprecated
// export * from './apex-chart/apex-chart.component'; // @deprecated
export * from './echarts-chart/echarts-chart.component';
export * from './skeleton/skeleton.component';
export * from './map/map.component';
export * from './rich-text/rich-text.component';

// Reusable UI Components
export * from './page-layout/page-layout.component';
export * from './statistics-card/statistics-card.component';
export * from './statistics-grid/statistics-grid.component';
export type { StatCard } from './statistics-grid/statistics-grid.component';
export * from './filter-section/filter-section.component';
export type { FilterField, FilterActionButton } from './filter-section/filter-section.component';
export * from './tabs/tabs.component';
export type { Tab } from './tabs/tabs.component';
export * from './form-field/form-field.component';
export type { FormFieldConfig } from './form-field/form-field.component';
export * from './modal-form/modal-form.component';
export * from './empty-state/empty-state.component';
export type { EmptyStateAction } from './empty-state/empty-state.component';

// UI Kit Components
export * from './badge/badge.component';
export type { BadgeVariant, BadgeSize, BadgeShape } from './badge/badge.component';

export * from './avatar/avatar.component';
export type { AvatarSize, AvatarShape, AvatarStatus } from './avatar/avatar.component';

export * from './alert/alert.component';
export type { AlertVariant, AlertSize } from './alert/alert.component';

export * from './breadcrumb/breadcrumb.component';
export type { BreadcrumbItem } from './breadcrumb/breadcrumb.component';

export * from './checkbox/checkbox.component';
export * from './radio/radio.component';
export * from './switch/switch.component';

export * from './stepper/stepper.component';
export type { StepperStep } from './stepper/stepper.component';

export * from './pagination/pagination.component';

export * from './search-input/search-input.component';

export * from './divider/divider.component';

export * from './popover/popover.component';
export type { PopoverPosition, PopoverTrigger } from './popover/popover.component';

// Services
export * from '../services/material.service';

