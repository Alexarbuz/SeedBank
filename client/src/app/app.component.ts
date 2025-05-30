import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  showDropdown = false;

  constructor(public auth: AuthService, public router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    this.showDropdown = false;
  }

  authIsLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
   goToAdminPanel() {
    this.router.navigate(['/adminpanel']);
  }
  isAdmin(): boolean {
    return this.auth.getUserRole() === 'ADMIN';
  }
}
