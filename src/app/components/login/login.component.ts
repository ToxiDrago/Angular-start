import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  get isFormValid(): boolean {
    return this.login.trim().length > 0 && this.password.trim().length > 0;
  }

  onSubmit() {
    if (this.isFormValid) {
      console.log('Авторизация:', {
        login: this.login,
        password: this.password
      });
    }
  }
}
