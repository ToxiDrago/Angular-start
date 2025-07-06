import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BasketStoreService } from '../../shared/services/basket-store.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  orderForm: FormGroup;
  basket$ = this.basketStore.basket$;

  constructor(
    private fb: FormBuilder,
    private basketStore: BasketStoreService,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  submitOrder() {
    if (this.orderForm.valid) {
      this.basket$.subscribe(basket => {
        const order = {
          ...this.orderForm.value,
          tours: basket
        };
        this.http.post('/api/order', order).subscribe(() => {
          this.basketStore.clearBasket();
          this.orderForm.reset();
          alert('Заказ успешно оформлен!');
        });
      }).unsubscribe();
    }
  }
} 