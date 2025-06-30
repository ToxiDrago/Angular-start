import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToursService, Tour, ToursResponse } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss']
})
export class ToursComponent implements OnInit {
  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  loading = false;
  
  searchTerm = '';
  selectedType = '';
  selectedOperator = '';
  sortBy = '';
  
  tourOperators: string[] = [];
  tourTypes = [
    { value: '', label: 'Все типы' },
    { value: 'single', label: 'Одиночные' },
    { value: 'multi', label: 'Множественные' }
  ];

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.loading = true;
    
    this.toursService.getTours().subscribe({
      next: (jsonString: string) => {
        try {
          const toursData: ToursResponse = this.toursService.parseToursData(jsonString);
          this.tours = toursData.tours || [];
          this.filteredTours = [...this.tours];
          this.tourOperators = this.toursService.getTourOperators(this.tours);
          
          this.notificationService.showSuccess(
            'Туры загружены', 
            `Найдено ${this.tours.length} туров`
          );
        } catch (error) {
          console.error('Ошибка обработки данных туров:', error);
          this.notificationService.showError('Ошибка', 'Не удалось обработать данные туров');
        } finally {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки туров:', error);
        this.notificationService.showError('Ошибка', 'Не удалось загрузить туры');
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.tours];

    if (this.searchTerm) {
      result = this.toursService.searchTours(result, this.searchTerm);
    }

    if (this.selectedType) {
      result = this.toursService.filterToursByType(result, this.selectedType);
    }

    if (this.selectedOperator) {
      result = result.filter(tour => tour.tourOperator === this.selectedOperator);
    }

    if (this.sortBy === 'price-asc') {
      result = this.toursService.sortToursByPrice(result, true);
    } else if (this.sortBy === 'price-desc') {
      result = this.toursService.sortToursByPrice(result, false);
    } else if (this.sortBy === 'name') {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    }

    this.filteredTours = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedOperator = '';
    this.sortBy = '';
    this.filteredTours = [...this.tours];
  }

  getPriceNumber(price: string): number {
    return parseFloat(price.replace(/[€,]/g, ''));
  }

  trackByTourId(index: number, tour: Tour): string {
    return tour.id;
  }
}