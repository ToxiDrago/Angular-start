import { Component } from '@angular/core';
import { BasketStoreService } from '../../shared/services/basket-store.service';
import { Tour } from '../../shared/models/tour.interface';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent {
  basket$ = this.basketStore.basket$;

  constructor(private basketStore: BasketStoreService) {}

  remove(tour: Tour) {
    this.basketStore.removeFromBasket(tour.id);
  }

  clear() {
    this.basketStore.clearBasket();
  }

  getTotal(basket: Tour[]): number {
    return basket.reduce((sum, t) => sum + this.formatPrice(t.price), 0);
  }

  formatPrice(price: string): number {
    if (!price) return 0;
    const normalized = price.replace(/[^\d]/g, '');
    return Number(normalized);
  }
}
