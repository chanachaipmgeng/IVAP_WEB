/**
 * RFID Cards Component
 *
 * Component for managing RFID cards with full CRUD operations.
 * Supports card creation, activation, deactivation, filtering, and statistics tracking.
 *
 * @example
 * ```html
 * <app-rfid-cards></app-rfid-cards>
 * ```
 */

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RFIDCardService } from '../../../core/services/rfid-card.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ValidationService } from '../../../core/services/validation.service';
import {
  RFIDCard,
  RFIDCardType,
  RFIDCardStatus,
  CreateRFIDCardDto,
  RFID_CARD_TYPE_LABELS,
  RFID_CARD_STATUS_LABELS
} from '../../../core/models/rfid-card.model';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PageLayoutComponent, PageAction } from '../../../shared/components/page-layout/page-layout.component';
import { StatisticsGridComponent, StatCard } from '../../../shared/components/statistics-grid/statistics-grid.component';
import { FilterSectionComponent, FilterField } from '../../../shared/components/filter-section/filter-section.component';
import { DataTableComponent, TableColumn, TableAction } from '../../../shared/components/data-table/data-table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-rfid-cards',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GlassButtonComponent,
    PageLayoutComponent,
    StatisticsGridComponent,
    FilterSectionComponent,
    DataTableComponent,
    ModalComponent
  ],
  templateUrl: './rfid-cards.component.html',
  styleUrls: ['./rfid-cards.component.scss']
})
export class RFIDCardsComponent implements OnInit {
  private rfidService = inject(RFIDCardService);
  private errorHandler = inject(ErrorHandlerService);
  private validationService = inject(ValidationService);
  private fb = inject(FormBuilder);

  // Signals
  rfidCards = signal<RFIDCard[]>([]);
  filteredCards = signal<RFIDCard[]>([]);
  isLoading = signal(false);
  showModal = signal(false);
  selectedCard = signal<RFIDCard | null>(null);
  currentPage = signal(1);
  pageSize = signal(10);
  total = signal(0);
  errorMessage = signal<string>('');

  // Form
  cardForm: FormGroup;

  // Filters
  filterStatus = signal<RFIDCardStatus | ''>('');
  filterType = signal<RFIDCardType | ''>('');
  searchTerm = signal('');

  // Enums
  RFIDCardType = RFIDCardType;
  RFIDCardStatus = RFIDCardStatus;
  RFID_CARD_TYPE_LABELS = RFID_CARD_TYPE_LABELS;
  RFID_CARD_STATUS_LABELS = RFID_CARD_STATUS_LABELS;
  cardTypes = computed(() => Object.values(RFIDCardType));
  cardStatuses = computed(() => Object.values(RFIDCardStatus));

  // Statistics
  statistics = computed(() => {
    const cards = this.rfidCards();
    return {
      total: cards.length,
      active: cards.filter(c => c.status === RFIDCardStatus.ACTIVE).length,
      expired: cards.filter(c => c.status === RFIDCardStatus.EXPIRED).length,
      blocked: cards.filter(c => c.status === RFIDCardStatus.BLOCKED).length
    };
  });

  // Statistics cards for grid
  statisticsCards = computed<StatCard[]>(() => {
    const stats = this.statistics();
    return [
      {
        icon: '💳',
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
        icon: '⛔',
        label: 'Expired',
        value: stats.expired,
        iconBgClass: 'bg-red-100 dark:bg-red-900'
      },
      {
        icon: '🚫',
        label: 'Blocked',
        value: stats.blocked,
        iconBgClass: 'bg-orange-100 dark:bg-orange-900'
      }
    ];
  });

