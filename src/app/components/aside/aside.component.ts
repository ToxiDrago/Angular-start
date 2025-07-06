import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { Subject, Subscription } from 'rxjs';
import { ToursService } from '../../shared/services/tours.service';
import { PrimeNG } from 'primeng/config';

export type TourType = 'all' | 'beach' | 'mountain' | 'city' | 'adventure';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DropdownModule, ButtonModule],
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss']
})
export class AsideComponent implements OnInit, OnDestroy {
  selectedType: TourType = 'all';
  selectedDate: Date | null = null;
  
  tourTypes: { label: string, value: TourType }[] = [
    { label: 'Все туры', value: 'all' },
    { label: 'Пляжный отдых', value: 'beach' },
    { label: 'Горный туризм', value: 'mountain' },
    { label: 'Городские туры', value: 'city' },
    { label: 'Приключения', value: 'adventure' }
  ];
  
  private subscription = new Subscription();

  constructor(
    private toursService: ToursService,
    private primeng: PrimeNG
  ) {}

  ngOnInit(): void {
    this.setupCalendarLocale();
    
    this.subscription.add(
      this.toursService.tourType$.subscribe(type => {
        this.selectedType = type;
      })
    );
    
    this.subscription.add(
      this.toursService.tourDate$.subscribe(date => {
        this.selectedDate = date;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setupCalendarLocale(): void {
    this.primeng.setTranslation({
      firstDayOfWeek: 1,
      dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
      today: 'Сегодня',
      clear: 'Очистить'
    });
  }

  onTypeChange(): void {
    this.toursService.updateTourType(this.selectedType);
  }

  onDateChange(): void {
    this.toursService.updateTourDate(this.selectedDate);
  }

  onClearDate(): void {
    this.selectedDate = null;
    this.toursService.updateTourDate(null);
  }
} 