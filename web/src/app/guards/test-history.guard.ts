import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "../services/auth/auth.service";
import {Role} from "../models/user.model";

export const TestHistoryGuard: CanActivateFn = (route, state) => {
  const role = inject(AuthService).getUserRole().getValue();
  const userId = inject(AuthService).getUserId();
  return role == Role.ADMIN || userId == route.params['userId'];
};
