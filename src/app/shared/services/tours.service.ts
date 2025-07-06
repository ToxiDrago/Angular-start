import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, throwError } from 'rxjs';
import { Tour } from '../models/tour.interface';
import { TourType } from '../../components/aside/aside.component';
import { map, tap, catchError } from 'rxjs/operators';

export interface TourFilters {
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  type?: string;
  searchQuery?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private apiUrl = 'http://localhost:3000/tours';

  private tourTypeSubject = new BehaviorSubject<TourType>('all');
  tourType$ = this.tourTypeSubject.asObservable();

  private tourDateSubject = new BehaviorSubject<Date | null>(null);
  tourDate$ = this.tourDateSubject.asObservable();

  private toursSubject = new BehaviorSubject<Tour[]>([]);
  private filtersSubject = new BehaviorSubject<TourFilters>({});

  public tours$ = this.toursSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTours();
  }

  private loadTours(): void {
    this.getTours().subscribe({
      next: (tours) => {
        console.log('✅ Tours loaded successfully:', tours);
        this.toursSubject.next(tours);
      },
      error: (error) => {
        console.error('❌ Error loading tours:', error);
        this.toursSubject.next([]);
      }
    });
  }

  getTours(): Observable<Tour[]> {
    return this.http.get<{ tours: any[] }>(this.apiUrl).pipe(
      map(response => response.tours.map(tour => ({
        ...tour,
        // Преобразуем цену в число (убираем символ и запятую)
        price: typeof tour.price === 'string'
          ? Number(tour.price.replace(/[^\d.]/g, '').replace(',', '.'))
          : tour.price ?? 0,
        // Безопасно подставляем location
        location: tour.location ?? 'Unknown location',
        // duration и rating по умолчанию
        duration: tour.duration ?? 0,
        rating: tour.rating ?? 0,
        // Картинка
        imageUrl: tour.img
          ? `assets/images/${tour.img}`
          : 'assets/images/placeholder.svg'
      })))
    );
  }

  private validateTourType(type: any): "beach" | "mountain" | "city" | "adventure" | undefined {
    const validTypes = ["beach", "mountain", "city", "adventure"];
    if (typeof type === 'string' && validTypes.includes(type.toLowerCase())) {
      return type.toLowerCase() as "beach" | "mountain" | "city" | "adventure";
    }
    return undefined;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('📄 HTTP Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      message: error.message
    });
    
    if (error.status === 200) {
      console.warn('⚠️ Status 200 but error occurred - checking response format');
      console.log('📄 Error response body:', error.error);
      return throwError(() => new Error('Invalid response format'));
    }
    
    return throwError(() => new Error(`HTTP Error: ${error.status} - ${error.message}`));
  }

  getTourById(id: number): Observable<Tour | undefined> {
    return this.tours$.pipe(
      map(tours => tours.find(tour => tour.id === id))
    );
  }

  getNearestTours(locationId: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/nearestTours?locationId=${locationId}`);
  }

  updateTourType(type: TourType): void {
    this.tourTypeSubject.next(type);
  }

  updateTourDate(date: Date | null): void {
    this.tourDateSubject.next(date);
  }

  searchTours(query: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}?search=${encodeURIComponent(query)}`);
  }

  filterToursByType(type: TourType): Observable<Tour[]> {
    if (type === 'all') {
      return this.getTours();
    }
    return this.http.get<Tour[]>(`${this.apiUrl}?type=${type}`);
  }

  filterToursByDate(date: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}?date=${date}`);
  }

  filterToursByPrice(minPrice: number, maxPrice: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}?minPrice=${minPrice}&maxPrice=${maxPrice}`);
  }

  sortToursByPrice(ascending: boolean = true): Observable<Tour[]> {
    const order = ascending ? 'asc' : 'desc';
    return this.http.get<Tour[]>(`${this.apiUrl}?sort=price&order=${order}`);
  }

  sortToursByName(ascending: boolean = true): Observable<Tour[]> {
    const order = ascending ? 'asc' : 'desc';
    return this.http.get<Tour[]>(`${this.apiUrl}?sort=name&order=${order}`);
  }

  sortToursByDate(ascending: boolean = true): Observable<Tour[]> {
    const order = ascending ? 'asc' : 'desc';
    return this.http.get<Tour[]>(`${this.apiUrl}?sort=date&order=${order}`);
  }

  getToursWithPagination(page: number, pageSize: number): Observable<{tours: Tour[], total: number}> {
    return this.http.get<{tours: Tour[], total: number}>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getToursCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  getToursByTypeCount(): Observable<{[key in TourType]: number}> {
    return this.http.get<{[key in TourType]: number}>(`${this.apiUrl}/countByType`);
  }

  createTour(tour: Omit<Tour, 'id'>): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, tour);
  }

  updateTour(id: number, tour: Partial<Tour>): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}/${id}`, tour);
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateFilters(filters: Partial<TourFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  getFilteredTours(): Observable<Tour[]> {
    return combineLatest([this.tours$, this.filters$]).pipe(
      map(([tours, filters]) => {
        return tours.filter(tour => {
          // Фильтр по цене
          if (filters.minPrice && tour.price < filters.minPrice) return false;
          if (filters.maxPrice && tour.price > filters.maxPrice) return false;
          
          // Фильтр по длительности - конвертируем в число для сравнения
          if (filters.duration && Number(tour.duration) !== filters.duration) return false;
          
          // Фильтр по типу
          if (filters.type && tour.type !== filters.type) return false;
          
          // Фильтр по поисковому запросу
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesName = tour.name.toLowerCase().includes(query);
            const matchesDescription = tour.description.toLowerCase().includes(query);
            if (!matchesName && !matchesDescription) return false;
          }
          
          return true;
        });
      })
    );
  }

  getTourTypes(): Observable<string[]> {
    return this.tours$.pipe(
      map(tours => {
        const types = tours.map(tour => tour.type).filter(Boolean);
        return [...new Set(types)] as string[];
      })
    );
  }

  getPriceRange(): Observable<{ min: number; max: number }> {
    return this.tours$.pipe(
      map(tours => {
        if (tours.length === 0) return { min: 0, max: 0 };
        const prices = tours.map(tour => tour.price);
        return {
          min: Math.min(...prices),
          max: Math.max(...prices)
        };
      })
    );
  }

  // Временный метод для тестирования с моковыми данными
  getMockTours(): Observable<Tour[]> {
    const mockTours: Tour[] = [
      {
        id: 1,
        name: "Beach Paradise",
        description: "Amazing beach vacation in paradise",
        price: 1200,
        duration: 7,
        imageUrl: "assets/images/placeholder.svg",
        type: "beach",
        location: "Maldives",
        rating: 4.5,
        tourOperator: "Paradise Tours",
        date: "2024-08-15"
      },
      {
        id: 2,
        name: "Mountain Adventure",
        description: "Exciting mountain climbing adventure",
        price: 800,
        duration: 5,
        imageUrl: "assets/images/placeholder.svg",
        type: "adventure",
        location: "Switzerland",
        rating: 4.8,
        tourOperator: "Adventure Co",
        date: "2024-09-20"
      },
      {
        id: 3,
        name: "City Explorer",
        description: "Explore the vibrant city life",
        price: 600,
        duration: 3,
        imageUrl: "assets/images/placeholder.svg",
        type: "city",
        location: "Paris",
        rating: 4.2,
        tourOperator: "Urban Tours",
        date: "2024-07-10"
      },
      {
        id: 4,
        name: "Mountain Retreat",
        description: "Peaceful mountain getaway",
        price: 950,
        duration: 6,
        imageUrl: "assets/images/placeholder.svg",
        type: "mountain",
        location: "Austria",
        rating: 4.6,
        tourOperator: "Mountain Escapes",
        date: "2024-10-05"
      }
    ];

    console.log('🎯 Using mock tours:', mockTours);
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockTours);
        observer.complete();
      }, 500);
    });
  }
}