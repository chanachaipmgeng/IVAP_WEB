/**
 * Draggable Cards Component
 *
 * A component for creating draggable and resizable cards on a canvas.
 * Supports grid snapping, overlap control, z-index management, and auto-save functionality.
 *
 * @example
 * ```html
 * <app-draggable-cards
 *   [cards]="cardData"
 *   [config]="cardsConfig"
 *   [loading]="false"
 *   [customClass]="'my-cards'"
 *   [ariaLabel]="'Draggable cards'"
 *   (cardMove)="onCardMove($event)"
 *   (cardResize)="onCardResize($event)">
 * </app-draggable-cards>
 * ```
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DraggableCard {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  locked: boolean;
  resizable: boolean;
  draggable: boolean;
  color?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  data?: Record<string, unknown>;
}

/**
 * Draggable cards configuration interface
 */
export interface DraggableCardsConfig {
  gridSize: number;
  snapToGrid: boolean;
  allowOverlap: boolean;
  maxZIndex: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  animation: boolean;
  animationDuration: number;
  autoSave: boolean;
  autoSaveDelay: number;
}

@Component({
  selector: 'app-draggable-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './draggable-cards.component.html',
  styleUrls: ['./draggable-cards.component.scss']
})
export class DraggableCardsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /**
   * Container element reference
   */
  @ViewChild('container', { static: false }) container!: ElementRef;

  /**
   * Draggable cards array
   */
  @Input() cards: DraggableCard[] = [];

  /**
   * Configuration options
   */
  @Input() config: Partial<DraggableCardsConfig> = {};

  /**
   * Loading state
   */
  @Input() loading: boolean = false;

  /**
   * Custom CSS classes
   */
  @Input() customClass?: string;

  /**
   * ARIA label for the component
   */
  @Input() ariaLabel?: string;

  /**
   * Card move event
   */
  @Output() cardMove = new EventEmitter<DraggableCard>();

  /**
   * Card resize event
   */
  @Output() cardResize = new EventEmitter<DraggableCard>();

  /**
   * Card select event
   */
  @Output() cardSelect = new EventEmitter<DraggableCard>();

  /**
   * Card deselect event
   */
  @Output() cardDeselect = new EventEmitter<DraggableCard>();

  /**
   * Cards change event
   */
  @Output() cardsChange = new EventEmitter<DraggableCard[]>();

  /**
   * Default configuration
   */
  defaultConfig: DraggableCardsConfig = {
    gridSize: 20,
    snapToGrid: true,
    allowOverlap: false,
    maxZIndex: 1000,
    minWidth: 200,
    minHeight: 150,
    maxWidth: 600,
    maxHeight: 400,
    animation: true,
    animationDuration: 300,
    autoSave: true,
    autoSaveDelay: 1000
  };

  // Component state
  selectedCard: DraggableCard | null = null;
  isDragging: boolean = false;
  isResizing: boolean = false;
  dragStart: { x: number; y: number } = { x: 0, y: 0 };
  resizeStart: { x: number; y: number; width: number; height: number } = { x: 0, y: 0, width: 0, height: 0 };
  autoSaveTimer: any = null;

  // Mouse/Touch events
  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseUpListener?: (e: MouseEvent) => void;
  private touchMoveListener?: (e: TouchEvent) => void;
  private touchEndListener?: (e: TouchEvent) => void;

  /**
   * Initialize component
   */
  ngOnInit(): void {
    this.initializeCards();
  }

  /**
   * Handle input changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cards']) {
      this.initializeCards();
    }
  }

  /**
   * Setup after view init
   */
  ngAfterViewInit(): void {
    this.setupEventListeners();
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy(): void {
    this.cleanupEventListeners();
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
  }

  /**
   * Get merged configuration
   */
  get mergedConfig(): DraggableCardsConfig {
    return { ...this.defaultConfig, ...this.config };
  }

  /**
   * Initialize cards with default values
   */
  private initializeCards(): void {
    this.cards.forEach((card, index) => {
      if (card.x === undefined) card.x = index * 20;
      if (card.y === undefined) card.y = index * 20;
      if (card.width === undefined) card.width = 250;
      if (card.height === undefined) card.height = 200;
      if (card.zIndex === undefined) card.zIndex = index + 1;
      if (card.locked === undefined) card.locked = false;
      if (card.resizable === undefined) card.resizable = true;
      if (card.draggable === undefined) card.draggable = true;
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
    this.mouseUpListener = (e: MouseEvent) => this.onMouseUp(e);
    this.touchMoveListener = (e: TouchEvent) => this.onTouchMove(e);
    this.touchEndListener = (e: TouchEvent) => this.onTouchEnd(e);

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
    document.addEventListener('touchmove', this.touchMoveListener, { passive: false });
    document.addEventListener('touchend', this.touchEndListener);
  }

  /**
   * Cleanup event listeners
   */
  private cleanupEventListeners(): void {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
    if (this.touchMoveListener) {
      document.removeEventListener('touchmove', this.touchMoveListener);
    }
    if (this.touchEndListener) {
      document.removeEventListener('touchend', this.touchEndListener);
    }
  }

  /**
   * Handle mouse down on card
   */
  onMouseDown(event: MouseEvent, card: DraggableCard): void {
    if (card.locked || !card.draggable) return;

    event.preventDefault();
    event.stopPropagation();

    this.selectedCard = card;
    this.isDragging = true;
    this.dragStart = {
      x: event.clientX - card.x,
      y: event.clientY - card.y
    };

    this.bringToFront(card);
    this.cardSelect.emit(card);
  }

  /**
   * Handle mouse move
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.selectedCard) return;

    event.preventDefault();

    let newX = event.clientX - this.dragStart.x;
    let newY = event.clientY - this.dragStart.y;

    // Snap to grid
    if (this.mergedConfig.snapToGrid) {
      newX = Math.round(newX / this.mergedConfig.gridSize) * this.mergedConfig.gridSize;
      newY = Math.round(newY / this.mergedConfig.gridSize) * this.mergedConfig.gridSize;
    }

    // Constrain to container bounds
    const containerRect = this.container?.nativeElement.getBoundingClientRect();
    if (containerRect) {
      newX = Math.max(0, Math.min(newX, containerRect.width - this.selectedCard.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - this.selectedCard.height));
    }

    this.selectedCard.x = newX;
    this.selectedCard.y = newY;

    this.cardMove.emit(this.selectedCard);
    this.scheduleAutoSave();
  }

  /**
   * Handle mouse up
   */
  onMouseUp(event: MouseEvent): void {
    if (this.isDragging && this.selectedCard) {
      this.isDragging = false;
      this.cardsChange.emit([...this.cards]);
    }
  }

  /**
   * Handle touch start
   */
  onTouchStart(event: TouchEvent, card: DraggableCard): void {
    if (card.locked || !card.draggable) return;

    event.preventDefault();
    event.stopPropagation();

    const touch = event.touches[0];
    this.selectedCard = card;
    this.isDragging = true;
    this.dragStart = {
      x: touch.clientX - card.x,
      y: touch.clientY - card.y
    };

    this.bringToFront(card);
    this.cardSelect.emit(card);
  }

  /**
   * Handle touch move
   */
  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging || !this.selectedCard) return;

    event.preventDefault();

    const touch = event.touches[0];
    let newX = touch.clientX - this.dragStart.x;
    let newY = touch.clientY - this.dragStart.y;

    // Snap to grid
    if (this.mergedConfig.snapToGrid) {
      newX = Math.round(newX / this.mergedConfig.gridSize) * this.mergedConfig.gridSize;
      newY = Math.round(newY / this.mergedConfig.gridSize) * this.mergedConfig.gridSize;
    }

    // Constrain to container bounds
    const containerRect = this.container?.nativeElement.getBoundingClientRect();
    if (containerRect) {
      newX = Math.max(0, Math.min(newX, containerRect.width - this.selectedCard.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - this.selectedCard.height));
    }

    this.selectedCard.x = newX;
    this.selectedCard.y = newY;

    this.cardMove.emit(this.selectedCard);
    this.scheduleAutoSave();
  }

  /**
   * Handle touch end
   */
  onTouchEnd(event: TouchEvent): void {
    if (this.isDragging && this.selectedCard) {
      this.isDragging = false;
      this.cardsChange.emit([...this.cards]);
    }
  }

  /**
   * Handle resize start
   */
  onResizeStart(event: MouseEvent | TouchEvent | Event, card: DraggableCard): void {
    if (card.locked || !card.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    let clientX = 0;
    let clientY = 0;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      // Keyboard event or generic event - assume center of card or skip coordinate logic
      // For accessibility, we might want to enter a "resize mode" instead of direct dragging
      return;
    }

    this.selectedCard = card;
    this.isResizing = true;
    this.resizeStart = {
      x: clientX,
      y: clientY,
      width: card.width,
      height: card.height
    };

    this.bringToFront(card);
  }

  /**
   * Handle resize move
   */
  onResizeMove(event: MouseEvent): void {
    if (!this.isResizing || !this.selectedCard) return;

    event.preventDefault();

    const deltaX = event.clientX - this.resizeStart.x;
    const deltaY = event.clientY - this.resizeStart.y;

    let newWidth = this.resizeStart.width + deltaX;
    let newHeight = this.resizeStart.height + deltaY;

    // Apply constraints
    newWidth = Math.max(this.mergedConfig.minWidth, Math.min(newWidth, this.mergedConfig.maxWidth));
    newHeight = Math.max(this.mergedConfig.minHeight, Math.min(newHeight, this.mergedConfig.maxHeight));

    this.selectedCard.width = newWidth;
    this.selectedCard.height = newHeight;

    this.cardResize.emit(this.selectedCard);
    this.scheduleAutoSave();
  }

  /**
   * Handle resize end
   */
  onResizeEnd(event: MouseEvent): void {
    if (this.isResizing && this.selectedCard) {
      this.isResizing = false;
      this.cardsChange.emit([...this.cards]);
    }
  }

  /**
   * Bring card to front
   */
  bringToFront(card: DraggableCard): void {
    const maxZIndex = Math.max(...this.cards.map(c => c.zIndex));
    card.zIndex = maxZIndex + 1;
  }

  /**
   * Select card
   */
  selectCard(card: DraggableCard): void {
    this.selectedCard = card;
    this.bringToFront(card);
    this.cardSelect.emit(card);
  }

  /**
   * Deselect card
   */
  deselectCard(): void {
    if (this.selectedCard) {
      this.cardDeselect.emit(this.selectedCard);
    }
    this.selectedCard = null;
  }

  /**
   * Toggle card lock
   */
  toggleCardLock(card: DraggableCard): void {
    card.locked = !card.locked;
    this.cardsChange.emit([...this.cards]);
  }

  /**
   * Delete card
   */
  deleteCard(card: DraggableCard): void {
    const index = this.cards.indexOf(card);
    if (index > -1) {
      this.cards.splice(index, 1);
      this.cardsChange.emit([...this.cards]);
    }
  }

  /**
   * Add new card
   */
  addCard(): void {
    const newCard: DraggableCard = {
      id: `card-${Date.now()}`,
      title: 'New Card',
      content: 'Card content',
      x: Math.random() * 200,
      y: Math.random() * 200,
      width: 250,
      height: 200,
      zIndex: this.cards.length + 1,
      locked: false,
      resizable: true,
      draggable: true,
      color: this.getRandomColor()
    };

    this.cards.push(newCard);
    this.cardsChange.emit([...this.cards]);
  }

  /**
   * Get random color
   */
  private getRandomColor(): string {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Schedule auto save
   */
  private scheduleAutoSave(): void {
    if (!this.mergedConfig.autoSave) return;

    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.cardsChange.emit([...this.cards]);
    }, this.mergedConfig.autoSaveDelay);
  }

  /**
   * Get card styles
   */
  getCardStyles(card: DraggableCard): Record<string, string> {
    const styles: Record<string, string> = {
      left: `${card.x}px`,
      top: `${card.y}px`,
      width: `${card.width}px`,
      height: `${card.height}px`,
      zIndex: card.zIndex.toString()
    };

    if (card.color) {
      styles['border-left'] = `4px solid ${card.color}`;
    }

    if (this.mergedConfig.animation) {
      styles['transition'] = `all ${this.mergedConfig.animationDuration}ms ease`;
    }

    return styles;
  }

  /**
   * Get card classes
   */
  getCardClasses(card: DraggableCard): string[] {
    const classes = ['draggable-card'];

    if (this.selectedCard === card) {
      classes.push('card-selected');
    }

    if (card.locked) {
      classes.push('card-locked');
    }

    if (!card.draggable) {
      classes.push('card-not-draggable');
    }

    if (!card.resizable) {
      classes.push('card-not-resizable');
    }

    return classes;
  }

  /**
   * TrackBy function for cards
   */
  trackByCardId(index: number, card: DraggableCard): string {
    return card.id;
  }
}
