import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  tickets: Ticket[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    this.loadTickets();
  }

  loadTickets(): void {
    this.tickets = [
      {
        id: 1,
        title: 'Проблема с авторизацией',
        description: 'Не могу войти в систему',
        status: 'open',
        priority: 'high',
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        title: 'Ошибка при загрузке данных',
        description: 'Данные не отображаются в таблице',
        status: 'in-progress',
        priority: 'medium',
        createdAt: new Date('2024-01-14')
      },
      {
        id: 3,
        title: 'Медленная работа приложения',
        description: 'Приложение долго загружается',
        status: 'closed',
        priority: 'low',
        createdAt: new Date('2024-01-13')
      }
    ];
  }

  viewTicket(ticket: Ticket): void {
    this.notificationService.showInfo(
      'Просмотр тикета',
      `Открытие тикета #${ticket.id}: ${ticket.title}`
    );
  }

  editTicket(ticket: Ticket): void {
    this.notificationService.showInfo(
      'Редактирование тикета',
      `Редактирование тикета #${ticket.id}: ${ticket.title}`
    );
  }

  createTicket(): void {
    this.notificationService.showSuccess(
      'Создание тикета',
      'Переход к форме создания нового тикета'
    );
  }

  logout(): void {
    this.authService.logout();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-progress';
      case 'closed': return 'status-closed';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  }
}