import { Component } from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {Role, User} from "../../models/user.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: User = {
    nickname: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    role: Role.USER
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(): void {
    this.authService.register(this.form).subscribe({
      next: data => {
        this.router.navigate(['/login'])
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}