  // Page actions
  pageActions = computed<PageAction[]>(() => [
    {
      label: '➕ Add RFID Card',
      variant: 'primary',
      onClick: () => this.openAddModal()
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
        ...this.cardStatuses().map(status => ({
          value: status,
          label: RFID_CARD_STATUS_LABELS[status]
        }))
      ],
      value: this.filterStatus()
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All Types' },
        ...this.cardTypes().map(type => ({
          value: type,
          label: RFID_CARD_TYPE_LABELS[type]
        }))
      ],
      value: this.filterType()
    }
  ]);

  constructor() {
    this.cardForm = this.fb.group({
      card_number: ['', [Validators.required, this.validationService.cardNumberValidator()]],
      holder_id: ['', [Validators.required]],
      holder_name: ['', [Validators.required]],
      holder_type: ['employee', [Validators.required]],
      card_type: [RFIDCardType.EMPLOYEE, [Validators.required]],
      expires_at: ['']
    });
  }

  ngOnInit() {
    this.loadRFIDCards();
  }

  loadRFIDCards() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.rfidService.getRFIDCards(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm() || undefined,
      this.filterStatus() || undefined,
      this.filterType() || undefined
    ).subscribe({
      next: (response) => {
        this.rfidCards.set(response.items);
        this.total.set(response.total);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถโหลดข้อมูล RFID Cards ได้');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    this.loadRFIDCards();
  }

  onFilterChange(event: { key: string; value: any }): void {
    if (event.key === 'search') {
      this.searchTerm.set(event.value);
    } else if (event.key === 'status') {
      this.filterStatus.set(event.value);
    } else if (event.key === 'type') {
      this.filterType.set(event.value);
    }
    this.currentPage.set(1);
    this.applyFilters();
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.applyFilters();
  }

  updateFilterStatus(value: RFIDCardStatus | ''): void {
    this.filterStatus.set(value);
    this.currentPage.set(1);
    this.applyFilters();
  }

  updateFilterType(value: RFIDCardType | ''): void {
    this.filterType.set(value);
    this.currentPage.set(1);
    this.applyFilters();
  }

  openAddModal(): void {
    this.selectedCard.set(null);
    this.cardForm.reset({
      card_number: '',
      holder_id: '',
      holder_name: '',
      holder_type: 'employee',
      card_type: RFIDCardType.EMPLOYEE,
      expires_at: ''
    });
    this.showModal.set(true);
  }

  openCreateModal() {
    this.openAddModal();
  }

  closeModal() {
    this.showModal.set(false);
    this.resetForm();
  }

  resetForm() {
    this.cardForm.reset({
      card_number: '',
      holder_id: '',
      holder_name: '',
      holder_type: 'employee',
      card_type: RFIDCardType.EMPLOYEE,
      expires_at: ''
    });
    this.cardForm.markAsUntouched();
    this.errorMessage.set('');
  }

  columns: TableColumn[] = [
    { key: 'card_number', label: 'Card Number', sortable: true },
    { key: 'holder_name', label: 'Holder Name', sortable: true },
    { key: 'holder_type', label: 'Holder Type' },
    {
      key: 'card_type',
      label: 'Card Type',
      render: (value) => RFID_CARD_TYPE_LABELS[value as RFIDCardType] || value
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => RFID_CARD_STATUS_LABELS[value as RFIDCardStatus] || value
    },
    {
      key: 'expires_at',
      label: 'Expires At',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  actions: TableAction[] = [
    {
      icon: '✏️',
      label: 'Edit',
      onClick: (row) => this.editCard(row)
    },
    {
      icon: '🗑️',
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => this.deleteCard(row)
    }
  ];

  Math = Math;

  saveCard(): void {
    this.submitCard();
  }

  editCard(card: RFIDCard): void {
    this.selectedCard.set(card);
    this.cardForm.patchValue({
      card_number: card.card_number,
      holder_id: card.holder_id,
      holder_name: card.holder_name,
      holder_type: card.holder_type,
      card_type: card.card_type,
      expires_at: card.expires_at ? new Date(card.expires_at).toISOString().split('T')[0] : ''
    });
    this.showModal.set(true);
  }

  submitCard() {
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      this.errorHandler.showError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    const formValue = this.cardForm.value as CreateRFIDCardDto;
    const request = this.selectedCard()
      ? this.rfidService.updateRFIDCard(this.selectedCard()!.id, formValue as any)
      : this.rfidService.createRFIDCard(formValue);
    
    request.subscribe({
      next: () => {
        this.errorHandler.showSuccess(this.selectedCard() ? 'อัปเดต RFID Card สำเร็จ' : 'สร้าง RFID Card สำเร็จ');
        this.loadRFIDCards();
        this.closeModal();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถบันทึก RFID Card ได้');
        this.isLoading.set(false);
      }
    });
  }

  deleteCard(card: RFIDCard) {
    if (!confirm(`ต้องการลบ RFID Card ${card.card_number} หรือไม่?`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.rfidService.deleteRFIDCard(card.id).subscribe({
      next: () => {
        this.errorHandler.showSuccess('ลบสำเร็จ');
        this.loadRFIDCards();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถลบ RFID Card ได้');
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(card: RFIDCard, status: RFIDCardStatus) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.rfidService.updateStatus(card.id, status).subscribe({
      next: () => {
        this.errorHandler.showSuccess('อัปเดตสถานะสำเร็จ');
        this.loadRFIDCards();
      },
      error: (error) => {
        this.errorHandler.handleApiError(error);
        this.errorMessage.set('ไม่สามารถอัปเดตสถานะได้');
        this.isLoading.set(false);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.cardForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return this.validationService.getValidationErrorMessage(control, this.getFieldLabel(fieldName));
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'card_number': 'Card Number',
      'holder_id': 'Holder ID',
      'holder_name': 'Holder Name',
      'card_type': 'Card Type'
    };
    return labels[fieldName] || fieldName;
  }

  viewCard(card: RFIDCard) {
    this.selectedCard.set(card);
  }

  closeViewModal() {
    this.selectedCard.set(null);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH');
  }

  getStatusClass(status: RFIDCardStatus): string {
    switch (status) {
      case RFIDCardStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case RFIDCardStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case RFIDCardStatus.BLOCKED:
        return 'bg-orange-100 text-orange-800';
      case RFIDCardStatus.LOST:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}

