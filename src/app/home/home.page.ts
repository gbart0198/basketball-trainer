import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonButtons,
  IonListHeader,
  IonItem,
  IonInput,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

interface Shot {
  x: number;
  y: number;
  made: boolean;
  isSingle: boolean;
  percentage?: number;
  timestamp: Date;
  attempts?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
    IonIcon,
    IonModal,
    IonButtons,
    IonListHeader,
    IonItem,
    IonInput,
    IonToggle
  ]
})
export class HomePage {
  constructor() {
    addIcons({ closeOutline });
  }
  isModalOpen = false;
  shotType: 'single' | 'multiple' = 'single';
  attempts: number = 1;
  made: number = 0;
  shots: Shot[] = [];
  clickPosition = { x: 0, y: 0 };
  activeTooltip: Shot | null = null;
  tooltipPosition = { x: 0, y: 0 };

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // If there's an active tooltip and we clicked outside of it, hide the tooltip
    if (this.activeTooltip && !(event.target as HTMLElement).closest('.tooltip')) {
      this.hideTooltip();
    }
  }

  handleCourtClick(event: MouseEvent) {
    // Check if we clicked on a shot marker
    const target = event.target as HTMLElement;
    if (target.classList.contains('shot-marker')) {
      return; // Let the shot marker's click handler take care of it
    }

    // If there's an active tooltip, don't create a new point
    if (this.activeTooltip) {
      return;
    }

    const courtContainer = event.currentTarget as HTMLElement;
    const rect = courtContainer.getBoundingClientRect();

    // Calculate position relative to the court container
    this.clickPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    this.setOpen(true);
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.resetForm();
    }
  }

  onShotTypeChange() {
    // Just reset the form when the shot type changes
    console.log('before: ' + this.shotType)
    this.shotType = this.shotType === 'single' ? 'multiple' : 'single';
    this.resetForm();
    console.log('after: ' + this.shotType);
  }

  resetForm() {
    this.attempts = 1;
    this.made = 0;
  }

  recordShot(made: boolean) {
    this.shots.push({
      x: this.clickPosition.x,
      y: this.clickPosition.y,
      made,
      isSingle: this.shotType === 'single',
      timestamp: new Date()
    });
    this.setOpen(false);
  }

  isValidMultipleShot(): boolean {
    return this.attempts > 0 && this.made >= 0 && this.made <= this.attempts;
  }

  recordMultipleShots() {
    if (!this.isValidMultipleShot()) {
      return;
    }

    const percentage = this.made / this.attempts;
    const timestamp = new Date();

    // Add all shots for this position
    for (let i = 0; i < this.attempts; i++) {
      this.shots.push({
        x: this.clickPosition.x,
        y: this.clickPosition.y,
        made: i < this.made,
        isSingle: false,
        percentage,
        timestamp,
        attempts: this.attempts
      });
    }

    this.setOpen(false);
  }

  getShotColor(shot: Shot): string {
    if (shot.isSingle) {
      return shot.made ? 'green' : 'red';
    } else {
      if (shot.percentage! > 0.7) return 'green';
      if (shot.percentage! > 0.4) return 'orange';
      return 'red';
    }
  }

  showTooltip(shot: Shot, event: MouseEvent) {
    this.activeTooltip = shot;
    const courtContainer = (event.currentTarget as HTMLElement).closest('.court-container');
    const rect = courtContainer!.getBoundingClientRect();
    const courtCenterX = rect.width / 2;
    const courtCenterY = rect.height / 2;

    // Calculate tooltip position with offset based on quadrant
    let offsetX = 10;
    let offsetY = 10;

    if (shot.x > courtCenterX) {
      offsetX = -210; // Move left to prevent going off screen
    }
    if (shot.y > courtCenterY) {
      offsetY = -90; // Move up to prevent going off screen
    }

    this.tooltipPosition = {
      x: shot.x + offsetX,
      y: shot.y + offsetY
    };
  }

  hideTooltip() {
    this.activeTooltip = null;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatPercentage(percentage: number): string {
    return (percentage * 100).toFixed(1) + '%';
  }

  getTotalAttempts(shot: Shot): number {
    return shot.attempts || 0;
  }
}
