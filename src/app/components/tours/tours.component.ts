import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { ToursService } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Tour } from '../../shared/models/tour.interface';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { Country } from '../../shared/services/tours.service';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { NgIf, NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../shared/services/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BasketStoreService } from '../../shared/services/basket-store.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    CardModule,
    InputTextModule,
    SliderModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    NgIf,
    NgFor,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService],
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss']
})
export class ToursComponent implements OnInit, OnDestroy {
  allTours: Tour[] = [];
  filteredTours: Tour[] = [];
  tourTypes: { label: string, value: string }[] = [];
  minPrice = 680;
  maxPrice = 3579;
  loading: boolean = false;
  error: boolean = false;
  isAdmin = false;

  typeOptions = [
    { label: 'Все типы', value: null },
    { label: 'Групповой', value: 'group' },
    { label: 'Индивидуальный', value: 'single' }
  ];

  // Реактивные формы для фильтров
  typeControl = new FormControl(null);
  dateControl = new FormControl('');
  searchControl = new FormControl('');
  priceRangeControl = new FormControl([this.minPrice, this.maxPrice]);
  showOnlyBasketControl = new FormControl(false);

  currentPage = 1;
  pageSize = 10;
  totalTours = 0;
  filteredCount = 0;
  private destroy$ = new Subject<void>();

  // Для модального окна
  selectedTour: Tour | null = null;
  selectedCountry: Country | null = null;
  selectedWeather: any = null;
  displayDialog = false;

  countries: Country[] = [];

  // Сопоставление locationId → iso_code2
  private locationIdToCountryCode: { [key: string]: string } = {
    '1fe323': 'MX',      // Mexico
    '1fe2fg233': 'IT',   // Italia
    // ... остальные id и коды стран
  };

  private priceSliderTouched = false;

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private authService: AuthService,
    private basketStore: BasketStoreService
  ) {
    this.basketStore.basket$.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadTours();
    this.loadCountries();
    this.resetFilters();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user?.login === 'admin';

    this.typeControl.valueChanges.subscribe(() => this.applyFilters());
    this.dateControl.valueChanges.subscribe(() => this.applyFilters());
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.priceRangeControl.valueChanges.subscribe(() => {
      this.priceSliderTouched = true;
      this.applyFilters();
    });
    this.showOnlyBasketControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTours(): void {
    this.loading = true;
    this.error = false;
    this.toursService.getTours().subscribe({
      next: (data: any) => {
        this.allTours = Array.isArray(data) ? data : data.tours;
        this.filteredTours = [...this.allTours];
        const prices = this.allTours.map(t => this.formatPrice(t.price));
        this.minPrice = Math.min(...prices);
        this.maxPrice = Math.max(...prices);
        this.priceRangeControl.setValue([this.minPrice, this.maxPrice]);
        this.resetFilters();
        this.totalTours = this.allTours.length;
        this.filteredCount = this.allTours.length;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const selectedType = this.typeControl.value;
    const selectedDate = this.dateControl.value;
    const searchTerm = this.searchControl.value;
    const priceRange = this.priceRangeControl.value;
    const showOnlyBasket = this.showOnlyBasketControl.value;
    this.filteredTours = this.allTours.filter(tour => {
      const price = parseInt(tour.price.replace(/[^\d]/g, ''), 10);
      const inBasket = this.isInBasket(tour);
      const priceFilter = this.priceSliderTouched
        ? (Array.isArray(priceRange) && priceRange.length === 2 && price >= priceRange[0] && price <= priceRange[1])
        : true;
      return (
        (!selectedType || tour.type === selectedType) &&
        (!selectedDate || tour.date.startsWith(selectedDate)) &&
        (!searchTerm || tour.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        priceFilter &&
        (!showOnlyBasket || inBasket)
      );
    });
  }

  resetFilters(): void {
    this.typeControl.setValue(null);
    this.dateControl.setValue('');
    this.searchControl.setValue('');
    this.priceRangeControl.setValue([this.minPrice, this.maxPrice]);
    this.showOnlyBasketControl.setValue(false);
    this.priceSliderTouched = false;
    this.applyFilters();
  }

  getTourImage(tour: Tour): string {
    return tour.img || 'assets/images/placeholder.jpg';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.jpg';
  }

  trackByTourId(index: number, tour: Tour): string {
    return tour.id;
  }

  get paginatedTours(): Tour[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredTours.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTours.length / this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  showNoResults(): boolean {
    return !this.loading && !this.error && this.filteredTours.length === 0;
  }

  hasActiveFilters(): boolean {
    const priceRange = this.priceRangeControl.value;
    return (this.searchControl.value?.trim() !== '' || 
      this.typeControl.value !== null || 
      this.dateControl.value !== '' ||
      this.showOnlyBasketControl.value === true ||
      (Array.isArray(priceRange) && (
        priceRange[0] !== this.minPrice ||
        priceRange[1] !== this.maxPrice
      )));
  }

  hasResults(): boolean {
    return this.filteredTours.length > 0;
  }

  isImageLoaded(tourId: number): boolean {
    return true;
  }

  formatPrice(price: string): number {
    if (!price) return 0;
    const normalized = price.replace(/[^\d]/g, '');
    return Number(normalized);
  }

  getCurrencySymbol(price: string): string {
    if (!price) return '';
    const match = price.match(/[^\d\s,\.]+/);
    return match ? match[0] : '';
  }

  getTourTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'beach': 'Пляжный отдых',
      'mountain': 'Горный туризм',
      'city': 'Городские туры',
      'adventure': 'Приключения'
    };
    return typeLabels[type] || type;
  }

  refreshTours(): void {
    this.loadTours();
  }

  getTourLocation(tour: Tour): string {
    return tour.locationId || 'Unknown location';
  }

  getTourType(tour: Tour): string {
    return tour.type || 'unknown';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'N/A'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
  }

  confirmDeleteTour(tour: Tour) {
    this.confirmationService.confirm({
      message: `Удалить тур "${tour.name}"?`,
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Да',
      rejectLabel: 'Нет',
      accept: () => this.deleteTour(tour.id),
    });
  }

  deleteTour(id: string) {
    this.toursService.deleteTour(id).subscribe({
      next: (tours) => {
        this.allTours = tours;
        this.applyFilters();
      },
      error: (err) => {
        // обработка ошибки
      }
    });
  }

  openTourDialog(tour: Tour) {
    this.selectedTour = tour;
    this.displayDialog = true;
  }

  addToBasket(tour: Tour) {
    this.basketStore.addToBasket(tour);
    this.displayDialog = false;
  }

  getCountryByLocationId(locationId: string): any | undefined {
    const code = this.locationIdToCountryCode[locationId];
    if (!code) return undefined;
    return this.countries.find(
      c => c.iso_code2 === code || c.iso_code3 === code
    );
  }

  getCountryByTourName(tourName: string): any | undefined {
    if (!tourName) return undefined;
    // Сравниваем без учёта регистра и пробелов
    return this.countries.find(
      c => c.name_ru && tourName.trim().toLowerCase() === c.name_ru.trim().toLowerCase()
    );
  }

  loadCountries() {
    this.toursService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        // Fallback to mock data if API fails
        this.toursService.getMockCountries().subscribe({
          next: (mockCountries) => {
            this.countries = mockCountries;
          }
        });
      }
    });
  }

  getCountryInfo(countryName: string): Country | null {
    return this.countries.find(c => c.name_ru === countryName) || null;
  }

  isInBasket(tour: Tour): boolean {
    return this.basketStore.basket.some((t: Tour) => t.id === tour.id);
  }
}