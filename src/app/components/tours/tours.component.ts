import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToursService, Tour, ToursResponse } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';

interface FilterState {
  searchTerm: string;
  selectedType: string;
  selectedOperator: string;
  sortBy: string;
}

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss']
})
export class ToursComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  loading = false;
  error: string | null = null;
  
  searchTerm = '';
  selectedType = '';
  selectedOperator = '';
  sortBy = '';
  
  tourOperators: string[] = [];
  tourTypes = [
    { value: '', label: 'Все типы' },
    { value: 'single', label: 'Одиночные туры' },
    { value: 'multi', label: 'Групповые туры' }
  ];

  totalTours = 0;
  filteredCount = 0;

  private placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDE4NVYxMzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA=">';
  private imageLoadingStates = new Map<string, boolean>();

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadTours();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTours(): void {
    this.loading = true;
    this.error = null;
    
    this.toursService.getTours().subscribe({
      next: (jsonString: string) => {
        try {
          const toursData: ToursResponse = this.toursService.parseToursData(jsonString);
          
          if (!toursData.tours || !Array.isArray(toursData.tours)) {
            throw new Error('Некорректный формат данных туров');
          }

          this.tours = toursData.tours.map(tour => ({
            ...tour,
            img: this.getValidImageUrl(tour.img)
          }));
          
          this.filteredTours = [...this.tours];
          this.totalTours = this.tours.length;
          this.filteredCount = this.filteredTours.length;
          
          this.tourOperators = this.toursService.getTourOperators(this.tours);
          
          this.notificationService.showSuccess(
            'Туры загружены', 
            `Найдено ${this.tours.length} туров`
          );
          
          this.applyFilters();
          
        } catch (error) {
          console.error('Ошибка обработки данных туров:', error);
          this.error = 'Не удалось обработать данные туров';
          this.notificationService.showError('Ошибка', this.error);
        } finally {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Ошибка загрузки туров:', error);
        this.error = 'Не удалось загрузить туры. Проверьте подключение к сети.';
        this.notificationService.showError('Ошибка сети', this.error);
        this.loading = false;
      }
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  applyFilters(): void {
    if (this.tours.length === 0) return;

    let result = [...this.tours];

    if (this.searchTerm.trim()) {
      result = this.toursService.searchTours(result, this.searchTerm.trim());
    }

    if (this.selectedType) {
      result = this.toursService.filterToursByType(result, this.selectedType);
    }

    if (this.selectedOperator) {
      result = result.filter(tour => 
        tour.tourOperator === this.selectedOperator
      );
    }

    result = this.applySorting(result);

    this.filteredTours = result;
    this.filteredCount = result.length;
  }

  private applySorting(tours: Tour[]): Tour[] {
    switch (this.sortBy) {
      case 'name':
        return tours.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      
      case 'price-asc':
        return this.toursService.sortToursByPrice(tours, true);
      
      case 'price-desc':
        return this.toursService.sortToursByPrice(tours, false);
      
      case 'operator':
        return tours.sort((a, b) => a.tourOperator.localeCompare(b.tourOperator, 'ru'));
      
      case 'date':
        return tours.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      
      default:
        return tours;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedOperator = '';
    this.sortBy = '';
    this.filteredTours = [...this.tours];
    this.filteredCount = this.tours.length;
  }

  getFilterState(): FilterState {
    return {
      searchTerm: this.searchTerm,
      selectedType: this.selectedType,
      selectedOperator: this.selectedOperator,
      sortBy: this.sortBy
    };
  }

  hasActiveFilters(): boolean {
    const state = this.getFilterState();
    return Object.values(state).some(value => value.trim() !== '');
  }

  navigateToTour(tour: Tour): void {
    this.router.navigate(['/tours', tour.id], {
      queryParams: {
        from: 'tours-list',
        ...this.getFilterState()
      }
    });
  }

  refreshTours(): void {
    this.loadTours();
  }

  trackByTourId(index: number, tour: Tour): string {
    return tour.id;
  }

  getTourTypeLabel(type: string): string {
    const typeObj = this.tourTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  formatPrice(price: string): string {
    const numericPrice = price.replace(/[^\d,.-]/g, '');
    return numericPrice || price;
  }

  getValidImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return this.placeholderImage;
    }

    if (imageUrl.startsWith('assets/') || imageUrl.match(/^[^\/]*\.(jpg|jpeg|png|gif|webp)$/i)) {
      return imageUrl;
    }

    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      return this.placeholderImage;
    }
  }

  isValidImageUrl(imageUrl: string): boolean {
    if (!imageUrl || imageUrl.trim() === '') return false;
    
    if (imageUrl === this.placeholderImage) return true;
    
    try {
      if (imageUrl.startsWith('http') || imageUrl.startsWith('https')) {
        new URL(imageUrl);
        return true;
      }
      return imageUrl.includes('.') && /\.(jpg|jpeg|png|gif|webp)$/i.test(imageUrl);
    } catch {
      return false;
    }
  }

  onImageError(event: Event, tourId: string): void {
    const img = event.target as HTMLImageElement;
    
    if (img.src === this.placeholderImage) return;
    
    console.warn(`Failed to load image for tour ${tourId}: ${img.src}`);
    
    img.src = this.placeholderImage;
    img.alt = 'Изображение недоступно';
    
    this.imageLoadingStates.set(tourId, false);
  }

  onImageLoad(tourId: string): void {
    this.imageLoadingStates.set(tourId, true);
  }

  isImageLoaded(tourId: string): boolean {
    return this.imageLoadingStates.get(tourId) ?? false;
  }

  getImageClasses(tourId: string): string {
    const baseClasses = 'tour-image';
    const isLoaded = this.isImageLoaded(tourId);
    return isLoaded ? `${baseClasses} loaded` : `${baseClasses} loading`;
  }

  preloadImage(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  }

  get isLoading(): boolean {
    return this.loading;
  }

  get hasError(): boolean {
    return !!this.error;
  }

  get hasResults(): boolean {
    return this.filteredTours.length > 0;
  }

  get showNoResults(): boolean {
    return !this.loading && !this.error && this.filteredTours.length === 0;
  }
}