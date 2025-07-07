import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tour } from '../models/tour.interface';

@Injectable({
  providedIn: 'root'
})
export class BasketStoreService {
  private basketSubject = new BehaviorSubject<Tour[]>([]);
  public basket$: Observable<Tour[]> = this.basketSubject.asObservable();
  
  // Добавляем публичный геттер для прямого доступа к значению
  get basket(): Tour[] {
    return this.basketSubject.value;
  }

  constructor() {
    // Загружаем корзину из localStorage при инициализации
    this.loadBasketFromStorage();
  }

  addToBasket(tour: Tour): void {
    const currentBasket = this.basketSubject.value;
    const updatedBasket = [...currentBasket, tour];
    this.basketSubject.next(updatedBasket);
    this.saveBasketToStorage(updatedBasket);
  }

  removeOneFromBasket(tourId: string): void {
    const currentBasket = this.basketSubject.value;
    const tourIndex = currentBasket.findIndex(tour => tour.id === tourId);
    
    if (tourIndex !== -1) {
      const updatedBasket = [...currentBasket];
      updatedBasket.splice(tourIndex, 1);
      this.basketSubject.next(updatedBasket);
      this.saveBasketToStorage(updatedBasket);
    }
  }

  removeAllFromBasket(tourId: string): void {
    const currentBasket = this.basketSubject.value;
    const updatedBasket = currentBasket.filter(tour => tour.id !== tourId);
    this.basketSubject.next(updatedBasket);
    this.saveBasketToStorage(updatedBasket);
  }

  clearBasket(): void {
    this.basketSubject.next([]);
    this.saveBasketToStorage([]);
  }

  getBasketCount(): number {
    return this.basketSubject.value.length;
  }

  private saveBasketToStorage(basket: Tour[]): void {
    try {
      localStorage.setItem('basket', JSON.stringify(basket));
    } catch (error) {
      console.error('Ошибка сохранения корзины в localStorage:', error);
    }
  }

  private loadBasketFromStorage(): void {
    try {
      const storedBasket = localStorage.getItem('basket');
      if (storedBasket) {
        const basket = JSON.parse(storedBasket);
        this.basketSubject.next(basket);
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage:', error);
      this.basketSubject.next([]);
    }
  }
} 