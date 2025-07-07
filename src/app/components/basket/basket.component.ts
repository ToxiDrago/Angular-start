import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BasketStoreService } from '../../shared/services/basket-store.service';
import { Tour } from '../../shared/models/tour.interface';
import { Subscription } from 'rxjs';

interface BasketItem {
  tour: Tour;
  quantity: number;
}

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, RouterModule],
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit, OnDestroy {
  basketItems: BasketItem[] = [];
  totalPrice: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    private basketStore: BasketStoreService,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.basketStore.basket$.subscribe(tours => {
        this.basketItems = this.convertToursToBasketItems(tours);
        this.calculateTotal();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  increaseQuantity(item: BasketItem) {
    this.basketStore.addToBasket(item.tour);
  }

  decreaseQuantity(item: BasketItem) {
    if (item.quantity > 1) {
      this.basketStore.removeOneFromBasket(item.tour.id);
    }
  }

  removeItem(item: BasketItem) {
    this.basketStore.removeAllFromBasket(item.tour.id);
  }

  clearBasket() {
    this.basketStore.clearBasket();
  }

  placeOrder() {
    this.router.navigate(['/order']);
  }

  private convertToursToBasketItems(tours: Tour[]): BasketItem[] {
    const itemCounts = new Map<string, number>();
    
    tours.forEach(tour => {
      const count = itemCounts.get(tour.id) || 0;
      itemCounts.set(tour.id, count + 1);
    });

    const uniqueTours = new Map<string, Tour>();
    tours.forEach(tour => {
      if (!uniqueTours.has(tour.id)) {
        uniqueTours.set(tour.id, tour);
      }
    });

    return Array.from(uniqueTours.values()).map(tour => ({
      tour,
      quantity: itemCounts.get(tour.id) || 0
    }));
  }

  private calculateTotal() {
    this.totalPrice = this.basketItems.reduce((total, item) => {
      const price = parseFloat(item.tour.price.replace('€', '').replace(',', ''));
      return total + (price * item.quantity);
    }, 0);
  }

  getTotalPrice(): string {
    return `€${this.totalPrice.toLocaleString()}`;
  }
}
