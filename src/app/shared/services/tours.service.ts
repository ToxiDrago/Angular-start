import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest, throwError, of } from 'rxjs';
import { Tour } from '../models/tour.interface';
import { TourType } from '../../components/aside/aside.component';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TourFilters {
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  type?: string;
  searchQuery?: string;
}

export interface Country {
  flag_url: string;
  name_ru: string;
  iso_code2: string;
  iso_code3: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private apiUrl = environment.apiUrl;

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
    return this.http.get<{ tours: Tour[] }>(this.apiUrl + '/tours').pipe(
      map(response => response.tours)
    );
  }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/countries`);
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

  getTourById(id: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/tour/${id}`);
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

  deleteTour(id: string): Observable<Tour[]> {
    return this.http.delete<Tour[]>(`${this.apiUrl}/tour/${id}`);
  }

  updateFilters(filters: Partial<TourFilters>): void {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({ ...currentFilters, ...filters });
  }

  getFilteredTours(): Observable<Tour[]> {
    return combineLatest([this.tours$, this.filters$]).pipe(
      map(([tours, filters]) => {
        const min = filters.minPrice ?? 0;
        const max = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
        return tours.filter(tour => {
          const price = Number(tour.price);
          return !isNaN(price) && price >= min && price <= max;
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
        const prices = tours.map(t => Number(t.price)).filter(n => !isNaN(n));
        const min = prices.length ? Math.min(...prices) : 0;
        const max = prices.length ? Math.max(...prices) : 0;
    return {
          min: min,
          max: max
        };
      })
    );
  }

  // Моковые данные для тестирования (если API недоступен)
  getMockTours(): Observable<Tour[]> {
    const mockTours: Tour[] = [
      {
        id: '1',
        name: 'Mexico Adventure',
        description: 'Explore the beautiful landscapes of Mexico',
        price: '€2,192',
        type: 'single',
        date: '2025-03-04T15:30:46.910Z',
        locationId: '1fe323',
        img: 'pic1.jpg',
        tourOperator: 'LocalAdventures',
        country: 'Мексика'
      },
      {
        id: '2',
        name: 'Italia, Ocean Cruise',
        description: 'Discover Pearls of France & Italy',
        price: '€3,579',
        type: 'group',
        date: '2025-03-04T15:30:46.910Z',
        locationId: '1fe2gfg233',
        img: 'pic1.jpg',
        tourOperator: 'Emerald Waterways',
        country: 'Италия'
      },
      {
        id: '3',
        name: 'Philippines Adventure',
        description: 'Fantastic tour with a variety of activities',
        price: '€825',
        type: 'group',
        date: '2025-03-04T15:30:46.910Z',
        locationId: '1fe21233',
        img: 'pic3.jpg',
        tourOperator: 'Emerald Waterways',
        country: 'Филиппины'
      },
      {
        id: '4',
        name: 'Japan Discovery',
        description: 'Tokyo, Hakone, Takayama, Kyoto, Osaka',
        price: '€1,192',
        type: 'single',
        date: '2025-03-05T15:30:46.910Z',
        locationId: '1fe2g2233',
        img: 'pic1.jpg',
        tourOperator: 'LocalAdventures',
        country: 'Япония'
      }
    ];
    return of(mockTours);
  }

  getMockCountries(): Observable<any[]> {
    const mockCountries = [
      {
        flag_url: "//upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Flag_of_Mexico.svg/22px-Flag_of_Mexico.svg.png",
        name_ru: "Мексика",
        iso_code2: "MX",
        iso_code3: "MEX"
      },
      {
        flag_url: "//upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/22px-Flag_of_Italy.svg.png",
        name_ru: "Италия",
        iso_code2: "IT",
        iso_code3: "ITA"
      },
      {
        flag_url: "//upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_the_Philippines.svg/22px-Flag_of_the_Philippines.svg.png",
        name_ru: "Филиппины",
        iso_code2: "PH",
        iso_code3: "PHL"
      },
      {
        flag_url: "//upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/22px-Flag_of_Japan.svg.png",
        name_ru: "Япония",
        iso_code2: "JP",
        iso_code3: "JPN"
      }
    ];
    return of(mockCountries);
  }

  getCountryByCode(code: string): Observable<Country | undefined> {
    return this.http.get<Country[]>('/api/countries').pipe(
      map(countries => countries.find(c => c.iso_code2 === code)),
      catchError(() => of(undefined))
    );
  }

  getCountryByLocationId(locationId: string): Observable<Country | undefined> {
    return this.http.get<Country[]>('/api/countries').pipe(
      map(countries => countries.find(c => c.iso_code2 === locationId)),
      catchError(() => of(undefined))
    );
  }
}