import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @deprecated Use DataTableComponent instead. This component will be removed in future versions.
 * See DEPRECATION_NOTICE.md for migration details.
 */
@Component({
  selector: 'app-advanced-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border border-warning-500 bg-warning-50 rounded text-warning-700">
      <strong>⚠️ Deprecated:</strong> This component is deprecated. Please migrate to DataTableComponent.
    </div>
  `
})
export class AdvancedDataTableComponent {}
