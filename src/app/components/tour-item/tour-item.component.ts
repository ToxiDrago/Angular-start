import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToursService } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ImageService } from '../../shared/services/image.service';
import { Tour } from '../../shared/models';

@Component({
  selector: 'app-tour-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-item.component.html',
  styleUrls: ['./tour-item.component.scss']
})
export class TourItemComponent implements OnInit {
  // Инжектирование сервисов
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toursService = inject(ToursService);
  private notificationService = inject(NotificationService);
  private imageService = inject(ImageService);

  // 3.1 - Создание свойства tour с указанием типа
  tour: Tour | null = null;
  tourId: string | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    // Получение ID тура из параметров маршрута
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

  // 3.2 и 3.3 - Выполнение запроса getTourById и запись ответа в tour
  private loadTour(id: string): void {
    this.loading = true;
    this.error = null;

    this.toursService.getTourById(id).subscribe({
      next: (tourData: Tour) => {
        // 3.3 - При успешном ответе записываем данные тура
        this.tour = {
          ...tourData,
          img: this.processImageUrl(tourData.img)
        };
        
        this.notificationService.showSuccess('Успех', 'Тур загружен');
        this.loading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки тура:', error);
        
        // Попробуем загрузить из списка всех туров как fallback
        this.loadTourFromAllTours(id);
      }
    });
  }

  // Fallback метод для загрузки тура из общего списка
  private loadTourFromAllTours(id: string): void {
    this.toursService.getTours().subscribe({
      next: (jsonString: string) => {
        try {
          const toursData = this.toursService.parseToursData(jsonString);
          const foundTour = toursData.tours?.find(t => t.id === id);
          
          if (foundTour) {
            this.tour = {
              ...foundTour,
              img: this.processImageUrl(foundTour.img)
            };
            this.notificationService.showSuccess('Успех', 'Тур загружен');
          } else {
            this.error = 'Тур не найден';
            this.notificationService.showError('Ошибка', 'Тур с указанным ID не найден');
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

  processImageUrl(imageUrl: string): string {
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

  // Дополнительные методы для работы с туром
  getTourPrice(): string {
    return this.tour ? this.toursService.formatPrice(this.tour.price) : '';
  }

  getTourTypeLabel(): string {
    if (!this.tour?.type) return '';
    
    const typeLabels = {
      'single': 'Одиночный тур',
      'multi': 'Групповой тур'
    };
    
    return typeLabels[this.tour.type] || this.tour.type;
  }

  isTourValid(): boolean {
    return this.tour ? this.toursService.validateTour(this.tour) : false;
  }
}