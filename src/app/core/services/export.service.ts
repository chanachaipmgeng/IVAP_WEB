import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor() {}

  /**
   * Export data to Excel/CSV format
   */
  exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Convert data to CSV format
      const csv = this.convertToCSV(data);

      // Create blob and download
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${this.getTimestamp()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Export completed successfully
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${this.getTimestamp()}.json`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Export completed successfully
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  }

  /**
   * Convert data array to CSV format
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV header row
    const headerRow = headers.map(h => this.escapeCSV(h)).join(',');

    // Create CSV data rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        return this.escapeCSV(this.formatValue(value));
      }).join(',');
    });

    // Combine header and data rows
    return [headerRow, ...dataRows].join('\r\n');
  }

  /**
   * Escape special characters in CSV
   */
  private escapeCSV(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  /**
   * Format value for CSV export
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Format dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Format objects/arrays
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Get timestamp for filename
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  /**
   * Export table data directly from HTML table element
   */
  exportTableToExcel(tableId: string, filename: string): void {
    const table = document.getElementById(tableId);
    if (!table) {
      alert('Table not found');
      return;
    }

    try {
      const data = this.extractTableData(table as HTMLTableElement);
      this.exportToExcel(data, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting table. Please try again.');
    }
  }

  /**
   * Extract data from HTML table
   */
  private extractTableData(table: HTMLTableElement): any[] {
    const data: any[] = [];
    const rows = table.querySelectorAll('tr');

    if (rows.length === 0) return data;

    // Get headers from first row
    const headerCells = rows[0].querySelectorAll('th, td');
    const headers = Array.from(headerCells).map(cell => cell.textContent?.trim() || '');

    // Extract data from remaining rows
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td');
      const row: any = {};

      cells.forEach((cell, index) => {
        if (index < headers.length) {
          row[headers[index]] = cell.textContent?.trim() || '';
        }
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Print current page/report
   */
  printReport(): void {
    window.print();
  }

  /**
   * Export to PDF (requires backend support or jsPDF library)
   */
  exportToPDF(data: any[], filename: string): void {
    alert('PDF export requires jsPDF library. Exporting as CSV instead.');
    this.exportToExcel(data, filename);
  }
}

