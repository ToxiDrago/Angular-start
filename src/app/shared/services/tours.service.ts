import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Tour, ToursResponse, TourFilter, TourSortOptions } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private configService = inject(ConfigService);
  private http = inject(HttpClient);
  
  private get apiUrl(): string {
    return this.configService.get('apiUrl');
  }

  getTours(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/tours`);
  }

  getTourById(id: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/tour/${id}`);
  }

  parseToursData(data: any): ToursResponse {
    try {
      if (typeof data === 'object' && data !== null) {
        return data as ToursResponse;
      }
      
      if (typeof data === 'string') {
        return JSON.parse(data) as ToursResponse;
      }
      
      throw new Error('Неподдерживаемый тип данных');
    } catch (error) {
      console.error('Ошибка парсинга данных туров:', error);
      throw error;
    }
  }

  filterToursByType(tours: Tour[], type?: string): Tour[] {
    if (!type) return tours;
    return tours.filter(tour => tour.type === type);
  }

  searchTours(tours: Tour[], searchTerm: string): Tour[] {
    if (!searchTerm) return tours;
    
    const term = searchTerm.toLowerCase();
    return tours.filter(tour => 
      tour.name.toLowerCase().includes(term) ||
      tour.description.toLowerCase().includes(term) ||
      tour.tourOperator.toLowerCase().includes(term)
    );
  }

  sortToursByPrice(tours: Tour[], ascending: boolean = true): Tour[] {
    return tours.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[€,]/g, ''));
      const priceB = parseFloat(b.price.replace(/[€,]/g, ''));
      return ascending ? priceA - priceB : priceB - priceA;
    });
  }

  getTourOperators(tours: Tour[]): string[] {
    const operators = tours.map(tour => tour.tourOperator);
    return [...new Set(operators)].sort();
  }

  getItemsPerPage(): number {
    return this.configService.get('ui').itemsPerPage;
  }

  applyFilters(tours: Tour[], filter: TourFilter): Tour[] {
    let filteredTours = [...tours];

    if (filter.searchTerm) {
      filteredTours = this.searchTours(filteredTours, filter.searchTerm);
    }

    if (filter.type) {
      filteredTours = this.filterToursByType(filteredTours, filter.type);
    }

    if (filter.operator) {
      filteredTours = filteredTours.filter(tour => 
        tour.tourOperator === filter.operator
      );
    }

    if (filter.priceRange) {
      filteredTours = filteredTours.filter(tour => {
        const price = parseFloat(tour.price.replace(/[€,]/g, ''));
        return price >= filter.priceRange!.min && price <= filter.priceRange!.max;
      });
    }

    return filteredTours;
  }

  sortTours(tours: Tour[], sortOptions: TourSortOptions): Tour[] {
    return tours.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortOptions.field) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'price':
          valueA = parseFloat(a.price.replace(/[€,]/g, ''));
          valueB = parseFloat(b.price.replace(/[€,]/g, ''));
          break;
        case 'operator':
          valueA = a.tourOperator.toLowerCase();
          valueB = b.tourOperator.toLowerCase();
          break;
        case 'date':
          valueA = a.date ? new Date(a.date).getTime() : 0;
          valueB = b.date ? new Date(b.date).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return sortOptions.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOptions.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  validateTour(tour: Partial<Tour>): boolean {
    return !!(
      tour.id &&
      tour.name &&
      tour.description &&
      tour.tourOperator &&
      tour.price
    );
  }

  formatPrice(price: string): string {
    return price.replace(/[^\d,.-€]/g, '') || price;
  }
}