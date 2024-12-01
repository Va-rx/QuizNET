import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  private navbarVisibility = new BehaviorSubject<boolean>(true); //Domyślnie widoczne 
  navbarVisibility$ = this.navbarVisibility.asObservable();

  showNavbar() {
    this.navbarVisibility.next(true);
  }

  hideNavbar() {
    this.navbarVisibility.next(false);
  }
}
