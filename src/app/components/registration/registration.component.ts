import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  login: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword && this.password.length > 0;
  }

  get isFormValid(): boolean {
    return this.login.trim().length > 0 &&
           this.email.trim().length > 0 && 
           this.password.trim().length > 0 && 
           this.confirmPassword.trim().length > 0 && 
           this.passwordsMatch;
  }

  onSubmit(): void {
    if (this.isFormValid && !this.isLoading) {
      this.isLoading = true;
      
      const registrationData = {
        login: this.login.trim(),
        email: this.email.trim(),
        password: this.password.trim()
      };

      this.authService.register(registrationData).subscribe({
        next: (response) => {
          this.notificationService.showSuccess('Успешная регистрация', 'Теперь вы можете войти в систему');
          this.router.navigate(['/login']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Ошибка регистрации:', error);
          this.notificationService.showError('Ошибка регистрации', 'Пользователь с таким логином уже существует');
          this.isLoading = false;
        }
      });
    }
  }
}