import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-boundary" *ngIf="hasError">
      <div class="error-content">
        <i class="pi pi-exclamation-triangle"></i>
        <h3>Что-то пошло не так</h3>
        <p>{{ errorMessage }}</p>
        <button class="btn btn-primary" (click)="retry()">
          Попробовать снова
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-boundary {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      padding: 2rem;
    }
    
    .error-content {
      text-align: center;
      max-width: 400px;
    }
    
    .error-content i {
      font-size: 3rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }
  `]
})
export class ErrorBoundaryComponent {
  @Input() hasError = false;
  @Input() errorMessage = 'Произошла неожиданная ошибка';
  
  retry(): void {
    window.location.reload();
  }
}