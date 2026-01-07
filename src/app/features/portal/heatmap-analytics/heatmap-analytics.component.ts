import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-heatmap-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './heatmap-analytics.component.html',
  styleUrls: ['./heatmap-analytics.component.scss']
})
export class HeatmapAnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('heatmapCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  timeRange = signal('today'); // today, week, month
  selectedCamera = signal('cam1');
  
  private ctx!: CanvasRenderingContext2D;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initCanvas();
    this.drawMockHeatmap();
  }

  initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this.containerRef.nativeElement);
  }

  resizeCanvas() {
    const container = this.containerRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    this.drawMockHeatmap();
  }

  drawMockHeatmap() {
    const width = this.canvasRef.nativeElement.width;
    const height = this.canvasRef.nativeElement.height;

    // Clear
    this.ctx.clearRect(0, 0, width, height);

    // Draw Background (Mock Floor Plan / Camera)
    this.ctx.fillStyle = '#111827'; // Very dark gray
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw Floor Plan Grid
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 1;
    for(let i=0; i<width; i+=100) { this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,height); this.ctx.stroke(); }
    for(let i=0; i<height; i+=100) { this.ctx.beginPath(); this.ctx.moveTo(0,i); this.ctx.lineTo(width,i); this.ctx.stroke(); }

    // Draw Heatmap Spots (Mock)
    const points = [];
    for(let i=0; i<50; i++) {
        points.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 50 + 20,
            intensity: Math.random()
        });
    }

    // Cluster points in center for realism
    for(let i=0; i<20; i++) {
        points.push({
            x: width/2 + (Math.random() - 0.5) * 200,
            y: height/2 + (Math.random() - 0.5) * 200,
            radius: Math.random() * 60 + 30,
            intensity: 0.8
        });
    }

    points.forEach(p => {
        const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(255, 0, 0, ${p.intensity * 0.5})`); // Red center
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${p.intensity * 0.3})`); // Yellow mid
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0)'); // Transparent edge
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
    });

    // Add Label
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Heatmap Analytics: ' + this.selectedCamera(), 30, 50);
  }

  refresh() {
    this.drawMockHeatmap();
  }
}

