import { Component } from '@angular/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword && this.password.length > 0;
  }

  get isFormValid(): boolean {
    return this.email.length > 0 && 
           this.password.length > 0 && 
           this.confirmPassword.length > 0 && 
           this.passwordsMatch;
  }

  onSubmit() {
    if (this.isFormValid) {
      console.log('Регистрация:', {
        email: this.email,
        password: this.password
      });
    }
  }
}