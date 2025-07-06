import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TourItemComponent } from '../tour-item/tour-item.component';
import { Tour } from '../../shared/models/tour.interface';
import { ToursService } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-nearest-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, TourItemComponent],
  templateUrl: './nearest-tours.component.html',
  styleUrls: ['./nearest-tours.component.scss']
})
export class NearestToursComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput', { static: true }) searchInput!: ElementRef<HTMLInputElement>;
  
  tours$!: Observable<Tour[]>;
  filteredTours$!: Observable<Tour[]>;
  private destroy$ = new Subject<void>();

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Получаем все туры
    this.tours$ = this.toursService.getTours();

    // Создаем поток для поискового запроса
    const searchQuery$ = new Subject<string>();

    // Создаем отфильтрованные туры
    this.filteredTours$ = combineLatest([
      this.tours$,
      searchQuery$.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged()
      )
    ]).pipe(
      map(([tours, query]) => {
        if (!query.trim()) {
          return tours;
        }
        return tours.filter(tour => 
          tour.name.toLowerCase().includes(query.toLowerCase()) ||
          tour.description.toLowerCase().includes(query.toLowerCase())
        );
      })
    );

    // Подписываемся на изменения в поле поиска
    this.searchInput.nativeElement.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      searchQuery$.next(target.value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTourSelect(tour: Tour): void {
    this.notificationService.showInfo('Тур выбран', `Выбран тур: ${tour.name}`);
  }
}