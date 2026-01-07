import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card.component';
import { GlassButtonComponent } from '../../../shared/components/glass-button/glass-button.component';

@Component({
  selector: 'app-video-playback',
  standalone: true,
  imports: [CommonModule, FormsModule, GlassCardComponent, GlassButtonComponent],
  templateUrl: './video-playback.component.html',
  styleUrls: ['./video-playback.component.scss']
})
export class VideoPlaybackComponent implements OnInit {
  cameras = [
    { id: 'cam1', name: 'Main Entrance' },
    { id: 'cam2', name: 'Lobby' },
    { id: 'cam3', name: 'Parking Lot A' },
    { id: 'cam4', name: 'Server Room' }
  ];
  selectedCamera = signal(this.cameras[0].id);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  currentTime = signal('12:00');
  isPlaying = signal(false);
  playbackSpeed = signal(1);

  // Mock timeline events
  events = [
    { time: '09:15', type: 'motion', label: 'Motion Detected' },
    { time: '10:30', type: 'person', label: 'Person Detected' },
    { time: '12:00', type: 'vehicle', label: 'Vehicle Entry' }
  ];

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

  seek(event: any) {
    // Implement seeking logic
    console.log('Seeking to:', event.target.value);
  }
}

