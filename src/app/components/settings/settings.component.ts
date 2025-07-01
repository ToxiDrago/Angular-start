import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MenuItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  menuItems: MenuItem[] = [
    {
      id: 'change-password',
      label: 'Смена пароля',
      route: '/settings/change-password',
      icon: 'pi pi-key',
      description: 'Изменить пароль для входа в систему'
    },
    {
      id: 'statistics',
      label: 'Статистика',
      route: '/settings/statistics',
      icon: 'pi pi-chart-bar',
      description: 'Просмотр статистики использования'
    }
  ];

  onMenuItemClick(item: MenuItem): void {
    console.log('🖱️ Menu item clicked:', item.label);
  }
}