import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showSuccess(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary: message,
      detail: detail
    });
  }

  showError(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: message,
      detail: detail
    });
  }

  showInfo(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: message,
      detail: detail
    });
  }

  showWarn(message: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: message,
      detail: detail
    });
  }
}