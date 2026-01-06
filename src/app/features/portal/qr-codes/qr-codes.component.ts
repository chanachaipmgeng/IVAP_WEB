/**
 * QR Codes Component
 *
 * Component for managing QR codes with full CRUD operations.
 * Supports QR code generation, scanning, filtering, statistics, and status management.
 *
 * @example
 * ```html
 * <app-qr-codes></app-qr-codes>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QRCodeService } from '../../../core/services/qr-code.service';
import {
  QRCode,
  QRCodeType,
  QRCodeStatus,
  CreateQRCodeDto,
  QR_CODE_TYPE_LABELS,
  QR_CODE_STATUS_LABELS
} from '../../../core/models/qr-code.model';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { I18nService } from '../../../core/services/i18n.service';
import { BaseComponent } from '../../../core/base/base.component';

@Component({
  selector: 'app-qr-codes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './qr-codes.component.html',
  styleUrls: ['./qr-codes.component.scss']
})
export class QRCodesComponent extends BaseComponent implements OnInit {
  private qrCodeService = inject(QRCodeService);

  // Signals
  qrCodes = signal<QRCode[]>([]);
  filteredQRCodes = signal<QRCode[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  showScanModal = signal(false);
  selectedQRCode = signal<QRCode | null>(null);
  scanResult = signal<any>(null);

  // Form
  qrCodeForm = signal<CreateQRCodeDto>({
    type: QRCodeType.ACCESS,
    ownerId: '',
    ownerType: 'employee'
  });

  // Scanner
  scannedCode = signal('');
  isScannerActive = signal(false);

  // Filters
  filterStatus = signal<QRCodeStatus | ''>('');
  filterType = signal<QRCodeType | ''>('');
  searchTerm = signal('');

  // Enums for template
  QRCodeType = QRCodeType;
  QRCodeStatus = QRCodeStatus;
  QR_CODE_TYPE_LABELS = QR_CODE_TYPE_LABELS;
  QR_CODE_STATUS_LABELS = QR_CODE_STATUS_LABELS;

  // Computed
  qrCodeTypes = computed(() => Object.values(QRCodeType));
  qrCodeStatuses = computed(() => Object.values(QRCodeStatus));

  statistics = computed(() => {
    const codes = this.qrCodes();
    return {
      total: codes.length,
      active: codes.filter(q => q.status === QRCodeStatus.ACTIVE).length,
      inactive: codes.filter(q => q.status === QRCodeStatus.INACTIVE).length,
      expired: codes.filter(q => q.status === QRCodeStatus.EXPIRED).length
    };
  });

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.statistics();
    return [
      {
        icon: '🔲',
        label: 'Total',
        value: stats.total,
        iconBgClass: 'bg-blue-100 dark:bg-blue-900'
      },
      {
        icon: '✅',
        label: 'Active',
        value: stats.active,
        iconBgClass: 'bg-green-100 dark:bg-green-900'
      },
      {
        icon: '⏸️',
        label: 'Inactive',
        value: stats.inactive,
        iconBgClass: 'bg-gray-100 dark:bg-gray-900'
      },
      {
        icon: '⛔',
        label: 'Expired',
        value: stats.expired,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '📱 Scan QR',
      variant: 'secondary',
      onClick: () => this.openScanModal()
    },
    {
      label: '➕ Create QR Code',
      variant: 'primary',
      onClick: () => this.openCreateModal()
    }
  ]);

  // Filter fields
  filterFields = computed<FilterField[]>(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search...',
      value: this.searchTerm()
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All Status' },
        { value: QRCodeStatus.ACTIVE, label: 'Active' },
        { value: QRCodeStatus.INACTIVE, label: 'Inactive' },
        { value: QRCodeStatus.EXPIRED, label: 'Expired' }
      ],
      value: this.filterStatus()
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...this.qrCodeTypes().map(type => ({
          value: type,
          label: QR_CODE_TYPE_LABELS[type]
        }))
      ],
      value: this.filterType()
    }
  ]);

  ngOnInit() {
    this.loadQRCodes();
  }

  loadQRCodes() {
    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.qrCodeService.getQRCodes(),
      (codes) => {
        this.qrCodes.set(codes);
        this.applyFilters();
        this.isLoading.set(false);
      },
      (error) => {
        console.error('Error loading QR codes:', error);
        // Mock data for demo
        this.loadMockData();
        this.isLoading.set(false);
      }
    );
  }

  loadMockData() {
    const mockData: QRCode[] = [
      {
        id: '1',
        code: 'QR001',
        type: QRCodeType.ACCESS,
        ownerId: 'emp1',
        ownerName: 'สมชาย ใจดี',
        ownerType: 'employee',
        data: {},
        status: QRCodeStatus.ACTIVE,
        scanCount: 45,
        lastScannedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        code: 'QR002',
        type: QRCodeType.VISITOR,
        ownerId: 'vis1',
        ownerName: 'ประเสริฐ มาเยือน',
        ownerType: 'visitor',
        data: {},
        status: QRCodeStatus.ACTIVE,
        scanCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        code: 'QR003',
        type: QRCodeType.EVENT,
        ownerId: 'evt1',
        ownerName: 'งานสัมมนาประจำปี',
        ownerType: 'event',
        data: {},
        status: QRCodeStatus.EXPIRED,
        scanCount: 120,
        validFrom: '2025-10-01',
        validUntil: '2025-10-15',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.qrCodes.set(mockData);
    this.applyFilters();
  }

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchTerm.set(event.value);
    } else if (event.key === 'status') {
      this.filterStatus.set(event.value);
    } else if (event.key === 'type') {
      this.filterType.set(event.value);
    }
    this.applyFilters();
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.applyFilters();
  }

  updateFilterStatus(value: QRCodeStatus | ''): void {
    this.filterStatus.set(value);
    this.applyFilters();
  }

  updateFilterType(value: QRCodeType | ''): void {
    this.filterType.set(value);
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.qrCodes()];

    const status = this.filterStatus();
    const type = this.filterType();
    const search = this.searchTerm();

    if (status) {
      filtered = filtered.filter(q => q.status === status);
    }

    if (type) {
      filtered = filtered.filter(q => q.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(q =>
        q.code.toLowerCase().includes(searchLower) ||
        q.ownerName.toLowerCase().includes(searchLower)
      );
    }

    this.filteredQRCodes.set(filtered);
  }

  columns: TableColumn[] = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'ownerName', label: 'Owner', sortable: true },
    { key: 'ownerType', label: 'Owner Type' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => QR_CODE_STATUS_LABELS[value as QRCodeStatus] || value
    },
    {
      key: 'scanCount',
      label: 'Scan Count',
      render: (value) => value || 0
    }
  ];

  actions: TableAction[] = [
    {
      icon: '👁️',
      label: 'View',
      onClick: (row) => this.viewQRCode(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteQRCode(row)
    }
  ];

  viewQRCode(qrCode: QRCode): void {
    this.selectedQRCode.set(qrCode);
    // Show details modal or navigate
  }

  deleteQRCode(qrCode: QRCode): void {
    if (!confirm(`ต้องการลบ QR Code ${qrCode.code} หรือไม่?`)) {
      return;
    }
    this.qrCodeService.deleteQRCode(qrCode.id).subscribe({
      next: () => {
        this.loadQRCodes();
      },
      error: (error) => {
        console.error('Error deleting QR code:', error);
      }
    });
  }

  openCreateModal() {
    this.resetForm();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.qrCodeForm.set({
      type: QRCodeType.ACCESS,
      ownerId: '',
      ownerType: 'employee'
    });
  }

  updateFormType(type: QRCodeType): void {
    const current = this.qrCodeForm();
    this.qrCodeForm.set({
      ...current,
      type: type
    });
  }

  updateFormOwnerType(ownerType: string): void {
    const current = this.qrCodeForm();
    this.qrCodeForm.set({
      ...current,
      ownerType: ownerType
    });
  }

  updateFormOwnerId(ownerId: string): void {
    const current = this.qrCodeForm();
    this.qrCodeForm.set({
      ...current,
      ownerId: ownerId
    });
  }

  submitQRCode() {
    const form = this.qrCodeForm();

    if (!form.ownerId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.qrCodeService.createQRCode(form),
      (qrCode) => {
        this.loadQRCodes();
        this.closeModal();
        alert('สร้าง QR Code สำเร็จ');
      },
      (error) => {
        console.error('Error creating QR code:', error);
        alert('เกิดข้อผิดพลาดในการสร้าง QR Code');
        this.isLoading.set(false);
      }
    );
  }

  closeViewModal() {
    this.selectedQRCode.set(null);
  }

  downloadQRCode(qrCode: QRCode, format: 'png' | 'svg' = 'png') {
    this.qrCodeService.downloadQRCode(qrCode.id, format);
  }

  printQRCode(qrCode: QRCode) {
    this.selectedQRCode.set(qrCode);
    setTimeout(() => window.print(), 100);
  }

  regenerateQRCode(qrCode: QRCode) {
    if (!confirm(`ต้องการสร้าง QR Code ใหม่สำหรับ ${qrCode.ownerName} หรือไม่?`)) {
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.qrCodeService.regenerateQRCode(qrCode.id),
      (updatedCode) => {
        this.loadQRCodes();
        alert('สร้าง QR Code ใหม่สำเร็จ');
      },
      (error) => {
        console.error('Error regenerating QR code:', error);
        alert('เกิดข้อผิดพลาดในการสร้าง QR Code ใหม่');
        this.isLoading.set(false);
      }
    );
  }

  activateQRCode(qrCode: QRCode) {
    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.qrCodeService.activateQRCode(qrCode.id),
      () => {
        this.loadQRCodes();
        alert('เปิดใช้งาน QR Code สำเร็จ');
      },
      (error) => {
        console.error('Error activating QR code:', error);
        alert('เกิดข้อผิดพลาด');
        this.isLoading.set(false);
      }
    );
  }

  deactivateQRCode(qrCode: QRCode) {
    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.qrCodeService.deactivateQRCode(qrCode.id),
      () => {
        this.loadQRCodes();
        alert('ปิดใช้งาน QR Code สำเร็จ');
      },
      (error) => {
        console.error('Error deactivating QR code:', error);
        alert('เกิดข้อผิดพลาด');
        this.isLoading.set(false);
      }
    );
  }


  openScanModal() {
    this.showScanModal.set(true);
    this.scanResult.set(null);
    this.scannedCode.set('');
  }

  closeScanModal() {
    this.showScanModal.set(false);
    this.isScannerActive.set(false);
  }

  startScanner() {
    this.isScannerActive.set(true);
    // In real implementation, this would activate camera
    alert('กล้องสแกน QR Code (ฟีเจอร์นี้ต้องใช้ library เช่น ngx-scanner)');
  }

  scanQRCode() {
    const code = this.scannedCode();
    if (!code) {
      alert('กรุณาใส่รหัส QR Code');
      return;
    }

    this.isLoading.set(true);
    // ✅ Auto-unsubscribe on component destroy
    this.subscribe(
      this.qrCodeService.scanQRCode(code),
      (result) => {
        this.scanResult.set(result);
        this.isLoading.set(false);
      },
      (error) => {
        console.error('Error scanning QR code:', error);
        alert('ไม่พบ QR Code นี้ในระบบ');
        this.isLoading.set(false);
      }
    );
  }

  getStatusClass(status: QRCodeStatus): string {
    switch (status) {
      case QRCodeStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case QRCodeStatus.INACTIVE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
      case QRCodeStatus.EXPIRED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case QRCodeStatus.REVOKED:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH');
  }

  getQRCodeDataUrl(code: string): string {
    return this.qrCodeService.getQRCodeDataUrl(code);
  }
}

