import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  get isFormValid(): boolean {
    return this.login.trim().length > 0 && this.password.trim().length > 0;
  }

  onSubmit(): void {
    if (this.isFormValid && !this.isLoading) {
      this.isLoading = true;
      
      const loginData = {
        login: this.login.trim(),
        password: this.password.trim()
      };

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.authService.setCurrentUser(response);
          this.notificationService.showSuccess('Успешная авторизация', `Добро пожаловать, ${response.login}!`);
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Ошибка авторизации:', error);
          let errorMessage = 'Неверный логин или пароль';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          this.notificationService.showError('Ошибка авторизации', errorMessage);
          this.isLoading = false;
        }
      });
    }
  }
}