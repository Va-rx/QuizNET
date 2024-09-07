import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Question} from "../../models/question.model";
import {AuthService} from "../auth/auth.service";

const baseUrl = 'http://localhost:8080/api/user-results';
@Injectable({
  providedIn: 'root'
})
export class UserResultsService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  userId = this.authService.getUserId()

  create(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  get(id: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${baseUrl}/${id}/${this.userId}`);
  }

}
