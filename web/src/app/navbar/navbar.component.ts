import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { Role } from '../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  roles = Role;
  role = Role.NONE;

  private subscription!: Subscription;

  constructor(private authService: AuthService) { }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.subscription = this.authService.getUserRole().subscribe(role => {
      this.role = role;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
