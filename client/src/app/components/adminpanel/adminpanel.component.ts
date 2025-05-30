import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.scss']
})
export class AdminPanelComponent {
  sections = [
    { label: 'Управлять таблицей семейств', path: '/adminpanel/family' },
    { label: 'Управлять таблицей родов', path: '/adminpanel/genus' },
    { label: 'Управлять таблицей видов', path: '/adminpanel/specie' },
    { label: 'Управлять таблицей мест сбора', path: '/adminpanel/place' },

  ];
}
