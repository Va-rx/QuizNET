import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Role, User} from "../../models/user.model";
import {TokenStorageService} from "../token-storage/token-storage.service";


const baseUrl = 'http://localhost:8080/api/users';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User | null = null;
  private userRole = new BehaviorSubject<number>(Role.NONE);

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) { }

  saveUser(user: User): void{
    this.tokenStorage.saveUser(user);
    this.user = user;
  }
  register(data: any): Observable<any> {
    return this.http.post(`${baseUrl}/register`, data);
  }

  login(data: any): Observable<any>{

    return this.http.post(`${baseUrl}/login`, data);
  }

  public isUserLoggedIn(): boolean{
    this.user = this.tokenStorage.getUser();
    return this.user !== null;
  }

  public getUserRole(): BehaviorSubject<number>{
    if (!this.isUserLoggedIn()){
      this.userRole.next(Role.NONE);
    }
    else if (this.user != undefined) {
      this.userRole.next(this.user.role);
    }
    else {
      this.userRole.next(Role.NONE);
    }
    return this.userRole;
  }

  public logout(): void{
    this.tokenStorage.signOut();
    this.user = null;
    this.userRole.next(Role.NONE);
  }

  public getNickname(): string{
    if (this.user != undefined){
      return this.user.nickname;
    }
    return '';
  }

  public getUserId(): number {
    return this.user?.id ?? -1
  }

}
