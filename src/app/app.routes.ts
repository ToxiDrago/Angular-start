import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { ToursComponent } from './components/tours/tours.component';
import { TourItemComponent } from './components/tour-item/tour-item.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ChangePasswordComponent } from './components/settings/change-password/change-password.component';
import { AuthGuard } from './guards/auth.guard';
import { NearestToursComponent } from './components/nearest-tours/nearest-tours.component';
import { BasketComponent } from './components/basket/basket.component';
import { OrderComponent } from './components/order/order.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'nearest-tours', component: NearestToursComponent, canActivate: [AuthGuard] },
  { path: 'tickets', component: TicketsComponent, canActivate: [AuthGuard] },
  { path: 'tours', component: ToursComponent },
  { path: 'tours/:id', component: TourItemComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'settings/change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'basket', component: BasketComponent },
  { path: 'order', component: OrderComponent },
  { path: '', redirectTo: '/tours', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];