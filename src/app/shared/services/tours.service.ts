import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tour {
  id: string;
  name: string;
  description: string;
  tourOperator: string;
  price: string;
  img: string;
  type?: 'single' | 'multi';
  date?: string;
  firstName?: string;
  lastName?: string;
  cardNumber?: string;
  birthDate?: string;
  age?: number;
  citizenship?: string;
  avatar?: string;
  createdAt?: string;
}

export interface ToursResponse {
  tours: Tour[];
}

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTours(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/tours`);
  }

  getTourById(id: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/tour/${id}`);
  }

  parseToursData(jsonString: string): ToursResponse {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Ошибка парсинга данных туров:', error);
      return { tours: [] };
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
}