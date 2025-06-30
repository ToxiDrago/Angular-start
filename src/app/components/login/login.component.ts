import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login: string = '';
  password: string = '';

  get isFormValid(): boolean {
    return this.login.length > 0 && this.password.length > 0;
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