import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
// Removed unused GlassButtonComponent import

@Component({
  selector: 'app-video-playback',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent],
  templateUrl: './video-playback.component.html',
  styleUrls: ['./video-playback.component.scss']
})
export class VideoPlaybackComponent implements OnInit {
  cameras = [
    { id: 'cam1', name: 'Main Entrance' },
    { id: 'cam2', name: 'Parking Lot A' },
    { id: 'cam3', name: 'Lobby' }
  ];

  events = [
    { time: '08:45', label: 'Motion Detected' },
    { time: '09:12', label: 'Person Identified: John Doe' },
    { time: '10:30', label: 'Vehicle Entry: 1กก 1234' }
  ];

  selectedDate = signal(new Date().toISOString().split('T')[0]);
  selectedCamera = signal('cam1');
  isPlaying = signal(false);
  currentTime = signal('08:00');
  playbackSpeed = signal(1);

  constructor() {}

  ngOnInit() {}

  togglePlay() {
    this.isPlaying.set(!this.isPlaying());
  }

  changeSpeed() {
    const speeds = [0.5, 1, 2, 4, 8];
    const currentIndex = speeds.indexOf(this.playbackSpeed());
    const nextIndex = (currentIndex + 1) % speeds.length;
    this.playbackSpeed.set(speeds[nextIndex]);
  }
}
