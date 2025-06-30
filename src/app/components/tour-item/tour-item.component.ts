import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToursService, Tour } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-tour-item',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    private notificationService: NotificationService
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

    this.route.queryParams.subscribe(queryParams => {
      console.log('Query params:', queryParams);
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

  goBack(): void {
    this.router.navigate(['/tours']);
  }

  bookTour(): void {
    if (this.tour) {
      this.notificationService.showInfo('Информация', `Бронирование тура "${this.tour.name}"`);
    }
  }
}