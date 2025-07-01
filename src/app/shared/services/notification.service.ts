import { Injectable } from '@angular/core';
import { ToastService } from '../../components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private toastService: ToastService) {}

  showSuccess(message: string, detail?: string): void {
    this.toastService.showSuccess(message, detail);
  }

  showError(message: string, detail?: string): void {
    this.toastService.showError(message, detail);
  }

  showInfo(message: string, detail?: string): void {
    this.toastService.showInfo(message, detail);
  }

  showWarn(message: string, detail?: string): void {
    this.toastService.showWarn(message, detail);
  }
}