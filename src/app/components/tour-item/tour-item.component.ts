import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tour } from '../../shared/models/tour.interface';

@Component({
  selector: 'app-tour-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent {
  @Input() tour!: Tour;

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.svg';
  }
}