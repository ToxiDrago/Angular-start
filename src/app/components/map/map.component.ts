import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  template: `
    <div class="map-container">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./map.component.scss']
})
export class MapComponent {} 