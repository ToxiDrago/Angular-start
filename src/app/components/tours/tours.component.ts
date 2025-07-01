import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToursService, Tour, ToursResponse } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ImageService } from '../../shared/services/image.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService,
    private imageService: ImageService,
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
            img: this.processImageUrl(tour.img)
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

  processImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return this.imageService.getPlaceholder('landscape');
    }
    
    // If it's just a filename, prepend assets path
    if (!imageUrl.includes('/') && imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `assets/images/${imageUrl}`;
    }
    
    return this.imageService.processImageUrl(imageUrl);
  }

  onImageError(event: Event, tourId: string): void {
    const img = event.target as HTMLImageElement;
    const fallbackUrl = this.imageService.getFallbackUrl(img.src);
    
    if (img.src !== fallbackUrl) {
      console.warn(`Failed to load image for tour ${tourId}: ${img.src}`);
      img.src = fallbackUrl;
      img.alt = 'Изображение недоступно';
    }
  }

  onImageLoad(tourId: string): void {
    // Image loaded successfully
  }

  isImageLoaded(tourId: string): boolean {
    const tour = this.tours.find(t => t.id === tourId);
    return tour ? this.imageService.isImageLoaded(tour.img) : false;
  }

  getImageClasses(tourId: string): string {
    return 'tour-image';
  }

  // ... rest of your existing methods remain the same
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

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== '' || 
           this.selectedType !== '' || 
           this.selectedOperator !== '' || 
           this.sortBy !== '';
  }

  navigateToTour(tour: Tour): void {
    this.router.navigate(['/tours', tour.id]);
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
    return price.replace(/[^\d,.-€]/g, '') || price;
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