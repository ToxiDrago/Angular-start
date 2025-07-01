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
    // Проверяем наличие localStorage (может отсутствовать в SSR)
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  login(loginData: { login: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth`, loginData);
  }

  register(userData: { login: string; password: string; email: string }): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, userData);
  }

  setCurrentUser(user: AuthResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }
}