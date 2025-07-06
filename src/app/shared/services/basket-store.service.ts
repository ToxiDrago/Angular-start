import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Tour } from '../models/tour.interface';

@Injectable({ providedIn: 'root' })
export class BasketStoreService {
  private basketSubject = new BehaviorSubject<Tour[]>([]);
  basket$ = this.basketSubject.asObservable();

  get basket(): Tour[] {
    return this.basketSubject.value;
  }

  addToBasket(tour: Tour) {
    this.basketSubject.next([...this.basket, tour]);
  }

  removeFromBasket(tourId: string) {
    this.basketSubject.next(this.basket.filter(t => t.id !== tourId));
  }

  clearBasket() {
    this.basketSubject.next([]);
  }
} 