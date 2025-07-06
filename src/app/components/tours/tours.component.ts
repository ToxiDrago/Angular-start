import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToursService } from '../../shared/services/tours.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Tour } from '../../shared/models/tour.interface';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tours.component.html',
  styleUrls: ['./tours.component.scss']
})
export class ToursComponent implements OnInit, OnDestroy {
  tours$ = this.toursService.tours$;
  filteredTours: Tour[] = [];
  loading = false;
  error = false;
  
  searchTerm = '';
  selectedType = '';
  selectedOperator = '';
  sortBy = '';
  
  currentPage = 1;
  pageSize = 10;
  totalTours = 0;
  filteredCount = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private toursService: ToursService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTours(): void {
    this.toursService.getTours()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tours) => {
          console.log('Tours loaded successfully:', tours);
          this.tours$ = this.toursService.tours$;
          this.filteredTours = tours;
          this.totalTours = tours.length;
          this.filteredCount = tours.length;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tours:', error);
          this.error = true;
          this.loading = false;
          this.notificationService.showError('Ошибка загрузки туров');
        }
      });
  }

  onSearch(): void {
    this.filterTours();
  }

  filterTours(): void {
    let filtered = this.filteredTours;

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(tour => 
        tour.name.toLowerCase().includes(searchLower) ||
        tour.description.toLowerCase().includes(searchLower)
      );
    }

    if (this.selectedType && this.selectedType !== '') {
      filtered = filtered.filter(tour => tour.type === this.selectedType);
    }

    if (this.selectedOperator) {
      filtered = filtered.filter(tour => {
        const price = tour.price;
        switch (this.selectedOperator) {
          case 'lt':
            return price < 50000;
          case 'gt':
            return price > 100000;
          case 'eq':
            return price >= 50000 && price <= 100000;
          default:
            return true;
        }
      });
    }

    this.filteredTours = filtered;
    this.filteredCount = filtered.length;
    this.currentPage = 1;
  }

  sortTours(): void {
    if (!this.sortBy) return;

    this.filteredTours.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        default:
          return 0;
      }
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedOperator = '';
    this.sortBy = '';
    this.filterTours();
  }

  getTourImage(tour: Tour): string {
    return tour.img || 'assets/images/placeholder.jpg';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder.svg';
  }

  onTourClick(tour: Tour): void {
    this.router.navigate(['/tour', tour.id]);
  }

  trackByTourId(index: number, tour: Tour): number {
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
           this.selectedOperator !== '' || 
           this.sortBy !== '';
  }

  hasResults(): boolean {
    return this.filteredTours.length > 0;
  }

  isImageLoaded(tourId: number): boolean {
    return true;
  }

  formatPrice(price: number): string {
    return typeof price === 'number' && !isNaN(price)
      ? `$${price.toFixed(2)}`
      : 'N/A';
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
    return tour.location || 'Unknown location';
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

  getTourRating(tour: Tour): number {
    return typeof tour.rating === 'number' && !isNaN(tour.rating) ? tour.rating : 0;
  }
}