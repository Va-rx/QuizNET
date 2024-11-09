import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {TestHistory} from "../../models/test-history.model";
import {Results} from "../../models/user-results.model";

const baseUrl = 'http://72.145.1.108:8080/api/user-results';
@Injectable({
  providedIn: 'root'
})
export class UserResultsService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  userId = this.authService.getUserId()

  create(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }

  get(testId: number, userId: number): Observable<TestHistory> {
    return this.http.get<TestHistory>(`${baseUrl}/${testId}/${userId}`);
  }

  getAll(testId: number): Observable<Results[]>{
    return this.http.get<Results[]>(`${baseUrl}/${testId}`);
  }
}
