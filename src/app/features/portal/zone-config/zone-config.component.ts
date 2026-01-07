import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

interface Point {
  x: number;
  y: number;
}

interface Zone {
  id: string;
  name: string;
  type: 'intrusion' | 'counting' | 'loitering';
  points: Point[];
  color: string;
  isActive: boolean;
}

@Component({
  selector: 'app-zone-config',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './zone-config.component.html',
  styleUrls: ['./zone-config.component.scss']
})
export class ZoneConfigComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('imageContainer', { static: true }) imageContainerRef!: ElementRef<HTMLDivElement>;

  cameras = [
    { id: 'cam1', name: 'Main Entrance', url: 'assets/images/placeholder-camera-1.jpg' }, // Use placeholders
    { id: 'cam2', name: 'Lobby', url: 'assets/images/placeholder-camera-2.jpg' }
  ];
  selectedCamera = signal(this.cameras[0]);
  
  zones = signal<Zone[]>([]);
  activeZoneId = signal<string | null>(null); // Zone being edited
  isDrawing = signal(false);
  
  // Canvas context
  private ctx!: CanvasRenderingContext2D;
  private image = new Image();
  private currentPoints: Point[] = [];

  constructor() {}

  ngOnInit() {
    // Mock initial zones
    this.zones.set([
      {
        id: '1',
        name: 'Restricted Area',
        type: 'intrusion',
        points: [{x: 100, y: 100}, {x: 300, y: 100}, {x: 300, y: 300}, {x: 100, y: 300}],
        color: '#ef4444', // Red
        isActive: true
      }
    ]);
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.loadImage();
  }

  initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Resize canvas to match container (responsive)
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this.imageContainerRef.nativeElement);
  }

  resizeCanvas() {
    const container = this.imageContainerRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    this.draw();
  }

  loadImage() {
    // In a real app, this would be a stream snapshot
    // For demo, we create a placeholder color background
    this.draw();
  }

  // Drawing Logic
  draw() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    this.ctx.clearRect(0, 0, width, height);

    // Draw Background (Mock Camera Feed)
    this.ctx.fillStyle = '#1f2937'; // Dark gray
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw Grid (Optional, helps perspective)
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 1;
    for(let i=0; i<width; i+=50) { this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,height); this.ctx.stroke(); }
    for(let i=0; i<height; i+=50) { this.ctx.beginPath(); this.ctx.moveTo(0,i); this.ctx.lineTo(width,i); this.ctx.stroke(); }

    this.ctx.fillStyle = '#9ca3af';
    this.ctx.font = '20px sans-serif';
    this.ctx.fillText(`Camera Feed: ${this.selectedCamera().name}`, 20, 40);

    // Draw Zones
    this.zones().forEach(zone => {
      this.drawPolygon(zone.points, zone.color, zone.id === this.activeZoneId(), true);
    });

    // Draw Current Drawing
    if (this.isDrawing() && this.currentPoints.length > 0) {
      this.drawPolygon(this.currentPoints, '#6366f1', true, false); // Indigo
    }
  }

  drawPolygon(points: Point[], color: string, isActive: boolean, isClosed: boolean) {
    if (points.length === 0) return;

    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    if (isClosed) {
      this.ctx.closePath();
    }

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = isActive ? 3 : 2;
    this.ctx.stroke();

    this.ctx.fillStyle = color + '33'; // 20% opacity
    this.ctx.fill();

    // Draw points
    if (isActive) {
      this.ctx.fillStyle = '#fff';
      points.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      });
    }
  }

  // Interactions
  onCanvasClick(event: MouseEvent) {
    if (!this.isDrawing()) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.currentPoints.push({ x, y });
    this.draw();
  }

  onCanvasMouseMove(event: MouseEvent) {
    // Could add hover effects or cursor guides here
  }

  startDrawing() {
    this.isDrawing.set(true);
    this.activeZoneId.set(null); // Deselect others
    this.currentPoints = [];
  }

  finishDrawing() {
    if (this.currentPoints.length < 3) {
      alert('A zone must have at least 3 points.');
      return;
    }

    const newZone: Zone = {
      id: Date.now().toString(),
      name: `New Zone ${this.zones().length + 1}`,
      type: 'intrusion',
      points: [...this.currentPoints],
      color: '#10b981', // Green default
      isActive: true
    };

    this.zones.update(zones => [...zones, newZone]);
    this.isDrawing.set(false);
    this.currentPoints = [];
    this.activeZoneId.set(newZone.id);
    this.draw();
  }

  cancelDrawing() {
    this.isDrawing.set(false);
    this.currentPoints = [];
    this.draw();
  }

  selectZone(id: string) {
    if (this.isDrawing()) return;
    this.activeZoneId.set(id);
    this.draw();
  }

  deleteZone(id: string) {
    this.zones.update(zones => zones.filter(z => z.id !== id));
    if (this.activeZoneId() === id) {
      this.activeZoneId.set(null);
    }
    this.draw();
  }

  clearAll() {
    if(confirm('Are you sure you want to delete all zones?')) {
      this.zones.set([]);
      this.activeZoneId.set(null);
      this.draw();
    }
  }
}

