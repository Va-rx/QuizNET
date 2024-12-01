import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from '../../models/user.model';
import { Router, NavigationEnd } from '@angular/router';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  roles = Role;
  role = Role.NONE;
  showNavbar = true;


  private subscription!: Subscription;

  constructor(private authService: AuthService, private router: Router, private translate: TranslateService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showNavbar = !['/tank-game'].includes(event.urlAfterRedirects);
      }
    });
  }

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

  getCurrentLang(): string {
    return this.translate.currentLang;
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
  }

}
