import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConfigService } from './config.service';

export interface User {
  login: string;
  password: string;
  email?: string;
}

export interface AuthResponse {
  login: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private configService = inject(ConfigService);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private get apiUrl(): string {
    return this.configService.get('apiUrl');
  }
  
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // 1.2 Проверяем пользователя в SessionStorage при инициализации
    this.initializeUser();
  }

  /**
   * 1.2 Инициализация пользователя из SessionStorage
   */
  private initializeUser(): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser) as AuthResponse;
          this.currentUserSubject.next(user);
          console.log('👤 User loaded from SessionStorage:', user.login);
        }
      } catch (error) {
        console.error('❌ Error parsing user from SessionStorage:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
  }

  login(loginData: { login: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth`, loginData);
  }

  register(userData: { login: string; password: string; email: string }): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, userData);
  }

  /**
   * 1.1 Сохранение пользователя в SessionStorage после успешной авторизации
   */
  setCurrentUser(user: AuthResponse): void {
    if (typeof sessionStorage !== 'undefined') {
      try {
        const userJson = JSON.stringify(user);
        sessionStorage.setItem('currentUser', userJson);
        console.log('💾 User saved to SessionStorage:', user.login);
      } catch (error) {
        console.error('❌ Error saving user to SessionStorage:', error);
      }
    }
    this.currentUserSubject.next(user);
  }

  /**
   * 1.2 Получение пользователя с проверкой SessionStorage
   */
  getCurrentUser(): AuthResponse | null {
    // Сначала проверяем текущее состояние
    let currentUser = this.currentUserSubject.value;
    
    // Если пользователя нет в состоянии, проверяем SessionStorage
    if (!currentUser && typeof sessionStorage !== 'undefined') {
      try {
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
          currentUser = JSON.parse(savedUser) as AuthResponse;
          this.currentUserSubject.next(currentUser);
          console.log('🔄 User restored from SessionStorage:', currentUser.login);
        }
      } catch (error) {
        console.error('❌ Error parsing user from SessionStorage:', error);
        sessionStorage.removeItem('currentUser');
      }
    }
    
    return currentUser;
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('currentUser');
      console.log('🚪 User removed from SessionStorage');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    // Проверяем текущее состояние и SessionStorage
    const user = this.getCurrentUser();
    return user !== null;
  }

  /**
   * Дополнительный метод для очистки всех данных пользователя
   */
  clearUserData(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  /**
   * Проверка валидности сессии
   */
  isSessionValid(): boolean {
    if (typeof sessionStorage === 'undefined') {
      return false;
    }

    try {
      const savedUser = sessionStorage.getItem('currentUser');
      if (!savedUser) {
        return false;
      }

      const user = JSON.parse(savedUser) as AuthResponse;
      return !!(user.login);
    } catch (error) {
      console.error('❌ Invalid session data:', error);
      this.clearUserData();
      return false;
    }
  }
}