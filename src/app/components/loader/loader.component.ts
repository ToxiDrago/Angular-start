import { Component } from '@angular/core';
import { LoaderService } from '../../shared/services/loader.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgIf, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [ProgressSpinnerModule, NgIf, AsyncPipe],
  template: `
    <div class="loader-backdrop" *ngIf="loaderService.loading$ | async">
      <p-progressSpinner styleClass="custom-loader"></p-progressSpinner>
    </div>
  `,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
} 