import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { BasketStoreService } from '../../shared/services/basket-store.service';

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    DropdownModule
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  orderSuccess: boolean = false;
  userFormFieldsArr: FormField[] = [
    { name: 'fullName', label: 'ФИО', type: 'text', required: true },
    { name: 'age', label: 'Возраст', type: 'number', required: true },
    { name: 'birthDate', label: 'День рождения', type: 'date', required: true },
    { name: 'citizenship', label: 'Гражданство', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Телефон', type: 'tel', required: true }
  ];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private http: HttpClient,
    private basketStore: BasketStoreService
  ) {
    this.orderForm = this.fb.group({});
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const formControls: { [key: string]: any } = {};
    
    this.userFormFieldsArr.forEach(field => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.type === 'email') {
        validators.push(Validators.email);
      }
      if (field.type === 'number') {
        validators.push(Validators.min(0));
      }
      
      formControls[field.name] = ['', validators];
    });

    this.orderForm = this.fb.group(formControls);
  }

  submitOrder() {
    if (this.orderForm.valid) {
      const orderData = {
        ...this.orderForm.value,
        tourIds: this.basketStore.basket.map(tour => tour.id),
        totalAmount: this.calculateTotal()
      };

      this.http.post<any>('http://localhost:3000/order', orderData)
        .subscribe({
          next: (response) => {
            console.log('Заказ оформлен:', response);
            this.orderSuccess = true;
            this.basketStore.clearBasket();
            setTimeout(() => {
              this.router.navigate(['/tours']);
            }, 2000);
          },
          error: (error) => {
            console.error('Ошибка при оформлении заказа:', error);
          }
        });
    }
  }

  private calculateTotal(): number {
    return this.basketStore.basket.reduce((total, tour) => {
      const price = parseFloat(tour.price.replace('€', '').replace(',', ''));
      return total + price;
    }, 0);
  }

  getFieldType(field: FormField): string {
    switch (field.type) {
      case 'date':
        return 'date';
      case 'number':
        return 'number';
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      default:
        return 'text';
    }
  }
} 