import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin, of } from 'rxjs';
import { ToursService } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Tour } from '../../shared/models/tour.interface';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
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
    DropdownModule,
    CalendarModule,
    CardModule,
    InputTextModule,
    SliderModule,
    ButtonModule,
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
  selectedType: string = '';
  selectedDate: Date | null = null;
  searchTerm: string = '';
  minPrice: number = 0;
  maxPrice: number = 10000;
  priceRange: [number, number] = [0, 10000];
  
  // Добавляем недостающие свойства
  loading = false;
  error: string | null = null;
  isAdmin = false;

  tourTypeOptions = [
    { label: 'Все типы', value: '' },
    { label: 'Одиночный', value: 'single' },
    { label: 'Групповой', value: 'group' }
  ];

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

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private authService: AuthService,
    private basketStore: BasketStoreService
  ) {}

  ngOnInit(): void {
    this.loadTours();
    this.loadCountries();
    this.resetFilters();
    // Определяем, админ ли пользователь (например, по логину)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user?.login === 'admin';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTours(): void {
    this.loading = true;
    this.error = null;
    
    this.toursService.getTours().subscribe({
      next: (tours: Tour[]) => {
        this.allTours = tours;
        const prices = tours.map(t => this.formatPrice(t.price));
        this.minPrice = Math.min(...prices);
        this.maxPrice = Math.max(...prices);
        this.priceRange = [this.minPrice, this.maxPrice];
        this.resetFilters();
        this.totalTours = tours.length;
        this.filteredCount = tours.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки туров:', err);
        this.error = 'Ошибка загрузки туров';
        this.loading = false;
        this.notificationService.showError('Ошибка загрузки туров');
      }
    });
  }

  applyFilters(): void {
    this.filteredTours = this.allTours.filter(tour => {
      const matchesType = this.selectedType ? tour.type === this.selectedType : true;
      const matchesDate = this.selectedDate
        ? (tour.date && tour.date.slice(0, 10) === this.selectedDate?.toISOString().slice(0, 10))
        : true;
      const matchesName = this.searchTerm
        ? tour.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      const price = this.formatPrice(tour.price);
      const matchesPrice = price >= this.priceRange[0] && price <= this.priceRange[1];
      return matchesType && matchesDate && matchesName && matchesPrice;
    });
  }

  resetFilters(): void {
    this.selectedType = '';
    this.selectedDate = null;
    this.searchTerm = '';
    this.priceRange = [this.minPrice, this.maxPrice];
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
    return this.searchTerm.trim() !== '' || 
           this.selectedType !== '' || 
           this.selectedDate !== null ||
           this.priceRange[0] !== this.minPrice ||
           this.priceRange[1] !== this.maxPrice;
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
}