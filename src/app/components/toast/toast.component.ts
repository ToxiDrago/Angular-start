import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'error' | 'info' | 'warn';
  summary: string;
  detail?: string;
  life?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  showSuccess(summary: string, detail?: string): void {
    this.addMessage({ severity: 'success', summary, detail });
  }

  showError(summary: string, detail?: string): void {
    this.addMessage({ severity: 'error', summary, detail, life: 7000 });
  }

  showInfo(summary: string, detail?: string): void {
    this.addMessage({ severity: 'info', summary, detail });
  }

  showWarn(summary: string, detail?: string): void {
    this.addMessage({ severity: 'warn', summary, detail });
  }

  private addMessage(message: Omit<ToastMessage, 'id'>): void {
    const id = Math.random().toString(36).substr(2, 9);
    const newMessage: ToastMessage = {
      ...message,
      id,
      life: message.life || 5000
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, newMessage]);

    // Auto remove after specified time
    setTimeout(() => {
      this.removeMessage(id);
    }, newMessage.life);
  }

  removeMessage(id: string): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next(currentMessages.filter(msg => msg.id !== id));
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let message of messages; trackBy: trackByFn"
        class="toast-message"
        [ngClass]="'toast-' + message.severity"
      >
        <div class="toast-icon">
          <span [innerHTML]="getIconHtml(message.severity)"></span>
        </div>
        <div class="toast-content">
          <div class="toast-summary">{{ message.summary }}</div>
          <div *ngIf="message.detail" class="toast-detail">{{ message.detail }}</div>
        </div>
        <button class="toast-close" (click)="removeMessage(message.id)" type="button">
          <span>&times;</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .toast-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      min-width: 300px;
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(21, 128, 61, 0.95) 100%);
      color: white;
      border-color: rgba(34, 197, 94, 0.3);
    }

    .toast-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%);
      color: white;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .toast-info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(29, 78, 216, 0.95) 100%);
      color: white;
      border-color: rgba(59, 130, 246, 0.3);
    }

    .toast-warn {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%);
      color: white;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .toast-icon {
      font-size: 20px;
      margin-top: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
    }

    .toast-content {
      flex: 1;
    }

    .toast-summary {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .toast-detail {
      font-size: 13px;
      opacity: 0.9;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s;
      line-height: 1;
    }

    .toast-close:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
      
      .toast-message {
        min-width: auto;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  messages: ToastMessage[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.messages$.subscribe(messages => {
      this.messages = messages;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeMessage(id: string) {
    this.toastService.removeMessage(id);
  }

  getIconHtml(severity: string): string {
    switch (severity) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      case 'warn': return '⚠';
      default: return 'ℹ';
    }
  }

  trackByFn(index: number, item: ToastMessage): string {
    return item.id;
  }
}