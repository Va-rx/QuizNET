import {Component, OnDestroy, OnInit} from '@angular/core';
import {Role} from "./models/user.model";
import {AuthService} from "./services/auth/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, OnInit{
  title = 'web';
  roles = Role;
  role = Role.NONE;

  private subscription!: Subscription;

  constructor(private authService: AuthService) { }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.subscription = this.authService.getUserRole().subscribe(role => {
      this.role = role;
    });
  }
}
