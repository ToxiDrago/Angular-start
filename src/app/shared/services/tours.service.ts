import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { ConfigService } from './config.service';
import { 
  Tour, 
  ToursResponse, 
  TourFilter, 
  TourSortOptions, 
  Location, 
  NearestToursRequest,
  TourStats 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private configService = inject(ConfigService);
  private http = inject(HttpClient);
  
  private get apiUrl(): string {
    return this.configService.get('apiUrl');
  }

  /**
   * Получить все туры
   */
  getTours(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/tours`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получить тур по ID
   */
  getTourById(id: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/tour/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Получить ближайшие туры по locationId
   */
  getNearestTours(locationId: string): Observable<Tour[]> {
    const params = new HttpParams().set('locationId', locationId);
    
    return this.http.get<Tour[]>(`${this.apiUrl}/nearestTours`, { params }).pipe(
      map(tours => tours || []),
      catchError(this.handleError)
    );
  }

  /**
   * Парсинг данных туров с улучшенной обработкой ошибок
   */
  parseToursData(data: any): ToursResponse {
    try {
      if (typeof data === 'object' && data !== null) {
        // Валидация структуры данных
        if (Array.isArray(data.tours)) {
          return data as ToursResponse;
        }
        // Если data сам является массивом туров
        if (Array.isArray(data)) {
          return { tours: data };
        }
      }
      
      if (typeof data === 'string') {
        const parsed = JSON.parse(data) as ToursResponse;
        if (Array.isArray(parsed.tours)) {
          return parsed;
        }
      }
      
      throw new Error('Неподдерживаемый формат данных туров');
    } catch (error) {
      console.error('❌ Ошибка парсинга данных туров:', error);
      throw new Error('Не удалось обработать данные туров');
    }
  }

  /**
   * Получить уникальные локации из туров
   */
  getUniqueLocations(tours: Tour[]): Location[] {
    const locationMap = new Map<string, Location>();
    
    tours.forEach(tour => {
      if (tour.locationId && !locationMap.has(tour.locationId)) {
        locationMap.set(tour.locationId, {
          id: tour.locationId,
          name: this.getLocationDisplayName(tour.locationId),
          description: `Локация для туров (ID: ${tour.locationId})`
        });
      }
    });
    
    return Array.from(locationMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'ru')
    );
  }

  /**
   * Получить отображаемое имя локации
   */
  private getLocationDisplayName(locationId: string): string {
    // Можно заменить на реальную логику получения названий локаций
    const locationNames: Record<string, string> = {
      '1fe323': 'Европа',
      '1fe2gfg233': 'Азия',
      '1fe21233': 'Америка',
      '1fe2g2233': 'Африка',
      '1feas2g2233': 'Океания'
    };
    
    return locationNames[locationId] || `Локация ${locationId}`;
  }

  /**
   * Фильтрация туров по типу
   */
  filterToursByType(tours: Tour[], type?: string): Tour[] {
    if (!type) return tours;
    return tours.filter(tour => tour.type === type);
  }

  /**
   * Фильтрация туров по локации
   */
  filterToursByLocation(tours: Tour[], locationId?: string): Tour[] {
    if (!locationId) return tours;
    return tours.filter(tour => tour.locationId === locationId);
  }

  /**
   * Поиск туров по ключевым словам
   */
  searchTours(tours: Tour[], searchTerm: string): Tour[] {
    if (!searchTerm) return tours;
    
    const term = searchTerm.toLowerCase().trim();
    return tours.filter(tour => 
      tour.name.toLowerCase().includes(term) ||
      tour.description.toLowerCase().includes(term) ||
      tour.tourOperator.toLowerCase().includes(term) ||
      (tour.locationId && this.getLocationDisplayName(tour.locationId).toLowerCase().includes(term))
    );
  }

  /**
   * Сортировка туров по цене
   */
  sortToursByPrice(tours: Tour[], ascending: boolean = true): Tour[] {
    return [...tours].sort((a, b) => {
      const priceA = this.extractPrice(a.price);
      const priceB = this.extractPrice(b.price);
      return ascending ? priceA - priceB : priceB - priceA;
    });
  }

  /**
   * Извлечение числового значения цены
   */
  private extractPrice(priceString: string): number {
    const cleaned = priceString.replace(/[€,$\s]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  }

  /**
   * Получить список операторов туров
   */
  getTourOperators(tours: Tour[]): string[] {
    const operators = tours
      .map(tour => tour.tourOperator)
      .filter(operator => operator && operator.trim() !== '');
    
    return [...new Set(operators)].sort((a, b) => 
      a.localeCompare(b, 'ru')
    );
  }

  /**
   * Получить количество элементов на странице из конфигурации
   */
  getItemsPerPage(): number {
    return this.configService.get('ui').itemsPerPage;
  }

  /**
   * Применить все фильтры к турам
   */
  applyFilters(tours: Tour[], filter: TourFilter): Tour[] {
    let filteredTours = [...tours];

    // Поиск по ключевым словам
    if (filter.searchTerm) {
      filteredTours = this.searchTours(filteredTours, filter.searchTerm);
    }

    // Фильтр по типу
    if (filter.type) {
      filteredTours = this.filterToursByType(filteredTours, filter.type);
    }

    // Фильтр по оператору
    if (filter.operator) {
      filteredTours = filteredTours.filter(tour => 
        tour.tourOperator === filter.operator
      );
    }

    // Фильтр по локации
    if (filter.locationId) {
      filteredTours = this.filterToursByLocation(filteredTours, filter.locationId);
    }

    // Фильтр по ценовому диапазону
    if (filter.priceRange) {
      filteredTours = filteredTours.filter(tour => {
        const price = this.extractPrice(tour.price);
        return price >= filter.priceRange!.min && price <= filter.priceRange!.max;
      });
    }

    return filteredTours;
  }

  /**
   * Сортировка туров
   */
  sortTours(tours: Tour[], sortOptions: TourSortOptions): Tour[] {
    return [...tours].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortOptions.field) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'price':
          valueA = this.extractPrice(a.price);
          valueB = this.extractPrice(b.price);
          break;
        case 'operator':
          valueA = a.tourOperator.toLowerCase();
          valueB = b.tourOperator.toLowerCase();
          break;
        case 'date':
          valueA = a.date ? new Date(a.date).getTime() : 0;
          valueB = b.date ? new Date(b.date).getTime() : 0;
          break;
        case 'location':
          valueA = a.locationId ? this.getLocationDisplayName(a.locationId).toLowerCase() : '';
          valueB = b.locationId ? this.getLocationDisplayName(b.locationId).toLowerCase() : '';
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

  /**
   * Валидация тура
   */
  validateTour(tour: Partial<Tour>): boolean {
    return !!(
      tour.id &&
      tour.name &&
      tour.description &&
      tour.tourOperator &&
      tour.price
    );
  }

  /**
   * Форматирование цены тура
   */
  formatPrice(price: string): string {
    const cleaned = price.replace(/[^\d,.-€$]/g, '');
    return cleaned || price;
  }

  /**
   * Получить статистику по турам
   */
  getTourStats(tours: Tour[]): TourStats {
    const prices = tours.map(tour => this.extractPrice(tour.price)).filter(price => price > 0);
    const averagePrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
    
    return {
      totalTours: tours.length,
      averagePrice: Math.round(averagePrice * 100) / 100,
      popularDestinations: this.getUniqueLocations(tours).slice(0, 5),
      topOperators: this.getTourOperators(tours).slice(0, 5)
    };
  }

  /**
   * Обработка ошибок HTTP запросов
   */
  private handleError = (error: any): Observable<never> => {
    console.error('❌ API Error:', error);
    
    let errorMessage = 'Произошла ошибка при загрузке данных';
    
    if (error.status === 0) {
      errorMessage = 'Нет соединения с сервером';
    } else if (error.status >= 400 && error.status < 500) {
      errorMessage = 'Ошибка запроса';
    } else if (error.status >= 500) {
      errorMessage = 'Ошибка сервера';
    }
    
    return throwError(() => new Error(errorMessage));
  };
}