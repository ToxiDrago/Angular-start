import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToursService, Tour } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ImageService } from '../../shared/services/image.service';

@Component({
  selector: 'app-tour-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent implements OnInit {
  tour: Tour | null = null;
  tourId: string | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toursService: ToursService,
    private notificationService: NotificationService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.tourId = params.get('id');
      if (this.tourId) {
        this.loadTour(this.tourId);
      } else {
        this.error = 'ID тура не указан';
        this.loading = false;
      }
    });
  }

  private loadTour(id: string): void {
    this.loading = true;
    this.error = null;

    this.toursService.getTours().subscribe({
      next: (jsonString: string) => {
        try {
          const toursData = this.toursService.parseToursData(jsonString);
          this.tour = toursData.tours?.find(t => t.id === id) || null;
          
          if (!this.tour) {
            this.error = 'Тур не найден';
            this.notificationService.showError('Ошибка', 'Тур с указанным ID не найден');
          } else {
            this.notificationService.showSuccess('Успех', 'Тур загружен');
          }
        } catch (error) {
          console.error('Ошибка обработки данных тура:', error);
          this.error = 'Ошибка загрузки данных';
          this.notificationService.showError('Ошибка', 'Не удалось загрузить данные тура');
        } finally {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки тура:', error);
        this.error = 'Ошибка сети';
        this.notificationService.showError('Ошибка', 'Не удалось подключиться к серверу');
        this.loading = false;
      }
    });
  }

  getImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return this.imageService.getPlaceholder('landscape');
    }
    
    // If it's just a filename, prepend assets path
    if (!imageUrl.includes('/') && imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `assets/images/${imageUrl}`;
    }
    
    return this.imageService.processImageUrl(imageUrl);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallbackUrl = this.imageService.getFallbackUrl(img.src);
    
    if (img.src !== fallbackUrl) {
      console.warn(`Failed to load image: ${img.src}`);
      img.src = fallbackUrl;
      img.alt = 'Изображение недоступно';
    }
  }

  goBack(): void {
    this.router.navigate(['/tours']);
  }

  bookTour(): void {
    if (this.tour) {
      this.notificationService.showInfo('Информация', `Бронирование тура "${this.tour.name}"`);
    }
  }
}