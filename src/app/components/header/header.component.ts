import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../shared/services/auth.service';
import { ConfigService } from '../../shared/services/config.service';
import { BasketStoreService } from '../../shared/services/basket-store.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private configService = inject(ConfigService);
  private basketStore = inject(BasketStoreService);

  currentUser: AuthResponse | null = null;
  currentDate = new Date();
  appTitle = '';
  appVersion = '';
  basketCount = 0;
  userEmail = 'toxic2305@gmail.com'; // или получайте из AuthService

  ngOnInit(): void {
    // Get app title from config
    this.appTitle = this.configService.get('appTitle');
    this.appVersion = this.configService.get('version');

    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.basketStore.basket$.subscribe((basket) => {
      this.basketCount = basket.length;
    });

    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  logout(): void {
    this.authService.logout();
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/registration';
  }

  isActivePage(route: string): boolean {
    return this.router.url === route;
  }

  getAppInfo(): string {
    return `${this.appTitle} v${this.appVersion}`;
  }
}
