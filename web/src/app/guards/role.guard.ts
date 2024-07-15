import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth/auth.service";
import {Role} from "../models/user.model";

export const RoleGuard: CanActivateFn = (route, state) => {
  const role = inject(AuthService).getUserRole().getValue();
  return role == Role.ADMIN;
};
